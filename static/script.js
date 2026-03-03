// // Global state for pagination
// const paginationState = {
//     links: { currentPage: 1, itemsPerPage: 10, data: [] },
//     scripts: { currentPage: 1, itemsPerPage: 10, data: [] },
//     iframes: { currentPage: 1, itemsPerPage: 10, data: [] },
//     subdomains: { currentPage: 1, itemsPerPage: 10, data: [] },
//     headers: { currentPage: 1, itemsPerPage: 10, data: [] },
//     httpTransactions: { currentPage: 1, itemsPerPage: 10, data: [] }
// };

// let scriptDetailsCache = {};
// let expandedScriptUrl = null;
// let scanResult = null;

// // Past searches storage (using localStorage) - Cookie-like history system
// const PAST_SEARCHES_KEY = 'netsight_past_searches';
// const MAX_PAST_SEARCHES = 20; // Increased to store more history
// const COOKIE_EXPIRY_DAYS = 30; // History expires after 30 days

// function getPastSearches() {
//     try {
//         const stored = localStorage.getItem(PAST_SEARCHES_KEY);
//         if (!stored) return [];
        
//         const searches = JSON.parse(stored);
//         // Filter out expired entries
//         const now = Date.now();
//         const validSearches = searches.filter(s => {
//             const age = (now - s.timestamp) / (1000 * 60 * 60 * 24); // age in days
//             return age < COOKIE_EXPIRY_DAYS;
//         });
        
//         // Save cleaned list back
//         if (validSearches.length !== searches.length) {
//             localStorage.setItem(PAST_SEARCHES_KEY, JSON.stringify(validSearches));
//         }
        
//         return validSearches;
//     } catch {
//         return [];
//     }
// }

// function savePastSearch(query) {
//     if (!query || query.trim() === '') return;
//     try {
//         let searches = getPastSearches();
//         const now = Date.now();
        
//         // Remove if already exists to avoid duplicates
//         searches = searches.filter(s => s.url.toLowerCase() !== query.toLowerCase());
        
//         // Add new entry with timestamp
//         searches.unshift({
//             url: query,
//             timestamp: now,
//             scanCount: 1
//         });
        
//         // Keep only max items
//         searches = searches.slice(0, MAX_PAST_SEARCHES);
//         localStorage.setItem(PAST_SEARCHES_KEY, JSON.stringify(searches));
//         updateSearchSuggestions();
//         updateHistoryDropdown();
//     } catch {
//         // localStorage not available
//     }
// }

// // Increment scan count for a URL when it's searched again
// function incrementScanCount(query) {
//     try {
//         const searches = getPastSearches();
//         const index = searches.findIndex(s => s.url.toLowerCase() === query.toLowerCase());
//         if (index !== -1) {
//             searches[index].scanCount = (searches[index].scanCount || 1) + 1;
//             searches[index].timestamp = Date.now(); // Update last accessed time
//             localStorage.setItem(PAST_SEARCHES_KEY, JSON.stringify(searches));
//         }
//     } catch {
//         // localStorage not available
//     }
// }

// // Clear all history
// function clearHistory() {
//     try {
//         localStorage.removeItem(PAST_SEARCHES_KEY);
//         updateSearchSuggestions();
//         updateHistoryDropdown();
//     } catch {
//         // localStorage not available
//     }
// }

// // Get formatted date for display
// function formatDate(timestamp) {
//     const date = new Date(timestamp);
//     const now = new Date();
//     const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
//     if (diffDays === 0) return 'Today';
//     if (diffDays === 1) return 'Yesterday';
//     if (diffDays < 7) return `${diffDays} days ago`;
//     if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
//     return date.toLocaleDateString();
// }

// // Update history dropdown with full history UI
// function updateHistoryDropdown() {
//     const historyContainer = document.getElementById('historyDropdown');
//     if (!historyContainer) return;
    
//     const searches = getPastSearches();
    
//     if (searches.length === 0) {
//         historyContainer.innerHTML = '<div class="history-empty">No scan history yet</div>';
//         return;
//     }
    
//     let html = '<div class="history-header"><span>Recent Scans</span><button onclick="clearHistory()" class="clear-history-btn">Clear All</button></div>';
//     html += '<ul class="history-list">';
    
//     searches.forEach((s, index) => {
//         const dateStr = formatDate(s.timestamp);
//         const scanCount = s.scanCount > 1 ? ` (${s.scanCount} scans)` : '';
//         html += `
//             <li class="history-item" onclick="loadFromHistory('${escapeHtml(s.url)}')">
//                 <span class="history-url">${escapeHtml(s.url)}</span>
//                 <span class="history-meta">${dateStr}${scanCount}</span>
//             </li>
//         `;
//     });
    
//     html += '</ul>';
//     historyContainer.innerHTML = html;
// }

// // Load a URL from history
// function loadFromHistory(url) {
//     document.getElementById('targetInput').value = url;
//     performScan();
// }

// function updateSearchSuggestions() {
//     const datalist = document.getElementById('pastSearches');
//     if (!datalist) return;
    
