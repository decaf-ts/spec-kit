export function validateBranchName(branchName, config) {
    if (!branchName)
        return false;
    const name = branchName.trim();
    if (config && config.enforcePattern) {
        try {
            const re = new RegExp(config.enforcePattern);
            return re.test(name);
        }
        catch (e) {
            void e; // invalid pattern; fall back
        }
    }
    if (config && config.branchAcronym) {
        return name.startsWith(config.branchAcronym + '-') || name.includes(config.branchAcronym + '-');
    }
    // default pattern: contains a dash and an uppercase prefix like SPEC-123
    return /[A-Z]+-\d+/.test(name);
}
export default { validateBranchName };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJhbmNoVmFsaWRhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9icmFuY2hWYWxpZGF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsTUFBTSxVQUFVLGtCQUFrQixDQUFDLFVBQWtCLEVBQUUsTUFBcUI7SUFDMUUsSUFBSSxDQUFDLFVBQVU7UUFBRSxPQUFPLEtBQUssQ0FBQztJQUM5QixNQUFNLElBQUksR0FBRyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDL0IsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3BDLElBQUksQ0FBQztZQUNILE1BQU0sRUFBRSxHQUFHLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUM3QyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdkIsQ0FBQztRQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDVCxLQUFLLENBQUMsQ0FBQyxDQUFDLDZCQUE2QjtRQUN6QyxDQUFDO0lBQ0gsQ0FBQztJQUNELElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUNuQyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLGFBQWEsR0FBRyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEdBQUcsR0FBRyxDQUFDLENBQUM7SUFDbEcsQ0FBQztJQUNELHlFQUF5RTtJQUN6RSxPQUFPLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDakMsQ0FBQztBQUVELGVBQWUsRUFBRSxrQkFBa0IsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBCcmFuY2hDb25maWcgfSBmcm9tICcuLi90eXBlcy9hY3Jvbnltcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUJyYW5jaE5hbWUoYnJhbmNoTmFtZTogc3RyaW5nLCBjb25maWc/OiBCcmFuY2hDb25maWcpOiBib29sZWFuIHtcbiAgaWYgKCFicmFuY2hOYW1lKSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IG5hbWUgPSBicmFuY2hOYW1lLnRyaW0oKTtcbiAgaWYgKGNvbmZpZyAmJiBjb25maWcuZW5mb3JjZVBhdHRlcm4pIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmUgPSBuZXcgUmVnRXhwKGNvbmZpZy5lbmZvcmNlUGF0dGVybik7XG4gICAgICByZXR1cm4gcmUudGVzdChuYW1lKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHZvaWQgZTsgLy8gaW52YWxpZCBwYXR0ZXJuOyBmYWxsIGJhY2tcbiAgICB9XG4gIH1cbiAgaWYgKGNvbmZpZyAmJiBjb25maWcuYnJhbmNoQWNyb255bSkge1xuICAgIHJldHVybiBuYW1lLnN0YXJ0c1dpdGgoY29uZmlnLmJyYW5jaEFjcm9ueW0gKyAnLScpIHx8IG5hbWUuaW5jbHVkZXMoY29uZmlnLmJyYW5jaEFjcm9ueW0gKyAnLScpO1xuICB9XG4gIC8vIGRlZmF1bHQgcGF0dGVybjogY29udGFpbnMgYSBkYXNoIGFuZCBhbiB1cHBlcmNhc2UgcHJlZml4IGxpa2UgU1BFQy0xMjNcbiAgcmV0dXJuIC9bQS1aXSstXFxkKy8udGVzdChuYW1lKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgeyB2YWxpZGF0ZUJyYW5jaE5hbWUgfTtcbiJdfQ==