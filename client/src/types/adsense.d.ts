/**
 * AdSense types for TypeScript
 */
interface Window {
  adsbygoogle: any[] & {
    loaded?: boolean;
    push?: (params: AdsenseConfig | {}) => void;
  };
  __autoAdsInitialized?: boolean;
}

interface AdsenseConfig {
  google_ad_client?: string;
  enable_page_level_ads?: boolean;
  overlays?: {
    bottom?: boolean;
    top?: boolean;
  };
}