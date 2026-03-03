// Global state
const PAST_SEARCHES_KEY = 'netsight_past_searches';
const MAX_PAST_SEARCHES = 10;

// Get past searches from localStorage
function getPastSearches() {
    try {
        const stored = localStorage.getItem(PAST_SEARCHES_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

// Save a search query to localStorage
function savePastSearch(query) {
    if (!query || query.trim() === '') return;

    try {
        let searches = getPastSearches();

        // Remove if already exists to avoid duplicates
        searches = searches.filter(s => s.toLowerCase() !== query.toLowerCase());

        // Add to beginning
        searches.unshift(query);

        // Keep only max items
        searches = searches.slice(0, MAX_PAST_SEARCHES);

        localStorage.setItem(PAST_SEARCHES_KEY, JSON.stringify(searches));
        updateSearchSuggestions();
    } catch {
        // localStorage not available
    }
}

// Update the datalist with past searches for autocomplete
function updateSearchSuggestions() {
    const datalist = document.getElementById('pastSearches');
    if (!datalist) return;

    const searches = getPastSearches();
    datalist.innerHTML = searches
        .map(s => `<option value="${escapeHtml(s)}">`)
        .join('');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateSearchSuggestions();

    // Add focus event listener to show suggestions dropdown
    const targetInput = document.getElementById('targetInput');
    if (targetInput) {
        targetInput.addEventListener('focus', () => {
            // Refresh suggestions when input is focused
            updateSearchSuggestions();
        });
    }

    // Filter Dropdown logic
    const filterBtn = document.getElementById('filterBtn');
    const filterDropdown = document.getElementById('filterDropdown');
    if (filterBtn && filterDropdown) {
        filterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            filterDropdown.classList.toggle('hidden');
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!filterBtn.contains(e.target) && !filterDropdown.contains(e.target)) {
                filterDropdown.classList.add('hidden');
            }
        });

        filterDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // Select All logic
    const selectAllCb = document.getElementById('selectAllFilters');
    const apiCbs = document.querySelectorAll('.api-filter');

    if (selectAllCb) {
        selectAllCb.addEventListener('change', (e) => {
            apiCbs.forEach(cb => cb.checked = e.target.checked);
        });

        apiCbs.forEach(cb => {
            cb.addEventListener('change', () => {
                const allChecked = Array.from(apiCbs).every(c => c.checked);
                selectAllCb.checked = allChecked;
            });
        });
    }
});

// Draggable image functionality
const draggableImage = document.getElementById('draggableImage');
let posX = 0, posY = 0;

if (draggableImage) {
    draggableImage.addEventListener('keydown', (e) => {
        const step = 10;
        switch (e.key) {
            case 'ArrowLeft':
                posX -= step;
                draggableImage.style.transform = `translate(${posX}px, ${posY}px)`;
                e.preventDefault();
                break;
            case 'ArrowRight':
                posX += step;
                draggableImage.style.transform = `translate(${posX}px, ${posY}px)`;
                e.preventDefault();
                break;
            case 'ArrowUp':
                posY -= step;
                draggableImage.style.transform = `translate(${posX}px, ${posY}px)`;
                e.preventDefault();
                break;
            case 'ArrowDown':
                posY += step;
                draggableImage.style.transform = `translate(${posX}px, ${posY}px)`;
                e.preventDefault();
                break;
        }
    });

    let isDragging = false;
    let startX, startY;

    draggableImage.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX - posX;
        startY = e.clientY - posY;
        draggableImage.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        posX = e.clientX - startX;
        posY = e.clientY - startY;
        draggableImage.style.transform = `translate(${posX}px, ${posY}px)`;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        draggableImage.style.cursor = 'move';
    });
}

// Scan button event listener
document.getElementById('scanBtn').addEventListener('click', performScan);
document.getElementById('targetInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performScan();
});

let scanResult = null;

