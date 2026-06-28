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
    if (content.includes('const reload = useCallback') && content.includes('setInterval(reload, 3000)')) {
        
        let lines = content.split(/\r?\n/);
        let newLines = [];
        let inBlock = false;
        
        let condition = '';
        let reloadCall = '';
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            
            if (line.includes('const reload = useCallback(')) {
                inBlock = true;
                continue;
            }
            
            if (inBlock) {
                if (line.includes('if (') && line.includes('return;')) {
                    condition = line.substring(line.indexOf('if (') + 4, line.indexOf(') return;'));
                } else if (line.includes('router.reload(')) {
                    reloadCall = line.trim();
                } else if (line.includes('}, [reload]);')) {
                    inBlock = false;
                    
                    // Construct replacement
                    condition = condition.replace('isNavigating() || ', '').replace(' || isNavigating()', '').replace('isNavigating()', '');
                    let extraCheck = condition.trim() ? `            if (${condition}) return;\n` : '';
                    
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
                    
                    newLines.push(...replacement.split('\n'));
                }
                continue;
            }
            
            newLines.push(line);
        }
        
        let newContent = newLines.join('\n');
        
        if (!newContent.includes('isNavigating(') && !newContent.includes('isNavigating)')) {
            newContent = newContent.replace(/import\s*\{\s*isNavigating\s*\}\s*from\s*['"]@\/Components\/Pagination['"];\r?\n/, '');
            newContent = newContent.replace(/,\s*isNavigating\s*\}\s*from\s*['"]@\/Components\/Pagination['"];/, "} from '@/Components/Pagination';");
        }
        
        fs.writeFileSync(file, newContent, 'utf8');
        console.log('Updated ' + file);
    }
});