//     const searches = getPastSearches();
//     // Update for autocomplete - use URL property from the object
//     datalist.innerHTML = searches
//         .map(s => `<option value="${escapeHtml(s.url)}">`)
//         .join('');
// }

// // Initialize suggestions on page load
// document.addEventListener('DOMContentLoaded', () => {
//     updateSearchSuggestions();
// });

// const draggableImage = document.getElementById('draggableImage');
// let posX = 0, posY = 0;

// draggableImage.addEventListener('keydown', (e) => {
//     const step = 10;
//     switch(e.key) {
//         case 'ArrowLeft':
//             posX -= step;
//             draggableImage.style.transform = `translate(${posX}px, ${posY}px)`;
//             e.preventDefault();
//             break;
//         case 'ArrowRight':
//             posX += step;
//             draggableImage.style.transform = `translate(${posX}px, ${posY}px)`;
//             e.preventDefault();
//             break;
//         case 'ArrowUp':
//             posY -= step;
//             draggableImage.style.transform = `translate(${posX}px, ${posY}px)`;
//             e.preventDefault();
//             break;
//         case 'ArrowDown':
//             posY += step;
//             draggableImage.style.transform = `translate(${posX}px, ${posY}px)`;
//             e.preventDefault();
//             break;
//     }
// });

// let isDragging = false;
// let startX, startY;

// draggableImage.addEventListener('mousedown', (e) => {
//     isDragging = true;
//     startX = e.clientX - posX;
//     startY = e.clientY - posY;
//     draggableImage.style.cursor = 'grabbing';
// });

// document.addEventListener('mousemove', (e) => {
//     if (!isDragging) return;
//     posX = e.clientX - startX;
//     posY = e.clientY - startY;
//     draggableImage.style.transform = `translate(${posX}px, ${posY}px)`;
// });

// document.addEventListener('mouseup', () => {
//     isDragging = false;
//     draggableImage.style.cursor = 'move';
// });

// document.getElementById('scanBtn').addEventListener('click', performScan);
// document.getElementById('targetInput').addEventListener('keypress', (e) => {
//     if (e.key === 'Enter') performScan();
// });

// async function performScan() {
//     const target = document.getElementById('targetInput').value.trim();
//     if (!target) {
//         showError('Please enter a URL or IP address');
//         return;
//     }

//     hideError();
//     showLoading();
//     hideResults();

//     scriptDetailsCache = {};
//     expandedScriptUrl = null;
//     expandedTransactionUrl = null;

//     try {
//         const response = await fetch('/api/scan', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ target: target })
//         });

//         if (!response.ok) {
//             const error = await response.json();
//             throw new Error(error.detail || 'Scan failed');
//         }

//         scanResult = await response.json();
        
//         if (scanResult.script_details) {
//             scriptDetailsCache = scanResult.script_details;
//         }
        
//         displayResults(scanResult);
//         hideLoading();
//         showResults();
        
//         // Save the search query to past searches
//         savePastSearch(target);
//     } catch (err) {
//         hideLoading();
//         showError(err.message);
//     }
// }

// function displayResults(data) {
//     document.getElementById('scanType').textContent = `Scan complete — detected: ${data.type.toUpperCase()}`;

//     document.getElementById('targetType').textContent = data.type === 'ip' ? 'IP Address' : 'URL / Domain';
//     document.getElementById('targetHost').textContent = data.host || data.input || '—';
//     document.getElementById('normalizedTarget').textContent = data.normalized_target || '—';
//     document.getElementById('scanTimestamp').textContent = data.scan_timestamp || '—';

//     const ipInfo = data.ip_info?.['ip-api'] || {};
//     document.getElementById('geoLocation').textContent = 
//         ipInfo.country ? `${ipInfo.country} — ${ipInfo.regionName || ''} — ${ipInfo.city || ''}` : '—';
//     document.getElementById('isp').textContent = ipInfo.isp || '—';
//     document.getElementById('hosting').textContent = data.hosting_provider || '—';

//     const score = data.risk_score || 0;
//     const level = data.risk_level || 'Unknown';
//     document.getElementById('scoreValue').textContent = score;
//     document.getElementById('scoreLevel').textContent = level;
    
//     const needle = document.getElementById('gaugeNeedle');
//     const rotation = (score / 100) * 180 - 90;
//     needle.style.transform = `translateX(-50%) rotate(${rotation}deg)`;

//     const ssl = data.ssl || {};
//     const sslStatus = ssl.ok ? (ssl.cert?.notAfter || 'Valid') : 'No cert';
//     document.getElementById('sslCert').textContent = sslStatus;

//     const securityHeaders = data.security_headers || {};
//     const missingCount = Object.values(securityHeaders).filter(h => h.status === 'missing').length;
//     document.getElementById('headersBadge').textContent = `${missingCount} Missing`;

//     const dnssec = data.dns?.NS ? 'Active' : 'Unknown';
//     document.getElementById('dnssecBadge').textContent = dnssec;

