
const $ = (id) => document.getElementById(id);
const STORAGE_KEY = 'gridwork_state_v2';

const ACCENTS = ['#5b8def', '#f0ac54', '#45c48a', '#f2707a', '#b39bfb', '#3fc4c4', '#e0b23a', '#e8618c'];

const PRIORITY_LABEL = { high: 'High', med: 'Medium', low: 'Low' };
const STATUS_LABEL = { todo: 'To Do', inprogress: 'In Progress', done: 'Done' };

let state = null;
let uid = 1;
function nextId(prefix){ return prefix + (uid++); }

function seedData(){
  const users = [
    { id: 'u1', name: 'Seema', role: 'Full-Stack Developer', color: ACCENTS[0] },
  ];

  const projects = [
    { id: 'p1', name: 'VayuCast', desc: 'Weather forecast web app — live conditions, 5-day outlook, air quality & UV.', color: ACCENTS[0], createdAt: '2026-06-25T09:00:00.000Z' },
    { id: 'p2', name: 'Dash Pulse', desc: 'Real-time retail analytics dashboard with live feed and exportable reports.', color: ACCENTS[1], createdAt: '2026-06-25T09:00:00.000Z' },
  ];

  const taskSeeds = [
    // ---- VayuCast ----
    ['p1', 'Set up project structure — index.html, style.css, script.js', 'med', 'done', '2026-06-25', '2026-06-25', 'Base layout, header with logo and search bar.'],
    ['p1', 'Integrate OpenWeatherMap current-weather API', 'high', 'done', '2026-06-26', '2026-06-26', 'Fetch by city name, handle "city not found" errors.'],
    ['p1', 'Build city search bar with Enter-to-search', 'med', 'done', '2026-06-26', '2026-06-26', ''],
    ['p1', 'Render current conditions — temp, feels like, humidity, wind, pressure', 'high', 'done', '2026-06-27', '2026-06-27', ''],
    ['p1', 'Add sunrise / sunset / visibility panel', 'med', 'done', '2026-06-27', '2026-06-28', ''],
    ['p1', 'Build 5-day forecast strip', 'high', 'done', '2026-06-29', '2026-06-29', 'Pick the 12:00 slot per day from the 3-hourly forecast API.'],
    ['p1', 'Add rain-chance + air quality index panel', 'med', 'done', '2026-06-29', '2026-06-30', 'AQI via /air_pollution endpoint, 1–5 scale mapped to labels.'],
    ['p1', 'Fix UV index — OpenWeatherMap /uvi endpoint retired', 'high', 'done', '2026-06-30', '2026-07-01', 'Swapped to Open-Meteo current uv_index, no API key needed.'],
    ['p1', 'Build weather-condition animation system', 'high', 'inprogress', '2026-07-02', null, 'Clear/cloudy/rain/snow/thunderstorm/mist, all CSS + JS driven.'],
    ['p1', 'Persist last-searched city with localStorage', 'low', 'done', '2026-07-01', '2026-07-01', ''],
    ['p1', 'Responsive layout pass for mobile widths', 'med', 'inprogress', '2026-07-03', null, ''],
    ['p1', 'Polish header logo + search bar styling', 'low', 'todo', '2026-07-03', null, ''],

    // ---- Dash Pulse ----
    ['p2', 'Scaffold dashboard layout — header, stat cards, panels', 'med', 'done', '2026-06-25', '2026-06-25', ''],
    ['p2', 'Build simulated retail dataset generator', 'high', 'done', '2026-06-26', '2026-06-26', 'Categories, regions, sales & profit with realistic distributions.'],
    ['p2', 'Live ticker feed component', 'high', 'done', '2026-06-27', '2026-06-27', 'Scrolling recent-orders strip across the top of the dashboard.'],
    ['p2', 'Sales trend chart — last 30 days', 'high', 'done', '2026-06-28', '2026-06-28', 'Chart.js line chart, daily aggregated revenue.'],
    ['p2', 'Sales-by-region doughnut chart', 'med', 'done', '2026-06-28', '2026-06-29', ''],
    ['p2', 'Revenue-by-category bar chart (sales vs profit)', 'med', 'done', '2026-06-29', '2026-06-30', ''],
    ['p2', 'Auto-generated text report panel', 'high', 'done', '2026-06-30', '2026-07-01', 'Top categories, regional breakdown, loss-maker count, refresh button.'],
    ['p2', 'CSV / JSON export buttons', 'med', 'done', '2026-07-01', '2026-07-01', ''],
    ['p2', 'Export full report as .txt', 'low', 'done', '2026-07-01', '2026-07-02', ''],
    ['p2', 'Live order feed table with category filter', 'high', 'inprogress', '2026-07-02', null, ''],
    ['p2', 'Pause / resume real-time feed control', 'med', 'todo', '2026-07-03', null, ''],
    ['p2', 'Responsive breakpoints for stat cards & charts', 'med', 'todo', '2026-07-03', null, ''],
  ];

  const tasks = taskSeeds.map(([projectId, title, priority, status, createdDate, completedDate, desc]) => ({
    id: nextId('t'),
    projectId,
    assigneeId: 'u1',
    title, priority, status, desc,
    due: completedDate || createdDate,
    checklist: maybeChecklist(title),
    createdAt: createdDate + 'T09:00:00.000Z',
    completedAt: status === 'done' ? completedDate + 'T17:00:00.000Z' : null,
  }));

  uid = 100;
  return { users, projects, tasks, currentUserId: 'u1', theme: 'dark' };
}

