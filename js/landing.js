// js/landing.js

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Typing Effect for Sub-headline ---
    const textElement = document.querySelector('.typing-text');
    const phrases = [
        "Offline-First Architecture",
        "Collision-Free ID Generation",
        "Decentralized Result Management",
        "Zero-Latency Operations"
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function typeEffect() {
        const currentPhrase = phrases[phraseIndex];
        
        if (isDeleting) {
            textElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50; // Faster when deleting
        } else {
            textElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 100; // Normal typing speed
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            isDeleting = true;
            typeSpeed = 2000; // Pause at end
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typeSpeed = 500; // Pause before new word
        }

        setTimeout(typeEffect, typeSpeed);
    }
    
    // Start typing effect
    if(textElement) typeEffect();


    // --- 2. Incognito Detection ---
    try {
        localStorage.setItem('hecura_test', '1');
        localStorage.removeItem('hecura_test');
    } catch (e) {
        const warning = document.getElementById('storageWarning');
        if(warning) warning.classList.remove('hidden');
    }

});

// --- 3. Modal Functions ---
function openLoginModal() {
    const modal = document.getElementById('loginModal');
    const backdrop = document.getElementById('modalBackdrop');
    const content = document.getElementById('modalContent');

    modal.classList.remove('hidden');
    // Small delay to allow display:block to apply before opacity transition
    setTimeout(() => {
        backdrop.classList.remove('opacity-0');
        content.classList.remove('opacity-0', 'scale-90');
        content.classList.add('opacity-100', 'scale-100');
    }, 10);
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    const backdrop = document.getElementById('modalBackdrop');
    const content = document.getElementById('modalContent');

    backdrop.classList.remove('opacity-100');
    content.classList.remove('opacity-100', 'scale-100');
    content.classList.add('opacity-0', 'scale-90');

    // Wait for transition to finish before hiding
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}   