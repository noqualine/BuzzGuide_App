// ==========================================
// 📘 Buzz Guide Component (V14.2 - Mobile Fade In/Out Animation)
// ==========================================

const wsGroups = [
    { icon: '👨‍👩‍👧‍👦', title: 'ครอบครัว & ญาติ', subs: ['พ่อ-แม่', 'ปู่ ย่า ตา ยาย', 'พี่ น้อง', 'ลุง ป้า น้า อา', 'ลูกพี่ลูกน้อง', 'ลูก หลาน'] },
    { icon: '🎓', title: 'เพื่อน & ที่ทำงาน', subs: ['เพื่อนสนิท', 'เพื่อนในห้องเรียน', 'เพื่อนในคณะ', 'เพื่อนต่างคณะ', 'เพื่อนประถม', 'เพื่อนมัธยมต้น', 'เพื่อนมัธยมปลาย', 'เพื่อนเรียนพิเศษ', 'เพื่อนทำกิจกรรม', 'เพื่อนของเพื่อน', 'เพื่อนร่วมงาน', 'เพื่อนบ้าน', 'เพื่อนที่ทำงานเก่า', 'ที่ทำงานปัจจุบัน'] },
    { icon: '☕', title: 'ร้าน & บริการ', subs: ['ร้านอาหาร/กาแฟ', 'ช่างผม/เสริมสวย', 'หมอ/หมอฟัน/พยาบาล', 'ทนาย/นักบัญชี', 'ซ่อมรถ/ล้างรถ', 'ซักรีด/แม่บ้าน', 'เจ้าหน้าที่ธนาคาร', 'สัตวแพทย์', 'ร้านดอกไม้', 'ครู/อาจารย์', 'ร้านขายเครื่องประดับ/ของสะสม'] },
    { icon: '🏃‍♂️', title: 'ไลฟ์สไตล์ & อดิเรก', subs: ['ยิม/กีฬา', 'ดนตรี/ศิลปะ', 'ปาร์ตี้/สังสรรค์', 'สายบุญ/ศาสนา', 'คอร์สเรียน/สัมมนา', 'คนข้างบ้าน/ข้างห้อง', 'เจ้าของร้านอาหาร', 'แขกงานบวช/งานแต่ง', 'พ่อแม่ของเพื่อนลูก'] },
    { icon: '🛍️', title: 'เราเป็นลูกค้าเขา', subs: ['เซลล์ขายรถ', 'นายหน้าขายบ้าน/เจ้าของหอ', 'ตัวแทนประกัน', 'เซลล์แบงก์/บัตรเครดิต', 'แม่ค้าออนไลน์', 'เซลขายเฟอร์นิเจอร์', 'อู่รถ ล้างรถ'] },
    { icon: '🌟', title: 'คนที่คุณรู้จักที่มีนิสัย...', subs: ['ขยัน/ทำงานหนัก', 'มีหน้าที่การงานดี', 'มนุษยสัมพันธ์ดี', 'อยากมีรายได้เพิ่ม', 'รักความก้าวหน้า', 'มองหาโอกาส', 'รักสุขภาพ/ออกกำลังกาย', 'รักสวยรักงาม', 'ชอบช้อปปิ้ง', 'ที่บ้านทำธุรกิจ', 'มีรถขับ', 'มีลูกเล็ก', 'มีความเป็นผู้นำ', 'เพื่อนเยอะ'] }
];

let flatSteps = [];
wsGroups.forEach((g, gIdx) => {
    g.subs.forEach((s) => { flatSteps.push({ groupIdx: gIdx, group: g, subTitle: s }); });
});

let wsContacts = [];
let currentWsStep = 0;
let lastWsGroupIdx = -1; // 🌟 ตัวแปรใหม่สำหรับดักจับการเปลี่ยนหมวดหมู่เพื่อทำ Fade Animation

// ==========================================
// 🚀 WORKSHOP LOGIC & MINIMAL UI
// ==========================================