async function performScan() {
    const target = document.getElementById('targetInput').value.trim();
    if (!target) {
        showError('Please enter a URL or IP address');
        return;
    }

    hideError();
    showLoading();
    hideResults();

    try {
        const useVt = document.getElementById('useVt') ? document.getElementById('useVt').checked : false;
        const useAbuseipdb = document.getElementById('useAbuseipdb') ? document.getElementById('useAbuseipdb').checked : false;
        const useAlienvault = document.getElementById('useAlienvault') ? document.getElementById('useAlienvault').checked : false;
        const useUrlscan = document.getElementById('useUrlscan') ? document.getElementById('useUrlscan').checked : false;
        const useGoogle = document.getElementById('useGoogle') ? document.getElementById('useGoogle').checked : false;

        const response = await fetch('/api/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                target: target,
                use_virustotal: useVt,
                use_abuseipdb: useAbuseipdb,
                use_alienvault: useAlienvault,
                use_urlscan: useUrlscan,
                use_google: useGoogle
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Scan failed');
        }

        scanResult = await response.json();
        displayResults(scanResult);
        hideLoading();
        showResults();

        // ✅ On submit → save to localStorage
        savePastSearch(target);
    } catch (err) {
        hideLoading();
        showError(err.message);
    }
}

function displayResults(data) {
    document.getElementById('scanType').textContent = `Scan complete — detected: ${data.type.toUpperCase()}`;

    document.getElementById('targetType').textContent = data.type === 'ip' ? 'IP Address' : 'URL / Domain';
    document.getElementById('targetHost').textContent = data.host || data.input || '—';
    document.getElementById('normalizedTarget').textContent = data.normalized_target || '—';
    document.getElementById('scanTimestamp').textContent = data.scan_timestamp || '—';

    const ipInfo = data.ip_info?.['ip-api'] || {};
    document.getElementById('geoLocation').textContent =
        ipInfo.country ? `${ipInfo.country} — ${ipInfo.regionName || ''} — ${ipInfo.city || ''}` : '—';
    document.getElementById('isp').textContent = ipInfo.isp || '—';
    document.getElementById('hosting').textContent = data.hosting_provider || '—';

    const score = data.risk_score || 0;
    const level = data.risk_level || 'Unknown';
    document.getElementById('scoreValue').textContent = score;
    document.getElementById('scoreLevel').textContent = level;

    const needle = document.getElementById('gaugeNeedle');
    const rotation = (score / 100) * 180 - 90;
    needle.style.transform = `translateX(-50%) rotate(${rotation}deg)`;

    const ssl = data.ssl || {};
    const sslStatus = ssl.ok ? (ssl.cert?.notAfter || 'Valid') : 'No cert';
    document.getElementById('sslCert').textContent = sslStatus;

    const securityHeaders = data.security_headers || {};
    const missingCount = Object.values(securityHeaders).filter(h => h.status === 'missing').length;
    document.getElementById('headersBadge').textContent = `${missingCount} Missing`;

    const dnssec = data.dns?.NS ? 'Active' : 'Unknown';
    document.getElementById('dnssecBadge').textContent = dnssec;

    const riskFactors = document.getElementById('riskFactors');
    const riskList = document.getElementById('riskFactorsList');
    const factors = data.top_risk_factors || [];
    if (factors.length > 0) {
        riskFactors.classList.remove('hidden');
        riskList.innerHTML = factors.map(f => `<li>${f}</li>`).join('');
    } else {
        riskFactors.classList.add('hidden');
    }

    displayDNSRecords(data);
    displayWHOIS(data);
    displayContentDiscovery(data);
    displayEmailSecurity(data);
    displayInfrastructure(data);

    // External APIs
    displayVirusTotal(data);
    displayAbuseIPDB(data);
    displayAlienVault(data);
    displayUrlScan(data);
    displayGoogleSafeBrowsing(data);

    document.getElementById('downloadJson').onclick = () => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'URLShield_scan.json';
        a.click();
        URL.revokeObjectURL(url);
    };
}

