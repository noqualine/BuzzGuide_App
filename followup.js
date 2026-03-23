// =========================================
// FOLLOWUP.JS - ระบบติดตามผล (ABO & Member)
// =========================================

const followupTemplate = `
    <div class="card" style="display: flex; flex-direction: column; height: 100%;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3>✅ ตารางติดตามผล (Follow Up Sheet)</h3>
            <div class="save-status-indicator status-idle" id="fuSaveStatus">☁️ Cloud Synced</div>
        </div>

        <div class="fu-sub-tabs">
            <button class="fu-tab-btn active" id="tabAbo" onclick="switchFuTab('abo')">💼 นักธุรกิจ (ABO & Sponsor)</button>
            <button class="fu-tab-btn" id="tabMem" onclick="switchFuTab('mem')">🏃 ลูกค้า & 6WNY (Member)</button>
        </div>

        <div id="fuAboSection" class="fu-table-wrapper">
            <table class="fu-table">
                <thead>
                    <tr>
                        <th class="sticky-col">ชื่อ - นามสกุล (ABO)</th>
                        <th>6WNY/Detox</th><th>Clean Food</th><th>Model 7-11</th><th>Biz Plan</th>
                        <th>Big Picture</th><th>House Brand</th><th>2 Yrs Retire</th><th>Biz Uniqueness</th>
                        <th>Artistry</th><th>eSpring</th><th>Atmosphere</th><th>Check-In</th><th>5 Steps</th>
                    </tr>
                </thead>
                <tbody id="fuAboBody"></tbody>
            </table>
        </div>

        <div id="fuMemSection" class="fu-table-wrapper" style="display: none;">
            <table class="fu-table">
                <thead>
                    <tr>
                        <th class="sticky-col">ชื่อ - นามสกุล (Member)</th>
                        <th>ก่อนเริ่ม (นน./สัดส่วน)</th><th>เริ่ม (ส่งโน้ต/สอนกิน)</th>
                        <th>Day 4</th><th>Day 7</th><th>Day 14 (Before/After)</th>
                        <th>Week 3</th><th>Week 4</th><th>Week 5</th><th>Week 6</th>
                    </tr>
                </thead>
                <tbody id="fuMemBody"></tbody>
            </table>
        </div>
    </div>
`;
document.getElementById('followup').innerHTML = followupTemplate;

// หัวข้อเช็คลิสต์ของแต่ละกลุ่ม
const aboTopics = ['6WNY', 'Clean Food', 'Model 7-11', 'Biz Plan', 'Big Picture', 'House Brand', '2 Yrs Retire', 'Uniqueness', 'Artistry', 'eSpring', 'Atmosphere', 'Check-In', '5 Steps'];
const memTopics = ['Before', 'Start', 'Day4', 'Day7', 'Day14', 'Week3', 'Week4', 'Week5', 'Week6'];

let fuSaveTimer = null;

// ฟังก์ชันสลับแท็บย่อยภายในหน้า Follow Up
function switchFuTab(tab) {
    document.getElementById('tabAbo').classList.remove('active'); 
    document.getElementById('tabMem').classList.remove('active');
    document.getElementById('fuAboSection').style.display = 'none'; 
    document.getElementById('fuMemSection').style.display = 'none';

    if (tab === 'abo') { 
        document.getElementById('tabAbo').classList.add('active'); 
        document.getElementById('fuAboSection').style.display = 'block'; 
    } else { 
        document.getElementById('tabMem').classList.add('active'); 
        document.getElementById('fuMemSection').style.display = 'block'; 
    }
    renderFollowUpTable(); // วาดตารางใหม่ทุกครั้งที่สลับแท็บ
}

