// ==========================================
// 📘 Buzz Guide Component (V12.1 - Full Sections & Theme Adaptive Wizard)
// ==========================================

// 🌟 ตัวแปรเก็บสถานะของ Wizard
let tempWizardContacts = [];
let currentWizardStep = 1;
let currentWizardGroup = '';
let currentWizardIcon = '';

// 🌟 ข้อมูลหมวดหมู่และ Sub-categories
const joggerCategories = {
    'RELATIVES': { icon: '👨‍👩‍👧‍👦', title: 'WHO ARE YOUR RELATIVES', titleTh: '(ครอบครัว & ญาติพี่น้อง)', 
        subs: ['Parents (พ่อ-แม่)', 'Grandparents (ปู่ ย่า ตา ยาย)', 'Brother / Sisters (พี่ น้อง)', 'Aunts / Uncles (ลุง ป้า น้า อา)', 'Cousins (ลูกพี่ลูกน้อง)', 'Children (ลูก หลาน)'] },
    'FRIENDS': { icon: '🎓', title: 'WHO ARE YOUR FRIENDS', titleTh: '(เพื่อนวัยเรียน & ทำงาน)', 
        subs: ['Primary School (ประถม)', 'High School (มัธยม)', 'University (มหาลัย)', 'Previous Job (ที่ทำงานเก่า)', 'Current Job (ที่ทำงานปัจจุบัน)'] },
    'PLACES': { icon: '☕', title: 'WHO ARE OUR...', titleTh: '(ร้านประจำ & บริการที่ใช้)', 
        subs: ['Restaurants/Cafe (ร้านอาหาร/กาแฟ)', 'Hair Salon (ช่างผม/เสริมสวย)', 'Clinic/Doctor (คลินิก/หมอ)', 'Car Service (ซ่อมรถ/ล้างรถ)', 'Laundry/Maid (ซักรีด/แม่บ้าน)'] },
    'LIFESTYLE': { icon: '🏃‍♂️', title: 'SOMEONE WHO...', titleTh: '(คนรู้จักที่มีไลฟ์สไตล์...)', 
        subs: ['Gym/Sports (ยิม/กีฬา)', 'Hobbies/Music (งานอดิเรก/ดนตรี)', 'Party (ปาร์ตี้/สังสรรค์)', 'Religion/Merit (สายบุญ/ศาสนา)', 'Seminar (คอร์สเรียน/สัมมนา)'] },
    'CUSTOMERS': { icon: '🛍️', title: 'WHO SOLD US OUR...', titleTh: '(คนที่เราเป็นลูกค้าของเขา)', 
        subs: ['Car Sales (เซลล์ขายรถ)', 'Agent/Landlord (นายหน้า/เจ้าของหอ)', 'Insurance (ตัวแทนประกัน)', 'Credit Card/Bank (เซลล์แบงก์)', 'Online Seller (แม่ค้าออนไลน์)'] },
    'TRAITS': { icon: '🌟', title: 'SOME ONE YOU KNOW WHO...', titleTh: '(คนที่คุณรู้จักที่มีนิสัย...)', 
        subs: ['Hardworking (คนขยัน/ทำงานหนัก)', 'Friendly (คนมนุษยสัมพันธ์ดี)', 'Need Income (คนอยากมีรายได้เพิ่ม)', 'Ambitious (คนรักความก้าวหน้า)', 'Looking for Opportunity (คนมองหาโอกาส)'] }
};

// ==========================================
// 🚀 WIZARD LOGIC (ฟังก์ชันการทำงาน)
// ==========================================