function displayDNSRecords(data) {
    const dns = data.dns || {};
    const container = document.getElementById('dnsRecords');

    let html = '';
    const recordTypes = ['A', 'AAAA', 'MX', 'NS', 'TXT', 'CNAME'];

    for (const type of recordTypes) {
        const records = dns[type] || [];
        if (records.length > 0) {
            html += `<div class="kv-pair"><span class="key">${type}:</span></div>`;
            records.forEach(r => {
                let href = '';
                if (type === 'A' || type === 'AAAA') {
                    href = `https://${r}`;
                } else {
                    const domain = r.split(' ')[0] || r;
                    href = `https://${domain}`;
                }
                html += `<div class="kv-pair"><span class="value" style=""><a href="${href}" target="_blank" class="link-item" title="${r}">${r}</a></span></div>`;
            });
        }
    }

    if (!html) {
        html = '<p style="color: #94a3b8;">No DNS data</p>';
    }
    container.innerHTML = html;

    const finalDest = document.getElementById('finalDestination');
    if (data.final_url) {
        finalDest.classList.remove('hidden');
        document.getElementById('finalUrl').innerHTML = `<a href="${data.final_url}" target="_blank" class="link-item" title="${data.final_url}">${data.final_url}</a>`;
    } else {
        finalDest.classList.add('hidden');
    }

    const redirect = document.getElementById('redirectChain');
    const chain = data.redirect_chain || [];
    if (chain.length > 1) {
        redirect.classList.remove('hidden');
        document.getElementById('redirectChainList').innerHTML = chain.map(u => `<li><a href="${u}" target="_blank" class="link-item" title="${u}">${u}</a></li>`).join('');
    } else {
        redirect.classList.add('hidden');
    }

    let httpsForced = false;
    if (chain.length > 1) {
        httpsForced = chain[0].startsWith('http://') && chain.some(u => u.startsWith('https://'));
    }
    document.getElementById('httpsForced').textContent = httpsForced ? 'Yes' : 'No';
}

function displayWHOIS(data) {
    const whois = data.whois || {};
    const container = document.getElementById('whoisRecords');

    if (!whois.whois) {
        container.innerHTML = `<p style="margin-left:5px;color: #ef4444;"><strong>Error Fetching WHOIS:</strong> ${escapeHtml(whois.error || 'No WHOIS data found')}</p>`;
        return;
    }

    let html = '';
    const fields = [
        ['Registrar', whois.registrar],
        ['Registrar URL', whois.registrar_url],
        ['Registered On', whois.registered_on],
        ['Expires On', whois.expires_on],
        ['Updated On', whois.updated_on],
        ['Status', whois.domain_status?.join(', ') || whois.status],
        ['DNSSEC', whois.dnssec]
    ];

    fields.forEach(([key, val]) => {
        if (val) {
            if (key === 'Registrar URL' && val) {
                html += `<div class="kv-pair"><span class="key">${key}:</span><span class="value"><a href="${val}" target="_blank" class="link-item" title="${val}">${val}</a></span></div>`;
            } else {
                html += `<div class="kv-pair"><span class="key">${key}:</span><span class="value">${val}</span></div>`;
            }
        }
    });

    const nsIPs = whois.name_server_ips || {};
    if (Object.keys(nsIPs).length > 0) {
        html += '<h3>Name server IPs</h3>';
        for (const [ns, ips] of Object.entries(nsIPs)) {
            html += `<div class="kv-pair"><span class="value">${ns}: ${ips.join(', ') || '—'}</span></div>`;
        }
    }

    container.innerHTML = html || '<p style="color: #94a3b8;">No WHOIS data</p>';
}

