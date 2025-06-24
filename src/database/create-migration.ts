import { execSync } from 'child_process';

const name = process.argv[2];

let path = process.argv[3];

if (!name) {
  console.error(
    '❌ Please provide a migration name. Example: yarn migration:create createUsersTable',
  );
  process.exit(1);
}

if (!path) {
  path = './src/database/migrations';
}

const filePath = `${path}/${name}`;

const command = `npx ts-node ./node_modules/typeorm/cli.js migration:create ${filePath}`;

console.log(`🚀 Generating migration: ${filePath}`);
execSync(command, { stdio: 'inherit' });
