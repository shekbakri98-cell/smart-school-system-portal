'use client';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  // Console Navigation States
  const [currentRoleView, setCurrentRoleView] = useState('Director');
  const [activeTab, setActiveTab] = useState('director-overview');
  const [examUploadMode, setExamUploadMode] = useState('manual'); 
  const [userRole, setUserRole] = useState('Admin'); 
  const [username, setUsername] = useState('Admin User');

  // Academic Roster States
  const [selectedGrade, setSelectedGrade] = useState('12 Natural');
  const [students, setStudents] = useState([]);
  const [studentForm, setStudentForm] = useState({ studentId: '', name: '' });
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Attendance Tracker States
  const [attendanceDate, setAttendanceDate] = useState(new Date().toLocaleDateString('sv-SE'));
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // Testing Matrix States
  const [exams, setExams] = useState([]);
  const [examsLoading, setExamsLoading] = useState(false);
  const [examForm, setExamForm] = useState({ title: '', subject: 'ICT', questions: [] });
  const [currentQuestion, setCurrentQuestion] = useState({ text: '', a: '', b: '', c: '', d: '', correct: 'A' });

  // Quiz Modal States
  const [activeQuizExam, setActiveQuizExam] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [studentAnswers, setStudentAnswers] = useState({});
  const [studentExId, setStudentExId] = useState('');

  // Bulk File Processing States
  const [csvFile, setCsvFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [csvError, setCsvError] = useState('');

  // Finance & Ledger States
  const [financeLedger, setFinanceLedger] = useState([]);
  const [financeLoading, setFinanceLoading] = useState(false);
  const [financeForm, setFinanceForm] = useState({ studentId: '', feeType: 'Tuition Q1', amountDue: '', amountPaid: '' });

  // Library Distribution States
  const [books, setBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(false);
  const [libraryForm, setLibraryForm] = useState({ title: '', author: '', downloadUrl: '' });

  // User Profile States
  const [systemUsers, setSystemUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userForm, setUserForm] = useState({ username: '', email: '', password: '', role: 'Teacher' });
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const getCookieValue = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
        return null;
      };
      const liveCookieRole = getCookieValue('userRole');
      const storedName = localStorage.getItem('username') || 'Administrator';
      if (liveCookieRole) {
        setUserRole(liveCookieRole);
        setCurrentRoleView(liveCookieRole); 
        setActiveTab(liveCookieRole === 'Admin' ? 'director-overview' : 'instructor-roster');
      }
      setUsername(storedName);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'instructor-roster' || activeTab === 'student-transcript') { fetchLiveRosterData(); } 
    else if (activeTab === 'instructor-attendance') { fetchLiveAttendanceRecords(); } 
    else if (activeTab === 'instructor-exams' || activeTab === 'student-exams') { fetchLiveExams(); } 
    else if (activeTab === 'director-finance' || activeTab === 'director-overview') { fetchLiveFinanceLedger(); } 
    else if (activeTab === 'student-library' || activeTab === 'instructor-library') { fetchLiveLibraryBooks(); } 
    else if (activeTab === 'director-users') { fetchSystemUsers(); }
  }, [selectedGrade, activeTab, attendanceDate, currentRoleView]);

  async function fetchLiveRosterData() {
    setStudentsLoading(true);
    try {
      const res = await fetch(`/api/students?grade=${encodeURIComponent(selectedGrade)}`);
      if (!res.ok) { setStudents([]); return; }
      const result = await res.json();
      setStudents(result && result.data ? result.data : []);
    } catch (err) { console.error(err); setStudents([]); } finally { setStudentsLoading(false); }
  }

    async function fetchLiveAttendanceRecords() {
    setAttendanceLoading(true);
    try {
      // Passes the grade parameter cleanly down to populate the primary rows matrix list directly
      const res = await fetch(`/api/attendance?grade=${encodeURIComponent(selectedGrade)}`);
      if (!res.ok) { setAttendanceRecords([]); return; }
      const result = await res.json();
      setAttendanceRecords(result && result.data ? result.data : []);
    } catch (err) { console.error("Attendance synchronization error flag:", err); setAttendanceRecords([]); } finally { setAttendanceLoading(false); }
  }

  async function fetchLiveExams() {
    setExamsLoading(true);
    try {
      const res = await fetch(`/api/exams?grade=${encodeURIComponent(selectedGrade)}`);
      if (!res.ok) { setExams([]); return; }
      const result = await res.json();
      setExams(result && result.exams ? result.exams : []);
    } catch (err) { console.error(err); setExams([]); } finally { setExamsLoading(false); }
  }

  async function fetchLiveFinanceLedger() {
    setFinanceLoading(true);
    try {
      const res = await fetch('/api/finance');
      if (!res.ok) { setFinanceLedger([]); return; }
      const result = await res.json();
      setFinanceLedger(result && result.ledger ? result.ledger : []);
    } catch (err) { console.error(err); setFinanceLedger([]); } finally { setFinanceLoading(false); }
  }

  async function fetchLiveLibraryBooks() {
    setBooksLoading(true);
    try {
      const res = await fetch(`/api/library?grade=${encodeURIComponent(selectedGrade)}`);
      if (!res.ok) { setBooks([]); return; }
      const result = await res.json();
      setBooks(result && result.books ? result.books : []);
    } catch (err) { console.error(err); setBooks([]); } finally { setBooksLoading(false); }
  }

  async function fetchSystemUsers() {
    setUsersLoading(true);
    try {
      const res = await fetch('/api/auth'); 
      if (!res.ok) { setSystemUsers([]); return; }
      const result = await res.json();
      setSystemUsers(result && result.users ? result.users : []);
    } catch (err) { console.error(err); setSystemUsers([]); } finally { setUsersLoading(false); }
  }
  async function handleEnrollmentSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/students', { 
        method: 'POST', headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ studentId: studentForm.studentId, name: studentForm.name, grade: selectedGrade, subject: 'ICT' }) 
      });
      if (res.ok) { alert("Barataan haaraan galmeeffameera!"); setStudentForm({ studentId: '', name: '' }); fetchLiveRosterData(); }
    } catch (err) { console.error(err); }
  }

  async function handleFinanceSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/finance', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(financeForm)
      });
      if (res.ok) { alert("Transaction entry recorded successfully!"); setFinanceForm({ studentId: '', feeType: 'Tuition Q1', amountDue: '', amountPaid: '' }); fetchLiveFinanceLedger(); }
    } catch (err) { console.error(err); }
  }

  async function handleLibrarySubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/library', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: libraryForm.title, author: libraryForm.author, gradeSection: selectedGrade, downloadUrl: libraryForm.downloadUrl })
      });
      if (res.ok) { alert("Textbook resource committed!"); setLibraryForm({ title: '', author: '', downloadUrl: '' }); fetchLiveLibraryBooks(); }
    } catch (err) { console.error(err); }
  }
  async function handleUserCreationSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth', { 
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ username: userForm.username, email: userForm.email, password: userForm.password, role: userForm.role }) 
      });
      const data = await res.json();
      if (res.ok) { alert("Eenyummaa haaraa milkiin banameera!"); setUserForm({ username: '', email: '', password: '', role: 'Teacher' }); fetchSystemUsers(); }
      else { alert("Dogoggora: " + data.error); }
    } catch (err) { console.error(err); }
  }

  async function handleCellUpdateSubmit(studentId, subject, fieldName, newScore) {
    const num = Number(newScore);
    const maxLimits = { test1: 10, test2: 10, assignment: 20, finalExam: 60 };
    if (num > maxLimits[fieldName]) {
      alert(`⚠️ Validation Rejected! Maximum allowed points score benchmark for ${fieldName} is exactly ${maxLimits[fieldName]} marks.`);
      return;
    }
    try {
      await fetch('/api/roster/update-mark', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId, subject, fieldName, score: num }) });
      fetchLiveRosterData();
    } catch (err) { console.error(err); }
  }

  async function handleAttendanceCellChange(studentId, targetStatus) {
    try {
      const res = await fetch('/api/attendance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId, date: attendanceDate, status: targetStatus }) });
      if (res.ok) fetchLiveAttendanceRecords();
    } catch (err) { console.error(err); }
  }

  function addQuestionToFormState() {
    if (!currentQuestion.text || !currentQuestion.a || !currentQuestion.b) return;
    setExamForm({ ...examForm, questions: [...examForm.questions, currentQuestion] });
    setCurrentQuestion({ text: '', a: '', b: '', c: '', d: '', correct: 'A' });
  }

  async function handleExamPublishSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/exams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: examForm.title, gradeSection: selectedGrade, subject: examForm.subject, questions: examForm.questions }) });
      if (res.ok) { alert("Exam structure deployed!"); setExamForm({ title: '', subject: 'ICT', questions: [] }); fetchLiveExams(); }
    } catch (err) { console.error(err); }
  }
  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!csvFile || !csvFile[0]) { setCsvError('Please select a valid file first.'); return; }
    setUploading(true); setCsvError('');

    const file = csvFile[0];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    let rawText = "";

    try {
      if (fileExtension === 'docx') {
        const mammoth = await import('mammoth');
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
        rawText = result.value;
      }       else if (fileExtension === 'pdf') {
        const pdfjsLib = await import('pdfjs-dist');
        const arrayBuffer = await file.arrayBuffer();
        
        // Configured with standard parameters to disable external worker fetching safely
        const loadingTask = pdfjsLib.getDocument({ 
          data: arrayBuffer,
          useWorkerFetch: false,
          isEvalSupported: false
        });
        
        const pdf = await loadingTask.promise;
        let textContent = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const text = await page.getTextContent();
          textContent += text.items.map(s => s.str).join(' ') + '\n';
        }
        rawText = textContent;
      } 


      else {
        const reader = new FileReader();
        rawText = await new Promise((resolve) => {
          reader.onload = (event) => resolve(event.target.result);
          reader.readAsText(file);
        });
      }

      processDocumentText(rawText);

    } catch (err) {
      console.error(err);
      setCsvError('Error extracting text: ' + err.message);
      setUploading(false);
    }
  };

  const processDocumentText = async (text) => {
    try {
      const lines = text.split('\n');
      const parsedQuestions = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.toLowerCase().includes('question_text')) continue;
        const columns = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (columns.length >= 6) {
          const cleanStr = (str) => (str || '').replace(/^"|"$/g, '').trim();
          parsedQuestions.push({
            text: cleanStr(columns[0]), a: cleanStr(columns[1]), b: cleanStr(columns[2]),
            c: cleanStr(columns[3]), d: cleanStr(columns[4]), correct: cleanStr(columns[5]).toUpperCase()
          });
        }
      }
      if (parsedQuestions.length === 0) { throw new Error('No valid questions parsed.'); }
      const res = await fetch('/api/exams', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `Bulk Upload - ${new Date().toLocaleDateString()}`, gradeSection: selectedGrade, subject: 'ICT', questions: parsedQuestions })
      });
      if (res.ok) { alert('Bulk exam deployed successfully!'); setCsvFile(null); fetchLiveExams(); } 
      else { const data = await res.json(); throw new Error(data.error || 'Failed to submit.'); }
    } catch (err) { setCsvError(err.message || 'Error processing layout.'); } finally { setUploading(false); }
  };
  function triggerFinanceCSVExport() {
    if (!financeLedger || financeLedger.length === 0) return alert("No active logs.");
    let csv = "data:text/csv;charset=utf-8,Student ID,Full Name,Category,Due,Paid,Status\n";
    financeLedger.forEach(r => { csv += `${r.studentId},${r.name ? r.name.replace(/,/g, " ") : "Student"},${r.fee_type},${r.amount_due},${r.amount_paid},${r.payment_status}\n`; });
    const encodedUri = encodeURI(csv);
    const a = document.createElement("a"); a.setAttribute("href", encodedUri); a.setAttribute("download", "sheek_bakri_revenue_ledger.csv");
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }

  function triggerStudentReportCardPrint(student) {
    const pWin = window.open('', '_blank');
    if (pWin) {
      pWin.document.write(`
        <html>
          <head><title>Certificate - \${student.name}</title></head>
          <body style="font-family:monospace;padding:30px;border:5px double #1e3a8a;">
            <h2>SHEEK BAKRI SECONDARY SCHOOL</h2>
            <h3>Official Performance Certificate</h3>
            <p><strong>Student:</strong> \${student.name} (\${student.studentId})</p>
            <p><strong>Grade:</strong> \${selectedGrade}</p>
            <hr/>
            <p>Test 1: \${student.test1 || 0} / 10</p>
            <p>Test 2: \${student.test2 || 0} / 10</p>
            <p>Assignment: \${student.assignment || 0} / 20</p>
            <p>Final Exam: \${student.finalExam || 0} / 60</p>
            <h4>Total Score: \${student.totalScore || 0} / 100</h4>
          </body>
        </html>
      `);
      pWin.document.close(); pWin.print();
    }
  }

  function handleLogoutSequence() {
    localStorage.clear();
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = '/login';
  }
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-6">
      <header className="max-w-6xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-700 pb-4 gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">SHEK BAKRI SECONDARY SCHOOL PORTAL</h1>
          <p className="text-[10px] text-yellow-500 font-mono uppercase tracking-widest">BAGA NAGAAN DHUFTAN // WELCOME: {username}</p>
        </div>
        <div className="flex flex-wrap items-center bg-[#1e293b] border border-slate-700 rounded-lg p-1 text-[11px] font-mono gap-1">
          {userRole && userRole.toUpperCase() === 'ADMIN' && (
            <button onClick={() => { setCurrentRoleView('Director'); setActiveTab('director-overview'); }} className={`px-2.5 py-1 rounded font-bold ${currentRoleView === 'Director' ? 'bg-purple-600 text-white shadow' : 'text-slate-400'}`}>👨‍💼 Daayirektara</button>
          )}
          {(userRole && (userRole.toUpperCase() === 'TEACHER' || userRole.toUpperCase() === 'ADMIN')) && (
            <button onClick={() => { setCurrentRoleView('Instructor'); setActiveTab('instructor-roster'); }} className={`px-2.5 py-1 rounded font-bold ${currentRoleView === 'Instructor' ? 'bg-blue-600 text-white shadow' : 'text-slate-400'}`}>👩‍🏫 Barsiisaa</button>
          )}
          <button onClick={() => { setCurrentRoleView('Student'); setActiveTab('student-transcript'); }} className={`px-2.5 py-1 rounded font-bold ${currentRoleView === 'Student' ? 'bg-amber-600 text-black shadow' : 'text-slate-400'}`}>🎒 Barataa</button>
          <button onClick={handleLogoutSequence} className="ml-2 bg-red-950/40 text-red-400 text-[10px] px-2 py-1 rounded">Ba’i</button>
        </div>
      </header>

      <nav className="max-w-6xl mx-auto mb-6 flex flex-wrap bg-[#1e293b] p-1 rounded-lg border border-slate-700 text-xs font-mono gap-1">
        {currentRoleView === 'Director' && (
          <>
            <button onClick={() => setActiveTab('director-overview')} className={`flex-1 py-2 rounded font-bold ${activeTab === 'director-overview' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>📊 Fayyaalessa Hojii</button>
            <button onClick={() => setActiveTab('director-finance')} className={`flex-1 py-2 rounded font-bold ${activeTab === 'director-finance' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>💳 Galmee Galii</button>
            <button onClick={() => setActiveTab('director-users')} className={`flex-1 py-2 rounded font-bold ${activeTab === 'director-users' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>🔒 Galmee Barsiisotaa</button>
          </>
        )}
        {currentRoleView === 'Instructor' && (
          <>
            <button onClick={() => setActiveTab('instructor-roster')} className={`flex-1 py-2 rounded font-bold ${activeTab === 'instructor-roster' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>📝 Kuusaa Qabxii</button>
            <button onClick={() => setActiveTab('instructor-attendance')} className={`flex-1 py-2 rounded font-bold ${activeTab === 'instructor-attendance' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>📅 Hordoffii Hirmaannaa</button>
            <button onClick={() => setActiveTab('instructor-exams')} className={`flex-1 py-2 rounded font-bold ${activeTab === 'instructor-exams' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>📝 Qormaata Baasuu</button>
            <button onClick={() => setActiveTab('instructor-library')} className={`flex-1 py-2 rounded font-bold ${activeTab === 'instructor-library' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>📚 Kuusaa Kitaabaa</button>
          </>
        )}
        {currentRoleView === 'Student' && (
          <>
            <button onClick={() => setActiveTab('student-transcript')} className={`flex-1 py-2 rounded font-bold ${activeTab === 'student-transcript' ? 'bg-amber-600 text-black' : 'text-slate-400'}`}>🎓 Teessoo Qabxii Koo</button>
            <button onClick={() => setActiveTab('student-exams')} className={`flex-1 py-2 rounded font-bold ${activeTab === 'student-exams' ? 'bg-amber-600 text-black' : 'text-slate-400'}`}>📝 Wiirtuu Qormaataa</button>
            <button onClick={() => setActiveTab('student-library')} className={`flex-1 py-2 rounded font-bold ${activeTab === 'student-library' ? 'bg-amber-600 text-black' : 'text-slate-400'}`}>📚 Kitaabbati Dijitaalaa</button>
          </>
        )}
      </nav>
      <main className="max-w-6xl mx-auto">
        {activeTab === 'director-overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-700">Waliigala Gali: <strong className="text-emerald-400">ETB {financeLedger.reduce((acc, curr) => acc + Number(curr.amount_paid || 0), 0)}</strong></div>
            <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-700">Giddu-galeessa Qabxii ICT: <strong className="text-blue-400">78.4%</strong></div>
            <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-700">Reetii Darbiinsa: <strong className="text-amber-400">92.1%</strong></div>
          </div>
        )}

        {activeTab === 'director-finance' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs font-mono">
            <section className="bg-[#1e293b] p-4 rounded-lg border border-slate-800 space-y-2">
              <h2 className="font-bold border-b border-slate-700 pb-1 text-white">Kaffaltii Galmeessi</h2>
              <form onSubmit={handleFinanceSubmit} className="space-y-2">
                <input type="text" placeholder="ID Barataa" value={financeForm.studentId} onChange={e => setFinanceForm({...financeForm, studentId: e.target.value})} className="w-full bg-[#0f172a] p-2 rounded text-white outline-none" required />
                <input type="number" placeholder="Idaa" value={financeForm.amountDue} onChange={e => setFinanceForm({...financeForm, amountDue: e.target.value})} className="w-full bg-[#0f172a] p-2 rounded text-white outline-none" required />
                <input type="number" placeholder="Kaffalame" value={financeForm.amountPaid} onChange={e => setFinanceForm({...financeForm, amountPaid: e.target.value})} className="w-full bg-[#0f172a] p-2 rounded text-white outline-none" required />
                <button type="submit" className="w-full bg-purple-600 p-2 font-bold rounded uppercase">Commit Dues</button>
              </form>
            </section>
            <section className="lg:col-span-2 bg-[#1e293b] p-4 rounded-lg border border-slate-800">
              <h3 className="font-bold text-slate-200 mb-2">Galmee Herregaa Waliigalaa</h3>
              <table className="w-full text-left">
                <thead><tr className="text-slate-400 text-[10px]"><th>ID</th><th>Maqaa</th><th>Idaa</th><th>Kaffalame</th></tr></thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {financeLedger.map((f, idx) => (<tr key={idx}><td className="py-2 text-purple-400 font-bold">{f.studentId}</td><td>{f.name}</td><td>{f.amount_due}</td><td>{f.amount_paid}</td></tr>))}
                </tbody>
              </table>
            </section>
          </div>
        )}
        {activeTab === 'director-users' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs font-mono">
            <section className="bg-[#1e293b] p-4 rounded-lg border border-slate-800 space-y-2">
              <h2 className="font-bold border-b border-slate-700 pb-1 text-white">Eenyummaa Haaraa</h2>
              <form onSubmit={handleUserCreationSubmit} className="space-y-2">
                <input type="text" placeholder="Maqaa" value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} className="w-full bg-[#0f172a] p-2 rounded text-white outline-none" required />
                <input type="email" placeholder="Imeelii" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="w-full bg-[#0f172a] p-2 rounded text-white outline-none" required />
                <input type="password" placeholder="Jecha Iccitii" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="w-full bg-[#0f172a] p-2 rounded text-white outline-none" required />
                <button type="submit" className="w-full bg-purple-600 p-2 font-bold rounded uppercase">Galmeessi</button>
              </form>
            </section>
            <section className="lg:col-span-2 bg-[#1e293b] p-4 rounded-lg border border-slate-800">
              <h3 className="font-bold text-slate-200 mb-2">Galmee Hojjattootaa</h3>
              {systemUsers.map((user, idx) => (<div key={idx} className="py-1">{user.username} - {user.email}</div>))}
            </section>
          </div>
        )}

        {activeTab === 'instructor-roster' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs font-mono">
            <section className="bg-[#1e293b] p-4 rounded-lg border border-slate-700 space-y-2">
              <h2 className="font-bold border-b border-slate-700 pb-1 text-slate-100">Barataa Galmeessi</h2>
              <form onSubmit={handleEnrollmentSubmit} className="space-y-2">
                <input type="text" placeholder="ID Barataa" value={studentForm.studentId} onChange={e => setStudentForm({...studentForm, studentId: e.target.value})} className="w-full bg-[#0f172a] p-2 rounded text-white outline-none" required />
                <input type="text" placeholder="Maqaa Guutuu" value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} className="w-full bg-[#0f172a] p-2 rounded text-white outline-none" required />
                <button type="submit" className="w-full bg-blue-600 p-2 text-white font-bold rounded uppercase">Kuusi Galmeessi</button>
              </form>
            </section>
            <section className="lg:col-span-2 bg-[#1e293b] p-4 rounded-lg border border-slate-700 overflow-x-auto">
              <h3 className="font-bold text-slate-200 mb-2">Galmee Qabxii Barattootaa ({selectedGrade})</h3>
              <table className="w-full text-left">
                <thead><tr className="text-slate-400 text-[10px]"><th>ID</th><th>Maqaa</th><th>T1</th><th>T2</th><th>Asg</th><th>Final</th><th>Total</th><th>Cert</th></tr></thead>
                <tbody className="divide-y divide-slate-700 text-slate-300">
                  {students.map((s, idx) => (
                    <tr key={idx}>
                      <td className="py-2 text-blue-400 font-bold">{s.studentId}</td><td>{s.name}</td>
                      <td><input type="number" defaultValue={s.test1} onBlur={e => handleCellUpdateSubmit(s.studentId, 'ICT', 'test1', e.target.value)} className="w-10 bg-[#0f172a] text-center rounded border border-slate-700" /></td>
                      <td><input type="number" defaultValue={s.test2} onBlur={e => handleCellUpdateSubmit(s.studentId, 'ICT', 'test2', e.target.value)} className="w-10 bg-[#0f172a] text-center rounded border border-slate-700" /></td>
                      <td><input type="number" defaultValue={s.assignment} onBlur={e => handleCellUpdateSubmit(s.studentId, 'ICT', 'assignment', e.target.value)} className="w-10 bg-[#0f172a] text-center rounded border border-slate-700" /></td>
                      <td><input type="number" defaultValue={s.finalExam} onBlur={e => handleCellUpdateSubmit(s.studentId, 'ICT', 'finalExam', e.target.value)} className="w-10 bg-[#0f172a] text-center rounded border border-slate-700" /></td>
                      <td className="font-black text-emerald-400 text-center">{s.totalScore || 0}</td>
                      <td><button onClick={() => triggerStudentReportCardPrint(s)} className="bg-slate-700 text-amber-400 px-1 py-0.5 rounded text-[10px]">🖨️ Cert</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        )}
                {activeTab === 'instructor-attendance' && (
          <section className="bg-[#1e293b] p-4 rounded-lg border border-slate-800 text-xs font-mono w-full shadow-xl">
            {/* CARD TOOLBAR CONTAINER BAR */}
            <div className="flex justify-between items-center border-b border-slate-700 pb-3 mb-4">
              <div>
                <h3 className="font-bold uppercase text-slate-200 text-xs tracking-wide">Daily Attendance Matrix</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Hordoffii hirmaannaa barattoota guyyaa har&apos;aa galmeessi.</p>
              </div>
              <div className="flex gap-2 text-white">
                {/* GRADE SELECTOR PICKER DROP-DOWN PANEL ADDED RIGHT HERE */}
                <select 
                  value={selectedGrade} 
                  onChange={(e) => setSelectedGrade(e.target.value)} 
                  className="bg-[#0f172a] border border-slate-700 p-1.5 rounded text-xs text-white outline-none focus:border-blue-500 font-bold"
                >
                  <option value="12 Natural">12 Natural</option>
                  <option value="12 Social">12 Social</option>
                </select>
                <input 
                  type="date" 
                  value={attendanceDate} 
                  onChange={(e) => setAttendanceDate(e.target.value)} 
                  className="bg-[#0f172a] border border-slate-700 p-1.5 rounded text-xs text-white outline-none font-bold" 
                />
              </div>
            </div>

            {/* CONDITIONAL RENDER AREA CONTAINER FOR SYSTEM RECORDS */}
            {attendanceRecords && attendanceRecords.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider">
                      <th className="pb-2">ID Barataa</th>
                      <th>Maqaa Guutuu</th>
                      <th>Kilaasii</th>
                      <th className="text-right">Hordoffii Galmee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {attendanceRecords.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-2.5 text-blue-400 font-bold">{s.studentId}</td>
                        <td className="font-semibold text-slate-200">{s.name}</td>
                        <td className="text-slate-400 text-[11px]">{s.grade}</td>
                        <td className="text-right">
                          <select 
                            value={s.status || 'Not Marked'} 
                            onChange={(e) => handleAttendanceCellChange(s.studentId, e.target.value)} 
                            className={`bg-[#0f172a] border rounded p-1 text-[11px] font-bold outline-none cursor-pointer transition-all ${
                              s.status === 'Present' ? 'border-emerald-800 text-emerald-400 bg-emerald-950/20' : 
                              s.status === 'Absent' ? 'border-red-800 text-red-400 bg-red-950/20' : 
                              'border-slate-700 text-slate-400'
                            }`}
                          >
                            <option value="Not Marked">Not Marked</option>
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 border border-dashed border-slate-800 rounded-lg">
                // Hin jiran: No student records found registered inside database for track section &apos;{selectedGrade}&apos;.
              </div>
            )}
          </section>
        )}


        {activeTab === 'instructor-exams' && (
          <div className="space-y-6 font-mono text-xs w-full">
            <div className="flex gap-2 border-b border-slate-700 pb-2">
              <button onClick={() => setExamUploadMode('manual')} className={`px-2 py-1 rounded font-bold uppercase ${examUploadMode === 'manual' ? 'bg-blue-600 text-white' : 'bg-[#1e293b] text-slate-400'}`}>📝 Single Manual Setup</button>
              <button onClick={() => setExamUploadMode('bulk')} className={`px-2 py-1 rounded font-bold uppercase ${examUploadMode === 'bulk' ? 'bg-purple-600 text-white' : 'bg-[#1e293b] text-slate-400'}`}>📥 Bulk Documents Upload</button>
            </div>

            {examUploadMode === 'bulk' ? (
              <div className="max-w-xl mx-auto bg-[#1e293b] border border-slate-800 rounded-xl p-6 shadow-xl text-white">
                <h3 className="text-sm font-bold text-purple-400 mb-2">📥 Document Processor Protocol</h3>
                <p className="text-[10px] text-slate-400 mb-4">Supported File Types: .csv, .pdf, .docx</p>
                <form onSubmit={handleBulkSubmit} className="space-y-4">
                  <input type="file" accept=".csv, .pdf, .docx" onChange={(e) => { if (e.target.files && e.target.files) { setCsvFile(e.target.files); setCsvError(''); } }} className="w-full bg-[#141b2d] border border-slate-800 rounded p-2 text-xs" />
                  {csvError && <div className="text-red-400 text-xs font-bold">⚠️ {csvError}</div>}
                  <button type="submit" disabled={uploading} className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded font-bold uppercase">{uploading ? 'Processing Architecture...' : 'Initialize Bulk Upload Pipeline 🚀'}</button>
                </form>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <section className="bg-[#1e293b] p-4 rounded-lg border border-slate-800 space-y-2">
                  <h2 className="font-bold border-b border-slate-700 pb-1 text-white">Deploy Examination</h2>
                  <form onSubmit={handleExamPublishSubmit} className="space-y-2">
                    <input type="text" placeholder="Exam Title" value={examForm.title} onChange={e => setExamForm({...examForm, title: e.target.value})} className="w-full bg-[#0f172a] p-2 rounded text-white outline-none" required />
                    <div className="bg-[#0f172a] p-2 rounded space-y-2">
                      <textarea placeholder="Question Text" value={currentQuestion.text} onChange={e => setCurrentQuestion({...currentQuestion, text: e.target.value})} className="w-full bg-[#1e293b] p-1.5 rounded h-12 text-white outline-none"></textarea>
                      <input type="text" placeholder="Option A" value={currentQuestion.a} onChange={e => setCurrentQuestion({...currentQuestion, a: e.target.value})} className="w-full bg-[#1e293b] p-1 rounded text-white outline-none" required />
                      <input type="text" placeholder="Option B" value={currentQuestion.b} onChange={e => setCurrentQuestion({...currentQuestion, b: e.target.value})} className="w-full bg-[#1e293b] p-1 rounded text-white outline-none" required />
                      <input type="text" placeholder="Option C" value={currentQuestion.c || ''} onChange={e => setCurrentQuestion({...currentQuestion, c: e.target.value})} className="w-full bg-[#1e293b] p-1 rounded text-white outline-none" />
                      <input type="text" placeholder="Option D" value={currentQuestion.d || ''} onChange={e => setCurrentQuestion({...currentQuestion, d: e.target.value})} className="w-full bg-[#1e293b] p-1 rounded text-white outline-none" />
                      <select value={currentQuestion.correct} onChange={e => setCurrentQuestion({...currentQuestion, correct: e.target.value})} className="w-full bg-[#1e293b] p-1 rounded text-white outline-none"><option value="A">Key: A</option><option value="B">Key: B</option><option value="C">Key: C</option><option value="D">Key: D</option></select>
                      <button type="button" onClick={addQuestionToFormState} className="w-full py-1 bg-slate-800 text-amber-400 font-bold border border-slate-700 rounded text-[10px]">SAVE ENTRY ({examForm.questions.length})</button>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 p-2 text-white font-bold rounded uppercase">Publish Manual Quiz</button>
                  </form>
                </section>
                <section className="lg:col-span-2 bg-[#1e293b] p-4 rounded-lg border border-slate-800">
                  <h3 className="font-bold border-b border-slate-800 pb-1 mb-2 text-slate-200">Active Testing Matrix</h3>
                  {exams.map((ex, idx) => (<div key={idx} className="p-2 mb-1 bg-[#0f172a] rounded flex justify-between"><span>{ex.title}</span><span className="text-emerald-400">Live</span></div>))}
                </section>
              </div>
            )}
          </div>
        )}
        {activeTab === 'instructor-library' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs font-mono">
            <section className="bg-[#1e293b] p-4 rounded-lg border border-slate-800 space-y-2">
              <h2 className="font-bold border-b border-slate-700 pb-1 text-white">Catalog Textbook</h2>
              <form onSubmit={handleLibrarySubmit} className="space-y-2">
                <input type="text" placeholder="Resource Title" value={libraryForm.title} onChange={e => setLibraryForm({...libraryForm, title: e.target.value})} className="w-full bg-[#0f172a] p-2 rounded text-white outline-none" required />
                <input type="text" placeholder="Author" value={libraryForm.author} onChange={e => setLibraryForm({...libraryForm, author: e.target.value})} className="w-full bg-[#0f172a] p-2 rounded text-white outline-none" required />
                <input type="text" placeholder="Link Download URL" value={libraryForm.downloadUrl} onChange={e => setLibraryForm({...libraryForm, downloadUrl: e.target.value})} className="w-full bg-[#0f172a] p-2 rounded text-white outline-none" required />
                <button type="submit" className="w-full bg-blue-600 p-2 text-white font-bold rounded uppercase">Commit Asset</button>
              </form>
            </section>
            <section className="lg:col-span-2 bg-[#1e293b] p-4 rounded-lg border border-slate-800">
              <h3 className="font-bold border-b border-slate-800 pb-1 mb-2 text-slate-200">Library Records</h3>
              {books.map((b, idx) => (<div key={idx} className="p-1">{b.title} ({b.author})</div>))}
            </section>
          </div>
        )}

        {activeTab === 'student-transcript' && (
          <section className="bg-[#1e293b] p-5 rounded-xl border border-slate-800 font-mono text-xs max-w-3xl mx-auto">
            <h3 className="text-sm font-bold text-white mb-3">Academic Registry Card</h3>
            {students.map((s, idx) => (<div key={idx} className="py-1">{s.name} - Total Score: <strong className="text-emerald-400">{s.totalScore || 0} / 100</strong></div>))}
          </section>
        )}

        {activeTab === 'student-exams' && (
          <section className="bg-[#1e293b] p-4 rounded-lg border border-slate-800 max-w-xl mx-auto font-mono text-xs text-center">
            <h3 className="font-bold text-slate-200 mb-2">Student Testing Center</h3>
            <p className="text-slate-500">// Quizzes will be displayed here using relational ID queries.</p>
          </section>
        )}

        {activeTab === 'student-library' && (
          <section className="bg-[#1e293b] p-4 rounded-lg border border-slate-800 max-w-2xl mx-auto font-mono text-xs">
            <h3 className="font-bold text-slate-200 mb-2">Digital Textbook Index</h3>
            {books.map((b, idx) => (<div key={idx} className="py-1 flex justify-between"><span>{b.title}</span><a href={b.download_url} target="_blank" className="text-amber-400 underline">Download 📥</a></div>))}
          </section>
        )}
      </main>

      {/* FLOATING AI CHAT LOGGER BOX */}
      <div className="fixed bottom-6 right-6 z-50 font-mono text-xs bg-[#1e293b] border border-slate-800 p-3 rounded-xl w-64 shadow-2xl">
        <div className="font-bold text-emerald-400 border-b border-slate-700 pb-1 mb-2">● Gargaaraa AI Dijitaalaa</div>
        <div className="h-20 bg-[#0f172a] rounded p-1.5 overflow-y-auto text-slate-300 text-[11px]" id="aiLog">
          Akkam! Mana barumsaa keessan irratti har&apos;a maal si gargaaruu danda&apos;a?
        </div>
        <input 
          type="text" 
          placeholder="Gaaffii kee asitti barreessi..." 
          onKeyDown={async (e) => { 
            if (e.key === 'Enter' && e.target.value.trim()) { 
              const val = e.target.value; 
              e.target.value = ''; 
              const log = document.getElementById('aiLog'); 
              if (log) log.innerHTML += '<br/><span class="text-blue-400">Isin:</span> ' + val; 
              try {
                const res = await fetch('/api/ai-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: val, userRole: 'Admin' }) }); 
                const d = await res.json(); 
                if (log) log.innerHTML += '<br/><span class="text-emerald-400">AI:</span> ' + (d.reply || 'Processing Error'); 
              } catch (err) {
                if (log) log.innerHTML += '<br/><span class="text-red-400">AI Error</span>';
              }
              if (log) log.scrollTop = log.scrollHeight; 
            } 
          }} 
          className="w-full bg-[#0f172a] border border-slate-800 rounded mt-2 p-1 text-[11px] text-white" 
        />
      </div>
    </div>
  );
}