window.triggerMemoryJoggerWizard = function(catKey) {
    // ระบบดักจับ Error กันแอปค้าง กรณีส่งชื่อผิด
    let cat = joggerCategories[catKey];
    if (!cat) {
        const foundKey = Object.keys(joggerCategories).find(k => joggerCategories[k].title.includes(catKey) || catKey.includes(k));
        cat = joggerCategories[foundKey] || joggerCategories['RELATIVES'];
    }

    currentWizardGroup = cat.titleTh;
    currentWizardIcon = cat.icon;
    tempWizardContacts = [];
    currentWizardStep = 1;

    // สร้าง Modal ถ้ายังไม่มี
    if (!document.getElementById('wizardModal')) {
        const modalHTML = `
            <div id="wizardModal" class="modal-overlay" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; display:flex; z-index: 9999; align-items:center; justify-content:center; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);">
                <div class="modal-content" style="width: 95%; max-width: 900px; height: 85vh; max-height: 800px; display: flex; flex-direction: column; padding: 0; overflow: hidden; background: var(--bg-surface); border-radius: var(--radius-xl); box-shadow: var(--shadow-lg);">
                    
                    <div style="padding: 16px 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background: var(--bg-body);">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span id="wizIcon" style="font-size: 1.5rem;"></span>
                            <div>
                                <h3 id="wizTitle" style="margin: 0; color: var(--primary);">Memory Jogger</h3>
                                <div id="wizStepIndicator" style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">Step 1 of 3: Rapid Entry</div>
                            </div>
                        </div>
                        <button onclick="closeWizard()" style="background:none; border:none; font-size:1.5rem; cursor:pointer; color: var(--text-muted);">✕</button>
                    </div>

                    <div id="wizTrack" style="display: flex; flex: 1; width: 300%; transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);">
                        
                        <div id="wizStep1" style="width: 33.333%; padding: 24px; overflow-y: auto;">
                            <div style="display: flex; gap: 24px; flex-wrap: wrap;">
                                <div style="flex: 1; min-width: 250px; background: var(--bg-body); border: 2px solid var(--primary); padding: 24px; border-radius: var(--radius-lg); text-align: center; display: flex; flex-direction: column; justify-content: center;">
                                    <div id="wizSideIcon" style="font-size: 4rem; margin-bottom: 16px;"></div>
                                    <h2 id="wizSideTitle" style="color: var(--text-main); font-size: 1.2rem; margin-bottom: 4px; text-transform: uppercase;"></h2>
                                    <p id="wizSideTitleTh" style="color: var(--primary); font-weight: 700; margin-bottom: 16px; opacity: 0.9;"></p>
                                    <p style="font-size: 0.85rem; color: var(--text-muted);">"พิมพ์ชื่อลงในช่องด้านขวา แล้วกด Enter เพื่อเพิ่มรายชื่ออย่างรวดเร็ว"</p>
                                </div>
                                <div id="wizInputArea" style="flex: 2; min-width: 300px; display: flex; flex-direction: column; gap: 16px;">
                                    </div>
                            </div>
                        </div>

                        <div id="wizStep2" style="width: 33.333%; padding: 24px; overflow-y: auto; background: var(--bg-body);">
                            <div style="margin-bottom: 16px; color: var(--text-main);">
                                <b style="color: var(--primary);">กรอกข้อมูลเพิ่มเติมและประเมินศักยภาพ (FARM)</b>
                                <p style="font-size: 0.85rem; color: var(--text-muted);">ให้คะแนน 1-5 ดาวเพื่อวิเคราะห์ความพร้อมในการทำธุรกิจ</p>
                            </div>
                            <div id="wizCardsArea" style="display: flex; flex-direction: column; gap: 16px;">
                                </div>
                        </div>

                        <div id="wizStep3" style="width: 33.333%; padding: 24px; overflow-y: auto;">
                            <div style="margin-bottom: 16px; color: var(--text-main);">
                                <b style="color: var(--primary);">ตรวจสอบข้อมูลก่อนบันทึกเข้าระบบ</b>
                                <p style="font-size: 0.85rem; color: var(--text-muted);">รายชื่อทั้งหมดนี้จะถูกตั้งสถานะเป็น "ลิสต์รายชื่อ" โดยอัตโนมัติ</p>
                            </div>
                            <div class="table-responsive" style="border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                                <table class="crm-table" style="width: 100%; text-align: left; border-collapse: collapse;">
                                    <thead style="background: var(--bg-body);">
                                        <tr>
                                            <th style="padding: 12px; border-bottom: 1px solid var(--border-color);">ชื่อ</th>
                                            <th style="padding: 12px; border-bottom: 1px solid var(--border-color);">สายสัมพันธ์</th>
                                            <th style="padding: 12px; border-bottom: 1px solid var(--border-color);">เบอร์โทร</th>
                                            <th style="padding: 12px; border-bottom: 1px solid var(--border-color);">F-A-R-M</th>
                                        </tr>
                                    </thead>
                                    <tbody id="wizSummaryArea">
                                        </tbody>
                                </table>
                            </div>
                        </div>

                    </div>

                    <div style="padding: 16px 24px; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; background: var(--bg-body);">
                        <button id="wizBtnBack" class="btn btn-outline" style="visibility: hidden;" onclick="wizGoBack()">⬅️ ย้อนกลับ</button>
                        <div style="display: flex; gap: 12px; align-items: center;">
                            <span id="wizCountBadge" style="font-size: 0.85rem; font-weight: 600; color: var(--primary);">เพิ่มแล้ว: 0 คน</span>
                            <button id="wizBtnNext" class="btn btn-primary" onclick="wizGoNext()" style="min-width: 120px;">ถัดไป ➡️</button>
                        </div>
                    </div>

                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // เซ็ตข้อมูล Header และด้านซ้ายของ Step 1
    document.getElementById('wizIcon').innerText = cat.icon;
    document.getElementById('wizSideIcon').innerText = cat.icon;
    document.getElementById('wizSideTitle').innerText = cat.title;
    document.getElementById('wizSideTitleTh').innerText = cat.titleTh;

    // สร้างช่องกรอก Step 1
    const inputArea = document.getElementById('wizInputArea');
    inputArea.innerHTML = '';
    cat.subs.forEach((sub, index) => {
        inputArea.innerHTML += `
            <div style="background: var(--bg-body); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                <label style="font-weight: 600; color: var(--text-main); font-size: 0.9rem; display: block; margin-bottom: 8px;">${sub}</label>
                <input type="text" id="wizInput-${index}" class="e-input" style="width: 100%; margin-bottom: 8px;" placeholder="พิมพ์ชื่อแล้วกด Enter..." onkeydown="wizHandleEnter(event, '${sub}', ${index})">
                <div id="wizList-${index}" style="display: flex; flex-direction: column; gap: 4px;"></div>
            </div>
        `;
    });

    document.getElementById('wizardModal').style.display = 'flex';
    wizUpdateUI();
};

window.closeWizard = function() {
    if(tempWizardContacts.length > 0) {
        if(!confirm("คุณมีรายชื่อที่ยังไม่ได้บันทึก แน่ใจหรือไม่ว่าจะปิดหน้าต่างนี้?")) return;
    }
    const modal = document.getElementById('wizardModal');
    if(modal) modal.remove();
};

window.wizHandleEnter = function(e, subCategory, index) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const input = document.getElementById(`wizInput-${index}`);
        const name = input.value.trim();
        if (name) {
            const tempId = 'temp_' + Date.now() + Math.floor(Math.random() * 1000);
            tempWizardContacts.push({
                PersonID: tempId,
                Name: name,
                Contact_Type: 'Memory Jogger',
                Relation_Jogger: subCategory,
                Phone: '',
                Score_Friendly: 3, Score_Active: 3, Score_Relation: 3, Score_Money: 3,
                Current_Status: 'ลิสต์รายชื่อ',
                Note: `💡 นึกถึงจากหมวด: ${currentWizardGroup}\n`
            });
            input.value = ''; 
            wizRenderList(index, subCategory); 
            wizUpdateCount();
        }
    }
};

window.wizRenderList = function(index, subCategory) {
    const listDiv = document.getElementById(`wizList-${index}`);
    listDiv.innerHTML = '';
    const filtered = tempWizardContacts.filter(c => c.Relation_Jogger === subCategory);
    filtered.forEach((c, i) => {
        listDiv.innerHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface); padding: 6px 12px; border-radius: 4px; border-left: 3px solid var(--primary); font-size: 0.9rem;">
                <span><span style="color:var(--text-muted); margin-right:8px;">${i+1}.</span> <b>${c.Name}</b></span>
                <button onclick="wizRemoveTemp('${c.PersonID}', ${index}, '${subCategory}')" style="background:none; border:none; color: var(--danger); cursor:pointer; font-size: 1rem;">✕</button>
            </div>
        `;
    });
};

