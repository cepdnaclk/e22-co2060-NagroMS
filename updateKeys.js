const fs = require('fs');
const path = require('path');

const i18nPath = path.join(__dirname, 'code', 'frontend', 'src', 'i18n', 'farmerTranslations.js');
let content = fs.readFileSync(i18nPath, 'utf8');

// The English block
const enAppend = `
        addNewProduct: 'Add New Product',
        productName: 'Product Name',
        quantity: 'Quantity',
        unit: 'Unit',
        pricePerUnit: 'Price Per Unit',
        stockStatus: 'Stock Status',
        fullStock: 'Full Stock',
        lowStock: 'Low Stock',
        outOfStock: 'Out of Stock',
        productImage: 'Product Image',
        cancel: 'Cancel',
        submitAddProduct: 'Add Product',`;

// The Sinhala block
const siAppend = `
        addNewProduct: 'නව නිෂ්පාදනයක් එක් කරන්න',
        productName: 'නිෂ්පාදන නම',
        quantity: 'ප්රමාණය',
        unit: 'ඒකකය',
        pricePerUnit: 'ඒකකයක මිල',
        stockStatus: 'තොග තත්ත්වය',
        fullStock: 'සම්පූර්ණ තොගය',
        lowStock: 'අඩු තොගය',
        outOfStock: 'තොග නැත',
        productImage: 'නිෂ්පාදන රූපය',
        cancel: 'අවලංගු කරන්න',
        submitAddProduct: 'නිෂ්පාදනය එක් කරන්න',`;

// The Tamil block
const taAppend = `
        addNewProduct: 'புதிய தயாரிப்பைச் சேர்க்கவும்',
        productName: 'தயாரிப்பு பெயர்',
        quantity: 'அளவு',
        unit: 'அலகு',
        pricePerUnit: 'அலகு விலை',
        stockStatus: 'கையிருப்பு நிலை',
        fullStock: 'முழு கையிருப்பு',
        lowStock: 'குறைந்த கையிருப்பு',
        outOfStock: 'கையிருப்பு இல்லை',
        productImage: 'தயாரிப்பு படம்',
        cancel: 'ரத்து செய்',
        submitAddProduct: 'தயாரிப்பைச் சேர்க்கவும்',`;

// We inject right after `overview: {` for each language section.
// To do this safely, we can replace `overview: {` with `overview: { \n <append>`
// But since there are 3 `overview: {`, we need to find them in order (en, si, ta).

let overviewMatches = [];
let index = -1;
while ((index = content.indexOf('overview: {', index + 1)) !== -1) {
  overviewMatches.push(index);
}

if (overviewMatches.length === 3) {
  // We process from back to front to avoid messing up indices
  content = content.slice(0, overviewMatches[2] + 11) + taAppend + content.slice(overviewMatches[2] + 11);
  content = content.slice(0, overviewMatches[1] + 11) + siAppend + content.slice(overviewMatches[1] + 11);
  content = content.slice(0, overviewMatches[0] + 11) + enAppend + content.slice(overviewMatches[0] + 11);
  fs.writeFileSync(i18nPath, content, 'utf8');
  console.log('Successfully added keys to farmerTranslations.js');
} else {
  console.log('Error: Found', overviewMatches.length, 'overview blocks instead of 3.');
}
