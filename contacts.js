// =========================================
// CONTACTS.JS - ระบบฐานข้อมูลรายชื่อ
// =========================================

// 1. นำโครงสร้าง HTML ใส่ในหน้าจอ
const contactsTemplate = `
    <div id="statsHoverCard" class="stats-hover-card"></div>
    <div id="checklistHoverCard" class="checklist-hover-card"></div>

    <div class="card contacts-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-shrink: 0; flex-wrap: wrap; gap: 1rem;">
            <h3>👥 ฐานข้อมูลรายชื่อ (Contacts Master)</h3>
            <button class="btn-main" onclick="openBulkModal()">+ เพิ่มรายชื่อใหม่</button>
        </div>

        <div class="filter-bar">
            <input type="text" id="searchInput" placeholder="🔍 ค้นหาชื่อ, เบอร์โทร..." onkeyup="filterTable()">
            <select id="typeFilter" onchange="filterTable()">
                <option value="ALL">📋 ทุกประเภท (All Types)</option>
                <option value="Memory Jogger">Memory Jogger</option>
                <option value="Sponsor List">Sponsor List</option>
                <option value="Customer List">Customer List</option>
                <option value="ABO">ABO</option>
                <option value="MEM">MEM</option>
            </select>
            <select id="statusFilter" onchange="filterTable()">
                <option value="ALL">📌 ทุกสถานะ (All Status)</option>
                <option value="ลิสต์รายชื่อ">ลิสต์รายชื่อ</option>
                <option value="กำลังติดต่อ">กำลังติดต่อ</option>
                <option value="นัดหมายแล้ว">นัดหมายแล้ว</option>
                <option value="นำเสนอแล้ว">นำเสนอแล้ว</option>
                <option value="ติดตามผล">ติดตามผล</option>
                <option value="ซื้อสินค้า/สมัครแล้ว">ซื้อสินค้า/สมัครแล้ว</option>
                <option value="ปฏิเสธ">ปฏิเสธ</option>
            </select>
        </div>

        <div class="table-container">
            <table id="contactsTable">
                <thead>
                    <tr>
                        <th class="col-id">หมายเลข</th>
                        <th class="col-name">ชื่อ - นามสกุล</th>
                        <th class="col-age">อายุ</th>
                        <th class="col-type">ประเภท</th>
                        <th class="col-rel">สายสัมพันธ์</th>
                        <th class="col-score">คะแนนเฉลี่ย</th>
                        <th class="col-status">สถานะปัจจุบัน</th>
                        <th class="col-update">อัปเดตล่าสุด</th>
                        <th class="col-action" style="width: 80px; text-align: center;">สถานะ</th>
                    </tr>
                </thead>
                <tbody id="contactsTableBody"></tbody>
            </table>
        </div>
    </div>

    <div class="modal-overlay" id="bulkModal">
        <div class="modal-content">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3 id="modalTitle">➕ เพิ่มรายชื่อใหม่ (หลายรายการ)</h3>
                <div class="toolbar-group">
                    <button class="btn-outline" type="button" onclick="downloadCSVTemplate()">📥 โหลดตัวอย่าง CSV</button>
                    <input type="file" id="csvFileInput" accept=".csv" style="display: none;" onchange="handleCSV(event)">
                    <button class="btn-outline" type="button" onclick="document.getElementById('csvFileInput').click()">📂 อัปโหลดไฟล์ CSV</button>
                    <button class="btn-success" type="button" onclick="togglePasteArea()">📝 วางข้อความ (Paste Data)</button>
                </div>
            </div>
            <div id="pasteCsvArea" style="display: none; margin-bottom: 1.5rem; background: var(--th-bg); padding: 1rem; border-radius: 8px; border: 1px dashed var(--border-color);">
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">คัดลอกข้อมูลจากตาราง Excel แล้วนำมาวางในช่องด้านล่าง (คอลัมน์: ชื่อ, ประเภท, เบอร์โทร, สถานะ, A, F, M)</p>
                <textarea id="csvRawText" rows="4" style="width: 100%; padding: 0.5rem; border-radius: 6px; border: 1px solid var(--border-color); font-family: inherit; background: var(--card-bg); color: var(--text-main);" placeholder="สมชาย,Memory Jogger,0812345678,ลิสต์รายชื่อ,4,4,3"></textarea>
                <div style="text-align: right; margin-top: 0.5rem;"><button type="button" class="btn-main" onclick="importFromRawText()">⬇️ นำเข้าข้อมูล</button></div>
            </div>
            <form id="bulkForm" onsubmit="submitBulkForm(event)">
                <input type="hidden" id="formAction" value="CREATE">
                <div style="overflow-x: auto; margin-bottom: 1rem; max-height: 40vh;">
                    <table class="bulk-table">
                        <thead><tr><th style="min-width: 150px;">ชื่อ - นามสกุล*</th><th style="min-width: 130px;">ประเภท*</th><th style="min-width: 110px;">เบอร์โทร</th><th style="min-width: 140px;">สถานะ*</th><th>A</th><th>F</th><th>M</th><th style="min-width: 50px;">ลบ</th></tr></thead>
                        <tbody id="bulkInputBody"></tbody>
                    </table>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 1rem;">
                    <button type="button" class="btn-outline" onclick="addBulkRow()">+ เพิ่มแถวใหม่</button>
                    <div style="display: flex; gap: 1rem;">
                        <button type="button" class="btn-outline" style="color: var(--text-muted); border-color: var(--text-muted);" onclick="closeModal()">ยกเลิก</button>
                        <button type="submit" class="btn-main" id="submitBtn">บันทึกข้อมูล</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
`;
document.getElementById('contacts').innerHTML = contactsTemplate;

