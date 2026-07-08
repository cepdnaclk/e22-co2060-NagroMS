const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'code', 'frontend', 'src', 'Pages', 'farmer', 'components', 'OverviewSection.jsx');
let content = fs.readFileSync(filepath, 'utf8');

// Fix 1: Fallback weather
content = content.replace(
  /fallbackUsed:\s*\(\!profile\.villageTown\s*&&\s*\!profile\.district\)/,
  'fallbackUsed: weatherData.fallbackUsed || (!profile.villageTown && !profile.district)'
);

// Fix 2: Add New Product Stock Dropdown
// We need to replace:
// <option value="Medium Stock">{t('farmer.overview.mediumStock') || 'Medium Stock'}</option>
// with Out of Stock option.
content = content.replace(
  /<option value="Medium Stock">\{t\('farmer\.overview\.mediumStock'\) \|\| 'Medium Stock'\}<\/option>\s*<option value="Low Stock">\{t\('farmer\.overview\.lowStock'\) \|\| 'Low Stock'\}<\/option>/,
  `<option value="Low Stock">{t('farmer.overview.lowStock') || 'Low Stock'}</option>
                  <option value="Out of Stock">{t('farmer.overview.outOfStock') || 'Out of Stock'}</option>`
);

fs.writeFileSync(filepath, content, 'utf8');
console.log('Successfully re-applied weather fallback and stock dropdown to OverviewSection.jsx');
