import fs from 'fs';
import path from 'path';
import { db } from '../db';
import { games, categories } from '../../shared/schema';
import { eq } from 'drizzle-orm';

interface SitemapURL {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/**
 * Generates an XML sitemap for the website
 */
export async function generateSitemap(baseUrl: string = 'https://gameschakra.com'): Promise<string> {
  try {
    // Create array to hold all URLs
    const urls: SitemapURL[] = [];
    
    // Add static pages
    urls.push({
      loc: `${baseUrl}/`,
      changefreq: 'daily',
      priority: 1.0
    });
    
    urls.push({
      loc: `${baseUrl}/about`,
      changefreq: 'monthly',
      priority: 0.7
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
    
    // Add categories
    const categoryData = await db.select().from(categories);
    
    for (const category of categoryData) {
      urls.push({
        loc: `${baseUrl}/category/${category.slug}`,
        changefreq: 'weekly',
        priority: 0.8
      });
    }
    
    // Add games - only published games 
    const gameData = await db.select().from(games).where(eq(games.status, 'published'));
    
    for (const game of gameData) {
      const lastModified = game.updatedAt ? new Date(game.updatedAt).toISOString() : new Date().toISOString();
      
      urls.push({
        loc: `${baseUrl}/games/${game.slug}`,
        lastmod: lastModified,
        changefreq: 'weekly',
        priority: 0.9
      });
    }
    
    // Generate XML content
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add each URL to sitemap
    for (const url of urls) {
      xml += '  <url>\n';
      xml += `    <loc>${url.loc}</loc>\n`;
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
    
    // Save sitemap to the public directory
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);
    
    console.log(`Sitemap generated with ${urls.length} URLs`);
    return xml;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    throw error;
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
  generateSitemap().catch(console.error);
  
  // Then schedule recurring generation
  return setInterval(() => {
    generateSitemap().catch(console.error);
  }, intervalMs);
}