//     const riskFactors = document.getElementById('riskFactors');
//     const riskList = document.getElementById('riskFactorsList');
//     const factors = data.top_risk_factors || [];
//     if (factors.length > 0) {
//         riskFactors.classList.remove('hidden');
//         riskList.innerHTML = factors.map(f => `<li>${f}</li>`).join('');
//     } else {
//         riskFactors.classList.add('hidden');
//     }

//     displayDNSRecords(data);
//     displayWHOIS(data);
//     displayContentDiscovery(data);
//     displayHTTPTransactions(data);
//     displayEmailSecurity(data);
//     displayInfrastructure(data);

//     document.getElementById('downloadJson').onclick = () => {
//         const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
//         const url = URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = 'netsight_scan.json';
//         a.click();
//         URL.revokeObjectURL(url);
//     };
// }

// function displayDNSRecords(data) {
//     const dns = data.dns || {};
//     const container = document.getElementById('dnsRecords');
    
//     let html = '';
//     const recordTypes = ['A', 'AAAA', 'MX', 'NS', 'TXT', 'CNAME'];
    
//     for (const type of recordTypes) {
//         const records = dns[type] || [];
//         if (records.length > 0) {
//             html += `<div class="kv-pair"><span class="key">${type}:</span></div>`;
//             records.forEach(r => {
//                 // Extract domain/IP for linking
//                 let linkContent = r;
//                 let href = '';
                
//                 if (type === 'A' || type === 'AAAA') {
//                     // IP addresses - link to IP lookup
//                     href = `https://${r}`;
//                 } else {
//                     // Domain names - prepend https:// for linking
//                     const domain = r.split(' ')[0] || r; // Handle MX records with priority
//                     href = `https://${domain}`;
//                 }
                
//                 html += `<div class="kv-pair"><span class="value" style="margin-left: 20px;"><a href="${href}" target="_blank" class="link-item" title="${r}">${r}</a></span></div>`;
//             });
//         }
//     }
    
//     if (!html) {
//         html = '<p style="color: #94a3b8;">No DNS data</p>';
//     }
//     container.innerHTML = html;

//     const finalDest = document.getElementById('finalDestination');
//     if (data.final_url) {
//         finalDest.classList.remove('hidden');
//         document.getElementById('finalUrl').innerHTML = `<a href="${data.final_url}" target="_blank" class="link-item" title="${data.final_url}">${data.final_url}</a>`;
//     } else {
//         finalDest.classList.add('hidden');
//     }

//     const redirect = document.getElementById('redirectChain');
//     const chain = data.redirect_chain || [];
//     if (chain.length > 1) {
//         redirect.classList.remove('hidden');
//         document.getElementById('redirectChainList').innerHTML = chain.map(u => `<li><a href="${u}" target="_blank" class="link-item" title="${u}">${u}</a></li>`).join('');
//     } else {
//         redirect.classList.add('hidden');
//     }

//     let httpsForced = false;
//     if (chain.length > 1) {
//         httpsForced = chain[0].startsWith('http://') && chain.some(u => u.startsWith('https://'));
//     }
//     document.getElementById('httpsForced').textContent = httpsForced ? 'Yes' : 'No';
// }

// function displayWHOIS(data) {
//     const whois = data.whois || {};
//     const container = document.getElementById('whoisRecords');
    
//     if (!whois.whois) {
//         container.innerHTML = `<p style="color: #94a3b8;">${whois.error || 'No WHOIS data found'}</p>`;
//         return;
//     }

//     let html = '';
//     const fields = [
//         ['Registrar', whois.registrar],
//         ['Registrar URL', whois.registrar_url],
//         ['Registered On', whois.registered_on],
//         ['Expires On', whois.expires_on],
//         ['Updated On', whois.updated_on],
//         ['Status', whois.domain_status?.join(', ') || whois.status],
//         ['DNSSEC', whois.dnssec]
//     ];

//     fields.forEach(([key, val]) => {
//         if (val) {
//             // Add hyperlink for Registrar URL
//             if (key === 'Registrar URL' && val) {
//                 html += `<div class="kv-pair"><span class="key">${key}:</span><span class="value"><a href="${val}" target="_blank" class="link-item" title="${val}">${val}</a></span></div>`;
//             } else {
//                 html += `<div class="kv-pair"><span class="key">${key}:</span><span class="value">${val}</span></div>`;
//             }
//         }
//     });

//     const nsIPs = whois.name_server_ips || {};
//     if (Object.keys(nsIPs).length > 0) {
//         html += '<h3>Name server IPs</h3>';
//         for (const [ns, ips] of Object.entries(nsIPs)) {
//             html += `<div class="kv-pair"><span class="value">${ns}: ${ips.join(', ') || '—'}</span></div>`;
//         }
//     }

//     container.innerHTML = html || '<p style="color: #94a3b8;">No WHOIS data</p>';
// }

