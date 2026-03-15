// =========================================
// GOALS.JS - ระบบเป้าหมายธุรกิจ (Visionary Design)
// =========================================

// 1. นำโครงสร้าง HTML ใส่ในหน้าจอเป้าหมาย
const goalsTemplate = `
    <div class="goal-header-banner">
        <h2 style="letter-spacing: 2px;">DESIGN YOUR EXTRAORDINARY LIFE</h2>
        <p class="goal-quote">"เมื่อเหตุผลชัดเจน... วิธีการจะกลายเป็นเรื่องง่าย"</p>
        <div style="margin-top:15px; font-size: 0.8rem; opacity: 0.7;" id="goalsLastUpdate">
            DATABASE UPDATED: -
        </div>
    </div>

    <div class="drawer-layout">
        <div class="drawer-left">
            <div class="life-goal-card dl-full" style="border-left: 4px solid #f39c12;">
                <div class="goal-section-title">
                    <span>👑</span> เป้าหมายชีวิตสูงสุด (THE ULTIMATE GOAL)
                </div>
                <textarea class="e-input" id="lifeGoalMain" 
                    style="font-size: 1.1rem; font-weight: 500; border:none; background:transparent; padding:0;"
                    placeholder="ภาพชีวิตที่คุณต้องการเป็นจริงๆ คืออะไร? (ใช้ชีวิตยังไง?)" oninput="triggerGoalAutoSave()"></textarea>
            </div>

            <div class="life-goal-card dl-full">
                <div class="goal-section-title"><span>🚀</span> ระยะยาว (5 ปีข้างหน้า)</div>
                <textarea class="e-input" id="lifeGoalLong" 
                    style="border:none; background:transparent; padding:0;"
                    placeholder="อิสรภาพทางการเงิน, ระดับเพชร, การท่องเที่ยวโลก..." oninput="triggerGoalAutoSave()"></textarea>
                <div style="text-align:right;"><span class="gold-badge">Long-term Vision</span></div>
            </div>

            <div class="life-goal-card dl-full">
                <div class="goal-section-title"><span>📅</span> ระยะกลาง (1 ปีบัญชี)</div>
                <textarea class="e-input" id="lifeGoalMedium" 
                    style="border:none; background:transparent; padding:0;"
                    placeholder="ระดับ Platinum, รายได้คงที่, สายงานที่แข็งแกร่ง..." oninput="triggerGoalAutoSave()"></textarea>
                <div style="text-align:right;"><span class="gold-badge">Fiscal Year Goal</span></div>
            </div>

            <div class="life-goal-card dl-full">
                <div class="goal-section-title"><span>🔥</span> ระยะสั้น (1 เดือนนี้)</div>
                <textarea class="e-input" id="lifeGoalShort" 
                    style="border:none; background:transparent; padding:0;"
                    placeholder="เป้าหมาย 12%, การสร้าง BT ใหม่, จำนวนเคสที่ตั้งใจ..." oninput="triggerGoalAutoSave()"></textarea>
                <div style="text-align:right;"><span class="gold-badge">Monthly Action</span></div>
            </div>
        </div>

        <div class="drawer-right">
            <div class="card" style="background: #f8fafc; border: 1px solid #e2e8f0;">
                <h4 style="margin-bottom: 1.5rem; color: #1e293b; border-bottom: 2px solid #f39c12; display:inline-block; padding-bottom:5px;">
                    STATISTICS TO VICTORY
                </h4>

                <div class="e-group">
                    <label class="e-label">TARGET PV (เป้าหมายยอดธุรกิจ)</label>
                    <div class="rpg-stat-group" style="background: #fff;">
                        <span class="rpg-stat-label">⭐ VOLUME</span>
                        <input type="number" class="inline-input" id="goalPV" value="30000" style="font-weight:700; color:#1e293b;" oninput="triggerGoalAutoSave()">
                    </div>
                </div>

                <div class="e-group" style="margin-top:1.5rem;">
                    <label class="e-label">LEADERSHIP DEVELOPMENT (พัฒนาคน)</label>
                    <div class="rpg-stat-group" style="background: #fff;">
                        <span class="rpg-stat-label">⭐ NEW BT</span>
                        <input type="number" class="inline-input" id="goalPeople" placeholder="0" style="font-weight:700; color:#1e293b;" oninput="triggerGoalAutoSave()">
                    </div>
                </div>

                <div class="e-group" style="margin-top:1.5rem;">
                    <label class="e-label">MASTERY LEVEL (ทักษะพื้นฐาน 5+3)</label>
                    <div class="rpg-stat-group" style="background: #fff;">
                        <select class="rpg-star-select" id="goalSkill" style="width:100%; font-weight:600;" onchange="triggerGoalAutoSave()">
                            <option value="1">Level 1: 🐣 NOVICE (เริ่มเรียนรู้)</option>
                            <option value="2">Level 2: 🛠️ BUILDER (สาธิตได้)</option>
                            <option value="3">Level 3: 🎓 TEACHER (ถ่ายทอดได้)</option>
                            <option value="4">Level 4: 🎖️ COACH (สอนให้สอนต่อได้)</option>
                            <option value="5">Level 5: 💎 MASTER (เป็นแบบอย่าง)</option>
                        </select>
                    </div>
                </div>

                <div style="margin-top: 2rem; padding: 1rem; background: #fff; border-radius: 8px; font-size: 0.8rem; color: #64748b; line-height: 1.6;">
                    <strong>Success Tip:</strong> การตั้งเป้าหมายคือการเริ่มทำให้สิ่งที่มองไม่เห็น... กลายเป็นสิ่งที่มองเห็นได้จริง
                </div>

                <div style="margin-top: 2rem; display: flex; justify-content: space-between; align-items: center;">
                    <div class="save-status-indicator status-idle" id="goalSaveStatus">☁️ Cloud Synced</div>
                </div>
            </div>
        </div>
    </div>
`;
document.getElementById('goals').innerHTML = goalsTemplate;

