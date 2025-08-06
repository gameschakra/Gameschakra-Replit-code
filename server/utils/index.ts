import slugify from 'slugify';

export function generateSlug(text: string): string {
  return slugify(text, {
    lower: true,      // Convert to lower case
    strict: true,     // Strip special characters
    remove: /[*+~.()'"!:@]/g // Characters to remove (in addition to strict mode)
  });
}