window.startMemoryJoggerWorkshop = function() {
    wsContacts = [];
    currentWsStep = 0;
    lastWsGroupIdx = -1; // รีเซ็ตค่า

    if (!document.getElementById('wsModal')) {
        const modalStyles = `
            <style>
                .ws-overlay { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); z-index: 999999; padding: 20px; box-sizing: border-box; opacity: 1 !important; visibility: visible !important; pointer-events: auto !important; }
                .ws-container { background: var(--bg-surface); width: 100%; max-width: 1000px; height: 85vh; border-radius: var(--radius-xl); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); display: flex; flex-direction: row; overflow: hidden; animation: wsPopIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
                .ws-left { width: 280px; background: var(--bg-body); border-right: 1px solid var(--border-color); display: flex; flex-direction: column; }
                .ws-right { flex: 1; display: flex; flex-direction: column; position: relative; overflow: hidden; }
                
                @keyframes wsPopIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

                /* 🌟 Navigator Menu CSS */
                .ws-nav-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-radius: 8px; border: 1px solid transparent; cursor: pointer; transition: 0.2s; user-select: none; }
                .ws-nav-item:hover { background: rgba(var(--primary-rgb), 0.05) !important; }
                .ws-nav-badge { background: var(--primary); color: #fff; padding: 2px 8px; border-radius: 50px; font-size: 0.75rem; font-weight: 700; }
                
                .ws-sub-nav-item { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 8px; cursor: pointer; transition: 0.2s; user-select: none; }
                .ws-sub-nav-item:hover { background: var(--bg-surface) !important; color: var(--primary) !important; }

                /* 💻 PC Styles (Accordion Animation) */
                @media (min-width: 769px) {
                    .ws-nav-scroll { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; }
                    .ws-main-nav { display: flex; flex-direction: column; gap: 4px; }
                    .mobile-only-sub { display: none !important; }
                    
                    .ws-sub-nav-pc { 
                        display: flex; flex-direction: column; gap: 2px; 
                        padding-left: 14px; margin-left: 14px; 
                        border-left: 2px solid transparent; 
                        overflow: hidden; 
                        transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease, margin 0.3s ease, border-color 0.3s ease; 
                    }
                    .ws-sub-nav-pc.active { 
                        max-height: 800px; opacity: 1; 
                        margin-top: 4px; margin-bottom: 12px; 
                        pointer-events: auto; border-left-color: var(--border-color); 
                    }
                    .ws-sub-nav-pc.inactive { 
                        max-height: 0; opacity: 0; 
                        margin-top: 0; margin-bottom: 0; 
                        pointer-events: none; border-left-color: transparent; 
                    }
                }

                /* 📱 Mobile Styles */
                @media (max-width: 768px) {
                    .ws-overlay { padding: 10px; align-items: flex-start; }
                    .ws-container { flex-direction: column; height: 100%; max-height: calc(100dvh - 20px); }
                    .ws-left { width: 100%; border-right: none; border-bottom: 1px solid var(--border-color); flex: none; }
                    .ws-mindset-box { display: none; }
                    .ws-header-title { font-size: 1.1rem !important; }
                    .ws-header-icon { font-size: 1.5rem !important; }
                    .ws-input-title { font-size: 1rem !important; }
                    .ws-keyboard-hints { display: none !important; }

                    .ws-nav-scroll { padding: 12px 10px; display: flex; flex-direction: column; gap: 10px; background: var(--bg-body); }
                    .ws-sub-nav-pc { display: none !important; }
                    
                    /* 🌟 ปรับปรุง Container ของเมนูลูกในมือถือ ให้รองรับ Fade In/Out */
                    .mobile-only-sub { display: flex; flex-direction: row; overflow-x: auto; gap: 6px; padding-bottom: 4px; scrollbar-width: none; opacity: 1; transition: opacity 0.2s ease-in-out; }
                    .mobile-only-sub::-webkit-scrollbar { display: none; }
                    
                    .ws-main-nav { display: flex; flex-direction: row; overflow-x: auto; gap: 6px; scroll-snap-type: x mandatory; padding-bottom: 4px; scrollbar-width: none; }
                    .ws-main-nav::-webkit-scrollbar { display: none; }
                    .ws-nav-item { scroll-snap-align: start; flex-shrink: 0; padding: 6px 12px; font-size: 0.85rem; border: 1px solid var(--border-color); }
                    .ws-sub-nav-item { flex-shrink: 0; padding: 4px 10px; font-size: 0.8rem; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 50px; }
                }

                /* 🌟 Minimal Button Styles */
                .ws-btn-minimal { background: none; border: none; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px; font-size: 0.95rem; padding: 8px 12px; border-radius: 8px; transition: 0.2s; }
                .ws-btn-minimal:hover { background: rgba(0,0,0,0.05); }
                body.is-dark .ws-btn-minimal:hover { background: rgba(255,255,255,0.05); }
                .ws-btn-minimal-primary { color: var(--primary); font-weight: 700; }
                .ws-btn-minimal-muted { color: var(--text-muted); }
            </style>
        `;

        const modalHTML = `
            ${modalStyles}
            <div id="wsModal" class="ws-overlay" style="display: none;">
                <div class="ws-container">
                    
                    <div class="ws-left">
                        <div class="ws-mindset-box" style="padding: 16px; border-bottom: 1px solid var(--border-color); background: rgba(var(--primary-rgb), 0.05);">
                            <h4 style="color: var(--primary); margin-bottom: 8px; font-size: 1rem;">🌟 กฎเหล็กทำรายชื่อ</h4>
                            <div style="font-size: 0.8rem; color: var(--text-main); line-height: 1.5; display: flex; flex-direction: column; gap: 6px;">
                                <div><b style="color:var(--danger);">🚫 1. ห้ามคิดแทน</b> จดลงไปก่อน</div>
                                <div><b style="color:var(--success);">✍️ 2. เขียนออกมาก่อน</b> เอาออกจากหัวให้หมด</div>
                            </div>
                        </div>
                        <div class="ws-nav-scroll">
                            <div id="wsMainNavArea" class="ws-main-nav"></div>
                            <div id="wsSubNavAreaMobile" class="mobile-only-sub"></div>
                        </div>
                    </div>

                    <div class="ws-right">
                        
                        <div id="wsRightHeader" style="padding: 16px 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface); flex-shrink: 0;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <span id="wsGroupIcon" class="ws-header-icon" style="font-size: 2rem;"></span>
                                <div>
                                    <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;" id="wsHeaderText">หมวดหมู่ปัจจุบัน</div>
                                    <h2 id="wsGroupTitle" class="ws-header-title" style="color: var(--primary); margin: 0; font-size: 1.3rem;"></h2>
                                </div>
                            </div>
                            <button onclick="closeWorkshop()" style="background:none; border:none; font-size:1.5rem; cursor:pointer; color: var(--text-muted); width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: var(--bg-body);">✕</button>
                        </div>

                        <div id="wsNormalBody" style="display: flex; flex-direction: column; flex: 1; overflow-y: auto;">
                            <div style="padding: 30px 24px 24px 24px; flex: 1; display: flex; flex-direction: column;">
                                
                                <div style="margin-bottom: 24px; overflow: hidden; position: relative;">
                                    <h3 id="wsQuestionContainer" class="ws-input-title" style="color: var(--text-main); font-size: 1.3rem; margin-bottom: 16px; transform: translateX(0); opacity: 1;"></h3>
                                    
                                    <input type="text" id="wsInput" class="e-input" autocomplete="off" autocorrect="off" style="width: 100%; font-size: 1.15rem; padding: 16px; border-width: 2px; border-color: var(--primary); box-shadow: var(--shadow-sm); border-radius: 12px; outline: none;" placeholder="พิมพ์ชื่อแล้วกด Enter หรือถัดไป...">
                                    
                                    <div class="ws-keyboard-hints" style="font-size: 0.8rem; color: var(--text-muted); margin-top: 12px; display: flex; gap: 12px;">
                                        <span><kbd style="background: var(--bg-body); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border-color); font-weight:600;">Enter</kbd> เพิ่ม</span>
                                        <span><kbd style="background: var(--bg-body); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border-color); font-weight:600;">Tab</kbd> ถัดไป</span>
                                        <span><kbd style="background: var(--bg-body); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border-color); font-weight:600;">Shift+Tab</kbd> ย้อนกลับ</span>
                                    </div>
                                </div>

                                <div style="flex: 1; min-height: 150px; background: var(--bg-body); border-radius: var(--radius-lg); padding: 16px; border: 1px dashed var(--border-color); display: flex; flex-direction: column;">
                                    <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted); margin-bottom: 12px; display: flex; justify-content: space-between;">
                                        <span>รายชื่อที่นึกออกในหมวดนี้:</span>
                                    </div>
                                    <div id="wsListArea" style="display: flex; flex-direction: column; gap: 8px; overflow-y: auto; flex: 1;"></div>
                                </div>
                            </div>
                            
                            <div style="padding: 12px 24px; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface); flex-shrink: 0;">
                                <button class="ws-btn-minimal ws-btn-minimal-muted" onclick="wsHandleNav(-1)">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg> ถอยหลัง
                                </button>
                                <div style="font-weight: 600; color: var(--text-muted); font-size: 0.85rem; opacity: 0.8;" id="wsTotalBadge">รวม: 0 คน</div>
                                <button class="ws-btn-minimal ws-btn-minimal-primary" onclick="wsHandleNav(1)" id="wsBtnNext">
                                    ถัดไป <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                </button>
                            </div>
                        </div>

                        <div id="wsFinishBody" style="display: none; flex-direction: column; flex: 1; align-items: center; justify-content: center; padding: 40px 20px; text-align: center; background: var(--bg-surface); overflow-y: auto;">
                            <div style="font-size: 5rem; margin-bottom: 20px; animation: wsPopIn 0.5s ease;">🎉</div>
                            <h2 style="color: var(--primary); margin-bottom: 12px;">สุดยอดมาก! เวิร์กชอปสำเร็จแล้ว</h2>
                            <p style="color: var(--text-main); font-size: 1.1rem; margin-bottom: 30px;">คุณเค้นรายชื่อออกมาได้ทั้งหมด <b style="color: var(--primary); font-size: 1.5rem;" id="wsFinalCount">0</b> คน</p>
                            
                            <button id="wsBtnSaveFinal" class="btn btn-primary" style="font-size: 1.1rem; padding: 16px 32px; border-radius: 50px; box-shadow: var(--shadow-md); width: 100%; max-width: 300px; margin-bottom: 16px;" onclick="wsSaveToDatabase()">
                                💾 บันทึกเข้าระบบ
                            </button>
                            <button class="ws-btn-minimal ws-btn-minimal-muted" onclick="wsGoBackToEdit()">
                                ⬅️ กลับไปแก้ไข / เพิ่มเติม
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const inputEl = document.getElementById('wsInput');
        inputEl.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                wsAddCurrentName();
            } else if (e.key === 'Tab') {
                e.preventDefault();
                wsAddCurrentName();
                if (e.shiftKey) wsHandleNav(-1);
                else wsHandleNav(1);
            }
        });
    }

    document.getElementById('wsMainNavArea').innerHTML = '';
    document.getElementById('wsNormalBody').style.display = 'flex';
    document.getElementById('wsFinishBody').style.display = 'none';
    
    const modal = document.getElementById('wsModal');
    modal.style.display = 'flex';
    
    wsRenderStep(0); 
    setTimeout(() => { document.getElementById('wsInput').focus(); }, 300);
};

window.closeWorkshop = function() {
    if (wsContacts.length > 0 && !confirm("คุณมีรายชื่อที่ยังไม่ได้บันทึก แน่ใจหรือไม่ว่าจะปิด?")) return;
    const modal = document.getElementById('wsModal');
    if (modal) modal.style.display = 'none';
};

window.wsAddCurrentName = function() {
    const input = document.getElementById('wsInput');
    const name = input.value.trim();
    if (!name) return;

    const currentData = flatSteps[currentWsStep];
    wsContacts.push({
        PersonID: 'temp_' + Date.now() + Math.floor(Math.random() * 1000),
        Name: name,
        Contact_Type: 'Memory Jogger',
        Relation_Jogger: currentData.subTitle,
        Group_Jogger: currentData.group.title,
        Score_Friendly: 5, Score_Active: 5, Score_Relation: 5, Score_Money: 5, 
        Current_Status: 'ลิสต์รายชื่อ',
        Note: `💡 นึกถึงจากหมวด: ${currentData.group.title} (${currentData.subTitle})\n`
    });

    input.value = '';
    wsRenderList();
    wsRenderProgress();
};

window.wsRemoveName = function(id) {
    wsContacts = wsContacts.filter(c => c.PersonID !== id);
    wsRenderList();
    wsRenderProgress();
};

window.wsHandleNav = function(dir) {
    wsAddCurrentName();
    let nextStep = currentWsStep + dir;
    if (nextStep < 0) nextStep = 0;
    
    if (nextStep >= flatSteps.length) {
        wsShowFinishScreen();
        return;
    }

    currentWsStep = nextStep;
    wsRenderStep(dir); 
};

window.wsJumpToStep = function(targetIndex) {
    if (targetIndex === currentWsStep) return;
    const input = document.getElementById('wsInput');
    if (input && input.value.trim()) wsAddCurrentName();

    const direction = targetIndex > currentWsStep ? 1 : -1;
    currentWsStep = targetIndex;
    wsRenderStep(direction);
};

window.wsRenderStep = function(direction = 0) {
    const data = flatSteps[currentWsStep];
    
    document.getElementById('wsGroupIcon').innerText = data.group.icon;
    document.getElementById('wsGroupTitle').innerText = data.group.title;
    document.getElementById('wsHeaderText').innerText = "หมวดหมู่ปัจจุบัน";
    
    const titleContainer = document.getElementById('wsQuestionContainer');
    
    if (direction !== 0) {
        titleContainer.style.transition = 'all 0.2s ease-in-out';
        titleContainer.style.opacity = '0';
        titleContainer.style.transform = `translateX(${direction * -20}px)`; 
        
        setTimeout(() => {
            updateQuestionText(data, titleContainer);
            titleContainer.style.transition = 'none';
            titleContainer.style.transform = `translateX(${direction * 20}px)`;
            void titleContainer.offsetWidth;
            
            titleContainer.style.transition = 'all 0.2s ease-in-out';
            titleContainer.style.opacity = '1';
            titleContainer.style.transform = 'translateX(0)';
        }, 200);
    } else {
        updateQuestionText(data, titleContainer);
    }
    
    document.getElementById('wsInput').focus();
    wsRenderList();
    wsRenderProgress(); 
};

function updateQuestionText(data, container) {
    if (data.groupIdx === 5) { 
        container.innerHTML = `นึกถึง... <span style="color: var(--primary); text-decoration: underline; font-weight: 800;">คนที่${data.subTitle}</span>`;
    } else {
        container.innerHTML = `นึกถึง... <span style="color: var(--primary); text-decoration: underline; font-weight: 800;">"${data.subTitle}"</span> ของคุณ`;
    }
}

window.wsRenderList = function() {
    const data = flatSteps[currentWsStep];
    const area = document.getElementById('wsListArea');
    area.innerHTML = '';
    
    const filtered = wsContacts.filter(c => c.Relation_Jogger === data.subTitle && c.Group_Jogger === data.group.title);
    
    if (filtered.length === 0) {
        area.innerHTML = '<div style="color: var(--text-light); font-style: italic; text-align: center; margin-top: 30px; font-size: 0.9rem;">(พิมพ์ชื่อด้านบน แล้วกด Enter)</div>';
    } else {
        filtered.forEach((c, i) => {
            area.innerHTML += `
                <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface); padding: 10px 14px; border-radius: 8px; border-left: 4px solid var(--primary); box-shadow: var(--shadow-sm); animation: wsPopIn 0.2s ease;">
                    <span style="font-weight: 600; color: var(--text-main); font-size: 0.95rem;">${i+1}. ${c.Name}</span>
                    <button onclick="wsRemoveName('${c.PersonID}')" style="background:none; border:none; color: var(--danger); cursor:pointer; font-size: 1.1rem; padding: 0 4px;">✕</button>
                </div>
            `;
        });
    }
    document.getElementById('wsTotalBadge').innerText = `รวม: ${wsContacts.length} คน`;
    
    const btnNext = document.getElementById('wsBtnNext');
    if (currentWsStep === flatSteps.length - 1) {
        btnNext.innerHTML = `ตรวจสอบ 🎉`;
    } else {
        btnNext.innerHTML = `ถัดไป <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
    }
};

