/**
 * STRATEGIZE // Core Application JavaScript
 * Handles state management, local storage, tab navigation,
 * dynamic widget rendering, progress calculation, and JSON export/import.
 */

// ==========================================================================
// STATE MANAGEMENT & DEFAULTS
// ==========================================================================
let state = {
  // Static fields (mapped by DOM ID)
  staticFields: {
    'company-name': '',
    'market-description': '',
    'value-proposition': '',
    'swot-s': '',
    'swot-w': '',
    'swot-o': '',
    'swot-t': '',
    'brand-tagline': '',
    'elevator-pitch': '',
    'pillar1-title': '',
    'pillar1-desc': '',
    'pillar2-title': '',
    'pillar2-desc': '',
    'pillar3-title': '',
    'pillar3-desc': '',
    'strategy-content': '',
    'strategy-social': '',
    'strategy-media': '',
    'strategy-influencers': '',
    'strategy-activations': '',
    'primary-kpis': '',
    'budget-allocation': ''
  },
  // Dynamic lists
  personas: [],
  competitors: [],
  goals: [],
  milestones: []
};

// LocalStorage Keys
const STORAGE_KEY = 'strategize_marketing_state';

// Debounce timer for auto-save
let saveTimeout = null;

// Unique ID Generator helper
const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

// Default dynamic items templates
const createDefaultPersona = () => ({
  id: generateId(),
  name: '',
  demographics: '',
  goals: '',
  challenges: ''
});

const createDefaultCompetitor = () => ({
  id: generateId(),
  name: '',
  strengths: '',
  weaknesses: '',
  share: '',
  positioning: ''
});

const createDefaultGoal = () => ({
  id: generateId(),
  description: '',
  kpi: '',
  date: ''
});

const createDefaultMilestone = () => ({
  id: generateId(),
  date: '',
  title: '',
  owner: '',
  status: 'Planned' // Planned, In Progress, Completed
});

// ==========================================================================
// INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupNavigation();
  setupEventListeners();
  renderAllDynamicLists();
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
      state.competitors = parsed.competitors || [];
      state.goals = parsed.goals || [];
      state.milestones = parsed.milestones || [];
    } catch (e) {
      console.error("Error reading saved strategy state:", e);
    }
  } else {
    // Seed default state with one empty element each for guide rails
    state.personas.push(createDefaultPersona());
    state.competitors.push(createDefaultCompetitor());
    state.goals.push(createDefaultGoal());
    state.milestones.push(createDefaultMilestone());
  }
}

function saveData(immediate = false) {
  const statusEl = document.querySelector('.sidebar-footer');
  const textEl = document.getElementById('save-status');
  
  if (statusEl && textEl) {
    statusEl.classList.add('saving');
    textEl.textContent = 'Saving...';
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
    if (statusEl && textEl) {
      statusEl.classList.remove('saving');
      textEl.textContent = 'Saved locally';
    }
    updateProgress();
  };

  if (immediate) {
    if (saveTimeout) clearTimeout(saveTimeout);
    runSave();
  } else {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(runSave, 800); // Debounce saves by 800ms
  }
}

// ==========================================================================
// DYNAMIC COMPONENT RENDERING
// ==========================================================================
function renderAllDynamicLists() {
  renderPersonas();
  renderCompetitors();
  renderGoals();
  renderMilestones();
  adjustTextareaHeights();
}

