// js/merge.js

const MASTER_KEY = 'hecura_master_db';
const EVENT_LIST = [
    "Frontend Jam", "Tech Clash", "Prompt to Pixel", "Ideathon", "Project Presentation", 
    "Mind Relay", "Brand-Craft", "Blind Code", "Speed-Keys",
    "Fake-it", "Meme-Forge", "Silent Signals", "Frame the Moment", "Connexion", "Sticker on Forehead",
    "Free Fire", "BGMI", "Chess"
];

let masterData = [];
let currentFilteredData = [];

document.addEventListener('DOMContentLoaded', () => {
    loadMasterData();
    populateDropdown();
    logSystem("Console Ready. Waiting for inputs...");
});

function populateDropdown() {
    const selector = document.getElementById('eventSelector');
    EVENT_LIST.forEach(evt => {
        const opt = document.createElement('option');
        opt.value = evt;
        opt.innerText = evt;
        selector.appendChild(opt);
    });
}

// --- LOGGING SYSTEM ---
function logSystem(msg) {
    const terminal = document.getElementById('systemLog');
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    
    const entry = document.createElement('div');
    entry.innerHTML = `<span class="text-gray-500">[${time}]</span> <span class="text-green-400">></span> ${msg}`;
    
    terminal.appendChild(entry);
    terminal.scrollTop = terminal.scrollHeight; // Auto scroll
}

// --- DATA INGESTION ---
function handleFiles(files) {
    if (!files.length) return;
    
    const overlay = document.getElementById('uploadSuccessOverlay');
    let newRecords = 0;
    let duplicates = 0;
    let filesProcessed = 0;

    logSystem(`Initiating upload of ${files.length} file(s)...`);

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);
                if (Array.isArray(json)) {
                    json.forEach(student => {
                        const exists = masterData.some(s => s.id === student.id);
                        if (!exists) {
                            masterData.push(student);
                            newRecords++;
                        } else {
                            duplicates++;
                        }
                    });
                    logSystem(`Parsed ${file.name}: OK`);
                } else {
                    logSystem(`ERROR: ${file.name} invalid format.`);
                }
            } catch (err) {
                logSystem(`CRITICAL: Failed to read ${file.name}`);
            }

            filesProcessed++;
            if (filesProcessed === files.length) {
                finalizeUpload(newRecords, duplicates);
            }
        };
        reader.readAsText(file);
    });
}

function finalizeUpload(added, dupes) {
    localStorage.setItem(MASTER_KEY, JSON.stringify(masterData));
    loadMasterData();
    
    // Show Success Animation
    const overlay = document.getElementById('uploadSuccessOverlay');
    overlay.classList.remove('opacity-0');
    setTimeout(() => {
        overlay.classList.add('opacity-0');
    }, 2000);

    logSystem(`MERGE COMPLETE: +${added} New | ${dupes} Duplicates skipped.`);
    
    // Refresh Filter if active
    filterByEvent();
}

function loadMasterData() {
    const raw = localStorage.getItem(MASTER_KEY);
    masterData = raw ? JSON.parse(raw) : [];
    document.getElementById('totalMerged').innerText = masterData.length;
}

function clearMasterData() {
    if(confirm("🛑 WARNING: Wiping Master DB. Continue?")) {
        localStorage.removeItem(MASTER_KEY);
        masterData = [];
        loadMasterData();
        filterByEvent();
        logSystem("DATABASE PURGED BY ADMIN.");
    }
}

// --- FILTERING ---
function filterByEvent() {
    const eventName = document.getElementById('eventSelector').value;
    if (!eventName) return;

    // Filter Logic
    currentFilteredData = masterData.filter(student => 
        student.events && student.events.includes(eventName)
    );

    document.getElementById('eventCount').innerText = currentFilteredData.length;
    
    // Enable Buttons
    const hasData = currentFilteredData.length > 0;
    document.getElementById('btnJson').disabled = !hasData;
    document.getElementById('btnExcel').disabled = !hasData;

    renderPreview(currentFilteredData);
    if(hasData) logSystem(`Filter Applied: ${eventName} (${currentFilteredData.length} records)`);
}

function renderPreview(data) {
    const tbody = document.getElementById('previewBody');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-10 text-center text-gray-500">No students found for this event.</td></tr>`;
        return;
    }

    data.slice(0, 10).forEach(s => { // Show top 10 only for preview speed
        tbody.innerHTML += `
            <tr class="hover:bg-white/5 border-b border-gray-800 text-gray-300 transition">
                <td class="p-3 font-mono text-purple-300">${s.id}</td>
                <td class="p-3 font-bold">${s.name}</td>
                <td class="p-3 font-mono text-green-400">${s.phone}</td>
                <td class="p-3 text-xs text-gray-400 truncate max-w-[150px]">${s.college}</td>
                <td class="p-3 text-center text-xs text-gray-600">HIDDEN</td>
            </tr>
        `;
    });
    
    if(data.length > 10) {
        tbody.innerHTML += `<tr><td colspan="5" class="p-2 text-center text-xs text-gray-500">...and ${data.length - 10} more</td></tr>`;
    }
}

// --- EXPORT LOGIC (SANITIZED) ---

function exportFilteredJSON() {
    const eventName = document.getElementById('eventSelector').value;
    if (!currentFilteredData.length) return;

    // SANITIZATION STEP: Create clean objects
    // We Map ONLY: ID, Name, College, Phone, Mode.
    // We deliberately EXCLUDE 'events' array.
    const sanitizedData = currentFilteredData.map(s => ({
        id: s.id,
        name: s.name,
        college: s.college,
        phone: s.phone, // Specifically requested
        mode: s.mode,
        target_event: eventName // Optional: Just so they know which file this is
    }));

    const fileName = `EVENT_${eventName.replace(/\s+/g, '_')}_DATA.json`;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sanitizedData, null, 2));
    
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

    logSystem(`EXPORT SUCCESS: JSON generated for ${eventName}`);
}

function exportFilteredExcel() {
    const eventName = document.getElementById('eventSelector').value;
    if (!currentFilteredData.length) return;

    // Excel also gets sanitized (clean columns)
    const excelData = currentFilteredData.map(s => ({
        "ID": s.id,
        "Name": s.name,
        "College": s.college,
        "Phone": s.phone,
        "Mode": s.mode
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Participants");

    XLSX.writeFile(wb, `${eventName.replace(/\s+/g, '_')}_List.xlsx`);
    logSystem(`EXPORT SUCCESS: Excel generated for ${eventName}`);
}