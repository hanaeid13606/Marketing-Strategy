/**
 * STRATEGIZE // Core Application JavaScript (15-Section Restructure + Google Sheets Integration)
 * Handles state management, local storage, tab navigation,
 * dynamic widget rendering, progress calculation, and JSON export/import.
 */

// ==========================================================================
// STATE MANAGEMENT & DEFAULTS
// ==========================================================================
let state = {
  // Static fields (mapped by DOM ID)
  staticFields: {
    // Google Sheets Integration URL
    'google-sheet-url': '',

    // 1. Business Overview
    'company-name': '',
    'company-industry': '',
    'company-products': '',
    'company-usp': '',
    'company-position': '',
    'company-goals': '',
    
    // 2. Situation Analysis
    'situation-market': '',
    'situation-competitor': '',
    'swot-s': '',
    'swot-w': '',
    'swot-o': '',
    'swot-t': '',

    // 3. Target Audience
    'audience-primary': '',
    'audience-psychographics': '',
    'audience-painpoints': '',
    'audience-journey': '',

    // 5. Marketing Objectives
    'obj-brand': '',
    'obj-leads': '',
    'obj-sales': '',
    'obj-retention': '',
    'obj-smart-helper': '',

    // 6. Brand Positioning
    'pos-statement': '',
    'pos-personality': '',
    'pos-tone': '',

    // 7. Value Proposition
    'vp-functional': '',
    'vp-emotional': '',
    'vp-economic': '',

    // 8. Marketing Mix (7Ps)
    'mix-product': '',
    'mix-price': '',
    'mix-place': '',
    'mix-promotion': '',
    'mix-people': '',
    'mix-process': '',
    'mix-physical': '',

    // 9. Content Strategy
    'content-pillars': '',
    'content-messages': '',
    'content-formats': '',

    // 10. Channel Strategy
    'chan-social': '',
    'chan-influencers': '',
    'chan-paid': '',
    'chan-email': '',
    'chan-seo': '',
    'chan-partners': '',

    // 11. Campaign Strategy
    'camp-awareness': '',
    'camp-consideration': '',
    'camp-conversion': '',
    'camp-retention': '',

    // 12. Budget Allocation
    'bud-content': '',
    'bud-ads': '',
    'bud-influencers': '',
    'bud-production': '',
    'bud-events': '',
    'bud-research': '',

    // 13. KPIs
    'kpi-awareness': '',
    'kpi-engagement': '',
    'kpi-lead': '',
    'kpi-conversion': '',
    'kpi-retention': '',
    'kpi-roi': '',

    // 14. Implementation Timeline
    'time-m1': '',
    'time-m2': '',
    'time-m3': '',
    'time-m4': '',

    // 15. Recommendations
    'rec-quick': '',
    'rec-medium': '',
    'rec-long': ''
  },
  
  // Dynamic list for Buyer Personas
  personas: []
};

// LocalStorage Keys
const STORAGE_KEY = 'strategize_marketing_15_state';

// Debounce timer for auto-save
let saveTimeout = null;

// Unique ID Generator helper
const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

// Default dynamic items templates
const createDefaultPersona = (num) => ({
  id: generateId(),
  name: `Buyer Persona ${num || ''}`,
  age: '',
  occupation: '',
  goals: '',
  challenges: '',
  triggers: ''
});

// ==========================================================================
// INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupNavigation();
  setupEventListeners();
  renderPersonas();
  updateProgress();
});

// ==========================================================================
// NAVIGATION (TAB CONTROLLER)
// ==========================================================================
function setupNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  const sections = document.querySelectorAll('.strategy-section');

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetSection = btn.dataset.section;

      // Update nav buttons
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update content sections
      sections.forEach(sec => {
        sec.classList.remove('active');
        if (sec.id === `section-${targetSection}`) {
          sec.classList.add('active');
        }
      });
      
      // Auto-grow textareas on tab switch
      adjustTextareaHeights();
    });
  });
}

// ==========================================================================
// CORE PERSISTENCE (LOCAL STORAGE)
// ==========================================================================
function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Restore static fields
      if (parsed.staticFields) {
        state.staticFields = { ...state.staticFields, ...parsed.staticFields };
        for (const [id, val] of Object.entries(state.staticFields)) {
          const el = document.getElementById(id);
          if (el) el.value = val || '';
        }
      }
      // Restore dynamic lists
      state.personas = parsed.personas || [];
    } catch (e) {
      console.error("Error reading saved strategy state:", e);
    }
  } else {
    // Seed default personas
    state.personas.push(createDefaultPersona(1));
    state.personas.push(createDefaultPersona(2));
  }
}

