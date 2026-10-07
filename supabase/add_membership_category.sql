-- Adds membership_category to registrations so the selected category
-- (ACIB / FCIB / Student / Non-Member) is stored natively.
-- Safe to run multiple times.
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS membership_category TEXT DEFAULT 'Non-Member';

-- Backfill existing rows from the category tag / member ID prefix
UPDATE public.registrations
SET membership_category = CASE
  WHEN special_assistance ~* 'Category:\s*FCIB' OR cib_member_id ILIKE 'FCIB%' THEN 'FCIB'
  WHEN special_assistance ~* 'Category:\s*ACIB' OR cib_member_id ILIKE 'ACIB%' THEN 'ACIB'
  WHEN special_assistance ~* 'Category:\s*Student' OR cib_member_id ILIKE 'STU%' OR cib_member_id ILIKE 'Student%' THEN 'Student'
  ELSE COALESCE(membership_category, 'Non-Member')
END;

-- Refresh PostgREST schema cache so the API sees the new column
NOTIFY pgrst, 'reload schema';
