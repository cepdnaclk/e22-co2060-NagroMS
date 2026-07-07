
const fs = require('fs');
let content = fs.readFileSync('src/Pages/Landingpage/Landingpage.jsx', 'utf8');

// Header fixed
content = content.replace(
  /position: 'sticky',/g,
  \position: 'fixed',\n      left: 0,\n      width: '100%',\n      boxSizing: 'border-box',\
);

// Add top padding to hero section
content = content.replace(
  /padding: '80px 48px',/,
  \padding: '140px 48px 80px',\
);

// Background and general colors
content = content.replace(/background: '#0f172a'/g, \ackground: '#ffffff'\);
content = content.replace(/background: 'rgba\\(15,23,42,0.85\\)'/g, \ackground: 'rgba(255,255,255,0.95)'\);
content = content.replace(/color: 'white'/g, \color: '#111827'\);
content = content.replace(/color: '#4ade80'/g, \color: '#16a34a'\);

// Replace white transparent rgba with black transparent rgba
content = content.replace(/rgba\\(255,255,255,0.04\\)/g, 'rgba(0,0,0,0.03)');
content = content.replace(/rgba\\(255,255,255,0.05\\)/g, 'rgba(0,0,0,0.06)');
content = content.replace(/rgba\\(255,255,255,0.06\\)/g, 'rgba(0,0,0,0.08)');
content = content.replace(/rgba\\(255,255,255,0.07\\)/g, 'rgba(0,0,0,0.1)');
content = content.replace(/rgba\\(255,255,255,0.12\\)/g, 'rgba(0,0,0,0.12)');
content = content.replace(/rgba\\(255,255,255,0.2\\)/g, 'rgba(0,0,0,0.2)');
content = content.replace(/rgba\\(255,255,255,0.45\\)/g, 'rgba(0,0,0,0.55)');
content = content.replace(/rgba\\(255,255,255,0.55\\)/g, 'rgba(0,0,0,0.65)');
content = content.replace(/rgba\\(255,255,255,0.6\\)/g, 'rgba(0,0,0,0.7)');
content = content.replace(/rgba\\(255,255,255,0.65\\)/g, 'rgba(0,0,0,0.7)');
content = content.replace(/rgba\\(255,255,255,0.75\\)/g, 'rgba(0,0,0,0.8)');
content = content.replace(/rgba\\(255,255,255,0.9\\)/g, 'rgba(0,0,0,0.9)');
content = content.replace(/rgba\\(255,255,255,0.92\\)/g, 'rgba(0,0,0,0.92)');

// Button outline border
content = content.replace(/border: '1px solid rgba\\(0,0,0,0.2\\)'/, \order: '1px solid rgba(0,0,0,0.15)'\);

// Dark edge vignette in Hero section (cover image)
content = content.replace(/rgba\\(15,23,42,0.75\\)/g, 'rgba(255,255,255,0.8)');
content = content.replace(/rgba\\(3,20,10,0.9\\)/g, 'rgba(255,255,255,0.9)');
content = content.replace(/rgba\\(5,46,22,0.95\\),rgba\\(3,20,10,0.98\\)/g, 'rgba(240,253,244,0.95),rgba(220,252,231,0.98)');
content = content.replace(/rgba\\(3,37,16,0.92\\)/g, 'rgba(255,255,255,0.92)');

// FeatureCard corner arrow
content = content.replace(/background: 'rgba\\(0,0,0,0.45\\)'/g, \ackground: 'rgba(255,255,255,0.9)'\);

fs.writeFileSync('src/Pages/Landingpage/Landingpage.jsx', content);
console.log('Done');

