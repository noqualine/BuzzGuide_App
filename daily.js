// =========================================================================
// DAILY.JS - ระบบจัดการงานประจำวัน (Daily Focus To-Do List)
// =========================================================================

const dailyTemplate = `
    <style>
        .daily-task-item { display: flex; align-items: center; justify-content: space-between; background: var(--bg-base); padding: 15px; border-radius: 12px; margin-bottom: 12px; border: 1px solid var(--border-color); transition: all 0.3s ease; }
        .daily-task-item:hover { border-color: var(--primary); box-shadow: 0 4px 12px rgba(0,0,0,0.03); background: var(--bg-card); transform: translateX(5px); }
        .daily-task-item.completed { opacity: 0.6; background: var(--bg-card); border-style: dashed; }
        .daily-task-item.completed .task-text { text-decoration: line-through; color: var(--text-muted); }
        
        .task-check-btn { width: 26px; height: 26px; border-radius: 50%; border: 2px solid var(--text-muted); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; color: transparent; font-size: 0.85rem; flex-shrink: 0; background: transparent; }
        .daily-task-item.completed .task-check-btn { background: var(--success); border-color: var(--success); color: white; }
        .task-check-btn:hover { border-color: var(--primary); }
        
        .task-text { flex: 1; margin: 0 15px; font-size: 1rem; font-weight: 500; color: var(--text-main); transition: 0.2s; word-break: break-word; cursor: pointer; }
        
        .task-del-btn { background: transparent; border: none; color: var(--text-muted); cursor: pointer; opacity: 0.5; transition: 0.2s; font-size: 1.1rem; padding: 5px; border-radius: 6px; }
        .task-del-btn:hover { opacity: 1; color: var(--danger); background: #FEE2E2; transform: scale(1.1); }
        
        .daily-progress-container { background: var(--primary-light); padding: 20px; border-radius: 16px; margin-bottom: 25px; border: 1px solid var(--border-color); }
        .daily-progress-bar { width: 100%; height: 10px; background: rgba(0,0,0,0.05); border-radius: 50px; margin-top: 15px; overflow: hidden; }
        .daily-progress-fill { height: 100%; background: var(--primary); border-radius: 50px; transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1); width: 0%; }
    </style>

    <div class="card" style="max-width: 800px; margin: 0 auto;">
        
        <div class="daily-progress-container">
            <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                <div>
                    <h2 style="color: var(--primary); margin-bottom: 5px;">📅 งานประจำวัน (Daily Focus)</h2>
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">จัดการสิ่งที่ต้องทำในแต่ละวัน เพื่อสร้างวินัยสู่ความสำเร็จ</p>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary);" id="dailyPercent">0%</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">ความสำเร็จวันนี้</div>
                </div>
            </div>
            <div class="daily-progress-bar"><div class="daily-progress-fill" id="dailyProgressBar"></div></div>
        </div>

        <form onsubmit="addDailyTask(event)" style="display: flex; gap: 10px; margin-bottom: 25px;">
            <input type="text" id="newTaskInput" class="e-input" style="flex: 1; padding: 12px 15px; font-size: 1rem; border-radius: 10px;" placeholder="✍️ พิมพ์งานที่ต้องทำเพิ่มตรงนี้...">
            <button type="submit" class="btn-main" style="border-radius: 10px; padding: 0 20px;">เพิ่มงาน</button>
        </form>

        <div id="dailyTaskList">
            </div>
        
    </div>
`;

// ฝัง Template ลงในแท็บ Daily
const dailyContainer = document.getElementById('daily');
if (dailyContainer) { dailyContainer.innerHTML = dailyTemplate; }

// ==========================================
// ลอจิกการจัดการงาน (To-Do Logic)
// ==========================================

