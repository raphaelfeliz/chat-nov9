#!/usr/bin/env node

/*
 * =============================================================================
 * HOW TO RUN THIS SCRIPT
 * =============================================================================
 *
 * This script is designed to be run from your project's root directory using npm.
 *
 * ---
 * 0. ENVIRONMENT CHECK (Recommended):
 * ---
 *
 * Before running the setup, ensure you are using a compatible Node.js version (>=18).
 *
 * In your terminal, run:
 * node -v
 *
 * ---
 * 1. ONE-TIME SETUP (Do this only once):
 * ---
 *
 * You need `ts-node` to run this TypeScript file directly.
 *
 * ➡️ Check if `ts-node` is available (Recommended):
 *
 * In your terminal, run:
 * npx ts-node -v
 *
 * If this command fails or returns an error like "command not found,"
 * you need to install it.
 *
 * ➡️ To install `ts-node` locally to your project:
 *
 * npm install -D ts-node
 *
 *
 * ---
 * 2. ADD THE SCRIPT TO package.json (Do this only once):
 * ---
 *
 * Open your `package.json` file and add a new "script" to the `scripts` object.
 * This creates an easy-to-remember command.
 *
 * {
 * "name": "your-project-name",
 * "version": "0.1.0",
 * "scripts": {
 * "dev": "next dev --turbopack -p 9003",
 * "build": "next build",
 * "start": "next start",
 * "lint": "next lint",
 * "update-filemap": "ts-node ./update-filemap.ts"
 * },
 * // ...rest of your file
 * }
 *
 *
 * ---
 * 3. RUN THE SCRIPT (Do this every time you want to update):
 * ---
 *
 * Whenever you add new files, update summaries, or want to regenerate
 * the `docs/filemap.json` file, just run the following command
 * in your terminal:
 *
 * npm run update-filemap
 *
 * =============================================================================
 */


import * as fs from 'fs';
import * as path from 'path';

// --- Configuration ---
const ROOT_DIR = process.cwd();
const OUTPUT_FILE = path.join(ROOT_DIR, 'docs', 'filemap.json');
const HEADER_REGEX = /\/\* \*file-summary\*([\s\S]*?)\*\//;

// --- Types ---

/**
 * v1.1: This interface now includes all the separate fields
 * from the file-summary header.
 */
interface FileMapEntry {
  path: string;
  tags: string[];
  purpose?: string;
  summary?: string;
  relations?: string;
  imports?: string;
  exports?: string;
}

/**
 * v1.1: Defines the shape of the data extracted from a single header.
 */
interface FileHeaderData {
  purpose?: string;
  summary?: string;
  relations?: string;
  imports?: string;
  exports?: string;
}

interface FileMap {
  file_map: FileMapEntry[];
}

/**
 * Loads the existing filemap.json to preserve manual data like tags.
 */
function loadExistingFileMap(filePath: string): Map<string, FileMapEntry> {
  if (!fs.existsSync(filePath)) {
    return new Map();
  }
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const json: FileMap = JSON.parse(content);
    const map = new Map<string, FileMapEntry>();
    for (const entry of json.file_map) {
      map.set(entry.path, entry);
    }
    return map;
  } catch (e) {
    console.warn(`Warning: Could not parse existing ${filePath}. Starting fresh.`);
    return new Map();
  }
}

/**
 * Reads and parses the .gitignore file.
 */
function getGitignorePatterns(): string[] {
  const gitignorePath = path.join(ROOT_DIR, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    return [];
  }
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
  return gitignoreContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
}

/**
 * Checks if a file path should be ignored.
 */
function isIgnored(
  relativePath: string,
  gitignorePatterns: string[]
): boolean {
  // Add default and project-specific ignores
  const defaultIgnores = [
    'node_modules',
    '.next',
    '.git',
    'dist',
    'build',
    'package-lock.json',
    'update-filemap.ts', // Don't scan this script
    path.relative(ROOT_DIR, OUTPUT_FILE), // Don't scan the output file
  ];
  
  const allIgnores = [...gitignorePatterns, ...defaultIgnores];

  // Use path.sep for cross-platform compatibility
  const parts = relativePath.split(path.sep);

  for (const pattern of allIgnores) {
    if (pattern.endsWith('/')) {
      // It's a directory pattern
      if (parts.includes(pattern.slice(0, -1))) return true;
    } else {
      // It's a file or general pattern
      if (relativePath.includes(pattern)) return true;
    }
  }
  return false;
}

