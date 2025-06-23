import { promises as fs } from 'fs';
import { execSync } from 'child_process';

const packages = ['web', 'frontend', 'server'];
let report = '';

for (const pkg of packages) {
  try {
    const outdated = execSync('npm outdated --json', { cwd: pkg });
    report += `## Outdated packages for ${pkg}\n\n\`\`\`json\n${outdated}\n\`\`\`\n`;
  } catch (err) {
    report += `## Outdated packages for ${pkg}\nnone\n`;
  }
  let envContents = '';
  try {
    envContents = await fs.readFile(`${pkg}/.env.example`, 'utf8');
  } catch {
    try {
      envContents = await fs.readFile(`${pkg}/.env.local.example`, 'utf8');
    } catch {}
  }
  if (envContents) {
    report += `### ${pkg} environment example\n\n\`\`\`\n${envContents}\n\`\`\`\n`;
  }
  try {
    const test = execSync('npm test --silent', { cwd: pkg });
    report += `### ${pkg} tests\n\n\`\`\`\n${test}\n\`\`\`\n`;
  } catch (err) {
    report += `### ${pkg} tests failed\n\n\`\`\`\n${err}\n\`\`\`\n`;
  }
}
await fs.writeFile('BASELINE_REPORT.md', report);
