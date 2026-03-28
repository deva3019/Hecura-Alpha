// js/overall.js

const STUDENTS_KEY = 'symposium_students';
let allData = [];

// Event list for dropdown (matches registration)
const ALL_EVENTS = [
    "Frontend Jam", "Tech Clash", "Prompt to Pixel", "Ideathon", "Project Presentation", "Mind Relay", "Brand-Craft", "Blind Code", "Speed-Keys",
    "Fake-it", "Meme-Forge", "Silent Signals", "Frame the Moment", "Connexion", "Sticker on Forehead",
    "Free Fire", "BGMI", "Chess"
];

document.addEventListener('DOMContentLoaded', () => {
    const session = checkAuth(); 
    if (!session) return;
    document.getElementById('topLaptopId').textContent = session.laptop;

    // Populate Event Filter Dropdown
    const evtSelect = document.getElementById('eventFilter');
    ALL_EVENTS.forEach(evt => {
        const opt = document.createElement('option');
        opt.value = evt;
        opt.innerText = evt;
        evtSelect.appendChild(opt);
    });

    loadData();

    // Edit Form Handler
    document.getElementById('editForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveEdit();
    });
});

function loadData() {
    const raw = localStorage.getItem(STUDENTS_KEY);
    allData = raw ? JSON.parse(raw) : [];
    
    // Sort: Newest First
    allData.sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));

    updateStats();
    filterTable(); // Initial Render
}

// --- STATS ENGINE ---
function updateStats() {
    const total = allData.length;
    const online = allData.filter(s => s.mode === 'Online').length;
    const spot = allData.filter(s => s.mode === 'On-Spot').length;
    
    // Calculate Money (Assuming 250 for Spot, 200 for Online if fee logic holds)
    // Or simpler: just sum the 'fee' field if it exists
    const revenue = allData.reduce((sum, s) => sum + (parseInt(s.fee) || 0), 0);

    document.getElementById('navTotal').innerText = total;
    document.getElementById('navMoney').innerText = `₹${revenue.toLocaleString()}`;
    document.getElementById('countOnline').innerText = online;
    document.getElementById('countSpot').innerText = spot;
}

// --- RENDER & FILTER ---
function filterTable() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const mode = document.getElementById('modeFilter').value;
    const event = document.getElementById('eventFilter').value;

    const filtered = allData.filter(s => {
        const matchesSearch = s.id.toLowerCase().includes(search) || 
                              s.name.toLowerCase().includes(search) || 
                              s.college.toLowerCase().includes(search);
        
        const matchesMode = (mode === 'all') || (s.mode === mode);
        
        const matchesEvent = (event === 'all') || (s.events && s.events.includes(event));

        return matchesSearch && matchesMode && matchesEvent;
    });

    renderTable(filtered);
}

function renderTable(data) {
    const tbody = document.getElementById('masterTableBody');
    document.getElementById('filteredCount').innerText = data.length;
    document.getElementById('recordCount').innerText = allData.length;

    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-gray-600 font-mono italic">No matching records found.</td></tr>`;
        return;
    }

    data.forEach(student => {
        // Badges for top 3 events (don't clutter UI)
        let eventBadges = student.events.slice(0, 3).map(evt => 
            `<span class="inline-block px-1.5 py-0.5 mb-1 text-[9px] rounded bg-gray-800 border border-gray-700 text-gray-400 mr-1">${evt}</span>`
        ).join('');
        
        if (student.events.length > 3) {
            eventBadges += `<span class="text-[9px] text-gray-500 ml-1">+${student.events.length - 3} more</span>`;
        }

        const row = `
            <tr class="group hover:bg-white/5 transition border-b border-gray-800/50">
                <td class="p-3 font-mono font-bold text-purple-300 group-hover:text-white transition">${student.id}</td>
                <td class="p-3 font-bold text-white text-sm">${student.name}</td>
                <td class="p-3 text-xs text-gray-400">${student.college}</td>
                <td class="p-3 font-mono text-xs text-gray-500">${student.phone}</td>
                <td class="p-3">
                    <div class="flex items-center gap-2">
                        <div class="w-2 h-2 rounded-full ${student.mode === 'Online' ? 'bg-blue-500' : 'bg-pink-500'}"></div>
                        <span class="text-xs font-bold text-gray-300">₹${student.fee}</span>
                    </div>
                </td>
                <td class="p-3 align-top">
                    ${eventBadges}
                </td>
                <td class="p-3 text-right">
                    <button onclick="openEditModal('${student.id}')" class="text-blue-400 hover:text-white p-2 transition mr-1" title="Edit Details">
                        <i class="fas fa-pen-square"></i>
                    </button>
                    <button onclick="deleteStudent('${student.id}')" class="text-red-500/50 hover:text-red-500 p-2 transition" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// --- EDIT FUNCTIONALITY ---
function openEditModal(id) {
    const student = allData.find(s => s.id === id);
    if(!student) return;

    document.getElementById('editId').value = student.id;
    document.getElementById('editName').value = student.name;
    document.getElementById('editCollege').value = student.college;
    document.getElementById('editPhone').value = student.phone;
    document.getElementById('editMode').value = student.mode;

    const modal = document.getElementById('editModal');
    modal.classList.remove('hidden');
    // Simple animation
    setTimeout(() => modal.querySelector('div').classList.remove('scale-95'), 10);
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    modal.querySelector('div').classList.add('scale-95');
    setTimeout(() => modal.classList.add('hidden'), 200);
}

function saveEdit() {
    const id = document.getElementById('editId').value;
    const name = document.getElementById('editName').value;
    const college = document.getElementById('editCollege').value;
    const phone = document.getElementById('editPhone').value;
    const mode = document.getElementById('editMode').value;
    
    // Find index
    const index = allData.findIndex(s => s.id === id);
    if(index === -1) return;

    // Update Data
    allData[index].name = name;
    allData[index].college = college;
    allData[index].phone = phone;
    allData[index].mode = mode;
    
    // Update Fee Logic (Optional, keeps data consistent)
    if(mode === 'Online') allData[index].fee = "200";
    else allData[index].fee = "250";

    // Save
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(allData));
    
    closeEditModal();
    loadData(); // Re-render
    alert("Record Updated Successfully.");
}

// --- DELETE ---
function deleteStudent(id) {
    if(!confirm(`⚠️ WARNING: Delete ${id}?\nThis cannot be undone.`)) return;
    
    allData = allData.filter(s => s.id !== id);
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(allData));
    
    loadData();
    alert("Record deleted.");
}

// --- EXPORT (JSON for L5) ---
function exportJSON() {
    if (allData.length === 0) {
        alert("No data to export!");
        return;
    }

    const session = JSON.parse(localStorage.getItem('symposium_session'));
    const laptopId = session ? session.laptop : 'UNKNOWN';
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    const fileName = `HECURA_${laptopId}_DATA_${timestamp}.json`;
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

// --- EXPORT (Excel for Backup) ---
function exportToExcel() {
    if (allData.length === 0) {
        alert("No data to export!");
        return;
    }

    const excelData = allData.map(s => ({
        "ID": s.id,
        "Name": s.name,
        "College": s.college,
        "Phone": s.phone,
        "Mode": s.mode,
        "Events": s.events.join(", "),
        "Fee": s.fee,
        "Time": new Date(s.registeredAt).toLocaleTimeString()
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "RegistrationData");
    
    const session = JSON.parse(localStorage.getItem('symposium_session'));
    XLSX.writeFile(wb, `HECURA_${session ? session.laptop : 'Data'}_Backup.xlsx`);
}