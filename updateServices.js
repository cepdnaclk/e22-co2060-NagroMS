const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'code/frontend/src/Pages/farmer/components/ServicesSection.jsx');
let content = fs.readFileSync(targetPath, 'utf8');

content = content.replace(/t\('services\.title'\)/g, "t('farmer.services.title')");
content = content.replace(/t\('services\.transportTitle'\)/g, "t('farmer.services.transportTitle')");
content = content.replace(/t\('services\.transportDesc'\)/g, "t('farmer.services.transportDesc')");
content = content.replace(/t\('services\.reqTransport'\)/g, "t('farmer.services.reqTransport')");
content = content.replace(/t\('services\.bankTitle'\)/g, "t('farmer.services.bankTitle')");
content = content.replace(/t\('services\.bankDesc'\)/g, "t('farmer.services.bankDesc')");
content = content.replace(/t\('services\.manageBank'\)/g, "t('farmer.services.manageBank')");

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully updated ServicesSection.jsx');