function displayContentDiscovery(data) {
    const links = data.links || [];
    document.getElementById('linksCount').textContent = links.length;

    const linksList = document.getElementById('linksList');
    if (links.length > 0) {
        linksList.innerHTML = '<ul>' + links.map(link => {
            try {
                const url = new URL(link);
                const path = url.pathname || '/';
                const host = url.hostname;
                return `<li><a href="${link}" target="_blank" class="link-item" title="${link}">${host}${path}</a></li>`;
            } catch {
                return `<li><a href="https://${link}" target="_blank" class="link-item" title="${link}">${link}</a></li>`;
            }
        }).join('') + '</ul>';
    } else {
        linksList.innerHTML = '<p style="color: #94a3b8;">No links found</p>';
    }

    const scripts = data.scripts || [];
    const scriptsList = document.getElementById('scriptsList');
    if (scripts.length > 0) {
        scriptsList.innerHTML = '<ul>' + scripts.map(script => {
            return `<li><a href="${script}" target="_blank" class="link-item" title="${script}">${script}</a></li>`;
        }).join('') + '</ul>';
    } else {
        scriptsList.innerHTML = '<p style="color: #94a3b8;">No scripts found</p>';
    }

    const iframes = data.iframes || [];
    const iframesSection = document.getElementById('iframesSection');
    if (iframes.length > 0) {
        iframesSection.classList.remove('hidden');
        document.getElementById('iframesCount').textContent = iframes.length;
        const iframesList = document.getElementById('iframesList');
        iframesList.innerHTML = '<ul>' + iframes.map(iframe => {
            return `<li><a href="${iframe}" target="_blank" class="link-item" title="${iframe}">${iframe}</a></li>`;
        }).join('') + '</ul>';
    } else {
        iframesSection.classList.add('hidden');
    }

    const subdomains = data.subdomains || [];
    const subdomainsSection = document.getElementById('subdomainsSection');
    if (subdomains.length > 0) {
        subdomainsSection.classList.remove('hidden');
        const subdomainsList = document.getElementById('subdomainsList');
        subdomainsList.innerHTML = '<ul>' + subdomains.map(subdomain => {
            const href = subdomain.startsWith('http') ? subdomain : `https://${subdomain}`;
            return `<li><a href="${href}" target="_blank" class="link-item" title="${subdomain}">${subdomain}</a></li>`;
        }).join('') + '</ul>';
    } else {
        subdomainsSection.classList.add('hidden');
    }
}

function displayEmailSecurity(data) {
    const section = document.getElementById('emailSecuritySection');
    const emailSec = data.email_security || {};

    if (!emailSec.spf && !emailSec.dmarc && Object.keys(emailSec.dkim || {}).length === 0 && (!emailSec.errors || emailSec.errors.length === 0)) {
        section.classList.add('hidden');
        return;
    }

    section.classList.remove('hidden');

    let html = '';

    if (emailSec.errors && emailSec.errors.length > 0) {
        html += `<div style="margin-bottom:15px; padding:10px; background:rgba(239, 68, 68, 0.1); border:1px solid #7f1d1d; border-radius:4px; color:#ef4444;">
            <strong>Backend Resolution Errors:</strong>
            <ul style="margin-top:5px; padding-left:20px;">
                ${emailSec.errors.map(e => `<li>${escapeHtml(e)}</li>`).join('')}
            </ul>
        </div>`;
    }

    html += `<div class="kv-pair"><span class="key">SPF:</span><span class="value">${emailSec.spf ? 'Present' : 'Missing/Unknown'}</span></div>`;
    html += `<div class="kv-pair"><span class="key">DMARC:</span><span class="value">${emailSec.dmarc ? 'Present' : 'Missing/Unknown'}</span></div>`;

    const dkim = emailSec.dkim || {};
    if (Object.keys(dkim).length > 0) {
        html += '<h3>DKIM selectors</h3>';
        for (const [selector, found] of Object.entries(dkim)) {
            html += `<div class="kv-pair"><span class="value">${selector}: ${found ? 'Found' : 'Not found'}</span></div>`;
        }
    }

    document.getElementById('emailSecurity').innerHTML = html;
}

