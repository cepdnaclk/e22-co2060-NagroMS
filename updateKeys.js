const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'code/frontend/src/i18n/farmerTranslations.js');
let content = fs.readFileSync(targetPath, 'utf8');

// The `settings` block in `farmerTranslations.js` has `title: "Settings"` etc.
// We can inject the new keys right after `title: `

const addKeys = (text, keysObj) => {
  return text.replace(
    /title:\s*["'][^"']+["'],/,
    match => `${match}\n        chooseFile: "${keysObj.chooseFile}",\n        noFileChosen: "${keysObj.noFileChosen}",\n        dobPlaceholder: "${keysObj.dobPlaceholder}",`
  );
};

// However, because we replace globally it might match multiple languages. We need to do it precisely.
// Actually, I can just use a regex with match callback.
let matchCount = 0;
const newContent = content.replace(/title:\s*["']([^"']+)["'],/g, (match, p1) => {
  if (matchCount === 0) { // EN
    matchCount++;
    return `${match}\n        chooseFile: "Choose File",\n        noFileChosen: "No file chosen",\n        dobPlaceholder: "MM/DD/YYYY",`;
  } else if (matchCount === 1) { // SI
    matchCount++;
    return `${match}\n        chooseFile: "ගොනුව තෝරන්න",\n        noFileChosen: "ගොනුවක් තෝරා නැත",\n        dobPlaceholder: "මාසය/දිනය/වසර",`;
  } else if (matchCount === 2) { // TA
    matchCount++;
    return `${match}\n        chooseFile: "கோப்பைத் தேர்ந்தெடுக்கவும்",\n        noFileChosen: "கோப்பு தேர்வு செய்யப்படவில்லை",\n        dobPlaceholder: "மாதம்/நாள்/ஆண்டு",`;
  }
  return match;
});

fs.writeFileSync(targetPath, newContent, 'utf8');
console.log('Successfully added keys to farmerTranslations.js');
