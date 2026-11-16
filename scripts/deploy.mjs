// Builds the app and publishes the built files to the gh-pages branch (GitHub Pages).
import { execSync } from 'node:child_process';
import { rmSync } from 'node:fs';

const run = (cmd, cwd) => execSync(cmd, { cwd, stdio: 'inherit' });
const out = (cmd) => execSync(cmd).toString().trim();

const remote = out('git remote get-url origin');
const name = out('git config user.name');
const email = out('git config user.email');
const rev = out('git rev-parse --short HEAD');
run('npm run build');
rmSync('dist/.git', { recursive: true, force: true });
run('git init -q -b gh-pages', 'dist');
run(`git config user.name "${name}"`, 'dist');
run(`git config user.email "${email}"`, 'dist');
run('git add -A', 'dist');
run(`git commit -q -m "Publish ${rev}"`, 'dist');
run(`git push -f "${remote}" gh-pages`, 'dist');
rmSync('dist/.git', { recursive: true, force: true });
console.log('Published.');
