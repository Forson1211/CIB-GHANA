import { supabase, supabaseAdmin } from './supabase';

type SyncStatus = 'SUCCESSFUL' | 'PENDING' | 'FAILED';

interface SyncOptions {
  status: SyncStatus;
  registrationNumber?: string;
  id?: string;
  reference?: string;
  method?: string;
  category?: string;
}

// Columns that may not exist on every deployed schema. If Supabase rejects one,
// it is dropped and the update is retried so payment_status is never lost.
const OPTIONAL_COLUMNS = ['membership_category', 'payment_method', 'payment_reference'] as const;

const isUuid = (val?: string) =>
  Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

/**
 * Persist a registration's payment status to Supabase.
 * supabase-js returns errors instead of throwing, so every response is checked
 * and the update is retried without unsupported columns.
 * Returns true once at least one row has been updated.
 */
export async function syncRegistrationPayment(opts: SyncOptions): Promise<boolean> {
  const client = supabaseAdmin || supabase;
  if (!client) return false;

  const basePayload: Record<string, any> = { payment_status: opts.status };
  if (opts.reference) basePayload.payment_reference = opts.reference;
  if (opts.method) basePayload.payment_method = opts.method;
  if (opts.category) basePayload.membership_category = opts.category;

  const filters: Array<[string, string]> = [];
  if (opts.registrationNumber) filters.push(['registration_number', opts.registrationNumber.trim()]);
  if (isUuid(opts.id)) filters.push(['id', opts.id!]);
  if (opts.reference) {
    filters.push(['payment_reference', opts.reference.trim()]);
    filters.push(['registration_number', opts.reference.trim()]);
  }

  let payload = { ...basePayload };

  for (const [column, value] of filters) {
    for (let attempt = 0; attempt < OPTIONAL_COLUMNS.length + 2; attempt++) {
      const { data, error } = await client
        .from('registrations')
        .update(payload)
        .eq(column, value)
        .select('id');

      if (!error) {
        if (data && data.length > 0) return true;
        break; // no match for this filter, try the next one
      }

      const msg = `${error.message || ''} ${(error as any).details || ''} ${(error as any).hint || ''}`;
      const rejected = OPTIONAL_COLUMNS.find((c) => c in payload && msg.includes(c));
      if (rejected) {
        delete payload[rejected];
        continue;
      }
      if (Object.keys(payload).length > 1) {
        // Unknown error: fall back to the essential status field only
        payload = { payment_status: opts.status };
        continue;
      }
      console.warn('[registrationSync] Supabase payment update failed:', error);
      break;
    }
  }

  return false;
}
