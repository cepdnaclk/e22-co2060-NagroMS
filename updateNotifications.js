const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'code/frontend/src/Pages/farmer/components/NotificationsSection.jsx');
let content = fs.readFileSync(targetPath, 'utf8');

content = content.replace(/\{t\('notifications\.title'\) \|\| 'Notifications'\}/g, "{t('farmer.notifications.title')}");
content = content.replace(/\{t\('notifications\.unread'\) \|\| 'Unread Notifications'\}/g, "{t('farmer.notifications.unread')}");
content = content.replace(/\{t\('notifications\.noUnread'\) \|\| 'No unread notifications\.'\}/g, "{t('farmer.notifications.noNotifications')}");
content = content.replace(/\{t\('notifications\.markRead'\) \|\| 'Mark as Read'\}/g, "{t('farmer.notifications.markAsRead')}");
content = content.replace(/\{t\('notifications\.older'\) \|\| 'Older Notifications'\}/g, "{t('farmer.notifications.read')}");
content = content.replace(/\{t\('notifications\.noOlder'\) \|\| 'No previous notifications\.'\}/g, "{t('farmer.notifications.noNotifications')}");

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully updated NotificationsSection.jsx');
