import type { AcronymMap, ConstitutionData } from '../types/acronyms';
export declare function readConstitutionFile(filePath?: string): Promise<string>;
export declare function extractAcronymsBlock(content: string): {
    block: string | null;
    before: string;
    after: string;
};
export declare function buildAcronymsBlock(obj: ConstitutionData): string;
export declare function ensureAcronymsBlock(defaults?: ConstitutionData, filePath?: string): Promise<void>;
export declare function readAcronyms(filePath?: string): Promise<AcronymMap>;
export declare function updateAcronyms(newMap: AcronymMap, filePath?: string): Promise<void>;
export declare class ConstitutionStore {
    filePath: string;
    constructor(filePath?: string);
    readRaw(): Promise<string>;
    private extractYamlBlock;
    read(): Promise<ConstitutionData>;
    write(data: ConstitutionData): Promise<void>;
    getAcronyms(): Promise<Record<string, string>>;
    setAcronyms(map: Record<string, string>): Promise<void>;
    getMcpEnabled(): Promise<boolean>;
    setMcpEnabled(value: boolean): Promise<void>;
}
export declare function readConstitution(): Promise<ConstitutionData>;
export declare function writeConstitution(data: ConstitutionData): Promise<void>;
export declare function getAcronyms(): Promise<Record<string, string>>;
export declare function parseAcronymsFromFile(filePath?: string): Promise<Record<string, string>>;
export default ConstitutionStore;