function displayInfrastructure(data) {
    const ports = data.ports || {};
    const tbody = document.querySelector('#portsTable tbody');
    let portsHtml = '';

    for (const [port, info] of Object.entries(ports)) {
        const isOpen = info.open ? 'Yes' : 'No';
        const service = info.service || '—';
        const banner = info.banner || '—';
        portsHtml += `<tr><td>${port}</td><td>${isOpen}</td><td>${service}</td><td>${banner.substring(0, 50)}</td></tr>`;
    }

    tbody.innerHTML = portsHtml || '<tr><td colspan="4">No port data</td></tr>';

    const tech = data.tech || {};
    const techContainer = document.getElementById('techStack');
    let techHtml = '';

    // Wrap in card-like scrollable container
    techHtml += '<div class="tech-card">';
    techHtml += '<div class="tech-card-content">';

    if (tech.server) {
        techHtml += `<div class="tech-section"><h4>Web Server</h4>`;
        techHtml += `<div class="kv-pair"><span class="key">Server:</span><span class="value">${tech.server}</span></div></div>`;
    }

    if (tech.server_side && tech.server_side.length > 0) {
        techHtml += `<div class="tech-section"><h4>Server-Side Technologies</h4>`;
        tech.server_side.forEach(t => {
            techHtml += `<div class="kv-pair"><span class="value">${t}</span></div>`;
        });
        techHtml += `</div>`;
    }

    if (tech.x_powered_by) {
        techHtml += `<div class="tech-section"><h4>Powered By</h4>`;
        techHtml += `<div class="kv-pair"><span class="value">${tech.x_powered_by}</span></div></div>`;
    }

    if (tech.cms && tech.cms.length > 0) {
        techHtml += `<div class="tech-section"><h4>CMS</h4>`;
        tech.cms.forEach(t => {
            techHtml += `<div class="kv-pair"><span class="value">${t}</span></div>`;
        });
        techHtml += `</div>`;
    }

    if (tech.js_frameworks && tech.js_frameworks.length > 0) {
        techHtml += `<div class="tech-section"><h4>JavaScript Frameworks</h4>`;
        tech.js_frameworks.forEach(t => {
            techHtml += `<div class="kv-pair"><span class="value">${t}</span></div>`;
        });
        techHtml += `</div>`;
    }

    if (tech.cdn_cloud_services && tech.cdn_cloud_services.length > 0) {
        techHtml += `<div class="tech-section"><h4>CDN & Cloud Services</h4>`;
        tech.cdn_cloud_services.forEach(t => {
            techHtml += `<div class="kv-pair"><span class="value">${t}</span></div>`;
        });
        techHtml += `</div>`;
    }

    if (tech.generator) {
        techHtml += `<div class="tech-section"><h4>Generator</h4>`;
        techHtml += `<div class="kv-pair"><span class="value">${tech.generator}</span></div></div>`;
    }

    if (tech.final_url) {
        techHtml += `<div class="tech-section"><h4>Final URL</h4>`;
        techHtml += `<div class="kv-pair"><span class="value"><a href="${tech.final_url}" target="_blank" class="link-item" title="${tech.final_url}">${tech.final_url}</a></span></div></div>`;
    }

    techHtml += '</div>'; // Close tech-card-content
    techHtml += '</div>'; // Close tech-card

    techContainer.innerHTML = techHtml || '<p style="color: #94a3b8;">No specific tech detected</p>';

    const headers = data.headers || {};
    const headersArray = Object.entries(headers);
    document.getElementById('headersSection').classList.toggle('hidden', headersArray.length === 0);

    if (headersArray.length > 0) {
        const headersList = document.getElementById('headersList');
        headersList.innerHTML = '<ul>' + headersArray.map(([key, val]) => {
            return `<li><span class="key">${key}:</span> <span class="value">${val}</span></li>`;
        }).join('') + '</ul>';
    }
}

function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

function showError(msg) {
    const errorEl = document.getElementById('error');
    errorEl.textContent = msg;
    errorEl.classList.remove('hidden');
}

function hideError() {
    document.getElementById('error').classList.add('hidden');
}

function showResults() {
    document.getElementById('results').classList.remove('hidden');
}

function hideResults() {
    document.getElementById('results').classList.add('hidden');
}