window.wsRenderProgress = function() {
    const mainArea = document.getElementById('wsMainNavArea');
    const mobileSubArea = document.getElementById('wsSubNavAreaMobile');
    
    if (!mainArea.hasChildNodes()) {
        let initialHtml = '';
        wsGroups.forEach((g, idx) => {
            const firstStepIdx = flatSteps.findIndex(s => s.groupIdx === idx);
            let pcItems = '';
            
            g.subs.forEach((sub, subIdx) => {
                const stepIdx = flatSteps.findIndex(s => s.groupIdx === idx && s.subTitle === sub);
                pcItems += `
                    <div class="ws-sub-nav-item" id="nav-pc-subitem-${stepIdx}" onclick="wsJumpToStep(${stepIdx})">
                        <span class="nav-icon" style="font-size: 0.75rem; opacity: 0.8; width: 14px; text-align: center;">○</span>
                        <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${sub}">${sub}</span>
                    </div>
                `;
            });

            initialHtml += `
                <div class="ws-nav-group-container">
                    <div class="ws-nav-item" id="nav-main-item-${idx}" onclick="wsJumpToStep(${firstStepIdx})">
                        <span class="nav-title" style="white-space: nowrap; font-size: 0.95rem;">${idx+1}. ${g.title}</span>
                        <span class="ws-nav-badge" id="nav-badge-${idx}" style="display:none;">0</span>
                    </div>
                    <div class="ws-sub-nav-pc inactive" id="nav-pc-subgroup-${idx}">
                        ${pcItems}
                    </div>
                </div>
            `;
        });
        mainArea.innerHTML = initialHtml;
    }

    const data = flatSteps[currentWsStep];
    const currentGroupIdx = data.groupIdx;

    wsGroups.forEach((g, idx) => {
        const countInGroup = wsContacts.filter(c => c.Group_Jogger === g.title).length;
        const isActiveGroup = idx === currentGroupIdx;
        
        const mainItem = document.getElementById(`nav-main-item-${idx}`);
        if (mainItem) {
            mainItem.style.background = isActiveGroup ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent';
            mainItem.style.borderColor = isActiveGroup ? 'var(--primary)' : 'transparent';
            const titleSpan = mainItem.querySelector('.nav-title');
            titleSpan.style.color = isActiveGroup ? 'var(--primary)' : 'var(--text-muted)';
            titleSpan.style.fontWeight = isActiveGroup ? '700' : '500';
            
            const badge = document.getElementById(`nav-badge-${idx}`);
            if (countInGroup > 0) {
                badge.style.display = 'inline-block';
                badge.innerText = countInGroup;
            } else {
                badge.style.display = 'none';
            }
        }

        const subGroupContainer = document.getElementById(`nav-pc-subgroup-${idx}`);
        if (subGroupContainer) {
            subGroupContainer.className = isActiveGroup ? 'ws-sub-nav-pc active' : 'ws-sub-nav-pc inactive';
        }

        g.subs.forEach((sub, subIdx) => {
            const stepIdx = flatSteps.findIndex(s => s.groupIdx === idx && s.subTitle === sub);
            const isCompleted = stepIdx < currentWsStep;
            const isSubActive = stepIdx === currentWsStep;
            
            const subItem = document.getElementById(`nav-pc-subitem-${stepIdx}`);
            if (subItem) {
                subItem.style.color = isSubActive ? 'var(--primary)' : (isCompleted ? 'var(--text-main)' : 'var(--text-muted)');
                subItem.style.fontWeight = isSubActive ? '700' : '400';
                subItem.style.background = isSubActive ? 'var(--bg-surface)' : 'transparent';
                subItem.querySelector('.nav-icon').innerText = isSubActive ? '▶️' : (isCompleted ? '✓' : '○');
            }
        });
    });

    // 📱 จัดการเมนูมือถือ (Fade In/Out เมื่อเปลี่ยนหมวดหมู่หลัก)
    if (mobileSubArea && window.innerWidth <= 768) {
        let mobileSubHtml = '';
        data.group.subs.forEach((sub, subIdx) => {
            const stepIdx = flatSteps.findIndex(s => s.groupIdx === currentGroupIdx && s.subTitle === sub);
            const isCompleted = stepIdx < currentWsStep;
            const isSubActive = stepIdx === currentWsStep;
            
            const subColor = isSubActive ? 'var(--primary)' : (isCompleted ? 'var(--text-main)' : 'var(--text-muted)');
            const subFw = isSubActive ? '700' : '400';
            const icon = isSubActive ? '▶️' : (isCompleted ? '✓' : '○');
            const subBg = isSubActive ? 'var(--bg-surface)' : 'transparent';

            mobileSubHtml += `
                <div class="ws-sub-nav-item" style="color: ${subColor}; font-weight: ${subFw}; background: ${subBg};" onclick="wsJumpToStep(${stepIdx})">
                    <span style="font-size: 0.7rem; opacity: 0.8; width: 14px; text-align: center;">${icon}</span>
                    <span style="white-space: nowrap;">${sub}</span>
                </div>
            `;
        });

        // 🌟 เช็คว่าเปลี่ยนหมวดหมู่หลักหรือเปล่า ถ้าเปลี่ยนให้ทำ Fade Out -> Swap -> Fade In
        if (currentGroupIdx !== lastWsGroupIdx) {
            mobileSubArea.style.opacity = '0'; // เฟดออก
            
            setTimeout(() => {
                mobileSubArea.innerHTML = mobileSubHtml; // วางเนื้อหาใหม่
                mobileSubArea.style.opacity = '1'; // เฟดเข้า
                
                // เลื่อนให้อยู่ตรงกลางหลังจากเนื้อหาถูกวาดแล้ว
                const activeMain = document.getElementById(`nav-main-item-${currentGroupIdx}`);
                if(activeMain) activeMain.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                
                const activeSubIdx = data.group.subs.indexOf(data.subTitle);
                if(mobileSubArea.children[activeSubIdx]) {
                    mobileSubArea.children[activeSubIdx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }
            }, 200); // รอให้เฟดออกเสร็จก่อน (200ms ตามที่กำหนดใน CSS)
            
        } else {
            // ถ้าไม่ได้เปลี่ยนหมวดหมู่หลัก (แค่เลื่อนข้อในหมวดเดิม) อัปเดต HTML ทันที ไม่ต้องเฟดใหม่ทั้งแผง
            mobileSubArea.innerHTML = mobileSubHtml;
            const activeSubIdx = data.group.subs.indexOf(data.subTitle);
            if(mobileSubArea.children[activeSubIdx]) {
                mobileSubArea.children[activeSubIdx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
        
        lastWsGroupIdx = currentGroupIdx; // บันทึกค่าไว้เช็คในรอบถัดไป
    }
};

window.wsShowFinishScreen = function() {
    document.getElementById('wsNormalBody').style.display = 'none';
    document.getElementById('wsFinishBody').style.display = 'flex';
    document.getElementById('wsFinalCount').innerText = wsContacts.length;
    document.getElementById('wsGroupIcon').innerText = '🎉';
    document.getElementById('wsGroupTitle').innerText = 'ตรวจสอบข้อมูล';
    document.getElementById('wsHeaderText').innerText = 'ขั้นตอนสุดท้าย';
};

window.wsGoBackToEdit = function() {
    document.getElementById('wsFinishBody').style.display = 'none';
    document.getElementById('wsNormalBody').style.display = 'flex';
    currentWsStep = flatSteps.length - 1;
    wsRenderStep(0);
};

window.wsSaveToDatabase = async function() {
    if (wsContacts.length === 0) { alert('ไม่มีรายชื่อให้บันทึก'); return; }
    
    const btn = document.getElementById('wsBtnSaveFinal');
    btn.disabled = true;
    btn.innerHTML = 'กำลังบันทึก... ⏳';

    const timestamp = new Date().toISOString();
    const payloadArray = wsContacts.map(c => {
        return { ...c, PersonID: "P" + Date.now() + Math.floor(Math.random() * 1000), Date_Added: timestamp, Last_Update: timestamp };
    });

    try {
        const result = await DbAPI.create(payloadArray);
        if (result && result.status === "success") {
            contactsData = [...payloadArray, ...contactsData]; 
            localStorage.setItem('buzzGuideContacts', JSON.stringify(contactsData)); 
            
            document.getElementById('wsModal').style.display = 'none';
            switchView('contacts');
            renderTable();
            updateDashboard();
            alert(`✅ บันทึกรายชื่อใหม่ ${payloadArray.length} คน สำเร็จแล้ว!`);
        } else { throw new Error('API Failed'); }
    } catch (e) {
        alert('❌ การเชื่อมต่อล้มเหลว หรือบันทึกไม่สำเร็จ');
        btn.disabled = false; btn.innerHTML = '💾 บันทึกเข้าระบบ';
    }
};

// ==========================================
// 🎨 RENDER MAIN VIEW (หน้าแรกของคู่มือ)
// ==========================================

function renderGuideView() {
    const container = document.getElementById('guide-view');
    if (!container) return;

    let html = `
        <div class="settings-wrapper" style="max-width: 900px; margin: 0 auto; padding-bottom: 40px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: var(--primary); margin-bottom: 8px; font-size: 2rem;">📘 คู่มือทำรายชื่อ (Buzz Guide)</h2>
                <p style="color: var(--text-muted); font-size: 1rem;">ทฤษฎีการคัดกรอง และเวิร์กชอปเค้นรายชื่อ</p>
            </div>

            <div class="settings-card" style="border-left: 4px solid var(--primary); margin-bottom: 24px;">
                <div class="settings-header" style="background: var(--bg-body);">
                    <div class="settings-title" style="color: var(--primary);">💼 1. Sponsor Name List (คัดกรองนักธุรกิจ)</div>
                    <div class="settings-desc">หลักการวิเคราะห์ศักยภาพด้วย FARM</div>
                </div>
                <div class="settings-body" style="line-height: 1.6;">
                    <p style="margin-bottom: 16px; color: var(--text-main);">เมื่อเพิ่มรายชื่อแล้ว ให้คะแนน (1-10) ในหน้า Profile เพื่อค้นหาคนที่มีความพร้อม:</p>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                        <div style="background: var(--bg-body); padding: 12px; border-radius: var(--radius-md);">
                            <strong style="color: var(--primary);">F - Friendly (อัธยาศัย)</strong>
                            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">คุยง่าย เปิดรับสิ่งใหม่ๆ เข้ากับคนอื่นได้ดี</p>
                        </div>
                        <div style="background: var(--bg-body); padding: 12px; border-radius: var(--radius-md);">
                            <strong style="color: var(--primary);">A - Active (ขยันขันแข็ง)</strong>
                            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">ไม่พอใจชีวิตแค่นี้ กระตือรือร้น มองหาโอกาส</p>
                        </div>
                        <div style="background: var(--bg-body); padding: 12px; border-radius: var(--radius-md);">
                            <strong style="color: var(--primary);">R - Relation (สายสัมพันธ์)</strong>
                            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">สนิทกับเรา ชวนคุยง่าย นัดออกมาเจอง่าย</p>
                        </div>
                        <div style="background: var(--bg-body); padding: 12px; border-radius: var(--radius-md);">
                            <strong style="color: var(--primary);">M - Motive (กำลังซื้อ/แรงจูงใจ)</strong>
                            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">มีกำลังซื้อ หรือมีแรงผลักดันอยากสำเร็จสูง</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="settings-card" style="border-left: 4px solid var(--primary); margin-bottom: 30px;">
                <div class="settings-header" style="background: var(--bg-body);">
                    <div class="settings-title" style="color: var(--primary);">🛒 2. Customer Name List (คัดกรองผู้บริโภค)</div>
                    <div class="settings-desc">สำหรับคนที่ยังไม่พร้อมทำธุรกิจ แต่มีความต้องการใช้สินค้า</div>
                </div>
                <div class="settings-body" style="line-height: 1.6;">
                    <div style="display: flex; gap: 16px; flex-wrap: wrap;">
                        <div style="flex: 1; min-width: 250px; background: var(--bg-body); padding: 16px; border-radius: var(--radius-md);">
                            <strong style="color: var(--primary); font-size: 1.05rem;">💪 กลุ่มสุขภาพ (Health & Wellness)</strong>
                            <ul style="margin-left: 16px; font-size: 0.9rem; color: var(--text-muted); margin-top: 8px; line-height: 1.8;">
                                <li><b>ลดน้ำหนัก/หุ่นดี:</b> โฟกัส BodyKey, 6WNY</li>
                                <li><b>รักครอบครัว:</b> โฟกัส eSpring, Atmosphere</li>
                            </ul>
                        </div>
                        <div style="flex: 1; min-width: 250px; background: var(--bg-body); padding: 16px; border-radius: var(--radius-md);">
                            <strong style="color: var(--primary); font-size: 1.05rem;">✨ กลุ่มความงาม (Beauty)</strong>
                            <ul style="margin-left: 16px; font-size: 0.9rem; color: var(--text-muted); margin-top: 8px; line-height: 1.8;">
                                <li><b>ดูแลผิว/แต่งหน้า:</b> โฟกัส Artistry</li>
                                <li><b>มีปัญหาผิว:</b> สิว, ริ้วรอย, ฝ้ากระ</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div style="background: linear-gradient(135deg, var(--bg-surface) 0%, rgba(var(--primary-rgb), 0.05) 100%); border: 2px dashed var(--primary); border-radius: var(--radius-xl); padding: 40px 20px; text-align: center; box-shadow: var(--shadow-md);">
                <div style="font-size: 4rem; margin-bottom: 16px; animation: wsPopIn 0.8s ease;">🧠</div>
                <h2 style="color: var(--primary); margin-bottom: 12px;">Memory Jogger Workshop</h2>
                <p style="color: var(--text-main); font-size: 1.05rem; margin-bottom: 24px; max-width: 600px; margin-left: auto; margin-right: auto;">
                    ได้เวลาลงมือทำ! ระบบจะพาคุณนึกรายชื่อทีละหมวดหมู่<br>เพียงแค่ <b>"พิมพ์ชื่อ แล้วกด ถัดไป (หรือ Enter)"</b>
                </p>
                <button class="btn btn-primary" style="font-size: 1.2rem; padding: 16px 40px; border-radius: 50px; box-shadow: var(--shadow-md); text-transform: uppercase; font-weight: 700; letter-spacing: 1px;" onclick="startMemoryJoggerWorkshop()">
                    🚀 เริ่มทำ Workshop ทันที
                </button>
            </div>

        </div>
    `;

    container.innerHTML = html;
}

// 🌟 สั่งให้วาดหน้าคู่มือทันทีที่โหลดเสร็จ
renderGuideView();