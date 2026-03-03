import requests
from typing import Dict, Any

def get_abuseipdb_report(ip: str, api_key: str) -> Dict[str, Any]:
    """
    Fetch a report from AbuseIPDB for an IP address.
    """
    if not api_key or api_key == "your_abuseipdb_key":
        return {"error": "AbuseIPDB API key is missing or invalid. Please check your .env file."}
    
    url = "https://api.abuseipdb.com/api/v2/check"
    headers = {
        "Accept": "application/json",
        "Key": api_key
    }
    querystring = {
        "ipAddress": ip,
        "maxAgeInDays": "90"
    }

    try:
        response = requests.get(url, headers=headers, params=querystring, timeout=10)
        if response.status_code == 200:
            data = response.json().get("data", {})
            return {
                "success": True,
                "ipAddress": data.get("ipAddress"),
                "isPublic": data.get("isPublic"),
                "ipVersion": data.get("ipVersion"),
                "isWhitelisted": data.get("isWhitelisted"),
                "abuseConfidenceScore": data.get("abuseConfidenceScore"),
                "countryCode": data.get("countryCode"),
                "usageType": data.get("usageType"),
                "isp": data.get("isp"),
                "domain": data.get("domain"),
                "hostnames": data.get("hostnames", []),
                "isTor": data.get("isTor"),
                "totalReports": data.get("totalReports"),
                "numDistinctUsers": data.get("numDistinctUsers"),
                "lastReportedAt": data.get("lastReportedAt"),
                "permalink": f"https://www.abuseipdb.com/check/{ip}"
            }
        elif response.status_code == 429:
            return {"error": "AbuseIPDB API rate limit exceeded."}
        elif response.status_code in [401, 403]:
            return {"error": "Invalid AbuseIPDB API key or unauthorized."}
        else:
            return {"error": f"AbuseIPDB API returned HTTP {response.status_code}: {response.text}"}
    except requests.exceptions.RequestException as e:
        return {"error": f"Failed to connect to AbuseIPDB API: {str(e)}"}
    except Exception as e:
        return {"error": f"An unexpected error occurred during AbuseIPDB scan: {str(e)}"}
