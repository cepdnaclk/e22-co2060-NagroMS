const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [search, replace] of replacements) {
    // If search is a string, do global replacement
    if (typeof search === 'string') {
      content = content.split(search).join(replace);
    } else {
      content = content.replace(search, replace);
    }
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${path.basename(filePath)}`);
}

const frontendDir = path.join(__dirname, 'code', 'frontend', 'src', 'Pages', 'farmer', 'components');

// 1. OverviewSection.jsx
const overviewPath = path.join(frontendDir, 'OverviewSection.jsx');
replaceInFile(overviewPath, [
  ['>Active Farmer<', ">{t('farmer.header.activeFarmer') || 'Active Farmer'}<"],
  ['>English<', ">{t('farmer.header.languageEnglish') || 'English'}<"],
  ['>Sinhala<', ">{t('farmer.header.languageSinhala') || 'Sinhala'}<"],
  ['>Tamil<', ">{t('farmer.header.languageTamil') || 'Tamil'}<"],
]);

// 2. ServicesSection.jsx
const servicesPath = path.join(frontendDir, 'ServicesSection.jsx');
replaceInFile(servicesPath, [
  ['>Transport Service<', ">{t('farmer.services.transportTitle') || 'Transport Service'}<"],
  ['>Request transport support to deliver your products to customers or markets.<', ">{t('farmer.services.transportDesc') || 'Request transport support to deliver your products to customers or markets.'}<"],
  ['>Request Transport<', ">{t('farmer.services.reqTransport') || 'Request Transport'}<"],
  ['>Bank Details<', ">{t('farmer.services.bankTitle') || 'Bank Details'}<"],
  ['>Manage your bank account details for receiving customer payments.<', ">{t('farmer.services.bankDesc') || 'Manage your bank account details for receiving customer payments.'}<"],
  ['>Manage Bank Details<', ">{t('farmer.services.manageBank') || 'Manage Bank Details'}<"]
]);

// 3. SettingsSection.jsx
const settingsPath = path.join(frontendDir, 'SettingsSection.jsx');
replaceInFile(settingsPath, [
  // notification labels
  ['New Order Received', "{t('farmer.settings.newOrderReceived') || 'New Order Received'}"],
  ['Order Accepted By Customer', "{t('farmer.settings.orderAcceptedByCustomer') || 'Order Accepted By Customer'}"],
  ['Payment Received', "{t('farmer.settings.paymentReceived') || 'Payment Received'}"],
  ['Low Stock Alert', "{t('farmer.settings.lowStockAlert') || 'Low Stock Alert'}"],
  ['New Message Received', "{t('farmer.settings.newMessageReceived') || 'New Message Received'}"],
  // Wait, let's look at how they are rendered. If they are rendered like `{t('settings.newOrderReceived') || 'New Order Received'}`, they should have been replaced previously to `{t('farmer.settings.newOrderReceived') || ...}`. Let's make sure.
]);
