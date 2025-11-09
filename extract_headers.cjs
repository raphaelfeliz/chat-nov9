"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
function getGitignorePatterns() {
    var gitignorePath = path.join(process.cwd(), '.gitignore');
    if (!fs.existsSync(gitignorePath)) {
        return [];
    }
    var gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
    return gitignoreContent.split('\n').map(function (line) { return line.trim(); }).filter(function (line) { return line && !line.startsWith('#'); });
}
function isIgnored(filePath, gitignorePatterns) {
    // Add default ignores
    var defaultIgnores = ['node_modules', 'dist', 'build', '.next', 'consolidated_summaries.txt', 'extract_headers.ts'];
    var allIgnores = __spreadArray(__spreadArray([], gitignorePatterns, true), defaultIgnores, true);
    for (var _i = 0, allIgnores_1 = allIgnores; _i < allIgnores_1.length; _i++) {
        var pattern = allIgnores_1[_i];
        if (filePath.includes(pattern)) {
            return true;
        }
    }
    return false;
}
function extractHeaderComments(rootDir, outputFile) {
    var gitignorePatterns = getGitignorePatterns();
    var headerCommentRegex = /\/\* \*file-summary\*([\s\S]*?)\*\//;
    var consolidatedContent = '';
    function traverseDir(currentDir) {
        var files = fs.readdirSync(currentDir);
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var file = files_1[_i];
            var filePath = path.join(currentDir, file);
            var relativePath = path.relative(rootDir, filePath);
            if (isIgnored(relativePath, gitignorePatterns)) {
                continue;
            }
            var stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                traverseDir(filePath);
            }
            else {
                try {
                    var content = fs.readFileSync(filePath, 'utf-8');
                    var match = content.match(headerCommentRegex);
                    if (match && match[1]) {
                        consolidatedContent += "/*--- File: ".concat(relativePath, " ---*/\n");
                        consolidatedContent += match[1].trim() + '\n\n';
                    }
                }
                catch (e) {
                    console.error("Error processing file ".concat(filePath, ":"), e);
                }
            }
        }
    }
    traverseDir(rootDir);
    fs.writeFileSync(outputFile, consolidatedContent, 'utf-8');
}
if (require.main === module) {
    extractHeaderComments(process.cwd(), 'consolidated_summaries.txt');
    console.log('Header comments extracted and saved to consolidated_summaries.txt');
}
