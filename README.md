# 🔍 URL/IP Threat Intelligence Scanner

A FastAPI-based cybersecurity project for scanning URLs and IP addresses using multiple threat intelligence platforms.

---

## 🚀 Overview

This project is a **URL and IP scanner API** built with **Python + FastAPI**.
It aggregates threat intelligence data from:

* VirusTotal
* AbuseIPDB
* AlienVault OTX
* URLScan.io
* Google Safe Browsing

The API collects security signals from these platforms and returns a structured response indicating whether a URL or IP address is malicious, suspicious, or clean.

---

## 🧠 How It Works

When a user submits a URL or IP:

1. The FastAPI backend receives the request.
2. It queries multiple threat intelligence APIs.
3. Each platform returns its analysis (reputation, malware detection, blacklist status, etc.).
4. The system aggregates results into a unified response.
5. The user receives a JSON report with all findings.

---

# 🛠️ Installation Guide (From Scratch)

Follow these steps exactly.

---

## 1️⃣ Open Your Laptop

* Power on your laptop.
* Open **Terminal** (Mac/Linux) or **Command Prompt / PowerShell** (Windows).

---

## 2️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/url-ip-scanner.git
cd URLShield
```

---

## 3️⃣ Create Virtual Environment (MANDATORY)

### Windows:

```bash
python -m venv venv
venv\Scripts\activate
```

### Mac/Linux:

```bash
python3 -m venv venv
source venv/bin/activate
```

You should now see `(venv)` in your terminal.

---

## 4️⃣ Install Requirements

```bash
pip install -r requirements.txt
```

If pip is outdated:

```bash
python -m pip install --upgrade pip
```

---

## 5️⃣ Create `.env` File

Inside the project root directory:

### Windows:

```bash
type nul > .env
```

### Mac/Linux:

```bash
touch .env
```

Now open `.env` in a text editor and paste:

```
VT_API_KEY=your_virustotal_key
ABUSEIPDB_KEY=your_abuseipdb_key
ALIENVAULT_KEY=your_alienvault_key
URLSCAN_KEY=your_urlscan_key
GOOGLE_SAFE_BROWSING_KEY=your_google_safe_browsing_key
```

⚠️ **Never hardcode API keys inside source code. Always use `.env`.**

---

# 🔑 How to Get API Keys

You must create accounts on these platforms:

* VirusTotal
* AbuseIPDB
* AlienVault OTX
* URLScan.io
* Google Cloud Console (Safe Browsing API)

After registration:

* Generate API key
* Paste into `.env`

---

# ▶️ Running the Application

Start FastAPI server:

```bash
uvicorn app.main:app --reload
```

Server will run on:

```
http://127.0.0.1:8000
```

Swagger documentation:

```
http://127.0.0.1:8000/docs
```

---

# 📡 API Endpoints

### 🔎 Scan URL

```
POST /scan/url
```

Request body:

```json
{
  "url": "http://example.com"
}
```

---

### 🌐 Scan IP

```
POST /scan/ip
```

Request body:

```json
{
  "ip": "8.8.8.8"
}
```

---

# 🧪 Example Response

```json
{
  "target": "example.com",
  "virustotal": {
    "malicious": 2,
    "suspicious": 1
  },
  "abuseipdb": {
    "abuseConfidenceScore": 45
  },
  "alienvault": {
    "reputation": 3
  },
  "urlscan": {
    "verdict": "suspicious"
  },
  "google_safe_browsing": {
    "threat_found": false
  }
}
```

---

# 📚 requirements.txt Example

```
fastapi
uvicorn
requests
python-dotenv
pydantic
```

---

# 🔐 Security Best Practices

* Never commit `.env` file.
* Add `.env` to `.gitignore`.
* Rate-limit external API calls.
* Handle API failures gracefully.
* Log suspicious activity.
* Cache results to reduce API quota usage.


# ⚡ Quick Cheat Sheet

| Task                 | Command                           |
| -------------------- | --------------------------------- |
| Create venv          | `python -m venv venv`             |
| Activate (Win)       | `venv\Scripts\activate`           |
| Activate (Mac/Linux) | `source venv/bin/activate`        |
| Install deps         | `pip install -r requirements.txt` |
| Run server           | `uvicorn app.main:app --reload`   |
| Swagger docs         | `/docs`                           |

---


**Author:** Samir Jani
**Project Type:** Cybersecurity / Threat Intelligence
**Stack:** Python, FastAPI, REST APIs
