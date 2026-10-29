/* Deterministic regression checks for Wedone V4.0. Run: node tests/logic-tests.js */
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = require('node:path').resolve(__dirname, '..');
const calendarSource = fs.readFileSync(`${root}/Wedone-Calendar/script.js`, 'utf8');
const todoSource = fs.readFileSync(`${root}/Wedone-To-Do-List/script.js`, 'utf8');
function sliceBetween(source, start, end) {
  const a = source.indexOf(start), b = source.indexOf(end, a);
  assert.ok(a >= 0 && b > a, `Could not locate ${start}`);
  return source.slice(a, b);
}
const calendarHelpers = `
const pad=n=>String(n).padStart(2,'0');
const iso=d=>String(d.getFullYear()).padStart(4,'0')+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const parseDate=s=>{if(typeof s!=='string'||!/^\\d{4}-\\d{2}-\\d{2}$/.test(s))return null;const [y,m,d]=s.split('-').map(Number);const x=new Date(y,m-1,d,12);return x.getFullYear()===y&&x.getMonth()===m-1&&x.getDate()===d?x:null};
const addDays=(d,n)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()+n,12);
const state={events:[]};`;
const calendarCode = calendarHelpers +
  sliceBetween(calendarSource, 'function validEvent(e){', 'function save()') +
  sliceBetween(calendarSource, 'function eventStart(e,date=e.startDate){', 'function occurrenceEvents(from,to){') +
  sliceBetween(calendarSource, 'function occurrenceEvents(from,to){', 'function readTasks()') +
  `globalThis.api={validEvent,eventStart,occurrenceEvents,state,parseDate};`;
const calendarContext = vm.createContext({ Date, Math, Set });
vm.runInContext(calendarCode, calendarContext);
const c = calendarContext.api;
const event = {id:'evt-1',title:'Test',startDate:'2026-10-28',endDate:'2026-10-30',allDay:true,startTime:'',endTime:'',category:'Personnel',color:'blue',location:'',description:'',reminder:0,recurrence:'none',recurrenceEnd:''};
assert.equal(c.validEvent(event), true, 'valid calendar event accepted');
assert.equal(c.validEvent({...event,color:'blue\"><img src=x onerror=alert(1)>'}), false, 'malicious color rejected');
assert.equal(c.validEvent({...event,startDate:'2026-02-31'}), false, 'invalid calendar date rejected');
assert.equal(c.validEvent({...event,title:'x'.repeat(161)}), false, 'oversized calendar title rejected');
assert.equal(c.eventStart(event,'2026-10-28').getHours(),9,'all-day reminders use a sensible 09:00 local time');
assert.equal(c.eventStart({...event,allDay:false,startTime:'14:30'},'2026-10-28').getHours(),14,'timed event keeps its local start hour');
c.state.events=[event];
let occurrences=c.occurrenceEvents(c.parseDate('2026-10-29'),c.parseDate('2026-11-01'));
assert.equal(occurrences.length,1); assert.equal(occurrences[0]._occEnd,'2026-10-30','multi-day event overlap retained');
c.state.events=[{...event,id:'monthly',startDate:'2026-01-31',endDate:'2026-01-31',recurrence:'monthly'}];
occurrences=c.occurrenceEvents(c.parseDate('2026-02-01'),c.parseDate('2026-03-31'));
assert.equal(JSON.stringify(occurrences.map(x=>x._occDate)),JSON.stringify(['2026-02-28','2026-03-31']),'monthly recurrence remains anchored to original day');
c.state.events=[{...event,id:'daily',startDate:'2010-01-01',endDate:'2010-01-01',recurrence:'daily'}];
occurrences=c.occurrenceEvents(c.parseDate('2026-10-29'),c.parseDate('2026-11-01'));
assert.ok(occurrences.some(x=>x._occDate==='2026-10-29'),'old daily recurrence finds the requested range');
const todoFunctions = sliceBetween(todoSource,'function validTodoDate(value){','function normalizeTodoImport(value)') + `globalThis.validate=validateTodoImport;`;
const todoContext=vm.createContext({Date,Set,Math});
vm.runInContext(todoFunctions+`globalThis.validDate=validTodoDate;`,todoContext);
const validTodo={folders:[{id:'folder-1',name:'Perso',tasks:[{id:'task-1',name:'Acheter du pain',done:false,priority:'normal',due:'2026-10-30',dueTime:'09:30',subtasks:[]}]}],selectedFolder:'folder-1'};
assert.equal(todoContext.validate(validTodo),true,'valid To Do export accepted');
assert.equal(todoContext.validate({...validTodo,folders:[{...validTodo.folders[0],tasks:[{...validTodo.folders[0].tasks[0],priority:'<img>'}]}]}),false,'unsafe task priority rejected');
assert.equal(todoContext.validate({...validTodo,folders:[{...validTodo.folders[0],tasks:[{...validTodo.folders[0].tasks[0],due:'2026-02-31'}]}]}),false,'invalid task date rejected');
assert.equal(todoContext.validate({...validTodo,folders:[{...validTodo.folders[0],id:'bad" onclick="alert(1)'}]}),false,'unsafe folder id rejected');
console.log('PASS Calendar event validation, malicious values and date bounds');
console.log('PASS all-day reminders default to 09:00; timed reminders preserve event time');
console.log('PASS Calendar multi-day overlap and month-end recurrence');
console.log('PASS long-running recurring series range lookup');
console.log('PASS To Do import schema, unsafe priority/id and invalid dates');
const portalSource=fs.readFileSync(`${root}/script.js`,'utf8');
const backupHelpers=sliceBetween(portalSource,' const safeId=', ' function downloadBackup()')+`globalThis.backupApi={normalizeValue};`;
const backupContext=vm.createContext({Date,Set,Math,URL});vm.runInContext(backupHelpers,backupContext);
const norm=backupContext.backupApi.normalizeValue;
assert.equal(norm('wedone-global-theme','dark'),'dark','legacy theme key validated');
assert.equal(norm('wedone-notepad-last-text-color','#123abc'),'#123abc','raw color preference validated');
assert.equal(norm('wedone-notepad-last-text-color','red;position:fixed'),null,'unsafe color preference rejected');
assert.notEqual(norm('wedone-calendar-events-v1',JSON.stringify({version:1,events:[{...event}]})),null,'calendar local-storage payload accepted');
assert.notEqual(norm('wedone-todolist-v4',JSON.stringify(validTodo)),null,'To Do local-storage payload accepted');
assert.notEqual(norm('wedoneNotepadNotes',JSON.stringify([{id:'note-1',title:'Note',content:'<p>Bonjour</p>',updated:1}])),null,'Notepad payload accepted');
assert.notEqual(norm('wedone-qr-history-v2',JSON.stringify(['https://example.com'])),null,'QR history accepted');
assert.notEqual(norm('wedone-settings-v2',JSON.stringify({theme:'auto'})),null,'shared theme settings accepted');
assert.equal(norm('wedone-qr-history-limit','15'),null,'invalid QR history limit rejected');
console.log('PASS suite backup validators for theme, colors, Calendar, To Do, Notepad and QR Code');
