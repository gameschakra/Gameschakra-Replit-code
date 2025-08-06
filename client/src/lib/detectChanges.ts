/**
 * Utility function to detect changes between two objects and return only the changed fields
 * @param original The original object
 * @param updated The updated object
 * @returns A new object containing only the changed fields
 */
export function detectChanges<T extends Record<string, any>>(
  original: T, 
  updated: T
): Partial<T> {
  const changes: Partial<T> = {};
  
  Object.keys(updated).forEach((key) => {
    const typedKey = key as keyof T;
    // Skip if values are the same
    if (JSON.stringify(original[typedKey]) !== JSON.stringify(updated[typedKey])) {
      changes[typedKey] = updated[typedKey];
    }
  });
  
  return changes;
}

/**
 * Creates a FormData object containing only the changed fields between two objects,
 * and optionally includes file uploads
 * 
 * @param original The original object before changes
 * @param updated The updated object after changes
 * @param fileUploads Optional object containing file uploads (key is the file field name, value is the File object)
 * @returns FormData object with only the changed fields and files
 */
export function createPatchFormData<T extends Record<string, any>>(
  original: T,
  updated: T,
  fileUploads: Record<string, File | null> = {}
): FormData {
  const changes = detectChanges(original, updated);
  const formData = new FormData();
  
  // Add changed fields to FormData
  Object.entries(changes).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, value.toString());
    }
  });
  
  // Add files to FormData if they exist
  Object.entries(fileUploads).forEach(([key, file]) => {
    if (file) {
      formData.append(key, file);
    }
  });
  
  return formData;
}