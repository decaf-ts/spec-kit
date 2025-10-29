"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveAcronymToken = resolveAcronymToken;
exports.resolveTemplate = resolveTemplate;
exports.resolveAcronymsInText = resolveAcronymsInText;
exports.resolveTemplateFromFile = resolveTemplateFromFile;
const promises_1 = require("fs/promises");
const path_1 = __importDefault(require("path"));
/**
 * Resolve a single ACRONYM token using the constitution data.
 * token example: 'User Story' (the part after ACRONYM:)
 */
function resolveAcronymToken(name, constData) {
    const key = (name || '').trim();
    const acronyms = (constData && constData.Acronyms) || {};
    if (!key)
        return '';
    // Direct lookup (artifactType -> acronym)
    if (acronyms[key])
        return acronyms[key];
    // Case-insensitive match on artifact type
    const found = Object.keys(acronyms).find(k => k.toLowerCase() === key.toLowerCase());
    if (found)
        return acronyms[found];
    // If the key itself looks like a short token (e.g., 'USR'), return it upper-cased
    if (/^[A-Za-z0-9_-]{1,10}$/.test(key))
        return key.toUpperCase();
    // No acronym was found — caller can decide fallback strategy.
    return key;
}
/** Replace tokens like {{ACRONYM:User Story}} in a template string. */
function resolveTemplate(template, constData) {
    if (!template)
        return template;
    return template.replace(/\{\{\s*ACRONYM\s*:\s*([^}]+?)\s*\}\}/g, (_m, p1) => {
        const key = p1.trim();
        const acronyms = (constData && constData.Acronyms) || undefined;
        // If there is a mapping object with at least one entry, prefer acronym or
        // initials fallback. If mapping is absent or empty, return the token text.
        if (acronyms && Object.keys(acronyms).length > 0) {
            if (acronyms[key])
                return acronyms[key];
            const found = Object.keys(acronyms).find(k => k.toLowerCase() === key.toLowerCase());
            if (found)
                return acronyms[found];
            // build initials fallback
            const initials = key
                .split(/\s+/)
                .map((w) => (w.replace(/[^A-Za-z0-9]/g, '')[0] || '').toUpperCase())
                .join('')
                .slice(0, 3);
            return initials || key;
        }
        return key;
    });
}
/**
 * Replace tokens using a ConstitutionStore instance. This function will
 * consult the store for acronyms and fallback to initials when missing.
 */
