// js/dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Security Check
    const session = checkAuth(); // Function from auth.js
    if (!session) return; // Stop if not logged in

    // 2. Update Header Info
    document.getElementById('displayUserName').textContent = session.name;
    document.getElementById('displayLaptopId').textContent = session.laptop;
    document.getElementById('welcomeLaptop').textContent = `Laptop ${session.laptop}`;

    // 3. Load Statistics
    loadDashboardStats(session.laptop);
});

function loadDashboardStats(currentLaptopId) {
    const STUDENTS_KEY = 'symposium_students';
    const allStudents = JSON.parse(localStorage.getItem(STUDENTS_KEY)) || [];

    // Filter students: We want stats primarily for THIS laptop to show progress,
    // but the Total Count usually reflects the whole local storage if multiple people used it.
    // However, for safety in distributed systems, we usually focus on "My Contributions" 
    // or just show everything available in local storage.
    
    // DECISION: Show stats for ALL data currently in this browser's storage.
    // This includes data imported via Merge if any, or just L1 data.
    
    const total = allStudents.length;
    const online = allStudents.filter(s => s.mode === 'Online').length;
    const spot = allStudents.filter(s => s.mode === 'On-Spot').length;

    // Update DOM
    document.getElementById('statTotal').innerText = total;
    document.getElementById('statOnline').innerText = online;
    document.getElementById('statSpot').innerText = spot;

    // Animate Progress Bars (Simple visual width calc)
    if(total > 0) {
        setTimeout(() => {
            document.getElementById('barOnline').style.width = `${(online / total) * 100}%`;
            document.getElementById('barSpot').style.width = `${(spot / total) * 100}%`;
        }, 300);
    }

    // 4. Load Recent Activity (Last 5)
    renderRecentTable(allStudents);
}

function renderRecentTable(students) {
    const tbody = document.getElementById('recentActivityTable');
    
    // Sort by ID descending (assuming new IDs are higher) or just reverse array
    // Since we push new students to end, reverse is fine.
    const recent = students.slice().reverse().slice(0, 5);

    if (recent.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="py-4 text-center text-gray-600 italic">No registrations yet. Start adding!</td></tr>`;
        return;
    }

    tbody.innerHTML = recent.map(student => `
        <tr class="border-b border-gray-800 hover:bg-white/5 transition">
            <td class="py-3 px-4 font-mono text-purple-300">${student.id}</td>
            <td class="py-3 px-4 font-bold text-white">${student.name}</td>
            <td class="py-3 px-4 text-gray-400 truncate max-w-[150px]">${student.college}</td>
            <td class="py-3 px-4">
                <span class="px-2 py-1 rounded text-[10px] font-bold uppercase ${
                    student.mode === 'Online' ? 'bg-blue-900/50 text-blue-300 border border-blue-500/30' : 'bg-pink-900/50 text-pink-300 border border-pink-500/30'
                }">
                    ${student.mode}
                </span>
            </td>
        </tr>
    `).join('');
}