// 2. ตัวแปรและการประมวลผล
let contactsData = [];
const statusOptions = [ "ลิสต์รายชื่อ", "กำลังติดต่อ", "นัดหมายแล้ว", "นำเสนอแล้ว", "ติดตามผล", "ซื้อสินค้า/สมัครแล้ว", "ปฏิเสธ" ];
let autoSaveTimers = {};
let hoverTimer = null;

// Helpers ย่อยสำหรับ Contacts
function renderEmojiStars(score) { let s = parseInt(score) || 1; return '⭐'.repeat(s); }
function isChecked(productsString, item) { if(!productsString) return false; return productsString.split(',').map(s => s.trim()).includes(item); }

function getTypeColorClass(type) { switch(type) { case 'Memory Jogger': return 'type-jogger'; case 'Sponsor List': return 'type-sponsor'; case 'Customer List': return 'type-customer'; case 'ABO': return 'type-abo'; case 'MEM': return 'type-mem'; default: return 'type-jogger'; } }
function getStatusColorClass(status) { switch(status) { case 'ลิสต์รายชื่อ': return 'status-list'; case 'กำลังติดต่อ': return 'status-contacting'; case 'นัดหมายแล้ว': return 'status-appointed'; case 'นำเสนอแล้ว': return 'status-presented'; case 'ติดตามผล': return 'status-followup'; case 'ซื้อสินค้า/สมัครแล้ว': return 'status-success'; case 'ปฏิเสธ': return 'status-rejected'; default: return 'status-list'; } }

function updateSelectColor(el, kind, personID) {
    el.className = `inline-input colored-select ${kind === 'type' ? 'r-type' : 'r-status'}`;
    if(kind === 'type') el.classList.add(getTypeColorClass(el.value));
    if(kind === 'status') {
        el.classList.add(getStatusColorClass(el.value));
        const dateContainer = document.getElementById(`row-${personID}`).querySelector('.last-update-text');
        dateContainer.innerHTML = `📅 ${formatDateTime(new Date().toISOString())} (บันทึก...)`;
        dateContainer.style.color = 'var(--warning)';
    }
    triggerAutoSave(personID);
}

