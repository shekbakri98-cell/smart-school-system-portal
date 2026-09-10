'use client';
import { useEffect, useState } from 'react';
import BulkExamUpload from '@/components/BulkExamUpload'; 

export default function Dashboard() {
  // --- MODULE 1: GLOBAL CONSOLE NAVIGATION STATES ---
  const [currentRoleView, setCurrentRoleView] = useState('Director'); // Options: 'Director', 'Instructor', 'Student'
  const [activeTab, setActiveTab] = useState('director-overview'); 
  const [examUploadMode, setExamUploadMode] = useState('manual'); // Options: 'manual', 'bulk'
  const [userRole, setUserRole] = useState('Admin'); 
  const [username, setUsername] = useState('Admin User');

  // --- MODULE 2: ADVANCED 14-FIELD STUDENT FORM STATES ---
  const [selectedGrade, setSelectedGrade] = useState('12 Natural');
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentForm, setStudentForm] = useState({
    studentId: '', name: '',
    barataa_id: '', maqaa: '', maqaa_abbaa: '', maqaa_akaaka: '', saala: 'Dhiira',
    umrii: '', bilbila_wabii: '', kutaa: '12 Natural', sadarkaa_kutaa: 'A',
    bara_galmee: '2019', aradaa: '', ganda: '', bilbila_barataa: '', fan_fayda_aliansn: ''
  });

  // --- MODULE 3: TESTING MATRIX STATES & QUIZ MODAL ---
  const [exams, setExams] = useState([]);
  const [examsLoading, setExamsLoading] = useState(false);
  const [examForm, setExamForm] = useState({ title: '', subject: 'ICT', questions: [] });
  const [currentQuestion, setCurrentQuestion] = useState({ text: '', a: '', b: '', c: '', d: '', correct: 'A' });
  const [activeQuizExam, setActiveQuizExam] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [studentAnswers, setStudentAnswers] = useState({});
  const [studentExId, setStudentExId] = useState('');

  // --- MODULE 4: DIGITAL LIBRARY & REPOSITORY STATES ---
  const [books, setBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(false);
  const [libraryForm, setLibraryForm] = useState({ title: '', author: '', downloadUrl: '' });

  // --- MODULE 5: ATTENDANCE & AUXILIARY FINANCE STATES ---
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [financeLedger, setFinanceLedger] = useState([]);
  const [financeLoading, setFinanceLoading] = useState(false);
  const [financeForm, setFinanceForm] = useState({ studentId: '', feeType: 'Tuition Q1', amountDue: '', amountPaid: '' });

  // --- MODULE 6: USER IDENTITY AND CREDENTIAL STATES ---
  const [systemUsers, setSystemUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userForm, setUserForm] = useState({ username: '', email: '', password: '', role: 'Teacher' });

  // --- HOOK 1: SAFE COOKIELESS SESSION INITIALIZER ---
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

  // --- HOOK 2: PROTECTED CONCURRENCY TUNNEL SWITCH ---
  useEffect(() => {
    if (activeTab === 'instructor-roster' || activeTab === 'student-transcript') { fetchLiveRosterData(); } 
    else if (activeTab === 'instructor-attendance') { fetchLiveAttendanceRecords(); } 
    else if (activeTab === 'instructor-exams' || activeTab === 'student-exams') { fetchLiveExams(); } 
    else if (activeTab === 'director-finance' || activeTab === 'director-overview') { fetchLiveFinanceLedger(); } 
    else if (activeTab === 'student-library' || activeTab === 'instructor-library') { fetchLiveLibraryBooks(); } 
    else if (activeTab === 'director-users') { fetchSystemUsers(); }
  }, [selectedGrade, activeTab, attendanceDate, currentRoleView]);

  // --- REST API NETWORK PIPELINE FETCH HANDLERS ---
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
      const res = await fetch(`/api/attendance?grade=${encodeURIComponent(selectedGrade)}&date=${attendanceDate}`);
      if (!res.ok) { setAttendanceRecords([]); return; }
      const result = await res.json();
      setAttendanceRecords(result && result.data ? result.data : []);
    } catch (err) { console.error(err); setAttendanceRecords([]); } finally { setAttendanceLoading(false); }
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

  // --- SUBMISSION EVENT DATABASE HANDLERS ---
  async function handleEnrollmentSubmit(e) {
    e.preventDefault();
    const payload = {
      ...studentForm,
      studentId: studentForm.studentId || studentForm.barataa_id,
      name: studentForm.name || `${studentForm.maqaa} ${studentForm.maqaa_abbaa}`.trim(),
      grade: selectedGrade,
      subject: 'ICT'
    };
    try {
      const res = await fetch('/api/students', { 
        method: 'POST', headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      });
      if (res.ok) { 
        alert("Barataan haaraan galmeeffameera!"); 
        setStudentForm({ 
          studentId: '', name: '', barataa_id: '', maqaa: '', maqaa_abbaa: '', maqaa_akaaka: '', saala: 'Dhiira',
          umrii: '', bilbila_wabii: '', kutaa: selectedGrade, sadarkaa_kutaa: 'A',
          bara_galmee: '2019', aradaa: '', ganda: '', bilbila_barataa: '', fan_fayda_aliansn: '' 
        }); 
        fetchLiveRosterData(); 
      }
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
        body: JSON.stringify(userForm) 
      });
      const data = await res.json();
      if (res.ok) { 
        alert("Eenyummaa haaraa milkiin banameera!"); 
        setUserForm({ username: '', email: '', password: '', role: 'Teacher' }); 
        fetchSystemUsers(); 
      } else { alert("Dogoggora: " + data.error); }
    } catch (err) { console.error("Fashalaayeera:", err); }
  }

  async function handleCellUpdateSubmit(studentId, subject, fieldName, newScore) {
    const num = Number(newScore);
    const maxLimits = { test1: 10, test2: 10, assignment: 20, finalExam: 60 };
    if (num > maxLimits[fieldName]) {
      alert(`⚠️ Validation Rejected! Maximum allowed points score benchmark for \${fieldName} is exactly \${maxLimits[fieldName]} marks.`);
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

  function triggerFinanceCSVExport() {
    if (!financeLedger || financeLedger.length === 0) return alert("No active logs.");
    let csv = "data:text/csv;charset=utf-8,Student ID,Full Name,Category,Due,Paid,Status\n";
    financeLedger.forEach(r => { 
      csv += `\${r.studentId},\${r.name ? r.name.replace(/,/g, " ") : "Student"},\${r.fee_type},\${r.amount_due},\${r.amount_paid},\${r.payment_status}\n`; 
    });
    const encodedUri = encodeURI(csv);
    const a = document.createElement("a"); 
    a.setAttribute("href", encodedUri); a.setAttribute("download", "sheek_bakri_revenue_ledger.csv");
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }

  if (typeof window !== 'undefined') {
    window.triggerStudentReportCardPrint = function triggerStudentReportCardPrint(student) {
      const pWin = window.open('', '_blank');
      pWin.document.write(`
        <html>
          <head>
            <title>Certificate - \${student.name}</title>
            <style>
              body { font-family: 'Share Tech Mono', monospace; padding: 20px; background: #fafafa; color: #1e293b; }
              .cert-border { border: 6px double #1e3a8a; padding: 30px; background: #ffffff; max-width: 800px; margin: auto; }
              .header-block { font-family: 'Cinzel', serif; font-size: 24px; color: #1e3a8a; text-align: center; }
              .sub-title { font-size: 13px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px; text-align: center; text-transform: uppercase; font-weight: bold; color: #475569; }
              .meta-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 15px; margin: 20px 0; background: #f8fafc; padding: 15px; border-radius: 6px; font-size: 13px; }
              .tbl { width: 100%; border-collapse: collapse; margin: 20px 0; }
              .tbl th { background: #1e3a8a; color: #ffffff; padding: 8px; font-size: 11px; text-transform: uppercase; }
              .tbl td { border: 1px solid #cbd5e1; padding: 8px; }
              .total-row { font-weight: bold; background: #f1f5f9; }
              .sig-area { display: flex; justify-content: space-between; margin-top: 50px; font-size: 11px; }
              .sig-line { border-top: 1px solid #475569; width: 200px; text-align: center; padding-top: 4px; }
            </style>
          </head>
          <body>
            <div class="cert-border">
              <div class="header-block">SHEEK BAKRI SECONDARY SCHOOL</div>
              <div class="sub-title">Official Student Performance Certificate</div>
              <div class="meta-grid">
                <div><strong>Student Name:</strong> \${student.name || `\${student.maqaa} \${student.maqaa_abbaa}`}</div>
                <div><strong>Student ID:</strong> \${student.studentId || student.barataa_id}</div>
                <div><strong>Grade Track:</strong> \${selectedGrade}</div>
                <div><strong>Subject:</strong> \${student.subject || 'ICT'}</div>
              </div>
              <table class="tbl">
                <thead><tr><th>Assessment Component</th><th>Limit</th><th>Score Achieved</th></tr></thead>
                <tbody>
                  <tr><td>Continuous Assessment Test 1</td><td>10 Marks</td><td>\${student.test1 || 0}</td></tr>
                  <tr><td>Continuous Assessment Test 2</td><td>10 Marks</td><td>\${student.test2 || 0}</td></tr>
                  <tr><td>Practical Lab Assignment Work</td><td>20 Marks</td><td>\${student.assignment || 0}</td></tr>
                  <tr><td>Final Comprehensive Examination</td><td>60 Marks</td><td>\${student.finalExam || 0}</td></tr>
                  <tr class="total-row"><td>Cumulative Achievement Scale</td><td>100 Marks</td><td>\${student.totalScore || 0} / 100</td></tr>
                </tbody>
              </table>
            </div>
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
    <div className="p-6 bg-slate-900 min-h-screen text-slate-100 selection:bg-purple-500 selection:text-white font-sans">
      <header className="mb-6 flex justify-between items-center border-b border-slate-800 pb-4 flex-col md:flex-row gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-cyan-400">Mana Barnoota Sheek Bakrii Saphaloo Sad.2ffaa</h1>
          <p className="text-xs text-slate-400">Logged in as: <span className="text-white font-bold">{username} ({userRole})</span></p>
        </div>
        <div className="flex gap-3">
          <select value={currentRoleView} onChange={(e) => { setCurrentRoleView(e.target.value); setActiveTab(e.target.value === 'Director' ? 'director-overview' : e.target.value === 'Instructor' ? 'instructor-roster' : 'student-transcript'); }} className="bg-slate-800 border border-slate-700 text-xs px-4 py-2 rounded-xl text-white outline-none cursor-pointer">
            <option value="Director">⚙️ View: Director (Admin)</option>
            <option value="Instructor">👨‍🏫 View: Instructor</option>
            <option value="Student">🎓 View: Student</option>
          </select>
          <button onClick={handleLogoutSequence} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-xs font-bold uppercase transition-all">Logout</button>
        </div>
      </header>

      <nav className="flex flex-wrap gap-2 mb-6 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
        {currentRoleView === 'Director' && (
          <>
            <button onClick={() => setActiveTab('director-overview')} className={`flex-1 py-2 rounded font-bold uppercase text-center text-xs \${activeTab === 'director-overview' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>📊 Fayyaalessa Hojii</button>
            <button onClick={() => setActiveTab('director-finance')} className={`flex-1 py-2 rounded font-bold uppercase text-center text-xs \${activeTab === 'director-finance' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>💳 Galmee Galii</button>
            <button onClick={() => setActiveTab('director-users')} className={`flex-1 py-2 rounded font-bold uppercase text-center text-xs \${activeTab === 'director-users' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>🔒 Galmee Barsiisotaa</button>
          </>
        )}
        {currentRoleView === 'Instructor' && (
          <>
            <button onClick={() => setActiveTab('instructor-roster')} className={`flex-1 py-2 rounded font-bold uppercase text-center text-xs \${activeTab === 'instructor-roster' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>📝 Kuusaa Qabxii</button>
            <button onClick={() => setActiveTab('instructor-attendance')} className={`flex-1 py-2 rounded font-bold uppercase text-center text-xs \${activeTab === 'instructor-attendance' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>📅 Hordoffii Hirmaannaa</button>
            <button onClick={() => setActiveTab('instructor-exams')} className={`flex-1 py-2 rounded font-bold uppercase text-center text-xs \${activeTab === 'instructor-exams' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>📝 Qormaata Baasuu</button>
            <button onClick={() => setActiveTab('instructor-library')} className={`flex-1 py-2 rounded font-bold uppercase text-center text-xs \${activeTab === 'instructor-library' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>📚 Kuusaa Kitaabaa</button>
          </>
        )}
        {currentRoleView === 'Student' && (
          <>
            <button onClick={() => setActiveTab('student-transcript')} className={`flex-1 py-2 rounded font-bold uppercase text-center text-xs \${activeTab === 'student-transcript' ? 'bg-amber-600 text-black' : 'text-slate-400 hover:text-white'}`}>🎓 Teessoo Qabxii Koo</button>
            <button onClick={() => setActiveTab('student-exams')} className={`flex-1 py-2 rounded font-bold uppercase text-center text-xs \${activeTab === 'student-exams' ? 'bg-amber-600 text-black' : 'text-slate-400 hover:text-white'}`}>📝 Wiirtuu Qormaataa</button>
            <button onClick={() => setActiveTab('student-library')} className={`flex-1 py-2 rounded font-bold uppercase text-center text-xs \${activeTab === 'student-library' ? 'bg-amber-600 text-black' : 'text-slate-400 hover:text-white'}`}>📚 Kitaabbati Dijitaalaa</button>
          </>
        )}
      </nav>

      <main className="bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-xl">
        <div className="mb-4 flex gap-4 items-center">
          <label className="text-xs font-bold text-slate-400 uppercase">Grade Group:</label>
          <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white outline-none cursor-pointer">
            <option value="9">Grade 9</option><option value="10">Grade 10</option>
            <option value="11 Natural">11 Natural</option><option value="11 Social">11 Social</option>
            <option value="12 Natural">12 Natural</option><option value="12 Social">12 Social</option>
          </select>
        </div>

        {activeTab === 'director-overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                <p className="text-xs text-slate-400 uppercase font-bold">Waliigala Gali Masruufaa</p>
                <p className="text-xl font-black text-emerald-400 mt-1">ETB {financeLedger.reduce((acc, curr) => acc + Number(curr.amount_paid || 0), 0).toLocaleString()}</p>
              </div>
              <div className="bg-slate-900 p-4 rounded-lg border border-slate-800"><p className="text-xs text-slate-400 uppercase font-bold">Milkaa'ina Targetii</p><p className="text-xl font-black text-purple-400 mt-1">74%</p></div>
              <div className="bg-slate-900 p-4 rounded-lg border border-slate-800"><p className="text-xs text-slate-400 uppercase font-bold">Giddu-galeessa Qabxii ICT</p><p className="text-xl font-black text-blue-400 mt-1">78.4%</p></div>
              <div className="bg-slate-900 p-4 rounded-lg border border-slate-800"><p className="text-xs text-slate-400 uppercase font-bold">Reetii Darbiinsa Waliigalaa</p><p className="text-xl font-black text-amber-400 mt-1">92.1%</p></div>
            </div>
            <form onSubmit={handleEnrollmentSubmit} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">Galmee Barataa Haaraa (14-Field Schema)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className="block text-xs text-slate-400 mb-1">ID Barataa *</label><input type="text" placeholder="E.g., SMS/001" value={studentForm.barataa_id} onChange={e => setStudentForm({...studentForm, barataa_id: e.target.value, studentId: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-xs p-2.5 rounded-xl text-white outline-none" required /></div>
                <div><label className="block text-xs text-slate-400 mb-1">Maqaa Barataa *</label><input type="text" placeholder="Maqaa" value={studentForm.maqaa} onChange={e => setStudentForm({...studentForm, maqaa: e.target.value, name: `\${e.target.value} \${studentForm.maqaa_abbaa}`})} className="w-full bg-slate-950 border border-slate-800 text-xs p-2.5 rounded-xl text-white outline-none" required /></div>
                <div><label className="block text-xs text-slate-400 mb-1">Maqaa Abbaa *</label><input type="text" placeholder="Maqaa Abbaa" value={studentForm.maqaa_abbaa} onChange={e => setStudentForm({...studentForm, maqaa_abbaa: e.target.value, name: `\${studentForm.maqaa} \${e.target.value}`})} className="w-full bg-slate-950 border border-slate-800 text-xs p-2.5 rounded-xl text-white outline-none" required /></div>
              </div>
              <button type="submit" className="bg-purple-600 font-bold px-6 py-2 rounded text-xs text-white">Save Barataa</button>
            </form>
          </div>
        )}

        {activeTab === 'director-finance' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center"><h3 className="text-md font-bold text-purple-400">Financial Revenue Ledger</h3><button onClick={triggerFinanceCSVExport} className="bg-emerald-600 text-white px-3 py-1.5 rounded text-xs font-bold uppercase">Export Ledger CSV</button></div>
            {userRole === 'Admin' ? (
              <form onSubmit={handleFinanceSubmit} className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-slate-900 p-4 rounded-lg border border-slate-800">
                <input type="text" placeholder="Student ID" value={financeForm.studentId} onChange={(e) => setFinanceForm({...financeForm, studentId: e.target.value.toUpperCase()})} className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none" required />
                <select value={financeForm.feeType} onChange={(e) => setFinanceForm({...financeForm, feeType: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none"><option value="Tuition Q1">Tuition Q1</option><option value="Tuition Q2">Tuition Q2</option><option value="Registration">Registration</option></select>
                <input type="number" placeholder="Due" value={financeForm.amountDue} onChange={(e) => setFinanceForm({...financeForm, amountDue: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none" required />
                <input type="number" placeholder="Paid" value={financeForm.amountPaid} onChange={(e) => setFinanceForm({...financeForm, amountPaid: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none" required />
                <button type="submit" className="bg-purple-600 text-xs text-white font-bold rounded">Record Entry</button>
              </form>
            ) : <p className="text-xs text-red-400">Read-only view. Privileges required.</p>}
            <table className="w-full text-left text-xs"><thead className="bg-slate-900 text-slate-400"><tr><th className="p-3">Student ID</th><th className="p-3">Fee Type</th><th className="p-3">Due</th><th className="p-3">Paid</th></tr></thead>
              <tbody>{financeLedger.map((f, i) => (<tr key={i} className="border-b border-slate-900"><td className="p-3 font-mono text-purple-400">{f.studentId}</td><td className="p-3">{f.fee_type}</td><td className="p-3 text-red-400">ETB {f.amount_due}</td><td className="p-3 text-emerald-400">ETB {f.amount_paid}</td></tr>))}</tbody>
            </table>
          </div>
        )}

        {activeTab === 'director-users' && (
          <div className="space-y-4">
            <h3 className="text-md font-bold text-purple-400">System Identity Administration</h3>
            <form onSubmit={handleUserCreationSubmit} className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-slate-900 p-4 rounded-lg border border-slate-800">
              <input type="text" placeholder="Username" value={userForm.username} onChange={(e) => setUserForm({...userForm, username: e.target.value})} className="bg-slate-950 border border-slate-800 p-2 text-xs text-white outline-none" required />
              <input type="email" placeholder="Email" value={userForm.email} onChange={(e) => setUserForm({...userForm, email: e.target.value})} className="bg-slate-950 border border-slate-800 p-2 text-xs text-white outline-none" required />
              <input type="password" placeholder="Password" value={userForm.password} onChange={(e) => setUserForm({...userForm, password: e.target.value})} className="bg-slate-950 border border-slate-800 p-2 text-xs text-white outline-none" required />
              <select value={userForm.role} onChange={(e) => setUserForm({...userForm, role: e.target.value})} className="bg-slate-950 border border-slate-800 p-2 text-xs text-white outline-none"><option value="Teacher">Teacher</option><option value="Admin">Director</option></select>
              <button type="submit" className="bg-purple-600 text-xs text-white font-bold rounded">Provision User</button>
            </form>
          </div>
        )}

        {activeTab === 'instructor-roster' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead><tr className="bg-slate-900 text-slate-400"><th className="p-3">ID Barataa</th><th className="p-3">Maqaa Guutuu</th><th className="p-3">Test 1 (10)</th><th className="p-3">Test 2 (10)</th><th className="p-3">Assign (20)</th><th className="p-3">Final (60)</th><th className="p-3">Total</th><th className="p-3">Actions</th></tr></thead>
              <tbody>
                {studentsLoading ? <tr><td colSpan="8" className="p-3 text-center">Loading...</td></tr> :
                  students.map((s, idx) => (
                    <tr key={idx} className="border-b border-slate-900">
                      <td className="p-3 text-cyan-400 font-mono font-bold">{s.studentId || s.barataa_id}</td>
                      <td className="p-3 text-white">{s.name || `\${s.maqaa} \${s.maqaa_abbaa}`}</td>
                      <td className="p-2"><input type="number" defaultValue={s.test1 || 0} onBlur={(e) => handleCellUpdateSubmit(s.studentId, 'ICT', 'test1', e.target.value)} className="w-14 bg-slate-900 border border-slate-800 p-1 text-center font-mono text-white text-xs" /></td>
                      <td className="p-2"><input type="number" defaultValue={s.test2 || 0} onBlur={(e) => handleCellUpdateSubmit(s.studentId, 'ICT', 'test2', e.target.value)} className="w-14 bg-slate-900 border border-slate-800 p-1 text-center font-mono text-white text-xs" /></td>
                      <td className="p-2"><input type="number" defaultValue={s.assignment || 0} onBlur={(e) => handleCellUpdateSubmit(s.studentId, 'ICT', 'assignment', e.target.value)} className="w-14 bg-slate-900 border border-slate-800 p-1 text-center font-mono text-white text-xs" /></td>
                      <td className="p-2"><input type="number" defaultValue={s.finalExam || 0} onBlur={(e) => handleCellUpdateSubmit(s.studentId, 'ICT', 'finalExam', e.target.value)} className="w-14 bg-slate-900 border border-slate-800 p-1 text-center font-mono text-white text-xs" /></td>
                      <td className="p-3 font-mono text-amber-400 font-black">{\s.totalScore || 0}</td>
                      <td className="p-2"><button onClick={() => window.triggerStudentReportCardPrint(s)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded text-[10px] font-bold uppercase">Print Cert</button></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'instructor-attendance' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center"><h3>Daily Attendance Matrix</h3><input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} className="bg-slate-900 border border-slate-800 p-2 text-xs text-white" /></div>
            <table className="w-full text-left text-xs"><thead><tr className="bg-slate-900 text-slate-400"><th className="p-3">ID</th><th className="p-3">Student Name</th><th className="p-3">Status</th></tr></thead>
              <tbody>{attendanceRecords.map((r, i) => (<tr key={i} className="border-b border-slate-900"><td className="p-3">{
.studentId}</td><td className="p-3">{
.name}</td><td className="p-2 flex gap-1">{['Present','Absent','Late','Sick'].map(st => (<button key={st} onClick={() => handleAttendanceCellChange(r.studentId, st)} className={`px-2 py-0.5 rounded text-[10px] \${r.status === st ? 'bg-blue-600 text-white' : 'bg-slate-900'}`}>{st}</button>))}</td></tr>))}</tbody>
            </table>
          </div>
        )}

        {activeTab === 'instructor-exams' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2"><h3>Assessment Workspace</h3><div className="flex gap-2"><button onClick={() => setExamUploadMode('manual')} className="text-xs bg-blue-600 px-2 py-1 rounded">Manual</button><button onClick={() => setExamUploadMode('bulk')} className="text-xs bg-purple-600 px-2 py-1 rounded">Bulk Upload</button></div></div>
            {examUploadMode === 'bulk' ? <BulkExamUpload selectedGrade={selectedGrade} onUploadSuccess={fetchLiveExams} /> : (
              <form onSubmit={handleExamPublishSubmit} className="bg-slate-900 p-4 rounded-xl space-y-3">
                <input type="text" placeholder="Exam Title" value={examForm.title} onChange={e => setExamForm({...examForm, title: e.target.value})} className="w-full bg-slate-950 p-2 text-xs rounded border border-slate-800" required />
                <textarea placeholder="Question string..." value={currentQuestion.text} onChange={e => setCurrentQuestion({...currentQuestion, text: e.target.value})} className="w-full bg-slate-950 p-2 text-xs rounded border border-slate-800 h-12" />
                <button type="button" onClick={addQuestionToFormState} className="bg-slate-800 text-xs px-3 py-1 text-white rounded">Add Option Nodes</button>
                <button type="submit" className="w-full bg-blue-600 text-xs font-bold py-2 rounded">Deploy Architecture</button>
              </form>
            )}
          </div>
        )}

        {activeTab === 'instructor-library' && (
          <form onSubmit={handleLibrarySubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-900 p-4 rounded-lg border border-slate-800">
            <input type="text" placeholder="Resource Title" value={libraryForm.title} onChange={e => setLibraryForm({...libraryForm, title: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white" required />
            <input type="text" placeholder="Author" value={libraryForm.author} onChange={e => setLibraryForm({...libraryForm, author: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white" required />
            <input type="url" placeholder="CDN URL Link" value={libraryForm.downloadUrl} onChange={e => setLibraryForm({...libraryForm, downloadUrl: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white" required />
            <button type="submit" className="bg-blue-600 font-bold rounded text-xs text-white">Publish Resource</button>
          </form>
        )}

        {activeTab === 'student-transcript' && (<div><h3 className="text-md font-bold text-amber-400">Continuous Performance Record Card</h3><p className="text-xs text-slate-400 mt-2">See your class instructor to manage or challenge current evaluation points scales.</p></div>)}

        {activeTab === 'student-exams' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exams.map((ex, i) => (
              <div key={i} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                <div><h4 className="text-sm font-bold text-white">{\ex.title}</h4><p className="text-[10px] text-slate-400">{\ex.subject} Evaluation Module</p></div>
                <button onClick={async () => { try { const res = await fetch(`/api/exams/questions?examId=\${ex.exam_id}`); const d = await res.json(); setQuizQuestions(d.questions || []); setActiveQuizExam(ex); } catch(err) { console.error(err); } }} className="bg-amber-500 text-slate-950 font-black text-[10px] px-3 py-1.5 rounded">Launch Evaluation</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'student-library' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {books.map((b, i) => (
              <div key={i} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between h-28">
                <div><h4 className="text-sm font-bold text-white truncate">{.title}</h4><p className="text-[10px] text-slate-400">Author: {.author}</p></div>
                <a href={b.downloadUrl} target="_blank" rel="noreferrer" className="w-full text-center bg-slate-800 text-slate-200 border border-slate-700 py-1 rounded text-[10px] font-black uppercase">Download PDF File</a>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* FLOATING CONTEXT-AWARE CONVERSATIONAL ASSISTANT WIDGET */}
      <div className="fixed bottom-6 right-6 w-72 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-4 flex flex-col h-80 z-40">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-2"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span><h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Gargaaraa AI Dijitaalaa v3.3</h4></div>
        <div id="aiTerminalChatLog" className="flex-1 overflow-y-auto text-[11px] font-mono space-y-2 mb-2"><p className="text-emerald-400 font-bold">Gargaaraa AI:</p><p className="text-slate-300">Akkam! Mana barumsaa keessan irratti har'a maal si gargaaruu danda'a?</p></div>
        <input type="text" placeholder="Gaaffii kee asitti barreessi..." className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-white text-[11px]" onKeyDown={async (e) => {
          if (e.key === 'Enter' && e.target.value.trim()) {
            const txt = e.target.value; e.target.value = ''; const log = document.getElementById('aiTerminalChatLog');
            const p = document.createElement('p'); p.className = 'text-blue-400 mt-1'; p.textContent = `Isin: \${txt}`; log.appendChild(p);
            try {
              const res = await fetch('/api/ai-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: txt, userRole: 'Admin' }) });
              const d = await res.json(); const r = document.createElement('p'); r.className = 'text-emerald-400'; r.textContent = `AI: \${d.reply || 'No response'}`; log.appendChild(r);
            } catch (err) { console.error(err); }
          }
        }} />
      </div>

      {/* QUIZ SUBMISSION QUESTIONNAIRE MODAL OVERLAY */}
      {activeQuizExam && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 relative shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2"><h3 className="text-md font-black text-amber-400 uppercase">{ ctiveQuizExam.title}</h3><button onClick={() => setActiveQuizExam(null)} className="text-slate-400 text-xs">✕ Close</button></div>
            <input type="text" placeholder="Enter Student ID Authorization Token" value={studentExId} onChange={(e) => setStudentExId(e.target.value.toUpperCase())} className="bg-slate-900 border border-slate-800 rounded p-2 w-full text-xs text-white" />
            <button onClick={async () => { if (!studentExId) return alert("Valid Student ID needed."); try { const res = await fetch('/api/exams/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId: studentExId, examId: activeQuizExam.exam_id, answers: studentAnswers }) }); const data = await res.json(); if (res.ok) { alert(`Exam grading complete! Score: \${data.score}%`); setActiveQuizExam(null); setStudentAnswers({}); setStudentExId(''); fetchLiveRosterData(); } } catch (err) { console.error(err); } }} className="w-full bg-emerald-600 text-white font-bold py-2 rounded text-xs uppercase">Submit Test 🚀</button>
          </div>
        </div>
      )}
    </div>
  );
}