function saveData(immediate = false) {
  const statusEl = document.querySelector('.sidebar-footer');
  
  if (statusEl) {
    statusEl.classList.add('saving');
  }

  // Update static fields from DOM
  for (const id of Object.keys(state.staticFields)) {
    const el = document.getElementById(id);
    if (el) {
      state.staticFields[id] = el.value;
    }
  }

  const runSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (statusEl) {
      statusEl.classList.remove('saving');
    }
    updateProgress();
  };

  if (immediate) {
    if (saveTimeout) clearTimeout(saveTimeout);
    runSave();
  } else {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(runSave, 600); // Debounce saves by 600ms
  }
}

// ==========================================================================
// DYNAMIC COMPONENT RENDERING
// ==========================================================================
function renderPersonas() {
  const container = document.getElementById('personas-container');
  if (!container) return;
  container.innerHTML = '';

  state.personas.forEach((persona, index) => {
    const card = document.createElement('div');
    card.className = 'dynamic-card';
    card.innerHTML = `
      <button class="card-remove-btn" data-id="${persona.id}" title="Remove Persona">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <div class="form-grid">
        <div class="form-group">
          <label>Persona Name</label>
          <input type="text" class="p-name" value="${persona.name || ''}" placeholder="e.g. Persona ${index+1}">
        </div>
        <div class="form-group">
          <label>Age & Occupation</label>
          <input type="text" class="p-age-occ" value="${persona.age || ''}" placeholder="e.g., 28, Product Manager">
        </div>
      </div>
      <div class="form-group">
        <label>Goals</label>
        <textarea class="p-goals mini-textarea" placeholder="What are their professional or personal goals?">${persona.goals || ''}</textarea>
      </div>
      <div class="form-group">
        <label>Challenges</label>
        <textarea class="p-challenges mini-textarea" placeholder="What pain points block them?">${persona.challenges || ''}</textarea>
      </div>
      <div class="form-group">
        <label>Buying Triggers</label>
        <textarea class="p-triggers mini-textarea" placeholder="What motivates them to purchase?">${persona.triggers || ''}</textarea>
      </div>
    `;

    // Bind inputs to state updates
    card.querySelectorAll('input, textarea').forEach(el => {
      el.addEventListener('input', () => {
        if (el.classList.contains('p-name')) persona.name = el.value;
        if (el.classList.contains('p-age-occ')) {
          persona.age = el.value; // Store age/occupation in the variable
        }
        if (el.classList.contains('p-goals')) persona.goals = el.value;
        if (el.classList.contains('p-challenges')) persona.challenges = el.value;
        if (el.classList.contains('p-triggers')) persona.triggers = el.value;
        saveData();
      });
    });

    // Remove event
    card.querySelector('.card-remove-btn').addEventListener('click', () => {
      state.personas = state.personas.filter(p => p.id !== persona.id);
      renderPersonas();
      saveData(true);
    });

    container.appendChild(card);
  });
}

// Helper to auto-fit textarea height
function adjustTextareaHeights() {
  document.querySelectorAll('textarea').forEach(textarea => {
    textarea.style.height = 'auto';
    textarea.style.height = (textarea.scrollHeight) + 'px';
  });
}