function displayVirusTotal(data) {
    const vtSection = document.getElementById('vtSection');
    const vtStats = document.getElementById('vtStats');
    const vtResultsList = document.getElementById('vtResults');

    if (!data.virustotal) {
        vtSection.style.display = 'none';
        return;
    }

    vtSection.style.display = 'block';
    vtStats.innerHTML = '';
    vtResultsList.innerHTML = '';

    const vt = data.virustotal;

    if (vt.error) {
        // Handle VT specific errors like rate limit smoothly
        vtStats.innerHTML = `<div style="color: #ef4444; padding: 10px; border: 1px solid #7f1d1d; border-radius: 4px; background: rgba(239, 68, 68, 0.1);">
            <strong>VirusTotal Error:</strong> ${escapeHtml(vt.error)}
        </div>`;
        return;
    }

    if (vt.success) {
        // Display stats badges
        const s = vt.stats;
        const total = s.malicious + s.suspicious + s.undetected + s.harmless + s.timeout;

        let statsHtml = `
            <div class="badge" style="background: ${s.malicious > 0 ? '#7f1d1d' : '#1e293b'}">
                <span class="badge-label" style="color: ${s.malicious > 0 ? '#fca5a5' : '#94a3b8'}">Malicious</span>
                <span class="badge-value" style="color: ${s.malicious > 0 ? '#fca5a5' : '#e2e8f0'}">${s.malicious}</span>
            </div>
            <div class="badge" style="background: ${s.suspicious > 0 ? '#78350f' : '#1e293b'}">
                <span class="badge-label" style="color: ${s.suspicious > 0 ? '#fcd34d' : '#94a3b8'}">Suspicious</span>
                <span class="badge-value" style="color: ${s.suspicious > 0 ? '#fcd34d' : '#e2e8f0'}">${s.suspicious}</span>
            </div>
            <div class="badge">
                <span class="badge-label">Undetected/Harmless</span>
                <span class="badge-value">${s.undetected + s.harmless}</span>
            </div>
        `;

        if (vt.permalink) {
            statsHtml += `
             <div style="margin-left: auto;">
                 <a href="${vt.permalink}" target="_blank" class="link-item" style="display: inline-block; padding: 6px 12px; background: #2563eb; color: white; border-radius: 4px; text-decoration: none; font-size: 0.9em;">
                     View Full Report on VirusTotal
                 </a>
             </div>
             `;
        }

        vtStats.innerHTML = statsHtml;

        // Display individual engine results
        if (vt.engines && vt.engines.length > 0) {
            let listHtml = '<ul>';
            vt.engines.forEach(e => {
                let color = '#94a3b8'; // default undetected
                if (e.category === 'malicious') color = '#ef4444';
                else if (e.category === 'suspicious') color = '#f59e0b';
                else if (e.category === 'harmless') color = '#10b981';

                listHtml += `
                    <li style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #1e293b;">
                        <span style="font-weight: 500;">${escapeHtml(e.engine)}</span>
                        <span style="color: ${color}; text-transform: capitalize;">${escapeHtml(e.result || e.category)}</span>
                    </li>
                `;
            });
            listHtml += '</ul>';
            vtResultsList.innerHTML = listHtml;
        } else {
            vtResultsList.innerHTML = '<p style="color: #94a3b8;">No engine data available.</p>';
        }
    }
}