// 1. Audience Personas
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
      <div class="form-group">
        <label>Persona Name / Segment ${index + 1}</label>
        <input type="text" class="p-name" value="${persona.name || ''}" placeholder="e.g., Tech-savvy Millennial, Enterprise IT Buyer...">
      </div>
      <div class="form-group">
        <label>Demographics & Traits</label>
        <input type="text" class="p-demo" value="${persona.demographics || ''}" placeholder="Age, Occupation, Budget, Key Channels...">
      </div>
      <div class="form-group">
        <label>Goals & Motivations</label>
        <textarea class="p-goals mini-textarea" placeholder="What are they trying to achieve? What drives their purchase decision?">${persona.goals || ''}</textarea>
      </div>
      <div class="form-group">
        <label>Core Challenges & Pain Points</label>
        <textarea class="p-challenges mini-textarea" placeholder="What frustrates them with current solutions? Where are their obstacles?">${persona.challenges || ''}</textarea>
      </div>
    `;

    // Bind inputs to state updates
    card.querySelectorAll('input, textarea').forEach(el => {
      el.addEventListener('input', () => {
        if (el.classList.contains('p-name')) persona.name = el.value;
        if (el.classList.contains('p-demo')) persona.demographics = el.value;
        if (el.classList.contains('p-goals')) persona.goals = el.value;
        if (el.classList.contains('p-challenges')) persona.challenges = el.value;
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

// 2. Competitor Matrix
function renderCompetitors() {
  const container = document.getElementById('competitors-container');
  if (!container) return;
  container.innerHTML = '';

  state.competitors.forEach((comp, index) => {
    const card = document.createElement('div');
    card.className = 'dynamic-card';
    card.innerHTML = `
      <button class="card-remove-btn" data-id="${comp.id}" title="Remove Competitor">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <div class="competitor-meta-row">
        <div class="form-group">
          <label>Competitor Name ${index + 1}</label>
          <input type="text" class="c-name" value="${comp.name || ''}" placeholder="Competitor company name...">
        </div>
        <div class="form-group">
          <label>Market Share (%)</label>
          <input type="text" class="c-share" value="${comp.share || ''}" placeholder="e.g., 25% or High...">
        </div>
      </div>
      <div class="form-group">
        <label>Market Positioning & Focus</label>
        <input type="text" class="c-pos" value="${comp.positioning || ''}" placeholder="e.g., Premium pricing, low cost, developer-first...">
      </div>
      <div class="form-group">
        <label>Key Strengths</label>
        <textarea class="c-strengths mini-textarea" placeholder="What do they do exceptionally well? Brand reputation, features?">${comp.strengths || ''}</textarea>
      </div>
      <div class="form-group">
        <label>Key Weaknesses & Vulnerabilities</label>
        <textarea class="c-weaknesses mini-textarea" placeholder="Where do they struggle? Customer service, outdated tech?">${comp.weaknesses || ''}</textarea>
      </div>
    `;

    card.querySelectorAll('input, textarea').forEach(el => {
      el.addEventListener('input', () => {
        if (el.classList.contains('c-name')) comp.name = el.value;
        if (el.classList.contains('c-share')) comp.share = el.value;
        if (el.classList.contains('c-pos')) comp.positioning = el.value;
        if (el.classList.contains('c-strengths')) comp.strengths = el.value;
        if (el.classList.contains('c-weaknesses')) comp.weaknesses = el.value;
        saveData();
      });
    });

    card.querySelector('.card-remove-btn').addEventListener('click', () => {
      state.competitors = state.competitors.filter(c => c.id !== comp.id);
      renderCompetitors();
      saveData(true);
    });

    container.appendChild(card);
  });
}

// 3. Objectives & SMART Goals
function renderGoals() {
  const container = document.getElementById('goals-container');
  if (!container) return;
  container.innerHTML = '';

  state.goals.forEach((goal, index) => {
    const item = document.createElement('div');
    item.className = 'goal-item';
    item.innerHTML = `
      <button class="card-remove-btn" data-id="${goal.id}" title="Remove Goal">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <div class="form-group">
        <label>Goal Objective ${index + 1}</label>
        <input type="text" class="g-desc" value="${goal.description || ''}" placeholder="e.g., Increase organic SaaS signups by 30%...">
      </div>
      <div class="form-group">
        <label>Success Metric / KPI Target</label>
        <input type="text" class="g-kpi" value="${goal.kpi || ''}" placeholder="e.g., 1,500 new trials/mo...">
      </div>
      <div class="form-group">
        <label>Target Date</label>
        <input type="date" class="g-date" value="${goal.date || ''}">
      </div>
    `;

    item.querySelectorAll('input').forEach(el => {
      el.addEventListener('input', () => {
        if (el.classList.contains('g-desc')) goal.description = el.value;
        if (el.classList.contains('g-kpi')) goal.kpi = el.value;
        if (el.classList.contains('g-date')) goal.date = el.value;
        saveData();
      });
    });

    item.querySelector('.card-remove-btn').addEventListener('click', () => {
      state.goals = state.goals.filter(g => g.id !== goal.id);
      renderGoals();
      saveData(true);
    });

    container.appendChild(item);
  });
}

// 4. Timeline Milestones
function renderMilestones() {
  const container = document.getElementById('timeline-container');
  if (!container) return;
  container.innerHTML = '';

  state.milestones.forEach((milestone, index) => {
    const node = document.createElement('div');
    node.className = 'timeline-node';
    
    const plannedSelected = milestone.status === 'Planned' ? 'selected' : '';
    const progressSelected = milestone.status === 'In Progress' ? 'selected' : '';
    const completedSelected = milestone.status === 'Completed' ? 'selected' : '';

    node.innerHTML = `
      <button class="card-remove-btn" data-id="${milestone.id}" title="Remove Milestone">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <div class="form-group">
        <label>Target Date</label>
        <input type="date" class="m-date" value="${milestone.date || ''}">
      </div>
      <div class="form-group">
        <label>Milestone Initiative / Task</label>
        <input type="text" class="m-title" value="${milestone.title || ''}" placeholder="e.g., Website Rebrand Launch...">
      </div>
      <div class="form-group">
        <label>Lead Owner</label>
        <input type="text" class="m-owner" value="${milestone.owner || ''}" placeholder="e.g., Product Marketing...">
      </div>
      <div class="form-group">
        <label>Status</label>
        <select class="m-status">
          <option value="Planned" ${plannedSelected}>Planned</option>
          <option value="In Progress" ${progressSelected}>In Progress</option>
          <option value="Completed" ${completedSelected}>Completed</option>
        </select>
      </div>
    `;

    node.querySelectorAll('input, select').forEach(el => {
      el.addEventListener('input', () => {
        if (el.classList.contains('m-date')) milestone.date = el.value;
        if (el.classList.contains('m-title')) milestone.title = el.value;
        if (el.classList.contains('m-owner')) milestone.owner = el.value;
        if (el.classList.contains('m-status')) milestone.status = el.value;
        saveData();
      });
    });

    node.querySelector('.card-remove-btn').addEventListener('click', () => {
      state.milestones = state.milestones.filter(m => m.id !== milestone.id);
      renderMilestones();
      saveData(true);
    });

    container.appendChild(node);
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
// STRATEGY COMPLETION PROGRESS LOGIC
// ==========================================================================
function updateProgress() {
  // Define mapping of sections to input groups
  const sectionInputs = {
    overview: [
      'company-name', 'market-description', 'value-proposition',
      'swot-s', 'swot-w', 'swot-o', 'swot-t'
    ],
    audience: [], // calculated dynamically
    competitors: [], // calculated dynamically
    objectives: [], // calculated dynamically
    positioning: [
      'brand-tagline', 'elevator-pitch',
      'pillar1-title', 'pillar1-desc',
      'pillar2-title', 'pillar2-desc',
      'pillar3-title', 'pillar3-desc'
    ],
    strategy: [
      'strategy-content', 'strategy-social', 'strategy-media',
      'strategy-influencers', 'strategy-activations'
    ],
    kpis: [
      'primary-kpis', 'budget-allocation'
    ]
  };

  let totalFields = 0;
  let filledFields = 0;

  // Process static sections
  for (const [section, fieldIds] of Object.entries(sectionInputs)) {
    if (fieldIds.length === 0) continue; // skip dynamic lists here
    
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

    // Update section indicator dot badge in sidebar
    updateSectionBadgeStatus(section, sectionFilled / sectionTotal);
  }

  // Process dynamic lists
  // 1. Personas
  let personasScore = 0;
  if (state.personas.length > 0) {
    const personaFields = state.personas.length * 4;
    state.personas.forEach(p => {
      if (p.name && p.name.trim() !== '') personasScore++;
      if (p.demographics && p.demographics.trim() !== '') personasScore++;
      if (p.goals && p.goals.trim() !== '') personasScore++;
      if (p.challenges && p.challenges.trim() !== '') personasScore++;
    });
    totalFields += personaFields;
    filledFields += personasScore;
    updateSectionBadgeStatus('audience', personasScore / personaFields);
  } else {
    // If no persona exists, mark as incomplete (0%)
    updateSectionBadgeStatus('audience', 0);
  }

  // 2. Competitors
  let competitorScore = 0;
  if (state.competitors.length > 0) {
    const compFields = state.competitors.length * 5;
    state.competitors.forEach(c => {
      if (c.name && c.name.trim() !== '') competitorScore++;
      if (c.share && c.share.trim() !== '') competitorScore++;
      if (c.positioning && c.positioning.trim() !== '') competitorScore++;
      if (c.strengths && c.strengths.trim() !== '') competitorScore++;
      if (c.weaknesses && c.weaknesses.trim() !== '') competitorScore++;
    });
    totalFields += compFields;
    filledFields += competitorScore;
    updateSectionBadgeStatus('competitors', competitorScore / compFields);
  } else {
    updateSectionBadgeStatus('competitors', 0);
  }

  // 3. Objectives / SMART Goals
  let goalsScore = 0;
  if (state.goals.length > 0) {
    const goalFields = state.goals.length * 3;
    state.goals.forEach(g => {
      if (g.description && g.description.trim() !== '') goalsScore++;
      if (g.kpi && g.kpi.trim() !== '') goalsScore++;
      if (g.date && g.date.trim() !== '') goalsScore++;
    });
    totalFields += goalFields;
    filledFields += goalsScore;
    updateSectionBadgeStatus('objectives', goalsScore / goalFields);
  } else {
    updateSectionBadgeStatus('objectives', 0);
  }

  // 4. Timeline
  let milestoneScore = 0;
  let milestoneTotalFields = state.staticFields['primary-kpis'].trim() !== '' ? 1 : 0;
  milestoneTotalFields += state.staticFields['budget-allocation'].trim() !== '' ? 1 : 0;
  
  if (state.milestones.length > 0) {
    const mFields = state.milestones.length * 4;
    state.milestones.forEach(m => {
      if (m.date && m.date.trim() !== '') milestoneScore++;
      if (m.title && m.title.trim() !== '') milestoneScore++;
      if (m.owner && m.owner.trim() !== '') milestoneScore++;
      if (m.status && m.status.trim() !== '') milestoneScore++;
    });
    totalFields += mFields;
    filledFields += milestoneScore;
    
    // Combine KPI static fields and Milestones for Section 7 indicator
    const totalKPISectionFields = mFields + 2;
    let kpiStaticScore = 0;
    if (state.staticFields['primary-kpis'].trim() !== '') kpiStaticScore++;
    if (state.staticFields['budget-allocation'].trim() !== '') kpiStaticScore++;
    updateSectionBadgeStatus('kpis', (milestoneScore + kpiStaticScore) / totalKPISectionFields);
  } else {
    let kpiStaticScore = 0;
    if (state.staticFields['primary-kpis'].trim() !== '') kpiStaticScore++;
    if (state.staticFields['budget-allocation'].trim() !== '') kpiStaticScore++;
    updateSectionBadgeStatus('kpis', kpiStaticScore / 2);
  }

  // Calculate overall percentage
  const percent = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
  
  // Update sidebar headers
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
// EXPORT, IMPORT, AND UTILITIES
// ==========================================================================
function setupEventListeners() {
  // Static fields auto-save on input/textarea change
  document.querySelectorAll('[data-save]').forEach(el => {
    el.addEventListener('input', () => saveData());
  });

  // Dynamic content add buttons
  document.getElementById('btn-add-persona').addEventListener('click', () => {
    state.personas.push(createDefaultPersona());
    renderPersonas();
    saveData(true);
  });

  document.getElementById('btn-add-competitor').addEventListener('click', () => {
    state.competitors.push(createDefaultCompetitor());
    renderCompetitors();
    saveData(true);
  });

  document.getElementById('btn-add-goal').addEventListener('click', () => {
    state.goals.push(createDefaultGoal());
    renderGoals();
    saveData(true);
  });

  document.getElementById('btn-add-milestone').addEventListener('click', () => {
    state.milestones.push(createDefaultMilestone());
    renderMilestones();
    saveData(true);
  });

  // Reset Application Data
  document.getElementById('btn-reset').addEventListener('click', () => {
    const confirmReset = confirm("Are you sure you want to reset your workspace? All draft data will be permanently wiped.");
    if (confirmReset) {
      localStorage.removeItem(STORAGE_KEY);
      state = {
        staticFields: {
          'company-name': '',
          'market-description': '',
          'value-proposition': '',
          'swot-s': '',
          'swot-w': '',
          'swot-o': '',
          'swot-t': '',
          'brand-tagline': '',
          'elevator-pitch': '',
          'pillar1-title': '',
          'pillar1-desc': '',
          'pillar2-title': '',
          'pillar2-desc': '',
          'pillar3-title': '',
          'pillar3-desc': '',
          'strategy-content': '',
          'strategy-social': '',
          'strategy-media': '',
          'strategy-influencers': '',
          'strategy-activations': '',
          'primary-kpis': '',
          'budget-allocation': ''
        },
        personas: [createDefaultPersona()],
        competitors: [createDefaultCompetitor()],
        goals: [createDefaultGoal()],
        milestones: [createDefaultMilestone()]
      };
      
      // Wipe DOM input fields
      for (const id of Object.keys(state.staticFields)) {
        const el = document.getElementById(id);
        if (el) el.value = '';
      }
      
      renderAllDynamicLists();
      saveData(true);
    }
  });

  // Export JSON file
  document.getElementById('btn-export').addEventListener('click', () => {
    saveData(immediate = true);
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

  // Import JSON trigger uploader
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
        if (parsed.staticFields || parsed.personas || parsed.competitors) {
          state.staticFields = { ...state.staticFields, ...parsed.staticFields };
          state.personas = parsed.personas || [];
          state.competitors = parsed.competitors || [];
          state.goals = parsed.goals || [];
          state.milestones = parsed.milestones || [];

          // Populate static inputs
          for (const [id, val] of Object.entries(state.staticFields)) {
            const el = document.getElementById(id);
            if (el) el.value = val || '';
          }

          renderAllDynamicLists();
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
    fileUploader.value = ''; // clear value to allow uploading same file again
  });

  // Print Strategy as PDF Document
  document.getElementById('btn-print').addEventListener('click', () => {
    saveData(true);
    buildPrintView();
    window.print();
  });
}

// ==========================================================================
// PRINT FORMATTER
// ==========================================================================
function buildPrintView() {
  const printContainer = document.getElementById('print-content');
  const printStamp = document.getElementById('print-date-stamp');
  const printBrandTitle = document.getElementById('print-brand-title');
  
  if (!printContainer) return;
  
  // Set meta values
  const companyNameVal = state.staticFields['company-name'] || 'Unnamed Brand';
  printBrandTitle.textContent = `${companyNameVal.toUpperCase()} // MARKETING STRATEGY PLAN`;
  printStamp.textContent = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  // Clear previous print contents
  printContainer.innerHTML = '';

  const getCleanVal = (val) => (val && val.trim() !== '') ? val.replace(/\n/g, '<br>') : '<em>Not specified</em>';

  // Section 1: Business Overview
  let swotStrengths = getCleanVal(state.staticFields['swot-s']);
  let swotWeaknesses = getCleanVal(state.staticFields['swot-w']);
  let swotOpportunities = getCleanVal(state.staticFields['swot-o']);
  let swotThreats = getCleanVal(state.staticFields['swot-t']);

  let sec1HTML = `
    <div class="print-section">
      <h2>1. Business & Market Overview</h2>
      <div class="print-field">
        <div class="print-label">Brand / Company Name</div>
        <div class="print-value">${getCleanVal(state.staticFields['company-name'])}</div>
      </div>
      <div class="print-field">
        <div class="print-label">Market & Industry Description</div>
        <div class="print-value">${getCleanVal(state.staticFields['market-description'])}</div>
      </div>
      <div class="print-field">
        <div class="print-label">Unique Value Proposition (UVP)</div>
        <div class="print-value">${getCleanVal(state.staticFields['value-proposition'])}</div>
      </div>

      <div class="print-swot-grid">
        <div class="print-swot-box" style="border-left: 3px solid #10b981;">
          <div class="print-swot-title" style="color: #10b981;">STRENGTHS (Internal)</div>
          <div class="print-value">${swotStrengths}</div>
        </div>
        <div class="print-swot-box" style="border-left: 3px solid #f43f5e;">
          <div class="print-swot-title" style="color: #f43f5e;">WEAKNESSES (Internal)</div>
          <div class="print-value">${swotWeaknesses}</div>
        </div>
        <div class="print-swot-box" style="border-left: 3px solid #06b6d4;">
          <div class="print-swot-title" style="color: #06b6d4;">OPPORTUNITIES (External)</div>
          <div class="print-value">${swotOpportunities}</div>
        </div>
        <div class="print-swot-box" style="border-left: 3px solid #a855f7;">
          <div class="print-swot-title" style="color: #a855f7;">THREATS (External)</div>
          <div class="print-value">${swotThreats}</div>
        </div>
      </div>
    </div>
  `;
  printContainer.innerHTML += sec1HTML;

  // Section 2: Audience Insights
  let personasHTML = '';
  if (state.personas.length > 0) {
    state.personas.forEach(p => {
      personasHTML += `
        <div class="print-item-card">
          <div class="print-item-title">${p.name || 'Unnamed Segment'}</div>
          <div class="print-field">
            <div class="print-label">Demographics & Key Channels</div>
            <div class="print-value">${getCleanVal(p.demographics)}</div>
          </div>
          <div class="print-field">
            <div class="print-label">Goals & Motivations</div>
            <div class="print-value">${getCleanVal(p.goals)}</div>
          </div>
          <div class="print-field">
            <div class="print-label">Core Challenges & Pain Points</div>
            <div class="print-value">${getCleanVal(p.challenges)}</div>
          </div>
        </div>
      `;
    });
  } else {
    personasHTML = '<p><em>No target customer personas documented.</em></p>';
  }

  let sec2HTML = `
    <div class="print-section">
      <h2>2. Audience Insights</h2>
      <div class="print-cards-grid">
        ${personasHTML}
      </div>
    </div>
  `;
  printContainer.innerHTML += sec2HTML;

  // Section 3: Competitor Analysis
  let competitorsHTML = '';
  if (state.competitors.length > 0) {
    state.competitors.forEach(c => {
      competitorsHTML += `
        <div class="print-item-card">
          <div class="print-item-title">${c.name || 'Unnamed Competitor'} (Est. Market Share: ${c.share || 'Not Specified'})</div>
          <div class="print-field">
            <div class="print-label">Market Positioning & Focus</div>
            <div class="print-value">${getCleanVal(c.positioning)}</div>
          </div>
          <div class="print-field">
            <div class="print-label">Key Strengths</div>
            <div class="print-value">${getCleanVal(c.strengths)}</div>
          </div>
          <div class="print-field">
            <div class="print-label">Key Weaknesses</div>
            <div class="print-value">${getCleanVal(c.weaknesses)}</div>
          </div>
        </div>
      `;
    });
  } else {
    competitorsHTML = '<p><em>No competitor analyses documented.</em></p>';
  }

  let sec3HTML = `
    <div class="print-section">
      <h2>3. Competitor Analysis</h2>
      <div class="print-cards-grid">
        ${competitorsHTML}
      </div>
    </div>
  `;
  printContainer.innerHTML += sec3HTML;

  // Section 4: Objectives
  let goalsRowsHTML = '';
  if (state.goals.length > 0) {
    state.goals.forEach((g, index) => {
      goalsRowsHTML += `
        <tr>
          <td><strong>Objective #${index+1}</strong></td>
          <td>${getCleanVal(g.description)}</td>
          <td>${getCleanVal(g.kpi)}</td>
          <td>${g.date ? new Date(g.date).toLocaleDateString() : '<em>Not specified</em>'}</td>
        </tr>
      `;
    });
  } else {
    goalsRowsHTML = `<tr><td colspan="4" style="text-align: center;">No SMART objectives specified.</td></tr>`;
  }

  let sec4HTML = `
    <div class="print-section">
      <h2>4. SMART Objectives</h2>
      <table class="print-table">
        <thead>
          <tr>
            <th style="width: 15%">Objective</th>
            <th style="width: 45%">Goal Description</th>
            <th style="width: 25%">KPI Target</th>
            <th style="width: 15%">Target Date</th>
          </tr>
        </thead>
        <tbody>
          ${goalsRowsHTML}
        </tbody>
      </table>
    </div>
  `;
  printContainer.innerHTML += sec4HTML;

  // Section 5: Positioning & Messaging
  let sec5HTML = `
    <div class="print-section">
      <h2>5. Positioning & Key Messaging</h2>
      <div class="print-field">
        <div class="print-label">Core Brand Tagline</div>
        <div class="print-value">${getCleanVal(state.staticFields['brand-tagline'])}</div>
      </div>
      <div class="print-field">
        <div class="print-label">Elevator Pitch</div>
        <div class="print-value">${getCleanVal(state.staticFields['elevator-pitch'])}</div>
      </div>
      
      <h3 style="color: #222; font-size: 13pt; margin: 15px 0 10px 0;">Brand Pillars</h3>
      <div class="print-cards-grid" style="grid-template-columns: repeat(3, 1fr); gap: 15px;">
        <div class="print-item-card" style="margin-bottom: 0;">
          <div class="print-item-title" style="font-size: 11pt; border-bottom-color: #6366f1;">Pillar 1: ${getCleanVal(state.staticFields['pillar1-title'])}</div>
          <div class="print-value" style="font-size: 9.5pt;">${getCleanVal(state.staticFields['pillar1-desc'])}</div>
        </div>
        <div class="print-item-card" style="margin-bottom: 0;">
          <div class="print-item-title" style="font-size: 11pt; border-bottom-color: #a855f7;">Pillar 2: ${getCleanVal(state.staticFields['pillar2-title'])}</div>
          <div class="print-value" style="font-size: 9.5pt;">${getCleanVal(state.staticFields['pillar2-desc'])}</div>
        </div>
        <div class="print-item-card" style="margin-bottom: 0;">
          <div class="print-item-title" style="font-size: 11pt; border-bottom-color: #06b6d4;">Pillar 3: ${getCleanVal(state.staticFields['pillar3-title'])}</div>
          <div class="print-value" style="font-size: 9.5pt;">${getCleanVal(state.staticFields['pillar3-desc'])}</div>
        </div>
      </div>
    </div>
  `;
  printContainer.innerHTML += sec5HTML;

  // Section 6: Marketing Channels & Strategies
  let sec6HTML = `
    <div class="print-section">
      <h2>6. Marketing Strategy & Distribution Channels</h2>
      <div class="print-field">
        <div class="print-label">Content Strategy</div>
        <div class="print-value">${getCleanVal(state.staticFields['strategy-content'])}</div>
      </div>
      <div class="print-field">
        <div class="print-label">Social Media</div>
        <div class="print-value">${getCleanVal(state.staticFields['strategy-social'])}</div>
      </div>
      <div class="print-field">
        <div class="print-label">Paid Media & Search</div>
        <div class="print-value">${getCleanVal(state.staticFields['strategy-media'])}</div>
      </div>
      <div class="print-field">
        <div class="print-label">Influencers & Partnerships</div>
        <div class="print-value">${getCleanVal(state.staticFields['strategy-influencers'])}</div>
      </div>
      <div class="print-field">
        <div class="print-label">Brand Activations & Offline Initiatives</div>
        <div class="print-value">${getCleanVal(state.staticFields['strategy-activations'])}</div>
      </div>
    </div>
  `;
  printContainer.innerHTML += sec6HTML;

  // Section 7: KPIs & Timeline
  let milestonesRowsHTML = '';
  if (state.milestones.length > 0) {
    // Sort milestones by date for print
    const sortedMilestones = [...state.milestones].sort((a, b) => new Date(a.date) - new Date(b.date));
    sortedMilestones.forEach(m => {
      milestonesRowsHTML += `
        <tr>
          <td>${m.date ? new Date(m.date).toLocaleDateString() : '<em>Not specified</em>'}</td>
          <td>${getCleanVal(m.title)}</td>
          <td>${getCleanVal(m.owner)}</td>
          <td><span style="font-weight: 600;">${m.status}</span></td>
        </tr>
      `;
    });
  } else {
    milestonesRowsHTML = `<tr><td colspan="4" style="text-align: center;">No roadmap milestones planned.</td></tr>`;
  }

  let sec7HTML = `
    <div class="print-section">
      <h2>7. Key Metrics, Budgets & Implementation Roadmap</h2>
      <div class="print-field">
        <div class="print-label">Primary KPIs & Targets</div>
        <div class="print-value">${getCleanVal(state.staticFields['primary-kpis'])}</div>
      </div>
      <div class="print-field">
        <div class="print-label">High-level Budget Allocations</div>
        <div class="print-value">${getCleanVal(state.staticFields['budget-allocation'])}</div>
      </div>
      
      <h3 style="color: #222; font-size: 13pt; margin: 15px 0 10px 0;">Implementation Roadmap</h3>
      <table class="print-table">
        <thead>
          <tr>
            <th style="width: 15%">Date</th>
            <th style="width: 50%">Initiative / Task</th>
            <th style="width: 20%">Lead Owner</th>
            <th style="width: 15%">Status</th>
          </tr>
        </thead>
        <tbody>
          ${milestonesRowsHTML}
        </tbody>
      </table>
    </div>
  `;
  printContainer.innerHTML += sec7HTML;
}

// Window resizing adjustments for auto-grow textareas
window.addEventListener('resize', adjustTextareaHeights);
