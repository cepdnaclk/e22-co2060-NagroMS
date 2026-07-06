const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'code/frontend/src/Pages/farmer/components/SettingsSection.jsx');
let content = fs.readFileSync(targetPath, 'utf8');

// Replace dynamic notification label with translation
const oldNotifLabel = "{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}";
const newNotifLabel = "{t('farmer.settings.' + key) || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}";
content = content.replace(oldNotifLabel, newNotifLabel);

// Replace Logout button text
content = content.replace(
  />\s*Logout\s*<\/button>/,
  ">{t('farmer.settings.logout') || 'Logout'}</button>"
);

// Replace Delete Account button text
content = content.replace(
  />\s*Delete Account\s*<\/button>/,
  ">{t('farmer.settings.deleteAccount') || 'Delete Account'}</button>"
);

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully updated SettingsSection.jsx');
