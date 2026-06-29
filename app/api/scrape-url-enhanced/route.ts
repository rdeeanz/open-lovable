import { NextRequest, NextResponse } from 'next/server';

const FIRECRAWL_SCRAPE_URL = 'https://api.firecrawl.dev/v1/scrape';

// Function to sanitize smart quotes and other problematic characters
function sanitizeQuotes(text: string): string {
  return text
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u00AB\u00BB]/g, '"')
    .replace(/[\u2039\u203A]/g, "'")
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2026]/g, '...')
    .replace(/[\u00A0]/g, ' ');
}

interface ScrapeOptions {
  formats: string[];
  waitFor?: number;
  timeout?: number;
  onlyMainContent?: boolean;
  blockAds?: boolean;
  maxAge?: number;
}

async function scrapeWithFirecrawl(apiKey: string, url: string, options: ScrapeOptions) {
  const response = await fetch(FIRECRAWL_SCRAPE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url, ...options })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Firecrawl API error: ${error}`);
  }

  const data = await response.json();
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to scrape content');
  }

  return data;
}

function isTimeoutError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('SCRAPE_TIMEOUT') || message.includes('timed out');
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'URL is required'
      }, { status: 400 });
    }

    console.log('[scrape-url-enhanced] Scraping with Firecrawl:', url);

    const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
    if (!FIRECRAWL_API_KEY) {
      throw new Error('FIRECRAWL_API_KEY environment variable is not set');
    }

    // Screenshot is captured separately via /api/scrape-screenshot
    const primaryOptions: ScrapeOptions = {
      formats: ['markdown'],
      waitFor: 2000,
      timeout: 60000,
      onlyMainContent: true,
      blockAds: true,
      maxAge: 3600000,
    };

    let data;
    try {
      data = await scrapeWithFirecrawl(FIRECRAWL_API_KEY, url, primaryOptions);
    } catch (error) {
      if (!isTimeoutError(error)) throw error;

      console.warn('[scrape-url-enhanced] Primary scrape timed out, retrying with lighter options');
      data = await scrapeWithFirecrawl(FIRECRAWL_API_KEY, url, {
        formats: ['markdown'],
        waitFor: 1000,
        timeout: 90000,
        onlyMainContent: true,
        blockAds: false,
      });
    }

    const { markdown, metadata } = data.data;
    const sanitizedMarkdown = sanitizeQuotes(markdown || '');
    const title = metadata?.title || '';
    const description = metadata?.description || '';

    const formattedContent = `
Title: ${sanitizeQuotes(title)}
Description: ${sanitizeQuotes(description)}
URL: ${url}

Main Content:
${sanitizedMarkdown}
    `.trim();

    return NextResponse.json({
      success: true,
      url,
      content: formattedContent,
      screenshot: null,
      structured: {
        title: sanitizeQuotes(title),
        description: sanitizeQuotes(description),
        content: sanitizedMarkdown,
        url,
        screenshot: null
      },
      metadata: {
        scraper: 'firecrawl-enhanced',
        timestamp: new Date().toISOString(),
        contentLength: formattedContent.length,
        cached: data.data.cached || false,
        ...metadata
      },
      message: 'URL scraped successfully with Firecrawl'
    });

  } catch (error) {
    console.error('[scrape-url-enhanced] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to scrape website';
    const friendlyError = isTimeoutError(error)
      ? 'The website took too long to load. Try a simpler page or check that the URL is reachable.'
      : message;

    return NextResponse.json({
      success: false,
      error: friendlyError
    }, { status: 500 });
  }
}