// function displayContentDiscovery(data) {
//     const links = data.links || [];
//     document.getElementById('linksCount').textContent = links.length;
//     paginationState.links.data = links;
//     renderPaginatedList('links', links, (link) => {
//         try {
//             // Try to parse as full URL first
//             const url = new URL(link);
//             const path = url.pathname || '/';
//             const host = url.hostname;
//             return `<a href="${link}" target="_blank" class="link-item" title="${link}">${host}${path}</a>`;
//         } catch {
//             // If it fails, it's likely a relative path like /login
//             // Convert to full URL using the scanned domain
//             const baseUrl = data.final_url || data.normalized_target || data.host;
//             if (baseUrl) {
//                 const fullUrl = baseUrl.replace(/\/$/, '') + link;
//                 return `<a href="${fullUrl}" target="_blank" class="link-item" title="${fullUrl}">${link}</a>`;
//             }
//             // If no base URL, just create a link with https:// prefix
//             return `<a href="https://${link}" target="_blank" class="link-item" title="${link}">${link}</a>`;
//         }
//     });

//     const scripts = data.scripts || [];
//     paginationState.scripts.data = scripts;
//     renderScriptsList(scripts);

//     const iframes = data.iframes || [];
//     const iframesSection = document.getElementById('iframesSection');
//     if (iframes.length > 0) {
//         iframesSection.classList.remove('hidden');
//         document.getElementById('iframesCount').textContent = iframes.length;
//         paginationState.iframes.data = iframes;
//         renderPaginatedList('iframes', iframes, (iframe) => {
//             try {
//                 return `<a href="${iframe}" target="_blank" class="link-item" title="${iframe}">${iframe}</a>`;
//             } catch {
//                 return `<a href="https://${iframe}" target="_blank" class="link-item" title="${iframe}">${iframe}</a>`;
//             }
//         });
//     } else {
//         iframesSection.classList.add('hidden');
//     }

//     const subdomains = data.subdomains || [];
//     const subdomainsSection = document.getElementById('subdomainsSection');
//     if (subdomains.length > 0) {
//         subdomainsSection.classList.remove('hidden');
//         paginationState.subdomains.data = subdomains;
//         renderPaginatedList('subdomains', subdomains, (subdomain) => {
//             // Add https:// prefix for subdomain links
//             const href = subdomain.startsWith('http') ? subdomain : `https://${subdomain}`;
//             return `<a href="${href}" target="_blank" class="link-item" title="${subdomain}">${subdomain}</a>`;
//         });
//     } else {
//         subdomainsSection.classList.add('hidden');
//     }
// }

// function displayHTTPTransactions(data) {
//     const transactions = data.http_transactions || [];
//     const error = data.http_transactions_error;
//     const available = data.http_transactions_available;
    
//     paginationState.httpTransactions.data = transactions;
    
//     // Show message if Playwright is not available
//     if (error && !available) {
//         const listEl = document.getElementById('httpTransactionsList');
//         const paginationEl = document.getElementById('httpTransactionsPagination');
//         listEl.innerHTML = '<p style="color: #94a3b8; padding: 10px;">' + error + '</p>';
//         paginationEl.innerHTML = '';
//         return;
//     }
    
//     renderHTTPTransactionsList(transactions);
// }

// function renderHTTPTransactionsList(transactions) {
//     const state = paginationState.httpTransactions;
//     const totalPages = Math.ceil(transactions.length / state.itemsPerPage);
    
//     const listEl = document.getElementById('httpTransactionsList');
//     const paginationEl = document.getElementById('httpTransactionsPagination');
    
//     if (transactions.length === 0) {
//         listEl.innerHTML = '<p style="color: #94a3b8; padding: 10px;">No HTTP transactions captured. Make sure Playwright is installed.</p>';
//         paginationEl.innerHTML = '';
//         return;
//     }
    
//     const start = (state.currentPage - 1) * state.itemsPerPage;
//     const end = start + state.itemsPerPage;
//     const pageData = transactions.slice(start, end);
    
//     let html = '<ul>';
//     pageData.forEach((txn, index) => {
//         const isExpanded = expandedTransactionUrl === txn.url;
//         const statusClass = txn.status >= 400 ? 'status-error' : (txn.status >= 300 ? 'status-redirect' : 'status-success');
//         const size = txn.size || 0;
//         const sizeStr = size < 1024 ? `${size} B` : `${(size/1024).toFixed(1)} kB`;
        
//         html += `
//             <li class="script-item">
//                 <div class="script-header" onclick="toggleTransactionDetails('${encodeURIComponent(txn.url)}')">
//                     <span class="expand-icon">${isExpanded ? '▼' : '▶'}</span>
//                     <span class="http-method">${txn.method || 'GET'}</span>
//                     <span class="http-status ${statusClass}">${txn.status || '—'}</span>
//                     <span class="script-url">${truncateUrl(txn.url)}</span>
//                     <span class="http-size">${sizeStr}</span>
//                 </div>
//                 ${isExpanded ? `
//                     <div class="script-details-card" id="txn-details-${encodeURIComponent(txn.url)}">
//                         ${renderTransactionDetails(txn)}
//                     </div>
//                 ` : ''}
//             </li>
//         `;
//     });
//     html += '</ul>';
//     listEl.innerHTML = html;

