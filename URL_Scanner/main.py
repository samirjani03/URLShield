from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from scanner import scan_target, detect_input_type, fetch_script_content
from apis.virustotal import get_virustotal_report
from apis.abuseipdb import get_abuseipdb_report
from apis.alienvault import get_alienvault_report
from apis.urlscan import get_urlscan_report
from apis.google_safe_browsing import get_google_safe_browsing_report
import os

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="NetSight Scanner API", description="URL/IP Scanner built with FastAPI")

# Determine base directory - works with both python main.py and uvicorn
base_dir = os.path.dirname(os.path.abspath(__file__))
static_dir = os.path.join(base_dir, "static")

# Also check current working directory as fallback
if not os.path.exists(static_dir):
    static_dir = os.path.join(os.getcwd(), "static")

if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

class ScanRequest(BaseModel):
    target: str
    use_virustotal: bool = False
    use_abuseipdb: bool = False
    use_alienvault: bool = False
    use_urlscan: bool = False
    use_google: bool = False


@app.get("/", response_class=HTMLResponse)
async def root():
    """Serve the main HTML page"""
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        with open(index_path, "r", encoding="utf-8") as f:
            return f.read()
    else:
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <title>NetSight Scanner</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; background: #0b1220; color: #e6eef8; }
                h1 { color: #1f6feb; }
                input { padding: 10px; width: 300px; border: 1px solid #30363d; background: #0b1220; color: white; }
                button { padding: 10px 20px; background: #1f6feb; color: white; border: none; cursor: pointer; }
                button:hover { background: #388bfd; }
                #result { margin-top: 20px; }
                .loading { color: #f59e0b; }
            </style>
        </head>
        <body>
            <h1>NetSight — URL / IP Scanner</h1>
            <p>Enter a URL (with or without scheme) or an IP address and click Scan.</p>
            <input type="text" id="target" placeholder="https://example.com">
            <button onclick="scan()">Scan</button>
            <div id="result"></div>
            <script>
                async function scan() {
                    const target = document.getElementById('target').value;
                    if (!target) { alert('Please enter a URL or IP address'); return; }
                    document.getElementById('result').innerHTML = '<p class="loading">Scanning... please wait</p>';
                    try {
                        const response = await fetch('/api/scan', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({target: target})
                        });
                        const data = await response.json();
                        document.getElementById('result').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                    } catch (e) {
                        document.getElementById('result').innerHTML = '<p style="color: red;">Error: ' + e.message + '</p>';
                    }
                }
            </script>
        </body>
        </html>
        """


@app.post("/api/scan")
async def scan(request: ScanRequest):
    """Scan a URL or IP address"""
    if not request.target or not request.target.strip():
        raise HTTPException(status_code=400, detail="Please enter a URL or IP address")
    
    try:
        target = request.target.strip()
        detected_type = detect_input_type(target)
        result = scan_target(target, detected_type)
        
        # Integrate VirusTotal if requested
        if request.use_virustotal:
            vt_api_key = os.environ.get("VT_API_KEY")
            vt_result = get_virustotal_report(target, detected_type, vt_api_key)
            result["virustotal"] = vt_result

        # Integrate AbuseIPDB if requested
        if request.use_abuseipdb:
            abuse_api_key = os.environ.get("ABUSEIPDB_KEY")
            if detected_type == 'ip':
                db_result = get_abuseipdb_report(target, abuse_api_key)
                result["abuseipdb"] = db_result
            else:
                result["abuseipdb"] = {"error": "AbuseIPDB scan is only supported for IP addresses."}

        # Integrate AlienVault OTX if requested
        if request.use_alienvault:
            alienvault_api_key = os.environ.get("ALIENVAULT_KEY")
            av_result = get_alienvault_report(target, detected_type, alienvault_api_key)
            result["alienvault"] = av_result
            
        # Integrate URLScan.io if requested
        if request.use_urlscan:
            urlscan_api_key = os.environ.get("URLSCAN_KEY")
            us_result = get_urlscan_report(target, detected_type, urlscan_api_key)
            result["urlscan"] = us_result

        # Integrate Google Safe Browsing if requested
        if request.use_google:
            google_api_key = os.environ.get("GOOGLE_SAFE_BROWSING_KEY")
            gsb_result = get_google_safe_browsing_report(target, google_api_key)
            result["google_safe_browsing"] = gsb_result

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scan error: {str(e)}")


@app.get("/api/detect-type")
async def detect_type(value: str):
    """Detect if input is URL or IP"""
    return {"type": detect_input_type(value)}


@app.get("/api/script-content")
async def get_script_content(url: str):
    """Fetch the content of a script URL"""
    if not url or not url.strip():
        raise HTTPException(status_code=400, detail="Please provide a script URL")
    
    try:
        result = fetch_script_content(url.strip())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching script: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
