import { NextRequest, NextResponse } from "next/server";

interface TranslateRequest {
  title: string;
  description: string;
  /** Optional HTML body (articles). */
  content?: string;
}

interface TranslateResult {
  titleFr: string;
  titleEn: string;
  titleAr: string;
  descriptionFr: string;
  descriptionEn: string;
  descriptionAr: string;
  contentFr?: string;
  contentEn?: string;
  contentAr?: string;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY non configurée sur le serveur" },
      { status: 500 }
    );
  }

  let body: TranslateRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  const { title = "", description = "", content = "" } = body;

  if (!title.trim() && !description.trim() && !content.trim()) {
    return NextResponse.json(
      { error: "title, description ou content requis" },
      { status: 400 }
    );
  }

  const hasContent = Boolean(content.trim());

  const prompt = `You are a professional translator. I will give you a title and/or description${hasContent ? " and/or HTML content" : ""} extracted from a web page or CMS.

Your tasks:
1. Detect the language of the provided text.
2. Produce high-quality translations in French, English, and Arabic (Modern Standard Arabic).
3. If the text is already in one of those languages, keep that version faithful and translate the others.
4. Keep translations concise and natural. Do not add extra commentary.
${hasContent ? "5. For HTML content: preserve the HTML structure and tags; only translate visible text nodes. Keep tags like <p>, <em>, <strong>, <br>, <ul>, <ol>, <li>, <a> intact." : ""}

Input:
Title: ${title || "(none)"}
Description: ${description || "(none)"}
${hasContent ? `Content HTML:\n${content}\n` : ""}

Respond ONLY with a valid JSON object in this exact format (no markdown, no explanation):
{
  "titleFr": "...",
  "titleEn": "...",
  "titleAr": "...",
  "descriptionFr": "...",
  "descriptionEn": "...",
  "descriptionAr": "..."${hasContent ? ',\n  "contentFr": "...",\n  "contentEn": "...",\n  "contentAr": "..."' : ""}
}

Rules:
- If title is empty, set titleFr, titleEn and titleAr to "".
- If description is empty, set descriptionFr, descriptionEn and descriptionAr to "".
${hasContent ? '- If content is empty, set contentFr, contentEn and contentAr to "".' : ""}
- Never add content that wasn't in the original text.`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: hasContent ? 4096 : 1024,
      }),
      signal: AbortSignal.timeout(hasContent ? 60000 : 20000),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: `OpenAI error ${res.status}: ${err}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? "";

    // Strip potential markdown code fences
    const jsonStr = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

    let result: TranslateResult;
    try {
      result = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        { error: `Réponse OpenAI non parseable: ${raw}` },
        { status: 502 }
      );
    }

    // Normalize missing AR fields for older model quirks
    result.titleAr = result.titleAr ?? "";
    result.descriptionAr = result.descriptionAr ?? "";
    if (hasContent) {
      result.contentAr = result.contentAr ?? "";
      result.contentEn = result.contentEn ?? "";
      result.contentFr = result.contentFr ?? "";
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur inconnue" },
      { status: 500 }
    );
  }
}
