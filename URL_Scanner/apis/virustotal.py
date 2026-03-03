import os
import requests
import base64
from typing import Dict, Any

def get_virustotal_report(target: str, target_type: str, api_key: str) -> Dict[str, Any]:
    """
    Fetch a report from VirusTotal for a URL or IP address.
    
    Args:
        target: The URL or IP to scan.
        target_type: Either 'url' or 'ip'.
        api_key: The VirusTotal API key.
        
    Returns:
        A dictionary containing the results or error information.
    """
    if not api_key:
        return {"error": "VirusTotal API key is missing. Please set the VT_API_KEY environment variable."}
    
    headers = {
        "x-apikey": api_key
    }
    
    try:
        if target_type == 'ip':
            url = f"https://www.virustotal.com/api/v3/ip_addresses/{target}"
        else:
            # For URLs, VT requires the URL to be base64url encoded without padding
            url_id = base64.urlsafe_b64encode(target.encode()).decode().strip("=")
            url = f"https://www.virustotal.com/api/v3/urls/{url_id}"
            
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            attributes = data.get("data", {}).get("attributes", {})
            stats = attributes.get("last_analysis_stats", {})
            results = attributes.get("last_analysis_results", {})
            
            # Extract just the relevant info to send to frontend
            engines = []
            for engine, details in results.items():
                engines.append({
                    "engine": engine,
                    "category": details.get("category", "undetected"),
                    "result": details.get("result", "clean")
                })
            
            # Sort so malicious hits are at the top
            engines.sort(key=lambda x: 0 if x["category"] == "malicious" else 1)
            
            return {
                "success": True,
                "stats": stats,
                "engines": engines,
                "permalink": attributes.get("permalink", ""),
                "last_analysis_date": attributes.get("last_analysis_date")
            }
            
        elif response.status_code == 404:
            return {"error": "Target not found in VirusTotal database (try scanning it via the VT website first)."}
        elif response.status_code == 429:
            return {"error": "VirusTotal API rate limit exceeded (Free API limits to 4 requests per minute)."}
        elif response.status_code == 401 or response.status_code == 403:
            return {"error": "Invalid VirusTotal API key or unauthorized."}
        else:
            return {"error": f"VirusTotal API returned HTTP {response.status_code}"}
            
    except requests.exceptions.RequestException as e:
        return {"error": f"Failed to connect to VirusTotal API: {str(e)}"}
    except Exception as e:
        return {"error": f"An unexpected error occurred during VirusTotal scan: {str(e)}"}

