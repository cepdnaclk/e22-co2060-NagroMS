const fs = require('fs');
const path = require('path');

const i18nPath = path.join(__dirname, 'code', 'frontend', 'src', 'i18n', 'farmerTranslations.js');
let i18nContent = fs.readFileSync(i18nPath, 'utf8');

const overviewEn = `
    overview: {
      noIncomingOrders: 'No incoming orders yet.',
      title: 'Overview',
      myProducts: 'My Products', addProduct: 'Add Product', addFirstProduct: 'Add Your First Product',
      welcome: 'Welcome to NagroMS!', noProductsText: "It looks like you haven't added any products yet.",
      available: 'Available', totalPrice: 'Total Price', status: 'Status', added: 'Added', editProduct: 'Edit Product',
      deleteProduct: 'Delete Product', sales: 'Sales', totalRevenue: 'Total Revenue', noSales: 'No sales and income yet.',
      localWeather: 'Local Weather (Live)', fetchingWeather: 'Fetching live weather...', weatherFallback: 'Showing weather for Colombo', weatherError: 'Unable to load weather right now.',
      fullStock: 'Full Stock', mediumStock: 'Medium Stock', lowStock: 'Low Stock', outOfStock: 'Out of Stock',
      addNewProduct: 'Add New Product', productName: 'Product Name', quantity: 'Quantity', unit: 'Unit', pricePerUnit: 'Price Per Unit', stockStatus: 'Stock Status', productImage: 'Product Image', cancel: 'Cancel', submitAddProduct: 'Add Product'
    },`;

const overviewSi = `
    overview: {
      noIncomingOrders: 'තවමත් ලැබෙන ඇණවුම් නොමැත.',
      title: 'දළ විශ්ලේෂණය',
      myProducts: 'මගේ නිෂ්පාදන', addProduct: 'නිෂ්පාදන එක් කරන්න', addFirstProduct: 'ඔබේ පළමු නිෂ්පාදනය එක් කරන්න',
      welcome: 'NagroMS වෙත සාදරයෙන් පිළිගනිමු!', noProductsText: "ඔබ තවමත් කිසිදු නිෂ්පාදනයක් එක් කර නොමැති බව පෙනේ.",
      available: 'පවතී', totalPrice: 'මුළු මිල', status: 'තත්ත්වය', added: 'එක් කරන ලදි', editProduct: 'නිෂ්පාදනය සංස්කරණය කරන්න',
      deleteProduct: 'නිෂ්පාදනය මකන්න', sales: 'විකුණුම්', totalRevenue: 'මුළු ආදායම', noSales: 'තවමත් විකුණුම් සහ ආදායම් නොමැත.',
      localWeather: 'දේශීය කාලගුණය (සජීවී)', fetchingWeather: 'සජීවී කාලගුණය ලබා ගනිමින්...', weatherFallback: 'කොළඹ කාලගුණය පෙන්වයි', weatherError: 'මේ මොහොතේ කාලගුණය ලබා ගත නොහැක.',
      fullStock: 'සම්පූර්ණ තොගය', mediumStock: 'මධ්‍යම තොගය', lowStock: 'අඩු තොගය', outOfStock: 'තොග නැත',
      addNewProduct: 'නව නිෂ්පාදනයක් එක් කරන්න', productName: 'නිෂ්පාදන නම', quantity: 'ප්රමාණය', unit: 'ඒකකය', pricePerUnit: 'ඒකකයක මිල', stockStatus: 'තොග තත්ත්වය', productImage: 'නිෂ්පාදන රූපය', cancel: 'අවලංගු කරන්න', submitAddProduct: 'නිෂ්පාදනය එක් කරන්න'
    },`;

const overviewTa = `
    overview: {
      noIncomingOrders: 'இதுவரை உள்வரும் ஆர்டர்கள் இல்லை.',
      title: 'கண்ணோட்டம்',
      myProducts: 'எனது தயாரிப்புகள்', addProduct: 'தயாரிப்பைச் சேர்', addFirstProduct: 'உங்கள் முதல் தயாரிப்பைச் சேர்க்கவும்',
      welcome: 'NagroMS இற்கு வரவேற்கிறோம்!', noProductsText: "நீங்கள் இன்னும் எந்த தயாரிப்புகளையும் சேர்க்கவில்லை என்று தெரிகிறது.",
      available: 'கிடைக்கும்', totalPrice: 'மொத்த விலை', status: 'நிலை', added: 'சேர்க்கப்பட்டது', editProduct: 'தயாரிப்பைத் திருத்து',
      deleteProduct: 'தயாரிப்பை நீக்கு', sales: 'விற்பனை', totalRevenue: 'மொத்த வருவாய்', noSales: 'இதுவரை விற்பனை மற்றும் வருமானம் இல்லை.',
      localWeather: 'உள்ளூர் வானிலை (நேரலை)', fetchingWeather: 'நேரலை வானிலையைப் பெறுகிறது...', weatherFallback: 'கொழும்பு வானிலை காட்டப்படுகிறது', weatherError: 'தற்போது வானிலை தகவலை பெற முடியவில்லை.',
      fullStock: 'முழு கையிருப்பு', mediumStock: 'நடுத்தர கையிருப்பு', lowStock: 'குறைந்த கையிருப்பு', outOfStock: 'கையிருப்பு இல்லை',
      addNewProduct: 'புதிய தயாரிப்பைச் சேர்க்கவும்', productName: 'தயாரிப்பு பெயர்', quantity: 'அளவு', unit: 'அலகு', pricePerUnit: 'அலகு விலை', stockStatus: 'கையிருப்பு நிலை', productImage: 'தயாரிப்பு படம்', cancel: 'ரத்து செய்', submitAddProduct: 'தயாரிப்பைச் சேர்க்கவும்'
    },`;

// Replace the overview block in English
i18nContent = i18nContent.replace(
  /\s*overview:\s*\{[\s\S]*?(?=\s*management:)/,
  overviewEn + '\n'
);

// We need to carefully replace the Sinhala overview block
i18nContent = i18nContent.replace(
  /\s*overview:\s*\{[\s\S]*?(?=\s*management:)(.*)/g,
  (match, p1, offset, string) => {
    // This regex matches all overview blocks.
    // Let's do it differently.
    return match;
  }
);

fs.writeFileSync(i18nPath, i18nContent, 'utf8');