window.wizRemoveTemp = function(id, index, subCategory) {
    tempWizardContacts = tempWizardContacts.filter(c => c.PersonID !== id);
    wizRenderList(index, subCategory);
    wizUpdateCount();
};

window.wizUpdateCount = function() {
    document.getElementById('wizCountBadge').innerText = `เพิ่มแล้ว: ${tempWizardContacts.length} คน`;
};

// ==========================================
// 🔄 STEP NAVIGATION
// ==========================================

window.wizGoNext = function() {
    if (currentWizardStep === 1) {
        if (tempWizardContacts.length === 0) { alert('โปรดพิมพ์รายชื่ออย่างน้อย 1 คนก่อนไปขั้นตอนถัดไป'); return; }
        wizBuildStep2();
        currentWizardStep = 2;
    } else if (currentWizardStep === 2) {
        wizSaveStep2Data();
        wizBuildStep3();
        currentWizardStep = 3;
    } else if (currentWizardStep === 3) {
        wizSaveToDatabase(); 
        return;
    }
    wizUpdateUI();
};

window.wizGoBack = function() {
    if (currentWizardStep > 1) {
        if (currentWizardStep === 2) wizSaveStep2Data(); 
        currentWizardStep--;
        wizUpdateUI();
    }
};

window.wizUpdateUI = function() {
    const track = document.getElementById('wizTrack');
    track.style.transform = `translateX(-${(currentWizardStep - 1) * 33.333}%)`;

    document.getElementById('wizStepIndicator').innerText = `Step ${currentWizardStep} of 3`;
    const btnBack = document.getElementById('wizBtnBack');
    const btnNext = document.getElementById('wizBtnNext');

    if (currentWizardStep === 1) {
        btnBack.style.visibility = 'hidden';
        btnNext.innerText = 'ถัดไป ➡️';
        btnNext.className = 'btn btn-primary';
        btnNext.style.backgroundColor = '';
        btnNext.style.borderColor = '';
    } else if (currentWizardStep === 2) {
        btnBack.style.visibility = 'visible';
        btnNext.innerText = 'ตรวจสอบ ➡️';
        btnNext.className = 'btn btn-primary';
        btnNext.style.backgroundColor = '';
        btnNext.style.borderColor = '';
    } else if (currentWizardStep === 3) {
        btnBack.style.visibility = 'visible';
        btnNext.innerText = '💾 บันทึกเข้าระบบ';
        btnNext.className = 'btn btn-primary';
        btnNext.style.backgroundColor = 'var(--success)';
        btnNext.style.borderColor = 'var(--success)';
    }
};

