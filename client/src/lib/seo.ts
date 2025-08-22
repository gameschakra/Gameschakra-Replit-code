/**
 * SEO utility library for managing meta tags, Open Graph, Twitter cards, and JSON-LD structured data
 * GC_SEO: Centralized SEO management for production-safe SPA
 */

// GC_SEO: Types for meta tag configuration
interface MetaConfig {
  title?: string;
  description?: string;
  canonical?: string;
  og?: Record<string, string>;
  twitter?: Record<string, string>;
}

/**
 * GC_SEO: Apply comprehensive meta tags including OG and Twitter cards
 * @param meta - Meta tag configuration object
 */
export function applyMeta(meta: MetaConfig): void {
  const origin = window.location.origin;

  // Set document title
  if (meta.title) {
    document.title = meta.title;
  }

  // Set description meta tag
  if (meta.description) {
    upsertMetaTag('name', 'description', meta.description);
  }

  // Set canonical link (ensure absolute URL)
  if (meta.canonical) {
    const canonicalUrl = meta.canonical.startsWith('http') 
      ? meta.canonical 
      : `${origin}${meta.canonical.startsWith('/') ? '' : '/'}${meta.canonical}`;
    upsertCanonicalLink(canonicalUrl);
  }

  // Set Open Graph tags
  if (meta.og) {
    // Default OG tags
    const defaultOg = {
      'og:type': 'website',
      'og:title': meta.title || document.title,
      'og:description': meta.description || '',
      'og:url': meta.canonical ? (meta.canonical.startsWith('http') ? meta.canonical : `${origin}${meta.canonical}`) : window.location.href,
    };

    const ogTags = { ...defaultOg, ...meta.og };
    
    Object.entries(ogTags).forEach(([property, content]) => {
      if (content) {
        upsertMetaTag('property', property, content);
      }
    });
  }

  // Set Twitter card tags
  if (meta.twitter) {
    // Default Twitter tags
    const defaultTwitter = {
      'twitter:card': 'summary_large_image',
      'twitter:title': meta.title || document.title,
      'twitter:description': meta.description || '',
    };

    const twitterTags = { ...defaultTwitter, ...meta.twitter };

    Object.entries(twitterTags).forEach(([name, content]) => {
      if (content) {
        upsertMetaTag('name', name, content);
      }
    });
  }
}

/**
 * GC_SEO: Inject JSON-LD structured data
 * @param id - Unique identifier for the script tag
 * @param data - JSON-LD data object
 */
export function injectJsonLd(id: string, data: object): void {
  // Remove existing script with same ID
  const existing = document.getElementById(id);
  if (existing) {
    existing.remove();
  }

  // Create new script tag
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = id;
  script.textContent = JSON.stringify(data, null, 2);
  
  // Append to head
  document.head.appendChild(script);
}

/**
 * GC_SEO: Clear multiple JSON-LD scripts by ID
 * @param ids - Array of script IDs to remove
 */
export function clearJsonLd(ids: string[]): void {
  ids.forEach(id => {
    const script = document.getElementById(id);
    if (script) {
      script.remove();
    }
  });
}

/**
 * GC_SEO: Set pagination links (prev/next)
 * @param prev - Previous page URL (absolute)
 * @param next - Next page URL (absolute)
 */
export function setPaginationLinks(prev?: string, next?: string): void {
  // Remove existing pagination links
  const existingPrev = document.querySelector('link[rel="prev"]');
  const existingNext = document.querySelector('link[rel="next"]');
  if (existingPrev) existingPrev.remove();
  if (existingNext) existingNext.remove();

  // Add prev link if provided
  if (prev) {
    const prevLink = document.createElement('link');
    prevLink.rel = 'prev';
    prevLink.href = prev;
    document.head.appendChild(prevLink);
  }

  // Add next link if provided
  if (next) {
    const nextLink = document.createElement('link');
    nextLink.rel = 'next';
    nextLink.href = next;
    document.head.appendChild(nextLink);
  }
}

/**
 * GC_SEO: Clear pagination links
 */
export function clearPaginationLinks(): void {
  const prevLink = document.querySelector('link[rel="prev"]');
  const nextLink = document.querySelector('link[rel="next"]');
  if (prevLink) prevLink.remove();
  if (nextLink) nextLink.remove();
}

