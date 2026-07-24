-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.articles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  title_en text,
  content_en text,
  title_ar text,
  content_ar text,
  image_path text NOT NULL,
  is_published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  external_url text,
  slug text NOT NULL UNIQUE,
  CONSTRAINT articles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.videos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  title text NOT NULL,
  description text,
  video_path text NOT NULL,
  thumbnail_path text NOT NULL,
  is_published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  title_en text,
  description_en text,
  title_ar text,
  description_ar text,
  external_url text,
  CONSTRAINT videos_pkey PRIMARY KEY (id)
);