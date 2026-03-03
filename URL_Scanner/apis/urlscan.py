import requests
import time
from typing import Dict, Any

def get_urlscan_report(target: str, target_type: str, api_key: str) -> Dict[str, Any]:
    """
    Fetch a report from urlscan.io for a URL or IP.
    """
    if not api_key or api_key == "your_urlscan_key":
        return {"error": "urlscan.io API key is missing or invalid. Please check your .env file."}
    
    headers = {
        "API-Key": api_key,
        "Content-Type": "application/json"
    }
    
    try:
        # urlscan searches by domain/ip or exact url
        # To avoid submitting a new scan and consuming limits, we will perform a search first
        search_query = f"page.url:\"{target}\" OR page.domain:\"{target}\" OR page.ip:\"{target}\""
        search_url = f"https://urlscan.io/api/v1/search/?q={search_query}&size=1"
        
        response = requests.get(search_url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("results") and len(data["results"]) > 0:
                latest_scan = data["results"][0]
                result_url = latest_scan.get("result")
                
                # Fetch detailed result
                if result_url:
                    res_detail = requests.get(result_url, headers=headers, timeout=10)
                    if res_detail.status_code == 200:
                        detail_data = res_detail.json()
                        verdicts = detail_data.get("verdicts", {}).get("overall", {})
                        page = detail_data.get("page", {})
                        lists = detail_data.get("lists", {})
                        
                        return {
                            "success": True,
                            "task_url": latest_scan.get("task", {}).get("url"),
                            "date": latest_scan.get("task", {}).get("time"),
                            "score": verdicts.get("score", 0),
                            "malicious": verdicts.get("malicious", False),
                            "tags": verdicts.get("tags", []),
                            "country": page.get("country"),
                            "server": page.get("server"),
                            "ip": page.get("ip"),
                            "asn": page.get("asn"),
                            "asnname": page.get("asnname"),
                            "certificates": lists.get("certificates", []),
                            "permalink": f"https://urlscan.io/result/{latest_scan.get('_id')}/"
                        }
            
            return {"error": "Target not found in urlscan.io recent scans."}
            
        elif response.status_code == 429:
            return {"error": "urlscan.io API rate limit exceeded."}
        elif response.status_code in [401, 403]:
            return {"error": "Invalid urlscan.io API key or unauthorized."}
        else:
            return {"error": f"urlscan.io API returned HTTP {response.status_code}"}
            
    except requests.exceptions.RequestException as e:
        return {"error": f"Failed to connect to urlscan.io API: {str(e)}"}
    except Exception as e:
        return {"error": f"An unexpected error occurred during urlscan.io operation: {str(e)}"}
