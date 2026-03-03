import requests
from typing import Dict, Any
from urllib.parse import urlparse

def get_alienvault_report(target: str, target_type: str, api_key: str) -> Dict[str, Any]:
    """
    Fetch a report from AlienVault OTX for an IP or Domain.
    """
    if not api_key or api_key == "your_otx_key":
        return {"error": "AlienVault OTX API key is missing or invalid. Please check your .env file."}
    
    headers = {
        "X-OTX-API-KEY": api_key
    }
    
    try:
        indicator_type = "IPv4"
        indicator = target
        
        if target_type == "url":
            indicator_type = "domain"
            # Extract domain from URL
            if target.startswith("http://") or target.startswith("https://"):
                parsed = urlparse(target)
                indicator = parsed.hostname or target
            else:
                indicator = target.split('/')[0]

        url = f"https://otx.alienvault.com/api/v1/indicators/{indicator_type}/{indicator}/general"
        
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            pulse_info = data.get("pulse_info", {})
            return {
                "success": True,
                "indicator": data.get("indicator"),
                "type": data.get("type"),
                "reputation": data.get("reputation", 0),
                "pulse_count": pulse_info.get("count", 0),
                "pulses": pulse_info.get("pulses", [])[:5], # Send top 5 pulses
                "permalink": f"https://otx.alienvault.com/indicator/{indicator_type}/{indicator}"
            }
        elif response.status_code == 404:
            return {"error": "Target not found in AlienVault OTX database."}
        elif response.status_code in [401, 403]:
            return {"error": "Invalid AlienVault OTX API key or unauthorized."}
        else:
            return {"error": f"AlienVault API returned HTTP {response.status_code}: {response.text}"}
    except requests.exceptions.RequestException as e:
        return {"error": f"Failed to connect to AlienVault API: {str(e)}"}
    except Exception as e:
        return {"error": f"An unexpected error occurred during AlienVault scan: {str(e)}"}
