const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'code/frontend/src/i18n/translations.js');
let content = fs.readFileSync(targetPath, 'utf8');

if (!content.includes('import farmerTranslations')) {
  // Prepend import
  content = `import farmerTranslations from './farmerTranslations';\n` + content;
  
  // Remove the old 'overview' object for en, si, ta to avoid confusion, since everything moves to farmerTranslations
  content = content.replace(/\s*overview:\s*\{[\s\S]*?\},(?=\s*districts:)/g, '\n');

  // We know there are exactly 3 'districts' objects.
  let index = 0;
  content = content.replace(/(\s*districts:\s*\{[\s\S]*?\},)(\s*\},)/g, (match, p1, p2) => {
    if (index === 0) { index++; return `${p1}\n    ...farmerTranslations.en,${p2}`; }
    if (index === 1) { index++; return `${p1}\n    ...farmerTranslations.si,${p2}`; }
    if (index === 2) { index++; return `${p1}\n    ...farmerTranslations.ta,${p2}`; }
    return match;
  });

  fs.writeFileSync(targetPath, content, 'utf8');
  console.log('Successfully updated translations.js');
} else {
  console.log('Already updated translations.js');
}
