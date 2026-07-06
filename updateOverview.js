const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'code/frontend/src/Pages/farmer/components/OverviewSection.jsx');
let content = fs.readFileSync(targetPath, 'utf8');

// Global replacement from t('overview.xxx') to t('farmer.overview.xxx')
content = content.replace(/t\('overview\./g, "t('farmer.overview.");

// Some literals not using t()
content = content.replace(/>Sales</g, ">{t('farmer.overview.sales') || 'Sales'}<");
content = content.replace(/>Total Revenue: /g, ">{t('farmer.overview.totalRevenue') || 'Total Revenue'}: ");
content = content.replace(/>No sales and income yet\.</g, ">{t('farmer.overview.noSales') || 'No sales and income yet.'}<");
content = content.replace(/>Product Name</g, ">{t('farmer.overview.productName') || 'Product Name'}<");
content = content.replace(/>Quantity Sold</g, ">{t('farmer.overview.quantitySold') || 'Quantity Sold'}<");
content = content.replace(/>Price</g, ">{t('farmer.overview.price') || 'Price'}<");
content = content.replace(/>Buyer Name</g, ">{t('farmer.overview.buyerName') || 'Buyer Name'}<");
content = content.replace(/>Sold Date</g, ">{t('farmer.overview.soldDate') || 'Sold Date'}<");
content = content.replace(/>Incoming Orders</g, ">{t('farmer.overview.incomingOrders') || 'Incoming Orders'}<");
content = content.replace(/>No incoming orders yet\.</g, ">{t('farmer.overview.noIncomingOrders') || 'No incoming orders yet.'}<");
content = content.replace(/>Accept</g, ">{t('farmer.overview.accept') || 'Accept'}<");
content = content.replace(/>Decline</g, ">{t('farmer.overview.decline') || 'Decline'}<");

content = content.replace(/<strong>Product:<\/strong>/g, "<strong>{t('farmer.overview.productName') || 'Product'}:</strong>");
content = content.replace(/<strong>Qty:<\/strong>/g, "<strong>{t('farmer.overview.quantity') || 'Qty'}:</strong>");
content = content.replace(/<strong>Total:<\/strong>/g, "<strong>{t('farmer.overview.totalPrice') || 'Total'}:</strong>");
content = content.replace(/<strong>Phone:<\/strong>/g, "<strong>{t('farmer.settings.phone') || 'Phone'}:</strong>");
content = content.replace(/<strong>Location:<\/strong>/g, "<strong>{t('farmer.overview.location') || 'Location'}:</strong>");

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully updated OverviewSection.jsx');
