// =========================================================================
// CONTACTS.JS - ระบบฐานข้อมูลรายชื่อ (BUZZ GUIDE CRM V11.2 - CLEAN ARCHITECTURE)
// =========================================================================

// -----------------------------------------
// 1. CONFIG & STATE
// -----------------------------------------

let contactsData = [];
let autoSaveTimers = {}; 
let currentSortCol = 'appt'; 
let currentSortDir = 'asc';   
let currentPage = 1; 
let itemsPerPage = 20; 
let currentDashboardFilter = 'all'; 

let currentExpandedId = null; 
let currentEditingId = null;

const statusOptions = [ "ลิสต์รายชื่อ", "กำลังติดต่อ", "นัดหมายแล้ว", "นำเสนอแล้ว", "ติดตามผล", "ซื้อสินค้า/สมัครแล้ว", "ปฏิเสธ" ];
const skillList = ["1. สาธิตสินค้า", "2. เขียนโมเดลธุรกิจ", "3. ผ่าแผนการตลาด", "4. ตอบข้อโต้แย้ง", "5. พูดความสวยงาม", "6. ติดตาม DL+จัด HM", "7. วิเคราะห์+เป้าหมาย", "8. ผ่าแผน 6%, 1%", "9. ถ่ายทอดได้"];
const standardProducts = ['Breakfast Set', 'eSpring', 'Atmosphere Sky', 'Atmosphere Drive', 'Spa', '6WNY / Detox', 'Workshop'];
const defaultNote = `Profile:\n- ชื่อเล่น: \n- อายุ: \n- จบจาก: \n- แต่งงาน มีลูก: \n- จุดที่น่าจะเปิดใจ/Pain Point: \n- รู้จัก AW ไหม: `;

// 🌟 ฝัง CSS สำหรับ Progress Bar 10 ช่อง (UI แบบใหม่ - แก้ไข Bug ไม่โชว์ Tooltip)
if (!document.getElementById('score-blocks-style')) {
    document.head.insertAdjacentHTML('beforeend', `
    <style id="score-blocks-style">
        .score-ui-container { display: flex; align-items: center; gap: 8px; width: 100%; justify-content: flex-end; }
        .score-blocks-group { display: flex; gap: 3px; position: relative; }
        .score-block-wrapper { position: relative; cursor: pointer; display: flex; flex-direction: column; align-items: center; }
        .score-block { width: 14px; height: 14px; border-radius: 3px; background-color: var(--border-color); transition: all 0.2s ease; }
        .score-block.filled { background-color: var(--primary); }
        
        /* Tooltip ที่โผล่ขึ้นมาตอน Hover */
        .score-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%) translateY(-5px); background: var(--primary); color: white; font-size: 0.75rem; padding: 3px 8px; border-radius: 4px; opacity: 0; visibility: hidden; transition: 0.2s; pointer-events: none; font-weight: bold; z-index: 100; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
        .score-tooltip::after { content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%); border-width: 4px; border-style: solid; border-color: var(--primary) transparent transparent transparent; }
        
        /* สามเหลี่ยมชี้เป้าใต้ช่องที่ 5 */
        .score-mid-marker { position: absolute; top: 100%; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-bottom: 5px solid var(--text-muted); margin-top: 3px; }
        
        /* 🌟 แก้ไข CSS Selectors ตรงนี้: ให้ชี้ไปที่ .is-editing ของตาราง (tr) ที่ถูกต้อง */
        .is-editing .score-blocks-group { pointer-events: auto; opacity: 1; filter: none; }
        .is-editing .score-block-wrapper:hover .score-block { transform: scale(1.15); box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
        .is-editing .score-block-wrapper:hover .score-tooltip { opacity: 1; transform: translateX(-50%) translateY(-8px); visibility: visible; }
        
        /* โหมด Readonly (ตอนปิดลิ้นชัก หรือยังไม่ได้กดแก้ไข) */
        tr:not(.is-editing) .score-blocks-group { pointer-events: none; opacity: 0.7; filter: grayscale(0.5); }
    </style>`);
}

// 🌟 ฟังก์ชันวาด UI Progress Bar 10 ช่อง
window.getScoreSliderHTML = function(value, idAttr, displayId, className, onchangeFn) {
    const val = parseInt(value) || 5; 
    let blocksHTML = '';
    
    // สร้างกล่อง 10 กล่อง
    for(let i=1; i<=10; i++) {
        let fillClass = i <= val ? 'filled' : '';
        let marker = i === 5 ? `<div class="score-mid-marker"></div>` : '';
        blocksHTML += `
            <div class="score-block-wrapper" 
                onclick="setScoreValue('${idAttr}', ${i}, '${displayId}', \`${onchangeFn}\`)" 
                onmouseover="hoverScoreValue('${idAttr}', ${i})" 
                onmouseout="resetScoreValue('${idAttr}')">
                <div class="score-block ${fillClass}" id="block_${idAttr}_${i}"></div>
                ${marker}
                <div class="score-tooltip">${i}</div>
            </div>
        `;
    }
    
    return `
        <div class="score-ui-container">
            <input type="hidden" id="${idAttr}" class="${className}" value="${val}">
            <div class="score-blocks-group">
                ${blocksHTML}
            </div>
            <span id="${displayId}" style="font-weight: 700; color: var(--primary); width: 22px; text-align: right; font-size: 1rem;">${val}</span>
        </div>
    `;
};

// 🌟 ฟังก์ชันสำหรับ Hover (โชว์สีชั่วคราว)
window.hoverScoreValue = function(idAttr, hoverVal) {
    for(let i=1; i<=10; i++) {
        let block = document.getElementById(`block_${idAttr}_${i}`);
        if(block) {
            if(i <= hoverVal) {
                block.style.backgroundColor = 'var(--primary)';
                block.style.opacity = '0.5'; // สีจางๆ ตอน Hover preview
            } else {
                block.style.backgroundColor = 'var(--border-color)';
                block.style.opacity = '1';
            }
        }
    }
};

// 🌟 ฟังก์ชันสำหรับรีเซ็ตสีกลับเป็นค่าที่เลือกไว้ตอนเอาเมาส์ออก
window.resetScoreValue = function(idAttr) {
    let hiddenInput = document.getElementById(idAttr);
    if(!hiddenInput) return;
    let actualVal = parseInt(hiddenInput.value);
    for(let i=1; i<=10; i++) {
        let block = document.getElementById(`block_${idAttr}_${i}`);
        if(block) {
            if(i <= actualVal) {
                block.style.backgroundColor = 'var(--primary)';
            } else {
                block.style.backgroundColor = 'var(--border-color)';
            }
            block.style.opacity = '1';
            block.style.transform = ''; // เคลียร์ Scale
        }
    }
};

// 🌟 ฟังก์ชันเมื่อคลิกเลือกคะแนน
window.setScoreValue = function(idAttr, val, displayId, onchangeStr) {
    let hiddenInput = document.getElementById(idAttr);
    if(!hiddenInput) return;
    
    hiddenInput.value = val; // อัปเดตค่าใน Input ตัวซ่อน
    document.getElementById(displayId).innerText = val; // เปลี่ยนตัวเลขโชว์
    window.resetScoreValue(idAttr); // วาดสีใหม่ให้เต็ม
    
    // สั่งรันฟังก์ชัน Auto Save ทันที
    if(onchangeStr) {
        new Function(onchangeStr)();
    }
};

