const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const ignoredDirs = new Set(['node_modules', 'logs', 'uploads', '.git']);
const requiredEnvKeys = [
    'PORT',
    'NODE_ENV',
    'DB_MODE',
    'LOG_LEVEL',
    'AUDIT_LOGGING_ENABLED',
    'FRONTEND_URL',
    'CORS_ORIGIN',
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

const parseEnvMap = (relativePath) => {
    const absolutePath = path.join(root, relativePath);
    const content = fs.readFileSync(absolutePath, 'utf8');
    const map = new Map();

    for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
        const [k, ...rest] = trimmed.split('=');
        map.set(k.trim(), rest.join('=').trim());
    }

    return map;
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
    const devMap = parseEnvMap('.env.example');
    const prodMap = parseEnvMap('.env.production.example');

    const devKeys = new Set(devMap.keys());
    const prodKeys = new Set(prodMap.keys());

    const missingDev = requiredEnvKeys.filter((key) => !devKeys.has(key));
    const missingProd = requiredEnvKeys.filter((key) => !prodKeys.has(key));

    if (missingDev.length > 0) {
        throw new Error(`.env.example missing keys: ${missingDev.join(', ')}`);
    }

    if (missingProd.length > 0) {
        throw new Error(`.env.production.example missing keys: ${missingProd.join(', ')}`);
    }

    const validateDbContract = (name, envMap) => {
        const mode = (envMap.get('DB_MODE') || 'mongo').toLowerCase();
        if (!['mongo', 'supabase', 'hybrid'].includes(mode)) {
            throw new Error(`${name} has invalid DB_MODE=${mode}`);
        }

        const hasMongo = envMap.has('MONGODB_URI') && envMap.get('MONGODB_URI') !== '';
        const hasSupabaseUrl = envMap.has('SUPABASE_URL') && envMap.get('SUPABASE_URL') !== '';
        const hasSupabaseKey =
            (envMap.has('SUPABASE_SERVICE_KEY') && envMap.get('SUPABASE_SERVICE_KEY') !== '') ||
            (envMap.has('SUPABASE_ANON_KEY') && envMap.get('SUPABASE_ANON_KEY') !== '');

        if ((mode === 'mongo' || mode === 'hybrid') && !hasMongo) {
            throw new Error(`${name} requires MONGODB_URI when DB_MODE=${mode}`);
        }

        if ((mode === 'supabase' || mode === 'hybrid') && (!hasSupabaseUrl || !hasSupabaseKey)) {
            throw new Error(`${name} requires SUPABASE_URL and one Supabase key when DB_MODE=${mode}`);
        }
    };

    validateDbContract('.env.example', devMap);
    validateDbContract('.env.production.example', prodMap);
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