//     if (totalPages <= 1) {
//         paginationEl.innerHTML = '';
//         return;
//     }

//     let paginationHtml = '';
//     paginationHtml += `<button ${state.currentPage === 1 ? 'disabled' : ''} onclick="changePage('httpTransactions', ${state.currentPage - 1})">Prev</button>`;
    
//     for (let i = 1; i <= totalPages; i++) {
//         if (i === 1 || i === totalPages || (i >= state.currentPage - 1 && i <= state.currentPage + 1)) {
//             paginationHtml += `<button class="${i === state.currentPage ? 'active' : ''}" onclick="changePage('httpTransactions', ${i})">${i}</button>`;
//         } else if (i === state.currentPage - 2 || i === state.currentPage + 2) {
//             paginationHtml += `<span style="color: #94a3b8;">...</span>`;
//         }
//     }
    
//     paginationHtml += `<button ${state.currentPage === totalPages ? 'disabled' : ''} onclick="changePage('httpTransactions', ${state.currentPage + 1})">Next</button>`;
//     paginationEl.innerHTML = paginationHtml;
// }

// function renderTransactionDetails(txn) {
//     const ipInfo = txn.ip_info || {};
//     const ipApi = ipInfo['ip-api'] || {};
//     const country = ipApi.country || '—';
//     const isp = ipApi.isp || '—';
//     const asn = ipInfo.ipwhois?.asn || '—';
//     const asnDesc = ipInfo.ipwhois?.asn_description || '—';
    
//     let html = `
//         <div class="script-info-section">
//             <h4>URL</h4>
//             <div class="kv-pair"><span class="value" style="word-break: break-all;">${txn.url}</span></div>
            
//             <h4>IP / ASN</h4>
//             <div class="kv-pair"><span class="key">Country:</span><span class="value">${country}</span></div>
//             <div class="kv-pair"><span class="key">IP:</span><span class="value">${ipApi.query || '—'}</span></div>
//             <div class="kv-pair"><span class="key">ASN:</span><span class="value">${asn} (${asnDesc})</span></div>
            
//             <h4>Requested by</h4>
//             <div class="kv-pair"><span class="value">${txn.requested_by || '—'}</span></div>
            
//             <h4>Resource Information</h4>
//             <div class="kv-pair"><span class="key">Method:</span><span class="value">${txn.method || 'GET'}</span></div>
//             <div class="kv-pair"><span class="key">Status:</span><span class="value">${txn.status || '—'} ${txn.status_text || ''}</span></div>
//             <div class="kv-pair"><span class="key">Size:</span><span class="value">${txn.size || 0} bytes</span></div>
//             <div class="kv-pair"><span class="key">Resource Type:</span><span class="value">${txn.resource_type || 'unknown'}</span></div>
//     `;
    
//     if (txn.response_headers && txn.response_headers['content-type']) {
//         html += `<div class="kv-pair"><span class="key">Content-Type:</span><span class="value">${txn.response_headers['content-type']}</span></div>`;
//     }
    
//     const url = txn.url.toLowerCase();
//     const techFingerprints = [];
//     if (url.includes('googleapis') || url.includes('googleusercontent')) {
//         techFingerprints.push('Google APIs (CDN)');
//     }
//     if (url.includes('ajax.googleapis')) {
//         techFingerprints.push('Google AJAX CDN');
//     }
//     if (url.includes('cdnjs') || url.includes('cloudflare')) {
//         techFingerprints.push('Cloudflare CDN');
//     }
//     if (url.includes('jquery')) {
//         techFingerprints.push('jQuery (CDN)');
//     }
//     if (url.includes('amazonaws') || url.includes('s3.')) {
//         techFingerprints.push('Amazon S3 (Storage)');
//     }
//     if (url.includes('azure') || url.includes('windows.net')) {
//         techFingerprints.push('Microsoft Azure (Cloud)');
//     }
//     if (url.includes('herokuapp')) {
//         techFingerprints.push('Heroku (PaaS)');
//     }
//     if (url.includes('github.io')) {
//         techFingerprints.push('GitHub Pages');
//     }
//     if (url.includes('unpkg')) {
//         techFingerprints.push('unpkg (CDN)');
//     }
//     if (url.includes('jsdelivr')) {
//         techFingerprints.push('jsDelivr (CDN)');
//     }
//     if (url.includes('bootstrap')) {
//         techFingerprints.push('Bootstrap (CSS Framework)');
//     }
//     if (url.includes('fontawesome')) {
//         techFingerprints.push('Font Awesome (Icons)');
//     }
//     if (url.includes('material')) {
//         techFingerprints.push('Material Design');
//     }
//     if (url.includes('tailwind')) {
//         techFingerprints.push('Tailwind CSS');
//     }
//     if (url.includes('vuejs')) {
//         techFingerprints.push('Vue.js (CDN)');
//     }
//     if (url.includes('react') && url.includes('cdn')) {
//         techFingerprints.push('React (CDN)');
//     }
//     if (url.includes('angular') && url.includes('cdn')) {
//         techFingerprints.push('Angular (CDN)');
//     }
    
