import fs from 'fs';
import path from 'path';
import { db } from '../db';
import { games, categories } from '../../shared/schema';
import { eq, desc } from 'drizzle-orm';

// GC_SEO: In-memory cache for sitemap with 10-minute TTL
interface SitemapCache {
  content: string;
  timestamp: number;
  ttl: number;
}

let sitemapCache: SitemapCache | null = null;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes in milliseconds

interface SitemapURL {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/**
 * GC_SEO: Escape XML entities to prevent malformed XML
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * GC_SEO: Generates an XML sitemap for the website with caching
 */
export async function generateSitemap(baseUrl: string = 'https://gameschakra.com'): Promise<string> {
  // GC_SEO: Check cache first
  if (sitemapCache && (Date.now() - sitemapCache.timestamp) < sitemapCache.ttl) {
    console.log('Serving sitemap from cache');
    return sitemapCache.content;
  }
  
  try {
    // Create array to hold all URLs
    const urls: SitemapURL[] = [];
    
    // GC_SEO: Add static pages with proper priorities
    urls.push({
      loc: `${baseUrl}/`,
      changefreq: 'daily',
      priority: 0.9,
      lastmod: new Date().toISOString()
    });
    
    urls.push({
      loc: `${baseUrl}/about`,
      changefreq: 'monthly',
      priority: 0.5
    });
    
    urls.push({
      loc: `${baseUrl}/terms`,
      changefreq: 'yearly',
      priority: 0.3
    });
    
    urls.push({
      loc: `${baseUrl}/privacy`,
      changefreq: 'yearly',
      priority: 0.3
    });
    
    urls.push({
      loc: `${baseUrl}/cookies`,
      changefreq: 'yearly',
      priority: 0.3
    });
    
    urls.push({
      loc: `${baseUrl}/info-for-parents`,
      changefreq: 'yearly',
      priority: 0.3
    });
    
    urls.push({
      loc: `${baseUrl}/contact`,
      changefreq: 'monthly',
      priority: 0.4
    });
    
    urls.push({
      loc: `${baseUrl}/jobs`,
      changefreq: 'monthly',
      priority: 0.4
    });
    
    urls.push({
      loc: `${baseUrl}/developers`,
      changefreq: 'monthly',
      priority: 0.4
    });
    
    urls.push({
      loc: `${baseUrl}/blog`,
      changefreq: 'daily',
      priority: 0.6
    });
    
    // GC_SEO: Add categories - Postgres-safe query selecting only needed columns
    try {
      const categoryData = await db.select({
        id: categories.id,
        slug: categories.slug,
        updatedAt: categories.createdAt // categories table doesn't have updatedAt, use createdAt
      })
      .from(categories)
      .orderBy(desc(categories.id)) // Use id instead of updatedAt since categories don't have updatedAt
      .limit(2000);
      
      console.log(`Found ${categoryData.length} categories for sitemap`);
      
      for (const category of categoryData) {
        const lastModified = category.updatedAt ? new Date(category.updatedAt).toISOString() : new Date().toISOString();
        
        urls.push({
          loc: `${baseUrl}/category/${escapeXml(category.slug)}`,
          lastmod: lastModified,
          changefreq: 'daily',
          priority: 0.7
        });
      }
    } catch (categoryError) {
      console.warn('Error fetching categories for sitemap:', categoryError);
      // Continue without categories - don't fail the entire sitemap
    }
    
    // GC_SEO: Add games - Postgres-safe query selecting only needed columns
    try {
      const gameData = await db.select({
        id: games.id,
        slug: games.slug,
        updatedAt: games.updatedAt,
        status: games.status
      })
      .from(games)
      .where(eq(games.status, 'published'))
      .orderBy(desc(games.updatedAt))
      .limit(10000);
      
      console.log(`Found ${gameData.length} published games for sitemap`);
      
      for (const game of gameData) {
        const lastModified = game.updatedAt ? new Date(game.updatedAt).toISOString() : new Date().toISOString();
        
        urls.push({
          loc: `${baseUrl}/games/${escapeXml(game.slug)}`,
          lastmod: lastModified,
          changefreq: 'weekly',
          priority: 0.6
        });
      }
    } catch (gameError) {
      console.warn('Error fetching games for sitemap:', gameError);
      // Continue without games - don't fail the entire sitemap
    }
    
    // GC_SEO: Generate XML content with proper escaping
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add each URL to sitemap
    for (const url of urls) {
      xml += '  <url>\n';
      xml += `    <loc>${escapeXml(url.loc)}</loc>\n`;
      if (url.lastmod) {
        xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
      }
      if (url.changefreq) {
        xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
      }
      if (url.priority !== undefined) {
        xml += `    <priority>${url.priority.toFixed(1)}</priority>\n`;
      }
      xml += '  </url>\n';
    }
    
    xml += '</urlset>';
    
    // GC_SEO: Cache the result
    sitemapCache = {
      content: xml,
      timestamp: Date.now(),
      ttl: CACHE_TTL
    };
    
    // Save sitemap to the public directory
    try {
      const publicDir = path.join(process.cwd(), 'public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      
      fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);
      console.log(`Sitemap saved to public/sitemap.xml`);
    } catch (writeError) {
      console.warn('Failed to write sitemap to disk:', writeError);
      // Don't fail - we can still return the XML content
    }
    
    console.log(`Sitemap generated with ${urls.length} URLs (cached for ${CACHE_TTL / 1000 / 60} minutes)`);
    return xml;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // GC_SEO: Fallback to static sitemap if it exists
    try {
      const staticSitemapPath = path.join(process.cwd(), 'dist', 'public', 'sitemap.xml');
      if (fs.existsSync(staticSitemapPath)) {
        console.log('Falling back to static sitemap.xml');
        const staticContent = fs.readFileSync(staticSitemapPath, 'utf-8');
        
        // Cache the fallback content briefly
        sitemapCache = {
          content: staticContent,
          timestamp: Date.now(),
          ttl: 60000 // 1 minute cache for fallback
        };
        
        return staticContent;
      }
    } catch (fallbackError) {
      console.warn('Fallback sitemap also failed:', fallbackError);
    }
    
    // Last resort: return minimal sitemap
    const minimalSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>
</urlset>`;
    
    console.log('Returning minimal sitemap as last resort');
    return minimalSitemap;
  }
}

/**
 * Schedule sitemap regeneration
 * @param intervalHours How often to regenerate the sitemap (in hours)
 */
export function scheduleSitemapGeneration(intervalHours: number = 24): NodeJS.Timeout {
  const intervalMs = intervalHours * 60 * 60 * 1000;
  
  console.log(`Scheduling sitemap generation every ${intervalHours} hours`);
  
  // Generate sitemap immediately
  generateSitemap().catch((error) => {
    console.warn('Initial sitemap generation failed:', error);
  });
  
  // Then schedule recurring generation
  return setInterval(() => {
    generateSitemap().catch((error) => {
      console.warn('Scheduled sitemap generation failed:', error);
    });
  }, intervalMs);
}