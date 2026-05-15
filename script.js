function analyzePassword() {
    const password = document.getElementById('password').value;
    const result = document.getElementById('result');
    const suggestions = document.getElementById('suggestions');

    result.innerText = "";
    suggestions.innerText = "";

    if (!password) {
        result.innerText = "Enter a password";
        return;
    }
    
    const entropy = calculateEntropy(password);
    const penalty = getPenalty(password);
    const strength = getStrength(entropy, penalty);

    result.innerText = `Strength: ${strength} | Entropy: ${entropy.toFixed(2)}`;

    if (isReusedPassword(password)) {
        document.getElementById('result').innerText =
         "⚠️ This password was used before. Choose a new one.";
         return;
    }
    // basic suggestions
    if (!/[A-Z]/.test(password)) suggestions.innerText += "\nAdd uppercase letters";
    if (!/[a-z]/.test(password)) suggestions.innerText += "\nAdd lowercase letters";
    if (!/\d/.test(password)) suggestions.innerText += "\nAdd numbers";
    if (!/[^A-Za-z0-9]/.test(password)) suggestions.innerText += "\nAdd symbols";
    if (password.length < 10) suggestions.innerText += "\nIncrease length to 10+";

    const suggestionsBox = document.getElementById('suggestions');
    if (strength !== "Very Strong") {
        suggestionsBox.innerText += "\n\nSuggested Strong Passwords:\n";
        for (let i = 0; i < 3; i++) {
            suggestionsBox.innerText += `- ${generateStrongPassword(12)}\n`;
        }
    }

    savePasswordHistory(password);
}

function togglePassword() {
    const input = document.getElementById("password");

    if (input.type === "password") {
        input.type = "text";
    } else {
        input.type = "password";
    }
}

function liveCheck() {
    const password = document.getElementById("password").value;
    const stats = document.getElementById("liveStats");

    let length = password.length;

    let charsetSize = 0;
    if (/[a-z]/.test(password)) charsetSize += 26;
    if (/[A-Z]/.test(password)) charsetSize += 26;
    if (/\d/.test(password)) charsetSize += 10;
    if (/[^A-Za-z0-9]/.test(password)) charsetSize += 32;

    let entropy = length * Math.log2(charsetSize || 1);

    let strength = "Weak";
    if (entropy > 60) strength = "Very Strong";
    else if (entropy > 40) strength = "Strong";
    else if (entropy > 20) strength = "Medium";

    stats.innerText =
        `Length: ${length} | Charset: ${charsetSize} | Entropy: ${entropy.toFixed(2)} | Strength: ${strength}`;
}

function getCharsetSize(password) {
    let size = 0;

    if (/[a-z]/.test(password)) size += 26;
    if (/[A-Z]/.test(password)) size += 26;
    if (/\d/.test(password)) size += 10;
    if (/[^A-Za-z0-9]/.test(password)) size += 32;

    return size;
}

function calculateEntropy(password) {
    const charsetSize = getCharsetSize(password);
    const length = password.length;

    if (charsetSize === 0) return 0;

    return length * Math.log2(charsetSize);
}

function getPenalty(password) {
    let penalty = 0;

    if (/(.)\1{2,}/.test(password)) penalty += 10; // repeated chars like "aaa"
    if (/1234|2345|qwerty|asdf/i.test(password)) penalty += 15; // common patterns
    if (password.length < 6) penalty += 20;

    return penalty;
}
function getStrength(entropy, penalty) {
    const score = entropy - penalty;

    if (score < 20) return "Weak";
    if (score < 40) return "Medium";
    if (score < 60) return "Strong";
    return "Very Strong";
}

const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const lower = "abcdefghijklmnopqrstuvwxyz";
const numbers = "0123456789";
const symbols = "@$!%*?&^#";

function generateStrongPassword(length = 12) {
    const allChars = upper + lower + numbers + symbols;

    let password = "";

    // ensure at least one from each category (important for security correctness)
    password += upper[Math.floor(Math.random() * upper.length)];
    password += lower[Math.floor(Math.random() * lower.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // fill remaining characters randomly
    for (let i = 4; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // shuffle result (important, otherwise pattern is predictable)
    return password.split('').sort(() => Math.random() - 0.5).join('');
}

function savePasswordHistory(password) {
    let history = JSON.parse(localStorage.getItem("passwordHistory")) || [];
    history.push(password);
    localStorage.setItem("passwordHistory", JSON.stringify(history));
}

function isReusedPassword(password) {
    let history = JSON.parse(localStorage.getItem("passwordHistory")) || [];
    return history.includes(password);
}