function generateStatusDropdownHTML(selectedValue, personID) {
    let options = `<option value="">-- สถานะ --</option>`;
    statusOptions.forEach(opt => { options += `<option value="${opt}" ${selectedValue === opt ? 'selected' : ''}>${opt}</option>`; });
    if(selectedValue && !statusOptions.includes(selectedValue)) options += `<option value="${selectedValue}" selected>${selectedValue}</option>`;
    return `<select class="inline-input r-status colored-select ${getStatusColorClass(selectedValue)}" onchange="updateSelectColor(this, 'status', '${personID}'); event.stopPropagation();">${options}</select>`;
}
function generateTypeDropdownHTML(selectedValue, personID) {
    const types = ['Memory Jogger', 'Sponsor List', 'Customer List', 'ABO', 'MEM'];
    let options = ''; types.forEach(opt => { options += `<option value="${opt}" ${selectedValue === opt ? 'selected' : ''}>${opt}</option>`; });
    return `<select class="inline-input r-type colored-select ${getTypeColorClass(selectedValue)}" onchange="updateSelectColor(this, 'type', '${personID}'); event.stopPropagation();">${options}</select>`;
}
function generateRPGStarSelect(val, className, personID) {
    let options = ''; for(let i=1; i<=5; i++) { options += `<option value="${i}" ${val == i ? 'selected' : ''}>${'⭐'.repeat(i)}</option>`; }
    return `<select class="rpg-star-select ${className}" onchange="triggerAutoSave('${personID}')">${options}</select>`;
}

function toggleProductStatus(btn, personID) {
    if (btn.classList.contains('status-used')) { btn.classList.remove('status-used'); btn.dataset.status = 'none'; } 
    else if (btn.classList.contains('status-interested')) { btn.classList.remove('status-interested'); btn.classList.add('status-used'); btn.dataset.status = 'used'; } 
    else { btn.classList.add('status-interested'); btn.dataset.status = 'interested'; }
    triggerAutoSave(personID);
}
function getProductStatus(productsString, itemName) {
    if (!productsString) return 'none'; const items = productsString.split(',');
    for (let i = 0; i < items.length; i++) { const [name, status] = items[i].split(':'); if (name.trim() === itemName) return status ? status.trim() : 'used'; }
    return 'none';
}

// Hover Cards
function showStatsCard(event, id) {
    const card = document.getElementById('statsHoverCard'); const person = contactsData.find(p => p.PersonID === id); if(!person) return;
    card.innerHTML = `<div class="sh-header">📊 วิเคราะห์ศักยภาพ</div><div class="sh-row"><span class="sh-label">A (Active)</span> <span class="sh-stars">${renderEmojiStars(person.Score_Active || 3)}</span></div><div class="sh-row"><span class="sh-label">F (Friendly)</span> <span class="sh-stars">${renderEmojiStars(person.Score_Friendly || 3)}</span></div><div class="sh-row"><span class="sh-label">M (Money)</span> <span class="sh-stars">${renderEmojiStars(person.Score_Money || 3)}</span></div><div class="sh-row"><span class="sh-label">R (Relation)</span> <span class="sh-stars">${renderEmojiStars(person.Score_Relation || 3)}</span></div>`;
    card.style.display = 'block'; const rect = event.target.getBoundingClientRect(); const cardRect = card.getBoundingClientRect();
    let topPos = rect.bottom + 8; let leftPos = rect.left - (cardRect.width / 2) + (rect.width / 2);
    if (topPos + cardRect.height > window.innerHeight) topPos = rect.top - cardRect.height - 8;
    card.style.top = topPos + 'px'; card.style.left = leftPos + 'px';
}
function hideStatsCard() { document.getElementById('statsHoverCard').style.display = 'none'; }

