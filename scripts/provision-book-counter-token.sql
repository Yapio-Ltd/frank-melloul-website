-- Run as the Supabase project owner AFTER add-book-redirect-counter.sql.
-- Generate a cryptographically random token of at least 32 bytes outside the browser.
-- Store the token as server-only BOOK_COUNTER_TOKEN; paste only its SHA-256 hex below.
-- This intentionally fails until the placeholder is replaced with a real hash.
-- Re-running with the same hash is safe; a new hash rotates the accepted token.
DO $$
DECLARE
  token_hash_hex text := 'REPLACE_WITH_64_HEX_CHARACTERS_OF_TOKEN_SHA256';
BEGIN
  IF token_hash_hex !~ '^[a-fA-F0-9]{64}$' THEN
    RAISE EXCEPTION 'Replace the placeholder with the SHA-256 hex of the server token';
  END IF;

  INSERT INTO book_counter_private.credentials (singleton, token_sha256)
  VALUES (true, pg_catalog.decode(token_hash_hex, 'hex'))
  ON CONFLICT (singleton) DO UPDATE SET token_sha256 = EXCLUDED.token_sha256;
END;
$$;
