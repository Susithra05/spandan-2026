-- Allow read access for admin reporting
CREATE OR REPLACE FUNCTION get_admin_registrations(admin_key text)
RETURNS SETOF registrations
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Set your committee passcode below (e.g., 'SPANDAN2026ADMIN')
  IF admin_key = 'SPANDAN2026ADMIN' THEN
    RETURN QUERY SELECT * FROM registrations ORDER BY created_at DESC;
  ELSE
    RAISE EXCEPTION 'Unauthorized Admin Key';
  END IF;
END;
$$;