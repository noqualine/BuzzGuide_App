// =========================================
// APP.JS - ระบบส่วนกลาง (Global System)
// =========================================

// 1. ตั้งค่า API (ลิงก์ Google Apps Script)
const API_URL = "https://script.google.com/macros/s/AKfycbxmldbHzjaJ0uys-unn3NPnuK12As8Z9-0ofOBDqjrkSUMzI1uuyHUbjW4xunakPz_MNA/exec";

// 2. ฟังก์ชันอรรถประโยชน์ (Utility Functions) ที่ใช้ร่วมกันทั้งแอป
function formatDateTime(dateString) {
    if (!dateString) return '-';
    const d = new Date(dateString);
    if (isNaN(d)) return dateString;
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear() + 543} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function generateShortID(dataArray) {
    if (!dataArray || dataArray.length === 0) return 'N0001';
    const ids = dataArray.map(p => { 
        const match = p.PersonID ? p.PersonID.match(/\d+/) : null; 
        return match ? parseInt(match[0]) : 0; 
    }).sort((a, b) => b - a);
    return 'N' + String((ids[0] || 0) + 1).padStart(4, '0');
}

// 3. ระบบ Theme
function initTheme() {
    const savedTheme = localStorage.getItem('buzzTheme') || 'morning';
    document.body.setAttribute('data-theme', savedTheme);
    const select = document.getElementById('themeSelect');
    if(select) select.value = savedTheme;
}

function changeTheme(themeName) {
    document.body.setAttribute('data-theme', themeName);
    localStorage.setItem('buzzTheme', themeName);
}

// 4. ระบบ Login
function verifyPIN() {
    const pin = document.getElementById('pinInput').value;
    if (pin === '1234' || true) { // ทิ้ง || true ไว้เพื่อข้าม Login ตอนพัฒนา
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('appContent').style.display = 'flex'; 
        
        // โหลดข้อมูลเมื่อเข้าแอปสำเร็จ
        if (typeof fetchContacts === 'function') fetchContacts();
        if (typeof fetchGoals === 'function') fetchGoals();
    } else { 
        alert('รหัส PIN ไม่ถูกต้อง'); 
        document.getElementById('pinInput').value = ''; 
    }
}

function handleEnter(e) { if (e.key === 'Enter') verifyPIN(); }

// 5. ระบบสลับหน้าจอ (Navigation)
function switchTab(tabId, btn) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelectorAll('.nav-links button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

// ข้ามล็อกอินเพื่อทดสอบการพัฒนา (ลบ 2 บรรทัดนี้ออกถ้าอยากใช้ PIN)
document.getElementById('loginScreen').style.display = 'none';
document.getElementById('appContent').style.display = 'flex';
initTheme();
