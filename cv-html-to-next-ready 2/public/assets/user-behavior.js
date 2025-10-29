
/* ===== Acordeón solo en móvil ===== */
function setAccordionState(){
  const isDesktop = window.matchMedia("(min-width:1001px)").matches;
  document.querySelectorAll("details.xp-item").forEach(d => {
    if (isDesktop) d.setAttribute("open", "");
    else d.removeAttribute("open");
  });
}
document.addEventListener("click", (e) => {
  if (window.matchMedia("(min-width:1001px)").matches) {
    const sum = e.target.closest("details.xp-item > summary");
    if (sum) e.preventDefault();
  }
});
window.addEventListener("resize", setAccordionState);
window.addEventListener("DOMContentLoaded", setAccordionState);

/* ===== Utils fechas ===== */
const pad = n => String(n).padStart(2,'0');
const toYMD = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
function formatICSDate(d){
  return d.getFullYear() + pad(d.getMonth()+1) + pad(d.getDate()) +
         'T' + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
}
function formatGCalDate(d){ return formatICSDate(d); }

/* ===== Hábiles ===== */
function nextBusinessDayDate(base = new Date()){
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  do { d.setDate(d.getDate() + 1); } while (d.getDay() === 0 || d.getDay() === 6);
  return d;
}
function nextBusinessDayStr(base = new Date()){ return toYMD(nextBusinessDayDate(base)); }
function nextOrSameBusinessDayStr(dateObj){
  const d = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  if (d.getDay() === 6) d.setDate(d.getDate() + 2);
  if (d.getDay() === 0) d.setDate(d.getDate() + 1);
  return toYMD(d);
}

const agDate = document.getElementById('agDate');
function updateBusinessDateLimits(){
  const minStr = nextBusinessDayStr(new Date());
  agDate.min = minStr;
  agDate.removeAttribute('max');
  if (!agDate.value || agDate.value < minStr) agDate.value = minStr;
  else {
    const chosen = new Date(agDate.value + 'T00:00:00');
    if (chosen.getDay() === 0 || chosen.getDay() === 6) {
      const adj = nextOrSameBusinessDayStr(chosen);
      agDate.value = (adj < minStr) ? minStr : adj;
    }
  }
}
updateBusinessDateLimits();
setInterval(updateBusinessDateLimits, 60*1000);

/* ===== Selector de hora ===== */
const agTimeInput = document.getElementById('agTime');
const timeDropdown = document.getElementById('timeDropdown');
const timeField = document.getElementById('timeField');
function minutes(h, m){ return h*60 + m; }
function label(h, m){ return `${pad(h)}:${pad(m)}`; }
function generateSlots(dateStr){
  const slots = [];
  if(!dateStr) return slots;
  const d = new Date(dateStr + 'T00:00:00');
  const isThu = d.getDay() === 4; // jueves
  const blocks = [
    {from: minutes(9,0), to: minutes(13,0)},
    ...(isThu ? [] : [{from: minutes(14,0), to: minutes(18,0)}])
  ];
  for(const b of blocks){
    for(let m=b.from; m<=b.to; m+=30){
      const h = Math.floor(m/60), mm = m%60;
      slots.push(label(h, mm));
    }
  }
  return slots;
}
function renderTimeDropdown(){
  const date = agDate.value || nextBusinessDayStr();
  const options = generateSlots(date);
  timeDropdown.innerHTML = '';
  if(options.length === 0){
    timeDropdown.innerHTML = `<div class="time-empty">No hay horarios disponibles para la fecha seleccionada.</div>`;
    return;
  }
  options.forEach(t => {
    const div = document.createElement('div');
    div.className = 'time-option';
    div.textContent = t;
    div.addEventListener('click', ()=>{
      agTimeInput.value = t;
      closeTimeDropdown();
      buildAllLinks();
    });
    timeDropdown.appendChild(div);
  });
}
function openTimeDropdown(){
  if(!agDate.value) updateBusinessDateLimits();
  renderTimeDropdown();
  timeDropdown.classList.add('open');
  timeDropdown.setAttribute('aria-hidden','false');
}
function closeTimeDropdown(){
  timeDropdown.classList.remove('open');
  timeDropdown.setAttribute('aria-hidden','true');
}
agTimeInput.addEventListener('click', (e)=>{ e.stopPropagation(); openTimeDropdown(); });
agTimeInput.addEventListener('focus', ()=> openTimeDropdown());
document.addEventListener('click', (e)=>{ if(!timeField.contains(e.target)) closeTimeDropdown(); });
document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeTimeDropdown(); });

