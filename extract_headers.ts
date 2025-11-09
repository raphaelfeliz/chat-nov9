
import * as fs from 'fs';
import * as path from 'path';

function getGitignorePatterns(): string[] {
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    if (!fs.existsSync(gitignorePath)) {
        return [];
    }
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
    return gitignoreContent.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
}

function isIgnored(filePath: string, gitignorePatterns: string[]): boolean {
    // Add default ignores
    const defaultIgnores = ['node_modules', 'dist', 'build', '.next', 'consolidated_summaries.txt', 'extract_headers.ts'];
    const allIgnores = [...gitignorePatterns, ...defaultIgnores];

    for (const pattern of allIgnores) {
        if (filePath.includes(pattern)) {
            return true;
        }
    }
    return false;
}

function extractHeaderComments(rootDir: string, outputFile: string): void {
    const gitignorePatterns = getGitignorePatterns();
    const headerCommentRegex = /\/\* \*file-summary\*([\s\S]*?)\*\//;
    let consolidatedContent = '';

    function traverseDir(currentDir: string) {
        const files = fs.readdirSync(currentDir);
        for (const file of files) {
            const filePath = path.join(currentDir, file);
            const relativePath = path.relative(rootDir, filePath);

            if (isIgnored(relativePath, gitignorePatterns)) {
                continue;
            }

            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                traverseDir(filePath);
            } else {
                try {
                    const content = fs.readFileSync(filePath, 'utf-8');
                    const match = content.match(headerCommentRegex);
                    if (match && match[1]) {
                        consolidatedContent += `/*--- File: ${relativePath} ---*/\n`;
                        consolidatedContent += match[1].trim() + '\n\n';
                    }
                } catch (e) {
                    console.error(`Error processing file ${filePath}:`, e);
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
