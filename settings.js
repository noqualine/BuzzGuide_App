// =========================================================================
// SETTINGS.JS - ระบบตั้งค่าและ Pokémon Themes (V11.3)
// =========================================================================

// 🌟 ฟังก์ชัน Theme (V11.6 - Smart Color Update on Topbar Pokéball)
function setTheme(name, el) {
    // 1. ถอดคลาสที่เป็น theme- และ is-dark ทั้งหมดออกแบบอัตโนมัติ
    document.body.className = document.body.className.replace(/\btheme-\S+/g, '').trim();
    document.body.classList.remove('is-dark');
    
    // 2. ใส่คลาสใหม่
    document.body.classList.add(`theme-${name}`);
    
    // 3. เช็คว่าเป็น Dark Mode (Gastly, Mew) หรือไม่
    if (name === 'gastly' || name === 'mew') {
        document.body.classList.add('is-dark');
    }
    
    // 4. อัปเดตการเรืองแสงของ Pokéball ในหน้าจอ Settings (ถ้าเปิดอยู่)
    document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
    if (el) {
        el.classList.add('active');
    } else {
        const savedOpt = document.querySelector(`.theme-option[title="${name}"]`);
        if (savedOpt) savedOpt.classList.add('active');
    }
    
    // 🌟 5. [เพิ่มใหม่ V11.6] อัปเดตสี Pokéball จิ๋วบน Topbar ทันที!
    const themeColorMap = {
        'pikachu': '#FACC15',    // เหลือง
        'charmander': '#F97316', // ส้ม
        'squirtle': '#0EA5E9',   // ฟ้า
        'bulbasaur': '#10B981',  // เขียว
        'mew': '#F472B6',        // ชมพู
        'gastly': '#A855F7'      // ม่วง
    };
    
    const topbarBall = document.getElementById('topbarPokeball');
    if (topbarBall) {
        // สั่งเปลี่ยนค่าสีครึ่งบนของลูกบอลจิ๋ว ตามชื่อ Theme ที่เลือก
        topbarBall.style.setProperty('--ball-color', themeColorMap[name] || '#FACC15');
    }
    
    localStorage.setItem('buzzGuideTheme', name);
}

// โหลด Theme ทันทีที่หน้าเว็บพร้อม
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('buzzGuideTheme') || 'pikachu';
    setTheme(savedTheme);
});