//     if (techFingerprints.length > 0) {
//         html += `<h4>Technology Fingerprints</h4>`;
//         techFingerprints.forEach(tech => {
//             html += `<div class="kv-pair"><span class="value">${tech}</span></div>`;
//         });
//     }
    
//     if (txn.headers) {
//         html += `<h4>HTTP Request Headers</h4>`;
//         html += `<pre class="script-code">`;
//         for (const [key, value] of Object.entries(txn.headers)) {
//             html += `${key}: ${value}\n`;
//         }
//         html += `</pre>`;
//     }
    
//     if (txn.response_headers) {
//         html += `<h4>HTTP Response Headers</h4>`;
//         html += `<pre class="script-code">`;
//         for (const [key, value] of Object.entries(txn.response_headers)) {
//             html += `${key}: ${value}\n`;
//         }
//         html += `</pre>`;
//     }
    
//     html += `</div>`;
//     return html;
// }

// function truncateUrl(url) {
//     try {
//         const parsed = new URL(url);
//         const path = parsed.pathname + parsed.search;
//         if (path.length > 50) {
//             return parsed.hostname + path.substring(0, 47) + '...';
//         }
//         return parsed.hostname + path;
//     } catch {
//         return url.length > 50 ? url.substring(0, 47) + '...' : url;
//     }
// }

// function toggleTransactionDetails(url) {
//     const decodedUrl = decodeURIComponent(url);
//     if (expandedTransactionUrl === decodedUrl) {
//         expandedTransactionUrl = null;
//     } else {
//         expandedTransactionUrl = decodedUrl;
//     }
//     const transactions = paginationState.httpTransactions.data;
//     renderHTTPTransactionsList(transactions);
// }

// function renderScriptsList(scripts) {
//     const state = paginationState.scripts;
//     const totalPages = Math.ceil(scripts.length / state.itemsPerPage);
    
//     const listEl = document.getElementById('scriptsList');
//     const paginationEl = document.getElementById('scriptsPagination');
    
//     const start = (state.currentPage - 1) * state.itemsPerPage;
//     const end = start + state.itemsPerPage;
//     const pageData = scripts.slice(start, end);
    
//     let html = '<ul>';
//     pageData.forEach(scriptUrl => {
//         const isExpanded = expandedScriptUrl === scriptUrl;
        
//         html += `
//             <li class="script-item">
//                 <div class="script-header" onclick="toggleScriptDetails('${encodeURIComponent(scriptUrl)}')">
//                     <span class="expand-icon">${isExpanded ? '▼' : '▶'}</span>
//                     <span class="script-url">${scriptUrl}</span>
//                 </div>
//                 ${isExpanded ? `
//                     <div class="script-details-card" id="script-details-${encodeURIComponent(scriptUrl)}">
//                         <div class="script-details-loading">Loading details...</div>
//                     </div>
//                 ` : ''}
//             </li>
//         `;
//     });
//     html += '</ul>';
//     listEl.innerHTML = html;

//     if (expandedScriptUrl) {
//         fetchScriptDetails(expandedScriptUrl);
//     }

//     if (totalPages <= 1) {
//         paginationEl.innerHTML = '';
//         return;
//     }

//     let paginationHtml = '';
//     paginationHtml += `<button ${state.currentPage === 1 ? 'disabled' : ''} onclick="changePage('scripts', ${state.currentPage - 1})">Prev</button>`;
    
//     for (let i = 1; i <= totalPages; i++) {
//         if (i === 1 || i === totalPages || (i >= state.currentPage - 1 && i <= state.currentPage + 1)) {
//             paginationHtml += `<button class="${i === state.currentPage ? 'active' : ''}" onclick="changePage('scripts', ${i})">${i}</button>`;
//         } else if (i === state.currentPage - 2 || i === state.currentPage + 2) {
//             paginationHtml += `<span style="color: #94a3b8;">...</span>`;
//         }
//     }
    
//     paginationHtml += `<button ${state.currentPage === totalPages ? 'disabled' : ''} onclick="changePage('scripts', ${state.currentPage + 1})">Next</button>`;
//     paginationEl.innerHTML = paginationHtml;
// }

// function toggleScriptDetails(scriptUrl) {
//     const decodedUrl = decodeURIComponent(scriptUrl);
//     if (expandedScriptUrl === decodedUrl) {
//         expandedScriptUrl = null;
//     } else {
//         expandedScriptUrl = decodedUrl;
//     }
//     const scripts = paginationState.scripts.data;
//     renderScriptsList(scripts);
// }

// async function fetchScriptDetails(scriptUrl) {
//     const container = document.getElementById(`script-details-${encodeURIComponent(scriptUrl)}`);
//     if (!container) return;

//     try {
//         const response = await fetch(`/api/script-content?url=${encodeURIComponent(scriptUrl)}`);
//         if (!response.ok) {
//             throw new Error('Failed to fetch script content');
//         }
        
//         const data = await response.json();
        