// ฟังก์ชันวาดตารางและดึงรายชื่อมาใส่
function renderFollowUpTable() {
    const aboBody = document.getElementById('fuAboBody'); 
    const memBody = document.getElementById('fuMemBody');
    aboBody.innerHTML = ''; 
    memBody.innerHTML = '';

    // ถ้ายังไม่มีข้อมูลให้หยุดทำงานก่อน
    if (!contactsData || contactsData.length === 0) return;

    contactsData.forEach(person => {
        if (!person.Name) return;

        // ดึงข้อมูลเช็คลิสต์เก่าที่บันทึกไว้ใน Follow_Up_Data ออกมา
        let fuData = {}; 
        try { fuData = JSON.parse(person.Follow_Up_Data || "{}"); } catch (e) {}

        const tr = document.createElement('tr');
        let tds = `<td class="sticky-col" style="font-weight:500; color:var(--active-text);">${person.Name}</td>`;
        
        // แยกว่าคนนี้เป็น ABO หรือ ลูกค้า
        const isAbo = ['ABO', 'Sponsor List', 'Memory Jogger'].includes(person.Contact_Type);

        if (isAbo) {
            aboTopics.forEach(topic => {
                const isChecked = fuData[topic] ? 'checked' : ''; 
                const icon = isChecked ? '✔' : '';
                tds += `<td><button class="fu-check-btn ${isChecked}" onclick="toggleFuCheck(this, '${person.PersonID}', '${topic}')">${icon}</button></td>`;
            });
            tr.innerHTML = tds; 
            aboBody.appendChild(tr);
        } else {
            memTopics.forEach(topic => {
                const isChecked = fuData[topic] ? 'checked' : ''; 
                const icon = isChecked ? '✔' : '';
                tds += `<td><button class="fu-check-btn ${isChecked}" onclick="toggleFuCheck(this, '${person.PersonID}', '${topic}')">${icon}</button></td>`;
            });
            tr.innerHTML = tds; 
            memBody.appendChild(tr);
        }
    });
}

// ฟังก์ชันตอนกดติ๊กเช็คลิสต์
function toggleFuCheck(btn, personID, topic) {
    // สลับสีปุ่มบนหน้าจอ
    const isCurrentlyChecked = btn.classList.contains('checked');
    if (isCurrentlyChecked) { 
        btn.classList.remove('checked'); 
        btn.innerHTML = ''; 
    } else { 
        btn.classList.add('checked'); 
        btn.innerHTML = '✔'; 
    }

    // อัปเดตข้อมูลในหน่วยความจำ (contactsData)
    const personIndex = contactsData.findIndex(p => p.PersonID === personID);
    if (personIndex > -1) {
        let fuData = {}; 
        try { fuData = JSON.parse(contactsData[personIndex].Follow_Up_Data || "{}"); } catch (e) {}
        fuData[topic] = !isCurrentlyChecked; 
        contactsData[personIndex].Follow_Up_Data = JSON.stringify(fuData);
    }
    
    // แจ้งเตือนสถานะกำลังบันทึกและเรียก Auto-Save
    const indicator = document.getElementById('fuSaveStatus'); 
    indicator.className = 'save-status-indicator status-saving'; 
    indicator.innerHTML = '✍️...';
    
    if (fuSaveTimer) clearTimeout(fuSaveTimer); 
    fuSaveTimer = setTimeout(() => { executeFuSave(personID); }, 1500);
}

// ฟังก์ชันส่งข้อมูลขึ้น Google Sheets
async function executeFuSave(personID) {
    const indicator = document.getElementById('fuSaveStatus'); 
    indicator.innerHTML = '⏳ Syncing...';
    
    const person = contactsData.find(p => p.PersonID === personID); 
    if (!person) return;

    // เตรียมแพ็คเกจข้อมูลส่งไปเซฟ
    const payloadData = { 
        PersonID: personID, 
        Follow_Up_Data: person.Follow_Up_Data, 
        Last_Update: new Date().toISOString() 
    };

    try {
        const response = await fetch(API_URL, { 
            method: 'POST', 
            body: JSON.stringify({ action: 'UPDATE', sheet: "Contacts_Master", id: personID, data: payloadData }), 
            headers: { 'Content-Type': 'text/plain;charset=utf-8' } 
        });
        const result = await response.json();
        
        if (result.status === "success") { 
            indicator.className = 'save-status-indicator status-success'; 
            indicator.innerHTML = '✅ Saved'; 
            setTimeout(() => { 
                indicator.className = 'save-status-indicator status-idle'; 
                indicator.innerHTML = '☁️ Cloud Synced'; 
            }, 2000); 
        } else { 
            indicator.className = 'save-status-indicator status-error'; 
            indicator.innerHTML = '❌ Failed'; 
        }
    } catch (error) { 
        indicator.className = 'save-status-indicator status-error'; 
        indicator.innerHTML = '❌ Error'; 
    }
}

// ดักจับเวลาผู้ใช้คลิกแท็บ "ติดตามผล (Follow Up)" ให้ระบบวาดตารางใหม่เสมอ
if(window.originalSwitchTab) {
    window.switchTab = function(tabId, btn) {
        window.originalSwitchTab(tabId, btn);
        if (tabId === 'followup') {
            renderFollowUpTable();
        }
    };
}