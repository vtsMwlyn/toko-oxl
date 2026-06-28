const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'resources', 'js', 'Pages');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(pagesDir);
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if it uses the auto-reload pattern
    if (!content.includes('setInterval(doReload, 3000)')) return;
    
    // Extract the reload variables
    const reloadMatch = content.match(/router\.reload\(\{.*only:\s*\[(.*?)\].*\}\);/);
    if (!reloadMatch) return;
    
    let variables = reloadMatch[1].split(',').map(s => s.replace(/['"\s]/g, '')).filter(Boolean);
    
    // Add axios import
    if (!content.includes("import axios")) {
        content = content.replace(/(import .*?;(\r?\n))+/, match => match + "import axios from 'axios';\n");
    }

    // Replace the function signature
    let sigRegex = /(export default function [a-zA-Z0-9_]+\s*\(\{\s*)(.*?)(\s*\}\)\s*\{)/;
    let sigMatch = content.match(sigRegex);
    if (!sigMatch) return;
    
    let propsRaw = sigMatch[2];
    let newProps = propsRaw;
    
    let useStateBlock = '';
    let useEffectDeps = [];
    let useEffectSetters = '';
    let axiosSetters = '';
    
    variables.forEach(v => {
        // e.g. "users" -> "users: initialUsers"
        let capV = v.charAt(0).toUpperCase() + v.slice(1);
        let initV = 'initial' + capV;
        
        let propRegex = new RegExp(`\\b${v}\\b(?!:)`);
        if (newProps.match(propRegex)) {
            newProps = newProps.replace(propRegex, `${v}: ${initV}`);
            useStateBlock += `    const [${v}, set${capV}] = useState(${initV});\n`;
            useEffectDeps.push(initV);
            useEffectSetters += `        set${capV}(${initV});\n`;
            axiosSetters += `                    set${capV}(res.data.props.${v});\n`;
        }
    });
    
    let newSig = sigMatch[1] + newProps + sigMatch[3];
    content = content.replace(sigRegex, newSig);
    
    let stateSyncBlock = `\n${useStateBlock}\n    useEffect(() => {\n${useEffectSetters}    }, [${useEffectDeps.join(', ')}]);\n`;
    
    // Insert stateSyncBlock right after the first line of the function block (after the {)
    let bodyStartIndex = content.indexOf('{', sigMatch.index + sigMatch[0].length - 3) + 1;
    content = content.slice(0, bodyStartIndex) + stateSyncBlock + content.slice(bodyStartIndex);
    
    // Replace useEffect block
    let oldEffectPattern = /    useEffect\(\(\) => \{\s*let activeVisits = 0;.*?document\.removeEventListener\('visibilitychange', doReload\);\s*removeStart\(\);\s*removeFinish\(\);\s*\};\s*\}, \[.*?\]\);/s;
    
    let newEffect = `    useEffect(() => {
        const doReload = () => {
            if (document.visibilityState === 'hidden') return;
            axios.get(window.location.href, { headers: { 'X-Inertia': 'true' } })
                .then(res => {
${axiosSetters}                })
                .catch(console.error);
        };

        const id = setInterval(doReload, 15000);
        document.addEventListener('visibilitychange', doReload);
        return () => {
            clearInterval(id);
            document.removeEventListener('visibilitychange', doReload);
        };
    }, []);`;
    
    content = content.replace(oldEffectPattern, newEffect);
    
    // If 'react' import exists, ensure useState and useEffect are imported
    if (content.includes("from 'react'")) {
        if (!content.includes('useState')) content = content.replace(/import {/, 'import { useState,');
        if (!content.includes('useEffect')) content = content.replace(/import {/, 'import { useEffect,');
    }
    
    fs.writeFileSync(file, content, 'utf8');
    console.log('Migrated ' + file);
});
