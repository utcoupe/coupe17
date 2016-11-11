const fs = require('fs-extra');
const jsdox = require("jsdox");
const path = require('path');

const files = ["ia", "server", "utcoupe", "config.js"];

fs.removeSync('doc');

files.forEach(file => {
    let dirName = file;
    if(fs.statSync(file).isFile()) {
        dirName = path.dirname(file);
    }
    fs.ensureDirSync("doc/" + dirName);
    jsdox.generateForDir(file, "doc/" + dirName, null, ()=>{}, ()=>{});
});
