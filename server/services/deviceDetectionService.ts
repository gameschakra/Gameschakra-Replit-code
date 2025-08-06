import { Request } from "express";

/**
 * Detects device type from user agent string
 * @param userAgent The user agent string from request
 * @returns Device type (desktop, mobile, tablet, or unknown)
 */
export function detectDeviceType(userAgent: string): string {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
  
  if (isTablet) return "tablet";
  if (isMobile) return "mobile";
  return "desktop";
}

/**
 * Detects browser from user agent string
 * @param userAgent The user agent string from request
 * @returns Browser name
 */
export function detectBrowser(userAgent: string): string {
  if (/MSIE|Trident/i.test(userAgent)) return "Internet Explorer";
  if (/Edg/i.test(userAgent)) return "Edge";
  if (/Firefox/i.test(userAgent)) return "Firefox";
  if (/Chrome/i.test(userAgent)) return "Chrome";
  if (/Safari/i.test(userAgent)) return "Safari";
  if (/Opera|OPR/i.test(userAgent)) return "Opera";
  return "Unknown";
}

/**
 * Detects operating system from user agent string
 * @param userAgent The user agent string from request
 * @returns Operating system name
 */
export function detectOS(userAgent: string): string {
  if (/Windows/i.test(userAgent)) return "Windows";
  if (/Macintosh|Mac OS X/i.test(userAgent)) return "macOS";
  if (/Linux/i.test(userAgent)) return "Linux";
  if (/Android/i.test(userAgent)) return "Android";
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "iOS";
  return "Unknown";
}

/**
 * Detects traffic source from referrer
 * @param referrer The referrer string from request
 * @returns Traffic source classification
 */
export function detectTrafficSource(referrer: string | undefined): { source: string, referrer: string | null } {
  if (!referrer) {
    return { source: "direct", referrer: null };
  }
  
  try {
    const url = new URL(referrer);
    const hostname = url.hostname.toLowerCase();
    
    if (hostname.includes("google") || hostname.includes("bing") || hostname.includes("yahoo") || hostname.includes("duckduckgo")) {
      return { source: "search", referrer: hostname };
    }
    
    if (hostname.includes("facebook") || hostname.includes("twitter") || hostname.includes("instagram") || 
        hostname.includes("linkedin") || hostname.includes("pinterest") || hostname.includes("youtube") || 
        hostname.includes("reddit") || hostname.includes("discord")) {
      return { source: "social", referrer: hostname };
    }
    
    return { source: "referral", referrer: hostname };
  } catch (error) {
    return { source: "unknown", referrer: referrer };
  }
}

/**
 * Generates a unique session ID
 * @returns A unique session ID
 */
export function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Get client IP address
 * @param req Express request object
 * @returns Client IP address or "unknown" if not available
 */
export function getClientIp(req: Request): string {
  // Get IP from X-Forwarded-For header or request connection
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0] || 
    req.socket.remoteAddress || 
    "unknown"
  );
}

/**
 * Device detection service - processes request to extract device information
 * @param req Express request object
 * @returns An object containing device and traffic information
 */
export function processRequestForAnalytics(req: Request) {
  const userAgent = req.headers["user-agent"] || "";
  const referrer = req.headers.referer || undefined;
  const { source, referrer: referrerHost } = detectTrafficSource(referrer);
  
  return {
    deviceType: detectDeviceType(userAgent),
    browser: detectBrowser(userAgent),
    os: detectOS(userAgent),
    source,
    referrer: referrerHost,
    sessionId: generateSessionId(),
    ip: getClientIp(req)
  };
}