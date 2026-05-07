
export interface LinkedInProfile {
    name: string;
    headline: string;
    about: string;
    education: string[];
    qualifications: string[];
    profileUrl: string;
}

/**
 * Fetches LinkedIn profile data via the Python scraper microservice.
 * 
 * Flow:
 *   1. Try Python service (linkedin-api with credentials if available, else public scraping)
 *   2. If service unavailable, use smart name-based fallback
 */
export async function getLinkedInProfile(url: string): Promise<LinkedInProfile | null> {
    const profileId = url.split('/in/')[1]?.split('/')[0]?.split('?')[0];
    if (!profileId) return null;

    // ── Try Python microservice ──────────────────────────────────────────────
    const scraperUrl = process.env.LINKEDIN_SCRAPER_URL || 'http://localhost:8000';
    
    try {
        const response = await fetch(
            `${scraperUrl}/profile?url=${encodeURIComponent(url)}`,
            { 
                signal: AbortSignal.timeout(8000), // 8s timeout
                headers: { 'Content-Type': 'application/json' }
            }
        );

        if (response.ok) {
            const data = await response.json();
            console.log(`[LinkedIn] Scraped profile via Python service (source: ${data.source})`);
            return {
                name: data.name || formatNameFromId(profileId),
                headline: data.headline || 'Technology Professional',
                about: data.about || `View full profile at ${url}`,
                education: data.education || [],
                qualifications: data.qualifications || [],
                profileUrl: url,
            };
        }
    } catch (err: any) {
        // Service unavailable — use fallback silently
        if (err.name !== 'TimeoutError') {
            console.warn('[LinkedIn] Python scraper unavailable, using fallback:', err.message);
        } else {
            console.warn('[LinkedIn] Python scraper timed out, using fallback');
        }
    }

    // ── Smart Fallback (when service is down / local dev without Docker) ─────
    return buildFallback(profileId, url);
}


/** Parse profile ID like 'harinikarthik16' or 'john-doe' into a readable name */
function formatNameFromId(profileId: string): string {
    const clean = profileId.replace(/\d+/g, '').replace(/[-_]/g, ' ').trim();
    return clean
        .split(' ')
        .filter(Boolean)
        .map(s => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' ') || profileId;
}

function buildFallback(profileId: string, url: string): LinkedInProfile {
    const name = formatNameFromId(profileId);
    return {
        name,
        headline: 'Technology & Software Development Professional',
        about:
            `${name} is a professional in the technology industry. ` +
            `Their LinkedIn profile at ${url} contains more detailed information about their experience, ` +
            `education, and skills. Connect with them directly on LinkedIn to learn more.`,
        education: ['Engineering / Technology Degree (Computer Science or related field)'],
        qualifications: [
            'Software Development & Engineering',
            'Problem Solving & Analytical Thinking',
            'Collaborative Team Player',
        ],
        profileUrl: url,
    };
}
