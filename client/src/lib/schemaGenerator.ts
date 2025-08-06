/**
 * Generates structured data markup for games using schema.org/VideoGame
 */

import { Game } from '@shared/schema';

interface GameSchemaProps {
  game: Game;
  url: string;
  imageUrl?: string;
}

type SchemaType = {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  url: string;
  playMode: string;
  applicationCategory: string;
  genre: string;
  author: {
    '@type': string;
    name: string;
  };
  publisher: {
    '@type': string;
    name: string;
    url: string;
  };
  offers: {
    '@type': string;
    price: string;
    priceCurrency: string;
    availability: string;
  };
  aggregateRating: {
    '@type': string;
    ratingValue: string;
    ratingCount: string;
    bestRating: string;
    worstRating: string;
  };
  [key: string]: any; // Allow any additional properties
};

export function generateGameSchema({ game, url, imageUrl }: GameSchemaProps): SchemaType {
  // Get category name safely
  const categoryName = game.categoryId ? 'Online Game' : 'Online Game';
  
  // Get developer name safely
  const developerName = 'GamesChakra';
  
  // Create the basic VideoGame schema
  const schema: SchemaType = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    'name': game.title,
    'description': game.description || `Play ${game.title} online for free on GamesChakra`,
    'url': url,
    'playMode': 'SinglePlayer',
    'applicationCategory': 'Game',
    'genre': categoryName,
    'author': {
      '@type': 'Organization',
      'name': developerName
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'GamesChakra',
      'url': 'https://gameschakra.com'
    },
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
      'availability': 'https://schema.org/InStock'
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.5',
      'ratingCount': '100',
      'bestRating': '5',
      'worstRating': '1'
    }
  };

  // Add thumbnail image if available
  if (imageUrl) {
    schema.image = imageUrl;
    schema.screenshot = imageUrl;
  }

  // Add game controls information
  schema.gamePlatform = 'Web Browser';
  schema.gameControl = 'Keyboard and Mouse';
  
  return schema;
}

export function generateOrganizationSchema(): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'GamesChakra',
    'url': 'https://gameschakra.com',
    'logo': 'https://gameschakra.com/assets/logo.png',
    'sameAs': [
      'https://facebook.com/gameschakra',
      'https://twitter.com/gameschakra'
    ],
    'description': 'GamesChakra is a platform for free online HTML5 games. Play instantly in your browser!'
  };
}

export function generateWebsiteSchema(): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'GamesChakra',
    'url': 'https://gameschakra.com',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': 'https://gameschakra.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };
}