//         const details = scriptDetailsCache[scriptUrl] || {};
//         const introducedBy = details.introduced_by || 'ScriptElement';
//         const embedded = details.embedded !== undefined ? details.embedded : true;
//         const firstSeen = details.first_seen || '—';
//         const lastSeen = details.last_seen || '—';
//         const timesSeen = details.times_seen || 1;
        
//         let html = `
//             <div class="script-info-section">
//                 <h4>Resource Information</h4>
//                 <div class="kv-pair">
//                     <span class="key">Introduced by:</span>
//                     <span class="value">${introducedBy}</span>
//                 </div>
//                 <div class="kv-pair">
//                     <span class="key">Embedded:</span>
//                     <span class="value">${embedded ? 'true' : 'false'}</span>
//                 </div>
//                 <div class="kv-pair">
//                     <span class="key">First Seen:</span>
//                     <span class="value">${firstSeen}</span>
//                 </div>
//                 <div class="kv-pair">
//                     <span class="key">Last Seen:</span>
//                     <span class="value">${lastSeen}</span>
//                 </div>
//                 <div class="kv-pair">
//                     <span class="key">Times Seen:</span>
//                     <span class="value">${timesSeen}</span>
//                 </div>
//         `;
        
//         if (data.fetched) {
//             html += `
//                 <div class="kv-pair">
//                     <span class="key">Size:</span>
//                     <span class="value">${data.size_formatted || '0 B'}</span>
//                 </div>
//                 <div class="kv-pair">
//                     <span class="key">Format:</span>
//                     <span class="value">${data.format || 'Unknown'}</span>
//                 </div>
//                 <div class="kv-pair">
//                     <span class="key">MD5:</span>
//                     <span class="value hash-value">${data.md5 || '—'}</span>
//                 </div>
//                 <div class="kv-pair">
//                     <span class="key">SHA1:</span>
//                     <span class="value hash-value">${data.sha1 || '—'}</span>
//                 </div>
//                 <div class="kv-pair">
//                     <span class="key">SHA256:</span>
//                     <span class="value hash-value">${data.sha256 || '—'}</span>
//                 </div>
//             `;
//         } else {
//             html += `
//                 <div class="kv-pair">
//                     <span class="key">Error:</span>
//                     <span class="value">${data.error || 'Failed to fetch'}</span>
//                 </div>
//             `;
//         }
        
//         html += `</div>`;
        
//         if (data.content) {
//             html += `
//                 <div class="script-code-section">
//                     <div class="code-toggle-header">
//                         <h4>Code</h4>
//                         <button class="format-toggle-btn" onclick="toggleCodeFormat('${encodeURIComponent(scriptUrl)}')">Format Code</button>
//                     </div>
//                     <pre class="script-code" id="script-code-${encodeURIComponent(scriptUrl)}">${escapeHtml(data.content)}</pre>
//                 </div>
//             `;
//         }
        
//         container.innerHTML = html;
        
//     } catch (error) {
//         container.innerHTML = `<div class="script-details-error">Error loading details: ${error.message}</div>`;
//     }
// }

// function toggleCodeFormat(scriptUrl) {
//     const decodedUrl = decodeURIComponent(scriptUrl);
//     const codeEl = document.getElementById(`script-code-${encodeURIComponent(decodedUrl)}`);
//     if (codeEl) {
//         const isFormatted = codeEl.classList.contains('formatted');
//         if (isFormatted) {
//             codeEl.textContent = codeEl.dataset.raw || codeEl.textContent;
//             codeEl.classList.remove('formatted');
//         } else {
//             codeEl.dataset.raw = codeEl.textContent;
//             try {
//                 if (codeEl.textContent.trim().startsWith('{') || codeEl.textContent.trim().startsWith('[')) {
//                     codeEl.textContent = JSON.stringify(JSON.parse(codeEl.textContent), null, 2);
//                 } else {
//                     codeEl.textContent = formatJavaScript(codeEl.textContent);
//                 }
//                 codeEl.classList.add('formatted');
//             } catch (e) {
//                 console.log('Could not format code:', e);
//             }
//         }
//     }
// }

// function formatJavaScript(code) {
//     let formatted = '';
//     let indent = 0;
//     let inString = false;
//     let stringChar = '';
    
//     for (let i = 0; i < code.length; i++) {
//         const char = code[i];
        
//         if ((char === '"' || char === "'" || char === '`') && code[i-1] !== '\\') {
//             if (!inString) {
//                 inString = true;
//                 stringChar = char;
//             } else if (char === stringChar) {
//                 inString = false;
//             }
//         }
        
//         if (!inString) {
//             if (char === '{' || char === '[' || char === '(') {
//                 formatted += char + '\n' + '  '.repeat(++indent);
//             } else if (char === '}' || char === ']' || char === ')') {
//                 formatted = formatted.trimEnd() + '\n' + '  '.repeat(--indent) + char;
//             } else if (char === ';') {
//                 formatted += char + '\n' + '  '.repeat(indent);
//             } else if (char === ',') {
//                 formatted += char + ' ';
//             } else {
//                 formatted += char;
//             }
//         } else {
//             formatted += char;
//         }
//     }
    
