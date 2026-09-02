import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';

export async function POST(req) {
  try {
    const { message, userRole } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Gabaasni ergaa duwwaa ta'uu hin danda'u." }, { status: 400 });
    }

    const lowerMessage = message.toLowerCase();
    
    // Fallback safe conversational default in Afaan Oromoo
    let reply = "Hojiiwwan bulchiinsa mana barumsaa koo keessatti si gargaaruuf qophaayeera. Ani: Kuusaa Qabxii, Hordoffii Hirmaannaa (Attendance), Qormaata Baasuu, fi Galmee Herregaa irratti si gargaaruu nan danda'a.";
    const db = await connectToDatabase();

    // DYNAMIC METRICS AUTOMATED BALANCE CHECKER MODULE (AFAN OROMOO PARSER)
    if (lowerMessage.includes('balance') || lowerMessage.includes('kaffaltii') || lowerMessage.includes('herrega')) {
      const idMatch = lowerMessage.match(/stu[-_]?\d+/);
      
      if (idMatch) {
        const targetedStudentId = idMatch[0].toUpperCase();
        
        // Scan internal billing invoices registries
        const [financeRows] = await db.query(
          'SELECT t.*, s.name FROM tuition_ledger t JOIN students s ON t.studentId = s.studentId WHERE t.studentId = ? ORDER BY t.updated_at DESC LIMIT 1', 
          [targetedStudentId]
        );

        if (financeRows && financeRows.length > 0) {
          const entry = financeRows[0];
          const due = Number(entry.amount_due || 0);
          const paid = Number(entry.amount_paid || 0);
          const remainingBalance = due - paid;

          reply = `[GABAASA HERREGAA DIJITAALAA] Barataa argameera: ${entry.name} (${targetedStudentId}). Ramaddii: ${entry.fee_type}. Idaa Waliigalaa: ETB ${due}, Hamma Kaffalame: ETB ${paid}. Idaa outstanding hafe: ETB ${remainingBalance}. Haala kaffaltii: ${entry.payment_status === 'Paid' ? 'Kaffalameera' : 'Hanga Tokko'}.`;
        } else {
          reply = `Noodii dataa ragaa barataa "${targetedStudentId}" jedhu qoratee xumureera. Garuu galmeen kaffaltii herregaa MySQL keessatti hin argamne. Maaloo ID barataa irra-deebi'anii mirkaneessaa.`;
        }
      } else {
        reply = "Kaffaltii barataa tokkoo qorachuuf, maaloo ID sirrii ta'e galchaa (fkn: 'kaffaltii STU-001 qori' jedhaa).";
      }
      return NextResponse.json({ success: true, reply });
    }

    // INTERACTIVE KNOWLEDGE BASE DICTIONARY PARSER CHANNELS
    if (lowerMessage.includes('qabxii') || lowerMessage.includes('roster') || lowerMessage.includes('mark')) {
      reply = "Wiirtuu 'Kuusaa Qabxii' (Grading Matrix) keessatti, barsiisonni qabxiiwwan Test 1 (10), Test 2 (10), Assignment (20), fi Final Exam (60) galchuun daataa MySQL irratti kuusuu danda'u. Daayirektarri qofa barataa haaraa enrollment galmeessuu danda'a.";
    } 
    else if (lowerMessage.includes('hirmaannaa') || lowerMessage.includes('attendance') || lowerMessage.includes('hafe')) {
      reply = "Tabii 'Hordoffii Hirmaannaa' (Session Attendance) fayyadamuun, hirmaannaa barattootaa guyyaa guyyaan 'Present' ykn 'Absent' gochuun galmeessuun ni danda'ama. Kunis ragaa tursiisuuf gara database moodela tamsaasa.";
    } 
    else if (lowerMessage.includes('qormaata') || lowerMessage.includes('exam') || lowerMessage.includes('test')) {
      reply = "Kansoolii 'Qormaata Baasuu' (Test Deployment) irratti barsiisonni gaaffii qormaataa madaallii (multiple choice) fiduun tamsaasuu danda'u. Barattoonni immoo wiirtuu qormaataa irraa fudhatanii qabxiin isaanii battalatti madaalama.";
    } 
    else if (lowerMessage.includes('kitaaba') || lowerMessage.includes('library') || lowerMessage.includes('book')) {
      reply = "Wiirtuu 'Kuusaa Kitaabaa' keessatti, kitaabota dijitaalaa bifa koodii grade section kanaan uunka keessa kaa'uun, barattoonni bifa salphaan download gochuu danda'u.";
    } 
    else if (lowerMessage.includes('aangoo') || lowerMessage.includes('role') || lowerMessage.includes('admin')) {
      reply = "Portaliin kun aangoo adda addaa sadii of keessaa qaba: Bulchiinsa Daayirektaraa (Gali, Piroofayilii Hojjattootaa), Barsiisaa (Kuusaa Qabxii, Hirmaannaa), fi Barataa (Transcript, Qormaata, Kitaaba).";
    }

    return NextResponse.json({ success: true, reply });
  } catch (error) {
    return NextResponse.json({ error: "Engine terminal error: " + error.message }, { status: 500 });
  }
}
