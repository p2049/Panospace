const fs = require('fs');
const path = require('path');

const SRC_DIR = path.resolve(__dirname, '../src');

// Map of old file paths (relative to src, without extension) to new import paths (using @ alias)
const REMAP_RULES = {
    // Services
    'services/monetizationService': '@/core/services/firestore/monetization.service',
    'core/search/SearchService': '@/core/services/firestore/search.service',
    'services/galleryService': '@/core/services/firestore/studios.service',
    'services/ShopService': '@/core/services/firestore/studios.service',
    'services/AccountTypeService': '@/core/services/firestore/users.service',

    // Utils (Specific consolidations)
    'utils/postQueries': '@/core/services/firestore/posts.service',
    'utils/bundlePricing': '@/core/utils/pricing',
    'utils/printPricing': '@/core/utils/pricing',
    'utils/printPricing.bak': '@/core/utils/pricing',
    'utils/printifyPricing': '@/core/utils/pricing',
    'utils/dateHelpers': '@/core/utils/dates',
    'utils/calendarHelpers': '@/core/utils/dates',
    'utils/migrateDateFormat': '@/core/utils/dates',
    'utils/colorExtraction': '@/core/utils/colors',
    'utils/colorBackfillTool': '@/core/utils/colors',
    'utils/exifUtils': '@/core/utils/exif',

    // Generic moves (will be handled by path resolution + regex, but specific mapping helps)
    'store/useThemeStore': '@/core/store/useThemeStore',
    'store/useFeedStore': '@/core/store/useFeedStore',
};

// Regex to catch imports
// import ... from '...'
// import '...'
// require('...')
const IMPORT_REGEX = /from\s+['"]([^'"]+)['"]|import\s+['"]([^'"]+)['"]|require\(['"]([^'"]+)['"]\)/g;

function walk(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                walk(filePath, fileList);
            }
        } else {
            if (/\.(js|jsx|ts|tsx)$/.test(file)) {
                fileList.push(filePath);
            }
        }
    });
    return fileList;
}

function resolveImport(currentFile, importPath) {
    // 1. If it's an alias, expand it to absolute path
    let absoluteImportPath = importPath;
    if (importPath.startsWith('@/')) {
        absoluteImportPath = path.join(SRC_DIR, importPath.substring(2));
    } else if (importPath.startsWith('.')) {
        // Resolve relative path
        absoluteImportPath = path.resolve(path.dirname(currentFile), importPath);
    } else {
        // Node module or other alias
        return null;
    }

    // 2. Check if it's inside src
    if (!absoluteImportPath.startsWith(SRC_DIR)) {
        return null;
    }

    // 3. Get path relative to src
    let relativeToSrc = path.relative(SRC_DIR, absoluteImportPath).replace(/\\/g, '/');

    // Remove extension for matching
    const ext = path.extname(relativeToSrc);
    if (ext) {
        relativeToSrc = relativeToSrc.substring(0, relativeToSrc.length - ext.length);
    }

    return relativeToSrc;
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // We can't use replace with regex global directly because we need to calculate replacement
    // So we iterate matches

    // Helper to replace import path
    const replaceImport = (fullMatch, p1, p2, p3) => {
        const oldPath = p1 || p2 || p3;
        if (!oldPath) return fullMatch;

        // Skip node_modules or absolute paths that don't start with . or @/
        if (!oldPath.startsWith('.') && !oldPath.startsWith('@/')) {
            return fullMatch;
        }

        const resolvedRelative = resolveImport(filePath, oldPath);
        if (!resolvedRelative) return fullMatch;

        // Check explicit remaps
        if (REMAP_RULES[resolvedRelative]) {
            changed = true;
            const newPath = REMAP_RULES[resolvedRelative];
            // Preserve quotes style
            const quote = fullMatch.includes("'") ? "'" : '"';
            if (p1) return `from ${quote}${newPath}${quote}`; // from '...'
            if (p2) return `import ${quote}${newPath}${quote}`; // import '...'
            if (p3) return `require(${quote}${newPath}${quote})`; // require('...')
        }

        // Check directory moves (e.g. utils -> core/utils)
        // If resolved starts with 'utils/', map to 'core/utils/'
        if (resolvedRelative.startsWith('utils/')) {
            changed = true;
            const newPath = '@/core/' + resolvedRelative;
            const quote = fullMatch.includes("'") ? "'" : '"';
            if (p1) return `from ${quote}${newPath}${quote}`;
            if (p2) return `import ${quote}${newPath}${quote}`;
            if (p3) return `require(${quote}${newPath}${quote})`;
        }

        // Check constants/ -> core/constants/
        if (resolvedRelative.startsWith('constants/')) {
            changed = true;
            const newPath = '@/core/' + resolvedRelative;
            const quote = fullMatch.includes("'") ? "'" : '"';
            if (p1) return `from ${quote}${newPath}${quote}`;
            if (p2) return `import ${quote}${newPath}${quote}`;
            if (p3) return `require(${quote}${newPath}${quote})`;
        }

        // Check types/ -> core/types/
        if (resolvedRelative.startsWith('types/')) {
            changed = true;
            const newPath = '@/core/' + resolvedRelative;
            const quote = fullMatch.includes("'") ? "'" : '"';
            if (p1) return `from ${quote}${newPath}${quote}`;
            if (p2) return `import ${quote}${newPath}${quote}`;
            if (p3) return `require(${quote}${newPath}${quote})`;
        }

        // Phase 4: Normalize relative paths to @/
        // If it starts with ../.. (more than one level up) OR it's a cross-module import
        // We generally convert EVERYTHING inside src to @/ for consistency
        if (oldPath.startsWith('../') || oldPath.startsWith('./')) {
            // Check if it's cleaner to use @
            const newAliasPath = '@/' + resolvedRelative;

            // Only replace if it actually changes something meaningful (e.g. gets rid of ../..)
            // Or if user requested "Normalize imports" (User said "Replace all relative hell paths")
            if (oldPath.includes('..')) {
                changed = true;
                const quote = fullMatch.includes("'") ? "'" : '"';
                if (p1) return `from ${quote}${newAliasPath}${quote}`;
                if (p2) return `import ${quote}${newAliasPath}${quote}`;
                if (p3) return `require(${quote}${newAliasPath}${quote})`;
            }
        }

        return fullMatch;
    };

    const newContent = content.replace(IMPORT_REGEX, replaceImport);

    if (changed || newContent !== content) {
        // console.log(`Updated imports in ${filePath}`);
        fs.writeFileSync(filePath, newContent, 'utf8');
    }
}

console.log('Starting import refactor...');
const files = walk(SRC_DIR);
files.forEach(processFile);
console.log('Import refactor complete.');
