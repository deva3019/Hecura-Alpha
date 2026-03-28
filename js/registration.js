// js/registration.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Auth Check
    const session = checkAuth(); // From auth.js
    if (!session) return;

    document.getElementById('topLaptopId').textContent = session.laptop;

    // 2. Initial ID Generation
    refreshID(session.laptop);

    // 3. Form Submission Handler
    document.getElementById('regForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveStudent(session.laptop);
    });
});

// --- Dynamic ID Refresh ---
function refreshID(laptopId) {
    const newID = getNextID(laptopId); // From idGenerator.js
    document.getElementById('displayId').textContent = newID;
    return newID;
}

// --- Fee Update Logic ---
function updateFee() {
    const mode = document.getElementById('sMode').value;
    const feeInput = document.getElementById('sFee');
    
    if (mode === 'Online') {
        feeInput.value = "200";
    } else {
        feeInput.value = "250";
    }
}

// --- Select All Checkbox Logic ---
function toggleAll(source, className) {
    const checkboxes = document.querySelectorAll(`.${className}`);
    checkboxes.forEach(cb => {
        cb.checked = source.checked;
    });
}

// --- SAVE FUNCTION ---
function saveStudent(laptopId) {
    // 1. Gather Data
    const id = document.getElementById('displayId').textContent;
    const name = document.getElementById('sName').value.trim();
    const college = document.getElementById('sCollege').value.trim();
    const phone = document.getElementById('sPhone').value.trim();
    const mode = document.getElementById('sMode').value;
    const fee = document.getElementById('sFee').value;

    // 2. Gather Events
    const checkedEvents = Array.from(document.querySelectorAll('input[name="events"]:checked'))
        .map(cb => cb.value);

    if (checkedEvents.length === 0) {
        alert("⚠️ Please select at least one event!");
        return;
    }

    // 3. Create Object
    const newStudent = {
        id: id,
        name: name,
        college: college,
        phone: phone,
        mode: mode,
        fee: fee,
        events: checkedEvents,
        registeredAt: new Date().toISOString(), // Good for sorting later
        laptopOrigin: laptopId
    };

    // 4. Save to LocalStorage
    let students = JSON.parse(localStorage.getItem(STUDENTS_KEY)) || [];
    
    // Safety Check: Double check ID doesn't exist (Concurrency safety)
    if(students.find(s => s.id === id)) {
        alert("⚠️ Sync Error: ID already taken. Refreshing ID...");
        refreshID(laptopId);
        return;
    }

    students.push(newStudent);
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));

    // 5. Success Feedback
    alert(`✅ Registration Successful!\nID: ${id}\nName: ${name}`);

    // 6. Reset Form
    document.getElementById('regForm').reset();
    
    // 7. Reset "Select All" checkboxes manually
    document.querySelectorAll('.cyber-checkbox').forEach(cb => cb.checked = false);
    
    // 8. IMPORTANT: Reset Fee to default and generate NEXT ID
    updateFee(); 
    refreshID(laptopId);
    
    // Scroll to top
    window.scrollTo(0, 0);
} 