async function resolveAcronymsInText(text, store) {
    let mapping = {};
    if (store && typeof store.getAcronyms === 'function') {
        try {
            mapping = await store.getAcronyms();
        }
        catch (e) {
            void e;
            mapping = {};
        }
    }
    const tokenRe = /\{\{\s*ACRONYM\s*:\s*([^}]+?)\s*\}\}/gi;
    return text.replace(tokenRe, (_m, name) => {
        const key = name.trim();
        if (mapping[key])
            return mapping[key];
        // build initials fallback (max 3 letters)
        const initials = key
            .split(/\s+/)
            .map((w) => (w.replace(/[^A-Za-z0-9]/g, '')[0] || '').toUpperCase())
            .join('')
            .slice(0, 3);
        return initials || key;
    });
}
async function resolveTemplateFromFile(filePath, constData) {
    const text = await (0, promises_1.readFile)(path_1.default.resolve(filePath), 'utf8');
    return resolveTemplate(text, constData);
}
exports.default = { resolveTemplate, resolveTemplateFromFile, resolveAcronymToken };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGVSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvdGVtcGxhdGVSZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQVFBLGtEQWlCQztBQUdELDBDQXFCQztBQU1ELHNEQXVCQztBQUVELDBEQUdDO0FBbEZELDBDQUF1QztBQUN2QyxnREFBd0I7QUFFeEI7OztHQUdHO0FBQ0gsU0FBZ0IsbUJBQW1CLENBQUMsSUFBWSxFQUFFLFNBQTRCO0lBQzVFLE1BQU0sR0FBRyxHQUFHLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2hDLE1BQU0sUUFBUSxHQUFHLENBQUMsU0FBUyxJQUFLLFNBQVMsQ0FBQyxRQUFtQyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3JGLElBQUksQ0FBQyxHQUFHO1FBQUUsT0FBTyxFQUFFLENBQUM7SUFFcEIsMENBQTBDO0lBQzFDLElBQUksUUFBUSxDQUFDLEdBQUcsQ0FBQztRQUFFLE9BQU8sUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRXhDLDBDQUEwQztJQUMxQyxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsS0FBSyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztJQUNyRixJQUFJLEtBQUs7UUFBRSxPQUFPLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUVsQyxrRkFBa0Y7SUFDbEYsSUFBSSx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO1FBQUUsT0FBTyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUM7SUFFaEUsOERBQThEO0lBQzlELE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQztBQUVELHVFQUF1RTtBQUN2RSxTQUFnQixlQUFlLENBQUMsUUFBZ0IsRUFB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QUFDLENBQUM7QUFDTCxDQUFDO0FBRU0sS0FBSyxVQUFVLHVCQUF1QixDQUFDLFFBQWdCLEVBQUUsU0FBNEI7SUFDMUYsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFBLG1CQUFRLEVBQUMsY0FBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUM1RCxPQUFPLGVBQWUsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDMUMsQ0FBQztBQUVELGtCQUFlLEVBQUUsZUFBZSxFQUFFLHVCQUF1QixFQUFFLG1CQUFtQixFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IENvbnN0aXR1dGlvbkRhdGEgfSBmcm9tICcuLi90eXBlcy9hY3Jvbnltcyc7XG5pbXBvcnQgeyByZWFkRmlsZSB9IGZyb20gJ2ZzL3Byb21pc2VzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG4vKipcbiAqIFJlc29sdmUgYSBzaW5nbGUgQUNST05ZTSB0b2tlbiB1c2luZyB0aGUgY29uc3RpdHV0aW9uIGRhdGEuXG4gKiB0b2tlbiBleGFtcGxlOiAnVXNlciBTdG9yeScgKHRoZSBwYXJ0IGFmdGVyIEFDUk9OWU06KVxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZUFjcm9ueW1Ub2tlbihuYW1lOiBzdHJpbmcsIGNvbnN0RGF0YT86IENvbnN0aXR1dGlvbkRhdGEpOiBzdHJpbmcge1xuICBjb25zdCBrZXkgPSAobmFtZSB8fCAnJykudHJpbSgpO1xuICBjb25zdCBhY3JvbnltcyA9IChjb25zdERhdGEgJiYgKGNvbnN0RGF0YS5BY3JvbnltcyBhcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KSkgfHwge307XG4gIGlmICgha2V5KSByZXR1cm4gJyc7XG5cbiAgLy8gRGlyZWN0IGxvb2t1cCAoYXJ0aWZhY3RUeXBlIC0+IGFjcm9ueW0pXG4gIGlmIChhY3Jvbnltc1trZXldKSByZXR1cm4gYWNyb255bXNba2V5XTtcblxuICAvLyBDYXNlLWluc2Vuc2l0aXZlIG1hdGNoIG9uIGFydGlmYWN0IHR5cGVcbiAgY29uc3QgZm91bmQgPSBPYmplY3Qua2V5cyhhY3JvbnltcykuZmluZChrID0+IGsudG9Mb3dlckNhc2UoKSA9PT0ga2V5LnRvTG93ZXJDYXNlKCkpO1xuICBpZiAoZm91bmQpIHJldHVybiBhY3Jvbnltc1tmb3VuZF07XG5cbiAgLy8gSWYgdGhlIGtleSBpdHNlbGYgbG9va3MgbGlrZSBhIHNob3J0IHRva2VuIChlLmcuLCAnVVNSJyksIHJldHVybiBpdCB1cHBlci1jYXNlZFxuICBpZiAoL15bQS1aYS16MC05Xy1dezEsMTB9JC8udGVzdChrZXkpKSByZXR1cm4ga2V5LnRvVXBwZXJDYXNlKCk7XG5cbiAgLy8gTm8gYWNyb255bSB3YXMgZm91bmQg4oCUIGNhbGxlciBjYW4gZGVjaWRlIGZhbGxiYWNrIHN0cmF0ZWd5LlxuICByZXR1cm4ga2V5O1xufVxuXG4vKiogUmVwbGFjZSB0b2tlbnMgbGlrZSB7e0FDUk9OWU06VXNlciBTdG9yeX19IGluIGEgdGVtcGxhdGUgc3RyaW5nLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVUZW1wbGF0ZSh0ZW1wbGF0ZTogc3RyaW5nLCBjb25zdERhdGE/OiBDb25zdGl0dXRpb25EYXRhKTogc3RyaW5nIHtcbiAgaWYgKCF0ZW1wbGF0ZSkgcmV0dXJuIHRlbXBsYXRlO1xuICByZXR1cm4gdGVtcGxhdGUucmVwbGFjZSgvXFx7XFx7XFxzKkFDUk9OWU1cXHMqOlxccyooW159XSs/KVxccypcXH1cXH0vZywgKF9tLCBwMSkgPT4ge1xuICAgIGNvbnN0IGtleSA9IHAxLnRyaW0oKTtcbiAgICBjb25zdCBhY3JvbnltcyA9IChjb25zdERhdGEgJiYgKGNvbnN0RGF0YS5BY3JvbnltcyBhcyBSZWNvcmQ8c3RyaW5nLHN0cmluZz4pKSB8fCB1bmRlZmluZWQ7XG4gICAgLy8gSWYgdGhlcmUgaXMgYSBtYXBwaW5nIG9iamVjdCB3aXRoIGF0IGxlYXN0IG9uZSBlbnRyeSwgcHJlZmVyIGFjcm9ueW0gb3JcbiAgICAvLyBpbml0aWFscyBmYWxsYmFjay4gSWYgbWFwcGluZyBpcyBhYnNlbnQgb3IgZW1wdHksIHJldHVybiB0aGUgdG9rZW4gdGV4dC5cbiAgICBpZiAoYWNyb255bXMgJiYgT2JqZWN0LmtleXMoYWNyb255bXMpLmxlbmd0aCA+IDApIHtcbiAgICAgIGlmIChhY3Jvbnltc1trZXldKSByZXR1cm4gYWNyb255bXNba2V5XTtcbiAgICAgIGNvbnN0IGZvdW5kID0gT2JqZWN0LmtleXMoYWNyb255bXMpLmZpbmQoayA9PiBrLnRvTG93ZXJDYXNlKCkgPT09IGtleS50b0xvd2VyQ2FzZSgpKTtcbiAgICAgIGlmIChmb3VuZCkgcmV0dXJuIGFjcm9ueW1zW2ZvdW5kXTtcbiAgICAgIC8vIGJ1aWxkIGluaXRpYWxzIGZhbGxiYWNrXG4gICAgICBjb25zdCBpbml0aWFscyA9IGtleVxuICAgICAgICAuc3BsaXQoL1xccysvKVxuICAgICAgICAubWFwKCh3OiBzdHJpbmcpID0+ICh3LnJlcGxhY2UoL1teQS1aYS16MC05XS9nLCAnJylbMF0gfHwgJycpLnRvVXBwZXJDYXNlKCkpXG4gICAgICAgIC5qb2luKCcnKVxuICAgICAgICAuc2xpY2UoMCwgMyk7XG4gICAgICByZXR1cm4gaW5pdGlhbHMgfHwga2V5O1xuICAgIH1cbiAgICByZXR1cm4ga2V5O1xuICB9KTtcbn1cblxuLyoqXG4gKiBSZXBsYWNlIHRva2VucyB1c2luZyBhIENvbnN0aXR1dGlvblN0b3JlIGluc3RhbmNlLiBUaGlzIGZ1bmN0aW9uIHdpbGxcbiAqIGNvbnN1bHQgdGhlIHN0b3JlIGZvciBhY3JvbnltcyBhbmQgZmFsbGJhY2sgdG8gaW5pdGlhbHMgd2hlbiBtaXNzaW5nLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVzb2x2ZUFjcm9ueW1zSW5UZXh0KHRleHQ6IHN0cmluZywgc3RvcmU6IGFueSk6IFByb21pc2U8c3RyaW5nPiB7XG4gIGxldCBtYXBwaW5nOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XG4gIGlmIChzdG9yZSAmJiB0eXBlb2Ygc3RvcmUuZ2V0QWNyb255bXMgPT09ICdmdW5jdGlvbicpIHtcbiAgICB0cnkge1xuICAgICAgbWFwcGluZyA9IGF3YWl0IHN0b3JlLmdldEFjcm9ueW1zKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdm9pZCBlO1xuICAgICAgbWFwcGluZyA9IHt9O1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHRva2VuUmUgPSAvXFx7XFx7XFxzKkFDUk9OWU1cXHMqOlxccyooW159XSs/KVxccypcXH1cXH0vZ2k7XG4gIHJldHVybiB0ZXh0LnJlcGxhY2UodG9rZW5SZSwgKF9tLCBuYW1lKSA9PiB7XG4gICAgY29uc3Qga2V5ID0gbmFtZS50cmltKCk7XG4gICAgaWYgKG1hcHBpbmdba2V5XSkgcmV0dXJuIG1hcHBpbmdba2V5XTtcbiAgICAvLyBidWlsZCBpbml0aWFscyBmYWxsYmFjayAobWF4IDMgbGV0dGVycylcbiAgICBjb25zdCBpbml0aWFscyA9IGtleVxuICAgICAgLnNwbGl0KC9cXHMrLylcbiAgICAgIC5tYXAoKHc6IHN0cmluZykgPT4gKHcucmVwbGFjZSgvW15BLVphLXowLTldL2csICcnKVswXSB8fCAnJykudG9VcHBlckNhc2UoKSlcbiAgICAgIC5qb2luKCcnKVxuICAgICAgLnNsaWNlKDAsIDMpO1xuICAgIHJldHVybiBpbml0aWFscyB8fCBrZXk7XG4gIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVzb2x2ZVRlbXBsYXRlRnJvbUZpbGUoZmlsZVBhdGg6IHN0cmluZywgY29uc3REYXRhPzogQ29uc3RpdHV0aW9uRGF0YSk6IFByb21pc2U8c3RyaW5nPiB7XG4gIGNvbnN0IHRleHQgPSBhd2FpdCByZWFkRmlsZShwYXRoLnJlc29sdmUoZmlsZVBhdGgpLCAndXRmOCcpO1xuICByZXR1cm4gcmVzb2x2ZVRlbXBsYXRlKHRleHQsIGNvbnN0RGF0YSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHsgcmVzb2x2ZVRlbXBsYXRlLCByZXNvbHZlVGVtcGxhdGVGcm9tRmlsZSwgcmVzb2x2ZUFjcm9ueW1Ub2tlbiB9O1xuIl19