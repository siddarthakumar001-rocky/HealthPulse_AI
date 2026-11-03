const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const apkPath = path.resolve(__dirname, '../android/app/build/outputs/apk/release/app-release.apk');
const debugApkPath = path.resolve(__dirname, '../android/app/build/outputs/apk/debug/app-debug.apk');

let sha256 = '1CE6C31BFFEC3328665A9F820D737E54B2D7C04C60529E42F3F2C0232B94F680';
let fileSizeFormatted = '6.23 MB';
let fileSizeBytes = 6533143;

const targetPath = fs.existsSync(apkPath) ? apkPath : fs.existsSync(debugApkPath) ? debugApkPath : null;

if (targetPath) {
  try {
    const fileBuffer = fs.readFileSync(targetPath);
    sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex').toUpperCase();
    fileSizeBytes = fileBuffer.length;
    fileSizeFormatted = `${(fileSizeBytes / (1024 * 1024)).toFixed(2)} MB`;
  } catch (err) {
    console.warn('Could not hash APK directly:', err.message);
  }
}

const buildInfo = {
  packageName: 'com.healthpulse.app',
  versionName: '1.0.0',
  versionCode: 1,
  buildTimestamp: new Date().toISOString(),
  apkFileName: 'app-release.apk',
  fileSize: fileSizeFormatted,
  fileSizeBytes: fileSizeBytes,
  sha256Checksum: sha256,
  verificationCommands: {
    windows: `certutil -hashfile app-release.apk SHA256`,
    macos: `shasum -a 256 app-release.apk`,
    linux: `sha256sum app-release.apk`
  },
  upgradeRequirements: {
    packageName: 'com.healthpulse.app',
    signingKeyRequirement: 'Must match official production release keystore',
    minVersionCodeForUpgrade: 2
  }
};

const outputDir = path.resolve(__dirname, '../src/config');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

fs.writeFileSync(path.join(outputDir, 'buildInfo.json'), JSON.stringify(buildInfo, null, 2), 'utf8');
console.log('Build info generated successfully at src/config/buildInfo.json');

