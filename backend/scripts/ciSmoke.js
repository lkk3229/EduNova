const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const ignoredDirs = new Set(['node_modules', 'logs', 'uploads', '.git']);
const requiredEnvKeys = [
    'PORT',
    'NODE_ENV',
    'LOG_LEVEL',
    'AUDIT_LOGGING_ENABLED',
    'FRONTEND_URL',
    'CORS_ORIGIN',
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_EXPIRE',
    'EMAIL_SERVICE',
    'EMAIL_USER',
    'EMAIL_PASS',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'UPLOAD_PATH',
    'ENABLE_RESPONSE_CACHE',
    'CACHE_TTL_SECONDS',
    'PERF_SLOW_REQUEST_MS',
    'PERF_MAX_ROUTE_SAMPLES'
];

const collectJsFiles = (dir, output = []) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            if (!ignoredDirs.has(entry.name)) {
                collectJsFiles(path.join(dir, entry.name), output);
            }
            continue;
        }

        if (entry.name.endsWith('.js')) {
            output.push(path.join(dir, entry.name));
        }
    }
    return output;
};

const assertFileExists = (relativePath) => {
    const absolutePath = path.join(root, relativePath);
    if (!fs.existsSync(absolutePath)) {
        throw new Error(`Missing required file: ${relativePath}`);
    }
};

const parseEnvKeys = (relativePath) => {
    const absolutePath = path.join(root, relativePath);
    const content = fs.readFileSync(absolutePath, 'utf8');
    const keys = new Set();

    for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
        const [k] = trimmed.split('=');
        keys.add(k.trim());
    }

    return keys;
};

const verifySyntax = (files) => {
    const failures = [];
    for (const file of files) {
        const check = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
        if (check.status !== 0) {
            failures.push({ file, stderr: check.stderr || check.stdout });
        }
    }

    if (failures.length > 0) {
        for (const failure of failures) {
            console.error(`Syntax error: ${path.relative(root, failure.file)}`);
            console.error(failure.stderr.trim());
        }
        throw new Error(`Syntax validation failed for ${failures.length} file(s)`);
    }
};

const verifyEnvTemplates = () => {
    const devKeys = parseEnvKeys('.env.example');
    const prodKeys = parseEnvKeys('.env.production.example');

    const missingDev = requiredEnvKeys.filter((key) => !devKeys.has(key));
    const missingProd = requiredEnvKeys.filter((key) => !prodKeys.has(key));

    if (missingDev.length > 0) {
        throw new Error(`.env.example missing keys: ${missingDev.join(', ')}`);
    }

    if (missingProd.length > 0) {
        throw new Error(`.env.production.example missing keys: ${missingProd.join(', ')}`);
    }
};

const main = () => {
    assertFileExists('server.js');
    assertFileExists('Dockerfile');
    assertFileExists('.dockerignore');
    assertFileExists('.env.example');
    assertFileExists('.env.production.example');

    const jsFiles = collectJsFiles(root);
    verifySyntax(jsFiles);
    verifyEnvTemplates();

    console.log(`CI smoke checks passed: ${jsFiles.length} JS file(s) verified.`);
};

try {
    main();
} catch (error) {
    console.error(`CI smoke checks failed: ${error.message}`);
    process.exit(1);
}