function displayAbuseIPDB(data) {
    const section = document.getElementById('abuseIpdbSection');
    const content = document.getElementById('abuseIpdbContent');
    if (!data.abuseipdb) { section.style.display = 'none'; return; }

    section.style.display = 'block';
    const db = data.abuseipdb;

    if (db.error) {
        content.innerHTML = `<div style="color: #ef4444; padding: 10px; border: 1px solid #7f1d1d; border-radius: 4px; background: rgba(239, 68, 68, 0.1);"><strong>AbuseIPDB Error:</strong> ${escapeHtml(db.error)}</div>`;
        return;
    }

    if (db.success) {
        let html = `<div class="summary-grid">
            <div class="summary-left">
                <div class="kv-pair"><span class="key">IP Address:</span><span class="value">${db.ipAddress}</span></div>
                <div class="kv-pair"><span class="key">Usage Type:</span><span class="value">${db.usageType || '—'}</span></div>
                <div class="kv-pair"><span class="key">ISP / Domain:</span><span class="value">${db.isp || '—'} / ${db.domain || '—'}</span></div>
            </div>
            <div class="summary-right">
                <div class="kv-pair"><span class="key">Abuse Confidence:</span><span class="value" style="color:${db.abuseConfidenceScore > 0 ? '#ef4444' : '#10b981'}; font-weight:bold;">${db.abuseConfidenceScore}%</span></div>
                <div class="kv-pair"><span class="key">Total Reports:</span><span class="value">${db.totalReports}</span></div>
                <div class="kv-pair"><span class="key">Last Reported:</span><span class="value">${db.lastReportedAt ? new Date(db.lastReportedAt).toLocaleString() : 'Never'}</span></div>
            </div>
        </div>`;
        if (db.permalink) {
            html += `<div style="margin-top:15px;"><a href="${db.permalink}" target="_blank" class="link-item" style="display:inline-block; padding:6px 12px; background:#2563eb; color:white; border-radius:4px; text-decoration:none; font-size:0.9em;">View Detailed Report on AbuseIPDB</a></div>`;
        }
        content.innerHTML = html;
    }
}

function displayAlienVault(data) {
    const section = document.getElementById('alienvaultSection');
    const content = document.getElementById('alienvaultContent');
    if (!data.alienvault) { section.style.display = 'none'; return; }

    section.style.display = 'block';
    const av = data.alienvault;
    if (av.error) {
        content.innerHTML = `<div style="color: #ef4444; padding: 10px; border: 1px solid #7f1d1d; border-radius: 4px; background: rgba(239, 68, 68, 0.1);"><strong>AlienVault Error:</strong> ${escapeHtml(av.error)}</div>`;
        return;
    }

    if (av.success) {
        let html = `<div class="summary-grid" style="margin-bottom:15px; display:flex; gap:20px; flex-wrap:wrap;">
            <div class="summary-left" style="flex:1;">
                <div class="kv-pair"><span class="key">Indicator:</span><span class="value">${av.indicator} (${av.type})</span></div>
                <div class="kv-pair"><span class="key">Pulse Count:</span><span class="value">${av.pulse_count}</span></div>
            </div>
            <div class="summary-right" style="flex:1;">
                <div class="kv-pair"><span class="key">Reputation:</span><span class="value">${av.reputation}</span></div>
            </div>
        </div>`;

        if (av.pulses && av.pulses.length > 0) {
            html += `<h4>Recent Pulses (Top ${av.pulses.length})</h4><ul style="list-style:none; padding:0;">`;
            av.pulses.forEach(p => {
                html += `<li style="padding:8px 0; border-bottom:1px solid #1f2937;"><a href="https://otx.alienvault.com/pulse/${p.id}" target="_blank" class="link-item">${escapeHtml(p.name)}</a><div style="font-size:0.8em; color:#94a3b8;">${p.tags ? p.tags.join(', ') : ''}</div></li>`;
            });
            html += '</ul>';
        } else {
            html += '<p style="color: #94a3b8;">No recent pulses found.</p>';
        }

        if (av.permalink) {
            html += `<div style="margin-top:15px;"><a href="${av.permalink}" target="_blank" class="link-item" style="display:inline-block; padding:6px 12px; background:#2563eb; color:white; border-radius:4px; text-decoration:none; font-size:0.9em;">View on AlienVault OTX</a></div>`;
        }
        content.innerHTML = html;
    }
}

