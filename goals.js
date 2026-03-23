// =========================================================================
// GOALS.JS - ระบบติดตามความสำเร็จ (Cark UI Edition)
// เวอร์ชัน: 4.0 (Modern Cards, Fluid Progress Bar)
// =========================================================================

const goalsTemplate = `
    <div class="card" style="margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 15px;">
            <div>
                <h3 style="color: var(--primary); margin: 0;">🎯 9 ขั้นตอนสู่ความสำเร็จ</h3>
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 5px;">คลิกที่การ์ดเพื่อทำเครื่องหมายว่าสำเร็จแล้ว (บันทึกอัตโนมัติ)</p>
            </div>
            <div style="text-align: right; background: var(--primary-light); padding: 10px 20px; border-radius: 12px; border: 1px solid var(--border-color);">
                <div style="font-size: 1.8rem; font-weight: 700; color: var(--primary); line-height: 1;" id="stepsProgressText">0/9</div>
                <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; margin-top: 4px;">ความคืบหน้า</div>
            </div>
        </div>

        <div class="steps-grid" id="stepsGrid">
            </div>
    </div>

    <div class="bt-calc-container" style="background: var(--bg-card); box-shadow: 0 4px 15px rgba(0,0,0,0.02); margin-top: 0;">
        <div style="margin-bottom: 1.5rem;">
            <h3 style="color: var(--text-main); margin-bottom: 5px;">🏅 เครื่องมือคำนวณ BT Qualification</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted);">จำลองโครงสร้างและคำนวณยอดเพื่อพิชิตเข็ม Bronze แบบเรียลไทม์</p>
        </div>
        
        <div class="bt-grid">
            <div style="background: var(--bg-base); padding: 20px; border-radius: 16px; border: 1px solid var(--border-color);">
                <div class="e-group">
                    <label class="e-label" style="font-size: 0.85rem; color: var(--primary);">เป้าหมายที่ต้องการ (Target)</label>
                    <select id="btTarget" class="e-input" style="font-size: 1rem; font-weight: 600; color: var(--text-main); background: var(--bg-card);" onchange="calculateBT()">
                        <option value="BF">Bronze Foundation (BF 9%)</option>
                        <option value="BB">Bronze Builder (BB 15%)</option>
                    </select>
                </div>
                
                <div class="e-group" style="margin-top: 1.2rem;">
                    <label class="e-label">💎 ยอดธุรกิจกลุ่มรวม (Total Group PV)</label>
                    <input type="number" id="btTotalPV" class="e-input" style="font-size: 1.3rem; font-weight: 700; background: var(--bg-card); text-align: center; letter-spacing: 2px;" placeholder="0" oninput="calculateBT()">
                </div>

                <label class="e-label" style="margin-top: 1.2rem; display: block;">แยกตามสายงาน (Leg PV)</label>
                <div class="bt-legs-wrapper" style="margin-top: 0.5rem;">
                    <div class="bt-leg-box" style="background: var(--bg-card);">
                        <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">สายงาน 1</div>
                        <input type="number" id="btLeg1" placeholder="0" oninput="calculateBT()" style="background: var(--bg-base);">
                    </div>
                    <div class="bt-leg-box" style="background: var(--bg-card);">
                        <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">สายงาน 2</div>
                        <input type="number" id="btLeg2" placeholder="0" oninput="calculateBT()" style="background: var(--bg-base);">
                    </div>
                    <div class="bt-leg-box" style="background: var(--bg-card);">
                        <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">สายงาน 3</div>
                        <input type="number" id="btLeg3" placeholder="0" oninput="calculateBT()" style="background: var(--bg-base);">
                    </div>
                </div>
                <button class="btn-outline" style="width: 100%; margin-top: 20px; font-size: 0.85rem; background: var(--bg-card);" onclick="resetBT()">🔄 ล้างค่าข้อมูลทั้งหมด</button>
            </div>

            <div class="bt-result-box" style="background: var(--primary-light); border: none; position: relative; overflow: hidden;">
                <div style="position: absolute; top: -20px; right: -20px; font-size: 8rem; opacity: 0.05; pointer-events: none;">🏆</div>
                
                <div style="text-align: center; margin-bottom: 1.5rem; position: relative; z-index: 2;">
                    <h2 id="btStatusTitle" style="color: var(--primary); font-size: 1.6rem; margin-bottom: 5px;">รอข้อมูล...</h2>
                    <p id="btStatusSub" style="font-size: 0.9rem; color: var(--text-muted);">วิเคราะห์โครงสร้างธุรกิจของคุณที่นี่</p>
                </div>

                <div style="margin-top: 1rem; position: relative; z-index: 2;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: var(--text-main);">
                        <span>ความคืบหน้ายอดรวม</span>
                        <span id="btProgressText" style="color: var(--primary);">0%</span>
                    </div>
                    <div class="bt-progress-bar" style="background: var(--bg-card); height: 14px; border: 1px solid var(--border-color);"><div class="bt-progress-fill" id="btProgressBar" style="background: var(--primary);"></div></div>
                </div>

                <div style="margin-top: 1.5rem; background: var(--bg-card); padding: 1.2rem; border-radius: 12px; position: relative; z-index: 2; border: 1px solid var(--border-color); box-shadow: 0 4px 10px rgba(0,0,0,0.02);">
                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 10px; font-weight: 700; text-transform: uppercase;">เงื่อนไขคุณสมบัติ:</div>
                    <div class="req-item" style="border-bottom-color: var(--border-color); padding-bottom: 10px;">
                        <span style="color: var(--text-main);">ยอดกลุ่มรวม (Group PV)</span>
                        <span id="reqGroup" style="font-weight: 600;">-</span>
                    </div>
                    <div class="req-item" style="padding-top: 10px; border: none;">
                        <span style="color: var(--text-main);">สายงานที่ผ่านเกณฑ์</span>
                        <span id="reqLegs" style="font-weight: 600;">-</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
`;

