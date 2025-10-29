// Package entry point - re-export CLI utilities and core helpers
export { createIssue } from './lib/jira';

// Keep exports minimal to avoid pulling CLI bin scripts (shebangs) into the library bundle
export default {};
