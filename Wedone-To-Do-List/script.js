(() => {
'use strict';
const $ = id => document.getElementById(id);
const KEY = 'wedone-todolist-v4';

// ── State ──
let data = { folders: [], selectedFolder: null };
let dialogResolve = null;
let ctxFolderId = null;
let ctxTaskIdx = null;
let ctxTaskId = null;
let ctxTaskFolderId = null;
let taskFilter='all';

// ── Load ──
try { const s = localStorage.getItem(KEY); if (s) data = JSON.parse(s); } catch {}
if (!Array.isArray(data.folders)) data.folders = [];
const makeId=()=>('wd-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9));
const usedIds=new Set();let normalizedTaskCount=0;
function uniqueId(value){if(typeof value==='string'&&/^[A-Za-z0-9_-]{1,180}$/.test(value)&&!usedIds.has(value)){usedIds.add(value);return value}let next=makeId();while(usedIds.has(next))next=makeId();usedIds.add(next);return next}
function normalizeTasks(tasks,depth=0){if(!Array.isArray(tasks)||depth>20)return [];const out=[];for(const t of tasks){if(normalizedTaskCount>=10000)break;if(!t||typeof t!=='object'||Array.isArray(t))continue;normalizedTaskCount++;const name=typeof t.name==='string'&&t.name.trim()?t.name.trim().slice(0,500):'Tâche sans titre';const priority=['normal','important','urgent'].includes(t.priority)?t.priority:'normal';const due=typeof t.due==='string'&&validTodoDate(t.due)?t.due:'';const dueTime=due&&typeof t.dueTime==='string'&&/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(t.dueTime)?t.dueTime:'';out.push({id:uniqueId(t.id),name,done:t.done===true,priority,due,dueTime,expanded:t.expanded===true,subtasks:normalizeTasks(t.subtasks,depth+1)});if(normalizedTaskCount>=10000)break}return out}
function normalizeData(source){usedIds.clear();normalizedTaskCount=0;const folders=(Array.isArray(source?.folders)?source.folders:[]).filter(f=>f&&typeof f==='object'&&!Array.isArray(f)).slice(0,200).map(f=>({id:uniqueId(f.id),name:typeof f.name==='string'&&f.name.trim()?f.name.trim().slice(0,120):'Sans nom',tasks:normalizeTasks(f.tasks)}));const selected=folders.some(f=>f.id===source?.selectedFolder)?source.selectedFolder:(folders[0]?.id||null);return {folders,selectedFolder:selected}}
data=normalizeData(data);

// ── Persist ──
let lastSavedRaw='';
const save = () => { const raw=JSON.stringify(data); try { localStorage.setItem(KEY, raw); lastSavedRaw=raw; window.dispatchEvent(new CustomEvent('wedone:todolist-updated',{detail:{key:KEY}})); return true; } catch(err) { console.error('Wedone To Do: sauvegarde impossible',err); const el=document.getElementById('tasksHelp'); if(el)el.textContent='Erreur de sauvegarde : exportez vos données avant de continuer.'; return false; } };


// ── Internal dialog (same system as Notepad) ──
function showDialog({ title = 'Confirmer', message = '', input = false, value = '', confirmText = 'Confirmer', danger = false } = {}) {
  $('dialogTitle').textContent = title;
  $('dialogMessage').textContent = message;
  $('dialogInput').hidden = !input;
  $('dialogInput').value = value;
  $('dialogConfirm').textContent = confirmText;
  $('dialogConfirm').classList.toggle('danger', danger);
  const bd = $('appDialog');
  bd.classList.add('visible');
  bd.setAttribute('aria-hidden', 'false');
  setTimeout(() => { if (input) { $('dialogInput').focus(); $('dialogInput').select(); } else { $('dialogConfirm').focus(); } }, 50);
  return new Promise(resolve => { dialogResolve = resolve; });
}
function closeDialog(result) {
  $('appDialog').classList.remove('visible');
  $('appDialog').setAttribute('aria-hidden', 'true');
  if (dialogResolve) { dialogResolve(result); dialogResolve = null; }
}
$('dialogCancel').addEventListener('click', () => closeDialog(null));
$('dialogConfirm').addEventListener('click', () => closeDialog($('dialogInput').hidden ? true : $('dialogInput').value));
$('appDialog').addEventListener('click', e => { if (e.target === $('appDialog')) closeDialog(null); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeDialog(null); hideContextMenus(); } });

// ── Context menus ──
const folderMenu = $('folderContextMenu');
const taskMenu = $('taskContextMenu');
function hideContextMenus() { folderMenu.style.display = 'none'; taskMenu.style.display = 'none'; }
function posMenu(menu, x, y) {
  menu.style.display = 'block';
  const w = menu.offsetWidth, h = menu.offsetHeight;
  menu.style.left = Math.min(x, window.innerWidth - w - 8) + 'px';
  menu.style.top = Math.min(y, window.innerHeight - h - 8) + 'px';
}
document.addEventListener('click', e => { if (!e.target.closest('.wd-context-menu')) hideContextMenus(); });
window.addEventListener('resize', hideContextMenus);

// ── Render folders ──
function renderFolders() {
  const q = ($('folderSearch').value || '').toLocaleLowerCase('fr');
  const list = $('folderList');
  const filtered = data.folders.filter(f => f.name.toLocaleLowerCase('fr').includes(q));
  list.innerHTML = filtered.map(f => {
    const flatten=arr=>(arr||[]).flatMap(t=>[t,...flatten(t.subtasks)]); const all=flatten(f.tasks); const count=all.length;
    const done=all.filter(t=>t.done).length;
    const pct = count ? Math.round(done / count * 100) : 0; return `<button class="folder-item${data.selectedFolder === f.id ? ' selected' : ''}" data-id="${esc(f.id)}"><strong>${esc(f.name)}</strong><span class="folder-progress"><i style="width:${pct}%"></i></span><small>${done}/${count} tâche${count > 1 ? 's' : ''}</small></button>`;
  }).join('') || '<p class="empty-hint">Aucun dossier. Créez-en un avec le bouton +</p>';
  // Update task panel header
  const sel = data.folders.find(f => f.id === data.selectedFolder);
  $('tasksFolderLabel').textContent = sel ? sel.name.toUpperCase() : 'SÉLECTIONNEZ UN DOSSIER';
  $('tasksPanelTitle').textContent = sel ? 'Tâches' : 'Tâches';
  $('newTaskBtn').disabled = !sel;
  $('taskInput').disabled = !sel;
  $('addTaskBtn').disabled = !sel;
}

function taskIsOverdue(task){if(!task||task.done||!task.due)return false;const due=task.dueTime?new Date(task.due+'T'+task.dueTime+':00'):new Date(task.due+'T23:59:59');return due.getTime()<Date.now();}
function hasOverdue(task){return taskIsOverdue(task)||(Array.isArray(task.subtasks)&&task.subtasks.some(hasOverdue));}
function hasOverdueChild(task){return Array.isArray(task.subtasks)&&task.subtasks.some(hasOverdue);}
function hasDueInRange(task,mode){if(!task||task.done)return false;const today=new Date();today.setHours(0,0,0,0);const tomorrow=new Date(today);tomorrow.setDate(tomorrow.getDate()+1);let match=false;if(task.due){const d=new Date(task.due+'T00:00:00');match=mode==='today'?(d>=today&&d<tomorrow):(d>=tomorrow);}return match||(Array.isArray(task.subtasks)&&task.subtasks.some(st=>hasDueInRange(st,mode)));}
function matchesFilter(task,mode){if(mode==='all')return true;if(mode==='todo')return !task.done;if(mode==='done')return !!task.done;if(mode==='urgent')return task.priority==='urgent';if(mode==='overdue')return hasOverdue(task);if(mode==='today'||mode==='upcoming')return hasDueInRange(task,mode);return true;}
window.addEventListener('storage',e=>{if(e.key!==KEY||!e.newValue)return;try{const incoming=JSON.parse(e.newValue);if(!incoming||!Array.isArray(incoming.folders))return;data=normalizeData(incoming);const clean=JSON.stringify(data);if(clean!==e.newValue)save();renderFolders();renderTasks();}catch(err){console.warn('Wedone To Do: données externes invalides, état courant conservé',err);}});
window.addEventListener('wedone:todolist-updated',()=>{});

// ── Render tasks ──
function renderTasks() {
  const dueButton=$('taskDueInput');if(dueButton&&!dueButton.dataset.value)dueButton.textContent='Date';
  const ul = $('taskList'); const folder = data.folders.find(f => f.id === data.selectedFolder);
  if (!folder) { ul.innerHTML = '<p class="empty-hint">Sélectionnez un dossier pour voir ses tâches.</p>'; return; }
  if (!folder.tasks || !folder.tasks.length) { ul.innerHTML = '<p class="empty-hint">Aucune tâche dans ce dossier. Ajoutez-en une !</p>'; return; }
  folder.tasks.forEach(t=>{if(!Array.isArray(t.subtasks))t.subtasks=[];if(!t.priority)t.priority='normal';if((taskFilter==='overdue'&&hasOverdueChild(t))||((taskFilter==='today'||taskFilter==='upcoming')&&Array.isArray(t.subtasks)&&t.subtasks.some(st=>hasDueInRange(st,taskFilter))))t.expanded=true;});
  ul.innerHTML = folder.tasks.map((t,i)=>({t,i})).filter(({t})=>matchesFilter(t,taskFilter)).map(({t,i})=>`<li class="task-wrap" data-idx="${i}"><div class="task-item${t.done?' done':''} priority-${t.priority||'normal'}" draggable="true" data-idx="${i}"><button class="task-expand" data-expand="${i}" aria-label="Afficher les sous-tâches" title="Sous-tâches">${t.subtasks&&t.subtasks.length?(t.expanded?'▾':'▸'):'＋'}</button><input type="checkbox" data-check="${i}"${t.done?' checked':''}><div class="task-copy"><span class="task-label">${esc(t.name)}</span><button type="button" class="task-due-button${taskIsOverdue(t)?' overdue':''}" data-editdue="${i}" title="Modifier la date et l’heure">${t.due?'Échéance : '+new Date(t.due+'T12:00:00').toLocaleDateString('fr-FR')+(t.dueTime?' · '+t.dueTime:''):'＋ Ajouter une échéance'}</button></div><button type="button" class="priority-tag" data-priority="${i}" aria-label="Changer la priorité" title="Cliquer pour changer la priorité">${({normal:'Normale',important:'Importante',urgent:'Urgente'})[t.priority||'normal']}</button><button class="task-del" data-delete="${i}" title="Supprimer" aria-label="Supprimer">✕</button></div>${t.expanded&&t.subtasks&&t.subtasks.length?`<div class="subtasks">${t.subtasks.map((st,j)=>`<div class="subtask-row${st.done?' done':''}"><label class="subtask"><input type="checkbox" data-subtask="${i}:${j}" ${st.done?'checked':''}><span>${esc(st.name)}</span></label><button type="button" class="subtask-priority priority-${st.priority||'normal'}" data-subpriority="${i}:${j}" title="Changer la priorité">${({normal:'Normale',important:'Importante',urgent:'Urgente'})[st.priority||'normal']}</button><button type="button" class="subtask-due${taskIsOverdue(st)?' overdue':''}" data-subdue="${i}:${j}" title="Modifier l’échéance">${st.due?new Date(st.due+'T12:00:00').toLocaleDateString('fr-FR')+(st.dueTime?' · '+st.dueTime:''):'＋ Date'}</button></div>`).join('')}</div>`:''}</li>`).join('');
  if(!ul.children.length)ul.innerHTML='<p class="empty-hint">Aucune tâche ne correspond à ce filtre.</p>';
  ul.querySelectorAll('[data-check]').forEach(cb=>cb.addEventListener('change',()=>toggleTask(Number(cb.dataset.check))));
  ul.querySelectorAll('[data-priority]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();const t=folder.tasks[Number(b.dataset.priority)];if(!t)return;t.priority=({normal:'important',important:'urgent',urgent:'normal'})[t.priority||'normal'];save();renderTasks();renderFolders()}));
  ul.querySelectorAll('[data-editdue]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();const i=Number(b.dataset.editdue),t=folder.tasks[i];if(t)window.openTaskDate(i,t.due||'',t.dueTime||'')}));
  ul.querySelectorAll('[data-subtask]').forEach(cb=>cb.addEventListener('change',()=>{const [i,j]=cb.dataset.subtask.split(':').map(Number);const t=folder.tasks[i];if(t&&t.subtasks[j]){t.subtasks[j].done=cb.checked;save();renderTasks();renderFolders()}}));
  ul.querySelectorAll('[data-subpriority]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();const [i,j]=b.dataset.subpriority.split(':').map(Number),st=folder.tasks[i]?.subtasks?.[j];if(!st)return;st.priority=({normal:'important',important:'urgent',urgent:'normal'})[st.priority||'normal'];save();renderTasks();renderFolders()}));
  ul.querySelectorAll('[data-subdue]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();const [i,j]=b.dataset.subdue.split(':').map(Number),st=folder.tasks[i]?.subtasks?.[j];if(st)window.openSubtaskDate(i,j,st.due||'',st.dueTime||'')}));

  ul.querySelectorAll('[data-expand]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();const t=folder.tasks[Number(b.dataset.expand)];if(!t)return;if(!t.subtasks)t.subtasks=[];if(!t.subtasks.length){addSubtask(Number(b.dataset.expand));return}t.expanded=!t.expanded;save();renderTasks()}));
  ul.querySelectorAll('[data-delete]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();deleteTask(Number(b.dataset.delete))}));
  ul.querySelectorAll('.task-item').forEach(li=>{li.addEventListener('dragstart',e=>{li.classList.add('dragging');e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',li.dataset.idx)});li.addEventListener('dragend',()=>{li.classList.remove('dragging');ul.querySelectorAll('.drag-over').forEach(x=>x.classList.remove('drag-over'))});li.addEventListener('dragover',e=>{e.preventDefault();li.classList.add('drag-over')});li.addEventListener('dragleave',()=>li.classList.remove('drag-over'));li.addEventListener('drop',e=>{e.preventDefault();const from=Number(e.dataTransfer.getData('text/plain')),to=Number(li.dataset.idx);if(from===to||!Number.isFinite(from))return;const [moved]=folder.tasks.splice(from,1);folder.tasks.splice(to,0,moved);save();renderTasks();renderFolders()});li.addEventListener('contextmenu',e=>{e.preventDefault();ctxTaskIdx=Number(li.dataset.idx);ctxTaskFolderId=folder.id;ctxTaskId=folder.tasks[ctxTaskIdx]?.id||null;hideContextMenus();posMenu(taskMenu,e.clientX,e.clientY)})});
}
// ── Folder actions ──
function selectFolder(id) {
  data.selectedFolder = data.selectedFolder === id ? null : id;
  save(); renderFolders(); renderTasks();
}
async function createFolder(initialName) {
  const name = initialName || await showDialog({ title: 'Nouveau dossier', message: 'Donnez un nom à votre liste.', input: true, value: '', confirmText: 'Créer' });
  if (!name || !String(name).trim()) return;
  const nm = String(name).trim();
  if(initialName){$('folderNameInput').value='';}
  if (data.folders.some(f => f.name === nm)) { await showDialog({ title: 'Nom déjà utilisé', message: `Un dossier « ${nm} » existe déjà.`, confirmText: 'Compris' }); return; }
  const folder={ id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), name: nm, tasks: [] };data.folders.push(folder);data.selectedFolder=folder.id;
  save(); renderFolders(); renderTasks();
}
async function renameFolder(id) {
  const folder = data.folders.find(f => f.id === id);
  if (!folder) return;
  const name = await showDialog({ title: 'Renommer le dossier', message: 'Choisissez un nouveau nom.', input: true, value: folder.name, confirmText: 'Enregistrer' });
  if (!name || !String(name).trim()) return;
  const currentFolder=data.folders.find(f=>f.id===id);if(!currentFolder)return;
  currentFolder.name = String(name).trim().slice(0,120);
  save(); renderFolders();
}
async function deleteFolder(id) {
  const folder = data.folders.find(f => f.id === id);
  if (!folder) return;
  const ok = await showDialog({ title: 'Supprimer ce dossier ?', message: `« ${folder.name} » et toutes ses tâches seront supprimés définitivement.`, confirmText: 'Supprimer', danger: true });
  if (!ok) return;
  data.folders = data.folders.filter(f => f.id !== id);
  if (data.selectedFolder === id) data.selectedFolder = null;
  save(); renderFolders(); renderTasks();
}

// ── Task actions ──
function addTask() {
  const input = $('taskInput');
  const name = input.value.trim();
  if (!name) return;
  const folder = data.folders.find(f => f.id === data.selectedFolder);
  if (!folder) return;
  if (!folder.tasks) folder.tasks = [];
  if (folder.tasks.some(t => t.name === name)) return;
  folder.tasks.push({ id:makeId(), name, done: false, priority:'normal', due:$('taskDueInput').dataset.value||'', dueTime:$('taskDueInput').dataset.time||'', subtasks:[] }); $('taskDueInput').dataset.value=''; $('taskDueInput').dataset.time=''; $('taskDueInput').textContent='Date';
  input.value = '';
  save(); renderTasks(); renderFolders();
}
function toggleTask(idx) {
  const folder = data.folders.find(f => f.id === data.selectedFolder);
  if (!folder || !folder.tasks[idx]) return;
  folder.tasks[idx].done = !folder.tasks[idx].done;
  save(); renderTasks(); renderFolders();
}
async function addSubtask(idx) {const folder=data.folders.find(f=>f.id===data.selectedFolder),task=folder&&folder.tasks[idx];if(!task)return;const folderId=folder.id,taskId=task.id;const name=await showDialog({title:'Ajouter une sous-tâche',message:'Décrivez cette petite étape.',input:true,value:'',confirmText:'Ajouter'});if(!name||!String(name).trim())return;const currentFolder=data.folders.find(f=>f.id===folderId),currentTask=currentFolder?.tasks?.find(t=>t.id===taskId);if(!currentTask)return;if(!Array.isArray(currentTask.subtasks))currentTask.subtasks=[];currentTask.subtasks.push({id:makeId(),name:String(name).trim().slice(0,500),done:false,priority:'normal',due:'',dueTime:'',subtasks:[]});currentTask.expanded=true;save();renderTasks();renderFolders();}
async function setTaskDue(idx){const folder=data.folders.find(f=>f.id===data.selectedFolder);const t=folder&&folder.tasks[idx];if(!t)return;window.openTaskDate(idx,t.due||'',t.dueTime||'');}
async function editTask(idx) {
 const folder=data.folders.find(f=>f.id===data.selectedFolder),task=folder&&folder.tasks[idx];if(!task)return;const folderId=folder.id,taskId=task.id;
 const name=await showDialog({title:'Modifier la tâche',message:'Changez le nom de la tâche.',input:true,value:task.name,confirmText:'Enregistrer'});if(!name||!String(name).trim())return;
 const currentFolder=data.folders.find(f=>f.id===folderId),currentTask=currentFolder?.tasks?.find(t=>t.id===taskId);if(!currentTask){showDialog({title:'Tâche introuvable',message:'Cette tâche a été supprimée dans une autre fenêtre. Aucune modification n’a été appliquée.',confirmText:'Compris'});return}
 currentTask.name=String(name).trim().slice(0,500);save();renderTasks();renderFolders();
}
async function deleteTask(idx) {
 const folder=data.folders.find(f=>f.id===data.selectedFolder),task=folder&&folder.tasks[idx];if(!task)return;const folderId=folder.id,taskId=task.id;
 const ok=await showDialog({title:'Supprimer cette tâche ?',message:`« ${task.name} » sera supprimée définitivement.`,confirmText:'Supprimer',danger:true});if(!ok)return;
 const currentFolder=data.folders.find(f=>f.id===folderId);if(!currentFolder)return;const currentIndex=currentFolder.tasks.findIndex(t=>t.id===taskId);if(currentIndex<0)return;currentFolder.tasks.splice(currentIndex,1);save();renderTasks();renderFolders();
}

// ── Context menu handlers ──
$('folderList').addEventListener('contextmenu', e => {
  const btn = e.target.closest('[data-id]');
  if (!btn) return;
  e.preventDefault();
  ctxFolderId = btn.dataset.id;
  hideContextMenus();
  posMenu(folderMenu, e.clientX, e.clientY);
});
$('ctxFolderEdit').addEventListener('click', () => { hideContextMenus(); renameFolder(ctxFolderId); });
$('ctxFolderDelete').addEventListener('click', () => { hideContextMenus(); deleteFolder(ctxFolderId); });
function currentContextTask(){const f=data.folders.find(x=>x.id===ctxTaskFolderId);return {folder:f,task:f?.tasks?.find(t=>t.id===ctxTaskId),index:f?.tasks?.findIndex(t=>t.id===ctxTaskId)??-1}}
$('ctxTaskEdit').addEventListener('click', () => { const t=currentContextTask();hideContextMenus();if(t.index>=0)editTask(t.index); });
$('ctxTaskSub').addEventListener('click',()=>{const t=currentContextTask();hideContextMenus();if(t.index>=0)addSubtask(t.index)});$('ctxTaskDue').addEventListener('click',()=>{const t=currentContextTask();hideContextMenus();if(t.index>=0){data.selectedFolder=t.folder.id;setTaskDue(t.index)}});
for(const [id,priority] of [['ctxTaskPriorityNormal','normal'],['ctxTaskPriorityImportant','important'],['ctxTaskPriorityUrgent','urgent']])$(id).addEventListener('click',()=>{const t=currentContextTask().task;if(t){t.priority=priority;save();renderTasks();renderFolders()}hideContextMenus()});
$('ctxTaskDelete').addEventListener('click', () => { const t=currentContextTask();hideContextMenus();if(t.index>=0){data.selectedFolder=t.folder.id;deleteTask(t.index)} });

// Navigation verticale : filtres rapides dans le dossier actif.
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{taskFilter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===b));renderTasks()}));

// ── Event listeners ──
$('folderList').addEventListener('click', e => {
  const btn = e.target.closest('[data-id]');
  if (!btn) return;
  selectFolder(btn.dataset.id);
});
$('newFolderBtn').addEventListener('click', createFolder);
$('createFolderInline').addEventListener('click',()=>{const v=$('folderNameInput').value.trim();if(!v){$('folderNameInput').focus();return}createFolder(v)});
$('folderNameInput').addEventListener('keydown',e=>{if(e.key==='Enter')$('createFolderInline').click()});
$('toggleFolderSearch').addEventListener('click',()=>{$('folderSearch').classList.toggle('hidden');if(!$('folderSearch').classList.contains('hidden'))$('folderSearch').focus();else{$('folderSearch').value='';renderFolders()}});
$('importBtn').addEventListener('click',()=>$('importFile').click());
$('addTaskBtn').addEventListener('click', addTask);
$('newTaskBtn').addEventListener('click', () => { $('taskInput').focus(); });
$('taskInput').addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });
$('folderSearch').addEventListener('input', renderFolders);

function validTodoDate(value){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const [y,m,d]=value.split('-').map(Number);const x=new Date(y,m-1,d,12);return x.getFullYear()===y&&x.getMonth()===m-1&&x.getDate()===d}
function validateTodoImport(value){
 if(!value||typeof value!=='object'||Array.isArray(value)||!Array.isArray(value.folders)||value.folders.length>200)return false;
 const ids=new Set();let count=0;
 const safeId=id=>typeof id==='string'&&/^[A-Za-z0-9_-]{1,180}$/.test(id);
 function taskOk(t,depth=0){if(!t||typeof t!=='object'||Array.isArray(t)||depth>20||++count>10000)return false;
  if(typeof t.name!=='string'||!t.name.trim()||t.name.length>500)return false;
  if(t.id!==undefined&&(!safeId(t.id)||ids.has(t.id)))return false;if(t.id){ids.add(t.id)}
  if(t.done!==undefined&&typeof t.done!=='boolean')return false;
  if(t.expanded!==undefined&&typeof t.expanded!=='boolean')return false;
  if(t.priority!==undefined&&!['normal','important','urgent'].includes(t.priority))return false;
  if(t.due!==undefined&&t.due!==''&&!validTodoDate(t.due))return false;
  if(t.dueTime!==undefined&&t.dueTime!==''&&(typeof t.dueTime!=='string'||! /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(t.dueTime)))return false;
  if(t.subtasks!==undefined&&!Array.isArray(t.subtasks))return false;
  return (t.subtasks||[]).every(st=>taskOk(st,depth+1));
 }
 for(const f of value.folders){if(!f||typeof f!=='object'||Array.isArray(f)||typeof f.name!=='string'||!f.name.trim()||f.name.length>120||!Array.isArray(f.tasks))return false;
  if(f.id!==undefined&&(!safeId(f.id)||ids.has(f.id)))return false;if(f.id)ids.add(f.id);
  if(!f.tasks.every(t=>taskOk(t,0)))return false;
 }
 if(value.selectedFolder!==undefined&&value.selectedFolder!==null&&(typeof value.selectedFolder!=='string'||(value.selectedFolder&&!value.folders.some(f=>f.id===value.selectedFolder))))return false;
 return true;
}
function normalizeTodoImport(value){const copyTask=t=>({id:t.id||makeId(),name:t.name,done:!!t.done,priority:['normal','important','urgent'].includes(t.priority)?t.priority:'normal',due:typeof t.due==='string'?t.due:'',dueTime:typeof t.dueTime==='string'?t.dueTime:'',expanded:!!t.expanded,subtasks:(t.subtasks||[]).map(copyTask)});const folders=value.folders.map(f=>({id:f.id||makeId(),name:f.name.trim(),tasks:f.tasks.map(copyTask)}));return {folders,selectedFolder:folders.some(f=>f.id===value.selectedFolder)?value.selectedFolder:(folders[0]?.id||null)}}

// ── Export / Import ──
$('exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'wedone-todo.json'; a.click(); URL.revokeObjectURL(a.href);
});
$('railImport')?.addEventListener('click', () => $('importFile').click());
$('importFile').addEventListener('change', async e => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  try {
    if(file.size>5*1024*1024) throw new Error('too-large');
    const parsed = JSON.parse(await file.text());
    if (!validateTodoImport(parsed)) throw new Error('invalid');
    const ok = await showDialog({title:'Remplacer vos tâches ?',message:`Le fichier contient ${parsed.folders.length} dossier(s). Les données actuellement présentes seront remplacées. Exportez-les avant de continuer si vous souhaitez les conserver.`,confirmText:'Importer'});
    if(!ok){e.target.value='';return;}
    const previous=data;data=normalizeData(normalizeTodoImport(parsed));
    if(save()){renderFolders();renderTasks()}else{data=previous;renderFolders();renderTasks()}
  } catch {
    await showDialog({ title: 'Importation impossible', message: 'Le fichier est invalide, trop volumineux ou ne correspond pas à un export Wedone compatible. Vos données actuelles ont été conservées.', confirmText: 'Compris' });
  }
  e.target.value = '';
});

// Calendrier Wedone personnalisé (aucun sélecteur natif du navigateur).
(()=>{const btn=$('taskDueInput'),bd=$('dateDialog');if(!btn||!bd)return;let cursor=new Date(),pending='',pendingTime='',targetTask=null,targetTaskId=null,targetFolderId=null,targetSubtask=null;const pad=n=>String(n).padStart(2,'0');const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;function render(){const y=cursor.getFullYear(),m=cursor.getMonth();$('calMonth').textContent=cursor.toLocaleDateString('fr-FR',{month:'long',year:'numeric'});const first=new Date(y,m,1),offset=(first.getDay()+6)%7,total=new Date(y,m+1,0).getDate();let out=['Lu','Ma','Me','Je','Ve','Sa','Di'].map(x=>`<span class="calendar-weekday">${x}</span>`).join('');for(let i=0;i<offset;i++)out+='<span class="calendar-blank"></span>';for(let d=1;d<=total;d++){const val=iso(new Date(y,m,d));out+=`<button type="button" class="calendar-day${val===pending?' selected':''}${val===iso(new Date())?' today':''}" data-day="${val}">${d}</button>`}$('calendarGrid').innerHTML=out}function open(){targetTask=null;targetTaskId=null;targetFolderId=null;targetSubtask=null;pending=btn.dataset.value||'';pendingTime=btn.dataset.time||'';$('dueTimeInput').value=pendingTime;const d=pending?new Date(pending+'T12:00:00'):new Date();cursor=new Date(d.getFullYear(),d.getMonth(),1);render();bd.classList.add('visible');bd.setAttribute('aria-hidden','false')}function close(){bd.classList.remove('visible');bd.setAttribute('aria-hidden','true')}function openTaskDate(idx,due,time=''){const folder=data.folders.find(f=>f.id===data.selectedFolder),task=folder?.tasks?.[idx];targetTask=idx;targetFolderId=folder?.id||null;targetTaskId=task?.id||null;targetSubtask=null;pending=due;pendingTime=time;$('dueTimeInput').value=time;const d=due?new Date(due+'T12:00:00'):new Date();cursor=new Date(d.getFullYear(),d.getMonth(),1);render();bd.classList.add('visible');bd.setAttribute('aria-hidden','false')}window.openTaskDate=openTaskDate;function openSubtaskDate(parentIdx,subIdx,due,time=''){const folder=data.folders.find(f=>f.id===data.selectedFolder),parent=folder?.tasks?.[parentIdx],sub=parent?.subtasks?.[subIdx];targetTask=null;targetFolderId=folder?.id||null;targetTaskId=parent?.id||null;targetSubtask={parentIdx,subIdx,parentId:parent?.id||null,subId:sub?.id||null};pending=due;pendingTime=time;$('dueTimeInput').value=time;const d=due?new Date(due+'T12:00:00'):new Date();cursor=new Date(d.getFullYear(),d.getMonth(),1);render();bd.classList.add('visible');bd.setAttribute('aria-hidden','false')}window.openSubtaskDate=openSubtaskDate;btn.addEventListener('click',open);$('calPrev').addEventListener('click',()=>{cursor.setMonth(cursor.getMonth()-1);render()});$('calNext').addEventListener('click',()=>{cursor.setMonth(cursor.getMonth()+1);render()});$('calendarGrid').addEventListener('click',e=>{const b=e.target.closest('[data-day]');if(b){pending=b.dataset.day;render()}});$('clearDue').addEventListener('click',()=>{if(targetSubtask){const f=data.folders.find(x=>x.id===targetFolderId),parent=f?.tasks?.find(t=>t.id===targetSubtask.parentId),st=parent?.subtasks?.find(t=>t.id===targetSubtask.subId);if(st){st.due='';st.dueTime='';save();renderTasks();renderFolders()}}else if(targetTask!==null){const f=data.folders.find(x=>x.id===targetFolderId),t=f?.tasks?.find(t=>t.id===targetTaskId);if(t){t.due='';t.dueTime='';save();renderTasks();renderFolders()}}else{pending='';pendingTime='';btn.dataset.value='';btn.dataset.time='';btn.textContent='Date';$('dueTimeInput').value=''}close()});$('cancelDate').addEventListener('click',close);$('confirmDate').addEventListener('click',()=>{const time=$('dueTimeInput').value.trim();if(time&&!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)){$('dueTimeInput').setCustomValidity('Saisissez une heure au format HH:MM.');$('dueTimeInput').reportValidity();return}$('dueTimeInput').setCustomValidity('');if(targetSubtask){const f=data.folders.find(x=>x.id===targetFolderId),parent=f?.tasks?.find(t=>t.id===targetSubtask.parentId),st=parent?.subtasks?.find(t=>t.id===targetSubtask.subId);if(st){st.due=pending;st.dueTime=time}save();renderTasks();renderFolders()}else if(targetTask!==null){const f=data.folders.find(x=>x.id===targetFolderId),t=f?.tasks?.find(t=>t.id===targetTaskId);if(t){t.due=pending;t.dueTime=time}save();renderTasks();renderFolders()}else{btn.dataset.value=pending;btn.dataset.time=time;btn.textContent=pending?(new Date(pending+'T12:00:00').toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'})+(time?' '+time:'')):'Date'}close()});bd.addEventListener('click',e=>{if(e.target===bd)close()});})();

// ── Splitter robuste et persistant ──
(() => {
  const layout=document.querySelector('main'), spl=$('splitter'), folders=document.querySelector('.folders-panel');
  if(!layout||!spl||!folders)return;
  let w=265;try{w=Number(localStorage.getItem('wedone-todo-folder-w'))||265}catch{}
  const clamp=()=>Math.max(190,Math.min(Math.max(220,layout.clientWidth-390),w));
  const apply=()=>{w=clamp();document.documentElement.style.setProperty('--folder-w',w+'px');};
  apply(); let dragging=false;
  spl.addEventListener('pointerdown',e=>{if(innerWidth<=700)return;dragging=true;spl.setPointerCapture(e.pointerId);document.body.style.userSelect='none';e.preventDefault()});
  spl.addEventListener('pointermove',e=>{if(!dragging)return;const rect=folders.getBoundingClientRect();w=e.clientX-rect.left;apply()});
  const end=()=>{if(!dragging)return;dragging=false;document.body.style.userSelect='';try{localStorage.setItem('wedone-todo-folder-w',String(w))}catch{}};
  spl.addEventListener('pointerup',end);spl.addEventListener('pointercancel',end);
  spl.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();w+=e.key==='ArrowRight'?20:-20;apply();try{localStorage.setItem('wedone-todo-folder-w',String(w))}catch{}}});
  window.addEventListener('resize',apply);
})();

// ── Utils ──
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

// ── Init ──
save();
renderFolders();
renderTasks();
})();