// ==========================================================================
// COMPLETION PROGRESS CALCULATION
// ==========================================================================
function updateProgress() {
  const sectionInputs = {
    overview: ['company-name', 'company-industry', 'company-products', 'company-usp', 'company-position', 'company-goals'],
    situation: ['situation-market', 'situation-competitor', 'swot-s', 'swot-w', 'swot-o', 'swot-t'],
    audience: ['audience-primary', 'audience-psychographics', 'audience-painpoints', 'audience-journey'],
    personas: [], // dynamic personas list
    objectives: ['obj-brand', 'obj-leads', 'obj-sales', 'obj-retention', 'obj-smart-helper'],
    positioning: ['pos-statement', 'pos-personality', 'pos-tone'],
    valprop: ['vp-functional', 'vp-emotional', 'vp-economic'],
    marketingmix: ['mix-product', 'mix-price', 'mix-place', 'mix-promotion', 'mix-people', 'mix-process', 'mix-physical'],
    contentstrategy: ['content-pillars', 'content-messages', 'content-formats'],
    channelstrategy: ['chan-social', 'chan-influencers', 'chan-paid', 'chan-email', 'chan-seo', 'chan-partners'],
    campaignstrategy: ['camp-awareness', 'camp-consideration', 'camp-conversion', 'camp-retention'],
    budget: ['bud-content', 'bud-ads', 'bud-influencers', 'bud-production', 'bud-events', 'bud-research'],
    kpis: ['kpi-awareness', 'kpi-engagement', 'kpi-lead', 'kpi-conversion', 'kpi-retention', 'kpi-roi'],
    timeline: ['time-m1', 'time-m2', 'time-m3', 'time-m4'],
    recommendations: ['rec-quick', 'rec-medium', 'rec-long']
  };

  let totalFields = 0;
  let filledFields = 0;

  // Process static sections (excluding configuration fields)
  for (const [section, fieldIds] of Object.entries(sectionInputs)) {
    if (fieldIds.length === 0) continue;
    
    let sectionTotal = fieldIds.length;
    let sectionFilled = 0;

    fieldIds.forEach(id => {
      const val = state.staticFields[id];
      if (val && val.trim() !== '') {
        sectionFilled++;
      }
    });

    totalFields += sectionTotal;
    filledFields += sectionFilled;

    updateSectionBadgeStatus(section, sectionFilled / sectionTotal);
  }

  // Process Personas list
  let personasScore = 0;
  if (state.personas.length > 0) {
    const personaFields = state.personas.length * 5;
    state.personas.forEach(p => {
      if (p.name && p.name.trim() !== '') personasScore++;
      if (p.age && p.age.trim() !== '') personasScore++;
      if (p.goals && p.goals.trim() !== '') personasScore++;
      if (p.challenges && p.challenges.trim() !== '') personasScore++;
      if (p.triggers && p.triggers.trim() !== '') personasScore++;
    });
    totalFields += personaFields;
    filledFields += personasScore;
    updateSectionBadgeStatus('personas', personasScore / personaFields);
  } else {
    updateSectionBadgeStatus('personas', 0);
  }

  // Calculate overall percentage
  const percent = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
  
  const fillBar = document.getElementById('progress-fill');
  const percentText = document.getElementById('progress-percent');
  if (fillBar) fillBar.style.width = `${percent}%`;
  if (percentText) percentText.textContent = `${percent}%`;
}

function updateSectionBadgeStatus(sectionId, ratio) {
  const btn = document.querySelector(`.nav-btn[data-section="${sectionId}"]`);
  if (!btn) return;

  if (ratio >= 0.75) {
    btn.classList.add('completed');
  } else {
    btn.classList.remove('completed');
  }
}

