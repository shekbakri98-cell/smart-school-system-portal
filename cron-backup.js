const { exec } = require('child_process');
const fs = require('fs');
const path = require('fs');

// Ragaa Kaffaltii Koodii Database Keessanii (Alwaysdata Settings)
const DB_USER = 'username_keessan';
const DB_PASS = 'password_keessan';
const DB_NAME = 'database_keessan';
const DB_HOST = 'mysql-username.alwaysdata.net'; // Host teessoo keessan

// Maqaa sanada backup koodii sa'aatii fi guyyaadhaan uumuu
const dateStr = new Date().toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/:/g, '-');
const backupFileName = `sheek_bakri_backup_${dateStr}.sql`;
const backupPath = `./backups/${backupFileName}`;

// Yoo folderni 'backups' hin jirre uumuu
if (!fs.existsSync('./backups')){
    fs.mkdirSync('./backups');
}

// Ajaja mysqldump execution pipeline
const cmd = `mysqldump -h ${DB_HOST} -u ${DB_USER} -p${DB_PASS} ${DB_NAME} > ${backupPath}`;

console.log("🔄 Ajaja daataa backup fudhachuu jalqabeera...");
exec(cmd, (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Dogoggorri uumameera: ${error.message}`);
    return;
  }
  if (stderr) {
    console.log(`⚠️ Terminal notice: ${stderr}`);
  }
  console.log(`✅ Daataan Mana Barumsaa Milkiin Ol-kaayameera: ${backupPath}`);
});
