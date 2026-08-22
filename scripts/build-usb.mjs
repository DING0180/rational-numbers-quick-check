import { existsSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const releaseDirectory = path.join(root, 'release-usb');
const run = (command, args) => {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
};

run(process.execPath, [path.join(root, 'node_modules', 'vite', 'bin', 'vite.js'), 'build', '--config', 'vite.usb.config.js']);

const windowsDirectory = process.env.WINDIR || 'C:\\Windows';
const compilers = [
  path.join(windowsDirectory, 'Microsoft.NET', 'Framework64', 'v4.0.30319', 'csc.exe'),
  path.join(windowsDirectory, 'Microsoft.NET', 'Framework', 'v4.0.30319', 'csc.exe')
];
const compiler = compilers.find(existsSync);
if (!compiler) throw new Error('Windows .NET Framework C# compiler was not found.');

run(compiler, [
  '/nologo',
  '/target:winexe',
  '/optimize+',
  '/reference:System.Windows.Forms.dll',
  `/out:${path.join(releaseDirectory, 'Start-Rational-Numbers-Quick-Check.exe')}`,
  path.join(root, 'tools', 'OfflineLauncher.cs')
]);