// ฝัง Template ลงในแท็บเป้าหมาย
const goalsContainer = document.getElementById('goals');
if (goalsContainer) { goalsContainer.innerHTML = goalsTemplate; }

// ==========================================
// ลอจิก 9 ขั้นตอนสู่ความสำเร็จ
// ==========================================
const nineStepsData = [
    { id: 1, title: "ความฝันและเป้าหมาย", desc: "หาเหตุผลที่ชัดเจน (Why) และตั้งเป้าหมายที่วัดผลได้" },
    { id: 2, title: "ความมุ่งมั่นและพันธสัญญา", desc: "จัดเวลาเรียนรู้และลงมือทำอย่างสม่ำเสมอ" },
    { id: 3, title: "ลิสต์รายชื่อ (Name List)", desc: "เขียนรายชื่อผู้มุ่งหวังโดยไม่คิดแทนใคร" },
    { id: 4, title: "การเชิญและการนัดหมาย", desc: "ฝึกทักษะการเชิญและนัดหมายอย่างเป็นธรรมชาติ" },
    { id: 5, title: "นำเสนอแผน & สาธิต", desc: "นำเสนอโมเดลธุรกิจ (STP) และสาธิตสินค้า" },
    { id: 6, title: "การติดตามผล (Follow Up)", desc: "ติดตามด้วยความใส่ใจภายใน 24-48 ชั่วโมง" },
    { id: 7, title: "ตรวจสอบกับอัพไลน์", desc: "Check-in และปรึกษาอัพไลน์อย่างต่อเนื่อง" },
    { id: 8, title: "การทำงานเป็นทีม", desc: "เข้าร่วมบรรยากาศและใช้ระบบเซ็นเตอร์" },
    { id: 9, title: "การทำซ้ำและสอนต่อ", desc: "ส่งต่อแนวทางและสร้างผู้นำรุ่นต่อไป" }
];

let savedSteps = JSON.parse(localStorage.getItem('buzzGuide9Steps')) || [];

function render9Steps() {
    const grid = document.getElementById('stepsGrid');
    if (!grid) return;
    grid.innerHTML = '';
    
    let completedCount = 0;

    nineStepsData.forEach(step => {
        const isActive = savedSteps.includes(step.id);
        if(isActive) completedCount++;

        const card = document.createElement('div');
        card.className = `step-card ${isActive ? 'active' : ''}`;
        card.onclick = () => toggleStep(step.id);
        
        card.innerHTML = `
            <div class="step-number">${isActive ? '✓' : step.id}</div>
            <div class="step-content">
                <h4 style="font-weight: 700;">${step.title}</h4>
                <p>${step.desc}</p>
            </div>
        `;
        grid.appendChild(card);
    });

    document.getElementById('stepsProgressText').innerText = `${completedCount}/9`;
    
    // เปลี่ยนสีกล่อง Progress ด้านบนถ้าครบ 9 ขั้นตอน
    const progressBox = document.getElementById('stepsProgressText').parentElement;
    if(completedCount === 9) {
        progressBox.style.background = 'var(--success)';
        document.getElementById('stepsProgressText').style.color = 'white';
        progressBox.querySelector('div:last-child').style.color = 'rgba(255,255,255,0.8)';
    } else {
        progressBox.style.background = 'var(--primary-light)';
        document.getElementById('stepsProgressText').style.color = 'var(--primary)';
        progressBox.querySelector('div:last-child').style.color = 'var(--text-muted)';
    }
}

