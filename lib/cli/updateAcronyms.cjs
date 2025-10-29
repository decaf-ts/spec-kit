#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runUpdateAcronymsCLI = runUpdateAcronymsCLI;
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const fs_1 = __importDefault(require("fs"));
async function walk(dir, filesSet) {
    const entries = await promises_1.default.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
        const name = e.name;
        if (name === 'node_modules' || name === '.git' || name === '.specify')
            continue;
        const full = path_1.default.join(dir, name);
        if (e.isDirectory()) {
            await walk(full, filesSet);
        }
        else if (e.isFile()) {
            if (/\.(md|mdx|txt|markdown)$/i.test(name))
                filesSet.add(full);
        }
    }
}
async function scanAndWrite(target, outPath) {
    const files = new Set();
    await walk(target, files);
    // try to read constitution from target
    let acronyms = {};
    try {
        const consPath = path_1.default.join(target, '.specify', 'memory', 'constitution.md');
        if (fs_1.default.existsSync(consPath)) {
            const raw = await promises_1.default.readFile(consPath, 'utf8');
            const m = raw.match(/```(?:yaml|yml)\s*\n([\s\S]*?)\n```/i);
            const inner = m ? m[1].trim() : raw.trim();
            try {
                acronyms = JSON.parse(inner).Acronyms || {};
            }
            catch (e) {
                void e; // Silence unused catch parameter
                // naive parse: look for lines '  Key: VAL'
                const lines = inner.split(/\r?\n/);
                for (const l of lines) {
                    const kv = l.match(/^\s*([^:]+):\s*(\S+)\s*$/);
                    if (kv)
                        acronyms[kv[1].trim()] = kv[2].trim();
                }
            }
        }
    }
    catch (e) {
        void e; // Silence unused catch parameter
        acronyms = {};
    }
    const tokenRe = /\{\{\s*ACRONYM\s*:\s*([^}]+?)\s*\}\}/g;
    const summary = [];
    const changedFiles = [];
    for (const f of files) {
        try {
            const txt = await promises_1.default.readFile(f, 'utf8');
            let m;
            let count = 0;
            tokenRe.lastIndex = 0;
            while ((m = tokenRe.exec(txt)) !== null) {
                const key = m[1].trim();
                if (acronyms && (acronyms[key] || Object.keys(acronyms).find(k => k.toLowerCase() === key.toLowerCase())))
                    count++;
            }
            if (count > 0) {
                summary.push({ file: path_1.default.resolve(f), replacements: count });
                changedFiles.push(path_1.default.resolve(f));
            }
        }
        catch (e) {
            void e;
        }
    }
    const result = { changedFiles, summary, timestamp: new Date().toISOString() };
    await promises_1.default.mkdir(path_1.default.dirname(outPath), { recursive: true });
    await promises_1.default.writeFile(outPath, JSON.stringify(result, null, 2), 'utf8');
    return result;
}
async function runUpdateAcronymsCLI(argv = process.argv.slice(2)) {
    const targetArg = argv.find(a => a.startsWith('--target='));
    const target = (targetArg ? targetArg.split('=')[1] : process.cwd());
    const out = path_1.default.resolve('specs/001-configurable-acronyms-jira-integration');
    const outPath = path_1.default.join(out, 'update-acronyms-dryrun.json');
    const result = await scanAndWrite(target, outPath);
    // If apply flag present, perform replacements in the target repo, create branch and commit
    if (argv.includes('--apply')) {
        const branchArg = argv.find(a => a.startsWith('--branch='));
        const branch = branchArg ? branchArg.split('=')[1] : `chore/update-acronyms-${Date.now()}`;
        // read constitution mapping again
        const consPath = path_1.default.join(target, '.specify', 'memory', 'constitution.md');
        let acronyms = {};
        try {
            const raw = await promises_1.default.readFile(consPath, 'utf8');
            const m = raw.match(/```(?:yaml|yml)\s*\n([\s\S]*?)\n```/i);
            const inner = m ? m[1].trim() : raw.trim();
            try {
                acronyms = JSON.parse(inner).Acronyms || {};
            }
            catch (e) {
                void e;
                const lines = inner.split(/\r?\n/);
                for (const l of lines) {
                    const kv = l.match(/^\s*([^:]+):\s*(\S+)\s*$/);
                    if (kv)
                        acronyms[kv[1].trim()] = kv[2].trim();
                }
            }
        }
        catch (e) {
            void e;
            acronyms = {};
        }
        // perform replacements
        const tokenRe = /\{\{\s*ACRONYM\s*:\s*([^}]+?)\s*\}\}/g;
        for (const item of result.summary) {
            try {
                const filePath = item.file;
                let txt = await promises_1.default.readFile(filePath, 'utf8');
                txt = txt.replace(tokenRe, (_m, p1) => {
                    const key = p1.trim();
                    const found = Object.keys(acronyms).find(k => k.toLowerCase() === key.toLowerCase());
                    if (found)
                        return acronyms[found];
                    if (acronyms[key])
                        return acronyms[key];
                    // fallback to initials
                    const initials = key.split(/\s+/).map((w) => (w.replace(/[^A-Za-z0-9]/g, '')[0] || '').toUpperCase()).join('').slice(0, 3);
                    return initials || key;
                });
                await promises_1.default.writeFile(filePath, txt, 'utf8');
            }
            catch (e) {
                void e; // Silence unused catch parameter
                // ignore per-file failures
            }
        }
        // create branch and commit inside target repo using git CLI
        let commitHash = '';
        try {
            const { execSync } = await Promise.resolve().then(() => __importStar(require('child_process')));
            execSync(`git checkout -b ${branch}`, { cwd: target, stdio: 'ignore' });
            execSync('git add -A', { cwd: target, stdio: 'ignore' });
            execSync(`git commit -m "chore: apply acronym replacements"`, { cwd: target, stdio: 'ignore' });
            commitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8', cwd: target }).trim();
        }
        catch (e) {
            void e; // Silence unused catch parameter
            // git may fail (no git available etc.) — continue and write partial result
            commitHash = '';
        }
        const outApply = path_1.default.join(out, 'update-acronyms-result.json');
        await promises_1.default.writeFile(outApply, JSON.stringify({ ...result, branch, commitHash }, null, 2), 'utf8');
    }
    return outPath;
}
const url_1 = require("url");
const __filename = (() => {
    try {
        // Access import.meta.url dynamically to avoid TypeScript errors when compiling to CommonJS
        const url = Function('return import.meta.url')();
        return (0, url_1.fileURLToPath)(url);
    }
    catch {
        // CommonJS fallback
        return process.argv[1];
    }
})();
if (process.argv[1] === __filename) {
    runUpdateAcronymsCLI(process.argv.slice(2)).then(p => console.log('Wrote', p)).catch(err => { console.error(err); process.exit(1); });
}
exports.default = runUpdateAcronymsCLI;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlQWNyb255bXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY2xpL3VwZGF0ZUFjcm9ueW1zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXdFQSxvREF1RUM7QUE5SUQsZ0RBQXdCO0FBQ3hCLDJEQUE2QjtBQUM3Qiw0Q0FBd0I7QUFFeEIsS0FBSyxVQUFVLElBQUksQ0FBQyxHQUFXLEVBQUUsUUFBcUI7SUFDcEQsTUFBTSxPQUFPLEdBQUcsTUFBTSxrQkFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUMvRCxLQUFLLE1BQU0sQ0FBQyxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBQ3hCLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDcEIsSUFBSSxJQUFJLEtBQUssY0FBYyxJQUFJLElBQUksS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLFVBQVU7WUFBRSxTQUFTO1FBQ2hGLE1BQU0sSUFBSSxHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUM7WUFDcEIsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzdCLENBQUM7YUFBTSxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDO1lBQ3RCLElBQUksMkJBQTJCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pFLENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQztBQUVELEtBQUssVUFBVSxZQUFZLENBQUMsTUFBYyxFQUFFLE9BQWU7SUFDekQsTUFBTSxLQUFLLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztJQUNoQyxNQUFNLElBQUksQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDMUIsdUNBQXVDO0lBQ3ZDLElBQUksUUFBUSxHQUEyQixFQUFFLENBQUM7SUFDMUMsSUFBSSxDQUFDO1FBQ0gsTUFBTSxRQUFRLEdBQUcsY0FBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQzVFLElBQUksWUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1lBQ2hDLE1BQU0sR0FBRyxHQUFHLE1BQU0sa0JBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ2hELE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsc0NBQXNDLENBQUMsQ0FBQztZQUM1RCxNQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzNDLElBQUksQ0FBQztnQkFBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDO1lBQUMsQ0FBQztZQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7Z0JBQzlELEtBQUssQ0FBQyxDQUFDLENBQUMsaUNBQWlDO2dCQUN6QywyQ0FBMkM7Z0JBQzNDLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ25DLEtBQUssTUFBTSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUM7b0JBQ3RCLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQztvQkFDL0MsSUFBSSxFQUFFO3dCQUFFLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2hELENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1FBQ1gsS0FBSyxDQUFDLENBQUMsQ0FBQyxpQ0FBaUM7UUFDekMsUUFBUSxHQUFHLEVBQUUsQ0FBQztJQUNoQixDQUFDO0lBRUQsTUFBTSxPQUFPLEdBQUcsdUNBQXVDLENBQUM7SUFDeEQsTUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQ25CLE1BQU0sWUFBWSxHQUFHLEVBQUUsQ0FBQztJQUV4QixLQUFLLE1BQU0sQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDO1FBQ3RCLElBQUksQ0FBQztZQUNILE1BQU0sR0FBRyxHQUFHLE1BQU0sa0JBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3pDLElBQUksQ0FBQyxDQUFDO1lBQUMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7WUFDNUMsT0FBTyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUM7Z0JBQ3hDLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDeEIsSUFBSSxRQUFRLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEtBQUssR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7b0JBQUUsS0FBSyxFQUFFLENBQUM7WUFDckgsQ0FBQztZQUNELElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUNkLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsY0FBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztnQkFDN0QsWUFBWSxDQUFDLElBQUksQ0FBQyxjQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckMsQ0FBQztRQUNILENBQUM7UUFBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ1gsS0FBSyxDQUFDLENBQUM7UUFDVCxDQUFDO0lBQ0gsQ0FBQztJQUVELE1BQU0sTUFBTSxHQUFHLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDO0lBQzlFLE1BQU0sa0JBQUUsQ0FBQyxLQUFLLENBQUMsY0FBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQzNELE1BQU0sa0JBQUUsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNyRSxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDO0FBRU0sS0FBSyxVQUFVLG9CQUFvQixDQUFDLE9BQWlCLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUMvRSxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO0lBQzVELE1BQU0sTUFBTSxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQVcsQ0FBQztJQUMvRSxNQUFNLEdBQUcsR0FBRyxjQUFJLENBQUMsT0FBTyxDQUFDLGtEQUFrRCxDQUFDLENBQUM7SUFDN0UsTUFBTSxPQUFPLEdBQUcsY0FBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsNkJBQTZCLENBQUMsQ0FBQztJQUM5RCxNQUFNLE1BQU0sR0FBRyxNQUFNLFlBQVksQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFFbkQsMkZBQTJGO0lBQzNGLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO1FBQzdCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDNUQsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyx5QkFBeUIsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7UUFDM0Ysa0NBQWtDO1FBQ2xDLE1BQU0sUUFBUSxHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztRQUM1RSxJQUFJLFFBQVEsR0FBMkIsRUFBRSxDQUFDO1FBQzFDLElBQUksQ0FBQztZQUNILE1BQU0sR0FBRyxHQUFHLE1BQU0sa0JBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ2hELE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsc0NBQXNDLENBQUMsQ0FBQztZQUM1RCxNQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzNDLElBQUksQ0FBQztnQkFBQyxRQUFRLEdBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQVMsQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDO1lBQUMsQ0FBQztZQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7Z0JBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzdFLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3JDLEtBQUssTUFBTSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUM7b0JBQ3RCLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQztvQkFDL0MsSUFBSSxFQUFFO3dCQUFHLFFBQWdCLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUN6RCxDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7UUFBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ1gsS0FBSyxDQUFDLENBQUM7WUFDUCxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLENBQUM7UUFFRCx1QkFBdUI7UUFDdkIsTUFBTSxPQUFPLEdBQUcsdUNBQXVDLENBQUM7UUFDeEQsS0FBSyxNQUFNLElBQUksSUFBSSxNQUFNLENBQUMsT0FBd0QsRUFBRSxDQUFDO1lBQ25GLElBQUksQ0FBQztnQkFDSCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO2dCQUMzQixJQUFJLEdBQUcsR0FBRyxNQUFNLGtCQUFFLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDOUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFO29CQUNwQyxNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQ3RCLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxLQUFLLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO29CQUNyRixJQUFJLEtBQUs7d0JBQUUsT0FBTyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ2xDLElBQUksUUFBUSxDQUFDLEdBQUcsQ0FBQzt3QkFBRSxPQUFPLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDeEMsdUJBQXVCO29CQUN2QixNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMvSCxPQUFPLFFBQVEsSUFBSSxHQUFHLENBQUM7Z0JBQ3pCLENBQUMsQ0FBQyxDQUFDO2dCQUNILE1BQU0sa0JBQUUsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUM1QyxDQUFDO1lBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDVCxLQUFLLENBQUMsQ0FBQyxDQUFDLGlDQUFpQztnQkFDekMsMkJBQTJCO1lBQy9CLENBQUM7UUFDSCxDQUFDO1FBRUQsNERBQTREO1FBQzVELElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNwQixJQUFJLENBQUM7WUFDUCxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsd0RBQWEsZUFBZSxHQUFDLENBQUM7WUFDL0MsUUFBUSxDQUFDLG1CQUFtQixNQUFNLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDeEUsUUFBUSxDQUFDLFlBQVksRUFBRSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDekQsUUFBUSxDQUFDLG1EQUFtRCxFQUFFLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUNoRyxVQUFVLEdBQUcsUUFBUSxDQUFDLDRCQUE0QixFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNoRyxDQUFDO1FBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUNYLEtBQUssQ0FBQyxDQUFDLENBQUMsaUNBQWlDO1lBQ3pDLDJFQUEyRTtZQUMzRSxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLENBQUM7UUFFRCxNQUFNLFFBQVEsR0FBRyxjQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSw2QkFBNkIsQ0FBQyxDQUFDO1FBQy9ELE1BQU0sa0JBQUUsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLE1BQU0sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ25HLENBQUM7SUFFRCxPQUFPLE9BQU8sQ0FBQztBQUNqQixDQUFDO0FBRUQsNkJBQW9DO0FBQ3BDLE1BQU0sVUFBVSxHQUFHLENBQUMsR0FBRyxFQUFFO0lBQ3ZCLElBQUksQ0FBQztRQUNMLDJGQUEyRjtRQUMzRixNQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsd0JBQXdCLENBQUMsRUFBRSxDQUFDO1FBQy9DLE9BQU8sSUFBQSxtQkFBYSxFQUFDLEdBQWEsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFBQyxNQUFNLENBQUM7UUFDUCxvQkFBb0I7UUFDcEIsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3pCLENBQUM7QUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDO0FBRUwsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLFVBQVUsRUFBRSxDQUFDO0lBQ25DLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3hJLENBQUM7QUFFRCxrQkFBZSxvQkFBb0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzL3Byb21pc2VzJztcbmltcG9ydCBmc1N5bmMgZnJvbSAnZnMnO1xuXG5hc3luYyBmdW5jdGlvbiB3YWxrKGRpcjogc3RyaW5nLCBmaWxlc1NldDogU2V0PHN0cmluZz4pIHtcbiAgY29uc3QgZW50cmllcyA9IGF3YWl0IGZzLnJlYWRkaXIoZGlyLCB7IHdpdGhGaWxlVHlwZXM6IHRydWUgfSk7XG4gIGZvciAoY29uc3QgZSBvZiBlbnRyaWVzKSB7XG4gICAgY29uc3QgbmFtZSA9IGUubmFtZTtcbiAgICBpZiAobmFtZSA9PT0gJ25vZGVfbW9kdWxlcycgfHwgbmFtZSA9PT0gJy5naXQnIHx8IG5hbWUgPT09ICcuc3BlY2lmeScpIGNvbnRpbnVlO1xuICAgIGNvbnN0IGZ1bGwgPSBwYXRoLmpvaW4oZGlyLCBuYW1lKTtcbiAgICBpZiAoZS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICBhd2FpdCB3YWxrKGZ1bGwsIGZpbGVzU2V0KTtcbiAgICB9IGVsc2UgaWYgKGUuaXNGaWxlKCkpIHtcbiAgICAgIGlmICgvXFwuKG1kfG1keHx0eHR8bWFya2Rvd24pJC9pLnRlc3QobmFtZSkpIGZpbGVzU2V0LmFkZChmdWxsKTtcbiAgICB9XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gc2NhbkFuZFdyaXRlKHRhcmdldDogc3RyaW5nLCBvdXRQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHsgY2hhbmdlZEZpbGVzOiBzdHJpbmdbXTsgc3VtbWFyeTogQXJyYXk8eyBmaWxlOiBzdHJpbmc7IHJlcGxhY2VtZW50czogbnVtYmVyIH0+OyB0aW1lc3RhbXA6IHN0cmluZyB9PiB7XG4gIGNvbnN0IGZpbGVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIGF3YWl0IHdhbGsodGFyZ2V0LCBmaWxlcyk7XG4gIC8vIHRyeSB0byByZWFkIGNvbnN0aXR1dGlvbiBmcm9tIHRhcmdldFxuICBsZXQgYWNyb255bXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcbiAgdHJ5IHtcbiAgICBjb25zdCBjb25zUGF0aCA9IHBhdGguam9pbih0YXJnZXQsICcuc3BlY2lmeScsICdtZW1vcnknLCAnY29uc3RpdHV0aW9uLm1kJyk7XG4gICAgaWYgKGZzU3luYy5leGlzdHNTeW5jKGNvbnNQYXRoKSkge1xuICAgICAgY29uc3QgcmF3ID0gYXdhaXQgZnMucmVhZEZpbGUoY29uc1BhdGgsICd1dGY4Jyk7XG4gICAgICBjb25zdCBtID0gcmF3Lm1hdGNoKC9gYGAoPzp5YW1sfHltbClcXHMqXFxuKFtcXHNcXFNdKj8pXFxuYGBgL2kpO1xuICAgICAgY29uc3QgaW5uZXIgPSBtID8gbVsxXS50cmltKCkgOiByYXcudHJpbSgpO1xuICAgICAgdHJ5IHsgYWNyb255bXMgPSBKU09OLnBhcnNlKGlubmVyKS5BY3JvbnltcyB8fCB7fTsgfSBjYXRjaCAoZSkge1xuICAgICAgICB2b2lkIGU7IC8vIFNpbGVuY2UgdW51c2VkIGNhdGNoIHBhcmFtZXRlclxuICAgICAgICAvLyBuYWl2ZSBwYXJzZTogbG9vayBmb3IgbGluZXMgJyAgS2V5OiBWQUwnXG4gICAgICAgIGNvbnN0IGxpbmVzID0gaW5uZXIuc3BsaXQoL1xccj9cXG4vKTtcbiAgICAgICAgZm9yIChjb25zdCBsIG9mIGxpbmVzKSB7XG4gICAgICAgICAgY29uc3Qga3YgPSBsLm1hdGNoKC9eXFxzKihbXjpdKyk6XFxzKihcXFMrKVxccyokLyk7XG4gICAgICAgICAgaWYgKGt2KSBhY3Jvbnltc1trdlsxXS50cmltKCldID0ga3ZbMl0udHJpbSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgdm9pZCBlOyAvLyBTaWxlbmNlIHVudXNlZCBjYXRjaCBwYXJhbWV0ZXJcbiAgICBhY3JvbnltcyA9IHt9O1xuICB9XG5cbiAgY29uc3QgdG9rZW5SZSA9IC9cXHtcXHtcXHMqQUNST05ZTVxccyo6XFxzKihbXn1dKz8pXFxzKlxcfVxcfS9nO1xuICBjb25zdCBzdW1tYXJ5ID0gW107XG4gIGNvbnN0IGNoYW5nZWRGaWxlcyA9IFtdO1xuXG4gIGZvciAoY29uc3QgZiBvZiBmaWxlcykge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB0eHQgPSBhd2FpdCBmcy5yZWFkRmlsZShmLCAndXRmOCcpO1xuICAgICAgbGV0IG07IGxldCBjb3VudCA9IDA7IHRva2VuUmUubGFzdEluZGV4ID0gMDtcbiAgICAgIHdoaWxlICgobSA9IHRva2VuUmUuZXhlYyh0eHQpKSAhPT0gbnVsbCkge1xuICAgICAgICBjb25zdCBrZXkgPSBtWzFdLnRyaW0oKTtcbiAgICAgICAgaWYgKGFjcm9ueW1zICYmIChhY3Jvbnltc1trZXldIHx8IE9iamVjdC5rZXlzKGFjcm9ueW1zKS5maW5kKGsgPT4gay50b0xvd2VyQ2FzZSgpID09PSBrZXkudG9Mb3dlckNhc2UoKSkpKSBjb3VudCsrO1xuICAgICAgfVxuICAgICAgaWYgKGNvdW50ID4gMCkge1xuICAgICAgICBzdW1tYXJ5LnB1c2goeyBmaWxlOiBwYXRoLnJlc29sdmUoZiksIHJlcGxhY2VtZW50czogY291bnQgfSk7XG4gICAgICAgIGNoYW5nZWRGaWxlcy5wdXNoKHBhdGgucmVzb2x2ZShmKSk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdm9pZCBlO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHJlc3VsdCA9IHsgY2hhbmdlZEZpbGVzLCBzdW1tYXJ5LCB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSB9O1xuICBhd2FpdCBmcy5ta2RpcihwYXRoLmRpcm5hbWUob3V0UGF0aCksIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICBhd2FpdCBmcy53cml0ZUZpbGUob3V0UGF0aCwgSlNPTi5zdHJpbmdpZnkocmVzdWx0LCBudWxsLCAyKSwgJ3V0ZjgnKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1blVwZGF0ZUFjcm9ueW1zQ0xJKGFyZ3Y6IHN0cmluZ1tdID0gcHJvY2Vzcy5hcmd2LnNsaWNlKDIpKSB7XG4gIGNvbnN0IHRhcmdldEFyZyA9IGFyZ3YuZmluZChhID0+IGEuc3RhcnRzV2l0aCgnLS10YXJnZXQ9JykpO1xuICBjb25zdCB0YXJnZXQgPSAodGFyZ2V0QXJnID8gdGFyZ2V0QXJnLnNwbGl0KCc9JylbMV0gOiBwcm9jZXNzLmN3ZCgpKSBhcyBzdHJpbmc7XG4gIGNvbnN0IG91dCA9IHBhdGgucmVzb2x2ZSgnc3BlY3MvMDAxLWNvbmZpZ3VyYWJsZS1hY3Jvbnltcy1qaXJhLWludGVncmF0aW9uJyk7XG4gIGNvbnN0IG91dFBhdGggPSBwYXRoLmpvaW4ob3V0LCAndXBkYXRlLWFjcm9ueW1zLWRyeXJ1bi5qc29uJyk7XG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHNjYW5BbmRXcml0ZSh0YXJnZXQsIG91dFBhdGgpO1xuXG4gIC8vIElmIGFwcGx5IGZsYWcgcHJlc2VudCwgcGVyZm9ybSByZXBsYWNlbWVudHMgaW4gdGhlIHRhcmdldCByZXBvLCBjcmVhdGUgYnJhbmNoIGFuZCBjb21taXRcbiAgaWYgKGFyZ3YuaW5jbHVkZXMoJy0tYXBwbHknKSkge1xuICAgIGNvbnN0IGJyYW5jaEFyZyA9IGFyZ3YuZmluZChhID0+IGEuc3RhcnRzV2l0aCgnLS1icmFuY2g9JykpO1xuICAgIGNvbnN0IGJyYW5jaCA9IGJyYW5jaEFyZyA/IGJyYW5jaEFyZy5zcGxpdCgnPScpWzFdIDogYGNob3JlL3VwZGF0ZS1hY3Jvbnltcy0ke0RhdGUubm93KCl9YDtcbiAgICAvLyByZWFkIGNvbnN0aXR1dGlvbiBtYXBwaW5nIGFnYWluXG4gICAgY29uc3QgY29uc1BhdGggPSBwYXRoLmpvaW4odGFyZ2V0LCAnLnNwZWNpZnknLCAnbWVtb3J5JywgJ2NvbnN0aXR1dGlvbi5tZCcpO1xuICAgIGxldCBhY3JvbnltczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByYXcgPSBhd2FpdCBmcy5yZWFkRmlsZShjb25zUGF0aCwgJ3V0ZjgnKTtcbiAgICAgIGNvbnN0IG0gPSByYXcubWF0Y2goL2BgYCg/OnlhbWx8eW1sKVxccypcXG4oW1xcc1xcU10qPylcXG5gYGAvaSk7XG4gICAgICBjb25zdCBpbm5lciA9IG0gPyBtWzFdLnRyaW0oKSA6IHJhdy50cmltKCk7XG4gICAgICB0cnkgeyBhY3JvbnltcyA9IChKU09OLnBhcnNlKGlubmVyKSBhcyBhbnkpLkFjcm9ueW1zIHx8IHt9OyB9IGNhdGNoIChlKSB7IHZvaWQgZTtcbiAgICAgICAgICBjb25zdCBsaW5lcyA9IGlubmVyLnNwbGl0KC9cXHI/XFxuLyk7XG4gICAgICAgIGZvciAoY29uc3QgbCBvZiBsaW5lcykge1xuICAgICAgICAgIGNvbnN0IGt2ID0gbC5tYXRjaCgvXlxccyooW146XSspOlxccyooXFxTKylcXHMqJC8pO1xuICAgICAgICAgIGlmIChrdikgKGFjcm9ueW1zIGFzIGFueSlba3ZbMV0udHJpbSgpXSA9IGt2WzJdLnRyaW0oKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHZvaWQgZTtcbiAgICAgIGFjcm9ueW1zID0ge307XG4gICAgfVxuXG4gICAgLy8gcGVyZm9ybSByZXBsYWNlbWVudHNcbiAgICBjb25zdCB0b2tlblJlID0gL1xce1xce1xccypBQ1JPTllNXFxzKjpcXHMqKFtefV0rPylcXHMqXFx9XFx9L2c7XG4gICAgZm9yIChjb25zdCBpdGVtIG9mIHJlc3VsdC5zdW1tYXJ5IGFzIEFycmF5PHsgZmlsZTogc3RyaW5nOyByZXBsYWNlbWVudHM6IG51bWJlciB9Pikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSBpdGVtLmZpbGU7XG4gICAgICAgIGxldCB0eHQgPSBhd2FpdCBmcy5yZWFkRmlsZShmaWxlUGF0aCwgJ3V0ZjgnKTtcbiAgICAgICAgdHh0ID0gdHh0LnJlcGxhY2UodG9rZW5SZSwgKF9tLCBwMSkgPT4ge1xuICAgICAgICAgIGNvbnN0IGtleSA9IHAxLnRyaW0oKTtcbiAgICAgICAgICBjb25zdCBmb3VuZCA9IE9iamVjdC5rZXlzKGFjcm9ueW1zKS5maW5kKGsgPT4gay50b0xvd2VyQ2FzZSgpID09PSBrZXkudG9Mb3dlckNhc2UoKSk7XG4gICAgICAgICAgaWYgKGZvdW5kKSByZXR1cm4gYWNyb255bXNbZm91bmRdO1xuICAgICAgICAgIGlmIChhY3Jvbnltc1trZXldKSByZXR1cm4gYWNyb255bXNba2V5XTtcbiAgICAgICAgICAvLyBmYWxsYmFjayB0byBpbml0aWFsc1xuICAgICAgICAgIGNvbnN0IGluaXRpYWxzID0ga2V5LnNwbGl0KC9cXHMrLykubWFwKCh3OiBzdHJpbmcpID0+ICh3LnJlcGxhY2UoL1teQS1aYS16MC05XS9nLCcnKVswXXx8JycpLnRvVXBwZXJDYXNlKCkpLmpvaW4oJycpLnNsaWNlKDAsMyk7XG4gICAgICAgICAgcmV0dXJuIGluaXRpYWxzIHx8IGtleTtcbiAgICAgICAgfSk7XG4gICAgICAgIGF3YWl0IGZzLndyaXRlRmlsZShmaWxlUGF0aCwgdHh0LCAndXRmOCcpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIHZvaWQgZTsgLy8gU2lsZW5jZSB1bnVzZWQgY2F0Y2ggcGFyYW1ldGVyXG4gICAgICAgICAgLy8gaWdub3JlIHBlci1maWxlIGZhaWx1cmVzXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gY3JlYXRlIGJyYW5jaCBhbmQgY29tbWl0IGluc2lkZSB0YXJnZXQgcmVwbyB1c2luZyBnaXQgQ0xJXG4gICAgbGV0IGNvbW1pdEhhc2ggPSAnJztcbiAgICB0cnkge1xuICBjb25zdCB7IGV4ZWNTeW5jIH0gPSBhd2FpdCBpbXBvcnQoJ2NoaWxkX3Byb2Nlc3MnKTtcbiAgICAgIGV4ZWNTeW5jKGBnaXQgY2hlY2tvdXQgLWIgJHticmFuY2h9YCwgeyBjd2Q6IHRhcmdldCwgc3RkaW86ICdpZ25vcmUnIH0pO1xuICAgICAgZXhlY1N5bmMoJ2dpdCBhZGQgLUEnLCB7IGN3ZDogdGFyZ2V0LCBzdGRpbzogJ2lnbm9yZScgfSk7XG4gICAgICBleGVjU3luYyhgZ2l0IGNvbW1pdCAtbSBcImNob3JlOiBhcHBseSBhY3JvbnltIHJlcGxhY2VtZW50c1wiYCwgeyBjd2Q6IHRhcmdldCwgc3RkaW86ICdpZ25vcmUnIH0pO1xuICAgICAgY29tbWl0SGFzaCA9IGV4ZWNTeW5jKCdnaXQgcmV2LXBhcnNlIC0tc2hvcnQgSEVBRCcsIHsgZW5jb2Rpbmc6ICd1dGY4JywgY3dkOiB0YXJnZXQgfSkudHJpbSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHZvaWQgZTsgLy8gU2lsZW5jZSB1bnVzZWQgY2F0Y2ggcGFyYW1ldGVyXG4gICAgICAvLyBnaXQgbWF5IGZhaWwgKG5vIGdpdCBhdmFpbGFibGUgZXRjLikg4oCUIGNvbnRpbnVlIGFuZCB3cml0ZSBwYXJ0aWFsIHJlc3VsdFxuICAgICAgY29tbWl0SGFzaCA9ICcnO1xuICAgIH1cblxuICAgIGNvbnN0IG91dEFwcGx5ID0gcGF0aC5qb2luKG91dCwgJ3VwZGF0ZS1hY3Jvbnltcy1yZXN1bHQuanNvbicpO1xuICAgIGF3YWl0IGZzLndyaXRlRmlsZShvdXRBcHBseSwgSlNPTi5zdHJpbmdpZnkoeyAuLi5yZXN1bHQsIGJyYW5jaCwgY29tbWl0SGFzaCB9LCBudWxsLCAyKSwgJ3V0ZjgnKTtcbiAgfVxuXG4gIHJldHVybiBvdXRQYXRoO1xufVxuXG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAndXJsJztcbmNvbnN0IF9fZmlsZW5hbWUgPSAoKCkgPT4ge1xuICB0cnkge1xuICAvLyBBY2Nlc3MgaW1wb3J0Lm1ldGEudXJsIGR5bmFtaWNhbGx5IHRvIGF2b2lkIFR5cGVTY3JpcHQgZXJyb3JzIHdoZW4gY29tcGlsaW5nIHRvIENvbW1vbkpTXG4gIGNvbnN0IHVybCA9IEZ1bmN0aW9uKCdyZXR1cm4gaW1wb3J0Lm1ldGEudXJsJykoKTtcbiAgICByZXR1cm4gZmlsZVVSTFRvUGF0aCh1cmwgYXMgc3RyaW5nKTtcbiAgfSBjYXRjaCB7XG4gICAgLy8gQ29tbW9uSlMgZmFsbGJhY2tcbiAgICByZXR1cm4gcHJvY2Vzcy5hcmd2WzFdO1xuICB9XG59KSgpO1xuXG5pZiAocHJvY2Vzcy5hcmd2WzFdID09PSBfX2ZpbGVuYW1lKSB7XG4gIHJ1blVwZGF0ZUFjcm9ueW1zQ0xJKHByb2Nlc3MuYXJndi5zbGljZSgyKSkudGhlbihwID0+IGNvbnNvbGUubG9nKCdXcm90ZScsIHApKS5jYXRjaChlcnIgPT4geyBjb25zb2xlLmVycm9yKGVycik7IHByb2Nlc3MuZXhpdCgxKTsgfSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHJ1blVwZGF0ZUFjcm9ueW1zQ0xJO1xuIl19