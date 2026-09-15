#!/usr/bin/env node
/**
 * Lightweight guardrail for the rules in .ai/steering/project-guidelines.md.
 * Run after AI (or humans) generate code: npm run lint:guidelines
 */
const { execSync } = require('child_process');

const violations = [];

function grep(command) {
  try {
    return execSync(`${command} 2>/dev/null || true`, { encoding: 'utf-8' }).trim();
  } catch (e) {
    return '';
  }
}

function collect(result, type, rule) {
  result
    .split('\n')
    .filter(Boolean)
    .forEach((detail) => violations.push({ type, rule, detail }));
}

console.log('🔍 Validating coding guidelines...\n');

console.log('📋 Checking for queries in services...');
collect(
  grep('grep -rn "createQueryBuilder\\|getRepository\\|\\.query(" src/modules/*/services/*.service.ts'),
  'ERROR',
  'No queries in services — move them to a repository',
);

console.log('📋 Checking for entities injected as repositories...');
collect(
  grep('grep -rn "@InjectRepository(" src/modules --include=*.ts --exclude-dir=__tests__'),
  'ERROR',
  'Create a repository extending BaseRepository instead of @InjectRepository(Entity)',
);

console.log('📋 Checking for direct process.env access in services/controllers...');
collect(
  grep('grep -rn "process\\.env" src/modules --include=*.service.ts --include=*.controller.ts'),
  'ERROR',
  'Read configuration through ConfigService',
);

console.log('📋 Checking for console.log in src...');
collect(
  grep('grep -rn "console\\.log" src --include=*.ts --exclude-dir=__tests__ --exclude-dir=seeds --exclude-dir=logger'),
  'WARNING',
  'Use LoggerService instead of console.log',
);

console.log('📋 Checking for deep relative imports...');
collect(
  grep('grep -rn "from .*\\.\\./\\.\\./\\.\\./" src/modules'),
  'WARNING',
  'Use @ path aliases instead of ../../../',
);

console.log('\n' + '='.repeat(60));
if (violations.length === 0) {
  console.log('✅ No violations found!\n');
  process.exit(0);
}

console.log(`❌ Found ${violations.length} violations:\n`);
violations.forEach((v) => {
  console.log(`${v.type}: ${v.rule}`);
  console.log(`  ${v.detail}\n`);
});
console.log('='.repeat(60));
process.exit(violations.some((v) => v.type === 'ERROR') ? 1 : 0);