// ==========================================
// 📇 BUILD UI FOR STEP 2 & 3
// ==========================================

function getStarSelect(value, id, field) {
    let opts = '';
    for(let i=1; i<=5; i++) {
        opts += `<option value="${i}" ${value == i ? 'selected' : ''}>${'⭐'.repeat(i)}</option>`;
    }
    return `<select id="wiz_${field}_${id}" class="e-input" style="padding: 4px; font-size: 0.8rem; width: 100%; cursor: pointer;">${opts}</select>`;
}

window.wizBuildStep2 = function() {
    const area = document.getElementById('wizCardsArea');
    area.innerHTML = '';
    tempWizardContacts.forEach(c => {
        area.innerHTML += `
            <div class="settings-card" style="padding: 16px; border-left: 4px solid var(--primary);">
                <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
                    <div style="flex: 1; min-width: 200px;">
                        <input type="text" id="wiz_Name_${c.PersonID}" class="e-input" value="${c.Name}" style="font-weight: 700; color: var(--primary); font-size: 1.1rem; width: 100%; margin-bottom: 8px;">
                        <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px;"><b>กลุ่ม:</b> ${c.Relation_Jogger}</div>
                        <input type="text" id="wiz_Phone_${c.PersonID}" class="e-input" value="${c.Phone}" placeholder="เบอร์โทรศัพท์ (ถ้ามี)" style="width: 100%; font-size: 0.9rem;">
                    </div>
                    <div style="flex: 1; min-width: 250px; background: var(--bg-body); padding: 12px; border-radius: var(--radius-md); display: grid; grid-template-columns: 1fr 1fr; gap: 8px; align-items: center;">
                        <span style="font-size: 0.85rem; font-weight: 600;">F (อัธยาศัย)</span> ${getStarSelect(c.Score_Friendly, c.PersonID, 'F')}
                        <span style="font-size: 0.85rem; font-weight: 600;">A (ขยัน)</span> ${getStarSelect(c.Score_Active, c.PersonID, 'A')}
                        <span style="font-size: 0.85rem; font-weight: 600;">R (สัมพันธ์)</span> ${getStarSelect(c.Score_Relation, c.PersonID, 'R')}
                        <span style="font-size: 0.85rem; font-weight: 600;">M (กำลังซื้อ)</span> ${getStarSelect(c.Score_Money, c.PersonID, 'M')}
                    </div>
                </div>
            </div>
        `;
    });
};

