export type AcronymConfig = {
    id: string;
    artifactType: string;
    acronym: string;
    createdBy?: string;
    createdAt?: string;
    version?: string;
    metadata?: Record<string, any>;
};
export type BranchConfig = {
    id?: string;
    branchAcronym?: string;
    enforcePattern?: string;
    allowAliasMapping?: boolean;
};
export type JiraMapping = {
    id?: string;
    acronym: string;
    jiraIssueType: string;
    jiraProjectKey?: string;
};
export type UpdateAcronymsRequest = {
    dryRun?: boolean;
    targetPaths?: string[];
    replacements?: Array<{
        from: string;
        to: string;
    }>;
    createBranch?: boolean;
};
export type UpdateAcronymsResult = {
    changedFiles: string[];
    summary: Array<{
        file: string;
        replacements: number;
    }>;
    branch?: string;
    commitHash?: string;
};
export type AcronymMap = Record<string, string>;
export interface ConstitutionData {
    decafMcpEnabled?: boolean;
    Acronyms?: AcronymMap;
    BranchConfig?: BranchConfig;
    [k: string]: any;
}
