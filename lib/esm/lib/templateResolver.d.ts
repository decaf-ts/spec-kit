import type { ConstitutionData } from '../types/acronyms';
/**
 * Resolve a single ACRONYM token using the constitution data.
 * token example: 'User Story' (the part after ACRONYM:)
 */
export declare function resolveAcronymToken(name: string, constData?: ConstitutionData): string;
/** Replace tokens like {{ACRONYM:User Story}} in a template string. */
export declare function resolveTemplate(template: string, constData?: ConstitutionData): string;
/**
 * Replace tokens using a ConstitutionStore instance. This function will
 * consult the store for acronyms and fallback to initials when missing.
 */
export declare function resolveAcronymsInText(text: string, store: any): Promise<string>;
export declare function resolveTemplateFromFile(filePath: string, constData?: ConstitutionData): Promise<string>;
declare const _default: {
    resolveTemplate: typeof resolveTemplate;
    resolveTemplateFromFile: typeof resolveTemplateFromFile;
    resolveAcronymToken: typeof resolveAcronymToken;
};
export default _default;
