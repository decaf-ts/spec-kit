export declare function runGit(cmd: string, cwd?: string): string;
export declare function currentBranch(cwd?: string): string;
export declare function createBranch(name: string, cwd?: string, from?: string): string;
export declare function commitAll(message?: string, cwd?: string): string;
declare const _default: {
    runGit: typeof runGit;
    currentBranch: typeof currentBranch;
    createBranch: typeof createBranch;
    commitAll: typeof commitAll;
};
export default _default;
