export interface ConfigureOptions {
    dryRun?: boolean;
    apply?: boolean;
    mapping?: Record<string, string>;
}
export declare function runConfigureAcronyms(opts?: ConfigureOptions): Promise<{
    applied: boolean;
    mapping: Record<string, string>;
}>;
export default runConfigureAcronyms;