function maybeChecklist(title){
  const pool = [
    { text: 'Confirm scope with client', done: true },
    { text: 'Draft first pass', done: true },
    { text: 'Internal review', done: false },
    { text: 'Send for approval', done: false },
  ];
  const n = Math.floor(Math.random() * 3);
  return n === 0 ? [] : pool.slice(0, n + 1).map((c, i) => ({ id: 'c' + i + '_' + title.length, text: c.text, done: c.done }));
}

function daysAgo(n){ const d = new Date(); d.setHours(9,0,0,0); d.setDate(d.getDate() - n); return d.toISOString(); }
function offsetDate(n){ const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() + n); return d.toISOString().slice(0,10); }

function saveState(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch(e){ console.error('save failed', e); }
}
function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  }catch(e){ console.error('load failed', e); }
  return null;
}

state = loadState() || seedData();
if (!state.theme) state.theme = 'dark';
document.documentElement.setAttribute('data-theme', state.theme);

function userById(id){ return state.users.find(u => u.id === id); }
function projectById(id){ return state.projects.find(p => p.id === id); }
function tasksForProject(id){ return state.tasks.filter(t => t.projectId === id); }
function initials(name){ return name.split(' ').map(p => p[0]).slice(0,2).join('').toUpperCase(); }
function fmtDate(iso){
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function isOverdue(t){ if (t.status === 'done' || !t.due) return false; return t.due < todayStr(); }
function todayStr(){ const d = new Date(); d.setHours(0,0,0,0); return d.toISOString().slice(0,10); }
function daysBetween(a, b){ return Math.round((new Date(b) - new Date(a)) / 86400000); }

function showToast(msg){
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('is-visible');
  clearTimeout(showToast._tm);
  showToast._tm = setTimeout(() => t.classList.remove('is-visible'), 2200);
}

function switchView(view){
  document.querySelectorAll('.view').forEach(v => v.classList.remove('is-active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('is-active', n.dataset.view === view));
  $('view-' + view).classList.add('is-active');
  closeMobileNav();
  if (view === 'calendar') renderCalendar();
}
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => switchView(btn.dataset.view));
});

function applyTheme(){
  document.documentElement.setAttribute('data-theme', state.theme);
  $('themeToggleMobile').textContent = state.theme === 'dark' ? '☾' : '☼';
  renderCharts();
}
$('themeToggle').addEventListener('click', () => {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  saveState(); applyTheme();
});
$('themeToggleMobile').addEventListener('click', () => {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  saveState(); applyTheme();
});


function openMobileNav(){ document.querySelector('.rail').classList.add('is-open'); $('scrim').classList.add('is-visible'); }
function closeMobileNav(){ document.querySelector('.rail').classList.remove('is-open'); if(!anyModalOpen()) $('scrim').classList.remove('is-visible'); }
$('mobileMenuBtn').addEventListener('click', openMobileNav);
$('scrim').addEventListener('click', () => { closeMobileNav(); closeAllModals(); });


function openModal(id){ $(id).classList.add('is-open'); $('scrim').classList.add('is-visible'); }
function closeAllModals(){ document.querySelectorAll('.modal').forEach(m => m.classList.remove('is-open')); $('scrim').classList.remove('is-visible'); }
function anyModalOpen(){ return !!document.querySelector('.modal.is-open'); }
document.querySelectorAll('[data-close-modal]').forEach(btn => btn.addEventListener('click', closeAllModals));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAllModals(); });


