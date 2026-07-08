const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'code/frontend/src/i18n/farmerTranslations.js');
let content = fs.readFileSync(targetPath, 'utf8');

// --- English ---
content = content.replace(
  /overview: \{/,
  "overview: {\n        noIncomingOrders: 'No incoming orders yet.',"
);

content = content.replace(
  /services: \{/,
  "services: {\n        transportTitle: 'Transport Service',\n        transportDesc: 'Request transport support to deliver your products to customers or markets.',\n        reqTransport: 'Request Transport',\n        bankTitle: 'Bank Details',\n        bankDesc: 'Manage your bank account details for receiving customer payments.',\n        manageBank: 'Manage Bank Details',"
);

content = content.replace(
  /overview: \{/g,
  match => match
); // Just a dummy, will handle by index

const langs = ['en', 'si', 'ta'];

const headerKeys = {
  en: "      header: {\n        activeFarmer: 'Active Farmer',\n        languageEnglish: 'English',\n        languageSinhala: 'Sinhala',\n        languageTamil: 'Tamil'\n      },",
  si: "      header: {\n        activeFarmer: 'සක්රීය ගොවියා',\n        languageEnglish: 'ඉංග්රීසි',\n        languageSinhala: 'සිංහල',\n        languageTamil: 'දෙමළ'\n      },",
  ta: "      header: {\n        activeFarmer: 'செயலில் உள்ள விவசாயி',\n        languageEnglish: 'ஆங்கிலம்',\n        languageSinhala: 'சிங்களம்',\n        languageTamil: 'தமிழ்'\n      },"
};

const overviewIncoming = {
  si: "noIncomingOrders: 'තවම ලැබෙන ඇණවුම් නැත.',",
  ta: "noIncomingOrders: 'இன்னும் வரும் ஆர்டர்கள் இல்லை.',"
};

const servicesTrans = {
  si: "transportTitle: 'ප්රවාහන සේවාව',\n        transportDesc: 'ඔබගේ නිෂ්පාදන පාරිභෝගිකයින්ට හෝ වෙළඳපොළට බෙදා හැරීමට ප්රවාහන සහාය ඉල්ලන්න.',\n        reqTransport: 'ප්රවාහනය ඉල්ලන්න',\n        bankTitle: 'බැංකු විස්තර',\n        bankDesc: 'පාරිභෝගික ගෙවීම් ලබා ගැනීමට ඔබගේ බැංකු ගිණුම් විස්තර කළමනාකරණය කරන්න.',\n        manageBank: 'බැංකු විස්තර කළමනාකරණය',",
  ta: "transportTitle: 'போக்குவரத்து சேவை',\n        transportDesc: 'உங்கள் தயாரிப்புகளை வாடிக்கையாளர்கள் அல்லது சந்தைகளுக்கு கொண்டு செல்ல போக்குவரத்து உதவியை கோருங்கள்.',\n        reqTransport: 'போக்குவரத்து கோருங்கள்',\n        bankTitle: 'வங்கி விவரங்கள்',\n        bankDesc: 'வாடிக்கையாளர் பணப்பரிவர்த்தனைகளை பெற உங்கள் வங்கி கணக்கு விவரங்களை நிர்வகிக்கவும்.',\n        manageBank: 'வங்கி விவரங்களை நிர்வகிக்கவும்',"
};

// Instead of regex, I'll do a simple find and replace per language since structure is known

let newContent = content;

// English insertions
newContent = newContent.replace(
  "common: {",
  `${headerKeys.en}\n      common: {`
);

// Sinhala insertions
newContent = newContent.replace(
  "si: {\n    farmer: {\n      common: {",
  `si: {\n    farmer: {\n${headerKeys.si}\n      common: {`
);
newContent = newContent.replace(
  "si: {\n    farmer: {\n      common: {",
  `si: {\n    farmer: {\n${headerKeys.si}\n      common: {`
); // in case spaces vary. Let's just find "si: {\n    farmer: {\n"
newContent = newContent.replace(
  "si: {\n    farmer: {",
  `si: {\n    farmer: {\n${headerKeys.si}`
);
newContent = newContent.replace(
  "ta: {\n    farmer: {",
  `ta: {\n    farmer: {\n${headerKeys.ta}`
);

// We need to carefully inject into si/ta overview and services
// Using a string split to inject
let parts = newContent.split("overview: {");
if (parts.length === 4) {
  // parts[0] is before en overview
  // parts[1] is after en overview, before si overview
  // parts[2] is after si overview, before ta overview
  // parts[3] is after ta overview
  parts[2] = `\n        ${overviewIncoming.si}\n` + parts[2].trimStart();
  parts[3] = `\n        ${overviewIncoming.ta}\n` + parts[3].trimStart();
  newContent = parts.join("overview: {");
}

let svcParts = newContent.split("services: {");
if (svcParts.length === 4) {
  // svcParts[1] is inside en, already modified by first replace
  // svcParts[2] is inside si
  // svcParts[3] is inside ta
  svcParts[2] = `\n        ${servicesTrans.si}\n` + svcParts[2].trimStart();
  svcParts[3] = `\n        ${servicesTrans.ta}\n` + svcParts[3].trimStart();
  newContent = svcParts.join("services: {");
}

fs.writeFileSync(targetPath, newContent, 'utf8');
console.log('Successfully updated farmerTranslations.js');