// ==========================================================================
// UTILITIES & EVENT LISTENERS
// ==========================================================================
function setupEventListeners() {
  // Static fields auto-save on change
  document.querySelectorAll('[data-save]').forEach(el => {
    el.addEventListener('input', () => saveData());
  });

  // Custom configuration event
  const sheetUrlEl = document.getElementById('google-sheet-url');
  if (sheetUrlEl) {
    sheetUrlEl.addEventListener('input', () => {
      state.staticFields['google-sheet-url'] = sheetUrlEl.value;
      saveData();
    });
  }

  // Dynamic add buttons
  document.getElementById('btn-add-persona').addEventListener('click', () => {
    state.personas.push(createDefaultPersona(state.personas.length + 1));
    renderPersonas();
    saveData(true);
  });

  // Submit to Google Sheets API
  document.getElementById('btn-submit-sheet').addEventListener('click', () => {
    const url = state.staticFields['google-sheet-url'];
    if (!url || url.trim() === '') {
      alert("Please configure your Google Sheet API URL in the bar on top of the workspace.");
      return;
    }

    const btn = document.getElementById('btn-submit-sheet');
    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = "Submitting...";

    // Send request
    fetch(url, {
      method: 'POST',
      mode: 'no-cors', // bypass CORS preflight redirects from Google Script macros
      headers: {
        'Content-Type': 'text/plain'
      },
      body: JSON.stringify(state)
    })
    .then(() => {
      alert("Strategy successfully submitted to Google Sheets!");
    })
    .catch((err) => {
      console.error(err);
      alert("Submit triggered. If it doesn't appear, check that your script is deployed for 'Anyone' and CORS is resolved.");
    })
    .finally(() => {
      btn.disabled = false;
      btn.innerHTML = originalHTML;
    });
  });

  // Reset workspace
  document.getElementById('btn-reset').addEventListener('click', () => {
    const confirmReset = confirm("Are you sure you want to reset your 15-Section Strategy Builder? This will wipe all progress.");
    if (confirmReset) {
      localStorage.removeItem(STORAGE_KEY);
      state = {
        staticFields: {
          'google-sheet-url': '',
          'company-name': '', 'company-industry': '', 'company-products': '', 'company-usp': '', 'company-position': '', 'company-goals': '',
          'situation-market': '', 'situation-competitor': '', 'swot-s': '', 'swot-w': '', 'swot-o': '', 'swot-t': '',
          'audience-primary': '', 'audience-psychographics': '', 'audience-painpoints': '', 'audience-journey': '',
          'obj-brand': '', 'obj-leads': '', 'obj-sales': '', 'obj-retention': '', 'obj-smart-helper': '',
          'pos-statement': '', 'pos-personality': '', 'pos-tone': '',
          'vp-functional': '', 'vp-emotional': '', 'vp-economic': '',
          'mix-product': '', 'mix-price': '', 'mix-place': '', 'mix-promotion': '', 'mix-people': '', 'mix-process': '', 'mix-physical': '',
          'content-pillars': '', 'content-messages': '', 'content-formats': '',
          'chan-social': '', 'chan-influencers': '', 'chan-paid': '', 'chan-email': '', 'chan-seo': '', 'chan-partners': '',
          'camp-awareness': '', 'camp-consideration': '', 'camp-conversion': '', 'camp-retention': '',
          'bud-content': '', 'bud-ads': '', 'bud-influencers': '', 'bud-production': '', 'bud-events': '', 'bud-research': '',
          'kpi-awareness': '', 'kpi-engagement': '', 'kpi-lead': '', 'kpi-conversion': '', 'kpi-retention': '', 'kpi-roi': '',
          'time-m1': '', 'time-m2': '', 'time-m3': '', 'time-m4': '',
          'rec-quick': '', 'rec-medium': '', 'rec-long': ''
        },
        personas: [createDefaultPersona(1), createDefaultPersona(2)]
      };
      
      // Clear all HTML inputs
      for (const id of Object.keys(state.staticFields)) {
        const el = document.getElementById(id);
        if (el) el.value = '';
      }
      
      renderPersonas();
      saveData(true);
    }
  });

  // Export JSON file
  document.getElementById('btn-export').addEventListener('click', () => {
    saveData(true);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const company = state.staticFields['company-name'] ? state.staticFields['company-name'].toLowerCase().replace(/[^a-z0-9]/g, '_') : 'my';
    const filename = `marketing_strategy_${company}_${new Date().toISOString().slice(0,10)}.json`;
    
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });

  // Import JSON uploader
  const fileUploader = document.getElementById('import-file');
  document.getElementById('btn-import-trigger').addEventListener('click', () => {
    fileUploader.click();
  });

  fileUploader.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.staticFields || parsed.personas) {
          state.staticFields = { ...state.staticFields, ...parsed.staticFields };
          state.personas = parsed.personas || [];

          // Populate static inputs
          for (const [id, val] of Object.entries(state.staticFields)) {
            const el = document.getElementById(id);
            if (el) el.value = val || '';
          }

          renderPersonas();
          saveData(true);
          alert("Strategy data successfully imported!");
        } else {
          alert("Invalid file format. Please upload a valid STRATEGIZE JSON file.");
        }
      } catch (err) {
        alert("Error parsing JSON file. Please ensure it is a valid format.");
      }
    };
    reader.readAsText(file);
    fileUploader.value = '';
  });

  // Print Strategy as PDF Document
  document.getElementById('btn-print').addEventListener('click', () => {
    saveData(true);
    buildPrintView();
    window.print();
  });
}