function fillProjectOptions(sel, includeAll){
  sel.innerHTML = '';
  if (includeAll){ const o = document.createElement('option'); o.value = 'all'; o.textContent = 'All projects'; sel.appendChild(o); }
  state.projects.forEach(p => {
    const o = document.createElement('option'); o.value = p.id; o.textContent = p.name; sel.appendChild(o);
  });
}
function fillUserOptions(sel, includeAll, allLabel){
  sel.innerHTML = '';
  if (includeAll){ const o = document.createElement('option'); o.value = 'all'; o.textContent = allLabel || 'Everyone'; sel.appendChild(o); }
  state.users.forEach(u => {
    const o = document.createElement('option'); o.value = u.id; o.textContent = u.name; sel.appendChild(o);
  });
}


function renderStats(){
  const totalTasks = state.tasks.length;
  const open = state.tasks.filter(t => t.status !== 'done');
  const overdue = state.tasks.filter(isOverdue);
  const weekAgo = daysAgo(7);
  const completedWeek = state.tasks.filter(t => t.status === 'done' && t.completedAt && t.completedAt >= weekAgo);

  const cards = [
    { k: 'Active Projects', v: state.projects.length, d: `${state.tasks.filter(t=>t.status!=='done').length} open tasks total` , cls:'' },
    { k: 'Open Tasks', v: open.length, d: `${totalTasks} total across all sheets`, cls:'accent' },
    { k: 'Completed — 7d', v: completedWeek.length, d: 'nice pace, keep it up', cls:'accent' },
    { k: 'Overdue', v: overdue.length, d: overdue.length ? 'needs attention' : 'all on schedule', cls: overdue.length ? 'warn' : '' },
    { k: 'Team Members', v: state.users.length, d: 'active on the roster', cls:'' },
  ];

  $('statRow').innerHTML = cards.map(c => `
    <div class="stat">
      <div class="k">${c.k}</div>
      <div class="v">${c.v}</div>
      <div class="d ${c.cls}">${c.d}</div>
    </div>
  `).join('');
}

let trendChart, statusChart, workloadChart;
function renderCharts(){
  const styles = getComputedStyle(document.documentElement);
  const col = (name) => styles.getPropertyValue(name).trim();
  Chart.defaults.font.family = "'IBM Plex Mono', monospace";
  Chart.defaults.color = col('--muted');
  Chart.defaults.borderColor = col('--border');

  
  const days = [];
  for (let i = 13; i >= 0; i--){
    const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0,10));
  }
  const counts = days.map(day => state.tasks.filter(t => t.completedAt && t.completedAt.slice(0,10) === day).length);
  const labels = days.map(d => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month:'short', day:'numeric' }));

  if (trendChart) trendChart.destroy();
  trendChart = new Chart($('trendChart').getContext('2d'), {
    type: 'line',
    data: { labels, datasets: [{ label:'Completed', data: counts, borderColor: col('--blue'), backgroundColor: hexToRgba(col('--blue'), .15), fill:true, tension:.35, pointRadius:0, borderWidth:2 }] },
    options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}},
      scales:{ x:{ grid:{display:false}, ticks:{maxTicksLimit:7} }, y:{ grid:{color: col('--grid-line')}, ticks:{ precision:0 } } } }
  });

  
  const statusCounts = ['todo','inprogress','done'].map(s => state.tasks.filter(t => t.status === s).length);
  if (statusChart) statusChart.destroy();
  statusChart = new Chart($('statusChart').getContext('2d'), {
    type: 'doughnut',
    data: { labels:['To Do','In Progress','Done'], datasets:[{ data: statusCounts, backgroundColor:[col('--faint'), col('--amber'), col('--green')], borderColor: col('--panel'), borderWidth:3 }] },
    options: { responsive:true, maintainAspectRatio:false, cutout:'62%', plugins:{ legend:{ position:'bottom', labels:{ boxWidth:9, padding:12, font:{size:11} } } } }
  });

  
  const workload = state.users.map(u => state.tasks.filter(t => t.assigneeId === u.id && t.status !== 'done').length);
  if (workloadChart) workloadChart.destroy();
  workloadChart = new Chart($('workloadChart').getContext('2d'), {
    type: 'bar',
    data: { labels: state.users.map(u => u.name.split(' ')[0]), datasets:[{ data: workload, backgroundColor: state.users.map(u => hexToRgba(u.color,.7)), borderRadius:5 }] },
    options: { indexAxis:'y', responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}},
      scales:{ x:{ grid:{color: col('--grid-line')}, ticks:{precision:0} }, y:{ grid:{display:false} } } }
  });
}
function hexToRgba(hex, a){
  const h = hex.replace('#','').trim();
  const r = parseInt(h.substring(0,2),16), g = parseInt(h.substring(2,4),16), b = parseInt(h.substring(4,6),16);
  return `rgba(${r},${g},${b},${a})`;
}