/**
 * GC_SEO: Generate BreadcrumbList JSON-LD
 * @param items - Array of breadcrumb items with name and url
 */
export function generateBreadcrumbJsonLd(items: Array<{ name: string; url: string }>): object {
  const origin = window.location.origin;
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith('http') ? item.url : `${origin}${item.url}`
    }))
  };
}

/**
 * GC_SEO: Generate Game JSON-LD
 * @param game - Game object with properties
 */
export function generateGameJsonLd(game: {
  name: string;
  description?: string;
  image?: string;
  url?: string;
  author?: string;
  aggregateRating?: {
    ratingValue: number;
    ratingCount: number;
  };
}): object {
  const origin = window.location.origin;
  
  const jsonLd: any = {
    "@context": "https://schema.org",
    "@type": "Game",
    "name": game.name,
    "description": game.description || `Play ${game.name} free online`,
    "url": game.url ? (game.url.startsWith('http') ? game.url : `${origin}${game.url}`) : window.location.href,
  };

  if (game.image) {
    jsonLd.image = game.image.startsWith('http') ? game.image : `${origin}${game.image}`;
  }

  if (game.author) {
    jsonLd.author = {
      "@type": "Person",
      "name": game.author
    };
  }

  if (game.aggregateRating && game.aggregateRating.ratingCount > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": game.aggregateRating.ratingValue,
      "ratingCount": game.aggregateRating.ratingCount,
      "bestRating": 5,
      "worstRating": 1
    };
  }

  return jsonLd;
}

/**
 * GC_SEO: Generate ItemList JSON-LD for game listings
 * @param items - Array of games/items
 * @param listName - Name of the list (e.g., "Action Games", "Search Results")
 */
export function generateItemListJsonLd(
  items: Array<{ name: string; url: string; image?: string }>,
  listName: string
): object {
  const origin = window.location.origin;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": listName,
    "numberOfItems": items.length,
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Game",
        "name": item.name,
        "url": item.url.startsWith('http') ? item.url : `${origin}${item.url}`,
        ...(item.image && {
          "image": item.image.startsWith('http') ? item.image : `${origin}${item.image}`
        })
      }
    }))
  };
}

/**
 * GC_SEO: Helper function to upsert meta tags by attribute
 * @param attr - Attribute name ('name' or 'property')
 * @param value - Attribute value
 * @param content - Meta tag content
 */
function upsertMetaTag(attr: 'name' | 'property', value: string, content: string): void {
  let meta = document.querySelector(`meta[${attr}="${value}"]`);
  
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attr, value);
    document.head.appendChild(meta);
  }
  
  meta.setAttribute('content', content);
}

/**
 * GC_SEO: Helper function to upsert canonical link
 * @param href - Canonical URL
 */
function upsertCanonicalLink(href: string): void {
  let canonical = document.querySelector('link[rel="canonical"]');
  
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  
  canonical.setAttribute('href', href);
}

/**
 * GC_SEO: Reset meta tags to defaults (useful for cleanup on route changes)
 */
export function resetToDefaults(): void {
  applyMeta({
    title: 'Free Online HTML5 Games – Play Now | GamesChakra',
    description: 'Play hundreds of free HTML5 games online. Action, adventure, racing, puzzle, and many more categories. No downloads required, play instantly in your browser!',
    canonical: '/',
    og: {
      'og:type': 'website',
      'og:image': '/assets/logo.png',
    },
    twitter: {
      'twitter:card': 'summary_large_image',
      'twitter:image': '/assets/logo.png',
    }
  });
  
  // Clear any JSON-LD and pagination
  clearJsonLd(['gc-breadcrumb', 'gc-game', 'gc-itemlist']);
  clearPaginationLinks();
}

/**
 * GC_SEO: Get base URL for building absolute URLs
 */
export function getBaseUrl(): string {
  return window.location.origin;
}

/**
 * GC_SEO: Escape HTML entities in text for safe JSON-LD
 * @param text - Text to escape
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * GC_SEO: Truncate description to optimal length for meta tags
 * @param text - Text to truncate
 * @param maxLength - Maximum length (default 160 for meta description)
 */
export function truncateDescription(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text;
  
  // Find the last space before the limit to avoid cutting words
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...';
}