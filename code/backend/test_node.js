console.log("Node is working in " + process.cwd());
const fs = require('fs');
console.log("server.js exists: " + fs.existsSync('server.js'));
