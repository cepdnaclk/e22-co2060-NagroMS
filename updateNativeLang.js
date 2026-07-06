const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, 'code', 'frontend', 'src', 'Pages', 'farmer', 'components');
const settingsPath = path.join(frontendDir, 'SettingsSection.jsx');
const overviewPath = path.join(frontendDir, 'OverviewSection.jsx');
const communityPath = path.join(frontendDir, 'CommunitySection.jsx');

// 1. SettingsSection.jsx
let settingsContent = fs.readFileSync(settingsPath, 'utf8');

settingsContent = settingsContent.replace(
  /<option value="en">\{t\('farmer\.header\.languageEnglish'\) \|\| 'English'\}<\/option>/,
  '<option value="en">English</option>'
);
settingsContent = settingsContent.replace(
  /<option value="si">\{t\('farmer\.header\.languageSinhala'\) \|\| 'Sinhala'\}<\/option>/,
  '<option value="si">සිංහල</option>'
);
settingsContent = settingsContent.replace(
  /<option value="ta">\{t\('farmer\.header\.languageTamil'\) \|\| 'Tamil'\}<\/option>/,
  '<option value="ta">தமிழ்</option>'
);

fs.writeFileSync(settingsPath, settingsContent, 'utf8');

// 2. OverviewSection.jsx
let overviewContent = fs.readFileSync(overviewPath, 'utf8');

overviewContent = overviewContent.replace(
  /<option value="en">\{t\('farmer\.header\.languageEnglish'\) \|\| 'English'\}<\/option>/,
  '<option value="en">English</option>'
);
overviewContent = overviewContent.replace(
  /<option value="si">\{t\('farmer\.header\.languageSinhala'\) \|\| 'Sinhala'\}<\/option>/,
  '<option value="si">සිංහල</option>'
);
overviewContent = overviewContent.replace(
  /<option value="ta">\{t\('farmer\.header\.languageTamil'\) \|\| 'Tamil'\}<\/option>/,
  '<option value="ta">தமிழ்</option>'
);

fs.writeFileSync(overviewPath, overviewContent, 'utf8');

// 3. CommunitySection.jsx
let communityContent = fs.readFileSync(communityPath, 'utf8');

communityContent = communityContent.replace(
  /<input type="file" accept="image\/\*" onChange=\{e => setUpdateImage\(e\.target\.files\[0\]\)\} style=\{\{ fontSize: '12px' \}\} \/>/,
  `<input type="file" id="communityUpdateImageInput" accept="image/*" onChange={e => setUpdateImage(e.target.files[0])} style={{ display: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button type="button" onClick={() => document.getElementById("communityUpdateImageInput").click()} style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#f9fafb', cursor: 'pointer', fontSize: '12px', color: '#374151' }}>
                {t("farmer.settings.chooseFile") || 'Choose File'}
              </button>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                {updateImage ? updateImage.name : (t("farmer.settings.noFileChosen") || 'No file chosen')}
              </span>
            </div>`
);

fs.writeFileSync(communityPath, communityContent, 'utf8');

console.log('Successfully updated native language dropdowns and community file input');
