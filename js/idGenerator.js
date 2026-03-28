// js/idGenerator.js

const STUDENTS_KEY = 'symposium_students';
const SYMPOSIUM_CODE = 'HCR';

/**
 * Calculates the next ID for the current laptop.
 * Logic: Finds the highest existing suffix for this laptop and adds 1.
 */
function getNextID(laptopId) {
    const students = JSON.parse(localStorage.getItem(STUDENTS_KEY)) || [];
    
    // 1. Prefix to look for (e.g., "HCRL1-")
    const prefix = `${SYMPOSIUM_CODE}${laptopId}-`;

    // 2. Get all existing IDs created by this laptop
    const laptopIds = students
        .map(s => s.id)
        .filter(id => id.startsWith(prefix));

    // 3. If no IDs exist, start at 1
    if (laptopIds.length === 0) {
        return `${prefix}001`;
    }

    // 4. Extract numeric suffixes and find max
    // "HCRL1-005" -> 5
    const suffixes = laptopIds.map(id => parseInt(id.split('-')[1], 10));
    const maxSuffix = Math.max(...suffixes);

    // 5. Increment
    const nextSuffix = maxSuffix + 1;

    // 6. Pad with zeros (e.g., 6 -> "006")
    return `${prefix}${String(nextSuffix).padStart(3, '0')}`;
}