function handleNameHover(event, id) {
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => {
        const card = document.getElementById('checklistHoverCard'); const person = contactsData.find(p => p.PersonID === id); if(!person) return;
        let itemsHTML = ''; const pList = (person.Products_Used || '').split(',').filter(i => i.trim() !== '');
        if (pList.length === 0) itemsHTML = '<div class="ch-empty">ยังไม่มีข้อมูลสินค้า</div>';
        else pList.forEach(item => { const [name, status] = item.split(':'); itemsHTML += `<div class="ch-item ${status || 'used'}">${name}</div>`; });
        card.innerHTML = `<div class="ch-header">🛒 เช็คลิสต์สินค้า</div>${itemsHTML}`; card.style.display = 'block';
        const rect = event.target.getBoundingClientRect(); const cardRect = card.getBoundingClientRect();
        let topPos = rect.bottom + 8; let leftPos = rect.left; if (topPos + cardRect.height > window.innerHeight) topPos = rect.top - cardRect.height - 8;
        card.style.top = topPos + 'px'; card.style.left = leftPos + 'px';
    }, 800);
}
function clearNameHover() { clearTimeout(hoverTimer); document.getElementById('checklistHoverCard').style.display = 'none'; }

// Fetch & Render
async function fetchContacts() {
    const tbody = document.getElementById('contactsTableBody');
    if(!tbody) return; 
    tbody.innerHTML = `<tr><td colspan="9" class="loader">กำลังโหลดข้อมูล...</td></tr>`;
    try {
        const response = await fetch(`${API_URL}?sheet=Contacts_Master`);
        const result = await response.json();
        if (result.status === "success") { contactsData = result.data; renderTable(); }
    } catch (error) { tbody.innerHTML = `<tr><td colspan="9" style="color:red; text-align:center;">เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>`; }
}

function filterTable() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const typeFilter = document.getElementById('typeFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    document.querySelectorAll('#contactsTableBody tr.main-row').forEach(tr => {
        const nameStr = tr.getAttribute('data-name') || '';
        const phoneStr = tr.nextElementSibling.querySelector('.ex-phone').value.toLowerCase() || '';
        const typeStr = tr.getAttribute('data-type') || '';
        const statusStr = tr.querySelector('.r-status').value || '';
        
        if ((nameStr.includes(searchText) || phoneStr.includes(searchText)) && 
            (typeFilter === 'ALL' || typeStr === typeFilter) && 
            (statusFilter === 'ALL' || statusStr === statusFilter)) {
            tr.style.display = ''; if (tr.classList.contains('row-expanded')) tr.nextElementSibling.style.display = 'table-row';
        } else { tr.style.display = 'none'; tr.nextElementSibling.style.display = 'none'; }
    });
}

