import requests
from typing import Dict, Any

def get_google_safe_browsing_report(target: str, api_key: str) -> Dict[str, Any]:
    """
    Fetch a report from Google Safe Browsing API.
    """
    if not api_key or api_key == "your_google_key":
        return {"error": "Google Safe Browsing API key is missing or invalid. Please check your .env file."}
    
    url = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={api_key}"
    
    payload = {
        "client": {
            "clientId": "netsight-scanner",
            "clientVersion": "1.0.0"
        },
        "threatInfo": {
            "threatTypes": ["THREAT_TYPE_UNSPECIFIED", "MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [
                {"url": target}
            ]
        }
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            matches = data.get("matches", [])
            
            if matches:
                # Format matches
                formatted_matches = []
                for match in matches:
                    formatted_matches.append({
                        "threatType": match.get("threatType"),
                        "platformType": match.get("platformType"),
                        "threatEntryType": match.get("threatEntryType")
                    })
                return {
                    "success": True,
                    "malicious": True,
                    "matches": formatted_matches,
                    "permalink": "https://transparencyreport.google.com/safe-browsing/search?url=" + target
                }
            else:
                return {
                    "success": True,
                    "malicious": False,
                    "message": "No threats found by Google Safe Browsing.",
                    "permalink": "https://transparencyreport.google.com/safe-browsing/search?url=" + target
                }
                
        elif response.status_code == 429:
            return {"error": "Google Safe Browsing API rate limit exceeded."}
        elif response.status_code in [400, 401, 403]:
            return {"error": f"Invalid Google Safe Browsing API key or request: {response.text}"}
        else:
            return {"error": f"Google Safe Browsing API returned HTTP {response.status_code}"}
            
    except requests.exceptions.RequestException as e:
        return {"error": f"Failed to connect to Google Safe Browsing API: {str(e)}"}
    except Exception as e:
        return {"error": f"An unexpected error occurred during Google Safe Browsing scan: {str(e)}"}