function renderDueSoon(){
  const today = todayStr();
  const horizon = offsetDate(7);
  const items = state.tasks
    .filter(t => t.status !== 'done' && t.due && t.due <= horizon)
    .sort((a,b) => a.due.localeCompare(b.due));

  if (!items.length){ $('dueSoonList').innerHTML = '<div class="empty-note">Nothing due in the next 7 days.</div>'; return; }

  $('dueSoonList').innerHTML = items.map(t => {
    const p = projectById(t.projectId);
    const overdue = t.due < today;
    const label = overdue ? 'overdue' : (t.due === today ? 'today' : fmtDate(t.due));
    return `
      <div class="due-item" data-task="${t.id}">
        <span class="swatch" style="background:${p ? p.color : '#888'}"></span>
        <div class="info">
          <div class="t">${escapeHtml(t.title)}</div>
          <div class="p">${p ? p.name : ''}</div>
        </div>
        <div class="when ${overdue || t.due===today ? 'today' : ''}">${label}</div>
      </div>
    `;
  }).join('');

  $('dueSoonList').querySelectorAll('.due-item').forEach(el => {
    el.addEventListener('click', () => openTaskModal(el.dataset.task));
  });
}

function renderProjects(){
  $('projectGrid').innerHTML = state.projects.map(p => {
    const tasks = tasksForProject(p.id);
    const done = tasks.filter(t => t.status === 'done').length;
    const pct = tasks.length ? Math.round(done / tasks.length * 100) : 0;
    const members = [...new Set(tasks.map(t => t.assigneeId))].map(userById).filter(Boolean).slice(0,4);
    return `
      <div class="proj-card" style="--accent:${p.color}" data-project="${p.id}">
        <button class="pc-edit" data-edit-project="${p.id}" title="Edit project">✎</button>
        <div class="pc-top"><span class="pc-tag">${tasks.length} task${tasks.length===1?'':'s'}</span></div>
        <h3>${escapeHtml(p.name)}</h3>
        <p class="desc">${escapeHtml(p.desc || '')}</p>
        <div class="pc-bar"><div class="pc-bar-fill" style="width:${pct}%"></div></div>
        <div class="pc-foot">
          <span>${pct}% complete</span>
          <div class="pc-avatars">${members.map(m => `<span class="mini-avatar" style="background:${m.color}" title="${escapeHtml(m.name)}">${initials(m.name)}</span>`).join('')}</div>
        </div>
      </div>
    `;
  }).join('') || '<div class="empty-note">No projects yet — create your first one.</div>';

  $('projectGrid').querySelectorAll('.proj-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-edit-project]')) return;
      $('filterProject').value = card.dataset.project;
      switchView('board');
      applyBoardFilters();
    });
  });
  $('projectGrid').querySelectorAll('[data-edit-project]').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); openProjectModal(btn.dataset.editProject); });
  });
}

let swatchPickValue = { project: ACCENTS[0], member: ACCENTS[0] };
function buildSwatches(containerId, key){
  const el = $(containerId);
  el.innerHTML = ACCENTS.map(c => `<span class="swatch" data-color="${c}" style="background:${c}"></span>`).join('');
  el.querySelectorAll('.swatch').forEach(sw => {
    sw.addEventListener('click', () => {
      swatchPickValue[key] = sw.dataset.color;
      el.querySelectorAll('.swatch').forEach(s => s.classList.toggle('is-selected', s === sw));
    });
  });
}
function setSwatchSelection(containerId, color){
  $(containerId).querySelectorAll('.swatch').forEach(s => s.classList.toggle('is-selected', s.dataset.color === color));
}