function renderTable() {
    const tbody = document.getElementById('contactsTableBody'); tbody.innerHTML = '';
    if (contactsData.length === 0) { tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:var(--text-muted); padding: 2rem;">ยังไม่มีรายชื่อในระบบ</td></tr>`; return; }
    const productList = ['Breakfast Set', 'eSpring', 'Atmosphere Sky', 'Atmosphere Drive', 'Spa', '6WNY / Detox', 'Workshop'];

    contactsData.forEach(row => {
        if(!row.Name) return; 
        const trMain = document.createElement('tr'); trMain.id = `row-${row.PersonID}`; trMain.className = 'main-row';
        trMain.setAttribute('data-name', row.Name.toLowerCase()); trMain.setAttribute('data-type', row.Contact_Type);
        trMain.onclick = () => toggleExpandRow(row.PersonID);
        
        const avgScore = ((parseInt(row.Score_Active||3) + parseInt(row.Score_Friendly||3) + parseInt(row.Score_Money||3) + parseInt(row.Score_Relation||3)) / 4).toFixed(1);

        trMain.innerHTML = `
            <td class="col-id">${row.PersonID}</td>
            <td class="col-name"><input type="text" class="inline-input r-name name-text" value="${row.Name}" onclick="event.stopPropagation();" onmouseenter="handleNameHover(event, '${row.PersonID}')" onmouseleave="clearNameHover()" oninput="triggerAutoSave('${row.PersonID}')" autocomplete="off"></td>
            <td class="col-age"><input type="number" class="inline-input r-age" value="${row.Age || ''}" style="text-align: center;" onclick="event.stopPropagation();" oninput="triggerAutoSave('${row.PersonID}')"></td>
            <td class="col-type"><div onclick="event.stopPropagation();">${generateTypeDropdownHTML(row.Contact_Type, row.PersonID)}</div></td>
            <td class="col-rel"><input type="text" class="inline-input r-rel" value="${row.Relation_Jogger || ''}" onclick="event.stopPropagation();" oninput="triggerAutoSave('${row.PersonID}')"></td>
            <td class="col-score"><div class="score-hover-target" onmouseenter="showStatsCard(event, '${row.PersonID}')" onmouseleave="hideStatsCard()"><span style="font-weight: 600; color: #F59E0B; font-size: 0.95rem;">⭐ ${avgScore}</span></div></td>
            <td class="col-status"><div onclick="event.stopPropagation();">${generateStatusDropdownHTML(row.Current_Status, row.PersonID)}</div></td>
            <td class="col-update"><div class="last-update-text">📅 ${formatDateTime(row.Last_Update)}</div></td>
            <td class="col-action"><div class="save-status-indicator status-idle" id="status-${row.PersonID}">☁️</div></td>
        `;
        tbody.appendChild(trMain);

        const pStr = row.Products_Used || ''; let productsHTML = '';
        productList.forEach(item => {
            const status = getProductStatus(pStr, item);
            let btnClass = 'product-toggle-btn' + (status === 'interested' ? ' status-interested' : (status === 'used' ? ' status-used' : ''));
            const styleStr = item === 'Workshop' ? 'grid-column: span 3;' : '';
            productsHTML += `<button type="button" class="${btnClass}" style="${styleStr}" data-value="${item}" data-status="${status}" onclick="toggleProductStatus(this, '${row.PersonID}')">${item}</button>`;
        });

        const trDrawer = document.createElement('tr'); trDrawer.id = `drawer-${row.PersonID}`; trDrawer.className = 'expanded-row';
        trDrawer.innerHTML = `
            <td colspan="9" style="padding: 0; border: none;">
                <div class="expanded-content">
                    <div class="drawer-layout">
                        <div class="drawer-left">
                            <div class="e-group"><label class="e-label">ABO #</label><input type="text" class="e-input ex-abo" value="${row.ABO_Number || ''}" oninput="triggerAutoSave('${row.PersonID}')"></div>
                            <div class="e-group"><label class="e-label">EXPIRED</label><input type="date" class="e-input ex-expire" value="${row.Expire_Date ? row.Expire_Date.substring(0,10) : ''}" oninput="triggerAutoSave('${row.PersonID}')"></div>
                            <div class="e-group"><label class="e-label">ID</label><input type="text" class="e-input" value="${row.PersonID}" disabled style="background:var(--bg-color);"></div>
                            <div class="e-group"><label class="e-label">DOB (DD/MM/YY)</label><input type="date" class="e-input ex-dob" value="${row.DOB ? row.DOB.substring(0,10) : ''}" oninput="triggerAutoSave('${row.PersonID}')"></div>
                            <div class="e-group"><label class="e-label">Tel</label><input type="text" class="e-input ex-phone" value="${row.Phone || ''}" oninput="triggerAutoSave('${row.PersonID}')"></div>
                            <div class="e-group"><label class="e-label">Mail</label><input type="email" class="e-input ex-email" value="${row.Email || ''}" oninput="triggerAutoSave('${row.PersonID}')"></div>
                            <div class="e-group dl-full"><label class="e-label">Address</label><input type="text" class="e-input ex-address" value="${row.Address || ''}" placeholder="ที่อยู่จัดส่ง..." oninput="triggerAutoSave('${row.PersonID}')"></div>
                            <div class="e-group dl-full" style="margin-top: 0.5rem;">
                                <label class="e-label">📊 วิเคราะห์ศักยภาพ (STATS) <span class="info-hint" title="A = กระตือรือร้น (Active)&#10;F = มนุษยสัมพันธ์ (Friendly)&#10;M = กำลังซื้อ (Money)&#10;R = ความสนิทสนม (Relation)">ℹ️</span></label>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; margin-bottom: 0.8rem;">
                                    <div class="rpg-stat-group"><span class="rpg-stat-label">A</span>${generateRPGStarSelect(row.Score_Active||3, 'ex-score-a', row.PersonID)}</div>
                                    <div class="rpg-stat-group"><span class="rpg-stat-label">F</span>${generateRPGStarSelect(row.Score_Friendly||3, 'ex-score-f', row.PersonID)}</div>
                                    <div class="rpg-stat-group"><span class="rpg-stat-label">M</span>${generateRPGStarSelect(row.Score_Money||3, 'ex-score-m', row.PersonID)}</div>
                                    <div class="rpg-stat-group"><span class="rpg-stat-label">R</span>${generateRPGStarSelect(row.Score_Relation||3, 'ex-score-r', row.PersonID)}</div>
                                </div>
                            </div>
                        </div>
                        <div class="drawer-right">
                            <label class="e-label">🛒 เช็คลิสต์สินค้า (คลิก 1=สนใจ, คลิก 2=ใช้แล้ว)</label>
                            <div class="d-checklist ex-products">${productsHTML}</div>
                            <label class="e-label">NOTE:</label>
                            <textarea class="e-input ex-note" style="height: 100%; min-height: 150px;" oninput="triggerAutoSave('${row.PersonID}')">${row.Note || ''}</textarea>
                        </div>
                    </div>
                    <div class="e-footer"><div style="display: flex; justify-content: flex-end; width: 100%;"><button class="btn-danger" onclick="deleteContact('${row.PersonID}')">🗑️ ลบรายชื่อ</button></div></div>
                </div>
            </td>
        `;
        tbody.appendChild(trDrawer);
    });
    filterTable();
}

function toggleExpandRow(id) {
    const trMain = document.getElementById(`row-${id}`); const trDrawer = document.getElementById(`drawer-${id}`);
    if (trMain.classList.contains('row-expanded')) { trMain.classList.remove('row-expanded'); trDrawer.classList.remove('open'); } 
    else {
        document.querySelectorAll('.row-expanded').forEach(r => r.classList.remove('row-expanded'));
        document.querySelectorAll('.expanded-row.open').forEach(r => r.classList.remove('open'));
        trMain.classList.add('row-expanded'); trDrawer.classList.add('open');
    }
}

// Auto-Save
function triggerAutoSave(personID) {
    const statusIndicator = document.getElementById(`status-${personID}`);
    if (autoSaveTimers[personID]) clearTimeout(autoSaveTimers[personID]);
    statusIndicator.className = 'save-status-indicator status-saving'; statusIndicator.innerHTML = '✍️...';
    autoSaveTimers[personID] = setTimeout(() => { executeAutoSave(personID); }, 1500);
}

async function executeAutoSave(id) {
    const trMain = document.getElementById(`row-${id}`); const trDrawer = document.getElementById(`drawer-${id}`);
    const statusIndicator = document.getElementById(`status-${id}`); statusIndicator.innerHTML = '⏳';
    
    const person = contactsData.find(p => p.PersonID === id);
    let selectedProducts = [];
    trDrawer.querySelectorAll('.ex-products .product-toggle-btn').forEach(btn => { if (btn.dataset.status !== 'none') selectedProducts.push(`${btn.dataset.value}:${btn.dataset.status}`); });

    const currentStatus = trMain.querySelector('.r-status').value;
    let finalUpdateDate = person.Last_Update;
    if (currentStatus !== person.Current_Status) finalUpdateDate = new Date().toISOString();

    const payloadData = {
        PersonID: id, Name: trMain.querySelector('.r-name').value, Age: trMain.querySelector('.r-age').value,
        Contact_Type: trMain.querySelector('.r-type').value, Relation_Jogger: trMain.querySelector('.r-rel').value, Current_Status: currentStatus,
        Score_Active: trDrawer.querySelector('.ex-score-a').value, Score_Friendly: trDrawer.querySelector('.ex-score-f').value,
        Score_Money: trDrawer.querySelector('.ex-score-m').value, Score_Relation: trDrawer.querySelector('.ex-score-r').value,
        ABO_Number: trDrawer.querySelector('.ex-abo').value, Expire_Date: trDrawer.querySelector('.ex-expire').value,
        DOB: trDrawer.querySelector('.ex-dob').value, Phone: trDrawer.querySelector('.ex-phone').value,
        Email: trDrawer.querySelector('.ex-email').value, Address: trDrawer.querySelector('.ex-address').value,
        Note: trDrawer.querySelector('.ex-note').value, Products_Used: selectedProducts.join(','), Last_Update: finalUpdateDate
    };

    try {
        const response = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'UPDATE', sheet: "Contacts_Master", id: id, data: payloadData }), headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
        const result = await response.json();
        if (result.status === "success") {
            const index = contactsData.findIndex(p => p.PersonID === id); if (index > -1) contactsData[index] = payloadData;
            statusIndicator.className = 'save-status-indicator status-success'; statusIndicator.innerHTML = '✅';
            const avgScore = ((parseInt(payloadData.Score_Active) + parseInt(payloadData.Score_Friendly) + parseInt(payloadData.Score_Money) + parseInt(payloadData.Score_Relation)) / 4).toFixed(1);
            trMain.querySelector('.col-score span').innerText = `⭐ ${avgScore}`;
            trMain.querySelector('.last-update-text').innerHTML = `📅 ${formatDateTime(payloadData.Last_Update)}`;
            trMain.querySelector('.last-update-text').style.color = 'var(--text-muted)';
            setTimeout(() => { statusIndicator.className = 'save-status-indicator status-idle'; statusIndicator.innerHTML = '☁️'; }, 2000);
        } else { statusIndicator.className = 'save-status-indicator status-error'; statusIndicator.innerHTML = '❌'; }
    } catch (error) { statusIndicator.className = 'save-status-indicator status-error'; statusIndicator.innerHTML = '❌'; }
}

