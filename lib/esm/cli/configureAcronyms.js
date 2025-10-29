import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { ensureAcronymsBlock, readConstitution, writeConstitution, parseAcronymsFromFile } from "./../lib/constitution.js";
export async function runConfigureAcronyms(opts = {}) {
    await ensureAcronymsBlock();
    // Parse any acronyms from the raw file first (covers simple test fixtures),
    // then read the canonical constitution store and merge (store values
    // take precedence unless opts.mapping is provided).
    const fileParsed = await parseAcronymsFromFile();
    const existing = await readConstitution();
    const mapping = { ...fileParsed, ...(existing.Acronyms || {}), ...(opts.mapping || {}) };
    if (opts.dryRun) {
        // return plan without writing
        return { applied: false, mapping };
    }
    if (opts.apply) {
        existing.Acronyms = mapping;
        await writeConstitution(existing);
        return { applied: true, mapping };
    }
    // Interactive mode
    const rl = readline.createInterface({ input, output });
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
            await writeConstitution(existing);
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
export default runConfigureAcronyms;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJlQWNyb255bXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY2xpL2NvbmZpZ3VyZUFjcm9ueW1zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sUUFBUSxNQUFNLG1CQUFtQixDQUFDO0FBQ3pDLE9BQU8sRUFBRSxLQUFLLElBQUksS0FBSyxFQUFFLE1BQU0sSUFBSSxNQUFNLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDaEUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLGdCQUFnQixFQUFFLGlCQUFpQixFQUFFLHFCQUFxQixFQUFFLGlDQUE0QjtBQVF0SCxNQUFNLENBQUMsS0FBSyxVQUFVLG9CQUFvQixDQUFDLE9BQXlCLEVBQUU7SUFDcEUsTUFBTSxtQkFBbUIsRUFBRSxDQUFDO0lBQzVCLDRFQUE0RTtJQUM1RSxxRUFBcUU7SUFDckUsb0RBQW9EO0lBQ3BELE1BQU0sVUFBVSxHQUFHLE1BQU0scUJBQXFCLEVBQUUsQ0FBQztJQUNqRCxNQUFNLFFBQVEsR0FBRyxNQUFNLGdCQUFnQixFQUFFLENBQUM7SUFDMUMsTUFBTSxPQUFPLEdBQUcsRUFBRSxHQUFHLFVBQVUsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUMsRUFBMkIsQ0FBQztJQUVsSCxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNoQiw4QkFBOEI7UUFDOUIsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUM7SUFDckMsQ0FBQztJQUVELElBQUksSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2YsUUFBUSxDQUFDLFFBQVEsR0FBRyxPQUFjLENBQUM7UUFDbkMsTUFBTSxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNsQyxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQztJQUNwQyxDQUFDO0lBRUQsbUJBQW1CO0lBQ25CLE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUN2RCxJQUFJLENBQUM7UUFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7UUFDckQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtREFBbUQsQ0FBQyxDQUFDO1FBRWpFLEtBQUssTUFBTSxHQUFHLElBQUksQ0FBQyxhQUFhLEVBQUMsWUFBWSxFQUFDLFNBQVMsRUFBQyxTQUFTLENBQUMsRUFBRSxDQUFDO1lBQ25FLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDbkMsTUFBTSxNQUFNLEdBQUcsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLEdBQUcsR0FBRyxhQUFhLE9BQU8sS0FBSyxDQUFDLENBQUM7WUFDbEUsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLElBQUksRUFBRTtnQkFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzVELENBQUM7UUFFRCxNQUFNLE9BQU8sR0FBRyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsMkJBQTJCLENBQUMsQ0FBQztRQUMvRCxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUN4QixRQUFRLENBQUMsUUFBUSxHQUFHLE9BQWMsQ0FBQztZQUNuQyxNQUFNLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2xDLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUNBQWlDLENBQUMsQ0FBQztZQUMvQyxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQztRQUNwQyxDQUFDO1FBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQ25DLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDO0lBQ3JDLENBQUM7WUFBUyxDQUFDO1FBQ1QsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ2IsQ0FBQztBQUNILENBQUM7QUFFRCxlQUFlLG9CQUFvQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHJlYWRsaW5lIGZyb20gJ3JlYWRsaW5lL3Byb21pc2VzJztcbmltcG9ydCB7IHN0ZGluIGFzIGlucHV0LCBzdGRvdXQgYXMgb3V0cHV0IH0gZnJvbSAnbm9kZTpwcm9jZXNzJztcbmltcG9ydCB7IGVuc3VyZUFjcm9ueW1zQmxvY2ssIHJlYWRDb25zdGl0dXRpb24sIHdyaXRlQ29uc3RpdHV0aW9uLCBwYXJzZUFjcm9ueW1zRnJvbUZpbGUgfSBmcm9tICcuLi9saWIvY29uc3RpdHV0aW9uJztcblxuZXhwb3J0IGludGVyZmFjZSBDb25maWd1cmVPcHRpb25zIHtcbiAgZHJ5UnVuPzogYm9vbGVhbjtcbiAgYXBwbHk/OiBib29sZWFuO1xuICBtYXBwaW5nPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1bkNvbmZpZ3VyZUFjcm9ueW1zKG9wdHM6IENvbmZpZ3VyZU9wdGlvbnMgPSB7fSk6IFByb21pc2U8eyBhcHBsaWVkOiBib29sZWFuOyBtYXBwaW5nOiBSZWNvcmQ8c3RyaW5nLHN0cmluZz4gfT57XG4gIGF3YWl0IGVuc3VyZUFjcm9ueW1zQmxvY2soKTtcbiAgLy8gUGFyc2UgYW55IGFjcm9ueW1zIGZyb20gdGhlIHJhdyBmaWxlIGZpcnN0IChjb3ZlcnMgc2ltcGxlIHRlc3QgZml4dHVyZXMpLFxuICAvLyB0aGVuIHJlYWQgdGhlIGNhbm9uaWNhbCBjb25zdGl0dXRpb24gc3RvcmUgYW5kIG1lcmdlIChzdG9yZSB2YWx1ZXNcbiAgLy8gdGFrZSBwcmVjZWRlbmNlIHVubGVzcyBvcHRzLm1hcHBpbmcgaXMgcHJvdmlkZWQpLlxuICBjb25zdCBmaWxlUGFyc2VkID0gYXdhaXQgcGFyc2VBY3Jvbnltc0Zyb21GaWxlKCk7XG4gIGNvbnN0IGV4aXN0aW5nID0gYXdhaXQgcmVhZENvbnN0aXR1dGlvbigpO1xuICBjb25zdCBtYXBwaW5nID0geyAuLi5maWxlUGFyc2VkLCAuLi4oZXhpc3RpbmcuQWNyb255bXMgfHwge30pLCAuLi4ob3B0cy5tYXBwaW5nIHx8IHt9KSB9IGFzIFJlY29yZDxzdHJpbmcsc3RyaW5nPjtcblxuICBpZiAob3B0cy5kcnlSdW4pIHtcbiAgICAvLyByZXR1cm4gcGxhbiB3aXRob3V0IHdyaXRpbmdcbiAgICByZXR1cm4geyBhcHBsaWVkOiBmYWxzZSwgbWFwcGluZyB9O1xuICB9XG5cbiAgaWYgKG9wdHMuYXBwbHkpIHtcbiAgICBleGlzdGluZy5BY3JvbnltcyA9IG1hcHBpbmcgYXMgYW55O1xuICAgIGF3YWl0IHdyaXRlQ29uc3RpdHV0aW9uKGV4aXN0aW5nKTtcbiAgICByZXR1cm4geyBhcHBsaWVkOiB0cnVlLCBtYXBwaW5nIH07XG4gIH1cblxuICAvLyBJbnRlcmFjdGl2ZSBtb2RlXG4gIGNvbnN0IHJsID0gcmVhZGxpbmUuY3JlYXRlSW50ZXJmYWNlKHsgaW5wdXQsIG91dHB1dCB9KTtcbiAgdHJ5IHtcbiAgICBjb25zb2xlLmxvZygnQ29uZmlndXJlIEFjcm9ueW1zIC0gaW50ZXJhY3RpdmUgbW9kZScpO1xuICAgIGNvbnNvbGUubG9nKCdQcmVzcyBlbnRlciB0byBhY2NlcHQgZXhpc3RpbmcgdmFsdWUgaW4gYnJhY2tldHMuJyk7XG5cbiAgICBmb3IgKGNvbnN0IGtleSBvZiBbJ1JlcXVpcmVtZW50JywnVXNlciBTdG9yeScsJ0ZlYXR1cmUnLCdTY29yaW5nJ10pIHtcbiAgICAgIGNvbnN0IGN1cnJlbnQgPSBtYXBwaW5nW2tleV0gfHwgJyc7XG4gICAgICBjb25zdCBhbnN3ZXIgPSBhd2FpdCBybC5xdWVzdGlvbihgJHtrZXl9IGFjcm9ueW0gWyR7Y3VycmVudH1dOiBgKTtcbiAgICAgIGlmIChhbnN3ZXIgJiYgYW5zd2VyLnRyaW0oKSkgbWFwcGluZ1trZXldID0gYW5zd2VyLnRyaW0oKTtcbiAgICB9XG5cbiAgICBjb25zdCBjb25maXJtID0gYXdhaXQgcmwucXVlc3Rpb24oJ0FwcGx5IGNoYW5nZXM/ICh5ZXMvbm8pOiAnKTtcbiAgICBpZiAoL155L2kudGVzdChjb25maXJtKSkge1xuICAgICAgZXhpc3RpbmcuQWNyb255bXMgPSBtYXBwaW5nIGFzIGFueTtcbiAgICAgIGF3YWl0IHdyaXRlQ29uc3RpdHV0aW9uKGV4aXN0aW5nKTtcbiAgICAgIGNvbnNvbGUubG9nKCdBY3JvbnltcyBzYXZlZCB0byBjb25zdGl0dXRpb24uJyk7XG4gICAgICByZXR1cm4geyBhcHBsaWVkOiB0cnVlLCBtYXBwaW5nIH07XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coJ05vIGNoYW5nZXMgYXBwbGllZC4nKTtcbiAgICByZXR1cm4geyBhcHBsaWVkOiBmYWxzZSwgbWFwcGluZyB9O1xuICB9IGZpbmFsbHkge1xuICAgIHJsLmNsb3NlKCk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgcnVuQ29uZmlndXJlQWNyb255bXM7XG4iXX0=