function openProjectModal(id){
  const p = id ? projectById(id) : null;
  $('projectModalTitle').textContent = p ? 'Edit project' : 'New project';
  $('projectId').value = p ? p.id : '';
  $('projectName').value = p ? p.name : '';
  $('projectDesc').value = p ? p.desc : '';
  swatchPickValue.project = p ? p.color : ACCENTS[state.projects.length % ACCENTS.length];
  buildSwatches('projectSwatches', 'project');
  setSwatchSelection('projectSwatches', swatchPickValue.project);
  $('deleteProjectBtn').style.display = p ? 'inline-flex' : 'none';
  openModal('projectModal');
}
$('newProjectBtn').addEventListener('click', () => openProjectModal(null));

$('saveProjectBtn').addEventListener('click', () => {
  const name = $('projectName').value.trim();
  if (!name){ showToast('Give the project a name.'); return; }
  const id = $('projectId').value;
  if (id){
    const p = projectById(id);
    p.name = name; p.desc = $('projectDesc').value.trim(); p.color = swatchPickValue.project;
    showToast('Project updated.');
  } else {
    state.projects.push({ id: nextId('p'), name, desc: $('projectDesc').value.trim(), color: swatchPickValue.project, createdAt: new Date().toISOString() });
    showToast('Project created.');
  }
  saveState(); closeAllModals(); renderAll();
});
$('deleteProjectBtn').addEventListener('click', () => {
  const id = $('projectId').value;
  if (!id) return;
  if (!confirm('Delete this project and all its tasks?')) return;
  state.projects = state.projects.filter(p => p.id !== id);
  state.tasks = state.tasks.filter(t => t.projectId !== id);
  saveState(); closeAllModals(); renderAll();
  showToast('Project deleted.');
});

function getBoardFilters(){
  return {
    project: $('filterProject').value,
    assignee: $('filterAssignee').value,
    priority: $('filterPriority').value,
    search: $('filterSearch').value.trim().toLowerCase(),
  };
}
function filteredTasks(){
  const f = getBoardFilters();
  return state.tasks.filter(t => {
    if (f.project !== 'all' && t.projectId !== f.project) return false;
    if (f.assignee !== 'all' && t.assigneeId !== f.assignee) return false;
    if (f.priority !== 'all' && t.priority !== f.priority) return false;
    if (f.search && !t.title.toLowerCase().includes(f.search)) return false;
    return true;
  });
}
function applyBoardFilters(){ renderBoard(); }
['filterProject','filterAssignee','filterPriority'].forEach(id => $(id).addEventListener('change', applyBoardFilters));
$('filterSearch').addEventListener('input', applyBoardFilters);

function taskCardHtml(t){
  const p = projectById(t.projectId);
  const a = userById(t.assigneeId);
  const overdue = isOverdue(t);
  const cl = t.checklist || [];
  const clDone = cl.filter(c => c.done).length;
  return `
    <div class="task-card" draggable="true" data-task="${t.id}" style="--accent:${p ? p.color : '#888'}">
      <div class="tc-top">
        <span class="tc-proj">${p ? escapeHtml(p.name) : ''}</span>
        ${a ? `<span class="mini-avatar" style="background:${a.color}" title="${escapeHtml(a.name)}">${initials(a.name)}</span>` : ''}
      </div>
      <h4>${escapeHtml(t.title)}</h4>
      <div class="tc-meta">
        <span class="prio-chip prio-${t.priority}">${PRIORITY_LABEL[t.priority]}</span>
        <span class="tc-due ${overdue ? 'overdue' : ''}">${overdue ? 'overdue · ' : ''}${fmtDate(t.due)}</span>
      </div>
      ${cl.length ? `<div class="tc-progress">☑ ${clDone}/${cl.length} subtasks</div>` : ''}
    </div>
  `;
}

function renderBoard(){
  const prevProject = $('filterProject').value || 'all';
  const prevAssignee = $('filterAssignee').value || 'all';
  fillProjectOptions($('filterProject'), true);
  fillUserOptions($('filterAssignee'), true, 'Everyone');
  if ([...$('filterProject').options].some(o => o.value === prevProject)) $('filterProject').value = prevProject;
  if ([...$('filterAssignee').options].some(o => o.value === prevAssignee)) $('filterAssignee').value = prevAssignee;

  const tasks = filteredTasks();
  ['todo','inprogress','done'].forEach(status => {
    const list = tasks.filter(t => t.status === status);
    $('col-' + status).innerHTML = list.map(taskCardHtml).join('') || '<div class="empty-note">No tasks</div>';
    $('count' + status.charAt(0).toUpperCase() + status.slice(1)).textContent = list.length;
  });

  document.querySelectorAll('.task-card').forEach(card => {
    card.addEventListener('click', () => openTaskModal(card.dataset.task));
    card.addEventListener('dragstart', () => card.classList.add('dragging'));
    card.addEventListener('dragend', () => card.classList.remove('dragging'));
  });
}