function deleteContact(id) {
    if(!confirm('ลบรายชื่อนี้?')) return;
    document.getElementById(`row-${id}`).style.opacity = '0.5';
    fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: "DELETE", sheet: "Contacts_Master", id: id }), headers: { 'Content-Type': 'text/plain;charset=utf-8' } })
    .then(res => res.json()).then(r => { if(r.status === "success") fetchContacts(); });
}

// Bulk Add System
function downloadCSVTemplate() {
    const csvData = "\uFEFFName,Contact_Type,Phone,Current_Status,Score_Active,Score_Friendly,Score_Money\nสมชาย,Memory Jogger,0812345678,ลิสต์รายชื่อ,4,4,3";
    const link = document.createElement("a"); link.setAttribute("href", URL.createObjectURL(new Blob([csvData], { type: 'text/csv;charset=utf-8;' }))); link.setAttribute("download", "Template.csv");
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
}
function togglePasteArea() { const area = document.getElementById('pasteCsvArea'); area.style.display = area.style.display === 'none' ? 'block' : 'none'; }
function processCSVText(text) {
    const lines = text.split('\n'); let addedCount = 0; let startIdx = (lines[0].toLowerCase().includes('name') || lines[0].toLowerCase().includes('type')) ? 1 : 0;
    for (let i = startIdx; i < lines.length; i++) {
        if(!lines[i].trim()) continue; const cols = lines[i].split(lines[i].includes('\t') ? '\t' : ',');
        addBulkRow({ Name: cols[0]?.trim(), Contact_Type: cols[1]?.trim() || 'Memory Jogger', Phone: cols[2]?.trim(), Current_Status: cols[3]?.trim() || 'ลิสต์รายชื่อ', Score_Active: cols[4]?.trim() || '3', Score_Friendly: cols[5]?.trim() || '3', Score_Money: cols[6]?.trim() || '3' });
        addedCount++;
    }
    alert(`โหลดสำเร็จ ${addedCount} รายการ`);
}
function importFromRawText() { const text = document.getElementById('csvRawText').value; if(!text.trim()) return; processCSVText(text); document.getElementById('csvRawText').value = ''; togglePasteArea(); }
function handleCSV(event) { const file = event.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = function(e) { processCSVText(e.target.result); }; reader.readAsText(file); event.target.value = ''; }
function openBulkModal() { document.getElementById('bulkModal').style.display = 'flex'; document.getElementById('formAction').value = 'CREATE'; document.getElementById('bulkInputBody').innerHTML = ''; addBulkRow(); }
function closeModal() { document.getElementById('bulkModal').style.display = 'none'; }
function addBulkRow(data = {}, allowDelete = true) {
    const tbody = document.getElementById('bulkInputBody'); const tr = document.createElement('tr');
    tr.innerHTML = `<input type="hidden" class="r-id" value=""><td><input type="text" class="r-name" value="${data.Name || ''}" required></td><td><select class="r-type"><option value="Memory Jogger">Memory Jogger</option><option value="Sponsor List">Sponsor List</option><option value="Customer List">Customer List</option><option value="ABO">ABO</option><option value="MEM">MEM</option></select></td><td><input type="text" class="r-phone" value="${data.Phone || ''}"></td><td>${generateStatusDropdownHTML('ลิสต์รายชื่อ', 'bulk').replace(/onchange="[^"]*"/, '')}</td><td><select class="r-a"><option value="1">1</option><option value="2">2</option><option value="3" selected>3</option><option value="4">4</option><option value="5">5</option></select></td><td><select class="r-f"><option value="1">1</option><option value="2">2</option><option value="3" selected>3</option><option value="4">4</option><option value="5">5</option></select></td><td><select class="r-m"><option value="1">1</option><option value="2">2</option><option value="3" selected>3</option><option value="4">4</option><option value="5">5</option></select></td><td style="display: ${allowDelete ? 'table-cell' : 'none'}; text-align:center;"><button type="button" class="btn-danger" onclick="this.closest('tr').remove()">X</button></td>`;
    tbody.appendChild(tr);
}

