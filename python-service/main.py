"""
LinkedIn Profile Scraper Microservice
Uses linkedin-api (requires credentials) + BeautifulSoup fallback.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from bs4 import BeautifulSoup
import os
import re
import json
import time
import random
from typing import Optional

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
    source: str  # 'linkedin-api' | 'scraped' | 'fallback'


# ------- Helpers -------
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
}

def extract_profile_id(url: str) -> str:
    match = re.search(r"linkedin\.com/in/([a-zA-Z0-9_%-]+)", url)
    return match.group(1).rstrip("/") if match else ""

def clean_text(text: str) -> str:
    return " ".join(text.split()).strip() if text else ""

def format_name_from_id(profile_id: str) -> str:
    clean = re.sub(r'\d+', '', profile_id).replace('-', ' ').replace('_', ' ').strip()
    return ' '.join(w.capitalize() for w in clean.split() if w) or profile_id


def try_linkedin_api(profile_id: str) -> Optional[dict]:
    """
    Primary Strategy: Use linkedin-api package with user credentials.
    """
    email = os.environ.get("LINKEDIN_EMAIL")
    password = os.environ.get("LINKEDIN_PASSWORD")
    
    if not email or not password or "example.com" in email:
        return None
    
    try:
        from linkedin_api import Linkedin
        # Initialize API (handles login)
        api = Linkedin(email, password)
        profile = api.get_profile(profile_id)
        
        if not profile:
            return None
        
        name = f"{profile.get('firstName', '')} {profile.get('lastName', '')}".strip()
        headline = profile.get('headline', '')
        summary = profile.get('summary', '')
        
        education = []
        for edu in profile.get('education', []):
            school = edu.get('schoolName', '')
            degree = edu.get('degreeName', '')
            if school:
                education.append(f"{degree} - {school}" if degree else school)
        
        skills = [s.get('name') for s in profile.get('skills', []) if s.get('name')]
        
        return {
            "name": name,
            "headline": headline,
            "about": summary,
            "education": education,
            "qualifications": skills[:15],
            "source": "linkedin-api"
        }
    except Exception as e:
        print(f"LinkedIn API Error: {e}")
        return None


def scrape_public_profile(url: str) -> Optional[dict]:
    """
    Secondary Strategy: Public HTML scraping (no login).
    """
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        if response.status_code != 200: return None
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Meta tags
        og_title = soup.find('meta', property='og:title')
        og_desc = soup.find('meta', property='og:description')
        title = og_title.get('content', '') if og_title else ''
        desc = og_desc.get('content', '') if og_desc else ''
        
        name = title.split(' - ')[0].replace(' | LinkedIn', '').strip()
        headline = title.split(' - ')[1].split(' | ')[0].strip() if ' - ' in title else ''
        
        if name and len(name) > 2:
            return {
                "name": name,
                "headline": headline,
                "about": desc,
                "education": [],
                "qualifications": [],
                "source": "scraped"
            }
    except:
        pass
    return None


# ------- Endpoints -------
@app.get("/health")
def health():
    return {"status": "ok", "service": "linkedin-scraper"}


@app.get("/profile", response_model=LinkedInProfileResponse)
def get_profile(url: str) -> LinkedInProfileResponse:
    if not url or "linkedin.com/in/" not in url:
        raise HTTPException(status_code=400, detail="Invalid LinkedIn URL")
    
    profile_id = extract_profile_id(url)
    
    # 1. Try API with credentials
    data = try_linkedin_api(profile_id)
    
    # 2. Try Public Scraping
    if not data:
        data = scrape_public_profile(url)
        
    # 3. Fallback
    if not data:
        name = format_name_from_id(profile_id)
        data = {
            "name": name,
            "headline": "Technology Professional",
            "about": f"Professional profile for {name}. Visit {url} for details.",
            "education": ["Engineering / Technology Degree"],
            "qualifications": ["Software Development", "Problem Solving"],
            "source": "fallback"
        }
    
    return LinkedInProfileResponse(
        success=(data["source"] != "fallback"),
        profileUrl=url,
        **data
    )