//     return formatted.trim();
// }

// function escapeHtml(text) {
//     const div = document.createElement('div');
//     div.textContent = text;
//     return div.innerHTML;
// }

// function displayEmailSecurity(data) {
//     const section = document.getElementById('emailSecuritySection');
//     const emailSec = data.email_security || {};
    
//     if (!emailSec.spf && !emailSec.dmarc && Object.keys(emailSec.dkim || {}).length === 0) {
//         section.classList.add('hidden');
//         return;
//     }
    
//     section.classList.remove('hidden');
    
//     let html = '';
//     html += `<div class="kv-pair"><span class="key">SPF:</span><span class="value">${emailSec.spf ? 'Present' : 'Missing/Unknown'}</span></div>`;
//     html += `<div class="kv-pair"><span class="key">DMARC:</span><span class="value">${emailSec.dmarc ? 'Present' : 'Missing/Unknown'}</span></div>`;
    
//     const dkim = emailSec.dkim || {};
//     if (Object.keys(dkim).length > 0) {
//         html += '<h3>DKIM selectors</h3>';
//         for (const [selector, found] of Object.entries(dkim)) {
//             html += `<div class="kv-pair"><span class="value">${selector}: ${found ? 'Found' : 'Not found'}</span></div>`;
//         }
//     }
    
//     document.getElementById('emailSecurity').innerHTML = html;
// }

// function displayInfrastructure(data) {
//     const ports = data.ports || {};
//     const tbody = document.querySelector('#portsTable tbody');
//     let portsHtml = '';
    
//     for (const [port, info] of Object.entries(ports)) {
//         const isOpen = info.open ? 'Yes' : 'No';
//         const service = info.service || '—';
//         const banner = info.banner || '—';
//         portsHtml += `<tr><td>${port}</td><td>${isOpen}</td><td>${service}</td><td>${banner.substring(0, 50)}</td></tr>`;
//     }
    
//     tbody.innerHTML = portsHtml || '<tr><td colspan="4">No port data</td></tr>';

//     const tech = data.tech || {};
//     const techContainer = document.getElementById('techStack');
//     let techHtml = '';
    
//     if (tech.server) {
//         techHtml += `<div class="kv-pair"><span class="key">Server:</span><span class="value">${tech.server}</span></div>`;
//     }
    
//     if (tech.server_side && tech.server_side.length > 0) {
//         tech.server_side.forEach(t => {
//             techHtml += `<div class="kv-pair"><span class="value">${t}</span></div>`;
//         });
//     }
    
//     if (tech.x_powered_by) {
//         techHtml += `<div class="kv-pair"><span class="key">Powered By:</span><span class="value">${tech.x_powered_by}</span></div>`;
//     }
    
//     if (tech.cms && tech.cms.length > 0) {
//         tech.cms.forEach(t => {
//             techHtml += `<div class="kv-pair"><span class="value">${t}</span></div>`;
//         });
//     }
    
//     if (tech.js_frameworks && tech.js_frameworks.length > 0) {
//         tech.js_frameworks.forEach(t => {
//             techHtml += `<div class="kv-pair"><span class="value">${t}</span></div>`;
//         });
//     }
    
//     if (tech.cdn_cloud_services && tech.cdn_cloud_services.length > 0) {
//         tech.cdn_cloud_services.forEach(t => {
//             techHtml += `<div class="kv-pair"><span class="value">${t}</span></div>`;
//         });
//     }
    
//     if (tech.generator) {
//         techHtml += `<div class="kv-pair"><span class="key">Generator:</span><span class="value">${tech.generator}</span></div>`;
//     }
    
//     if (tech.final_url) {
//         techHtml += `<div class="kv-pair"><span class="key">Final URL:</span><span class="value"><a href="${tech.final_url}" target="_blank" class="link-item" title="${tech.final_url}">${tech.final_url}</a></span></div>`;
//     }
    
//     techContainer.innerHTML = techHtml || '<p style="color: #94a3b8;">No specific tech detected</p>';

//     const headers = data.headers || {};
//     const headersArray = Object.entries(headers);
//     document.getElementById('headersSection').classList.toggle('hidden', headersArray.length === 0);
    
//     if (headersArray.length > 0) {
//         const headersList = document.getElementById('headersList');
//         headersList.innerHTML = '<ul>' + headersArray.map(([key, val]) => {
//             return `<li><span class="key">${key}:</span> <span class="value">${val}</span></li>`;
//         }).join('') + '</ul>';
//     }
// }

// function showLoading() {
//     document.getElementById('loading').classList.remove('hidden');
// }

// function hideLoading() {
//     document.getElementById('loading').classList.add('hidden');
// }

// function showError(msg) {
//     const errorEl = document.getElementById('error');
//     errorEl.textContent = msg;
//     errorEl.classList.remove('hidden');
// }

// function hideError() {
//     document.getElementById('error').classList.add('hidden');
// }

// function showResults() {
//     document.getElementById('results').classList.remove('hidden');
// }

// function hideResults() {
//     document.getElementById('results').classList.add('hidden');
// }