document.querySelectorAll('.board-col-body').forEach(col => {
  col.addEventListener('dragover', (e) => { e.preventDefault(); col.classList.add('drag-over'); });
  col.addEventListener('dragleave', () => col.classList.remove('drag-over'));
  col.addEventListener('drop', (e) => {
    e.preventDefault();
    col.classList.remove('drag-over');
    const dragging = document.querySelector('.task-card.dragging');
    if (!dragging) return;
    const task = state.tasks.find(t => t.id === dragging.dataset.task);
    if (!task) return;
    const newStatus = col.dataset.status;
    task.status = newStatus;
    task.completedAt = newStatus === 'done' ? new Date().toISOString() : null;
    saveState(); renderAll();
    showToast(`Moved to ${STATUS_LABEL[newStatus]}.`);
  });
});

let checklistDraft = [];
function openTaskModal(id, presetStatus){
  const t = id ? state.tasks.find(x => x.id === id) : null;
  $('taskModalTitle').textContent = t ? 'Edit task' : 'New task';
  $('taskId').value = t ? t.id : '';
  $('taskTitle').value = t ? t.title : '';
  fillProjectOptions($('taskProject'), false);
  fillUserOptions($('taskAssignee'), false);
  $('taskProject').value = t ? t.projectId : ($('filterProject').value !== 'all' ? $('filterProject').value : (state.projects[0] ? state.projects[0].id : ''));
  $('taskAssignee').value = t ? t.assigneeId : (state.users[0] ? state.users[0].id : '');
  $('taskPriority').value = t ? t.priority : 'med';
  $('taskStatus').value = t ? t.status : (presetStatus || 'todo');
  $('taskDue').value = t ? t.due : offsetDate(3);
  $('taskDesc').value = t ? (t.desc || '') : '';
  checklistDraft = t ? JSON.parse(JSON.stringify(t.checklist || [])) : [];
  renderChecklistDraft();
  $('deleteTaskBtn').style.display = t ? 'inline-flex' : 'none';
  openModal('taskModal');
  setTimeout(() => $('taskTitle').focus(), 50);
}
$('newTaskBtn').addEventListener('click', () => openTaskModal(null));

function renderChecklistDraft(){
  $('taskChecklist').innerHTML = checklistDraft.map((c, i) => `
    <div class="checklist-item ${c.done ? 'done' : ''}">
      <input type="checkbox" data-idx="${i}" ${c.done ? 'checked' : ''}>
      <span>${escapeHtml(c.text)}</span>
      <button data-remove="${i}" title="Remove">✕</button>
    </div>
  `).join('') || '';
  $('taskChecklist').querySelectorAll('input[type=checkbox]').forEach(cb => {
    cb.addEventListener('change', () => { checklistDraft[+cb.dataset.idx].done = cb.checked; renderChecklistDraft(); });
  });
  $('taskChecklist').querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => { checklistDraft.splice(+btn.dataset.remove, 1); renderChecklistDraft(); });
  });
}
$('checklistInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && $('checklistInput').value.trim()){
    checklistDraft.push({ id: nextId('c'), text: $('checklistInput').value.trim(), done: false });
    $('checklistInput').value = '';
    renderChecklistDraft();
  }
});

$('saveTaskBtn').addEventListener('click', () => {
  const title = $('taskTitle').value.trim();
  if (!title){ showToast('Give the task a title.'); return; }
  if (!state.projects.length){ showToast('Create a project first.'); return; }
  const id = $('taskId').value;
  const status = $('taskStatus').value;
  const payload = {
    projectId: $('taskProject').value,
    assigneeId: $('taskAssignee').value,
    title, priority: $('taskPriority').value, status,
    due: $('taskDue').value,
    desc: $('taskDesc').value.trim(),
    checklist: checklistDraft,
  };
  if (id){
    const t = state.tasks.find(x => x.id === id);
    const wasDone = t.status === 'done';
    Object.assign(t, payload);
    if (status === 'done' && !wasDone) t.completedAt = new Date().toISOString();
    if (status !== 'done') t.completedAt = null;
    showToast('Task updated.');
  } else {
    state.tasks.push({ id: nextId('t'), createdAt: new Date().toISOString(), completedAt: status === 'done' ? new Date().toISOString() : null, ...payload });
    showToast('Task created.');
  }
  saveState(); closeAllModals(); renderAll();
});
$('deleteTaskBtn').addEventListener('click', () => {
  const id = $('taskId').value;
  if (!id) return;
  state.tasks = state.tasks.filter(t => t.id !== id);
  saveState(); closeAllModals(); renderAll();
  showToast('Task deleted.');
});

