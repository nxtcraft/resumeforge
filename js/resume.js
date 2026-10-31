// ── STATE ──
let state = {
  template: 'classic',
  color: '#7c3aed',
  font: 'serif',
  exp: [],
  edu: [],
};

const COLORS = ['#7c3aed','#2563eb','#0891b2','#059669','#dc2626','#d97706','#1e293b','#6b7280'];

// ── INIT ──
window.onload = () => {
  buildColorRow();
  addExp(); addEdu();
  render();
  loadSaved();
};

function buildColorRow() {
  const row = document.getElementById('colorRow');
  row.innerHTML = COLORS.map(c => `
    <div class="color-dot ${c === state.color ? 'selected' : ''}"
      style="background:${c}" data-c="${c}"
      onclick="selectColor('${c}')"></div>
  `).join('');
}

function selectColor(c) {
  state.color = c;
  buildColorRow();
  render();
}

function selectTemplate(t) {
  state.template = t;
  document.querySelectorAll('.tmpl-card').forEach(el => el.classList.remove('selected'));
  document.getElementById('tmpl-' + t).classList.add('selected');
  render();
}

function switchTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('tab-' + name).classList.add('active');
}

// ── DATA HELPERS ──
function v(id) { const el = document.getElementById(id); return el ? el.value.trim() : ''; }
function escH(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>'); }
function tags(str) { return str.split(',').map(s=>s.trim()).filter(Boolean); }

function getData() {
  return {
    name: v('p_name'), role: v('p_role'), email: v('p_email'), phone: v('p_phone'),
    city: v('p_city'), link: v('p_link'), summary: v('p_summary'),
    dob: v('p_dob'), gender: v('p_gender'), marital: v('p_marital'),
    nationality: v('p_nationality'), langs: v('p_langs'), father: v('p_father'),
    address: v('p_address'),
    techSkills: tags(v('s_tech')), softSkills: tags(v('s_soft')),
    certs: v('s_certs'), projects: v('s_projects'), hobbies: v('s_hobbies'),
    exp: state.exp, edu: state.edu,
    template: state.template, color: state.color, font: v('fontStyle') || 'serif',
  };
}

// ── EXPERIENCE ──
function addExp(data={}) {
  const id = Date.now();
  state.exp.push({ id, title: data.title||'', company: data.company||'', period: data.period||'', desc: data.desc||'' });
  renderExpList();
}
function removeExp(id) { state.exp = state.exp.filter(e=>e.id!==id); renderExpList(); render(); }
function updateExp(id, field, val) { const e = state.exp.find(x=>x.id===id); if(e) { e[field]=val; render(); } }
function renderExpList() {
  document.getElementById('exp-list').innerHTML = state.exp.map(e => `
    <div class="rep-item">
      <button class="rep-item-remove" onclick="removeExp(${e.id})">×</button>
      <div class="field"><label>Job Title</label><input value="${escHtml(e.title)}" oninput="updateExp(${e.id},'title',this.value)" placeholder="Software Engineer"></div>
      <div class="half">
        <div class="field"><label>Company</label><input value="${escHtml(e.company)}" oninput="updateExp(${e.id},'company',this.value)" placeholder="Google"></div>
        <div class="field"><label>Period</label><input value="${escHtml(e.period)}" oninput="updateExp(${e.id},'period',this.value)" placeholder="Jun 2022 – Present"></div>
      </div>
      <div class="field"><label>Description</label><textarea oninput="updateExp(${e.id},'desc',this.value)" placeholder="Key responsibilities and achievements...">${escHtml(e.desc)}</textarea></div>
    </div>
  `).join('');
}

// ── EDUCATION ──
function addEdu(data={}) {
  const id = Date.now() + 1;
  state.edu.push({ id, degree: data.degree||'', school: data.school||'', year: data.year||'', grade: data.grade||'' });
  renderEduList();
}
function removeEdu(id) { state.edu = state.edu.filter(e=>e.id!==id); renderEduList(); render(); }
function updateEdu(id, field, val) { const e = state.edu.find(x=>x.id===id); if(e) { e[field]=val; render(); } }
function renderEduList() {
  document.getElementById('edu-list').innerHTML = state.edu.map(e => `
    <div class="rep-item">
      <button class="rep-item-remove" onclick="removeEdu(${e.id})">×</button>
      <div class="field"><label>Degree / Course</label><input value="${escHtml(e.degree)}" oninput="updateEdu(${e.id},'degree',this.value)" placeholder="B.Tech Computer Science"></div>
      <div class="half">
        <div class="field"><label>School / University</label><input value="${escHtml(e.school)}" oninput="updateEdu(${e.id},'school',this.value)" placeholder="IIT Bombay"></div>
        <div class="field"><label>Year & Grade</label><input value="${escHtml(e.year)}" oninput="updateEdu(${e.id},'year',this.value)" placeholder="2022 · 8.4 CGPA"></div>
      </div>
    </div>
  `).join('');
}

function escHtml(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ── RENDER TEMPLATES ──
function render() {
  const d = getData();
  const paper = document.getElementById('resumePaper');
  paper.className = 'resume-paper tmpl-' + d.template;
  paper.style.fontFamily = d.font === 'sans' ? 'system-ui, sans-serif' : 'Times New Roman, serif';

  if (d.template === 'classic') paper.innerHTML = renderClassic(d);
  else if (d.template === 'modern') paper.innerHTML = renderModern(d);
  else paper.innerHTML = renderMinimal(d);

  autosave(d);
}

function contactLine(d) {
  return [d.email, d.phone, d.city, d.link].filter(Boolean).map(escH).join('<span> · </span>');
}

function skillTags(arr, cls='skill-tag') {
  return arr.map(s => `<span class="${cls}">${escH(s)}</span>`).join('');
}

function expItems(exp, template) {
  return exp.filter(e=>e.title||e.company).map(e => `
    <div class="item">
      <div class="item-head"><span>${escH(e.title)}</span><span style="font-weight:400;font-size:9pt;color:#777">${escH(e.period)}</span></div>
      <div class="item-sub">${escH(e.company)}</div>
      ${e.desc ? `<div class="item-desc">${escH(e.desc)}</div>` : ''}
    </div>
  `).join('');
}

function eduItems(edu) {
  return edu.filter(e=>e.degree||e.school).map(e => `
    <div class="item">
      <div class="item-head"><span>${escH(e.degree)}</span><span style="font-weight:400;font-size:9pt;color:#777">${escH(e.year)}</span></div>
      <div class="item-sub">${escH(e.school)}</div>
    </div>
  `).join('');
}

function biodataBlock(d) {
  const rows = [
    ['Date of Birth', d.dob], ['Gender', d.gender], ['Marital Status', d.marital],
    ['Nationality', d.nationality], ['Languages', d.langs], ["Father's Name", d.father],
    ['Address', d.address],
  ].filter(r => r[1]);
  if (!rows.length) return '';
  return `<div class="section">
    <div class="section-title" style="border-color:${d.color};color:${d.color}">Personal Details</div>
    ${rows.map(([k,v]) => `<div style="display:flex;gap:8px;font-size:9.5pt;margin-bottom:4px"><span style="color:#555;min-width:120px">${escH(k)}:</span><span>${escH(v)}</span></div>`).join('')}
  </div>`;
}

function renderClassic(d) {
  const allSkills = [...d.techSkills, ...d.softSkills];
  const projects = d.projects ? d.projects.split('\n').filter(Boolean).map(l => {
    const [name, ...rest] = l.split('—'); return `<div class="item"><span style="font-weight:600">${escH(name.trim())}</span>${rest.length ? ` — ${escH(rest.join('—').trim())}` : ''}</div>`;
  }).join('') : '';

  return `
    <div class="resume-head">
      <div class="resume-name" style="color:${d.color}">${escH(d.name||'Your Name')}</div>
      ${d.role ? `<div style="font-size:11pt;color:#555;margin-bottom:4px">${escH(d.role)}</div>` : ''}
      <div class="resume-contact">${contactLine(d)}</div>
    </div>
    <div class="resume-body">
      ${d.summary ? `<div class="section"><div class="section-title" style="border-color:${d.color};color:${d.color}">Summary</div><div style="font-size:9.5pt;color:#333">${escH(d.summary)}</div></div>` : ''}
      ${d.exp.some(e=>e.title) ? `<div class="section"><div class="section-title" style="border-color:${d.color};color:${d.color}">Experience</div>${expItems(d.exp)}</div>` : ''}
      ${d.edu.some(e=>e.degree) ? `<div class="section"><div class="section-title" style="border-color:${d.color};color:${d.color}">Education</div>${eduItems(d.edu)}</div>` : ''}
      ${allSkills.length ? `<div class="section"><div class="section-title" style="border-color:${d.color};color:${d.color}">Skills</div><div class="skills-wrap">${skillTags(allSkills)}</div></div>` : ''}
      ${projects ? `<div class="section"><div class="section-title" style="border-color:${d.color};color:${d.color}">Projects</div>${projects}</div>` : ''}
      ${d.certs ? `<div class="section"><div class="section-title" style="border-color:${d.color};color:${d.color}">Certifications</div><div style="font-size:9.5pt;color:#333">${escH(d.certs)}</div></div>` : ''}
      ${biodataBlock(d)}
      ${d.hobbies ? `<div class="section"><div class="section-title" style="border-color:${d.color};color:${d.color}">Interests</div><div style="font-size:9.5pt;color:#555">${escH(d.hobbies)}</div></div>` : ''}
    </div>
  `;
}

function renderModern(d) {
  const allSkills = [...d.techSkills, ...d.softSkills];
  return `
    <div style="display:grid;grid-template-columns:190px 1fr;min-height:940px">
      <div class="side" style="background:${d.color}">
        <div class="side-name">${escH(d.name||'Your Name')}</div>
        ${d.role ? `<div class="side-role">${escH(d.role)}</div>` : ''}
        <div class="side-section">
          <div class="side-label">Contact</div>
          ${d.email ? `<div class="side-item">✉ ${escH(d.email)}</div>` : ''}
          ${d.phone ? `<div class="side-item">📞 ${escH(d.phone)}</div>` : ''}
          ${d.city ? `<div class="side-item">📍 ${escH(d.city)}</div>` : ''}
          ${d.link ? `<div class="side-item">🔗 ${escH(d.link)}</div>` : ''}
        </div>
        ${allSkills.length ? `<div class="side-section"><div class="side-label">Skills</div>${allSkills.map(s=>`<span class="side-skill">${escH(s)}</span>`).join('')}</div>` : ''}
        ${(d.dob||d.langs||d.nationality) ? `<div class="side-section"><div class="side-label">About</div>${d.dob?`<div class="side-item">DOB: ${escH(d.dob)}</div>`:''}${d.langs?`<div class="side-item">${escH(d.langs)}</div>`:''}${d.nationality?`<div class="side-item">${escH(d.nationality)}</div>`:''}</div>` : ''}
        ${d.hobbies ? `<div class="side-section"><div class="side-label">Interests</div><div class="side-item" style="font-size:8.5pt">${escH(d.hobbies)}</div></div>` : ''}
      </div>
      <div class="main">
        ${d.summary ? `<div class="section"><div class="section-title" style="border-color:${d.color};color:${d.color}">Summary</div><div class="item-desc">${escH(d.summary)}</div></div>` : ''}
        ${d.exp.some(e=>e.title) ? `<div class="section"><div class="section-title" style="border-color:${d.color};color:${d.color}">Experience</div>${expItems(d.exp)}</div>` : ''}
        ${d.edu.some(e=>e.degree) ? `<div class="section"><div class="section-title" style="border-color:${d.color};color:${d.color}">Education</div>${eduItems(d.edu)}</div>` : ''}
        ${d.certs ? `<div class="section"><div class="section-title" style="border-color:${d.color};color:${d.color}">Certifications</div><div class="item-desc">${escH(d.certs)}</div></div>` : ''}
        ${d.projects ? `<div class="section"><div class="section-title" style="border-color:${d.color};color:${d.color}">Projects</div>${d.projects.split('\n').filter(Boolean).map(l=>`<div class="item-desc" style="margin-bottom:4px">• ${escH(l)}</div>`).join('')}</div>` : ''}
      </div>
    </div>
  `;
}

function renderMinimal(d) {
  const allSkills = [...d.techSkills, ...d.softSkills];
  return `
    <div class="resume-head">
      <div class="resume-name">${escH(d.name||'Your Name')}</div>
      ${d.role ? `<div class="resume-role" style="color:${d.color}">${escH(d.role)}</div>` : ''}
      <div class="resume-contact">${contactLine(d)}</div>
    </div>
    <div class="resume-body">
      ${d.summary ? `<div class="section"><div class="section-title" style="color:${d.color}">Profile</div><div style="font-size:9.5pt;color:#475569">${escH(d.summary)}</div></div>` : ''}
      ${d.exp.some(e=>e.title) ? `<div class="section"><div class="section-title" style="color:${d.color}">Experience</div>${expItems(d.exp)}</div>` : ''}
      ${d.edu.some(e=>e.degree) ? `<div class="section"><div class="section-title" style="color:${d.color}">Education</div>${eduItems(d.edu)}</div>` : ''}
      ${allSkills.length ? `<div class="section"><div class="section-title" style="color:${d.color}">Skills</div><div class="skills-wrap">${skillTags(allSkills,'skill-tag')}</div></div>` : ''}
      ${d.certs ? `<div class="section"><div class="section-title" style="color:${d.color}">Certifications</div><div style="font-size:9.5pt;color:#475569">${escH(d.certs)}</div></div>` : ''}
      ${biodataBlock(d)}
      ${d.hobbies ? `<div class="section"><div class="section-title" style="color:${d.color}">Interests</div><div style="font-size:9.5pt;color:#64748b">${escH(d.hobbies)}</div></div>` : ''}
    </div>
  `;
}

// ── PDF DOWNLOAD ──
async function downloadPDF() {
  const paper = document.getElementById('resumePaper');
  const d = getData();
  if (!d.name) { alert('Please enter your name first.'); return; }

  const canvas = await html2canvas(paper, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  const ratio = canvas.height / canvas.width;
  const imgH = W * ratio;

  if (imgH <= H) {
    pdf.addImage(imgData, 'JPEG', 0, 0, W, imgH);
  } else {
    // Multi-page
    let yPos = 0;
    while (yPos < imgH) {
      if (yPos > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, -yPos, W, imgH);
      yPos += H;
    }
  }

  pdf.save(`resume-${(d.name || 'draft').replace(/\s+/g,'-').toLowerCase()}.pdf`);
}

// ── AUTOSAVE / LOAD ──
function autosave(d) {
  try { localStorage.setItem('rk_data', JSON.stringify(d)); } catch(e) {}
}

function loadSaved() {
  try {
    const raw = localStorage.getItem('rk_data');
    if (!raw) return;
    const d = JSON.parse(raw);
    const set = (id, val) => { const el = document.getElementById(id); if(el && val) el.value = val; };
    set('p_name', d.name); set('p_role', d.role); set('p_email', d.email);
    set('p_phone', d.phone); set('p_city', d.city); set('p_link', d.link);
    set('p_summary', d.summary); set('p_dob', d.dob); set('p_gender', d.gender);
    set('p_marital', d.marital); set('p_nationality', d.nationality);
    set('p_langs', d.langs); set('p_father', d.father); set('p_address', d.address);
    set('s_tech', (d.techSkills||[]).join(', ')); set('s_soft', (d.softSkills||[]).join(', '));
    set('s_certs', d.certs); set('s_projects', d.projects); set('s_hobbies', d.hobbies);
    if (d.exp?.length) { state.exp = d.exp; renderExpList(); }
    if (d.edu?.length) { state.edu = d.edu; renderEduList(); }
    if (d.template) selectTemplate(d.template);
    if (d.color) { state.color = d.color; buildColorRow(); }
    render();
  } catch(e) {}
}

function clearAll() {
  if (!confirm('Clear all and start fresh?')) return;
  localStorage.removeItem('rk_data');
  location.reload();
}

// ── ATS CHECKER ──
const ATS_STOP = new Set(['a','an','the','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','can','i','we','you','he','she','they','it','this','that','these','those','and','or','but','in','on','at','to','for','of','with','by','from','up','about','into','through','during','before','after','above','below','between','each','both','few','more','most','other','some','such','no','not','only','same','so','than','too','very','just','there','when','where','who','how','all','any','his','her','its','our','your','their','my','as','if','also','must','will','using','use','used','work','working','experience','years','year','strong','good','excellent','ability','skills','skill','knowledge','including','responsible','responsibilities','role','team','company','position','job','candidate','apply','opportunity','please','send','resume','cv','application','required','preferred','required','plus']);

function extractKeywords(text) {
  return [...new Set(
    text.toLowerCase()
      .replace(/[^a-z0-9\s\+#\.]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !ATS_STOP.has(w) && !/^\d+$/.test(w))
  )];
}

function getResumeText() {
  const el = document.getElementById('resumePaper');
  return el ? el.innerText.toLowerCase() : '';
}

function atsCheck() {
  const jd = document.getElementById('ats_jd').value;
  if (!jd.trim() || jd.trim().length < 50) {
    document.getElementById('ats-results').style.display = 'none';
    return;
  }

  const jdKeywords = extractKeywords(jd);
  if (!jdKeywords.length) return;

  const resumeText = getResumeText();
  const found = jdKeywords.filter(kw => resumeText.includes(kw));
  const missing = jdKeywords.filter(kw => !resumeText.includes(kw));

  const score = Math.round((found.length / jdKeywords.length) * 100);

  document.getElementById('ats-score').textContent = score + '%';
  document.getElementById('ats-score-label').textContent = score >= 70 ? '✅ Good ATS Match' : score >= 40 ? '⚠️ Moderate Match' : '❌ Low Match';
  document.getElementById('ats-score-sub').textContent = found.length + ' of ' + jdKeywords.length + ' keywords from JD found in resume';
  document.getElementById('ats-found').innerHTML = found.length
    ? found.map(k => `<span style="background:#dcfce7;padding:2px 7px;border-radius:12px;margin:2px;display:inline-block;">${k}</span>`).join('')
    : '<em>None yet — fill in your resume details first</em>';
  document.getElementById('ats-missing').innerHTML = missing.length
    ? missing.map(k => `<span style="background:#ffedd5;padding:2px 7px;border-radius:12px;margin:2px;display:inline-block;">${k}</span>`).join('')
    : '<em>🎉 All key terms covered!</em>';
  document.getElementById('ats-results').style.display = 'block';
}
