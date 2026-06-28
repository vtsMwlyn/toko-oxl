const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'resources', 'js', 'Pages');

const pattern = /    const reload = useCallback\(\(\) => \{\s*if \((.*?)\) return;\s*(router\.reload\(\{.*?\});\s*\}, \[\]\);\s*useEffect\(\(\) => \{\s*const id = setInterval\(reload, 3000\);\s*document\.addEventListener\('visibilitychange', reload\);\s*return \(\) => \{\s*clearInterval\(id\);\s*document\.removeEventListener\('visibilitychange', reload\);\s*\};\s*\}, \[reload\]\);/s;

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
    if (content.includes('const reload = useCallback')) {
        const match = pattern.exec(content);
        if (match) {
            let cond = match[1];
            let reloadCall = match[2];
            
            cond = cond.replace('isNavigating() || ', '').replace(' || isNavigating()', '').replace('isNavigating()', '');
            
            let extraCheck = cond.trim() ? `            if (${cond}) return;\n` : '';
            
            let replacement = `    useEffect(() => {
        let activeVisits = 0;
        const removeStart  = router.on('start',  () => { activeVisits++; });
        const removeFinish = router.on('finish', () => { activeVisits = Math.max(0, activeVisits - 1); });

        const doReload = () => {
            if (document.visibilityState === 'hidden') return;
            if (activeVisits > 0) return;
${extraCheck}            ${reloadCall}
        };

        const id = setInterval(doReload, 3000);
        document.addEventListener('visibilitychange', doReload);
        return () => {
            clearInterval(id);
            document.removeEventListener('visibilitychange', doReload);
            removeStart();
            removeFinish();
        };
    }, []);`;
            
            let newContent = content.replace(pattern, replacement);
            
            // Remove the import { isNavigating } from '@/Components/Pagination'; if not used anymore
            if (!newContent.includes('isNavigating(') && !newContent.includes('isNavigating)')) {
                newContent = newContent.replace(/import\s*\{\s*isNavigating\s*\}\s*from\s*['"]@\/Components\/Pagination['"];\r?\n/, '');
                newContent = newContent.replace(/,\s*isNavigating\s*\}\s*from\s*['"]@\/Components\/Pagination['"];/, "} from '@/Components/Pagination';");
            }
            
            fs.writeFileSync(file, newContent, 'utf8');
            console.log('Updated ' + file);
        }
    }
});
