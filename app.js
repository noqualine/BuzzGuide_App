// =========================================================================
// APP.JS - Core Application Logic (Buzz Guide - Cark UI Edition)
// =========================================================================

const API_URL = "https://script.google.com/macros/s/AKfycbzxkUXB8S1LhwJERDd4HlrsMTLmvAV-MWBya0jqeB5QTEa1tjsdX2aXV4GVDuJajZWRnQ/exec";

// -----------------------------------------
// 1. INITIALIZE (ทำงานทันทีที่โหลดแอป)
// -----------------------------------------
window.onload = () => {
    // โหลดธีมสีที่เคยบันทึกไว้ในเครื่อง (ถ้าไม่มีให้ใช้ default)
    const savedTheme = localStorage.getItem('buzzGuideTheme') || 'default';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // อัปเดต Dropdown ให้ตรงกับธีมที่โหลดมา
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) themeSelect.value = savedTheme;

    // ตั้งค่าชื่อหน้าแรก
    updatePageTitle('contacts');
};

// -----------------------------------------
// 2. SIDEBAR MANAGEMENT (ระบบเมนูซ้ายมือ)
// -----------------------------------------
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    if (sidebar && overlay) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }
}

// ฟังก์ชันซ่อนเมนูอัตโนมัติบนมือถือ (ทำงานเมื่อกดเลือกเมนูแล้ว)
function toggleSidebarMobile() {
    if (window.innerWidth <= 900) {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');
        if (sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        }
    }
}

// -----------------------------------------
// 3. TAB MANAGEMENT (ระบบเปลี่ยนหน้าจอ)
// -----------------------------------------
function switchTab(tabId, btn) {
    // 1. ซ่อนทุก Section
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    
    // 2. ลบสถานะ Active ของปุ่มเมนูทั้งหมด
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    
    // 3. แสดง Section ที่เลือก
    const activeSection = document.getElementById(tabId);
    if (activeSection) activeSection.classList.add('active');
    
    // 4. ไฮไลต์ปุ่มที่ถูกกด
    if (btn) btn.classList.add('active');

    // 5. เปลี่ยนข้อความบน Header ให้ตรงกับหน้า
    updatePageTitle(tabId);
}

// ฟังก์ชันเปลี่ยนชื่อหัวเรื่องด้านบน
function updatePageTitle(tabId) {
    const titleEl = document.getElementById('pageTitleText');
    if (!titleEl) return;
    
    if (tabId === 'contacts') titleEl.innerText = 'ผู้มุ่งหวัง (Contacts)';
    else if (tabId === 'goals') titleEl.innerText = 'เป้าหมาย (Goals)';
    else if (tabId === 'daily') titleEl.innerText = 'งานประจำวัน (Daily)';
}

// -----------------------------------------
// 4. THEME MANAGEMENT (ระบบเปลี่ยนธีมสี)
// -----------------------------------------
function changeTheme(themeName) {
    // เปลี่ยนธีมโดยใช้ Attribute ที่ tag HTML (documentElement)
    document.documentElement.setAttribute('data-theme', themeName);
    // บันทึกการตั้งค่าลงเครื่อง (Cache)
    localStorage.setItem('buzzGuideTheme', themeName);
}

// -----------------------------------------
// 5. LOGIN SYSTEM (ระบบเข้าสู่ระบบ)
// -----------------------------------------
function verifyPIN() {
    const pinInput = document.getElementById('pinInput');
    const pin = pinInput.value;
    
    // รหัสผ่านเข้าใช้งาน (ปรับเปลี่ยนได้ตามต้องการ)
    if (pin === '1234') { 
        // ซ่อนหน้า Login
        document.getElementById('loginScreen').style.display = 'none';
        
        // แสดงหน้าจอหลัก (ต้องใช้ display: flex เพื่อให้ Sidebar และ Content แบ่งสัดส่วนกัน)
        document.getElementById('appContent').style.display = 'flex'; 
        
        // สั่งโหลดข้อมูลผู้มุ่งหวังทันทีที่เข้าสู่ระบบสำเร็จ
        if (typeof fetchContacts === "function") fetchContacts();
    } else {
        alert('❌ รหัส PIN ไม่ถูกต้อง!');
        pinInput.value = ''; 
        pinInput.focus();
    }
}

// กด Enter เพื่อล็อกอินได้เลย
function handleEnter(e) { 
    if (e.key === 'Enter') verifyPIN(); 
}