// โหลดข้อมูลจาก LocalStorage (ถ้าไม่มี ให้ใช้ค่าเริ่มต้น 3 ข้อนี้)
let dailyTasks = JSON.parse(localStorage.getItem('buzzGuideDaily')) || [
    { id: Date.now(), text: "🎧 ฟังลิงก์ / อ่านหนังสือพัฒนาตัวเอง 15 นาที", completed: false },
    { id: Date.now() + 1, text: "💬 ทักทายพูดคุยเปิดใจเพื่อนใหม่ 3 คน", completed: false },
    { id: Date.now() + 2, text: "📞 ติดตามผล (Follow Up) ผู้มุ่งหวัง/ลูกค้า", completed: false }
];

// ฟังก์ชันวาดรายการงาน
function renderDailyTasks() {
    const listContainer = document.getElementById('dailyTaskList');
    if (!listContainer) return;
    
    listContainer.innerHTML = '';
    
    if (dailyTasks.length === 0) {
        listContainer.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--text-muted); font-size: 0.9rem;">ยังไม่มีงานสำหรับวันนี้ 🎉<br>พักผ่อนหรือเพิ่มงานใหม่ได้เลยครับ!</div>`;
        updateDailyProgress();
        return;
    }

    // จัดเรียง: งานที่ยังไม่เสร็จอยู่บน งานที่เสร็จแล้วอยู่ล่าง
    const sortedTasks = [...dailyTasks].sort((a, b) => (a.completed === b.completed) ? 0 : a.completed ? 1 : -1);

    sortedTasks.forEach(task => {
        const item = document.createElement('div');
        item.className = `daily-task-item ${task.completed ? 'completed' : ''}`;
        
        item.innerHTML = `
            <button class="task-check-btn" onclick="toggleDailyTask(${task.id})">✔</button>
            <div class="task-text" onclick="toggleDailyTask(${task.id})">${task.text}</div>
            <button class="task-del-btn" onclick="deleteDailyTask(${task.id})" title="ลบงานนี้">🗑️</button>
        `;
        listContainer.appendChild(item);
    });

    updateDailyProgress();
}

// ฟังก์ชันคำนวณและอัปเดตแถบ Progress
function updateDailyProgress() {
    const total = dailyTasks.length;
    const completed = dailyTasks.filter(t => t.completed).length;
    let percent = 0;
    
    if (total > 0) {
        percent = Math.round((completed / total) * 100);
    }
    
    document.getElementById('dailyProgressBar').style.width = `${percent}%`;
    document.getElementById('dailyPercent').innerText = `${percent}%`;
    
    // เปลี่ยนสีแถบถ้าทำเสร็จ 100%
    if (percent === 100 && total > 0) {
        document.getElementById('dailyProgressBar').style.background = 'var(--success)';
        document.getElementById('dailyPercent').style.color = 'var(--success)';
    } else {
        document.getElementById('dailyProgressBar').style.background = 'var(--primary)';
        document.getElementById('dailyPercent').style.color = 'var(--primary)';
    }
}

// ฟังก์ชันเพิ่มงานใหม่
function addDailyTask(e) {
    e.preventDefault();
    const input = document.getElementById('newTaskInput');
    const text = input.value.trim();
    
    if (text) {
        const newTask = {
            id: Date.now(),
            text: text,
            completed: false
        };
        dailyTasks.unshift(newTask); // เพิ่มงานใหม่ไว้บนสุด
        saveDailyTasks();
        input.value = ''; // เคลียร์ช่องพิมพ์
    }
}

// ฟังก์ชันสลับสถานะ เสร็จ/ยังไม่เสร็จ
function toggleDailyTask(id) {
    const task = dailyTasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveDailyTasks();
    }
}

// ฟังก์ชันลบงาน
function deleteDailyTask(id) {
    dailyTasks = dailyTasks.filter(t => t.id !== id);
    saveDailyTasks();
}

// ฟังก์ชันบันทึกลงเครื่อง
function saveDailyTasks() {
    localStorage.setItem('buzzGuideDaily', JSON.stringify(dailyTasks));
    renderDailyTasks();
}

// เรียกใช้งานครั้งแรกตอนโหลดไฟล์
renderDailyTasks();