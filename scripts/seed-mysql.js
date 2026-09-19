const { connectToDatabase } = require('../lib/db');
const bcrypt = require('bcryptjs');
const { crypto } = require('crypto');

async function runNativeDatabaseSeedPipeline() {
  console.log("⚡ Connecting to Alwaysdata MySQL Server...");
  const db = await connectToDatabase();

  try {
    // 1. Generate secure password hash signatures
    const salt = await bcrypt.genSalt(10);
    const rootAdminPassword = await bcrypt.hash('AdminPassword123', salt);

    console.log("👥 Injecting default cryptographic user records...");
    await db.query(`
      INSERT INTO users (id, username, email, password, role) 
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE username=VALUES(username);
    `, ['USR-ROOT-001', 'Admin User', 'admin@school.edu', rootAdminPassword, 'Admin']);

    console.log("📝 Provisioning default target student profiles...");
    const sampleStudents = [
      ['SMS/001', 'Chala Alemu', '12 Natural'],
      ['SMS/002', 'Aster Mamo', '12 Natural'],
      ['SMS/003', 'Benti Tolossa', '12 Social']
    ];

    for (let currentStudent of sampleStudents) {
      await db.query(`
        INSERT INTO students (barataa_id, maqaa, kutaa, saala) 
        VALUES (?, ?, ?, 'Dhiira')
        ON DUPLICATE KEY UPDATE maqaa=VALUES(maqaa);
      `, currentStudent);
    }

    console.log("💵 Initializing structural finance statements balances...");
    await db.query(`
      INSERT INTO finance (student_id, fee_type, amount_due, amount_paid, payment_status) 
      VALUES (?, ?, ?, ?, ?);
    `, ['SMS/001', 'Tuition Q1', 3500.00, 3500.00, 'Paid']);

    console.log("🛠️ Deploying default dynamic test architecture blueprints...");
    const sampleExamPayload = JSON.stringify([
      { text: 'Which storage paradigm handles global scope state context?', a: 'Client React Hooks Storage', b: 'Server Side Core Database Store', correct: 'B' },
      { text: 'What file name patterns execute route pathways inside NextJS?', a: 'route.js endpoints', b: 'index.html layouts', correct: 'A' }
    ]);

    await db.query(`
      INSERT INTO exams (exam_id, title, subject, grade_section, questions_payload) 
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE title=VALUES(title);
    `, ['EXAM-ALPHA', 'ICT Chapter 1 Digital Network Quiz', 'ICT', '12 Natural', sampleExamPayload]);

    console.log("🎉 DATABASE PROVISIONING COMPLETED SUCCESSFULLY.");
  } catch (error) {
    console.error("❌ Seeding transaction pipeline crashed:", error.message);
  } finally {
    process.exit();
  }
}

runNativeDatabaseSeedPipeline();
