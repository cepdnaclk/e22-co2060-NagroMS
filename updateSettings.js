const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'code/frontend/src/Pages/farmer/components/SettingsSection.jsx');
let content = fs.readFileSync(targetPath, 'utf8');

// The file currently uses `t('settings.xxx') || 'Fallback'`. Let's just globally replace `t('settings.` with `t('farmer.settings.`
content = content.replace(/t\('settings\./g, "t('farmer.settings.");

// Let's also do a few literals that aren't mapped
content = content.replace(/>Logout</g, ">{t('farmer.settings.logout') || 'Logout'}<");
content = content.replace(/>Delete Account</g, ">{t('farmer.settings.deleteAccountBtn') || 'Delete Account'}<");
content = content.replace(/'Saving\.\.\.' : 'Save Changes'/g, "t('farmer.settings.saving') : t('farmer.settings.saveChanges')");

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully updated SettingsSection.jsx');