agDate.addEventListener('change', ()=>{
  const minStr = agDate.min || nextBusinessDayStr();
  let val = agDate.value || minStr;
  if (val < minStr) val = minStr;
  const d = new Date(val + 'T00:00:00');
  const adjusted = (d.getDay()===0 || d.getDay()===6) ? nextOrSameBusinessDayStr(d) : val;
  if (adjusted !== agDate.value) agDate.value = adjusted;
  if(timeDropdown.classList.contains('open')) renderTimeDropdown();
  if (!agTimeInput.value) {
    const opts = generateSlots(agDate.value);
    agTimeInput.value = opts[0] || '';
  }
  buildAllLinks();
});

/* ===== Enlaces de la agenda ===== */
function buildAllLinks(){
  const name = document.getElementById('agName').value.trim();
  const company = document.getElementById('agCompany').value.trim();
  const date = document.getElementById('agDate').value || nextBusinessDayStr();
  const time = document.getElementById('agTime').value;
  const duration = parseInt(document.getElementById('agDuration').value, 10) || 60;
  const mode = document.getElementById('agMode').value;
  const notes = document.getElementById('agNotes').value.trim();
  if(!date || !time){ return; }

  const start = new Date(date + 'T' + time);
  const end = new Date(start.getTime() + duration * 60000);

  const title = 'Entrevista con José Luis Acevedo';
  let details = 'Reunión de entrevista';
  if(name) details += ' — Contacto: ' + name;
  if(company) details += ' (' + company + ')';
  details += '. Modalidad: ' + mode + '.';
  if(notes) details += '\\n\\nNotas: ' + notes;

  // WhatsApp
  const human = start.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  const waMsg =
    `Hola José Luis, me gustaría agendar una entrevista el ${human} (${duration} min, ${mode}).` +
    (name ? `%0AContacto: ${encodeURIComponent(name)}` : '') +
    (company ? `%0AEmpresa: ${encodeURIComponent(company)}` : '') +
    (notes ? `%0ANotas: ${encodeURIComponent(notes)}` : '');
  document.getElementById('linkWhatsApp').href =
    'https://wa.me/56922008319?text=' + waMsg;

  // Email
  const subject = encodeURIComponent(title);
  const body =
    `Hola José Luis,%0A%0A` +
    `¿Podemos agendar el ${encodeURIComponent(human)} (${duration} min, ${encodeURIComponent(mode)})?%0A` +
    (name ? `Contacto: ${encodeURIComponent(name)}%0A` : '') +
    (company ? `Empresa: ${encodeURIComponent(company)}%0A` : '') +
    (notes ? `Notas: ${encodeURIComponent(notes)}%0A` : '') +
    `%0AGracias.`;
  document.getElementById('linkEmail').href =
    `mailto:a.joseluis.w@gmail.com?subject=${subject}&body=${body}`;

  // Google Calendar
  const gcDetails = encodeURIComponent(details);
  const gcDates = formatGCalDate(start) + '/' + formatGCalDate(end);
  document.getElementById('linkGCal').href =
    `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${gcDates}&details=${gcDetails}`;

  // ICS
  const uid = Date.now() + '@joseluisacevedo.site';
  const ics =
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-/JLAA/Agenda/ES
CALSCALE:GREGORIAN
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(start)}
DTEND:${formatICSDate(end)}
SUMMARY:${title}
DESCRIPTION:${details.replace(/\\n/g,'\\\\n')}
END:VEVENT
END:VCALENDAR`;
  const icsBlob = new Blob([ics], {type:'text/calendar'});
  document.getElementById('linkICS').href = URL.createObjectURL(icsBlob);
}

// CTA: abrir reservas Google en nueva pestaña
const modal = document.getElementById('agendaModal');
const openBtn = document.getElementById('btnAgenda');
const closeBtn = document.getElementById('closeBtn');
const closeX = document.getElementById('closeAgenda');
const BOOKING_URL = 'https://calendar.app.google/SCCEWz7QwmmgxLsB7';

function openModal(e){
  if(e) e.preventDefault();
  window.open(BOOKING_URL, '_blank', 'noopener');
}
function closeModal(){
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  const timeDropdown = document.getElementById('timeDropdown');
  if (timeDropdown) timeDropdown.classList.remove('open');
}
if(openBtn){ openBtn.addEventListener('click', openModal); }
if(closeBtn){ closeBtn.addEventListener('click', closeModal); }
if(closeX){ closeX.addEventListener('click', closeModal); }
modal.addEventListener('click', (e)=>{ if(e.target === modal) closeModal(); });

['agName','agCompany','agDate','agTime','agDuration','agMode','agNotes'].forEach(id=>{
  const el = document.getElementById(id);
  if (el){
    el.addEventListener('input', buildAllLinks);
    el.addEventListener('change', buildAllLinks);
  }
});