let calYear, calMonth;
(function initCalDate(){ const d = new Date(); calYear = d.getFullYear(); calMonth = d.getMonth(); })();

function renderCalendar(){
  $('calLabel').textContent = new Date(calYear, calMonth, 1).toLocaleDateString('en-US', { month:'long', year:'numeric' });

  const firstDay = new Date(calYear, calMonth, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(calYear, calMonth, 0).getDate();
  const today = todayStr();

  const cells = [];
  for (let i = startWeekday - 1; i >= 0; i--) cells.push({ day: daysInPrevMonth - i, outside: true, dateStr: null });
  for (let d = 1; d <= daysInMonth; d++){
    const dateStr = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    cells.push({ day: d, outside: false, dateStr });
  }
  while (cells.length % 7 !== 0) cells.push({ day: cells.length, outside: true, dateStr: null });

  $('calGrid').innerHTML = cells.map(c => {
    if (c.outside) return `<div class="cal-day outside"><div class="cd-num">${c.day}</div></div>`;
    const dayTasks = state.tasks.filter(t => t.due === c.dateStr);
    const shown = dayTasks.slice(0, 3);
    const more = dayTasks.length - shown.length;
    return `
      <div class="cal-day ${c.dateStr === today ? 'today' : ''}" data-date="${c.dateStr}">
        <div class="cd-num">${c.day}</div>
        ${shown.map(t => {
          const p = projectById(t.projectId);
          return `<div class="cd-chip" style="--accent:${p?p.color:'#888'}; border-left-color:${p?p.color:'#888'}">${escapeHtml(t.title)}</div>`;
        }).join('')}
        ${more > 0 ? `<div class="cd-more">+${more} more</div>` : ''}
      </div>
    `;
  }).join('');

  $('calGrid').querySelectorAll('.cal-day[data-date]').forEach(el => {
    el.addEventListener('click', () => openDayModal(el.dataset.date));
  });
}
$('calPrev').addEventListener('click', () => { calMonth--; if (calMonth < 0){ calMonth = 11; calYear--; } renderCalendar(); });
$('calNext').addEventListener('click', () => { calMonth++; if (calMonth > 11){ calMonth = 0; calYear++; } renderCalendar(); });
$('calToday').addEventListener('click', () => { const d = new Date(); calYear = d.getFullYear(); calMonth = d.getMonth(); renderCalendar(); });

function openDayModal(dateStr){
  const dayTasks = state.tasks.filter(t => t.due === dateStr);
  $('dayModalTitle').textContent = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });
  $('dayTaskList').innerHTML = dayTasks.length ? dayTasks.map(t => {
    const p = projectById(t.projectId); const a = userById(t.assigneeId);
    return `
      <div class="day-task-row" data-task="${t.id}">
        <span class="swatch" style="background:${p?p.color:'#888'}"></span>
        <div class="info" style="flex:1">
          <div class="t" style="font-weight:600; font-size:13px;">${escapeHtml(t.title)}</div>
          <div class="p" style="font-size:11px; color:var(--muted); font-family:var(--mono)">${p?p.name:''} · ${a?a.name:'Unassigned'}</div>
        </div>
        <span class="prio-chip prio-${t.priority}">${PRIORITY_LABEL[t.priority]}</span>
      </div>
    `;
  }).join('') : '<div class="empty-note">Nothing due this day.</div>';

  $('dayTaskList').querySelectorAll('.day-task-row').forEach(row => {
    row.addEventListener('click', () => { closeAllModals(); openTaskModal(row.dataset.task); });
  });
  openModal('dayModal');
}


