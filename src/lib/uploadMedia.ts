export type UploadFolder = "articles" | "thumbnails";

export async function uploadMedia(
  folder: UploadFolder,
  entityId: string,
  file: File,
  accessToken: string
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  formData.append("entityId", entityId);

  const response = await fetch("/api/upload-media", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });

  const payload = (await response.json()) as { path?: string; error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? "Échec de l'upload");
  }

  if (!payload.path) {
    throw new Error("Réponse upload invalide");
  }

  return payload.path;
}