window.onload = () => { 
    fetchContacts(); 
    const savedTheme = localStorage.getItem('buzzGuideTheme') || 'pikachu';
    if(typeof setTheme === 'function') setTheme(savedTheme);
};

// -----------------------------------------
// 2. HELPER FUNCTIONS
// -----------------------------------------
function formatDateShort(dateStr) { 
    if (!dateStr) return '-'; 
    const d = new Date(dateStr); if (isNaN(d)) return dateStr; 
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = (d.getFullYear() + 543).toString().slice(-2);
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yy} ${hh}:${min}`; 
}

function calculateAge(dobStr) { 
    if(!dobStr) return ''; 
    const dob = new Date(dobStr); if(isNaN(dob)) return ''; 
    const age_dt = new Date(Date.now() - dob.getTime()); 
    return Math.abs(age_dt.getUTCFullYear() - 1970); 
}

function calculateScore(person, mode) { 
    let m = parseInt(person.Score_Money || 5); 
    let r = parseInt(person.Score_Relation || 5); 
    let score = 0; 
    if (mode === 'FARM') { 
        let f = parseInt(person.Score_Friendly || 5); 
        let a = parseInt(person.Score_Active || 5); 
        score = (f + a + r + m) / 4; 
    } else { 
        let au = parseInt(person.Score_Authority || 5); 
        let n = parseInt(person.Score_Need || 5); 
        score = (m + au + r + n) / 4; 
    } 
    return Math.floor(score * 10) / 10; // คืนค่าทศนิยม 1 ตำแหน่ง (เต็ม 10)
}

function toLocalDatetimeInput(dateStr) { 
    if (!dateStr) return ''; 
    const d = new Date(dateStr); 
    if (isNaN(d)) return dateStr.substring(0,16); 
    const yy = d.getFullYear(); 
    const mm = String(d.getMonth() + 1).padStart(2, '0'); 
    const dd = String(d.getDate()).padStart(2, '0'); 
    const hh = String(d.getHours()).padStart(2, '0'); 
    const min = String(d.getMinutes()).padStart(2, '0'); 
    return `${yy}-${mm}-${dd}T${hh}:${min}`; 
}

function getTypeColorClass(type) { 
    const map = { 'Memory Jogger': 'badge-yellow', 'Sponsor List': 'badge-orange', 'Customer List': 'badge-green', 'ABO': 'badge-red', 'MEM': 'badge-blue', 'Upline': 'badge-gray', 'Sideline': 'badge-gray' }; 
    return map[type] || 'badge-gray'; 
}

function getStatusColorClass(status) { 
    const map = { 'ลิสต์รายชื่อ': 'badge-gray', 'กำลังติดต่อ': 'badge-sky', 'นัดหมายแล้ว': 'badge-yellow', 'นำเสนอแล้ว': 'badge-blue', 'ติดตามผล': 'badge-pink', 'ซื้อสินค้า/สมัครแล้ว': 'badge-green', 'ปฏิเสธ': 'badge-red' }; 
    return map[status] || 'badge-gray'; 
}

function generateTypeDropdownHTML(val, id) { 
    let opts = ''; 
    ['Memory Jogger', 'Sponsor List', 'Customer List', 'ABO', 'MEM', 'Upline', 'Sideline'].forEach(o => opts += `<option value="${o}" ${val===o?'selected':''}>${o}</option>`); 
    return `<select class="colored-select ${getTypeColorClass(val)}" onchange="updateSelectColor(this, 'type', '${id}'); event.stopPropagation();">${opts}</select>`; 
}

function generateStatusDropdownHTML(val, id) { 
    let opts = '<option value="">-- สถานะ --</option>'; 
    statusOptions.forEach(o => opts += `<option value="${o}" ${val===o?'selected':''}>${o}</option>`); 
    return `<select class="colored-select ${getStatusColorClass(val)}" onchange="updateSelectColor(this, 'status', '${id}'); event.stopPropagation();">${opts}</select>`; 
}

function morphBtn(btn, newText, newClass, newColor, newBorder) {
    btn.style.transform = 'scale(0.7)';
    btn.style.opacity = '0.3';
    setTimeout(() => {
        btn.innerHTML = newText; btn.className = newClass;
        if(newColor) btn.style.color = newColor; if(newBorder) btn.style.borderColor = newBorder;
        btn.style.display = 'inline-flex'; btn.style.transform = 'scale(1)'; btn.style.opacity = '1';
    }, 150);
}

// -----------------------------------------
// 3. DASHBOARD & DATA FETCHING
// -----------------------------------------
function updateDashboard() {
    if (!contactsData) return;
    document.getElementById('summary-total').innerText = contactsData.length;
    const today = new Date(); today.setHours(0,0,0,0);
    document.getElementById('summary-appts').innerText = contactsData.filter(c => c.Next_Appt_Date && new Date(c.Next_Appt_Date) >= today).length;
    document.getElementById('summary-success').innerText = contactsData.filter(c => c.Current_Status === 'ซื้อสินค้า/สมัครแล้ว').length;
    
    const cards = document.querySelectorAll('.summary-card');
    if (cards.length >= 3) {
        cards.forEach(c => { c.classList.remove('active-filter'); });
        if (currentDashboardFilter === 'all') cards[0].classList.add('active-filter');
        if (currentDashboardFilter === 'appts') cards[1].classList.add('active-filter');
        if (currentDashboardFilter === 'success') cards[2].classList.add('active-filter');
    }
}

async function fetchContacts() { 
    const tbody = document.getElementById('contactsTableBody'); 
    const cachedData = localStorage.getItem('buzzGuideContacts'); 
    if (cachedData) { try { contactsData = JSON.parse(cachedData); renderTable(); updateDashboard(); } catch(e) {} } 
    else if(tbody) tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding: 3rem; color: var(--primary);">กำลังซิงค์ข้อมูล... ⏳</td></tr>`; 
    
    try { 
        const response = await fetch(`${API_URL}?sheet=Contacts_Master`); 
        const result = await response.json(); 
        if (result.status === "success") { 
            contactsData = result.data; localStorage.setItem('buzzGuideContacts', JSON.stringify(contactsData)); 
            renderTable(); updateDashboard();
        } 
    } catch (error) { 
        if (!cachedData && tbody) tbody.innerHTML = `<tr><td colspan="10" style="color:var(--danger); text-align:center; padding:3rem;"><b>⚠️ เกิดข้อผิดพลาดในการเชื่อมต่อ (Offline)</b></td></tr>`; 
    } 
}

// -----------------------------------------
// 4. UI INTERACTIONS 
// -----------------------------------------
function resetPageAndRender() { currentPage = 1; renderTable(); }
function changePage(step) { currentPage += step; renderTable(); }
function changeItemsPerPage(val) { itemsPerPage = parseInt(val); currentPage = 1; renderTable(); }
function goToPage(page) { currentPage = page; renderTable(); }

