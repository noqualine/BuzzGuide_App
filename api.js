// =========================================================================
// API.JS - ศูนย์บัญชาการฐานข้อมูลส่วนกลาง (Centralized API Manager) V11.8
// หน้าที่: รับผิดชอบการคุยกับ Google Sheets ทั้งหมด (ดึง, สร้าง, แก้ไข, ลบ)
// =========================================================================

const API_URL = "https://script.google.com/macros/s/AKfycbzxkUXB8S1LhwJERDd4HlrsMTLmvAV-MWBya0jqeB5QTEa1tjsdX2aXV4GVDuJajZWRnQ/exec";

const DbAPI = {
    // 1. ดึงข้อมูลทั้งหมด (READ)
    async fetchAll() {
        try {
            const res = await fetch(`${API_URL}?sheet=Contacts_Master`);
            return await res.json();
        } catch (err) { console.error("Fetch Error:", err); return null; }
    },

    // 2. สร้างรายชื่อใหม่ (CREATE)
    async create(dataArray) {
        try {
            const res = await fetch(API_URL, { 
                method: 'POST', 
                body: JSON.stringify({ action: 'CREATE', sheet: "Contacts_Master", data: dataArray }), 
                headers: { 'Content-Type': 'text/plain;charset=utf-8' } 
            });
            return await res.json();
        } catch (err) { console.error("Create Error:", err); return null; }
    },

    // 3. อัปเดตข้อมูล (UPDATE)
    async update(id, payload) {
        try {
            const res = await fetch(API_URL, { 
                method: 'POST', 
                body: JSON.stringify({ action: 'UPDATE', sheet: "Contacts_Master", id: id, data: payload }), 
                headers: { 'Content-Type': 'text/plain;charset=utf-8' } 
            });
            return await res.json();
        } catch (err) { console.error("Update Error:", err); return null; }
    },

    // 4. ลบรายชื่อ (DELETE)
    async remove(id) {
        try {
            const res = await fetch(API_URL, { 
                method: 'POST', 
                body: JSON.stringify({ action: 'DELETE', sheet: "Contacts_Master", id: id }), 
                headers: { 'Content-Type': 'text/plain;charset=utf-8' } 
            });
            return await res.json();
        } catch (err) { console.error("Delete Error:", err); return null; }
    }
};