function renderTeam(){
  $('teamGrid').innerHTML = state.users.map(u => {
    const open = state.tasks.filter(t => t.assigneeId === u.id && t.status !== 'done').length;
    const done = state.tasks.filter(t => t.assigneeId === u.id && t.status === 'done').length;
    return `
      <div class="member-card" data-member="${u.id}">
        <div class="m-avatar" style="background:${u.color}">${initials(u.name)}</div>
        <h4>${escapeHtml(u.name)}</h4>
        <p class="m-role">${escapeHtml(u.role || '')}</p>
        <div class="m-stats">
          <div><b>${open}</b><span>Open</span></div>
          <div><b>${done}</b><span>Done</span></div>
        </div>
      </div>
    `;
  }).join('');
  $('teamGrid').querySelectorAll('.member-card').forEach(card => {
    card.addEventListener('click', () => openMemberModal(card.dataset.member));
  });
}

function openMemberModal(id){
  const u = id ? userById(id) : null;
  $('memberModalTitle').textContent = u ? 'Edit member' : 'Add member';
  $('memberId').value = u ? u.id : '';
  $('memberName').value = u ? u.name : '';
  $('memberRole').value = u ? u.role : '';
  swatchPickValue.member = u ? u.color : ACCENTS[state.users.length % ACCENTS.length];
  buildSwatches('memberSwatches', 'member');
  setSwatchSelection('memberSwatches', swatchPickValue.member);
  $('deleteMemberBtn').style.display = u ? 'inline-flex' : 'none';
  openModal('memberModal');
}
$('newMemberBtn').addEventListener('click', () => openMemberModal(null));

$('saveMemberBtn').addEventListener('click', () => {
  const name = $('memberName').value.trim();
  if (!name){ showToast('Give the member a name.'); return; }
  const id = $('memberId').value;
  if (id){
    const u = userById(id);
    u.name = name; u.role = $('memberRole').value.trim(); u.color = swatchPickValue.member;
    showToast('Member updated.');
  } else {
    state.users.push({ id: nextId('u'), name, role: $('memberRole').value.trim(), color: swatchPickValue.member });
    showToast('Member added.');
  }
  saveState(); closeAllModals(); renderAll();
});
$('deleteMemberBtn').addEventListener('click', () => {
  const id = $('memberId').value;
  if (!id) return;
  if (!confirm('Remove this member? Their tasks will become unassigned.')) return;
  state.users = state.users.filter(u => u.id !== id);
  state.tasks.forEach(t => { if (t.assigneeId === id) t.assigneeId = null; });
  if (state.currentUserId === id) state.currentUserId = state.users[0] ? state.users[0].id : null;
  saveState(); closeAllModals(); renderAll();
  showToast('Member removed.');
});


function renderCurrentUser(){
  const u = userById(state.currentUserId) || state.users[0];
  if (!u){ return; }
  $('cuAvatar').textContent = initials(u.name);
  $('cuAvatar').style.background = u.color;
  $('cuName').textContent = u.name;
  $('cuRole').textContent = u.role || '';
}
$('currentUserBox').addEventListener('click', () => {
  $('switchList').innerHTML = state.users.map(u => `
    <div class="switch-row ${u.id === state.currentUserId ? 'is-current' : ''}" data-user="${u.id}">
      <span class="mini-avatar" style="background:${u.color}">${initials(u.name)}</span>
      <div><div style="font-size:13px; font-weight:600;">${escapeHtml(u.name)}</div><div style="font-size:11px; color:var(--muted)">${escapeHtml(u.role||'')}</div></div>
    </div>
  `).join('');
  $('switchList').querySelectorAll('.switch-row').forEach(row => {
    row.addEventListener('click', () => {
      state.currentUserId = row.dataset.user;
      saveState(); renderCurrentUser(); closeAllModals();
      showToast('Switched active user.');
    });
  });
  openModal('switchUserModal');
});


$('globalSearch').addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  const q = $('globalSearch').value.trim();
  if (!q) return;
  $('filterSearch').value = q;
  $('filterProject').value = 'all'; $('filterAssignee').value = 'all'; $('filterPriority').value = 'all';
  switchView('board');
  applyBoardFilters();
});


function escapeHtml(str){
  return String(str || '').replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}


function renderAll(){
  renderStats();
  renderDueSoon();
  renderProjects();
  renderBoard();
  renderTeam();
  renderCurrentUser();
  renderCharts();
  if (document.getElementById('view-calendar').classList.contains('is-active')) renderCalendar();
}

renderAll();