async function submitBulkForm(e) {
    e.preventDefault(); const rows = document.querySelectorAll('#bulkInputBody tr'); if(rows.length === 0) return;
    const currentTime = new Date().toISOString(); let payloadData = []; let nextIdNum = parseInt(generateShortID(contactsData).replace('N', ''));
    for(let tr of rows) {
        const name = tr.querySelector('.r-name').value.trim(); if(!name) continue;
        payloadData.push({ PersonID: 'N' + String(nextIdNum++).padStart(4, '0'), Name: name, Contact_Type: tr.querySelector('.r-type').value, Phone: tr.querySelector('.r-phone').value, Current_Status: tr.querySelector('.r-status').value, Score_Active: tr.querySelector('.r-a').value, Score_Friendly: tr.querySelector('.r-f').value, Score_Money: tr.querySelector('.r-m').value, Last_Update: currentTime });
    }
    document.getElementById('submitBtn').disabled = true;
    try {
        const response = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'CREATE', sheet: "Contacts_Master", id: null, data: payloadData }), headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
        const result = await response.json(); if (result.status === "success") { closeModal(); fetchContacts(); } 
    } catch (error) {} finally { document.getElementById('submitBtn').disabled = false; }
}

// โหลดข้อมูลรายชื่อทันที
fetchContacts();
