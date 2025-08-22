// GC_FIX(normalize): ensure we always have an array of items
export type Paged<T> = { items: T[]; total?: number; page?: number } | T[];

export function toItemsArray<T>(data: Paged<T> | undefined | null): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray((data as any).items)) return (data as any).items as T[];
  return [];
}

// GC_SAFE_NORMALIZE
export function extractArray<T = any>(val: any): T[] {
  if (Array.isArray(val)) return val as T[];
  if (Array.isArray(val?.items)) return val.items as T[];
  if (Array.isArray(val?.rows))  return val.rows  as T[];
  if (Array.isArray(val?.data))  return val.data  as T[];
  return [];
}