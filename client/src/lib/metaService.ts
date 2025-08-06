/**
 * Meta Tags Service for managing dynamic meta tags for pages
 */

interface MetaTagsOptions {
  title: string;
  description: string;
  imageUrl?: string;
  canonicalUrl?: string;
  type?: 'website' | 'article' | 'game';
}

/**
 * Updates meta tags for a page
 */
export function updateMetaTags({
  title,
  description,
  imageUrl = '/assets/logo.png',
  canonicalUrl,
  type = 'website'
}: MetaTagsOptions): void {
  // Set document title
  document.title = `${title} - GamesChakra`;

  // Update meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', description);
  }

  // Update canonical URL if provided
  const canonicalLink = document.getElementById('canonical-link') as HTMLLinkElement;
  if (canonicalLink && canonicalUrl) {
    canonicalLink.href = canonicalUrl;
  }

  // Update Open Graph tags
  const ogTitle = document.getElementById('og-title');
  const ogDescription = document.getElementById('og-description');
  const ogImage = document.getElementById('og-image');
  const ogUrl = document.getElementById('og-url');
  const ogType = document.querySelector('meta[property="og:type"]');

  if (ogTitle) ogTitle.setAttribute('content', title);
  if (ogDescription) ogDescription.setAttribute('content', description);
  if (ogImage) ogImage.setAttribute('content', imageUrl);
  if (ogUrl && canonicalUrl) ogUrl.setAttribute('content', canonicalUrl);
  if (ogType) ogType.setAttribute('content', type);

  // Update Twitter tags
  const twitterTitle = document.getElementById('twitter-title');
  const twitterDescription = document.getElementById('twitter-description');
  const twitterImage = document.getElementById('twitter-image');

  if (twitterTitle) twitterTitle.setAttribute('content', title);
  if (twitterDescription) twitterDescription.setAttribute('content', description);
  if (twitterImage) twitterImage.setAttribute('content', imageUrl);
}

/**
 * Resets meta tags to default values
 */
export function resetMetaTags(): void {
  updateMetaTags({
    title: 'GamesChakra - Play Free HTML5 Games Online',
    description: 'Play free HTML5 games online. Action, adventure, racing, puzzle, and many more categories of games!',
    canonicalUrl: 'https://gameschakra.com',
    type: 'website'
  });
}