function setDashboardFilter(filterType) {
    currentDashboardFilter = (currentDashboardFilter === filterType) ? 'all' : filterType; 
    currentPage = 1; updateDashboard(); renderTable(); 
}
function setSort(col, dir) { currentSortCol = col; currentSortDir = dir; resetPageAndRender(); }

function switchView(viewId) {
    document.querySelectorAll('.app-view').forEach(view => view.classList.remove('active-view'));
    const tv = document.getElementById(`${viewId}-view`); if(tv) tv.classList.add('active-view');
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(nav => nav.classList.remove('active'));
    const tnv = document.getElementById(`nav-${viewId}`); if(tnv) tnv.classList.add('active');
    const titleMap = { 'contacts': 'รายชื่อผู้มุ่งหวัง', 'settings': 'ตั้งค่าระบบ', 'guide': 'คู่มือทำรายชื่อ' };
    const tt = document.querySelector('.topbar-title'); if(tt) tt.innerText = titleMap[viewId] || '';
    if(window.innerWidth <= 768) { const sb = document.getElementById('sidebar'); if(sb) sb.classList.remove('open'); }
}

// -----------------------------------------
// 5. CORE RENDERING (V11.5)
// -----------------------------------------
function renderTable() {
    const tbody = document.getElementById('contactsTableBody'); 
    if(!tbody) return; 
    tbody.innerHTML = '';
    
    if (!contactsData || contactsData.length === 0) { 
        tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding: 3rem; color: var(--text-muted);">ยังไม่มีรายชื่อในระบบ</td></tr>`; 
        return; 
    }

    const searchText = ((document.getElementById('searchInput')?.value || '') || (document.getElementById('searchInputMobile')?.value || '')).toLowerCase();
    const scoreMode = document.getElementById('scoreModeSel')?.value || 'FARM';
    const checkedTypes = Array.from(document.querySelectorAll('.cb-type:checked')).map(cb => cb.value); 
    const checkedStatuses = Array.from(document.querySelectorAll('.cb-status:checked')).map(cb => cb.value); 
    const filterAppt = document.querySelector('input[name="rad-appt"]:checked')?.value || 'all';
    const filterScore = document.querySelector('input[name="rad-score"]:checked')?.value || 'all';
    
    const parseLocal = (dStr) => { if(!dStr) return null; const [y, m, d] = dStr.split('-'); return new Date(y, m-1, d).getTime(); };
    const sAppt = parseLocal(document.getElementById('filterApptStart')?.value);
    const eAppt = parseLocal(document.getElementById('filterApptEnd')?.value);
    const sUpd = parseLocal(document.getElementById('filterUpdateStart')?.value);
    const eUpd = parseLocal(document.getElementById('filterUpdateEnd')?.value);
    const today = new Date(); today.setHours(0,0,0,0);

    let displayData = contactsData.filter(row => {
        if(!row.PersonID) return false;
        if (currentDashboardFilter === 'appts' && (!row.Next_Appt_Date || new Date(row.Next_Appt_Date) < today)) return false;
        if (currentDashboardFilter === 'success' && row.Current_Status !== 'ซื้อสินค้า/สมัครแล้ว') return false;
        
        const nameMatch = (row.Name || '').toLowerCase().includes(searchText) || (row.Phone || '').includes(searchText) || (row.Next_Appt_Topic || '').toLowerCase().includes(searchText);
        const typeMatch = checkedTypes.length === 0 || checkedTypes.includes(row.Contact_Type);
        const statusMatch = checkedStatuses.includes(row.Current_Status) || (checkedStatuses.length === 0 && row.Current_Status === '');
        
        let apptMatch = true;
        if (sAppt || eAppt) {
            if (!row.Next_Appt_Date) { apptMatch = false; }
            else {
                const rowD = new Date(row.Next_Appt_Date); rowD.setHours(0,0,0,0); const rTime = rowD.getTime();
                if (sAppt && rTime < sAppt) apptMatch = false;
                if (eAppt && rTime > eAppt) apptMatch = false;
            }
        } else if (filterAppt !== 'all') {
            if (!row.Next_Appt_Date) { apptMatch = false; }
            else {
                const apptDate = new Date(row.Next_Appt_Date); apptDate.setHours(0,0,0,0);
                const diffDays = Math.ceil((apptDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                if (filterAppt === 'overdue' && diffDays >= 0) apptMatch = false;
                if (filterAppt === 'today' && (diffDays < 0 || diffDays > 2)) apptMatch = false;
                if (filterAppt === 'upcoming' && (diffDays < 0 || diffDays > 7)) apptMatch = false;
            }
        }

        let updateMatch = true;
        if (sUpd || eUpd) {
            if (!row.Last_Update) { updateMatch = false; }
            else {
                const rowU = new Date(row.Last_Update); rowU.setHours(0,0,0,0); const uTime = rowU.getTime();
                if (sUpd && uTime < sUpd) updateMatch = false;
                if (eUpd && uTime > eUpd) updateMatch = false;
            }
        }

        let scoreMatch = true;
        if (filterScore !== 'all') {
            const currentScore = calculateScore(row, scoreMode);
            // 🌟 อัปเดตตรรกะการกรองให้เป็นแบบ 10 คะแนน
            if (filterScore === '8' && currentScore < 8) scoreMatch = false;
            if (filterScore === '5' && currentScore < 5) scoreMatch = false;
            if (filterScore === 'low' && currentScore >= 5) scoreMatch = false;
        }

        return nameMatch && typeMatch && statusMatch && apptMatch && updateMatch && scoreMatch;
    });

    displayData.sort((a, b) => {
        if (currentSortCol === 'score') return currentSortDir === 'asc' ? calculateScore(a, scoreMode) - calculateScore(b, scoreMode) : calculateScore(b, scoreMode) - calculateScore(a, scoreMode);
        else if (currentSortCol === 'appt') { 
            const dA = a.Next_Appt_Date ? new Date(a.Next_Appt_Date).getTime() : 0; 
            const dB = b.Next_Appt_Date ? new Date(b.Next_Appt_Date).getTime() : 0; 
            if(dA===0 && dB!==0) return 1; if(dA!==0 && dB===0) return -1; 
            return currentSortDir === 'asc' ? dA - dB : dB - dA; 
        } else { 
            const dA = a.Last_Update ? new Date(a.Last_Update).getTime() : 0; 
            const dB = b.Last_Update ? new Date(b.Last_Update).getTime() : 0; 
            return currentSortDir === 'asc' ? dA - dB : dB - dA; 
        }
    });

    const totalItems = displayData.length; 
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages; 
    if (currentPage < 1) currentPage = 1;
    const startIndex = (currentPage - 1) * itemsPerPage; 
    const pageData = displayData.slice(startIndex, startIndex + itemsPerPage);

    pageData.forEach((row, index) => {
        let displayAge = row.Age || ''; if (row.DOB) displayAge = calculateAge(row.DOB) || displayAge;
        let ageOptions = '<option value="">-</option>'; for(let i=15; i<=80; i++) ageOptions += `<option value="${i}" ${row.Age == i ? 'selected':''}>${i}</option>`;
        
        let apptClass = '';
        if (row.Next_Appt_Date) {
            const apptDate = new Date(row.Next_Appt_Date); apptDate.setHours(0,0,0,0);
            const diffDays = Math.ceil((apptDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays < 0) apptClass = 'row-overdue'; 
            else if (diffDays >= 0 && diffDays <= 2) apptClass = 'row-today'; 
        }
        
        const trMain = document.createElement('tr'); 
        trMain.id = `row-${row.PersonID}`; trMain.className = `main-row ${apptClass}`; 
        trMain.onclick = (e) => { if (!['SELECT','BUTTON','INPUT'].includes(e.target.tagName)) toggleExpandRow(row.PersonID); };

        trMain.innerHTML = `
            <td style="text-align:center; color:var(--text-muted);">${startIndex + index + 1}</td>
            <td class="col-name-cell">
                <div class="profile-cell" style="display:flex; align-items:center; gap:12px;">
                    <div class="avatar-circle">${(row.Name||'?').charAt(0).toUpperCase()}</div>
                    <div class="profile-info" style="display:flex; flex-direction:column;">
                        <span id="view-name-${row.PersonID}" class="profile-name" style="font-weight:600; color:var(--text-main);">${row.Name || 'ไม่ระบุชื่อ'}</span>
                        <span id="view-phone-${row.PersonID}" class="profile-sub" style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">📞 ${row.Phone || '-'}</span>
                    </div>
                </div>
            </td>
            <td class="col-age" style="text-align:center;">${displayAge ? displayAge + ' ปี' : '-'}</td>
            <td><div class="desktop-only">${generateTypeDropdownHTML(row.Contact_Type, row.PersonID)}</div></td>
            <td>
                <div style="display:flex; flex-direction:column; gap:4px;">
                    <input type="datetime-local" style="border:none; background:transparent; color:var(--primary); font-weight:600; cursor:pointer;" value="${toLocalDatetimeInput(row.Next_Appt_Date)}" onchange="triggerAutoSave('${row.PersonID}')">
                    <div class="mobile-only" style="color:var(--text-muted); font-size:0.75rem;">${row.Next_Appt_Topic ? 'เรื่อง: '+row.Next_Appt_Topic : ''}</div>
                </div>
            </td>
            <td class="desktop-only"><div style="color:var(--text-muted); max-width:140px; overflow:hidden; text-overflow:ellipsis;">${row.Next_Appt_Topic || '-'}</div></td>
            <td id="view-score-${row.PersonID}" class="col-score" style="text-align:center; font-weight:600; color:var(--primary);">🎯 ${calculateScore(row, scoreMode).toFixed(1)}</td>
            <td><div class="desktop-only">${generateStatusDropdownHTML(row.Current_Status, row.PersonID)}</div></td>
            <td class="col-update" style="font-size:0.75rem; color:var(--text-muted);">${formatDateShort(row.Last_Update)}</td>
            <td style="text-align:center;">
                <div class="action-menu-container">
                    <button id="status-btn-${row.PersonID}" class="btn-icon-dots view-mode" style="width:32px; height:32px; display:inline-flex; align-items:center; justify-content:center; padding:0; margin:0 auto;" onclick="toggleActionMenu('${row.PersonID}'); event.stopPropagation();">⋮</button>
                    <div class="action-menu-dropdown view-mode" id="action-menu-${row.PersonID}">
                        <button onclick="clickLeftBtn('${row.PersonID}'); event.stopPropagation();">✏️ แก้ไขข้อมูล</button>
                        <button style="color:var(--danger);" onclick="clickRightBtn('${row.PersonID}'); event.stopPropagation();">🗑️ ลบรายชื่อ</button>
                    </div>
                </div>
            </td>
        `;
        tbody.appendChild(trMain);

        const pMap = {}; (row.Products_Status||'').split(',').forEach(p => { const pT = p.split(':'); if(pT[0].trim()) pMap[pT[0].trim()] = pT[1] ? pT[1].trim() : 'none'; });
        standardProducts.forEach(sp => { if(!pMap[sp]) pMap[sp] = 'none'; });
        let edProducts = '';
        Object.keys(pMap).forEach(item => {
            const st = pMap[item]; let cls = 'skill-tag'; let ic = item;
            if(st === 'interested') { cls += ' status-yes'; ic = '🟡 ' + item; } else if(st === 'used') { cls += ' status-teach'; ic = '✅ ' + item; }
            edProducts += `<button type="button" class="${cls}" data-value="${item}" data-status="${st}" onclick="toggleModalProduct(this, '${row.PersonID}', event)"><span>${ic}</span> <span class="tag-remove" onclick="removeTag(this, '${row.PersonID}', event)">✕</span></button>`;
        });

        let skData = {}; try { skData = JSON.parse(row.Personal_Skill || "{}"); } catch(e){}
        let allSk = [...skillList]; Object.keys(skData).forEach(k => { if(!allSk.includes(k)) allSk.push(k); });
        let edSkills = '';
        allSk.forEach(sk => {
            const val = skData[sk] || 'no'; let cls = 'skill-tag'; let ic = sk;
            if(val === 'yes') { cls += ' status-yes'; ic = '🟡 ' + sk; } else if(val === 'teach') { cls += ' status-teach'; ic = '✅ ' + sk; }
            edSkills += `<button type="button" class="${cls}" data-skill="${sk}" data-val="${val}" onclick="toggleModalSkill(this, '${row.PersonID}', event)"><span>${ic}</span> <span class="tag-remove" onclick="removeTag(this, '${row.PersonID}', event)">✕</span></button>`;
        });

        const trDrawer = document.createElement('tr'); 
        trDrawer.id = `drawer-${row.PersonID}`; 
        trDrawer.className = 'expanded-row';
        
        trDrawer.innerHTML = `
            <td colspan="10" style="padding: 0; border: none;">
                <div class="drawer-container crm-drawer">
                    <div class="drawer-header-actions">
                        <div class="drawer-title" style="font-weight:700; color:var(--primary);">📄 รายละเอียดเคส (Profile)</div>
                        <div style="display:flex; gap:8px;">
                            <button class="btn btn-outline" id="btn-left-${row.PersonID}" onclick="clickLeftBtn('${row.PersonID}')">✏️ แก้ไข</button>
                            <button class="btn btn-outline" id="btn-right-${row.PersonID}" style="color:var(--danger); border-color:#FCA5A5;" onclick="clickRightBtn('${row.PersonID}')">🗑️ ลบ</button>
                        </div>
                    </div>
                    <div class="crm-grid">
                        <div class="crm-box box-info">
                            <div class="crm-section-title">👤 ข้อมูลพื้นฐาน</div>
                            <div class="seamless-row"><span class="seamless-label">ชื่อเต็ม:</span> <input type="text" class="seamless-input ex-name" value="${row.Name || ''}" oninput="triggerAutoSave('${row.PersonID}')"></div>
                            <div class="seamless-row"><span class="seamless-label">เบอร์โทร:</span> <input type="text" class="seamless-input ex-phone" value="${row.Phone || ''}" oninput="triggerAutoSave('${row.PersonID}')"></div>
                            <div class="seamless-row"><span class="seamless-label">สายสัมพันธ์:</span> <input type="text" class="seamless-input ex-rel" value="${row.Relation_Jogger || ''}" oninput="triggerAutoSave('${row.PersonID}')"></div>
                            <div class="seamless-row"><span class="seamless-label">อายุ:</span> <select class="seamless-input ex-age" onchange="triggerAutoSave('${row.PersonID}')">${ageOptions}</select></div>
                        </div>
                        <div class="crm-box box-system">
                            <div class="crm-section-title">📋 ข้อมูลระบบ</div>
                            <div class="seamless-row"><span class="seamless-label">รหัสสมาชิก:</span> <input type="text" class="seamless-input ex-abo" value="${row.ABO_Number || ''}" oninput="triggerAutoSave('${row.PersonID}')"></div>
                            <div class="seamless-row"><span class="seamless-label">วันเกิด:</span> <input type="date" class="seamless-input ex-dob" value="${row.DOB ? row.DOB.substring(0,10) : ''}" oninput="triggerAutoSave('${row.PersonID}')"></div>
                            <div class="seamless-row"><span class="seamless-label">หมดอายุ:</span> <input type="date" class="seamless-input ex-expire" value="${row.Expire_Date ? row.Expire_Date.substring(0,10) : ''}" oninput="triggerAutoSave('${row.PersonID}')"></div>
                        </div>
                        <div class="crm-box box-product">
                            <div class="crm-section-title" style="position: relative;">🛒 สินค้า <span class="hint-icon" onclick="toggleHint(event, 'hint-prod-${row.PersonID}')">💡</span><div class="hint-popup" id="hint-prod-${row.PersonID}"><div style="display:flex; gap:8px; flex-wrap:wrap; line-height:1.4;"><span><span class="hint-dot gray"></span>ยังไม่เสนอ</span> | <span>🟡 สนใจ</span> | <span>✅ ใช้แล้ว</span></div></div></div>
                            <div class="skill-checklist ex-products-edit" id="prod-list-${row.PersonID}">${edProducts}</div>
                            <div class="add-tag-group"><input type="text" id="add-prod-${row.PersonID}" class="e-input" style="flex:1; padding:6px; font-size:0.85rem;" placeholder="+ เพิ่มสินค้า..." onkeydown="if(event.key==='Enter'){event.preventDefault();addCustomTag('${row.PersonID}','product');}"><button class="btn btn-primary" onclick="addCustomTag('${row.PersonID}','product')">เพิ่ม</button></div>
                        </div>
                        <div class="crm-box box-skill">
                            <div class="crm-section-title" style="position: relative;">🎓 ทักษะพื้นฐาน <span class="hint-icon" onclick="toggleHint(event, 'hint-skill-${row.PersonID}')">💡</span><div class="hint-popup" id="hint-skill-${row.PersonID}"><div style="display:flex; gap:8px; flex-wrap:wrap; line-height:1.4;"><span><span class="hint-dot gray"></span>ยังไม่เรียน</span> | <span>🟡 เรียนแล้ว</span> | <span>✅ ถ่ายทอดได้</span></div></div></div>
                            <div class="skill-checklist ex-skills-edit" id="skill-list-${row.PersonID}">${edSkills}</div>
                            <div class="add-tag-group"><input type="text" id="add-skill-${row.PersonID}" class="e-input" style="flex:1; padding:6px; font-size:0.85rem;" placeholder="+ เพิ่มทักษะ..." onkeydown="if(event.key==='Enter'){event.preventDefault();addCustomTag('${row.PersonID}','skill');}"><button class="btn btn-primary" onclick="addCustomTag('${row.PersonID}','skill')">เพิ่ม</button></div>
                        </div>
                        <div class="crm-box box-followup" style="background:#FEF3C7; border-color:#FDE047;">
                            <div class="crm-section-title" style="color:#A16207;">🗓️ การติดตามผล</div>
                            <div class="seamless-row"><span class="seamless-label" style="color:#92400E;">วันเวลานัด:</span> <input type="datetime-local" class="seamless-input ex-appt-date" style="color:var(--primary);" value="${toLocalDatetimeInput(row.Next_Appt_Date)}" oninput="triggerAutoSave('${row.PersonID}')"></div>
                            <div class="seamless-row"><span class="seamless-label" style="color:#92400E;">เรื่องที่นัด:</span> <input type="text" class="seamless-input ex-appt-topic" value="${row.Next_Appt_Topic || ''}" oninput="triggerAutoSave('${row.PersonID}')"></div>
                            <div class="seamless-row" style="flex-direction:column; align-items:flex-start;"><span class="seamless-label" style="color:#92400E; margin-bottom:4px;">📌 Note สั้นๆ:</span> <input type="text" class="seamless-input ex-status-note" style="width:100%; text-align:left;" value="${row.Status_Note || ''}" oninput="triggerAutoSave('${row.PersonID}')"></div>
                        </div>
                        <div class="crm-box box-farm">
                            <div class="crm-section-title" style="position: relative;">
                                📊 วิเคราะห์ศักยภาพ (FARM / MAN)
                            </div>
                            <div class="seamless-row" style="border:none; margin-bottom:12px; padding-bottom:0; display:flex; align-items:center; justify-content:space-between;">
                                <span class="seamless-label" style="width:75px; font-weight:600;">F อัธยาศัย</span>
                                ${window.getScoreSliderHTML(row.Score_Friendly, `f_${row.PersonID}`, `val_f_${row.PersonID}`, 'ex-score-f', `triggerAutoSave('${row.PersonID}')`)}
                            </div>
                            <div class="seamless-row" style="border:none; margin-bottom:12px; padding-bottom:0; display:flex; align-items:center; justify-content:space-between;">
                                <span class="seamless-label" style="width:75px; font-weight:600;">A ขยัน</span>
                                ${window.getScoreSliderHTML(row.Score_Active, `a_${row.PersonID}`, `val_a_${row.PersonID}`, 'ex-score-a', `triggerAutoSave('${row.PersonID}')`)}
                            </div>
                            <div class="seamless-row" style="border:none; margin-bottom:12px; padding-bottom:0; display:flex; align-items:center; justify-content:space-between;">
                                <span class="seamless-label" style="width:75px; font-weight:600;">R สัมพันธ์</span>
                                ${window.getScoreSliderHTML(row.Score_Relation, `r_${row.PersonID}`, `val_r_${row.PersonID}`, 'ex-score-r', `triggerAutoSave('${row.PersonID}')`)}
                            </div>
                            <div class="seamless-row" style="border:none; margin-bottom:12px; padding-bottom:0; display:flex; align-items:center; justify-content:space-between;">
                                <span class="seamless-label" style="width:75px; font-weight:600;">M กำลังซื้อ</span>
                                ${window.getScoreSliderHTML(row.Score_Money, `m_${row.PersonID}`, `val_m_${row.PersonID}`, 'ex-score-m', `triggerAutoSave('${row.PersonID}')`)}
                            </div>
                            <div class="seamless-row" style="border:none; margin-bottom:12px; padding-bottom:0; display:flex; align-items:center; justify-content:space-between;">
                                <span class="seamless-label" style="width:75px; font-weight:600;">Au อำนาจ</span>
                                ${window.getScoreSliderHTML(row.Score_Authority, `au_${row.PersonID}`, `val_au_${row.PersonID}`, 'ex-score-au', `triggerAutoSave('${row.PersonID}')`)}
                            </div>
                            <div class="seamless-row" style="border:none; margin-bottom:0; padding-bottom:0; display:flex; align-items:center; justify-content:space-between;">
                                <span class="seamless-label" style="width:75px; font-weight:600;">N ปัญหา</span>
                                ${window.getScoreSliderHTML(row.Score_Need, `n_${row.PersonID}`, `val_n_${row.PersonID}`, 'ex-score-n', `triggerAutoSave('${row.PersonID}')`)}
                            </div>
                        </div>
                        <div class="crm-box box-note full-width">
                            <div class="crm-section-title">📝 STORY & NOTE</div>
                            <textarea class="seamless-input seamless-textarea ex-note" oninput="triggerAutoSave('${row.PersonID}')">${row.Note || defaultNote}</textarea>
                        </div>
                    </div>
                </div>
            </td>
        `;
        tbody.appendChild(trDrawer);
    });

    if (currentExpandedId) {
        const trMain = document.getElementById(`row-${currentExpandedId}`);
        const trDrawer = document.getElementById(`drawer-${currentExpandedId}`);
        if (trMain && trDrawer) {
            trMain.classList.add('row-expanded'); trDrawer.classList.add('open');
            if (trDrawer.querySelector('.drawer-container')) trDrawer.querySelector('.drawer-container').classList.add('drawer-expand');
            if (currentEditingId === currentExpandedId) trDrawer.classList.add('is-editing');
        }
    }

    const paginationFooter = document.querySelector('.pagination-footer');
    if (paginationFooter) {
        let pageBtns = '';
        let startP = Math.max(1, currentPage - 2); let endP = Math.min(totalPages, currentPage + 2);
        if(startP > 1) pageBtns += `<button class="btn btn-outline btn-page" onclick="goToPage(1)">1</button>${startP > 2 ? '<span style="padding:0 4px;">...</span>' : ''}`;
        for(let i=startP; i<=endP; i++) { pageBtns += `<button class="btn ${i === currentPage ? 'btn-primary' : 'btn-outline'} btn-page" onclick="goToPage(${i})">${i}</button>`; }
        if(endP < totalPages) pageBtns += `${endP < totalPages - 1 ? '<span style="padding:0 4px;">...</span>' : ''}<button class="btn btn-outline btn-page" onclick="goToPage(${totalPages})">${totalPages}</button>`;
        paginationFooter.innerHTML = `<div style="display:flex; align-items:center; gap:16px;"><span class="page-info">รวม <strong style="color:var(--primary);">${totalItems}</strong> รายการ</span><select class="e-input" style="padding:4px 8px; font-size:0.8rem; cursor:pointer;" onchange="changeItemsPerPage(this.value)"><option value="10" ${itemsPerPage===10?'selected':''}>โชว์ 10 แถว</option><option value="20" ${itemsPerPage===20?'selected':''}>โชว์ 20 แถว</option><option value="50" ${itemsPerPage===50?'selected':''}>โชว์ 50 แถว</option><option value="100" ${itemsPerPage===100?'selected':''}>โชว์ 100 แถว</option></select></div><div class="pagination-container" style="display:flex; gap:5px; align-items:center;"><button class="btn btn-outline btn-page" onclick="changePage(-1)" ${currentPage===1?'disabled':''}>&laquo;</button>${pageBtns}<button class="btn btn-outline btn-page" onclick="changePage(1)" ${currentPage===totalPages?'disabled':''}>&raquo;</button></div>`;
    }
}

// -----------------------------------------
// 6. AUTO-SAVE & API ACTIONS
// -----------------------------------------
function updateSelectColor(el, kind, id) { el.className = `colored-select ${kind === 'type' ? getTypeColorClass(el.value) : getStatusColorClass(el.value)}`; triggerAutoSave(id); }
function toggleModalProduct(btn, id, e) { if(e && e.target.classList.contains('tag-remove')) return; let s = btn.dataset.status; let val = btn.dataset.value; let ic = val; if(s === 'none') { btn.dataset.status = 'interested'; btn.className = 'skill-tag status-yes'; ic = '🟡 ' + val; } else if(s === 'interested') { btn.dataset.status = 'used'; btn.className = 'skill-tag status-teach'; ic = '✅ ' + val; } else { btn.dataset.status = 'none'; btn.className = 'skill-tag'; ic = val; } btn.innerHTML = `<span>${ic}</span> <span class="tag-remove" onclick="removeTag(this, '${id}', event)">✕</span>`; triggerAutoSave(id); }
function toggleModalSkill(btn, id, e) { if(e && e.target.classList.contains('tag-remove')) return; let v = btn.dataset.val; let skill = btn.dataset.skill; let ic = skill; if(v === 'no') { btn.dataset.val = 'yes'; btn.className = 'skill-tag status-yes'; ic = '🟡 ' + skill; } else if(v === 'yes') { btn.dataset.val = 'teach'; btn.className = 'skill-tag status-teach'; ic = '✅ ' + skill; } else { btn.dataset.val = 'no'; btn.className = 'skill-tag'; ic = skill; } btn.innerHTML = `<span>${ic}</span> <span class="tag-remove" onclick="removeTag(this, '${id}', event)">✕</span>`; triggerAutoSave(id); }
function removeTag(element, id, e) { e.stopPropagation(); element.closest('.skill-tag').remove(); triggerAutoSave(id); }
function addCustomTag(id, type) { const inputEl = document.getElementById(type === 'product' ? `add-prod-${id}` : `add-skill-${id}`); const val = inputEl.value.trim(); if(!val) return; const listEl = document.getElementById(type === 'product' ? `prod-list-${id}` : `skill-list-${id}`); const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'skill-tag'; if (type === 'product') { btn.dataset.value = val; btn.dataset.status = 'none'; btn.onclick = (e) => toggleModalProduct(btn, id, e); } else { btn.dataset.skill = val; btn.dataset.val = 'no'; btn.onclick = (e) => toggleModalSkill(btn, id, e); } btn.innerHTML = `<span>${val}</span> <span class="tag-remove" onclick="removeTag(this, '${id}', event)">✕</span>`; listEl.appendChild(btn); inputEl.value = ''; triggerAutoSave(id); inputEl.focus(); }

function triggerAutoSave(personID) { 
    const btn = document.getElementById(`status-btn-${personID}`); const menu = document.getElementById(`action-menu-${personID}`);
    if (autoSaveTimers[personID]) clearTimeout(autoSaveTimers[personID]); 
    if(btn) { btn.innerHTML = '⏳'; btn.style.pointerEvents = 'none'; if(menu) menu.classList.remove('show'); }
    autoSaveTimers[personID] = setTimeout(() => { executeAutoSave(personID); }, 1000); 
}

async function executeAutoSave(id) {
    const trMain = document.getElementById(`row-${id}`); const trDrawer = document.getElementById(`drawer-${id}`);
    const setStatus = (icon, lock = false, resetAfter = 0) => { const btn = document.getElementById(`status-btn-${id}`); if (btn) { btn.innerHTML = icon; btn.style.pointerEvents = lock ? 'none' : 'auto'; } if (resetAfter > 0) setTimeout(() => { const resetBtn = document.getElementById(`status-btn-${id}`); if (resetBtn) { resetBtn.innerHTML = '⋮'; resetBtn.style.pointerEvents = 'auto'; } }, resetAfter); };
    setStatus('⏳', true); 
    const person = contactsData.find(p => p.PersonID === id); 
    if (!person) { setStatus('❌', false, 2000); return; }
    
    const payloadData = { ...person };
    if (trMain) { const selects = trMain.querySelectorAll('.colored-select'); if(selects[0]) payloadData.Contact_Type = selects[0].value; if(selects[1]) payloadData.Current_Status = selects[1].value; const mainDate = trMain.querySelector('input[type="datetime-local"]'); if(mainDate) payloadData.Next_Appt_Date = mainDate.value; }
    if (trDrawer && trDrawer.classList.contains('is-editing')) {
        payloadData.Name = trDrawer.querySelector('.ex-name')?.value || payloadData.Name;
        payloadData.Phone = trDrawer.querySelector('.ex-phone')?.value || payloadData.Phone;
        payloadData.Relation_Jogger = trDrawer.querySelector('.ex-rel')?.value || payloadData.Relation_Jogger;
        payloadData.Age = trDrawer.querySelector('.ex-age')?.value || payloadData.Age;
        payloadData.ABO_Number = trDrawer.querySelector('.ex-abo')?.value || payloadData.ABO_Number;
        payloadData.DOB = trDrawer.querySelector('.ex-dob')?.value || payloadData.DOB;
        payloadData.Expire_Date = trDrawer.querySelector('.ex-expire')?.value || payloadData.Expire_Date;
        payloadData.Next_Appt_Date = trDrawer.querySelector('.ex-appt-date')?.value || payloadData.Next_Appt_Date;
        payloadData.Next_Appt_Topic = trDrawer.querySelector('.ex-appt-topic')?.value || payloadData.Next_Appt_Topic;
        payloadData.Status_Note = trDrawer.querySelector('.ex-status-note')?.value || payloadData.Status_Note;
        // 🌟 ดึงค่าจาก Slider
        payloadData.Score_Friendly = trDrawer.querySelector('.ex-score-f')?.value || payloadData.Score_Friendly;
        payloadData.Score_Active = trDrawer.querySelector('.ex-score-a')?.value || payloadData.Score_Active;
        payloadData.Score_Relation = trDrawer.querySelector('.ex-score-r')?.value || payloadData.Score_Relation;
        payloadData.Score_Money = trDrawer.querySelector('.ex-score-m')?.value || payloadData.Score_Money;
        payloadData.Score_Authority = trDrawer.querySelector('.ex-score-au')?.value || payloadData.Score_Authority;
        payloadData.Score_Need = trDrawer.querySelector('.ex-score-n')?.value || payloadData.Score_Need;
        
        let pArr = []; trDrawer.querySelectorAll('.ex-products-edit .skill-tag').forEach(b => { if (b.dataset.status !== 'none' || !standardProducts.includes(b.dataset.value)) pArr.push(`${b.dataset.value}:${b.dataset.status}`); }); payloadData.Products_Status = pArr.join(',');
        let skObj = {}; trDrawer.querySelectorAll('.ex-skills-edit .skill-tag').forEach(b => { skObj[b.dataset.skill] = b.dataset.val; }); payloadData.Personal_Skill = JSON.stringify(skObj);
        payloadData.Note = trDrawer.querySelector('.ex-note')?.value || payloadData.Note;
    }
    payloadData.Last_Update = new Date().toISOString();
    
    try {
        const response = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'UPDATE', sheet: "Contacts_Master", id: id, data: payloadData }), headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
        const result = await response.json();
        if (result.status === "success") { const index = contactsData.findIndex(p => p.PersonID === id); if (index > -1) contactsData[index] = payloadData; localStorage.setItem('buzzGuideContacts', JSON.stringify(contactsData)); setStatus('✅', false, 2000); syncMainRow(id); updateDashboard(); } else { setStatus('❌', false, 2000); }
    } catch (error) { setStatus('❌', false, 2000); }
}

function syncMainRow(id) {
    const trDrawer = document.getElementById(`drawer-${id}`); if(!trDrawer) return;
    const viewName = document.getElementById(`view-name-${id}`); const viewPhone = document.getElementById(`view-phone-${id}`); const viewScore = document.getElementById(`view-score-${id}`);
    if (viewName) viewName.innerText = trDrawer.querySelector('.ex-name')?.value || 'ไม่ระบุชื่อ';
    if (viewPhone) viewPhone.innerText = `📞 ${trDrawer.querySelector('.ex-phone')?.value || '-'}`;
    if (viewScore) {
        let total = (parseInt(trDrawer.querySelector('.ex-score-f')?.value||0) + parseInt(trDrawer.querySelector('.ex-score-a')?.value||0) + parseInt(trDrawer.querySelector('.ex-score-r')?.value||0) + parseInt(trDrawer.querySelector('.ex-score-m')?.value||0) + parseInt(trDrawer.querySelector('.ex-score-au')?.value||0) + parseInt(trDrawer.querySelector('.ex-score-n')?.value||0)) / 6;
        viewScore.innerText = `🎯 ${total.toFixed(1)}`;
    }
}

// -----------------------------------------
// 7. MENUS, MODALS & DELETE
// -----------------------------------------
function showFilterMenu(id, element) { const pop = document.getElementById(id); const isVisible = pop.style.display === 'flex'; document.querySelectorAll('.filter-popover').forEach(el => el.style.display = 'none'); if (!isVisible && element) { document.body.appendChild(pop); pop.style.display = 'flex'; const rect = element.getBoundingClientRect(); const popWidth = pop.offsetWidth; const windowWidth = window.innerWidth; pop.style.top = (rect.bottom + 10) + 'px'; let leftPos = rect.left; if (leftPos + popWidth > windowWidth - 20) { leftPos = rect.right - popWidth; } if (leftPos < 10) leftPos = 10; pop.style.left = leftPos + 'px'; } }
document.addEventListener('click', function(e) { if (!e.target.closest('.th-interactive') && !e.target.closest('.filter-popover')) document.querySelectorAll('.filter-popover').forEach(el => el.style.display = 'none'); if (!e.target.closest('.action-menu-container')) document.querySelectorAll('.action-menu-dropdown').forEach(el => el.classList.remove('show')); });
function toggleActionMenu(id) { document.querySelectorAll('.action-menu-dropdown').forEach(el => { if(el.id !== `action-menu-${id}`) el.classList.remove('show'); }); document.getElementById(`action-menu-${id}`).classList.toggle('show'); }
function clickLeftBtn(id) { if (currentExpandedId !== id) toggleExpandRow(id); const menu = document.getElementById(`action-menu-${id}`); if(menu) menu.classList.remove('show'); const btnLeft = document.getElementById(`btn-left-${id}`); const btnRight = document.getElementById(`btn-right-${id}`); if (btnLeft.innerText.includes('แก้ไข')) { document.getElementById(`drawer-${id}`).classList.add('is-editing'); currentEditingId = id; btnLeft.style.transform = 'scale(0)'; btnLeft.style.opacity = '0'; setTimeout(() => btnLeft.style.display = 'none', 300); morphBtn(btnRight, '✅ บันทึก', 'btn btn-primary btn-save-glow', 'white', 'transparent'); } else if (btnLeft.innerText.includes('ยืนยัน')) deleteContact(id); }
function clickRightBtn(id) { if (currentExpandedId !== id) toggleExpandRow(id); const menu = document.getElementById(`action-menu-${id}`); if(menu) menu.classList.remove('show'); const btnLeft = document.getElementById(`btn-left-${id}`); const btnRight = document.getElementById(`btn-right-${id}`); if (btnRight.innerText.includes('ลบ')) { btnLeft.style.display = 'inline-flex'; btnLeft.style.transform = 'scale(0.7)'; btnLeft.style.opacity = '0'; setTimeout(() => { morphBtn(btnLeft, '⚠️ ยืนยัน', 'btn btn-danger'); }, 10); morphBtn(btnRight, '❌ ยกเลิก', 'btn btn-outline', 'var(--text-muted)', 'var(--border-color)'); } else if (btnRight.innerText.includes('บันทึก')) { if (autoSaveTimers[id]) { clearTimeout(autoSaveTimers[id]); autoSaveTimers[id] = null; } executeAutoSave(id); const drawer = document.getElementById(`drawer-${id}`); if(drawer) drawer.classList.remove('is-editing'); currentEditingId = null; btnRight.innerHTML = '⏳ กำลังบันทึก...'; btnRight.className = 'btn btn-primary'; btnRight.style.pointerEvents = 'none'; btnRight.style.transform = 'scale(0.95)'; btnLeft.style.transform = 'scale(0)'; btnLeft.style.opacity = '0'; setTimeout(() => { btnLeft.style.display = 'none'; }, 300); setTimeout(() => { btnLeft.style.display = 'inline-flex'; morphBtn(btnLeft, '✏️ แก้ไข', 'btn btn-outline'); morphBtn(btnRight, '🗑️ ลบ', 'btn btn-outline', 'var(--danger)', '#FCA5A5'); btnRight.style.pointerEvents = 'auto'; }, 800); } else if (btnRight.innerText.includes('ยกเลิก')) { morphBtn(btnLeft, '✏️ แก้ไข', 'btn btn-outline'); morphBtn(btnRight, '🗑️ ลบ', 'btn btn-outline', 'var(--danger)', '#FCA5A5'); } }
function toggleExpandRow(id) { if (currentExpandedId === id) { const drawer = document.getElementById(`drawer-${id}`); const container = drawer.querySelector('.drawer-container'); container.classList.remove('drawer-expand'); setTimeout(() => { document.getElementById(`row-${id}`).classList.remove('row-expanded'); drawer.classList.remove('open'); drawer.classList.remove('is-editing'); currentExpandedId = null; currentEditingId = null; }, 350); } else { if (currentExpandedId) { const oldDrawer = document.getElementById(`drawer-${currentExpandedId}`); if(oldDrawer) { const oldContainer = oldDrawer.querySelector('.drawer-container'); if(oldContainer) oldContainer.classList.remove('drawer-expand'); const oldId = currentExpandedId; setTimeout(() => { document.getElementById(`row-${oldId}`)?.classList.remove('row-expanded'); oldDrawer.classList.remove('open'); oldDrawer.classList.remove('is-editing'); }, 350); } } document.getElementById(`row-${id}`).classList.add('row-expanded'); const drawer = document.getElementById(`drawer-${id}`); drawer.classList.add('open'); setTimeout(() => { drawer.querySelector('.drawer-container').classList.add('drawer-expand'); }, 10); currentExpandedId = id; currentEditingId = null; } }
function openAddModal() { document.getElementById('addContactForm').reset(); document.getElementById('addContactModal').classList.add('open'); }
function closeAddModal() { document.getElementById('addContactModal').classList.remove('open'); }

async function submitNewContact(e) { 
    e.preventDefault(); 
    const btn = document.getElementById('btnAddSubmit'); btn.disabled = true; btn.innerHTML = '⏳ กำลังบันทึก...'; 
    let maxId = 0; contactsData.forEach(p => { const num = parseInt((p.PersonID || '').replace('N', '')); if (!isNaN(num) && num > maxId) maxId = num; }); 
    const newId = 'N' + String(maxId + 1).padStart(4, '0'); const now = new Date().toISOString(); 
    const newContact = { 
        PersonID: newId, Name: document.getElementById('addName').value.trim(), Phone: document.getElementById('addPhone').value.trim(), 
        Contact_Type: document.getElementById('addType').value, Current_Status: document.getElementById('addStatus').value, Relation_Jogger: '', 
        Score_Active: 5, Score_Friendly: 5, Score_Money: 5, Score_Relation: 5, Score_Authority: 5, Score_Need: 5, // ค่าเริ่มเป็น 5
        Note: document.getElementById('addNote').value.trim() || defaultNote, Date_Added: now, Last_Update: now, isNewData: true 
    }; 
    try { 
        const response = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'CREATE', sheet: "Contacts_Master", data: [newContact] }), headers: { 'Content-Type': 'text/plain;charset=utf-8' } }); 
        const result = await response.json(); 
        if (result.status === "success") { contactsData.push(newContact); localStorage.setItem('buzzGuideContacts', JSON.stringify(contactsData)); currentSortCol = 'update'; currentSortDir = 'desc'; const searchInput = document.getElementById('searchInput'); if(searchInput) searchInput.value = ''; closeAddModal(); updateDashboard(); resetPageAndRender(); } else { alert('❌ บันทึกข้อมูลบน Google Sheets ไม่สำเร็จ'); } 
    } catch (err) { alert('❌ การเชื่อมต่อล้มเหลว กรุณาตรวจสอบอินเทอร์เน็ต'); } finally { btn.disabled = false; btn.innerHTML = 'บันทึกรายชื่อ'; } 
}

function deleteContact(id) { document.getElementById(`row-${id}`).style.opacity = '0.5'; fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: "DELETE", sheet: "Contacts_Master", id: id }), headers: { 'Content-Type': 'text/plain;charset=utf-8' } }).then(res => res.json()).then(r => { if(r.status === "success") { contactsData = contactsData.filter(p => p.PersonID !== id); localStorage.setItem('buzzGuideContacts', JSON.stringify(contactsData)); resetPageAndRender(); updateDashboard(); } }); }
function toggleHint(e, hintId) { e.stopPropagation(); const popup = document.getElementById(hintId); const isShowing = popup.classList.contains('show'); document.querySelectorAll('.hint-popup').forEach(p => p.classList.remove('show')); if (!isShowing) popup.classList.add('show'); }
document.addEventListener('click', () => { document.querySelectorAll('.hint-popup.show').forEach(p => p.classList.remove('show')); }); window.addEventListener('scroll', () => { document.querySelectorAll('.hint-popup.show').forEach(p => p.classList.remove('show')); }, true);