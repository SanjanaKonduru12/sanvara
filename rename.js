const fs = require('fs');
const path = require('path');

const exclude = ['node_modules', 'target', 'dist', '.git', '.antigravity', 'peers'];

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        if (exclude.includes(file)) return;
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            results.push(file);
        }
    });
    return results;
}

const files = walk('.');

files.forEach(file => {
    try {
        let content = fs.readFileSync(file, 'utf8');
        let changed = false;

        if (content.includes('LuminaMart')) {
            content = content.replace(/LuminaMart/g, 'Sanvara');
            changed = true;
        }
        if (content.includes('Lumina Mart')) {
            content = content.replace(/Lumina Mart/g, 'Sanvara');
            changed = true;
        }
        if (content.includes('luminamart')) {
            content = content.replace(/luminamart/g, 'sanvara');
            changed = true;
        }
        if (content.includes('lumina-mart')) {
            content = content.replace(/lumina-mart/g, 'sanvara');
            changed = true;
        }
        if (content.includes('Lumina')) {
            content = content.replace(/Lumina/g, 'Sanvara');
            changed = true;
        }
        if (content.includes('lumina')) {
            content = content.replace(/lumina/g, 'sanvara');
            changed = true;
        }

        if (changed) {
            fs.writeFileSync(file, content, 'utf8');
            console.log('Replaced in ' + file);
        }
    } catch (e) {
        // skip binary or unreadable files
    }
});

// Rename java package directory
const oldPkgPath = path.join(__dirname, 'backend', 'src', 'main', 'java', 'com', 'luminamart');
const newPkgPath = path.join(__dirname, 'backend', 'src', 'main', 'java', 'com', 'sanvara');

if (fs.existsSync(oldPkgPath)) {
    fs.renameSync(oldPkgPath, newPkgPath);
    console.log('Renamed package directory from luminamart to sanvara');
}

// Rename main application file
const oldAppFile = path.join(newPkgPath, 'ecommerce', 'LuminaMartApplication.java');
const newAppFile = path.join(newPkgPath, 'ecommerce', 'SanvaraApplication.java');

if (fs.existsSync(oldAppFile)) {
    fs.renameSync(oldAppFile, newAppFile);
    console.log('Renamed LuminaMartApplication.java to SanvaraApplication.java');
}
