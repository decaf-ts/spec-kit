import { UpdateAcronymsResult } from '../types/acronyms';
export declare function listFiles(root: string): Promise<string[]>;
export declare function scanForAcronymTokens(targetDir?: string): Promise<Array<{
    file: string;
    replacements: number;
}>>;
export declare function generateDryRunJson(targetDir?: string, outPath?: string): Promise<UpdateAcronymsResult>;
export declare function applyReplacements(targetDir?: string): Promise<UpdateAcronymsResult>;
declare const _default: {
    listFiles: typeof listFiles;
    scanForAcronymTokens: typeof scanForAcronymTokens;
    generateDryRunJson: typeof generateDryRunJson;
    applyReplacements: typeof applyReplacements;
};
export default _default;
