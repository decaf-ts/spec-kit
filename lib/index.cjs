"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIssue = void 0;
// Package entry point - re-export CLI utilities and core helpers
var jira_1 = require("./lib/jira.cjs");
Object.defineProperty(exports, "createIssue", { enumerable: true, get: function () { return jira_1.createIssue; } });
// Keep exports minimal to avoid pulling CLI bin scripts (shebangs) into the library bundle
exports.default = {};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaUVBQWlFO0FBQ2pFLHVDQUF5QztBQUFoQyxtR0FBQSxXQUFXLE9BQUE7QUFFcEIsMkZBQTJGO0FBQzNGLGtCQUFlLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8vIFBhY2thZ2UgZW50cnkgcG9pbnQgLSByZS1leHBvcnQgQ0xJIHV0aWxpdGllcyBhbmQgY29yZSBoZWxwZXJzXG5leHBvcnQgeyBjcmVhdGVJc3N1ZSB9IGZyb20gJy4vbGliL2ppcmEnO1xuXG4vLyBLZWVwIGV4cG9ydHMgbWluaW1hbCB0byBhdm9pZCBwdWxsaW5nIENMSSBiaW4gc2NyaXB0cyAoc2hlYmFuZ3MpIGludG8gdGhlIGxpYnJhcnkgYnVuZGxlXG5leHBvcnQgZGVmYXVsdCB7fTtcbiJdfQ==