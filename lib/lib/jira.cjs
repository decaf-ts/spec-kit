"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIssue = createIssue;
async function createIssue(summary, mapping) {
    try {
        // dynamic import to avoid a hard dependency
        const mcp = await Promise.resolve().then(() => __importStar(require('@decaf-ts/mcp-server')));
        if (mcp && typeof mcp.createIssue === 'function') {
            const res = await mcp.createIssue({ summary, mapping });
            return { issueKey: res?.key, status: 'created' };
        }
    }
    catch (_e) {
        void _e; // intentionally ignore import/remote errors
    }
    // local fallback when MCP/Jira isn't available
    return { status: 'pending' };
}
exports.default = { createIssue };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiamlyYS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvamlyYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQU1BLGtDQWtCQztBQWxCTSxLQUFLLFVBQVUsV0FBVyxDQUMvQixPQUFlLEVBQ2YsT0FBcUI7SUFFckIsSUFBSSxDQUFDO1FBQ0gsNENBQTRDO1FBRTVDLE1BQU0sR0FBRyxHQUFHLHdEQUFhLHNCQUFzQixHQUFDLENBQUM7UUFDakQsSUFBSSxHQUFHLElBQUksT0FBUSxHQUFXLENBQUMsV0FBVyxLQUFLLFVBQVUsRUFBRSxDQUFDO1lBQzFELE1BQU0sR0FBRyxHQUFHLE1BQU8sR0FBVyxDQUFDLFdBQVcsQ0FBQyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ2pFLE9BQU8sRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLENBQUM7UUFDbkQsQ0FBQztJQUNILENBQUM7SUFBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO1FBQ1osS0FBSyxFQUFFLENBQUMsQ0FBQyw0Q0FBNEM7SUFDdkQsQ0FBQztJQUVELCtDQUErQztJQUMvQyxPQUFPLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxDQUFDO0FBQy9CLENBQUM7QUFFRCxrQkFBZSxFQUFFLFdBQVcsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBNaW5pbWFsIE1DUC9KaXJhIHdyYXBwZXI6IGF0dGVtcHRzIHRvIHVzZSBAZGVjYWYtdHMvbWNwLXNlcnZlciBpZiBhdmFpbGFibGUsXG4gKiBvdGhlcndpc2UgZmFsbHMgYmFjayB0byBhIGxvY2FsIHBlbmRpbmcgcmVzcG9uc2UuXG4gKi9cbmltcG9ydCB0eXBlIHsgSmlyYU1hcHBpbmcgfSBmcm9tICcuLi90eXBlcy9hY3Jvbnltcyc7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjcmVhdGVJc3N1ZShcbiAgc3VtbWFyeTogc3RyaW5nLFxuICBtYXBwaW5nPzogSmlyYU1hcHBpbmcsXG4pOiBQcm9taXNlPHsgaXNzdWVLZXk/OiBzdHJpbmc7IHN0YXR1czogc3RyaW5nIH0+IHtcbiAgdHJ5IHtcbiAgICAvLyBkeW5hbWljIGltcG9ydCB0byBhdm9pZCBhIGhhcmQgZGVwZW5kZW5jeVxuICAgICBcbiAgICBjb25zdCBtY3AgPSBhd2FpdCBpbXBvcnQoJ0BkZWNhZi10cy9tY3Atc2VydmVyJyk7XG4gICAgaWYgKG1jcCAmJiB0eXBlb2YgKG1jcCBhcyBhbnkpLmNyZWF0ZUlzc3VlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zdCByZXMgPSBhd2FpdCAobWNwIGFzIGFueSkuY3JlYXRlSXNzdWUoeyBzdW1tYXJ5LCBtYXBwaW5nIH0pO1xuICAgICAgcmV0dXJuIHsgaXNzdWVLZXk6IHJlcz8ua2V5LCBzdGF0dXM6ICdjcmVhdGVkJyB9O1xuICAgIH1cbiAgfSBjYXRjaCAoX2UpIHtcbiAgICB2b2lkIF9lOyAvLyBpbnRlbnRpb25hbGx5IGlnbm9yZSBpbXBvcnQvcmVtb3RlIGVycm9yc1xuICB9XG5cbiAgLy8gbG9jYWwgZmFsbGJhY2sgd2hlbiBNQ1AvSmlyYSBpc24ndCBhdmFpbGFibGVcbiAgcmV0dXJuIHsgc3RhdHVzOiAncGVuZGluZycgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgeyBjcmVhdGVJc3N1ZSB9O1xuIl19