window.wizSaveStep2Data = function() {
    tempWizardContacts.forEach(c => {
        c.Name = document.getElementById(`wiz_Name_${c.PersonID}`).value.trim();
        c.Phone = document.getElementById(`wiz_Phone_${c.PersonID}`).value.trim();
        c.Score_Friendly = parseInt(document.getElementById(`wiz_F_${c.PersonID}`).value);
        c.Score_Active = parseInt(document.getElementById(`wiz_A_${c.PersonID}`).value);
        c.Score_Relation = parseInt(document.getElementById(`wiz_R_${c.PersonID}`).value);
        c.Score_Money = parseInt(document.getElementById(`wiz_M_${c.PersonID}`).value);
    });
};

window.wizBuildStep3 = function() {
    const tbody = document.getElementById('wizSummaryArea');
    tbody.innerHTML = '';
    tempWizardContacts.forEach(c => {
        tbody.innerHTML += `
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid var(--border-color); font-weight: 600; color: var(--text-main);">${c.Name}</td>
                <td style="padding: 12px; border-bottom: 1px solid var(--border-color); font-size: 0.85rem; color: var(--text-muted);">${c.Relation_Jogger}</td>
                <td style="padding: 12px; border-bottom: 1px solid var(--border-color); font-size: 0.9rem;">${c.Phone || '-'}</td>
                <td style="padding: 12px; border-bottom: 1px solid var(--border-color); font-size: 0.85rem; color: var(--primary); font-weight: 700;">
                    ${c.Score_Friendly}-${c.Score_Active}-${c.Score_Relation}-${c.Score_Money}
                </td>
            </tr>
        `;
    });
};

// ==========================================
// 💾 FINAL SAVE (ส่งเข้า Database)
// ==========================================

window.wizSaveToDatabase = async function() {
    const btnNext = document.getElementById('wizBtnNext');
    btnNext.disabled = true;
    btnNext.innerHTML = 'กำลังบันทึก... ⏳';

    const timestamp = new Date().toISOString();
    const payloadArray = tempWizardContacts.map(c => {
        return {
            ...c,
            PersonID: "P" + Date.now() + Math.floor(Math.random() * 1000), 
            Date_Added: timestamp,
            Last_Update: timestamp
        };
    });

    try {
        const result = await DbAPI.create(payloadArray);
        
        if (result && result.status === "success") {
            contactsData = [...payloadArray, ...contactsData]; 
            localStorage.setItem('buzzGuideContacts', JSON.stringify(contactsData)); 
            
            document.getElementById('wizardModal').remove();
            switchView('contacts');
            renderTable();
            updateDashboard();
            alert(`✅ บันทึกรายชื่อใหม่ ${payloadArray.length} คน สำเร็จแล้ว!`);
        } else {
            alert('❌ บันทึกไม่สำเร็จ โปรดลองอีกครั้ง');
            btnNext.disabled = false;
            btnNext.innerHTML = '💾 บันทึกเข้าระบบ';
        }
    } catch (e) {
        console.error(e);
        alert('❌ การเชื่อมต่อล้มเหลว');
        btnNext.disabled = false;
        btnNext.innerHTML = '💾 บันทึกเข้าระบบ';
    }
};

// ==========================================
// 🎨 RENDER MAIN VIEW (หน้าแรกของคู่มือ)
// ==========================================