// ==========================================================================
// PRINT CONTROLLER & BUILDER (15 SECTIONS)
// ==========================================================================
function buildPrintView() {
  const printContainer = document.getElementById('print-content');
  const printStamp = document.getElementById('print-date-stamp');
  const printBrandTitle = document.getElementById('print-brand-title');
  
  if (!printContainer) return;
  
  const companyNameVal = state.staticFields['company-name'] || 'Unnamed Brand';
  printBrandTitle.textContent = `${companyNameVal.toUpperCase()} // MARKETING STRATEGY HUB`;
  printStamp.textContent = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  printContainer.innerHTML = '';
  const getCleanVal = (val) => (val && val.trim() !== '') ? val.replace(/\n/g, '<br>') : '<em>Not specified</em>';

  // Section configs for loop-based compilation
  const sectionsConfig = [
    {
      title: "1. Business Overview",
      fields: [
        { label: "Company Name", id: "company-name" },
        { label: "Industry", id: "company-industry" },
        { label: "Products / Services Offered", id: "company-products" },
        { label: "Unique Selling Proposition (USP)", id: "company-usp" },
        { label: "Current Market Position", id: "company-position" },
        { label: "Business Goals", id: "company-goals" }
      ]
    },
    {
      title: "2. Situation Analysis",
      fields: [
        { label: "Market Analysis", id: "situation-market" },
        { label: "Competitor Analysis", id: "situation-competitor" }
      ],
      customHTML: `
        <div class="print-swot-grid">
          <div class="print-swot-box" style="border-left: 3px solid #10b981;">
            <div class="print-swot-title" style="color: #10b981;">STRENGTHS</div>
            <div class="print-value">${getCleanVal(state.staticFields['swot-s'])}</div>
          </div>
          <div class="print-swot-box" style="border-left: 3px solid #f43f5e;">
            <div class="print-swot-title" style="color: #f43f5e;">WEAKNESSES</div>
            <div class="print-value">${getCleanVal(state.staticFields['swot-w'])}</div>
          </div>
          <div class="print-swot-box" style="border-left: 3px solid #06b6d4;">
            <div class="print-swot-title" style="color: #06b6d4;">OPPORTUNITIES</div>
            <div class="print-value">${getCleanVal(state.staticFields['swot-o'])}</div>
          </div>
          <div class="print-swot-box" style="border-left: 3px solid #8b5cf6;">
            <div class="print-swot-title" style="color: #8b5cf6;">THREATS</div>
            <div class="print-value">${getCleanVal(state.staticFields['swot-t'])}</div>
          </div>
        </div>
      `
    },
    {
      title: "3. Target Audience",
      fields: [
        { label: "Primary Audience", id: "audience-primary" },
        { label: "Psychographics", id: "audience-psychographics" },
        { label: "Pain Points", id: "audience-painpoints" },
        { label: "Customer Journey Map", id: "audience-journey" }
      ]
    },
    {
      title: "4. Buyer Personas",
      customRender: () => {
        let html = '';
        if (state.personas.length > 0) {
          state.personas.forEach(p => {
            html += `
              <div class="print-item-card" style="margin-bottom:15px;">
                <div class="print-item-title">${p.name || 'Unnamed Persona'} (${p.age || 'Age/Occ not specified'})</div>
                <div class="print-field">
                  <div class="print-label">Goals</div>
                  <div class="print-value">${getCleanVal(p.goals)}</div>
                </div>
                <div class="print-field">
                  <div class="print-label">Challenges</div>
                  <div class="print-value">${getCleanVal(p.challenges)}</div>
                </div>
                <div class="print-field">
                  <div class="print-label">Buying Triggers</div>
                  <div class="print-value">${getCleanVal(p.triggers)}</div>
                </div>
              </div>
            `;
          });
        } else {
          html = '<p><em>No buyer personas specified.</em></p>';
        }
        return `<div class="print-cards-grid">${html}</div>`;
      }
    },
    {
      title: "5. Marketing Objectives",
      fields: [
        { label: "Brand Awareness Objectives", id: "obj-brand" },
        { label: "Lead Generation Objectives", id: "obj-leads" },
        { label: "Sales Objectives", id: "obj-sales" },
        { label: "Customer Retention Objectives", id: "obj-retention" },
        { label: "SMART Goals Specification", id: "obj-smart-helper" }
      ]
    },
    {
      title: "6. Brand Positioning",
      fields: [
        { label: "Positioning Statement", id: "pos-statement" },
        { label: "Brand Personality", id: "pos-personality" },
        { label: "Tone of Voice Guidelines", id: "pos-tone" }
      ]
    },
    {
      title: "7. Value Proposition",
      fields: [
        { label: "Functional Benefits", id: "vp-functional" },
        { label: "Emotional Benefits", id: "vp-emotional" },
        { label: "Economic Benefits", id: "vp-economic" }
      ]
    },
    {
      title: "8. Marketing Mix (7Ps)",
      fields: [
        { label: "Product Strategy", id: "mix-product" },
        { label: "Price Strategy", id: "mix-price" },
        { label: "Place Strategy", id: "mix-place" },
        { label: "Promotion Strategy", id: "mix-promotion" },
        { label: "People Strategy", id: "mix-people" },
        { label: "Process Strategy", id: "mix-process" },
        { label: "Physical Evidence Strategy", id: "mix-physical" }
      ]
    },
    {
      title: "9. Content Strategy",
      fields: [
        { label: "Content Pillars", id: "content-pillars" },
        { label: "Key Messages", id: "content-messages" },
        { label: "Content Formats", id: "content-formats" }
      ]
    },
    {
      title: "10. Channel Strategy",
      fields: [
        { label: "Social Media Platform Strategy", id: "chan-social" },
        { label: "Influencer Marketing Strategy", id: "chan-influencers" },
        { label: "Paid Media Strategy", id: "chan-paid" },
        { label: "Email Marketing Strategy", id: "chan-email" },
        { label: "Website / SEO Strategy", id: "chan-seo" },
        { label: "Partnerships & Alliances", id: "chan-partners" }
      ]
    },
    {
      title: "11. Campaign Strategy",
      fields: [
        { label: "Awareness Campaign Outlines", id: "camp-awareness" },
        { label: "Consideration Campaign Outlines", id: "camp-consideration" },
        { label: "Conversion Campaign Outlines", id: "camp-conversion" },
        { label: "Retention Campaign Outlines", id: "camp-retention" }
      ]
    },
    {
      title: "12. Budget Allocation",
      fields: [
        { label: "Content Creation Budget", id: "bud-content" },
        { label: "Paid Advertising Budget", id: "bud-ads" },
        { label: "Influencer Budget", id: "bud-influencers" },
        { label: "Production Budget", id: "bud-production" },
        { label: "Events & Activations Budget", id: "bud-events" },
        { label: "Research & Analytics Budget", id: "bud-research" }
      ]
    },
    {
      title: "13. KPIs",
      fields: [
        { label: "Awareness Indicators", id: "kpi-awareness" },
        { label: "Engagement Indicators", id: "kpi-engagement" },
        { label: "Lead Generation Indicators", id: "kpi-lead" },
        { label: "Conversion Indicators", id: "kpi-conversion" },
        { label: "Retention Indicators", id: "kpi-retention" },
        { label: "ROI Indicators", id: "kpi-roi" }
      ]
    },
    {
      title: "14. Implementation Timeline",
      fields: [
        { label: "Month 1 Schedule", id: "time-m1" },
        { label: "Month 2 Schedule", id: "time-m2" },
        { label: "Month 3 Schedule", id: "time-m3" },
        { label: "Months 4-6 Schedule", id: "time-m4" }
      ]
    },
    {
      title: "15. Recommendations",
      fields: [
        { label: "Quick Wins", id: "rec-quick" },
        { label: "Medium-Term Actions", id: "rec-medium" },
        { label: "Long-Term Actions", id: "rec-long" }
      ]
    }
  ];

  // Compile output HTML
  sectionsConfig.forEach(sec => {
    let secHTML = `<div class="print-section"><h2>${sec.title}</h2>`;
    
    if (sec.fields) {
      sec.fields.forEach(f => {
        secHTML += `
          <div class="print-field">
            <div class="print-label">${f.label}</div>
            <div class="print-value">${getCleanVal(state.staticFields[f.id])}</div>
          </div>
        `;
      });
    }

    if (sec.customHTML) {
      secHTML += sec.customHTML;
    }

    if (sec.customRender) {
      secHTML += sec.customRender();
    }

    secHTML += `</div>`;
    printContainer.innerHTML += secHTML;
  });
}

// Window resizing height fits for textareas
window.addEventListener('resize', adjustTextareaHeights);
