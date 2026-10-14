// Adds the permissions SafeHer needs to the generated Android project. Safe to re-run.
import fs from 'fs';
const file = 'android/app/src/main/AndroidManifest.xml';
if (!fs.existsSync(file)) { console.error('android/ not found. Run: npx cap add android'); process.exit(1); }
let xml = fs.readFileSync(file, 'utf8');
const perms = [
  'android.permission.INTERNET',
  'android.permission.ACCESS_NETWORK_STATE',
  'android.permission.ACCESS_FINE_LOCATION',
  'android.permission.ACCESS_COARSE_LOCATION',
  'android.permission.VIBRATE',
  'android.permission.WAKE_LOCK',
];
for (const p of perms) {
  if (!xml.includes(`"${p}"`)) xml = xml.replace('</manifest>', `    <uses-permission android:name="${p}" />\n</manifest>`);
}
if (!xml.includes('android.hardware.location.gps'))
  xml = xml.replace('</manifest>', '    <uses-feature android:name="android.hardware.location.gps" android:required="false" />\n</manifest>');
if (!xml.includes('screenOrientation'))
  xml = xml.replace('<activity', '<activity\n            android:screenOrientation="portrait"');
fs.writeFileSync(file, xml);
console.log('AndroidManifest.xml patched.');
