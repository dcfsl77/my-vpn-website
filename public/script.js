document.addEventListener('DOMContentLoaded', () => {
  let providers = []; // This will be populated from the API

  const features = [
    { name: "Encryption Strength", what: "Uses AES‑256 for data encryption, RSA‑4096 for key exchange, and Perfect Forward Secrecy (PFS).", why: "Prevents attackers from decrypting captured traffic. PFS ensures a new key per session so one leaked key doesn't expose past sessions." },
    { name: "VPN Protocols", what: "Refers to the methods used to create the secure tunnel, like OpenVPN, WireGuard (or variants like NordLynx, Lightway), and IKEv2/IPSec.", why: "Affects security, speed and stability. WireGuard‑based options generally offer the best performance with strong cryptography." },
    { name: "No‑Logs Policy", what: "The provider's promise not to store activity or connection logs. The best policies are verified by independent, third-party audits.", why: "Crucial for privacy. It reduces the risk that your Browse history can be obtained from the VPN provider via a data breach or legal request." },
    { name: "Kill Switch", what: "An essential safety feature that automatically blocks all internet traffic if the VPN connection unexpectedly drops.", why: "Prevents your real IP address and DNS queries from being accidentally exposed while downloading, streaming, or using public Wi‑Fi." },
    { name: "Multi‑Hop (Double VPN)", what: "Routes your internet traffic through two separate VPN servers instead of one, encrypting your data twice.", why: "Makes it significantly harder for anyone to trace your online activity back to you. Useful for journalists, activists, and high-risk users, but adds latency." },
    { name: "Obfuscation / Stealth", what: "Disguises your VPN traffic to look like regular, everyday HTTPS traffic. This hides the fact that you are using a VPN.", why: "Essential for bypassing VPN blocks and internet censorship in restrictive countries or on networks (like school or work) that ban VPNs." },
    { name: "RAM‑Only Servers", what: "The VPN provider's servers run entirely from volatile memory (RAM) instead of traditional hard drives.", why: "Dramatically enhances security. All data on a server is wiped clean every time it is rebooted, ensuring no data remnants can be seized or compromised." },
    { name: "Split Tunneling", what: "Allows you to choose which apps or websites go through the VPN and which connect directly to the internet.", why: "Offers a balance of speed and privacy. Useful for accessing local network devices or banking apps that may block VPN connections." },
    { name: "Threat & Ad Blocking", what: "A built-in feature that automatically blocks ads, trackers, and connections to known malicious domains.", why: "Improves your privacy, speeds up page load times, and provides a first line of defense against basic phishing and malware attacks." }
  ];

  const tbody = document.querySelector('#vpnTable tbody');
  const searchBox = document.getElementById('searchBox');
  const sortSelect = document.getElementById('sortSelect');
  const toggleAllBtn = document.getElementById('toggleAll');
  const exportCsvBtn = document.getElementById('exportCsv');
  const chipsWrap = document.getElementById('providerChips');

  function renderTable() {
    if (!providers.length) return;

    const selected = Array.from(chipsWrap.querySelectorAll('input:checked')).map(i => i.value);
    const q = searchBox.value.trim().toLowerCase();

    let rows = providers.filter(p => selected.includes(p.provider));
    if (q) {
      rows = rows.filter(p => Object.values(p).some(v => String(v).toLowerCase().includes(q)));
    }

    const sort = sortSelect.value;
    if (sort === 'price') rows.sort((a, b) => (a.price || 9999) - (b.price || 9999));
    if (sort === 'connections') rows.sort((a, b) => (b.connections || 0) - (a.connections || 0));
    if (sort === 'countries') rows.sort((a, b) => (b.countries || 0) - (a.countries || 0));

    if (rows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="12" style="text-align:center;padding:48px;">No providers match your filter.</td></tr>`;
        return;
    }
    
    tbody.innerHTML = rows.map(r => `
      <tr data-provider="${r.provider}">
        <td><strong>${r.provider}</strong></td>
        <td>${r.encryption || 'N/A'}</td>
        <td>${r.protocols || 'N/A'}</td>
        <td><span class="tag ${/audit/i.test(r.nologs) ? 'ok' : 'info'}">${r.nologs || 'N/A'}</span></td>
        <td>${r.killswitch ? '<span class="tag ok">Yes</span>' : '<span class="tag no">No</span>'}</td>
        <td>${(r.multihop === true || /^yes/i.test(String(r.multihop))) ? `<span class="tag ok">${r.multihop === true ? 'Yes' : r.multihop}</span>` : '<span class="tag no">No</span>'}</td>
        <td>${(r.obfuscation === true || /^yes/i.test(String(r.obfuscation))) ? `<span class="tag info">${r.obfuscation === true ? 'Yes' : r.obfuscation}</span>` : '<span class="tag no">No</span>'}</td>
        <td>${r.ramonly ? '<span class="tag info">Yes</span>' : '<span class="tag no">No</span>'}</td>
        <td>${r.connections === Infinity ? 'Unlimited' : r.connections}</td>
        <td>${r.countries}+</td>
        <td>${r.benefits || 'N/A'}</td>
        <td>$${r.price ? r.price.toFixed(2) : 'N/A'}</td>
      </tr>
    `).join('');

    const allChecked = chipsWrap.querySelectorAll('input:checked').length === chipsWrap.querySelectorAll('input').length;
    toggleAllBtn.textContent = allChecked ? 'Unselect All' : 'Select All';
  }
  
  function renderProviderChips() {
    chipsWrap.innerHTML = providers.map(p => `
        <label class="chip"><input type="checkbox" value="${p.provider}" checked> <strong>${p.provider}</strong></label>
    `).join('');
    chipsWrap.addEventListener('change', renderTable);
  }

  function exportCSV() {
    const headers = ["Provider", "Encryption", "Protocols", "No-Logs", "Kill Switch", "Multi-Hop", "Obfuscation", "RAM-Only", "Connections", "Server Countries", "Unique Benefits", "Price/mo"];
    const rows = Array.from(tbody.querySelectorAll('tr')).map(tr => Array.from(tr.children).map(td => td.innerText.replace(/\n/g, ' ').trim()));
    const csv = [headers, ...rows].map(r => r.map(v => '"' + v.replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vpn-comparison.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function renderFeatures() {
    const grid = document.getElementById('featuresGrid');
    grid.innerHTML = features.map(f => `
      <article class="feature">
        <h3>${f.name}</h3>
        <p><strong>What it is:</strong> ${f.what}</p>
        <p class="why"><strong>Why it matters:</strong> ${f.why}</p>
      </article>
    `).join('');
  }
  
  async function initializeApp() {
    try {
        const response = await fetch('/api/vpn-data');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        providers = await response.json();
        
        // Initial render
        renderProviderChips();
        renderTable();
        renderFeatures();

    } catch (error) {
        console.error("Failed to load VPN data:", error);
        tbody.innerHTML = `<tr><td colspan="12" style="text-align:center;padding:48px;color:var(--no);">Could not load VPN data. Please try again later.</td></tr>`;
    }

    // Setup event listeners after data is loaded
    searchBox.addEventListener('input', renderTable);
    sortSelect.addEventListener('change', renderTable);
    exportCsvBtn.addEventListener('click', exportCSV);
    toggleAllBtn.addEventListener('click', () => {
        const inputs = chipsWrap.querySelectorAll('input');
        const allChecked = Array.from(inputs).every(i => i.checked);
        inputs.forEach(i => i.checked = !allChecked);
        renderTable();
    });

    document.getElementById('year').textContent = new Date().getFullYear();
  }
  
  initializeApp();
});