// 2. ระบบดึงข้อมูลเป้าหมายจาก Google Sheets (โหลดเฉพาะข้อมูลของเดือนปัจจุบัน)
async function fetchGoals() {
    try {
        const response = await fetch(`${API_URL}?sheet=Goals_Master`);
        const result = await response.json();
        
        if (result.status === "success" && result.data.length > 0) {
            // หาวันที่และเดือนปัจจุบันในรูปแบบ MM-yyyy (เช่น "03-2026")
            const d = new Date();
            const currentMonthYear = String(d.getMonth() + 1).padStart(2, '0') + '-' + d.getFullYear();
            
            // หา Record ของเดือนนี้
            const currentGoal = result.data.find(g => g.MonthYear === currentMonthYear);
            
            if (currentGoal) {
                // แปลงข้อมูล Description จาก JSON สตริงกลับมาเป็น Object
                const desc = JSON.parse(currentGoal.Description || "{}");
                
                // นำค่าไปใส่ในช่อง Input
                document.getElementById('lifeGoalMain').value = desc.lifeGoalMain || '';
                document.getElementById('lifeGoalLong').value = desc.lifeGoalLong || '';
                document.getElementById('lifeGoalMedium').value = desc.lifeGoalMedium || '';
                document.getElementById('lifeGoalShort').value = desc.lifeGoalShort || '';
                
                document.getElementById('goalPV').value = currentGoal.TargetPV || '30000';
                document.getElementById('goalPeople').value = currentGoal.TargetPeople || '';
                document.getElementById('goalSkill').value = currentGoal.SkillLevel || '1';
                
                document.getElementById('goalsLastUpdate').innerText = 'DATABASE UPDATED: ' + formatDateTime(currentGoal.LastUpdate);
            }
        }
    } catch (error) {
        console.error("Error fetching goals:", error);
    }
}

// 3. ระบบ Auto-Save สำหรับหน้าเป้าหมาย
let goalSaveTimer = null;

function triggerGoalAutoSave() {
    const indicator = document.getElementById('goalSaveStatus');
    if (goalSaveTimer) clearTimeout(goalSaveTimer);
    
    indicator.className = 'save-status-indicator status-saving';
    indicator.innerHTML = '✍️ Saving...';

    // หน่วงเวลา 2 วินาทีหลังจากพิมพ์เสร็จ
    goalSaveTimer = setTimeout(() => {
        executeGoalSave();
    }, 2000);
}

async function executeGoalSave() {
    const indicator = document.getElementById('goalSaveStatus');
    indicator.innerHTML = '⏳ Syncing...';

    const goalData = {
        lifeGoalMain: document.getElementById('lifeGoalMain').value,
        lifeGoalLong: document.getElementById('lifeGoalLong').value,
        lifeGoalMedium: document.getElementById('lifeGoalMedium').value,
        lifeGoalShort: document.getElementById('lifeGoalShort').value,
        goalPV: document.getElementById('goalPV').value,
        goalPeople: document.getElementById('goalPeople').value,
        goalSkill: document.getElementById('goalSkill').value,
        lastUpdate: new Date().toISOString()
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'UPDATE_GOALS', data: goalData }),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });
        const result = await response.json();
        
        if (result.status === "success") {
            indicator.className = 'save-status-indicator status-success';
            indicator.innerHTML = '✅ Saved';
            document.getElementById('goalsLastUpdate').innerText = 'DATABASE UPDATED: ' + formatDateTime(goalData.lastUpdate);
            
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
        indicator.innerHTML = '❌ Network Error';
    }
}

// โหลดข้อมูลเป้าหมายทันที
fetchGoals();
