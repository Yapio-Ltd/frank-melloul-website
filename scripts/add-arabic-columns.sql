-- Add Arabic localization columns for articles and videos
-- Run in Supabase SQL Editor for project rhucqyogszkxrngnouyv

ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS title_ar text,
  ADD COLUMN IF NOT EXISTS content_ar text;

ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS title_ar text,
  ADD COLUMN IF NOT EXISTS description_ar text;