function displayUrlScan(data) {
    const section = document.getElementById('urlscanSection');
    const content = document.getElementById('urlscanContent');
    if (!data.urlscan) { section.style.display = 'none'; return; }

    section.style.display = 'block';
    const us = data.urlscan;
    if (us.error) {
        content.innerHTML = `<div style="color: #ef4444; padding: 10px; border: 1px solid #7f1d1d; border-radius: 4px; background: rgba(239, 68, 68, 0.1);"><strong>URLScan Error:</strong> ${escapeHtml(us.error)}</div>`;
        return;
    }

    if (us.success) {
        let html = `<div class="summary-grid" style="display:flex; gap:20px; flex-wrap:wrap;">
            <div class="summary-left" style="flex:1;">
                <div class="kv-pair"><span class="key">Verdict:</span><span class="value" style="color:${us.malicious ? '#ef4444' : '#10b981'}; font-weight:bold;">${us.malicious ? 'Malicious' : 'Clean'} (Score: ${us.score})</span></div>
                <div class="kv-pair"><span class="key">Scan Date:</span><span class="value">${new Date(us.date).toLocaleString()}</span></div>
                <div class="kv-pair"><span class="key">Tags:</span><span class="value">${us.tags.length ? us.tags.join(', ') : 'None'}</span></div>
            </div>
            <div class="summary-right" style="flex:1;">
                <div class="kv-pair"><span class="key">IP / Geo:</span><span class="value">${us.ip || '—'} / ${us.country || '—'}</span></div>
                <div class="kv-pair"><span class="key">Server:</span><span class="value">${us.server || '—'}</span></div>
                <div class="kv-pair"><span class="key">ASN:</span><span class="value">${us.asnname || '—'} (${us.asn || '—'})</span></div>
            </div>
        </div>`;
        if (us.permalink) {
            html += `<div style="margin-top:15px;"><a href="${us.permalink}" target="_blank" class="link-item" style="display:inline-block; padding:6px 12px; background:#2563eb; color:white; border-radius:4px; text-decoration:none; font-size:0.9em;">View Full Scan on URLScan.io</a></div>`;
        }
        content.innerHTML = html;
    }
}

function displayGoogleSafeBrowsing(data) {
    const section = document.getElementById('googleSection');
    const content = document.getElementById('googleContent');
    if (!data.google_safe_browsing) { section.style.display = 'none'; return; }

    section.style.display = 'block';
    const gsb = data.google_safe_browsing;
    if (gsb.error) {
        content.innerHTML = `<div style="color: #ef4444; padding: 10px; border: 1px solid #7f1d1d; border-radius: 4px; background: rgba(239, 68, 68, 0.1);"><strong>Google Safe Browsing Error:</strong> ${escapeHtml(gsb.error)}</div>`;
        return;
    }

    if (gsb.success) {
        let html = '';
        if (gsb.malicious) {
            html += `<h3 style="color:#ef4444; margin-bottom:10px;">Threats Detected!</h3>`;
            html += `<ul style="list-style:none; padding:0;">`;
            gsb.matches.forEach(m => {
                html += `<li style="padding:8px 0; border-bottom:1px solid #1f2937;">
                    <strong>Type:</strong> <span style="color:#fca5a5;">${m.threatType}</span><br/>
                    <strong>Platform:</strong> ${m.platformType}
                </li>`;
            });
            html += `</ul>`;
            html += `<p style="margin-top:10px; font-size:0.9em; color:#94a3b8;">Google has marked this target as unsafe. <a href="https://developers.google.com/safe-browsing/v4/threat-types" target="_blank" class="link-item" style="display:inline;">Learn more about these threat types.</a></p>`;
        } else {
            html += `<div style="color: #10b981; font-weight:bold; margin-bottom:10px;">${gsb.message}</div>`;
        }

        if (gsb.permalink) {
            html += `<div style="margin-top:15px;"><a href="${gsb.permalink}" target="_blank" class="link-item" style="display:inline-block; padding:6px 12px; background:#2563eb; color:white; border-radius:4px; text-decoration:none; font-size:0.9em;">Check Google Transparency Report</a></div>`;
        }
        content.innerHTML = html;
    }
}
