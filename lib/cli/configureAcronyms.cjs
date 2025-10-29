"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runConfigureAcronyms = runConfigureAcronyms;
const promises_1 = __importDefault(require("readline/promises"));
const node_process_1 = require("node:process");
const constitution_1 = require("./../lib/constitution.cjs");
async function runConfigureAcronyms(opts = {}) {
    await (0, constitution_1.ensureAcronymsBlock)();
    // Parse any acronyms from the raw file first (covers simple test fixtures),
    // then read the canonical constitution store and merge (store values
    // take precedence unless opts.mapping is provided).
    const fileParsed = await (0, constitution_1.parseAcronymsFromFile)();
    const existing = await (0, constitution_1.readConstitution)();
    const mapping = { ...fileParsed, ...(existing.Acronyms || {}), ...(opts.mapping || {}) };
    if (opts.dryRun) {
        // return plan without writing
        return { applied: false, mapping };
    }
    if (opts.apply) {
        existing.Acronyms = mapping;
        await (0, constitution_1.writeConstitution)(existing);
        return { applied: true, mapping };
    }
    // Interactive mode
    const rl = promises_1.default.createInterface({ input: node_process_1.stdin, output: node_process_1.stdout });
    try {
        console.log('Configure Acronyms - interactive mode');
        console.log('Press enter to accept existing value in brackets.');
        for (const key of ['Requirement', 'User Story', 'Feature', 'Scoring']) {
            const current = mapping[key] || '';
            const answer = await rl.question(`${key} acronym [${current}]: `);
            if (answer && answer.trim())
                mapping[key] = answer.trim();
        }
        const confirm = await rl.question('Apply changes? (yes/no): ');
        if (/^y/i.test(confirm)) {
            existing.Acronyms = mapping;
            await (0, constitution_1.writeConstitution)(existing);
            console.log('Acronyms saved to constitution.');
            return { applied: true, mapping };
        }
        console.log('No changes applied.');
        return { applied: false, mapping };
    }
    finally {
        rl.close();
    }
}
exports.default = runConfigureAcronyms;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJlQWNyb255bXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY2xpL2NvbmZpZ3VyZUFjcm9ueW1zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBVUEsb0RBNkNDO0FBdkRELGlFQUF5QztBQUN6QywrQ0FBZ0U7QUFDaEUsNERBQXNIO0FBUS9HLEtBQUssVUFBVSxvQkFBb0IsQ0FBQyxPQUF5QixFQUFFO0lBQ3BFLE1BQU0sSUFBQSxrQ0FBbUIsR0FBRSxDQUFDO0lBQzVCLDRFQUE0RTtJQUM1RSxxRUFBcUU7SUFDckUsb0RBQW9EO0lBQ3BELE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBQSxvQ0FBcUIsR0FBRSxDQUFDO0lBQ2pELE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBQSwrQkFBZ0IsR0FBRSxDQUFDO0lBQzFDLE1BQU0sT0FBTyxHQUFHLEVBQUUsR0FBRyxVQUFVLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDLEVBQTJCLENBQUM7SUFFbEgsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDaEIsOEJBQThCO1FBQzlCLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDO0lBQ3JDLENBQUM7SUFFRCxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNmLFFBQVEsQ0FBQyxRQUFRLEdBQUcsT0FBYyxDQUFDO1FBQ25DLE1BQU0sSUFBQSxnQ0FBaUIsRUFBQyxRQUFRLENBQUMsQ0FBQztRQUNsQyxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQztJQUNwQyxDQUFDO0lBRUQsbUJBQW1CO0lBQ25CLE1BQU0sRUFBRSxHQUFHLGtCQUFRLENBQUMsZUFBZSxDQUFDLEVBQUUsS0FBSyxFQUFMLG9CQUFLLEVBQUUsTUFBTSxFQUFOLHFCQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZELElBQUksQ0FBQztRQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsdUNBQXVDLENBQUMsQ0FBQztRQUNyRCxPQUFPLENBQUMsR0FBRyxDQUFDLG1EQUFtRCxDQUFDLENBQUM7UUFFakUsS0FBSyxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBQyxZQUFZLEVBQUMsU0FBUyxFQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7WUFDbkUsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNuQyxNQUFNLE1BQU0sR0FBRyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxHQUFHLGFBQWEsT0FBTyxLQUFLLENBQUMsQ0FBQztZQUNsRSxJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFO2dCQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDNUQsQ0FBQztRQUVELE1BQU0sT0FBTyxHQUFHLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1FBQy9ELElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ3hCLFFBQVEsQ0FBQyxRQUFRLEdBQUcsT0FBYyxDQUFDO1lBQ25DLE1BQU0sSUFBQSxnQ0FBaUIsRUFBQyxRQUFRLENBQUMsQ0FBQztZQUNsQyxPQUFPLENBQUMsR0FBRyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7WUFDL0MsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUM7UUFDcEMsQ0FBQztRQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUNuQyxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQztJQUNyQyxDQUFDO1lBQVMsQ0FBQztRQUNULEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNiLENBQUM7QUFDSCxDQUFDO0FBRUQsa0JBQWUsb0JBQW9CLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcmVhZGxpbmUgZnJvbSAncmVhZGxpbmUvcHJvbWlzZXMnO1xuaW1wb3J0IHsgc3RkaW4gYXMgaW5wdXQsIHN0ZG91dCBhcyBvdXRwdXQgfSBmcm9tICdub2RlOnByb2Nlc3MnO1xuaW1wb3J0IHsgZW5zdXJlQWNyb255bXNCbG9jaywgcmVhZENvbnN0aXR1dGlvbiwgd3JpdGVDb25zdGl0dXRpb24sIHBhcnNlQWNyb255bXNGcm9tRmlsZSB9IGZyb20gJy4uL2xpYi9jb25zdGl0dXRpb24nO1xuXG5leHBvcnQgaW50ZXJmYWNlIENvbmZpZ3VyZU9wdGlvbnMge1xuICBkcnlSdW4/OiBib29sZWFuO1xuICBhcHBseT86IGJvb2xlYW47XG4gIG1hcHBpbmc/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuQ29uZmlndXJlQWNyb255bXMob3B0czogQ29uZmlndXJlT3B0aW9ucyA9IHt9KTogUHJvbWlzZTx7IGFwcGxpZWQ6IGJvb2xlYW47IG1hcHBpbmc6IFJlY29yZDxzdHJpbmcsc3RyaW5nPiB9PntcbiAgYXdhaXQgZW5zdXJlQWNyb255bXNCbG9jaygpO1xuICAvLyBQYXJzZSBhbnkgYWNyb255bXMgZnJvbSB0aGUgcmF3IGZpbGUgZmlyc3QgKGNvdmVycyBzaW1wbGUgdGVzdCBmaXh0dXJlcyksXG4gIC8vIHRoZW4gcmVhZCB0aGUgY2Fub25pY2FsIGNvbnN0aXR1dGlvbiBzdG9yZSBhbmQgbWVyZ2UgKHN0b3JlIHZhbHVlc1xuICAvLyB0YWtlIHByZWNlZGVuY2UgdW5sZXNzIG9wdHMubWFwcGluZyBpcyBwcm92aWRlZCkuXG4gIGNvbnN0IGZpbGVQYXJzZWQgPSBhd2FpdCBwYXJzZUFjcm9ueW1zRnJvbUZpbGUoKTtcbiAgY29uc3QgZXhpc3RpbmcgPSBhd2FpdCByZWFkQ29uc3RpdHV0aW9uKCk7XG4gIGNvbnN0IG1hcHBpbmcgPSB7IC4uLmZpbGVQYXJzZWQsIC4uLihleGlzdGluZy5BY3JvbnltcyB8fCB7fSksIC4uLihvcHRzLm1hcHBpbmcgfHwge30pIH0gYXMgUmVjb3JkPHN0cmluZyxzdHJpbmc+O1xuXG4gIGlmIChvcHRzLmRyeVJ1bikge1xuICAgIC8vIHJldHVybiBwbGFuIHdpdGhvdXQgd3JpdGluZ1xuICAgIHJldHVybiB7IGFwcGxpZWQ6IGZhbHNlLCBtYXBwaW5nIH07XG4gIH1cblxuICBpZiAob3B0cy5hcHBseSkge1xuICAgIGV4aXN0aW5nLkFjcm9ueW1zID0gbWFwcGluZyBhcyBhbnk7XG4gICAgYXdhaXQgd3JpdGVDb25zdGl0dXRpb24oZXhpc3RpbmcpO1xuICAgIHJldHVybiB7IGFwcGxpZWQ6IHRydWUsIG1hcHBpbmcgfTtcbiAgfVxuXG4gIC8vIEludGVyYWN0aXZlIG1vZGVcbiAgY29uc3QgcmwgPSByZWFkbGluZS5jcmVhdGVJbnRlcmZhY2UoeyBpbnB1dCwgb3V0cHV0IH0pO1xuICB0cnkge1xuICAgIGNvbnNvbGUubG9nKCdDb25maWd1cmUgQWNyb255bXMgLSBpbnRlcmFjdGl2ZSBtb2RlJyk7XG4gICAgY29uc29sZS5sb2coJ1ByZXNzIGVudGVyIHRvIGFjY2VwdCBleGlzdGluZyB2YWx1ZSBpbiBicmFja2V0cy4nKTtcblxuICAgIGZvciAoY29uc3Qga2V5IG9mIFsnUmVxdWlyZW1lbnQnLCdVc2VyIFN0b3J5JywnRmVhdHVyZScsJ1Njb3JpbmcnXSkge1xuICAgICAgY29uc3QgY3VycmVudCA9IG1hcHBpbmdba2V5XSB8fCAnJztcbiAgICAgIGNvbnN0IGFuc3dlciA9IGF3YWl0IHJsLnF1ZXN0aW9uKGAke2tleX0gYWNyb255bSBbJHtjdXJyZW50fV06IGApO1xuICAgICAgaWYgKGFuc3dlciAmJiBhbnN3ZXIudHJpbSgpKSBtYXBwaW5nW2tleV0gPSBhbnN3ZXIudHJpbSgpO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbmZpcm0gPSBhd2FpdCBybC5xdWVzdGlvbignQXBwbHkgY2hhbmdlcz8gKHllcy9ubyk6ICcpO1xuICAgIGlmICgvXnkvaS50ZXN0KGNvbmZpcm0pKSB7XG4gICAgICBleGlzdGluZy5BY3JvbnltcyA9IG1hcHBpbmcgYXMgYW55O1xuICAgICAgYXdhaXQgd3JpdGVDb25zdGl0dXRpb24oZXhpc3RpbmcpO1xuICAgICAgY29uc29sZS5sb2coJ0Fjcm9ueW1zIHNhdmVkIHRvIGNvbnN0aXR1dGlvbi4nKTtcbiAgICAgIHJldHVybiB7IGFwcGxpZWQ6IHRydWUsIG1hcHBpbmcgfTtcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZygnTm8gY2hhbmdlcyBhcHBsaWVkLicpO1xuICAgIHJldHVybiB7IGFwcGxpZWQ6IGZhbHNlLCBtYXBwaW5nIH07XG4gIH0gZmluYWxseSB7XG4gICAgcmwuY2xvc2UoKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBydW5Db25maWd1cmVBY3JvbnltcztcbiJdfQ==