function toggleStep(id) {
    if (savedSteps.includes(id)) {
        savedSteps = savedSteps.filter(stepId => stepId !== id);
    } else {
        savedSteps.push(id);
    }
    localStorage.setItem('buzzGuide9Steps', JSON.stringify(savedSteps));
    render9Steps();
}

// ==========================================
// ลอจิก BT Qualification Calculator
// ==========================================
function calculateBT() {
    const target = document.getElementById('btTarget').value;
    const totalPV = parseInt(document.getElementById('btTotalPV').value) || 0;
    const leg1 = parseInt(document.getElementById('btLeg1').value) || 0;
    const leg2 = parseInt(document.getElementById('btLeg2').value) || 0;
    const leg3 = parseInt(document.getElementById('btLeg3').value) || 0;

    const reqTotalPV = target === 'BF' ? 1200 : 4000;
    const reqLegPV = target === 'BF' ? 250 : 600;

    let passedLegs = 0;
    if (leg1 >= reqLegPV) passedLegs++;
    if (leg2 >= reqLegPV) passedLegs++;
    if (leg3 >= reqLegPV) passedLegs++;

    const isGroupPassed = totalPV >= reqTotalPV;
    const isLegsPassed = passedLegs >= 3;

    // อัปเดตเงื่อนไข
    document.getElementById('reqGroup').innerHTML = isGroupPassed 
        ? `<span style="color: var(--success);">✅ ผ่าน (${totalPV.toLocaleString()} / ${reqTotalPV.toLocaleString()})</span>` 
        : `<span style="color: var(--danger);">❌ ขาด ${(reqTotalPV - totalPV).toLocaleString()}</span>`;

    document.getElementById('reqLegs').innerHTML = isLegsPassed 
        ? `<span style="color: var(--success);">✅ ผ่าน (${passedLegs}/3)</span>` 
        : `<span style="color: var(--danger);">❌ ได้ ${passedLegs}/3 (ขั้นต่ำ ${reqLegPV} PV)</span>`;

    // อัปเดต Progress Bar
    let progressPercent = (totalPV / reqTotalPV) * 100;
    if (progressPercent > 100) progressPercent = 100;
    document.getElementById('btProgressBar').style.width = `${progressPercent}%`;
    document.getElementById('btProgressText').innerText = `${progressPercent.toFixed(1)}%`;

    // อัปเดต Status หลัก
    const titleEl = document.getElementById('btStatusTitle');
    const subEl = document.getElementById('btStatusSub');

    if (totalPV === 0 && leg1 === 0 && leg2 === 0 && leg3 === 0) {
        titleEl.innerText = "วิเคราะห์ข้อมูล";
        titleEl.style.color = "var(--primary)";
        subEl.innerText = "ใส่ยอด PV เพื่อตรวจสอบคุณสมบัติ";
        document.getElementById('btProgressBar').style.background = "var(--primary)";
    } else if (isGroupPassed && isLegsPassed) {
        titleEl.innerText = "🎉 ยินดีด้วย!";
        titleEl.style.color = "var(--success)";
        subEl.innerText = `ผ่านคุณสมบัติ ${target === 'BF' ? 'BF 9%' : 'BB 15%'} แล้ว!`;
        document.getElementById('btProgressBar').style.background = "var(--success)";
        document.getElementById('btProgressText').style.color = "var(--success)";
    } else {
        titleEl.innerText = "💪 ลุยต่ออีกนิด!";
        titleEl.style.color = "var(--warning)";
        subEl.innerText = "คุณสมบัติยังไม่ครบถ้วนตามเกณฑ์";
        document.getElementById('btProgressBar').style.background = "var(--warning)";
        document.getElementById('btProgressText').style.color = "var(--warning)";
    }
}

function resetBT() {
    document.getElementById('btTotalPV').value = '';
    document.getElementById('btLeg1').value = '';
    document.getElementById('btLeg2').value = '';
    document.getElementById('btLeg3').value = '';
    calculateBT();
}

// Initial Setup
render9Steps();
calculateBT();