/**
 * v1.1: New helper function to extract a single field from the header content.
 * It captures multi-line content until it hits the *next* field or the end
 * of the comment.
 */
function extractField(content: string, fieldName: string): string | undefined {
  // Regex: Find "FIELDNAME:"
  // Capture everything (non-greedy) until...
  // Lookahead for:
  // 1. A newline followed by another ALL_CAPS_FIELD_NAME:
  // 2. The end of the comment block (*/)
  // 3. The end of the string
  const regex = new RegExp(
    `${fieldName}:\\s*([\\s\\S]*?)(?=\\n[A-Z_\\s]+:|\n\\s*\\*\\/|$)`,
    'i'
  );
  const match = content.match(regex);
  if (match && match[1]) {
    // Clean up the captured content
    return match[1]
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join(' ');
  }
  return undefined;
}


/**
 * v1.1: Renamed and updated from `parseSummary` to `parseFileSummaryBlock`.
 * This now finds the *entire* block and extracts *all* known fields.
 */
function parseFileSummaryBlock(fileContent: string): FileHeaderData | null {
  const headerMatch = fileContent.match(HEADER_REGEX);
  if (!headerMatch || !headerMatch[1]) {
    return null; // No /* *file-summary* */ block found
  }
  
  const headerContent = headerMatch[1];
  
  const data: FileHeaderData = {
    purpose: extractField(headerContent, "PURPOSE"),
    summary: extractField(headerContent, "SUMMARY"),
    relations: extractField(headerContent, "RELATES TO OTHER FILES"),
    imports: extractField(headerContent, "IMPORTS"),
    exports: extractField(headerContent, "EXPORTS"),
  };
  
  // If all fields are undefined, it means we found the block but no fields.
  // Return null so we don't add empty entries.
  if (Object.values(data).every(v => v === undefined)) {
    return null;
  }
  
  return data;
}


/**
 * Main function to traverse directories and generate the file map.
 */
function generateFileMap() {
  console.log(`Scanning project in ${ROOT_DIR}...`);
  
  const gitignorePatterns = getGitignorePatterns();
  const existingMap = loadExistingFileMap(OUTPUT_FILE);
  const newEntries: FileMapEntry[] = [];

  function traverseDir(currentDir: string) {
    try {
      const files = fs.readdirSync(currentDir);
      for (const file of files) {
        const filePath = path.join(currentDir, file);
        const relativePath = path.relative(ROOT_DIR, filePath);

        if (isIgnored(relativePath, gitignorePatterns)) {
          continue;
        }

        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          traverseDir(filePath);
        } else {
          try {
            const content = fs.readFileSync(filePath, 'utf-8');
            
            // v1.1: Use the new, more comprehensive parser
            const headerData = parseFileSummaryBlock(content);

            if (headerData) {
              const existingEntry = existingMap.get(relativePath);
              newEntries.push({
                path: relativePath,
                tags: existingEntry ? existingEntry.tags : [], // Preserve tags
                ...headerData // Spread all fields (purpose, summary, etc.)
              });
              existingMap.delete(relativePath); // Mark as processed
            }
          } catch (e) {
            // Ignore unreadable files (e.g., binary)
          }
        }
      }
    } catch (e) {
      console.error(`Error reading directory ${currentDir}:`, e);
    }
  }

  traverseDir(ROOT_DIR);

  // Sort alphabetically by path
  newEntries.sort((a, b) => a.path.localeCompare(b.path));
  
  const finalMap: FileMap = {
    file_map: newEntries,
  };

  // Ensure 'docs' directory exists
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  
  // Write the final JSON file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalMap, null, 2), 'utf-8');
  
  console.log(`✅ File map successfully generated at ${OUTPUT_FILE}`);
  console.log(`   Found and processed ${newEntries.length} files with summaries.`);
  
  if (existingMap.size > 0) {
    console.warn(`   Warning: ${existingMap.size} files from the old map were not found:`);
    existingMap.forEach((_, key) => console.warn(`     - ${key}`));
  }
}

// Run the script
generateFileMap();