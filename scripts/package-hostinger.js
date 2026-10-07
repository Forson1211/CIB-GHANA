import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('====================================================');
console.log('📦 CIB GHANA - PACKAGING UNIFIED HOSTINGER DEPLOYMENT');
console.log('====================================================');

// 1. Run full build
console.log('\n[1/3] Building backend and frontend...');
execSync('npm run build:all', { stdio: 'inherit', cwd: rootDir });

// 2. Prepare staging directory
const stagingDir = path.join(rootDir, 'hostinger-deploy');
if (fs.existsSync(stagingDir)) {
  fs.rmSync(stagingDir, { recursive: true, force: true });
}
fs.mkdirSync(stagingDir, { recursive: true });

console.log('\n[2/3] Collecting production files for Hostinger...');

// Copy backend dist
const backendDist = path.join(rootDir, 'backend', 'dist');
if (fs.existsSync(backendDist)) {
  fs.cpSync(backendDist, path.join(stagingDir, 'backend', 'dist'), { recursive: true });
}

// Copy frontend dist
const frontendDist = path.join(rootDir, 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  fs.cpSync(frontendDist, path.join(stagingDir, 'frontend', 'dist'), { recursive: true });
  // Also copy to root dist for direct web serving
  fs.cpSync(frontendDist, path.join(stagingDir, 'dist'), { recursive: true });
}

// Copy entrypoint and configurations
const filesToCopy = [
  'server.js',
  'package.json',
  'package-lock.json',
  '.htaccess',
];

filesToCopy.forEach((file) => {
  const src = path.join(rootDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(stagingDir, file));
  }
});

// Copy environment template
const envExample = path.join(rootDir, 'backend', '.env.example');
if (fs.existsSync(envExample)) {
  fs.copyFileSync(envExample, path.join(stagingDir, '.env.example'));
}

// 3. Compress into zip archive
console.log('\n[3/3] Creating cib-ghana-hostinger.zip archive...');
const zipOutput = path.join(rootDir, 'cib-ghana-hostinger.zip');
if (fs.existsSync(zipOutput)) {
  fs.unlinkSync(zipOutput);
}

const isWindows = process.platform === 'win32';
if (isWindows) {
  execSync(
    `powershell -Command "Compress-Archive -Path '${stagingDir}\\*' -DestinationPath '${zipOutput}' -Force"`,
    { stdio: 'inherit' }
  );
} else {
  execSync(`cd "${stagingDir}" && zip -r "${zipOutput}" ./*`, { stdio: 'inherit' });
}

// Clean up temporary staging directory
fs.rmSync(stagingDir, { recursive: true, force: true });

const stats = fs.statSync(zipOutput);
const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

console.log('\n====================================================');
console.log(`✅ SUCCESS! Single deployable archive created:`);
console.log(`📁 File: cib-ghana-hostinger.zip (${sizeMB} MB)`);
console.log(`🚀 Ready to upload directly to Hostinger File Manager!`);
console.log('====================================================\n');
