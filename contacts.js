// =========================================================================
// CONTACTS.JS - ระบบฐานข้อมูลรายชื่อ (MODERN ARCHITECTURE V10.2)
// =========================================================================

// -----------------------------------------
// 1. CONFIG & STATE
// -----------------------------------------
const API_URL = "https://script.google.com/macros/s/AKfycbzxkUXB8S1LhwJERDd4HlrsMTLmvAV-MWBya0jqeB5QTEa1tjsdX2aXV4GVDuJajZWRnQ/exec"; // <-- ใส่ URL Web App 

let contactsData = [];
let autoSaveTimers = {}; 
let currentSortCol = 'appt'; 
let currentSortDir = 'asc';   
let currentPage = 1; 
const itemsPerPage = 20;

let currentExpandedId = null; 
let currentEditingId = null;

const statusOptions = [ "ลิสต์รายชื่อ", "กำลังติดต่อ", "นัดหมายแล้ว", "นำเสนอแล้ว", "ติดตามผล", "ซื้อสินค้า/สมัครแล้ว", "ปฏิเสธ" ];
const skillList = ["1. สาธิตสินค้า", "2. เขียนโมเดลธุรกิจ", "3. ผ่าแผนการตลาด", "4. ตอบข้อโต้แย้ง", "5. พูดความสวยงาม", "6. ติดตาม DL+จัด HM", "7. วิเคราะห์+เป้าหมาย", "8. ผ่าแผน 6%, 1%", "9. ถ่ายทอดได้"];
const standardProducts = ['Breakfast Set', 'eSpring', 'Atmosphere Sky', 'Atmosphere Drive', 'Spa', '6WNY / Detox', 'Workshop'];
const defaultNote = `Profile:\n- ชื่อเล่น: \n- อายุ: \n- จบจาก: \n- แต่งงาน มีลูก: \n- จุดที่น่าจะเปิดใจ/Pain Point: \n- รู้จัก AW ไหม: `;

window.onload = () => { fetchContacts(); };

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

function formatDateOnly(dateStr) { 
    if (!dateStr) return '-'; 
    const d = new Date(dateStr); if (isNaN(d)) return dateStr; 
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = (d.getFullYear() + 543).toString().slice(-2);
    return `${dd}/${mm}/${yy}`; 
}

function calculateAge(dobStr) { 
    if(!dobStr) return ''; 
    const dob = new Date(dobStr); if(isNaN(dob)) return ''; 
    const age_dt = new Date(Date.now() - dob.getTime()); 
    return Math.abs(age_dt.getUTCFullYear() - 1970); 
}

