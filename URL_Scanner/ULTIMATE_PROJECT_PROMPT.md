# 🎯 ULTIMATE PROJECT PROMPT: NetSight - Advanced URL/IP Security Scanner

## 📋 Project Overview

Create **NetSight**, a comprehensive web-based URL and IP security scanner that performs deep reconnaissance, security analysis, and threat assessment. This is a professional-grade security tool with a modern, dark-themed UI that provides detailed insights into web targets including DNS records, WHOIS data, SSL certificates, security headers, content discovery, and risk scoring.

---

## 🎨 Design Philosophy

- **Dark Theme**: Professional cybersecurity aesthetic with dark blue/black background (#0b1220)
- **Modern UI**: Clean, card-based layout with smooth animations
- **Interactive Elements**: Expandable sections, pagination, draggable logo
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Data-Rich**: Display comprehensive security information in an organized manner
- **Visual Feedback**: Loading spinners, color-coded risk levels, animated gauges

---

## 🛠️ Tech Stack

### **Backend**
- **Framework**: FastAPI 0.109.0
- **Server**: Uvicorn 0.27.0
- **Language**: Python 3.10+

### **Core Security Libraries**
- **dnspython** 2.5.0 - DNS record queries (A, AAAA, MX, NS, TXT, CNAME)
- **python-whois** 0.9.27 - WHOIS domain registration data
- **ipwhois** 1.2.0 - IP address WHOIS and RDAP lookups
- **requests** 2.31.0 - HTTP requests and web scraping
- **beautifulsoup4** 4.12.3 - HTML parsing and content extraction
- **tldextract** 5.1.1 - Domain extraction and subdomain enumeration
- **python-dateutil** 2.8.2 - Date parsing for certificates and WHOIS
- **geoip2** 4.8.0 - IP geolocation (optional)

### **Additional Dependencies**
- **python-multipart** 0.0.6 - Form data handling
- **jinja2** 3.1.3 - Template rendering (if needed)

### **Frontend**
- **Pure HTML5/CSS3/JavaScript** - No frameworks, vanilla JS
- **Modern CSS**: Grid, Flexbox, animations, custom properties
- **Responsive Design**: Media queries for mobile/tablet/desktop

---

## 🎯 Core Features & Functionality

### **1. Input Detection & Normalization**
- **Auto-detect** whether input is a URL or IP address
- **URL Normalization**: Handle URLs with/without schemes (http://, https://)
- **IP Validation**: Validate IPv4 addresses using `ipaddress` module
- **Host Extraction**: Extract hostname from complex URLs with paths, ports, authentication

### **2. DNS Analysis**
- Query and display **6 DNS record types**: A, AAAA, MX, NS, TXT, CNAME
- **Reverse DNS lookup** for IP addresses
- **Name server IP resolution** - Resolve IPs for all name servers
- **DNS timeout handling** - 3-5 second timeouts per query
- Display all records in organized format

### **3. WHOIS & Domain Registration**
- **Domain WHOIS lookup** with comprehensive data extraction:
  - Domain name, registrar, registrar URL, registrar IANA ID
  - Registration date, expiration date, last updated date
  - Domain status (clientTransferProhibited, etc.)
  - DNSSEC status
  - Name servers with IP resolution
  - Registrant information (name, org, country, email, phone, address)
  - Administrative contact (name, email, phone)
  - Technical contact (email)
  - Registrar abuse contact (email, phone)
- **Raw WHOIS parsing** using regex for fields not in structured output
- **Date normalization** - Convert datetime objects to ISO format
- **Error handling** for domains without WHOIS data

### **4. SSL/TLS Certificate Analysis**
- **Certificate retrieval** via SSL socket connection (port 443)
- **Certificate details**:
  - Subject (CN, O, OU)
  - Issuer (CA information)
  - Valid from (notBefore)
  - Valid until (notAfter)
  - Serial number
- **Certificate expiration warnings** - Flag certs expiring within 30 days
- **TLS version probing** - Test support for TLS 1.0, 1.1, 1.2, 1.3
- **Timeout handling** - 5-second connection timeout

### **5. Security Headers Analysis**
Analyze and categorize **6 critical security headers**:

1. **Strict-Transport-Security (HSTS)**
   - Check presence
   - Validate max-age >= 15768000 (6 months)
   - Flag misconfiguration if max-age too low

2. **Content-Security-Policy (CSP)**
   - Check presence
   - Flag if contains `unsafe-inline` or `default-src *`

3. **X-Frame-Options**
   - Check for DENY or SAMEORIGIN

4. **X-Content-Type-Options**
   - Validate value is `nosniff`

5. **Referrer-Policy**
   - Check presence

6. **Permissions-Policy / Feature-Policy**
   - Check for either header

**Status categories**: `present`, `missing`, `misconfigured`

### **6. Port Scanning**
- **Common ports**: 21 (FTP), 22 (SSH), 23 (Telnet), 25 (SMTP), 53 (DNS), 80 (HTTP), 443 (HTTPS), 3306 (MySQL), 3389 (RDP)
- **For URLs**: Scan ports 80, 443
- **For IPs**: Scan ports 22, 80, 443, 3306
- **Banner grabbing** - Attempt to read service banners (1024 bytes, 1-second timeout)
- **Service identification** - Use `socket.getservbyport()` to identify service names
- **Connection timeout**: 3 seconds per port
- Display: Port number, Open/Closed status, Service name, Banner text

### **7. Content Discovery & Web Scraping**
- **HTTP/HTTPS auto-detection** - Try HTTPS first, fallback to HTTP
- **Redirect chain tracking** - Capture all redirects with `allow_redirects=True`
- **Final URL detection** - Track where the URL ultimately resolves
- **HTTPS enforcement detection** - Check if HTTP redirects to HTTPS
- **HTML parsing** with BeautifulSoup:
  - **Links extraction** - All `<a href>` tags, convert to absolute URLs
  - **Scripts extraction** - All `<script src>` tags with absolute URLs
  - **Iframes extraction** - All `<iframe src>` tags
  - **Embeds extraction** - `<embed>` and `<object>` tags
- **Response headers** - Capture all HTTP response headers
- **robots.txt fetching** - Try HTTPS then HTTP, return content if found

### **8. Script Analysis & Fingerprinting**
For each discovered script URL:
- **Fetch script content** via separate API endpoint `/api/script-content`
- **Calculate hashes**: MD5, SHA1, SHA256
- **File size** - Display in bytes and formatted (B, kB, MB)
- **Format detection**:
  - By extension (.js, .css, .json)
  - By content analysis (detect `function`, `const`, `let`, `var` for JS)
- **Script metadata**:
  - Introduced by (ScriptElement, inline, etc.)
  - Embedded status (true/false)
  - First seen / Last seen dates
  - Times seen counter
- **Expandable UI** - Click to view full details including code preview

### **9. Technology Detection**
Detect technologies from HTML content and headers:

**Server-side**:
- Server header (Apache, Nginx, IIS, etc.)
- X-Powered-By header (PHP, ASP.NET, etc.)
- X-Generator header

**CMS Detection**:
- WordPress (`/wp-content/`, `wp-`)
- Joomla (`joomla`, `/components/`)
- Drupal (`drupal`, `/sites/`)

**JavaScript Frameworks**:
- React (`react`, `reactdom`)
- Angular (`angular`, `ng-app`)
- Vue.js (`vue`, `vue.js`)
- jQuery (`jquery`)
- Backbone.js, Ember.js, Svelte, Prototype, MooTools, Dojo

**Other**:
- Meta generator tag
- Cookie analysis
- Final URL tracking

### **10. IP Geolocation & ASN Lookup**
- **ip-api.com integration** - Free geolocation API
  - Country, region, city
  - ISP and organization
  - AS number and description
  - Query IP
- **IPWhois RDAP lookup**:
  - ASN (Autonomous System Number)
  - ASN description
  - Network information (CIDR, range)
- **Hosting provider identification** from ISP/org data
- **Error handling** for API failures

### **11. Email Security (SPF, DMARC, DKIM)**

**SPF (Sender Policy Framework)**:
- Query TXT records for domain
- Look for records containing `v=spf1`
- Return presence status and full record

**DMARC (Domain-based Message Authentication)**:
- Query `_dmarc.{domain}` TXT records
- Look for records containing `v=DMARC1`
- Return presence status and full record

**DKIM (DomainKeys Identified Mail)**:
- Test common selectors: `default`, `selector1`, `google`, `mail`, `smtp`, `s1`
- Query `{selector}._domainkey.{domain}` TXT records
- Return which selectors have DKIM configured

### **12. DNSBL (DNS Blacklist) Checking**
- **Reverse IP format** - Convert `1.2.3.4` to `4.3.2.1`
- **Query blacklists**:
  - zen.spamhaus.org
  - bl.spamcop.net
  - dnsbl.sorbs.net
- **Return**: Listed status (true/false) and details of positive matches
- **Timeout**: 3 seconds per blacklist query

### **13. Subdomain Enumeration**
- **Wordlist-based discovery** using common prefixes:
  - `www`, `mail`, `ftp`, `m`, `api`, `dev`, `test`, `staging`, `admin`, `blog`, `shop`, `webmail`, `ns1`, `ns2`, `smtp`, `pop`, `dns`, `mx`, `cdn`
- **DNS A record queries** for each subdomain candidate
- **Timeout**: 3 seconds per query
- **Return**: List of discovered subdomains with valid A records

### **14. Risk Scoring Algorithm**
Calculate a **0-100 risk score** based on multiple factors:

**Scoring Rules**:
- **+25 points**: No HTTPS / Port 443 closed
- **+15 points**: Missing or unreachable TLS certificate
- **+10 points**: Certificate expiring within 30 days
- **+5 points**: robots.txt missing
- **+20 points**: Flash/SWF embed found
- **+3 points**: Admin/login pages exposed in links
- **+40 points**: IP listed on DNSBL
- **+10 points**: Domain age < 90 days

**Risk Levels**:
- **0-19**: Minimal
- **20-39**: Low
- **40-59**: Medium
- **60-79**: High
- **80-100**: Critical

**Output**:
- Numeric score
- Risk level label
- Top 5 risk factors (deduplicated)

### **15. Security Findings Generator**
Generate actionable security findings with:
- **Title** - Brief description
- **Severity** - Low, Medium, High, Critical
- **Evidence** - Specific data supporting the finding
- **Why** - Explanation of the security impact
- **Fix** - Remediation recommendation

**Finding Categories**:
- Missing/invalid TLS certificates
- Certificate expiration warnings
- Missing security headers
- Misconfigured security headers
- Exposed admin/login pages
- DNSBL listings
- Young domain age
- Open SSH ports
- Flash/SWF embeds

### **16. Name Server Reputation**
- **Resolve IPs** for all name servers
- **DNSBL check** for each name server IP
- **Return**: Mapping of name servers to IPs and blacklist status

### **17. Reputation Analysis**
Combine multiple signals:
- **DNSBL status** for IP addresses
- **Domain age** from WHOIS (flag if < 90 days)
- **Registrar information**
- **Malicious reports flag** - Set to true if any red flags
- **Notes array** - Human-readable warnings

---

## 🎨 Frontend Features

### **UI Components**

1. **Header Section**
   - **Draggable logo** - SVG globe icon that can be dragged with mouse or moved with arrow keys
   - Title: "NetSight — URL / IP Scanner"
   - Subtitle with instructions
   - Gradient blue circular background (#1f6feb to #388bfd)

2. **Search Section**
   - Text input with autocomplete from past searches
   - "Scan" button
   - Enter key support
   - **localStorage integration** - Save last 10 searches

3. **Loading State**
   - Animated spinner (rotating border)
   - "Scanning — this may take a few seconds" message

4. **Error Display**
   - Red-themed error card
   - Display API error messages

5. **Results Section** (Card-based layout)

   **A. Scan Complete Banner**
   - Green checkmark icon
   - "Scan complete — detected: URL/IP" message

   **B. Target Summary Card**
   - Two-column grid layout
   - Display: Type, Host, Normalized Target, Scan Timestamp
   - Display: IP Geolocation, ISP, Hosting Provider

   **C. Security Score Card**
   - **Animated gauge** - Semicircular gradient (green → yellow → red)
   - **Rotating needle** - Animates to score position (0-100)
   - **Score display** - Large number + risk level label
   - **Security badges** - SSL Cert status, Headers count, DNSSEC status
   - **Risk factors list** - Top 3 risk factors with warning icons

   **D. DNS Records Card**
   - Display all DNS record types (A, AAAA, MX, NS, TXT, CNAME)
   - Final destination URL
   - Redirect chain (if multiple redirects)
   - HTTPS forced indicator (Yes/No)

   **E. WHOIS / Registration Card**
   - Registrar, registration dates, expiration, status
   - DNSSEC status
   - Name servers with IP addresses
   - Registrant, admin, technical contact info
   - Abuse contact information

   **F. Content Discovery Card**
   - **Two-column layout**:
     - **Left**: Links found with count and pagination
     - **Right**: Scripts, iframes, subdomains
   - **Pagination** - 10 items per page with Prev/Next buttons
   - **Expandable scripts** - Click to view details:
     - Resource information (introduced by, embedded, first/last seen)
     - File size and format
     - MD5, SHA1, SHA256 hashes
     - Code preview (first 50 lines, toggle to show all)
     - Copy code button
   - **Links open in new tab** - All links are clickable

   **G. Email Security Card**
   - SPF status and record
   - DMARC status and record
   - DKIM selectors tested and results

   **H. Infrastructure & Risk Analysis Card**
   - **Port Reachability Table** - Port, Open status, Service, Banner
   - **Target Technologies** - Detected CMS, frameworks, server software
   - **Response Headers** - Paginated list of all HTTP headers

6. **Download JSON Button**
   - Full-width green button
   - Downloads complete scan results as JSON file

### **Pagination System**
- **Global state management** for 5 lists: links, scripts, iframes, subdomains, headers
- **10 items per page** default
- **Prev/Next buttons** with disabled state
- **Page numbers** with ellipsis for large datasets
- **Active page highlighting**

### **Interactive Features**
- **Draggable logo** - Mouse drag or keyboard arrow keys
- **Expandable script details** - Click to expand/collapse
- **Code preview toggle** - Show first 50 lines or full code
- **Copy to clipboard** - Copy script code
- **Past searches autocomplete** - HTML5 datalist with localStorage

### **Animations**
- **Fade-in** for results section
- **Slide-down** for expanded script details
- **Rotating spinner** for loading state
- **Gauge needle rotation** - Smooth 0.5s transition
- **Hover effects** on buttons and links

### **Color Scheme**
- **Background**: #0b1220 (dark blue-black)
- **Cards**: #0f1724 (slightly lighter)
- **Borders**: #1f2937, #30363d (dark gray)
- **Primary**: #1f6feb (blue)
- **Primary hover**: #388bfd (lighter blue)
- **Text**: #e6eef8 (light gray-white)
- **Muted text**: #94a3b8 (gray)
- **Success**: #16a34a (green)
- **Warning**: #f59e0b (orange)
- **Error**: #ef4444 (red)

### **Typography**
- **Font**: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif
- **H1**: 2.5rem, blue (#1f6feb)
- **H2**: 1.3rem, white
- **H3**: 1rem, gray
- **Body**: 1rem, light gray

### **Responsive Design**
- **Desktop**: Two-column grids for summary and content
- **Mobile** (< 900px): Single column layout, stacked elements
- **Flexible search bar**: 100% width on mobile, 400px on desktop

---

## 📁 Project Structure

```
URL_Scanner/
├── main.py                 # FastAPI application entry point
├── scanner.py              # Core scanning logic and functions
├── requirements.txt        # Python dependencies
├── static/
│   ├── index.html         # Main HTML page
│   ├── script.js          # Frontend JavaScript logic
│   └── styles.css         # CSS styling
├── .venv/                 # Virtual environment (not in repo)
└── __pycache__/           # Python cache (not in repo)
```

---

## 🔧 Implementation Details

### **Backend Architecture (main.py)**

**FastAPI Application Setup**:
```python
app = FastAPI(title="NetSight Scanner API", description="URL/IP Scanner built with FastAPI")
```

**Static Files Mounting**:
- Determine base directory (works with both `python main.py` and `uvicorn`)
- Mount `/static` directory for serving HTML/CSS/JS
- Fallback to current working directory if needed

**API Endpoints**:

1. **GET /** - Serve main HTML page
   - Read `static/index.html` if exists
   - Fallback to inline HTML with basic UI
   - Response: HTMLResponse

2. **POST /api/scan** - Main scanning endpoint
   - Request body: `{"target": "example.com or 1.2.3.4"}`
   - Validate target is not empty
   - Call `detect_input_type()` to determine URL vs IP
   - Call `scan_target()` with target and type
   - Return: JSON with complete scan results
   - Error handling: 400 for invalid input, 500 for scan errors

3. **GET /api/detect-type?value={input}** - Detect input type
   - Query parameter: `value`
   - Return: `{"type": "url" or "ip"}`

4. **GET /api/script-content?url={script_url}** - Fetch script content
   - Query parameter: `url` (script URL)
   - Validate URL is not empty
   - Call `fetch_script_content(url)`
   - Return: JSON with content, size, hashes, format
   - Error handling: 400 for missing URL, 500 for fetch errors

**Server Execution**:
```python
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### **Core Scanning Logic (scanner.py)**

**Key Functions**:

1. **`detect_input_type(value: str) -> str`**
   - Strip whitespace
   - Remove http:// or https:// prefix
   - Extract host (before first `/`)
   - Try `ipaddress.ip_address()` - if succeeds, return `'ip'`
   - Otherwise return `'url'`

2. **`normalize_host(value: str) -> str`**
   - Remove scheme (http://, https://)
   - Extract host before first `/`
   - Remove authentication (`user:pass@`)
   - Remove IPv6 brackets `[` `]`
   - Return clean hostname

3. **`check_security_headers(headers: dict) -> dict`**
   - Convert headers to lowercase keys
   - Check each of 6 security headers
   - Parse HSTS max-age with regex
   - Detect CSP misconfigurations
   - Validate X-Content-Type-Options is `nosniff`
   - Return dict with status for each header

4. **`get_dns_records(domain: str) -> dict`**
   - Create DNS resolver
   - Query 6 record types: A, AAAA, MX, NS, TXT, CNAME
   - 5-second lifetime per query
   - Return dict mapping record type to list of strings
   - Empty list if query fails

5. **`get_whois(domain: str) -> dict`**
   - Call `whois.whois(domain)`
   - Extract structured fields (domain_name, registrar, dates, status, name_servers, emails)
   - Parse raw WHOIS text with regex for:
     - Registrar IANA ID
     - Abuse email and phone
     - Domain status list
     - DNSSEC
   - Normalize dates to ISO format
   - Resolve name server IPs
   - Return comprehensive dict with all WHOIS data + raw text

6. **`get_cert_info(host: str, port: int = 443) -> dict`**
   - Create default SSL context
   - Connect to host:port with 5-second timeout
   - Wrap socket with SSL
   - Get peer certificate
   - Extract: subject, issuer, notBefore, notAfter, serialNumber
   - Return `{'ok': True, 'cert': {...}}` or `{'ok': False, 'error': ...}`

7. **`probe_tls_versions(host: str, port: int = 443) -> dict`**
   - Test TLS 1.0, 1.1, 1.2, 1.3
   - Create SSLContext for each version
   - Set minimum and maximum version to same value
   - Disable hostname check and cert verification
   - Attempt connection with 5-second timeout
   - Return dict mapping version to 'supported' or 'not-supported'

8. **`check_ports(host: str, ports=(...)) -> dict`**
   - Default ports: (21, 22, 23, 25, 53, 80, 443, 3306, 3389)
   - For each port:
     - Try socket connection with 3-second timeout
     - If successful, try to read 1024-byte banner (1-second timeout)
     - Get service name with `socket.getservbyport()`
   - Return dict: `{port: {'open': bool, 'service': str, 'banner': str}}`

9. **`reverse_dns_lookup(ip: str) -> str`**
   - Call `socket.gethostbyaddr(ip)`
   - Return hostname or None on failure

10. **`check_email_security(domain: str) -> dict`**
    - **SPF**: Query TXT records, find record with `v=spf1`
    - **DMARC**: Query `_dmarc.{domain}` TXT records, find `v=DMARC1`
    - **DKIM**: Test 6 selectors, query `{selector}._domainkey.{domain}`
    - Return dict with presence status and full records

11. **`fetch_script_content(script_url: str) -> dict`**
    - GET request with 10-second timeout
    - User-Agent: Mozilla/5.0
    - If status 200:
      - Store content
      - Calculate size and format (B, kB, MB)
      - Calculate MD5, SHA1, SHA256 hashes
      - Detect format by extension or content analysis
    - Return dict with all metadata

12. **`fetch_html_and_assets(host: str) -> dict`**
    - Try HTTPS first, then HTTP
    - Use `requests.Session()` with `allow_redirects=True`
    - 8-second timeout
    - Capture redirect chain
    - Parse HTML with BeautifulSoup:
      - Extract all `<a href>` links (convert to absolute URLs)
      - Extract all `<script src>` URLs
      - Extract all `<iframe src>` URLs
      - Extract all `<embed>` and `<object>` URLs
    - Store script details (introduced_by, embedded, first_seen, last_seen, times_seen)
    - Return dict with HTML, headers, links, scripts, iframes, embeds, redirect chain

13. **`check_dnsbl(ip: str) -> dict`**
    - Reverse IP octets: `1.2.3.4` → `4.3.2.1`
    - Query 3 blacklists: zen.spamhaus.org, bl.spamcop.net, dnsbl.sorbs.net
    - 3-second lifetime per query
    - Return `{'listed': bool, 'details': [...]}`

14. **`get_reputation(domain: str = None, ip: str = None) -> dict`**
    - If IP: Check DNSBL, set malicious flag if listed
    - If domain: Get WHOIS, calculate domain age, flag if < 90 days
    - Return dict with malicious_reports flag and notes

15. **`detect_technologies(html: str, headers: dict, final_url: str) -> dict`**
    - Extract Server and X-Powered-By headers
    - Parse meta generator tag
    - Detect CMS: WordPress, Joomla, Drupal (by HTML patterns)
    - Detect JS frameworks: React, Angular, Vue, jQuery, Backbone, Ember, Svelte, etc.
    - Return dict with all detected technologies

16. **`find_subdomains(domain: str, wordlist=None) -> list`**
    - Default wordlist: www, mail, ftp, m, api, dev, test, staging, admin, blog, shop, webmail, ns1, ns2, smtp, pop, dns, mx, cdn
    - For each prefix, query `{prefix}.{domain}` A records
    - 3-second timeout per query
    - Return list of discovered subdomains

17. **`compute_risk_score(scan: dict) -> dict`**
    - Initialize score = 0
    - Add points based on findings (see scoring rules above)
    - Cap at 100
    - Determine risk level (Minimal, Low, Medium, High, Critical)
    - Return top 5 unique risk factors

18. **`get_ip_info(ip: str) -> dict`**
    - Query ip-api.com: `http://ip-api.com/json/{ip}?fields=status,message,country,regionName,city,isp,org,as,query`
    - 5-second timeout
    - Query IPWhois RDAP: `IPWhois(ip).lookup_rdap()`
    - Return dict with both API results

19. **`fetch_robots(domain: str) -> dict`**
    - Try HTTPS then HTTP: `{scheme}://{domain}/robots.txt`
    - 5-second timeout
    - If status 200, return URL, status, body
    - Otherwise return `{'found': False}`

20. **`scan_target(value: str, detected_type: str = None) -> dict`**
    - **Main orchestration function**
    - Initialize result dict with input, type, timestamp
    - **If IP**:
      - Get IP info (geolocation, ASN)
      - Check ports (22, 80, 443, 3306)
      - Reverse DNS lookup
      - Get reputation (DNSBL)
      - Generate findings (SSH open, DNSBL listed)
    - **If URL**:
      - Normalize host
      - Get DNS records
      - Fetch HTML and assets (links, scripts, iframes, embeds, redirect chain)
      - Detect technologies
      - Check security headers
      - Get WHOIS
      - Check ports (80, 443)
      - Get SSL cert info and probe TLS versions
      - Fetch robots.txt
      - Get IP info and reverse DNS
      - Get reputation (DNSBL + domain age)
      - Check email security (SPF, DMARC, DKIM)
      - Get name server reputation
      - Find subdomains
      - Compute risk score
      - Generate findings (TLS issues, missing headers, exposed admin pages, DNSBL, young domain)
    - Return complete result dict

### **Frontend Logic (script.js)**

**Global State**:
```javascript
const paginationState = {
    links: { currentPage: 1, itemsPerPage: 10, data: [] },
    scripts: { currentPage: 1, itemsPerPage: 10, data: [] },
    iframes: { currentPage: 1, itemsPerPage: 10, data: [] },
    subdomains: { currentPage: 1, itemsPerPage: 10, data: [] },
    headers: { currentPage: 1, itemsPerPage: 10, data: [] }
};

let scriptDetailsCache = {};
let expandedScriptUrl = null;
let scanResult = null;
```

**localStorage for Past Searches**:
- Key: `'netsight_past_searches'`
- Max: 10 searches
- Functions: `getPastSearches()`, `savePastSearch(query)`, `updateSearchSuggestions()`
- Populate HTML5 `<datalist>` for autocomplete

**Draggable Logo**:
- Mouse drag: `mousedown`, `mousemove`, `mouseup` events
- Keyboard: Arrow key navigation with `keydown` event
- Transform: `translate(${posX}px, ${posY}px)`

**Main Scan Function**:
```javascript
async function performScan() {
    // Get target from input
    // Show loading, hide results/errors
    // POST to /api/scan
    // Store result in scanResult
    // Call displayResults(scanResult)
    // Save to past searches
    // Error handling
}
```

**Display Functions**:
- `displayResults(data)` - Main orchestrator
- `displayDNSRecords(data)` - DNS section
- `displayWHOIS(data)` - WHOIS section
- `displayContentDiscovery(data)` - Links, scripts, iframes, subdomains
- `displayEmailSecurity(data)` - SPF, DMARC, DKIM
- `displayInfrastructure(data)` - Ports, tech stack, headers

**Pagination**:
- `renderPaginatedList(listName, data, renderFn)` - Generic pagination renderer
- `changePage(listName, pageNum)` - Page navigation
- Prev/Next buttons with disabled state
- Page numbers with ellipsis

**Script Details**:
- `toggleScriptDetails(scriptUrl)` - Expand/collapse
- `fetchScriptDetails(scriptUrl)` - Async fetch from `/api/script-content`
- `renderScriptDetails(data)` - Render details card with hashes, size, code preview
- Code toggle: Show first 50 lines or full code
- Copy to clipboard functionality

**Gauge Animation**:
```javascript
const rotation = (score / 100) * 180 - 90;
needle.style.transform = `translateX(-50%) rotate(${rotation}deg)`;
```

**Download JSON**:
```javascript
const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'netsight_scan.json';
a.click();
```

---

## 🚀 Setup & Installation

### **1. Create Project Directory**
```bash
mkdir URL_Scanner
cd URL_Scanner
```

### **2. Create Virtual Environment**
```bash
python -m venv .venv
```

### **3. Activate Virtual Environment**
- **Windows**: `.venv\Scripts\activate`
- **Linux/Mac**: `source .venv/bin/activate`

### **4. Install Dependencies**
```bash
pip install -r requirements.txt
```

### **5. Create Directory Structure**
```bash
mkdir static
```

### **6. Create Files**
- `main.py` - FastAPI application
- `scanner.py` - Scanning logic
- `requirements.txt` - Dependencies
- `static/index.html` - Frontend HTML
- `static/script.js` - Frontend JavaScript
- `static/styles.css` - Frontend CSS

### **7. Run Application**
```bash
python main.py
```
Or:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### **8. Access Application**
Open browser: `http://localhost:8000`

---

## 🧪 Testing Scenarios

### **Test Cases**:

1. **URL Scan**:
   - Input: `example.com`
   - Input: `https://www.google.com`
   - Input: `http://github.com/user/repo`

2. **IP Scan**:
   - Input: `8.8.8.8`
   - Input: `1.1.1.1`

3. **Edge Cases**:
   - URL with port: `example.com:8080`
   - URL with path: `example.com/path/to/page`
   - URL with auth: `user:pass@example.com`
   - IPv6: `[2001:4860:4860::8888]`

4. **Error Handling**:
   - Empty input
   - Invalid domain
   - Unreachable host
   - Timeout scenarios

---

## 📊 Expected Output Structure

```json
{
  "input": "example.com",
  "type": "url",
  "scan_timestamp": "2024-01-15T10:30:00.123456",
  "host": "example.com",
  "normalized_target": "example.com",
  "scope": "Active (safe)",
  
  "dns": {
    "A": ["93.184.216.34"],
    "AAAA": ["2606:2800:220:1:248:1893:25c8:1946"],
    "MX": ["0 ."],
    "NS": ["a.iana-servers.net.", "b.iana-servers.net."],
    "TXT": ["v=spf1 -all"],
    "CNAME": []
  },
  
  "whois": {
    "whois": true,
    "domain": "EXAMPLE.COM",
    "registered_on": "1995-08-14T04:00:00",
    "expires_on": "2024-08-13T04:00:00",
    "registrar": "RESERVED-Internet Assigned Numbers Authority",
    "name_servers": ["A.IANA-SERVERS.NET", "B.IANA-SERVERS.NET"],
    "name_server_ips": {
      "A.IANA-SERVERS.NET": ["199.43.135.53"],
      "B.IANA-SERVERS.NET": ["199.43.133.53"]
    }
  },
  
  "ssl": {
    "ok": true,
    "cert": {
      "subject": [[["commonName", "www.example.org"]]],
      "issuer": [[["countryName", "US"]]],
      "notBefore": "Nov 28 00:00:00 2023 GMT",
      "notAfter": "Dec 2 23:59:59 2024 GMT",
      "serialNumber": "0FD078DD48F1A2BD4D0F2BA96B6038FE"
    }
  },
  
  "tls_probe": {
    "TLSVersion.TLSv1_3": "supported",
    "TLSVersion.TLSv1_2": "supported",
    "TLSVersion.TLSv1_1": "not-supported",
    "TLSVersion.TLSv1": "not-supported"
  },
  
  "security_headers": {
    "strict-transport-security": {"status": "present", "value": "max-age=31536000"},
    "content-security-policy": {"status": "missing"},
    "x-frame-options": {"status": "present", "value": "DENY"},
    "x-content-type-options": {"status": "present", "value": "nosniff"},
    "referrer-policy": {"status": "missing"},
    "permissions-policy": {"status": "missing"}
  },
  
  "ports": {
    "80": {"open": true, "service": "http", "banner": null},
    "443": {"open": true, "service": "https", "banner": null}
  },
  
  "links": ["https://www.iana.org/domains/example", ...],
  "scripts": ["https://example.com/script.js", ...],
  "script_details": {
    "https://example.com/script.js": {
      "url": "https://example.com/script.js",
      "introduced_by": "ScriptElement",
      "embedded": true,
      "first_seen": "2024-01-15",
      "last_seen": "2024-01-15",
      "times_seen": 1
    }
  },
  "iframes": [],
  "embeds": [],
  
  "final_url": "https://example.com/",
  "redirect_chain": ["https://example.com/"],
  
  "tech": {

    "database":"sql",
    "languages":"python",
    "frameworks":"django",
    "server": "nginx",
    "cms": ["WordPress"],
    "js_frameworks": ["jQuery", "React"]
  },
  
  "email_security": {
    "spf": true,
    "spf_record": "v=spf1 -all",
    "dmarc": false,
    "dkim": {
      "default": false,
      "selector1": false,
      "google": false
    }
  },
  
  "ip_info": {
    "ip-api": {
      "country": "United States",
      "regionName": "California",
      "city": "Los Angeles",
      "isp": "Example ISP",
      "org": "Example Organization",
      "as": "AS15133 Example",
      "query": "93.184.216.34"
    },
    "ipwhois": {
      "asn": "AS15133",
      "asn_description": "EDGECAST, US",
      "network": {...}
    }
  },
  
  "reputation": {
    "malicious_reports": false,
    "dnsbl": {"listed": false, "details": []},
    "domain_age_days": 10500,
    "notes": []
  },
  
  "subdomains": ["www.example.com", "mail.example.com"],
  
  "risk_score": 15,
  "risk_level": "Minimal",
  "top_risk_factors": ["robots.txt missing", "CSP header missing"],
  
  "findings": [
    {
      "title": "Missing header: content-security-policy",
      "severity": "Low",
      "evidence": null,
      "why": "content-security-policy helps mitigate specific risks",
      "fix": "Add content-security-policy with recommended configuration"
    }
  ]
}
```

---

## 🎯 Key Implementation Notes

### **Error Handling**
- **Timeouts**: All network operations have timeouts (3-10 seconds)
- **Try-except blocks**: Wrap all external API calls and network operations
- **Graceful degradation**: If one check fails, continue with others
- **Error messages**: Return user-friendly error messages in API responses

### **Performance Optimization**
- **Parallel DNS queries**: Could be optimized with asyncio (future enhancement)
- **Caching**: Script details cached in frontend to avoid re-fetching
- **Pagination**: Limit displayed items to 10 per page
- **Lazy loading**: Script content fetched only when expanded

### **Security Considerations**
- **Input validation**: Validate all user inputs
- **SSRF protection**: Be cautious with user-provided URLs (consider allowlists for production)
- **Rate limiting**: Consider adding rate limits for production
- **CORS**: Configure CORS if frontend served from different domain
- **Sanitization**: Escape HTML in frontend to prevent XSS

### **Code Quality**
- **Type hints**: Use Python type hints for function parameters and returns
- **Docstrings**: Add docstrings to all functions
- **Comments**: Comment complex logic (WHOIS parsing, risk scoring)
- **Consistent naming**: Use snake_case for Python, camelCase for JavaScript
- **Error logging**: Log errors for debugging (consider using Python logging module)

### **Future Enhancements**
- **Database storage**: Store scan history in SQLite/PostgreSQL
- **User accounts**: Add authentication and user-specific scan history
- **Scheduled scans**: Periodic monitoring of targets
- **Alerts**: Email/webhook notifications for risk changes
- **Export formats**: PDF reports, CSV exports
- **API rate limiting**: Implement rate limiting with Redis
- **Async scanning**: Use asyncio for parallel network operations
- **More DNSBL sources**: Add more blacklist providers
- **Vulnerability scanning**: Integrate CVE databases
- **Screenshot capture**: Add Playwright/Selenium for visual screenshots
- **Comparison mode**: Compare scans over time
- **Dark/light theme toggle**: User preference for UI theme

---

## 📝 Additional Features to Consider

1. **HTTP Transaction Monitoring** (Advanced)
   - Use Playwright/Selenium to capture all HTTP requests
   - Track request/response headers, status codes, sizes
   - Identify third-party resources and CDNs
   - Technology fingerprinting from URLs

2. **Certificate Chain Validation**
   - Verify full certificate chain
   - Check for certificate transparency logs
   - Validate certificate revocation (OCSP, CRL)

3. **Advanced Subdomain Discovery**
   - Certificate transparency logs (crt.sh API)
   - DNS zone transfers (AXFR)
   - Search engine scraping

4. **Malware/Phishing Detection**
   - Google Safe Browsing API integration
   - VirusTotal API for URL/IP reputation
   - PhishTank database lookup

5. **Performance Metrics**
   - Page load time
   - Time to first byte (TTFB)
   - Resource loading waterfall

6. **Compliance Checks**
   - GDPR compliance indicators
   - Cookie consent detection
   - Privacy policy detection

---

## 🎓 Learning Outcomes

By building this project, you will learn:

1. **Backend Development**:
   - FastAPI framework and REST API design
   - Python networking (sockets, SSL, DNS)
   - Web scraping with BeautifulSoup
   - WHOIS and IP geolocation APIs
   - Error handling and validation

2. **Frontend Development**:
   - Vanilla JavaScript (no frameworks)
   - DOM manipulation and event handling
   - Async/await and fetch API
   - localStorage for persistence
   - CSS Grid and Flexbox layouts
   - Animations and transitions

3. **Security Concepts**:
   - DNS records and resolution
   - SSL/TLS certificates and versions
   - Security headers (HSTS, CSP, etc.)
   - Email authentication (SPF, DMARC, DKIM)
   - DNS blacklists (DNSBL)
   - Risk assessment and scoring

4. **DevOps**:
   - Virtual environments
   - Dependency management
   - Running web servers (Uvicorn)
   - Static file serving

---

## 🏆 Success Criteria

Your implementation is successful when:

✅ **Functionality**:
- [ ] Can scan both URLs and IP addresses
- [ ] Displays all DNS record types
- [ ] Shows comprehensive WHOIS data
- [ ] Analyzes SSL/TLS certificates
- [ ] Checks all 6 security headers
- [ ] Scans common ports
- [ ] Discovers links, scripts, iframes
- [ ] Detects technologies (CMS, frameworks)
- [ ] Checks email security (SPF, DMARC, DKIM)
- [ ] Performs DNSBL lookups
- [ ] Enumerates subdomains
- [ ] Calculates risk score (0-100)
- [ ] Generates actionable findings

✅ **UI/UX**:
- [ ] Dark theme with professional design
- [ ] Responsive layout (mobile + desktop)
- [ ] Smooth animations and transitions
- [ ] Draggable logo with keyboard support
- [ ] Pagination for large datasets
- [ ] Expandable script details
- [ ] Past searches autocomplete
- [ ] Loading states and error messages
- [ ] Download JSON report

✅ **Code Quality**:
- [ ] Clean, readable code with comments
- [ ] Proper error handling
- [ ] Type hints in Python
- [ ] Consistent naming conventions
- [ ] No hardcoded values
- [ ] Modular function design

✅ **Performance**:
- [ ] Scans complete within 10-30 seconds
- [ ] No UI freezing during scan
- [ ] Efficient pagination
- [ ] Cached script details

---

## 🎉 Additional notes:
use card like scrollable layout for each module/feature and list only 10 items in one card, and use next and prev buttons for navigation.
add hyperlink to every links , paths ,subomains and open that in new tab on click 

**Good luck building NetSight! 🚀🔒**

---

## 📞 Support & Resources

- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **BeautifulSoup Docs**: https://www.crummy.com/software/BeautifulSoup/bs4/doc/
- **dnspython Docs**: https://dnspython.readthedocs.io/
- **python-whois**: https://pypi.org/project/python-whois/
- **MDN Web Docs**: https://developer.mozilla.org/

---

**Version**: 1.0  
**Last Updated**: 2024  
**Author**: Reverse-engineered from NetSight codebase  
**License**: Educational/Academic Use
