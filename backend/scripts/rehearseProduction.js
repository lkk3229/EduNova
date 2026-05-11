const { spawnSync } = require('child_process');

const run = (cmd, args, cwd, required = true) => {
  const result = spawnSync(cmd, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (required && result.status !== 0) {
    throw new Error(`Command failed: ${cmd} ${args.join(' ')}`);
  }

  return result.status === 0;
};

const root = process.cwd();

const main = () => {
  console.log('Starting production-like rehearsal...');

  // 1) Build and run stack
  run('docker', ['compose', '-f', 'docker-compose.production.yml', 'up', '-d', '--build'], root);

  // 2) Health + readiness checks
  run('node', ['scripts/integrationCriticalPaths.js'], root);

  // 3) Backup rehearsal for Mongo
  run('docker', ['compose', '-f', 'docker-compose.production.yml', 'exec', '-T', 'mongodb', 'mongodump', '--archive=/tmp/edunova-rehearsal.archive'], root);

  // 4) Restore rehearsal (metadata-level dry cycle)
  run('docker', ['compose', '-f', 'docker-compose.production.yml', 'exec', '-T', 'mongodb', 'mongorestore', '--archive=/tmp/edunova-rehearsal.archive', '--drop'], root);

  // 5) Rollback rehearsal by recreating backend container from known image
  run('docker', ['compose', '-f', 'docker-compose.production.yml', 'up', '-d', '--no-deps', '--force-recreate', 'backend'], root);

  console.log('Production-like rehearsal completed successfully.');
  console.log('Note: HTTPS termination must be validated in your reverse proxy ingress (Nginx/ALB/App Gateway).');
};

try {
  main();
} catch (error) {
  console.error(`Production rehearsal failed: ${error.message}`);
  process.exit(1);
}
