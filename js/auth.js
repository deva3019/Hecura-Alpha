// js/auth.js

const AUTH_KEY = 'symposium_users';
const SESSION_KEY = 'symposium_session';
const LAPTOP_LOCK_KEY = 'symposium_laptop_lock';

// --- Signup Logic ---
if (document.getElementById('signupForm')) {
    document.getElementById('signupForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('newName').value;
        const pass = document.getElementById('newPass').value;

        let users = JSON.parse(localStorage.getItem(AUTH_KEY)) || [];
        
        // Check if user exists
        if(users.find(u => u.name === name)) {
            alert('User already exists!');
            return;
        }

        users.push({ name, pass });
        localStorage.setItem(AUTH_KEY, JSON.stringify(users));
        alert('Signup Successful! Please Login.');
        window.location.href = 'index.html';
    });
}

// --- Login Logic ---
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('coordName').value;
        const laptop = document.getElementById('laptopNum').value;

        // 1. Check Credentials (Simulated)
        let users = JSON.parse(localStorage.getItem(AUTH_KEY)) || [];
        const user = users.find(u => u.name === name);

        if (!user) {
            alert('User not found. Please Sign up.');
            return;
        }

        // 2. LAPTOP LOCK CHECK (Critical Safety)
        const lockedLaptop = localStorage.getItem(LAPTOP_LOCK_KEY);
        if (lockedLaptop && lockedLaptop !== laptop) {
            alert(`⛔ SECURITY ALERT ⛔\n\nThis browser is LOCKED to Laptop ID: ${lockedLaptop}.\nYou cannot log in as ${laptop}.\n\nTo fix: Use the correct laptop ID or clear browser data.`);
            return;
        }

        // 3. Set Lock if not set
        if (!lockedLaptop) {
            localStorage.setItem(LAPTOP_LOCK_KEY, laptop);
        }

        // 4. Create Session
        const session = {
            name: user.name,
            laptop: laptop,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));

        window.location.href = 'dashboard.html';
    });
}

// --- Check Session (Include this at top of dashboard pages) ---
function checkAuth() {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (!session) {
        window.location.href = 'index.html';
    }
    return session;
}

function logout() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = 'index.html';
}