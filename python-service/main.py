"""
LinkedIn Profile Scraper Microservice
Uses requests + BeautifulSoup (html.parser) for public profile extraction.
No C-library dependencies — works on Python 3.14+.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from bs4 import BeautifulSoup
import re
import json
import time
import random

app = FastAPI(title="LinkedIn Profile Scraper", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------- Response Model -------
class LinkedInProfileResponse(BaseModel):
    success: bool
    name: str
    headline: str
    about: str
    education: list[str]
    qualifications: list[str]
    profileUrl: str
    source: str  # 'scraped' | 'fallback'


# ------- Helpers -------
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
}


def extract_profile_id(url: str) -> str:
    match = re.search(r"linkedin\.com/in/([a-zA-Z0-9_%-]+)", url)
    return match.group(1).rstrip("/") if match else ""


def clean_text(text: str) -> str:
    return " ".join(text.split()).strip() if text else ""


def format_name_from_id(profile_id: str) -> str:
    """Parse 'harinikarthik16' or 'john-doe' → 'Harini Karthik' / 'John Doe'"""
    clean = re.sub(r'\d+', '', profile_id).replace('-', ' ').replace('_', ' ').strip()
    return ' '.join(w.capitalize() for w in clean.split() if w) or profile_id


def scrape_linkedin_profile(url: str) -> dict:
    """
    Attempt to scrape public LinkedIn profile using meta tags and JSON-LD.
    LinkedIn blocks most bots, but public profiles expose og:title / og:description
    and sometimes JSON-LD structured data with name + headline.
    """
    try:
        time.sleep(random.uniform(0.5, 1.5))
        response = requests.get(url, headers=HEADERS, timeout=10)

        if response.status_code != 200:
            return {"success": False, "reason": f"HTTP {response.status_code}"}

        soup = BeautifulSoup(response.text, 'html.parser')

        # ── Strategy 1: JSON-LD structured data ──────────────────────────────
        for script in soup.find_all('script', type='application/ld+json'):
            try:
                data = json.loads(script.string or '')
                name = clean_text(data.get('name', ''))
                if name:
                    return {
                        "success": True,
                        "name": name,
                        "headline": clean_text(data.get('jobTitle', '') or data.get('description', '')[:120]),
                        "about": clean_text(data.get('description', '')),
                        "education": [],
                        "qualifications": [],
                        "source": "scraped-jsonld"
                    }
            except Exception:
                continue

        # ── Strategy 2: Open Graph meta tags ────────────────────────────────
        og_title = soup.find('meta', property='og:title')
        og_desc  = soup.find('meta', property='og:description')
        title    = clean_text(og_title.get('content', '') if og_title else '')
        desc     = clean_text(og_desc.get('content', '')  if og_desc  else '')

        # og:title format: "Name - Headline | LinkedIn"
        name, headline = '', ''
        if ' - ' in title:
            parts    = title.split(' - ', 1)
            name     = parts[0].strip()
            headline = parts[1].split(' | ')[0].strip()
        elif title:
            name = title.replace(' | LinkedIn', '').strip()

        if name and len(name) > 2:
            return {
                "success": True,
                "name": name,
                "headline": headline,
                "about": desc,
                "education": [],
                "qualifications": [],
                "source": "scraped-meta"
            }

        return {"success": False, "reason": "LinkedIn returned no extractable data (auth wall)"}

    except requests.exceptions.Timeout:
        return {"success": False, "reason": "Request timed out"}
    except Exception as e:
        return {"success": False, "reason": str(e)}


def build_fallback(profile_id: str, url: str) -> LinkedInProfileResponse:
    name = format_name_from_id(profile_id)
    return LinkedInProfileResponse(
        success=False,
        profileUrl=url,
        name=name,
        headline="Technology & Software Development Professional",
        about=(
            f"{name} is a technology professional. "
            f"Visit their LinkedIn profile at {url} for full details on their experience and skills."
        ),
        education=["Engineering / Technology Degree (Computer Science or related)"],
        qualifications=[
            "Software Development & Engineering",
            "Problem Solving & Analytical Thinking",
            "Collaborative Team Player",
        ],
        source="fallback"
    )


# ------- Endpoints -------
@app.get("/health")
def health():
    return {"status": "ok", "service": "linkedin-scraper"}


@app.get("/profile", response_model=LinkedInProfileResponse)
def get_profile(url: str) -> LinkedInProfileResponse:
    """
    Extract LinkedIn profile data from a public URL.
    Tries public HTML scraping first, then falls back to name-based inference.
    """
    if not url or "linkedin.com/in/" not in url:
        raise HTTPException(status_code=400, detail="Invalid LinkedIn URL")

    profile_id = extract_profile_id(url)
    if not profile_id:
        raise HTTPException(status_code=400, detail="Could not extract profile ID from URL")

    # Try scraping
    result = scrape_linkedin_profile(url)
    if result.get("success"):
        return LinkedInProfileResponse(
            success=True,
            profileUrl=url,
            name=result.get("name", ""),
            headline=result.get("headline", ""),
            about=result.get("about", ""),
            education=result.get("education", []),
            qualifications=result.get("qualifications", []),
            source=result.get("source", "scraped")
        )

    # Smart fallback
    return build_fallback(profile_id, url)
