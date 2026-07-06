const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, 'code', 'frontend', 'src', 'Pages', 'farmer', 'components');
const settingsPath = path.join(frontendDir, 'SettingsSection.jsx');
const overviewPath = path.join(frontendDir, 'OverviewSection.jsx');

// 1. SettingsSection.jsx
let settingsContent = fs.readFileSync(settingsPath, 'utf8');

// Fix Language dropdown
settingsContent = settingsContent.replace(
  />English<\/option>/,
  ">{t('farmer.header.languageEnglish') || 'English'}</option>"
);
settingsContent = settingsContent.replace(
  />Sinhala<\/option>/,
  ">{t('farmer.header.languageSinhala') || 'Sinhala'}</option>"
);
settingsContent = settingsContent.replace(
  />Tamil<\/option>/,
  ">{t('farmer.header.languageTamil') || 'Tamil'}</option>"
);

// Fix DOB Input
settingsContent = settingsContent.replace(
  /<input type="date" name="dateOfBirth"([^>]+)>/,
  `<input type="text" placeholder={t("farmer.settings.dobPlaceholder") || "MM/DD/YYYY"} name="dateOfBirth"$1>`
);

// Fix Profile Photo Input
settingsContent = settingsContent.replace(
  /<input type="file" accept="image\/\*" onChange=\{e => setPhotoFile\(e\.target\.files\[0\]\)\} style=\{\{ fontSize: '14px' \}\} \/>/,
  `<input type="file" id="profilePhotoInput" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} style={{ display: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <button type="button" onClick={() => document.getElementById("profilePhotoInput").click()} style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#f9fafb', cursor: 'pointer', fontSize: '14px', color: '#374151' }}>
                  {t("farmer.settings.chooseFile") || 'Choose File'}
                </button>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  {photoFile ? photoFile.name : (t("farmer.settings.noFileChosen") || 'No file chosen')}
                </span>
              </div>`
);

fs.writeFileSync(settingsPath, settingsContent, 'utf8');


// 2. OverviewSection.jsx
let overviewContent = fs.readFileSync(overviewPath, 'utf8');

// The language dropdown options were already updated in the previous run to contain `{t('farmer.header.languageEnglish') || 'English'}`.
// Let's verify that using regex to double check if they exist or need replace. But wait, in the previous run I already did this!
// Ah, the user requested it again. Let's make sure it's correct.
// Overview language dropdown:
// <option value="en">{t('farmer.header.languageEnglish') || 'English'}</option>
// It was done exactly like that. I will skip language dropdown for overview if it's already there.

// Fix Product Image Input
overviewContent = overviewContent.replace(
  /<input type="file" accept="image\/\*" onChange=\{\(e\) => setFormData\(\{\.\.\.formData, imageFile: e\.target\.files\[0\]\}\)\} style=\{\{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' \}\} \/>/,
  `<input type="file" id="productImageInput" accept="image/*" onChange={(e) => setFormData({...formData, imageFile: e.target.files[0]})} style={{ display: 'none' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <button type="button" onClick={() => document.getElementById("productImageInput").click()} style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#f9fafb', cursor: 'pointer', fontSize: '14px', color: '#374151' }}>
                    {t("farmer.settings.chooseFile") || 'Choose File'}
                  </button>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>
                    {formData.imageFile ? formData.imageFile.name : (t("farmer.settings.noFileChosen") || 'No file chosen')}
                  </span>
                </div>`
);

fs.writeFileSync(overviewPath, overviewContent, 'utf8');

console.log('Successfully updated SettingsSection and OverviewSection UIs');