function renderGuideView() {
    const container = document.getElementById('guide-view');
    if (!container) return;

    // ลบสีเหลืองตายตัวออก เปลี่ยนไปใช้ var(--primary) ของ Theme แทน
    let html = `
        <style>
            .mj-btn-card { background: var(--bg-surface); border: 2px solid var(--border-color); border-radius: var(--radius-xl); padding: 24px 16px; text-align: center; cursor: pointer; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 200px; box-shadow: var(--shadow-sm); position: relative; overflow: hidden; }
            .mj-btn-card:hover { border-color: var(--primary); transform: translateY(-6px) scale(1.02); box-shadow: var(--shadow-md); }
            .mj-icon { font-size: 3.5rem; margin-bottom: 12px; transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
            .mj-btn-card:hover .mj-icon { transform: scale(1.2) rotate(8deg); }
            .mj-title-eng { font-size: 1.1rem; font-weight: 800; color: var(--text-main); line-height: 1.2; text-transform: uppercase; margin-bottom: 4px; }
            .mj-title-th { font-size: 0.95rem; font-weight: 700; color: var(--primary); margin-bottom: 10px; opacity: 0.9;}
            .mj-desc { font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; }
            .mj-click-badge { position: absolute; top: 12px; right: 12px; background: var(--primary); color: #fff; font-size: 0.7rem; font-weight: 700; padding: 4px 8px; border-radius: 50px; opacity: 0; transform: translateY(10px); transition: all 0.3s ease; box-shadow: 0 2px 4px rgba(0,0,0,0.15); }
            .mj-btn-card:hover .mj-click-badge { opacity: 1; transform: translateY(0); }
            body.is-dark .mj-btn-card { background: var(--bg-surface); }
            body.is-dark .mj-btn-card:hover { border-color: var(--primary); background: rgba(255, 255, 255, 0.05); }
        </style>
        <div class="settings-wrapper" style="max-width: 1000px; margin: 0 auto; padding-bottom: 40px;">
            
            <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="color: var(--primary); margin-bottom: 8px; font-size: 1.8rem;">📘 คู่มือทำรายชื่อ (Buzz Guide)</h2>
                <p style="color: var(--text-muted); font-size: 0.95rem;">"รายชื่อคือทุนของธุรกิจ ยิ่งมีมาก ธุรกิจยิ่งเติบโตเร็ว"</p>
            </div>

            <div class="settings-card" style="border-left: 4px solid var(--primary); margin-bottom: 24px;">
                <div class="settings-header" style="background: var(--bg-body);">
                    <div class="settings-title" style="color: var(--primary);">🌟 1. กฎเหล็กของการทำรายชื่อ (Mindset)</div>
                    <div class="settings-desc">สิ่งที่ต้องจำให้ขึ้นใจก่อนเริ่มเขียนรายชื่อลงกระดาษ หรือลงในระบบ</div>
                </div>
                <div class="settings-body" style="line-height: 1.6;">
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <div style="background: var(--bg-body); padding: 12px 16px; border-radius: var(--radius-md);">
                            <strong style="color: var(--primary);">🚫 1. ห้ามคิดแทนใคร (Don't Pre-judge)</strong>
                            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">ไม่ต้องคิดว่า "เขาคงไม่ทำหรอก" หรือ "เขารวยอยู่แล้ว" หน้าที่ของเราคือจดชื่อลงไป ส่วนการตัดสินใจเป็นของเขา</p>
                        </div>
                        <div style="background: var(--bg-body); padding: 12px 16px; border-radius: var(--radius-md);">
                            <strong style="color: var(--primary);">✍️ 2. เขียนออกมาก่อน</strong>
                            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">อย่าเพิ่งกังวลว่าจะชวนยังไง หรือจะคุยเรื่องอะไร ให้ดึงรายชื่อออกจากหัวมาอยู่ในระบบให้เยอะที่สุดก่อน</p>
                        </div>
                        <div style="background: var(--bg-body); padding: 12px 16px; border-radius: var(--radius-md);">
                            <strong style="color: var(--primary);">🔄 3. อัปเดตรายชื่อเสมอ</strong>
                            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">ฝึกเป็นคนมีมนุษยสัมพันธ์ดี รู้จักเพื่อนใหม่ๆ และเติมรายชื่อลงในกลุ่ม "ลิสต์รายชื่อ" เป็นประจำ</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="settings-card" style="border-left: 4px solid var(--primary); margin-bottom: 24px;">
                <div class="settings-header" style="background: var(--bg-body);">
                    <div class="settings-title" style="color: var(--primary);">🧠 2. เพิ่มรายชื่อกลุ่ม Memory Jogger</div>
                    <div class="settings-desc" style="color: var(--primary); font-weight: 600; opacity: 0.8;">คลิกที่การ์ดหมวดหมู่ด้านล่าง เพื่อเพิ่มรายชื่อแบบกลุ่ม (Wizard)! 👆</div>
                </div>
                <div class="settings-body" style="background: var(--bg-body); padding: 24px;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
    `;

    // Gen ปุ่มใหญ่ 6 ปุ่มแบบอัตโนมัติ
    Object.keys(joggerCategories).forEach(key => {
        const cat = joggerCategories[key];
        let subsPreview = cat.subs.map(s => s.split(' (')[0]).join(', ').substring(0, 50) + '...';
        html += `
            <div class="mj-btn-card" onclick="triggerMemoryJoggerWizard('${key}')">
                <div class="mj-click-badge">⚡ เพิ่มด่วน</div>
                <div class="mj-icon">${cat.icon}</div>
                <div class="mj-title-eng">${cat.title}</div>
                <div class="mj-title-th">${cat.titleTh}</div>
                <div class="mj-desc">${subsPreview}</div>
            </div>
        `;
    });

    html += `
                    </div>
                </div>
            </div>

            <div class="settings-card" style="border-left: 4px solid var(--primary); margin-bottom: 24px;">
                <div class="settings-header" style="background: var(--bg-body);">
                    <div class="settings-title" style="color: var(--primary);">💼 3. Sponsor Name List (คัดกรองนักธุรกิจ)</div>
                    <div class="settings-desc">คัดรายชื่อจาก Memory Jogger เพื่อวิเคราะห์ศักยภาพด้วยหลักการ FARM</div>
                </div>
                <div class="settings-body" style="line-height: 1.6;">
                    <p style="margin-bottom: 16px; color: var(--text-main);">ให้คะแนน (1-5 ดาว) ในหน้า Profile ลูกค้า เพื่อค้นหาคนที่มีความพร้อมในการทำธุรกิจ:</p>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <div style="display: flex; gap: 12px; background: var(--bg-body); padding: 12px; border-radius: var(--radius-md);">
                            <div style="font-size: 1.2rem; font-weight: 700; color: var(--primary); width: 30px; text-align: center;">F</div>
                            <div>
                                <strong style="color: var(--text-main);">Friendly (อัธยาศัย)</strong>
                                <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">เป็นคนคุยง่าย เปิดรับสิ่งใหม่ๆ เข้ากับคนอื่นได้ดี ไม่ปิดกั้นตัวเอง</p>
                            </div>
                        </div>
                        <div style="display: flex; gap: 12px; background: var(--bg-body); padding: 12px; border-radius: var(--radius-md);">
                            <div style="font-size: 1.2rem; font-weight: 700; color: var(--primary); width: 30px; text-align: center;">A</div>
                            <div>
                                <strong style="color: var(--text-main);">Active (ขยันขันแข็ง)</strong>
                                <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">ไม่พอใจกับชีวิตแค่นี้ กระตือรือร้น ทำงานหนัก และกำลังมองหาโอกาสเพิ่มรายได้</p>
                            </div>
                        </div>
                        <div style="display: flex; gap: 12px; background: var(--bg-body); padding: 12px; border-radius: var(--radius-md);">
                            <div style="font-size: 1.2rem; font-weight: 700; color: var(--primary); width: 30px; text-align: center;">R</div>
                            <div>
                                <strong style="color: var(--text-main);">Relation (สายสัมพันธ์)</strong>
                                <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">สนิทกับเราในระดับหนึ่ง ชวนคุยง่าย นัดหมายออกมาเจอง่าย</p>
                            </div>
                        </div>
                        <div style="display: flex; gap: 12px; background: var(--bg-body); padding: 12px; border-radius: var(--radius-md);">
                            <div style="font-size: 1.2rem; font-weight: 700; color: var(--primary); width: 30px; text-align: center;">M</div>
                            <div>
                                <strong style="color: var(--text-main);">Money / Motive (กำลังซื้อ / แรงจูงใจ)</strong>
                                <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">มีกำลังซื้อสินค้าพื้นฐาน หรือ มีแรงผลักดัน/ความฝันที่อยากสำเร็จอย่างแรงกล้า</p>
                            </div>
                        </div>
                    </div>
                    <div style="margin-top: 16px; background: var(--bg-body); border: 1px dashed var(--primary); padding: 12px; border-radius: var(--radius-md); font-size: 0.85rem; color: var(--text-main);">
                        <b style="color: var(--primary);">💡 สิ่งที่ต้องหาให้เจอ (Pain Point):</b> ก่อนนัดหมาย ต้องรู้ว่าเขากำลังเจอปัญหาอะไร เช่น <i>ไม่มีเวลาให้ลูก, หนี้สินเยอะ, เบื่อหัวหน้า</i> เพื่อนำเสนอแผนธุรกิจให้ "แก้ปัญหา" ให้เขาได้
                    </div>
                </div>
            </div>

            <div class="settings-card" style="border-left: 4px solid var(--primary); margin-bottom: 24px;">
                <div class="settings-header" style="background: var(--bg-body);">
                    <div class="settings-title" style="color: var(--primary);">🛒 4. Customer Name List (คัดกรองผู้บริโภค)</div>
                    <div class="settings-desc">สำหรับคนที่ยังไม่พร้อมทำธุรกิจ แต่มีความต้องการใช้สินค้า</div>
                </div>
                <div class="settings-body" style="line-height: 1.6;">
                    <div style="display: flex; gap: 16px; flex-wrap: wrap;">
                        <div style="flex: 1; min-width: 250px; background: var(--bg-body); padding: 16px; border-radius: var(--radius-md);">
                            <strong style="color: var(--primary); font-size: 1.05rem;">💪 กลุ่มสุขภาพ (Health & Wellness)</strong>
                            <ul style="margin-left: 16px; font-size: 0.9rem; color: var(--text-muted); margin-top: 8px; line-height: 1.8;">
                                <li><b>คนอยากหุ่นดี/ลดน้ำหนัก:</b> โฟกัส BodyKey, 6WNY, Clean Food</li>
                                <li><b>คนรักครอบครัว/รักสะอาด:</b> โฟกัส เครื่องกรองน้ำ eSpring, เครื่องกรองอากาศ Atmosphere</li>
                                <li><b>ผู้สูงอายุ/คนป่วย:</b> โฟกัส อาหารเสริมเฉพาะทาง (Nutrilite)</li>
                            </ul>
                        </div>
                        <div style="flex: 1; min-width: 250px; background: var(--bg-body); padding: 16px; border-radius: var(--radius-md);">
                            <strong style="color: var(--primary); font-size: 1.05rem;">✨ กลุ่มความงาม (Beauty)</strong>
                            <ul style="margin-left: 16px; font-size: 0.9rem; color: var(--text-muted); margin-top: 8px; line-height: 1.8;">
                                <li><b>คนชอบแต่งหน้า/ดูแลผิว:</b> โฟกัส สกินแคร์ Artistry</li>
                                <li><b>คนชอบเข้าคลินิก/สปา:</b> โฟกัส คอร์สสปาหน้า, เครื่องมือดูแลผิวหน้า</li>
                                <li><b>คนมีปัญหาผิว:</b> เป็นสิว, ริ้วรอย, ฝ้ากระ</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div class="settings-card" style="border-left: 4px solid var(--primary);">
                <div class="settings-header" style="background: var(--bg-body);">
                    <div class="settings-title" style="color: var(--primary);">🗣️ 5. เทคนิคเปิดใจและเชิญชวน (Approaching)</div>
                    <div class="settings-desc">การใช้หลักการ F.O.R.M. เพื่อชวนคุยอย่างเป็นธรรมชาติ</div>
                </div>
                <div class="settings-body" style="line-height: 1.6;">
                    <p style="margin-bottom: 16px; color: var(--text-main);">อย่าเพิ่งรีบชวนเข้าธุรกิจ ให้เริ่มจากการตั้งคำถามเพื่อเช็คสถานการณ์ชีวิตของเขาก่อน:</p>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                        <div style="background: var(--bg-body); padding: 12px; border-radius: var(--radius-md); border-left: 3px solid var(--primary);">
                            <strong style="color: var(--text-main);">F - Family (ครอบครัว)</strong>
                            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">"เป็นไงบ้าง สบายดีไหม? พ่อแม่เป็นไงบ้าง? ลูกเข้าโรงเรียนหรือยัง?"</p>
                        </div>
                        <div style="background: var(--bg-body); padding: 12px; border-radius: var(--radius-md); border-left: 3px solid var(--primary);">
                            <strong style="color: var(--text-main);">O - Occupation (การงาน)</strong>
                            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">"งานช่วงนี้ยุ่งไหม? ธุรกิจที่ทำอยู่เวิร์คไหม? เห็นทำงานดึกตลอดเลย"</p>
                        </div>
                        <div style="background: var(--bg-body); padding: 12px; border-radius: var(--radius-md); border-left: 3px solid var(--primary);">
                            <strong style="color: var(--text-main);">R - Recreation (งานอดิเรก)</strong>
                            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">"เสาร์อาทิตย์ว่างไหม ปกติทำอะไร? ได้ไปเที่ยวไหนบ้างหรือเปล่า?"</p>
                        </div>
                        <div style="background: var(--bg-body); padding: 12px; border-radius: var(--radius-md); border-left: 3px solid var(--primary);">
                            <strong style="color: var(--text-main);">M - Message (เข้าประเด็น)</strong>
                            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">เมื่อเจอ Pain Point ให้พูดเข้าประเด็น เช่น "พอดีเราทำโปรเจกต์นึงอยู่ น่าจะตอบโจทย์เรื่องเวลาที่แกบ่นเมื่อกี้เลย สนใจลองมาฟังดูไหม?"</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    `;

    container.innerHTML = html;
}