function calculateScore(person, mode) { 
    let m = parseInt(person.Score_Money || 3); 
    let r = parseInt(person.Score_Relation || 3); 
    let score = 0; 
    if (mode === 'FARM') { 
        let f = parseInt(person.Score_Friendly || 3); 
        let a = parseInt(person.Score_Active || 3); 
        score = (f + a + r + m) / 4; 
    } else { 
        let au = parseInt(person.Score_Authority || 3); 
        let n = parseInt(person.Score_Need || 3); 
        score = (m + au + r + n) / 4; 
    } 
    return Math.floor(score * 10) / 10; 
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
    const map = {'Memory Jogger':'type-jogger', 'Sponsor List':'type-sponsor', 'Customer List':'type-customer', 'ABO':'type-abo', 'MEM':'type-mem', 'Upline':'type-jogger', 'Sideline':'type-jogger'}; 
    return map[type] || 'type-jogger'; 
}
function getStatusColorClass(status) { 
    const map = {'ลิสต์รายชื่อ':'status-list', 'กำลังติดต่อ':'status-list', 'นัดหมายแล้ว':'type-sponsor', 'นำเสนอแล้ว':'type-sponsor', 'ติดตามผล':'status-list', 'ซื้อสินค้า/สมัครแล้ว':'status-success', 'ปฏิเสธ':'type-mem'}; 
    return map[status] || 'status-list'; 
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
function generateRPGStarSelect(val, className, personID) { 
    let options = ''; 
    for(let i=1; i<=5; i++) { options += `<option value="${i}" ${val == i ? 'selected' : ''}>${'⭐'.repeat(i)}</option>`; } 
    return `<select class="e-input ${className}" style="padding:4px; font-size:0.8rem; width:100%;" onchange="triggerAutoSave('${personID}')">${options}</select>`; 
}

// -----------------------------------------
// 3. DASHBOARD & DATA FETCHING
// -----------------------------------------
function updateDashboard() {
    if (!contactsData) return;
    document.getElementById('summary-total').innerText = contactsData.length;
    
    const now = new Date();
    const upcomingAppts = contactsData.filter(c => {
        if (!c.Next_Appt_Date) return false;
        return new Date(c.Next_Appt_Date) >= now;
    }).length;
    document.getElementById('summary-appts').innerText = upcomingAppts;

    const successCount = contactsData.filter(c => c.Current_Status === 'ซื้อสินค้า/สมัครแล้ว').length;
    document.getElementById('summary-success').innerText = successCount;
}

async function fetchContacts() { 
    const tbody = document.getElementById('contactsTableBody'); 
    const cachedData = localStorage.getItem('buzzGuideContacts'); 
    
    if (cachedData) { 
        try { 
            contactsData = JSON.parse(cachedData); 
            renderTable(); 
            updateDashboard();
        } catch(e) { console.error(e); } 
    } else { 
        tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding: 3rem; color: var(--primary);">กำลังซิงค์ข้อมูล... ⏳</td></tr>`; 
    } 
    
    try { 
        const response = await fetch(`${API_URL}?sheet=Contacts_Master`); 
        const result = await response.json(); 
        if (result.status === "success") { 
            contactsData = result.data; 
            localStorage.setItem('buzzGuideContacts', JSON.stringify(contactsData)); 
            renderTable(); 
            updateDashboard();
        } 
    } catch (error) { 
        if (!cachedData) tbody.innerHTML = `<tr><td colspan="10" style="color:var(--danger); text-align:center; padding:3rem;"><b>⚠️ เกิดข้อผิดพลาดในการเชื่อมต่อ (Offline)</b></td></tr>`; 
    } 
}

// -----------------------------------------
// 4. UI INTERACTIONS
// -----------------------------------------
function resetPageAndRender() { currentPage = 1; renderTable(); }
function changePage(step) { currentPage += step; renderTable(); }

function setSort(col, dir) { 
    currentSortCol = col; currentSortDir = dir; 
    resetPageAndRender(); 
}

function showFilterMenu(id, element) { 
    const pop = document.getElementById(id); 
    const isVisible = pop.style.display === 'flex'; 
    document.querySelectorAll('.filter-popover').forEach(el => el.style.display = 'none'); 
    
    if(!isVisible && element) { 
        document.body.appendChild(pop); 
        const rect = element.getBoundingClientRect(); 
        pop.style.top = (rect.bottom + 10) + 'px'; 
        pop.style.left = rect.left + 'px'; 
        pop.style.display = 'flex'; 
    } 
}

document.addEventListener('click', function(e) { 
    if (!e.target.closest('.th-interactive') && !e.target.closest('.filter-popover')) { 
        document.querySelectorAll('.filter-popover').forEach(el => el.style.display = 'none'); 
    } 
    if (!e.target.closest('.action-menu-container')) { 
        document.querySelectorAll('.action-menu-dropdown').forEach(el => el.classList.remove('show')); 
    }
});

function toggleActionMenu(id) {
    document.querySelectorAll('.action-menu-dropdown').forEach(el => { if(el.id !== `action-menu-${id}`) el.classList.remove('show'); });
    document.getElementById(`action-menu-${id}`).classList.toggle('show');
}

// 🌟 ฟังก์ชันช่วยทำ Animation Morph ให้ปุ่ม (แปลงร่าง)
// 🌟 ฟังก์ชันช่วยทำ Animation Morph (ปรับให้หดเยอะขึ้น เวลาเด้งจะได้สะใจ)
function morphBtn(btn, newText, newClass, newColor, newBorder) {
    // หดปุ่มให้เล็กลงเหลือ 70% เพื่อให้จังหวะสปริงดีดกลับดู "เด้ง" มากขึ้น
    btn.style.transform = 'scale(0.7)';
    btn.style.opacity = '0.3';
    
    setTimeout(() => {
        btn.innerHTML = newText;
        btn.className = newClass;
        
        btn.style.color = newColor || '';
        btn.style.borderColor = newBorder || '';
        
        btn.style.display = 'inline-flex';
        // จังหวะนี้ CSS สปริง (cubic-bezier) จะดีดปุ่มให้เด้งดึ๋งเลยขอบเขตมาแล้วหดกลับ!
        btn.style.transform = 'scale(1)';
        btn.style.opacity = '1';
    }, 150);
}

// 🌟 ฟังก์ชันควบคุมปุ่มอัจฉริยะ (แก้ไข/บันทึก/ลบ/ยกเลิก)
function clickLeftBtn(id) {
    if (currentExpandedId !== id) toggleExpandRow(id);
    const menu = document.getElementById(`action-menu-${id}`);
    if(menu) menu.classList.remove('show');

    const btnLeft = document.getElementById(`btn-left-${id}`);
    const btnRight = document.getElementById(`btn-right-${id}`);
    
    if (btnLeft.innerText.includes('แก้ไข')) {
        document.getElementById(`drawer-${id}`).classList.add('is-editing');
        currentEditingId = id;
        
        btnLeft.style.transform = 'scale(0)';
        btnLeft.style.opacity = '0';
        setTimeout(() => btnLeft.style.display = 'none', 300);

        // Morph ปุ่มขวาแปลงร่างเป็น "บันทึก" พร้อมใส่คลาสเรืองแสง (btn-save-glow)
        morphBtn(btnRight, '✅ บันทึก', 'btn btn-primary btn-save-glow', 'white', 'transparent');
    } else if (btnLeft.innerText.includes('ยืนยัน')) {
        deleteContact(id);
    }
}

// 🌟 ฟังก์ชันควบคุมปุ่มอัจฉริยะ (แก้ไข/บันทึก/ลบ/ยกเลิก) - UPDATE V10.8
function clickRightBtn(id) {
    if (currentExpandedId !== id) toggleExpandRow(id);
    const menu = document.getElementById(`action-menu-${id}`);
    if(menu) menu.classList.remove('show');

    const btnLeft = document.getElementById(`btn-left-${id}`);
    const btnRight = document.getElementById(`btn-right-${id}`);
    
    if (btnRight.innerText.includes('ลบ')) {
        // [สถานะปกติ] กดลบ -> แปลงร่างปุ่มให้เป็นโหมด ยืนยัน/ยกเลิก
        btnLeft.style.display = 'inline-flex';
        btnLeft.style.transform = 'scale(0.7)'; 
        btnLeft.style.opacity = '0';
        
        setTimeout(() => { 
            morphBtn(btnLeft, '⚠️ ยืนยัน', 'btn btn-danger'); 
        }, 10);
        
        morphBtn(btnRight, '❌ ยกเลิก', 'btn btn-outline', 'var(--text-muted)', 'var(--border-color)');

    } else if (btnRight.innerText.includes('บันทึก')) {
        // [โหมดแก้ไข] กดบันทึก -> 🌟 แก้ไข: หน่วงเวลาให้ปุ่มเล่น Animation จบก่อน
        
        // 1. Morph ปุ่มซ้าย กลับมาเป็น "แก้ไข"
        btnLeft.style.display = 'inline-flex';
        btnLeft.style.transform = 'scale(0)'; 
        btnLeft.style.opacity = '0';
        
        setTimeout(() => { 
            morphBtn(btnLeft, '✏️ แก้ไข', 'btn btn-outline'); 
        }, 10);
        
        // 2. Morph ปุ่มขวา แปลงร่างกลับมาเป็น "ลบ"
        morphBtn(btnRight, '🗑️ ลบ', 'btn btn-outline', 'var(--danger)', '#FCA5A5');
        
        // 3. ⏳ หน่วงเวลา 500ms (0.5 วินาที) ให้ปุ่มเด้งเสร็จ 100% ค่อยปิดโหมดแก้ไข
        setTimeout(() => { 
            exitEditMode(id); 
        }, 500); 
        
    } else if (btnRight.innerText.includes('ยกเลิก')) {
        // [สถานะ ยืนยัน/ยกเลิก] กดยกเลิกการลบ -> Morph ทั้งคู่กลับสถานะปกติ
        morphBtn(btnLeft, '✏️ แก้ไข', 'btn btn-outline');
        morphBtn(btnRight, '🗑️ ลบ', 'btn btn-outline', 'var(--danger)', '#FCA5A5');
    }
}

// ควบคุมการเปิดปิดลิ้นชักพร้อม Animation
function toggleExpandRow(id) { 
    if (currentExpandedId === id) {
        const drawer = document.getElementById(`drawer-${id}`);
        const container = drawer.querySelector('.drawer-container');
        container.classList.remove('drawer-expand'); // เริ่ม Animation หดกลับ
        
        setTimeout(() => {
            document.getElementById(`row-${id}`).classList.remove('row-expanded');
            drawer.classList.remove('open');
            drawer.classList.remove('is-editing');
            currentExpandedId = null; currentEditingId = null;
        }, 350); // รอให้หดเสร็จค่อยซ่อน
    } else {
        if (currentExpandedId) {
            const oldDrawer = document.getElementById(`drawer-${currentExpandedId}`);
            if(oldDrawer) {
                const oldContainer = oldDrawer.querySelector('.drawer-container');
                if(oldContainer) oldContainer.classList.remove('drawer-expand');
                const oldId = currentExpandedId;
                setTimeout(() => {
                    document.getElementById(`row-${oldId}`)?.classList.remove('row-expanded');
                    oldDrawer.classList.remove('open');
                    oldDrawer.classList.remove('is-editing');
                }, 350);
            }
        }
        
        document.getElementById(`row-${id}`).classList.add('row-expanded');
        const drawer = document.getElementById(`drawer-${id}`);
        drawer.classList.add('open');
        
        setTimeout(() => {
            drawer.querySelector('.drawer-container').classList.add('drawer-expand'); // เริ่ม Animation กางออก
        }, 10);
        
        currentExpandedId = id; currentEditingId = null;
    }
}

function enterEditMode(id) {
    document.getElementById(`action-menu-${id}`).classList.remove('show');
    if (currentExpandedId !== id) { toggleExpandRow(id); }
    document.getElementById(`drawer-${id}`).classList.add('is-editing');
    currentEditingId = id;
}

function exitEditMode(id) {
    if (autoSaveTimers[id]) {
        clearTimeout(autoSaveTimers[id]); autoSaveTimers[id] = null;
        executeAutoSave(id).then(() => { currentEditingId = null; renderTable(); updateDashboard(); });
    } else { 
        currentEditingId = null; renderTable(); updateDashboard(); 
    }
}

// -----------------------------------------
// 5. CORE RENDERING 
// -----------------------------------------
function renderTable() {
    const tbody = document.getElementById('contactsTableBody'); 
    tbody.innerHTML = '';
    
    if (!contactsData || contactsData.length === 0) { 
        tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding: 3rem; color: var(--text-muted);">ยังไม่มีรายชื่อในระบบ</td></tr>`; 
        return; 
    }

    const searchPC = (document.getElementById('searchInput')?.value || '').toLowerCase(); 
    const searchMobile = (document.getElementById('searchInputMobile')?.value || '').toLowerCase();
    const searchText = searchPC || searchMobile;

    const scoreMode = document.getElementById('scoreModeSel')?.value || 'FARM';
    const checkedTypes = Array.from(document.querySelectorAll('.cb-type:checked')).map(cb => cb.value); 
    const checkedStatuses = Array.from(document.querySelectorAll('.cb-status:checked')).map(cb => cb.value); 
    
    let displayData = contactsData.filter(row => {
        if(!row.PersonID) return false;
        const nameMatch = (row.Name || '').toLowerCase().includes(searchText) || (row.Phone || '').includes(searchText);
        const typeMatch = checkedTypes.length === 0 || checkedTypes.includes(row.Contact_Type);
        const statusMatch = checkedStatuses.length === 0 || checkedStatuses.includes(row.Current_Status);
        return nameMatch && typeMatch && statusMatch;
    });

    displayData.sort((a, b) => {
        if (currentSortCol === 'score') return currentSortDir === 'asc' ? calculateScore(a, scoreMode) - calculateScore(b, scoreMode) : calculateScore(b, scoreMode) - calculateScore(a, scoreMode);
        else if (currentSortCol === 'appt') { const dA = a.Next_Appt_Date ? new Date(a.Next_Appt_Date).getTime() : 0; const dB = b.Next_Appt_Date ? new Date(b.Next_Appt_Date).getTime() : 0; if(dA===0 && dB!==0) return 1; if(dA!==0 && dB===0) return -1; return currentSortDir === 'asc' ? dA - dB : dB - dA; } 
        else { const dA = a.Last_Update ? new Date(a.Last_Update).getTime() : 0; const dB = b.Last_Update ? new Date(b.Last_Update).getTime() : 0; return currentSortDir === 'asc' ? dA - dB : dB - dA; }
    });

    const totalItems = displayData.length; 
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages; if (currentPage < 1) currentPage = 1;
    document.getElementById('pageInfo').innerText = `หน้า ${currentPage} / ${totalPages} (${totalItems} รายการ)`;
    
    const startIndex = (currentPage - 1) * itemsPerPage; 
    const pageData = displayData.slice(startIndex, startIndex + itemsPerPage);

    pageData.forEach((row, index) => {
        let displayAge = row.Age || ''; if (row.DOB) displayAge = calculateAge(row.DOB) || displayAge;
        let ageOptions = '<option value="">-</option>'; for(let i=15; i<=80; i++) ageOptions += `<option value="${i}" ${row.Age == i ? 'selected':''}>${i}</option>`;
        
        const trMain = document.createElement('tr'); 
        trMain.id = `row-${row.PersonID}`; 
        trMain.className = 'main-row'; 
        trMain.onclick = (e) => { 
            if (!['SELECT','BUTTON','INPUT'].includes(e.target.tagName)) toggleExpandRow(row.PersonID); 
        };

        trMain.innerHTML = `
            <td style="text-align:center; color:var(--text-muted);">${startIndex + index + 1}</td>
            <td class="col-name-cell">
                <div class="profile-cell" style="display:flex; align-items:center; gap:12px;">
                    <div class="avatar-circle">${(row.Name||'?').charAt(0).toUpperCase()}</div>
                    <div class="profile-info" style="display:flex; flex-direction:column;">
                        <span class="profile-name" style="font-weight:600; color:var(--text-main);">${row.Name || 'ไม่ระบุชื่อ'}</span>
                        <span class="profile-sub" style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">📞 ${row.Phone || '-'}</span>
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
            <td class="col-score" style="text-align:center; font-weight:600; color:#D97706;">⭐ ${calculateScore(row, scoreMode).toFixed(1)}</td>
            <td><div class="desktop-only">${generateStatusDropdownHTML(row.Current_Status, row.PersonID)}</div></td>
            <td class="col-update" style="font-size:0.75rem; color:var(--text-muted);">${formatDateShort(row.Last_Update)}</td>
            <td style="text-align:center;">
                <div class="action-menu-container">
                    <span id="status-${row.PersonID}" style="font-size:0.8rem; margin-right:5px;"></span>
                    <button class="btn-icon-dots view-mode" onclick="toggleActionMenu('${row.PersonID}'); event.stopPropagation();">⋮</button>
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
        let roProducts = ''; let edProducts = '';
        Object.keys(pMap).forEach(item => {
            const st = pMap[item]; let cls = 'skill-tag'; let ic = item;
            if(st === 'interested') { cls += ' status-yes'; ic = '🟡 ' + item; } else if(st === 'used') { cls += ' status-teach'; ic = '✅ ' + item; }
            roProducts += `<span class="${cls}">${ic}</span>`;
            // 🌟 เพิ่ม <span> ครอบข้อความ และเพิ่มปุ่ม (X) สำหรับโหมดแก้ไข
            edProducts += `<button type="button" class="${cls}" data-value="${item}" data-status="${st}" onclick="toggleModalProduct(this, '${row.PersonID}', event)"><span>${ic}</span> <span class="tag-remove" onclick="removeTag(this, '${row.PersonID}', event)">✕</span></button>`;
        });

        let skData = {}; try { skData = JSON.parse(row.Personal_Skill || "{}"); } catch(e){}
        let allSk = [...skillList]; Object.keys(skData).forEach(k => { if(!allSk.includes(k)) allSk.push(k); });
        let roSkills = ''; let edSkills = '';
        allSk.forEach(sk => {
            const val = skData[sk] || 'no'; let cls = 'skill-tag'; let ic = sk;
            if(val === 'yes') { cls += ' status-yes'; ic = '🟡 ' + sk; } else if(val === 'teach') { cls += ' status-teach'; ic = '✅ ' + sk; }
            roSkills += `<span class="${cls}">${ic}</span>`;
            // 🌟 เพิ่ม <span> ครอบข้อความ และเพิ่มปุ่ม (X) สำหรับโหมดแก้ไข
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
                            <div class="seamless-row"><span class="seamless-label">สัมพันธ์:</span> <input type="text" class="seamless-input ex-rel" value="${row.Relation_Jogger || ''}" oninput="triggerAutoSave('${row.PersonID}')"></div>
                            <div class="seamless-row"><span class="seamless-label">อายุ:</span> <select class="seamless-input ex-age" onchange="triggerAutoSave('${row.PersonID}')">${ageOptions}</select></div>
                        </div>

                        <div class="crm-box box-system">
                            <div class="crm-section-title">📋 ข้อมูลระบบ</div>
                            <div class="seamless-row"><span class="seamless-label">รหัสสมาชิก:</span> <input type="text" class="seamless-input ex-abo" value="${row.ABO_Number || ''}" oninput="triggerAutoSave('${row.PersonID}')"></div>
                            <div class="seamless-row"><span class="seamless-label">วันเกิด:</span> <input type="date" class="seamless-input ex-dob" value="${row.DOB ? row.DOB.substring(0,10) : ''}" oninput="triggerAutoSave('${row.PersonID}')"></div>
                            <div class="seamless-row"><span class="seamless-label">หมดอายุ:</span> <input type="date" class="seamless-input ex-expire" value="${row.Expire_Date ? row.Expire_Date.substring(0,10) : ''}" oninput="triggerAutoSave('${row.PersonID}')"></div>
                        </div>

                        <div class="crm-box box-product">
                            <div class="crm-section-title">🛒 สินค้า</div>
                            <div class="skill-checklist ex-products-edit" id="prod-list-${row.PersonID}">${edProducts}</div>
                            <div class="add-tag-group">
                                <input type="text" id="add-prod-${row.PersonID}" class="e-input" style="flex:1; padding:6px; font-size:0.85rem; pointer-events:auto;" placeholder="+ พิมพ์ชื่อสินค้าเพิ่ม...">
                                <button class="btn btn-primary" style="padding:4px 12px; pointer-events:auto;" onclick="addCustomTag('${row.PersonID}', 'product')">เพิ่ม</button>
                            </div>
                        </div>

                        <div class="crm-box box-skill">
                            <div class="crm-section-title">🎓 ทักษะพื้นฐาน</div>
                            <div class="skill-checklist ex-skills-edit" id="skill-list-${row.PersonID}">${edSkills}</div>
                            <div class="add-tag-group">
                                <input type="text" id="add-skill-${row.PersonID}" class="e-input" style="flex:1; padding:6px; font-size:0.85rem; pointer-events:auto;" placeholder="+ พิมพ์ทักษะเพิ่ม...">
                                <button class="btn btn-primary" style="padding:4px 12px; pointer-events:auto;" onclick="addCustomTag('${row.PersonID}', 'skill')">เพิ่ม</button>
                            </div>
                        </div>

                        <div class="crm-box box-followup" style="background:#FEF3C7; border-color:#FDE047;">
                            <div class="crm-section-title" style="color:#A16207; border-bottom-color:#FCD34D;">🗓️ การติดตามผล</div>
                            <div class="seamless-row"><span class="seamless-label" style="color:#92400E;">วันเวลานัด:</span> <input type="datetime-local" class="seamless-input ex-appt-date" style="color:var(--primary);" value="${toLocalDatetimeInput(row.Next_Appt_Date)}" oninput="triggerAutoSave('${row.PersonID}')"></div>
                            <div class="seamless-row"><span class="seamless-label" style="color:#92400E;">เรื่องที่นัด:</span> <input type="text" class="seamless-input ex-appt-topic" value="${row.Next_Appt_Topic || ''}" oninput="triggerAutoSave('${row.PersonID}')"></div>
                            <div class="seamless-row" style="flex-direction:column; align-items:flex-start;"><span class="seamless-label" style="color:#92400E; margin-bottom:4px;">📌 Note สั้นๆ:</span> <input type="text" class="seamless-input ex-status-note" style="width:100%; text-align:left; font-weight:400;" value="${row.Status_Note || ''}" oninput="triggerAutoSave('${row.PersonID}')"></div>
                        </div>

                        <div class="crm-box box-farm">
                            <div class="crm-section-title">📊 วิเคราะห์ศักยภาพ</div>
                            <div class="seamless-row"><span class="seamless-label">M กำลังซื้อ</span> <div style="width:120px;">${generateRPGStarSelect(row.Score_Money||3, 'ex-score-m', row.PersonID)}</div></div>
                            <div class="seamless-row"><span class="seamless-label">F อัธยาศัย</span> <div style="width:120px;">${generateRPGStarSelect(row.Score_Friendly||3, 'ex-score-f', row.PersonID)}</div></div>
                            <div class="seamless-row"><span class="seamless-label">Au อำนาจ</span> <div style="width:120px;">${generateRPGStarSelect(row.Score_Authority||3, 'ex-score-au', row.PersonID)}</div></div>
                            <div class="seamless-row"><span class="seamless-label">A ขยัน</span> <div style="width:120px;">${generateRPGStarSelect(row.Score_Active||3, 'ex-score-a', row.PersonID)}</div></div>
                            <div class="seamless-row"><span class="seamless-label">N ปัญหา</span> <div style="width:120px;">${generateRPGStarSelect(row.Score_Need||3, 'ex-score-n', row.PersonID)}</div></div>
                            <div class="seamless-row"><span class="seamless-label">R สัมพันธ์</span> <div style="width:120px;">${generateRPGStarSelect(row.Score_Relation||3, 'ex-score-r', row.PersonID)}</div></div>
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
            trMain.classList.add('row-expanded');
            trDrawer.classList.add('open');
            if (trDrawer.querySelector('.drawer-container')) trDrawer.querySelector('.drawer-container').classList.add('drawer-expand');
            if (currentEditingId === currentExpandedId) trDrawer.classList.add('is-editing');
        }
    }
}

// -----------------------------------------
// 6. AUTO-SAVE & API ACTIONS
// -----------------------------------------
function updateSelectColor(el, kind, id) { 
    el.className = `colored-select ${kind === 'type' ? getTypeColorClass(el.value) : getStatusColorClass(el.value)}`; 
    triggerAutoSave(id); 
}

// 🌟 1. คลิกเพื่อเปลี่ยนสถานะ Tag สินค้า (เทา -> 🟡เหลือง -> ✅เขียว)
function toggleModalProduct(btn, id, e) { 
    if(e && e.target.classList.contains('tag-remove')) return; // ถ้ากดโดนปุ่ม X ไม่ต้องเปลี่ยนสี
    let s = btn.dataset.status; 
    let val = btn.dataset.value;
    let ic = val;
    if(s === 'none') { btn.dataset.status='interested'; btn.className='skill-tag status-yes'; ic='🟡 '+val; } 
    else if(s === 'interested') { btn.dataset.status='used'; btn.className='skill-tag status-teach'; ic='✅ '+val; } 
    else { btn.dataset.status='none'; btn.className='skill-tag'; ic=val; } 
    
    btn.innerHTML = `<span>${ic}</span> <span class="tag-remove" onclick="removeTag(this, '${id}', event)">✕</span>`;
    triggerAutoSave(id); 
}

// 🌟 2. คลิกเพื่อเปลี่ยนสถานะ Tag ทักษะ (เทา -> 🟡เหลือง -> ✅เขียว)
function toggleModalSkill(btn, id, e) { 
    if(e && e.target.classList.contains('tag-remove')) return; 
    let v = btn.dataset.val; 
    let skill = btn.dataset.skill;
    let ic = skill;
    if(v === 'no') { btn.dataset.val='yes'; btn.className='skill-tag status-yes'; ic='🟡 '+skill; } 
    else if(v === 'yes') { btn.dataset.val='teach'; btn.className='skill-tag status-teach'; ic='✅ '+skill; } 
    else { btn.dataset.val='no'; btn.className='skill-tag'; ic=skill; } 
    
    btn.innerHTML = `<span>${ic}</span> <span class="tag-remove" onclick="removeTag(this, '${id}', event)">✕</span>`;
    triggerAutoSave(id); 
}

// 🌟 3. ฟังก์ชันสำหรับลบ Tag ด้วยปุ่ม (X)
function removeTag(element, id, e) {
    e.stopPropagation(); // กันไม่ให้คำสั่งคลิกทะลุไปโดนตัว Tag
    element.closest('.skill-tag').remove(); // ลบ HTML ของ Tag นั้นทิ้ง
    triggerAutoSave(id);
}

// 🌟 4. ฟังก์ชันสำหรับเพิ่ม Tag ใหม่ที่ผู้ใช้พิมพ์เข้ามา
function addCustomTag(id, type) {
    const inputId = type === 'product' ? `add-prod-${id}` : `add-skill-${id}`;
    const inputEl = document.getElementById(inputId);
    const val = inputEl.value.trim();
    if(!val) return; // ถ้าไม่ได้พิมพ์อะไรให้หยุด

    const listId = type === 'product' ? `prod-list-${id}` : `skill-list-${id}`;
    const listEl = document.getElementById(listId);
    
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'skill-tag'; // เริ่มด้วยสีเทาเสมอ
    
    if (type === 'product') {
        btn.dataset.value = val;
        btn.dataset.status = 'none';
        btn.onclick = (e) => toggleModalProduct(btn, id, e);
    } else {
        btn.dataset.skill = val;
        btn.dataset.val = 'no';
        btn.onclick = (e) => toggleModalSkill(btn, id, e);
    }
    btn.innerHTML = `<span>${val}</span> <span class="tag-remove" onclick="removeTag(this, '${id}', event)">✕</span>`;
    
    listEl.appendChild(btn); // นำไปต่อท้ายกลุ่ม Tag
    inputEl.value = ''; // เคลียร์ช่องพิมพ์
    triggerAutoSave(id);
}

function triggerAutoSave(personID) { 
    const ind = document.getElementById(`status-${personID}`); 
    if (autoSaveTimers[personID]) clearTimeout(autoSaveTimers[personID]); 
    if(ind) ind.innerHTML = '⏳'; 
    autoSaveTimers[personID] = setTimeout(() => { executeAutoSave(personID); }, 1000); 
}

async function executeAutoSave(id) {
    const trMain = document.getElementById(`row-${id}`); 
    const trDrawer = document.getElementById(`drawer-${id}`);
    const ind = document.getElementById(`status-${id}`);
    
    if(ind) ind.innerHTML = '⏳';
    const person = contactsData.find(p => p.PersonID === id); 
    if (!person) return;
    
    const payloadData = { ...person };

    if (trMain) {
        const selects = trMain.querySelectorAll('.colored-select');
        if(selects[0]) payloadData.Contact_Type = selects[0].value;
        if(selects[1]) payloadData.Current_Status = selects[1].value;
        const mainDate = trMain.querySelector('input[type="datetime-local"]');
        if(mainDate) payloadData.Next_Appt_Date = mainDate.value;
    }
    
    if (trDrawer && trDrawer.classList.contains('is-editing')) {
        payloadData.Name = trDrawer.querySelector('.ex-name').value;
        payloadData.Phone = trDrawer.querySelector('.ex-phone').value;
        payloadData.Relation_Jogger = trDrawer.querySelector('.ex-rel').value;
        payloadData.Age = trDrawer.querySelector('.ex-age').value;
        
        payloadData.ABO_Number = trDrawer.querySelector('.ex-abo').value;
        payloadData.DOB = trDrawer.querySelector('.ex-dob').value;
        payloadData.Expire_Date = trDrawer.querySelector('.ex-expire').value;
        
        payloadData.Next_Appt_Date = trDrawer.querySelector('.ex-appt-date').value;
        payloadData.Next_Appt_Topic = trDrawer.querySelector('.ex-appt-topic').value;
        payloadData.Status_Note = trDrawer.querySelector('.ex-status-note').value;
        
        payloadData.Score_Money = trDrawer.querySelector('.ex-score-m').value;
        payloadData.Score_Friendly = trDrawer.querySelector('.ex-score-f').value;
        payloadData.Score_Authority = trDrawer.querySelector('.ex-score-au').value;
        payloadData.Score_Active = trDrawer.querySelector('.ex-score-a').value;
        payloadData.Score_Need = trDrawer.querySelector('.ex-score-n').value;
        payloadData.Score_Relation = trDrawer.querySelector('.ex-score-r').value;
        
        // 🌟 1. บันทึก Tag สินค้า (รวมอันที่พิมพ์เพิ่มเอง)
        let pArr = []; 
        trDrawer.querySelectorAll('.ex-products-edit .skill-tag').forEach(b => { 
            // เซฟทุก Tag ยกเว้นสินค้ามาตรฐานที่สถานะเป็น 'none' (สีเทา) เพื่อประหยัดพื้นที่ฐานข้อมูล
            if (b.dataset.status !== 'none' || !standardProducts.includes(b.dataset.value)) {
                pArr.push(`${b.dataset.value}:${b.dataset.status}`); 
            }
        });
        payloadData.Products_Status = pArr.join(',');
        
        // 🌟 2. บันทึก Tag ทักษะ (รวมอันที่พิมพ์เพิ่มเอง)
        let skObj = {}; 
        trDrawer.querySelectorAll('.ex-skills-edit .skill-tag').forEach(b => { 
            // เซฟทุกทักษะที่อยู่ในกล่อง
            skObj[b.dataset.skill] = b.dataset.val; 
        });
        payloadData.Personal_Skill = JSON.stringify(skObj);
        
        payloadData.Note = trDrawer.querySelector('.ex-note').value;
    }

    payloadData.Last_Update = new Date().toISOString();
    
    try {
        const response = await fetch(API_URL, { 
            method: 'POST', 
            body: JSON.stringify({ action: 'UPDATE', sheet: "Contacts_Master", id: id, data: payloadData }), 
            headers: { 'Content-Type': 'text/plain;charset=utf-8' } 
        });
        const result = await response.json();
        if (result.status === "success") {
            const index = contactsData.findIndex(p => p.PersonID === id); 
            if (index > -1) contactsData[index] = payloadData;
            localStorage.setItem('buzzGuideContacts', JSON.stringify(contactsData)); 
            
            if(ind) ind.innerHTML = '✅';
            setTimeout(() => { if(ind) ind.innerHTML = ''; }, 2000);
            updateDashboard();
        } else { 
            if(ind) ind.innerHTML = '❌'; 
        }
    } catch (error) { 
        if(ind) ind.innerHTML = '❌'; 
    }
}

// -----------------------------------------
// 7. MODALS & DELETE
// -----------------------------------------
function openAddModal() { 
    document.getElementById('addContactForm').reset(); 
    const m = document.getElementById('addContactModal'); 
    m.classList.add('open'); 
}
function closeAddModal() { 
    document.getElementById('addContactModal').classList.remove('open'); 
}

function showDeleteConfirm(id) { 
    document.querySelectorAll('.delete-confirm-box').forEach(el => el.style.display = 'none'); 
    document.getElementById(`del-confirm-${id}`).style.display = 'flex'; 
}
function hideDeleteConfirm(id) { 
    document.getElementById(`del-confirm-${id}`).style.display = 'none'; 
}

async function submitNewContact(e) { 
    e.preventDefault(); 
    const btn = document.getElementById('btnAddSubmit'); 
    btn.disabled = true; btn.innerText = 'กำลังซิงค์...'; 
    
    let maxId = 0; 
    contactsData.forEach(p => { 
        const num = parseInt((p.PersonID || '').replace('N', '')); 
        if (!isNaN(num) && num > maxId) maxId = num; 
    }); 
    const newId = 'N' + String(maxId + 1).padStart(4, '0'); 
    const now = new Date().toISOString(); 
    
    const newContact = { 
        PersonID: newId, 
        Name: document.getElementById('addName').value.trim(), 
        Phone: document.getElementById('addPhone').value.trim(), 
        Contact_Type: document.getElementById('addType').value, 
        Relation_Jogger: document.getElementById('addRelation').value.trim(), 
        Current_Status: 'ลิสต์รายชื่อ', 
        Score_Active: 3, Score_Friendly: 3, Score_Money: 3, Score_Relation: 3, Score_Authority: 3, Score_Need: 3, 
        Date_Added: now, Last_Update: now, isNewData: true 
    }; 
    
    try { 
        const response = await fetch(API_URL, { 
            method: 'POST', 
            body: JSON.stringify({ action: 'CREATE', sheet: "Contacts_Master", data: [newContact] }), 
            headers: { 'Content-Type': 'text/plain;charset=utf-8' } 
        }); 
        const result = await response.json(); 
        if (result.status === "success") { 
            contactsData.push(newContact); 
            localStorage.setItem('buzzGuideContacts', JSON.stringify(contactsData)); 
            setSort('update', 'desc'); 
            document.getElementById('searchInput').value = ''; 
            closeAddModal(); 
            updateDashboard();
        } else {
            alert('❌ บันทึกไม่สำเร็จ'); 
        }
    } catch (err) { 
        alert('❌ การเชื่อมต่อล้มเหลว'); 
    } finally { 
        btn.disabled = false; btn.innerText = 'บันทึกรายชื่อ'; 
    } 
}

function deleteContact(id) { 
    document.getElementById(`row-${id}`).style.opacity = '0.5'; 
    fetch(API_URL, { 
        method: 'POST', 
        body: JSON.stringify({ action: "DELETE", sheet: "Contacts_Master", id: id }), 
        headers: { 'Content-Type': 'text/plain;charset=utf-8' } 
    }).then(res => res.json()).then(r => { 
        if(r.status === "success") { 
            contactsData = contactsData.filter(p => p.PersonID !== id); 
            localStorage.setItem('buzzGuideContacts', JSON.stringify(contactsData)); 
            fetchContacts(); 
        } 
    }); 
}