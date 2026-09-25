-- Optional aggregate counter. Run with the Supabase project owner only after review.
-- Provision a token hash separately, then configure BOOK_COUNTER_TOKEN and
-- BOOK_COUNTER_ENABLED=true on the server. No service-role credential is needed.
-- Re-running this migration does not erase or reset existing counts.
BEGIN;

CREATE TABLE IF NOT EXISTS public.book_redirect_daily_counts (
  day date NOT NULL,
  retailer text NOT NULL CHECK (retailer IN ('fnac', 'amazon')),
  click_count bigint NOT NULL DEFAULT 0 CHECK (click_count >= 0),
  PRIMARY KEY (day, retailer)
);

ALTER TABLE public.book_redirect_daily_counts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.book_redirect_daily_counts FROM PUBLIC, anon, authenticated, service_role;

CREATE SCHEMA IF NOT EXISTS book_counter_private;
REVOKE ALL ON SCHEMA book_counter_private FROM PUBLIC, anon, authenticated, service_role;
CREATE TABLE IF NOT EXISTS book_counter_private.credentials (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  token_sha256 bytea NOT NULL CHECK (pg_catalog.octet_length(token_sha256) = 32)
);
ALTER TABLE book_counter_private.credentials ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE book_counter_private.credentials FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.increment_book_redirect_count(p_retailer text, p_token text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF p_token IS NULL OR pg_catalog.length(p_token) < 32 OR pg_catalog.length(p_token) > 512
    OR NOT EXISTS (
      SELECT 1 FROM book_counter_private.credentials
      WHERE singleton = true
        AND token_sha256 = pg_catalog.sha256(pg_catalog.convert_to(p_token, 'UTF8'))
    ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Counter unavailable';
  END IF;

  IF p_retailer IS NULL OR p_retailer NOT IN ('fnac', 'amazon') THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid retailer';
  END IF;

  -- The database supplies the UTC date. No client identifiers or request data enter it.
  INSERT INTO public.book_redirect_daily_counts AS counts (day, retailer, click_count)
  VALUES ((pg_catalog.now() AT TIME ZONE 'UTC')::date, p_retailer, 1)
  ON CONFLICT (day, retailer)
  DO UPDATE SET click_count = counts.click_count + 1;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_book_redirect_count(text, text) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.increment_book_redirect_count(text, text) TO anon;

COMMIT;
