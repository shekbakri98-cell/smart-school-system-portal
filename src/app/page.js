'use client';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  // Navigation & Access Control States
  const [activeTab, setActiveTab] = useState('students'); // Choices: 'students', 'attendance', 'exams', 'finance', 'library', 'teachers', 'system'
  const [userRole, setUserRole] = useState('Teacher'); // Fallback safe role default
  const [username, setUsername] = useState('User');

  // Student Section States
  const [selectedGrade, setSelectedGrade] = useState('12 Natural');
  const [students, setStudents] = useState([]);
  const [studentForm, setStudentForm] = useState({ studentId: '', name: '' });
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Attendance Section States
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // Exam Center States
  const [exams, setExams] = useState([]);
  const [examsLoading, setExamsLoading] = useState(false);
  const [examForm, setExamForm] = useState({ title: '', subject: 'ICT', questions: [] });
  const [currentQuestion, setCurrentQuestion] = useState({ text: '', a: '', b: '', c: '', d: '', correct: 'A' });

  // Finance Section States
  const [financeLedger, setFinanceLedger] = useState([]);
  const [financeLoading, setFinanceLoading] = useState(false);
  const [financeForm, setFinanceForm] = useState({ studentId: '', feeType: 'Tuition Q1', amountDue: '', amountPaid: '' });

  // Library Section States
  const [books, setBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(false);
  const [libraryForm, setLibraryForm] = useState({ title: '', author: '', downloadUrl: '' });

  // User Administration States
  const [systemUsers, setSystemUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userForm, setUserForm] = useState({ username: '', email: '', password: '', role: 'Teacher' });

  // Cookieless Server Authentication Synchronization Hook
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const getCookieValue = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
        return null;
      };
      const liveCookieRole = getCookieValue('userRole');
      const storedName = localStorage.getItem('username') || 'Admin User';
      
      if (liveCookieRole) {
        setUserRole(liveCookieRole);
      } else {
        setUserRole(localStorage.getItem('userRole') || 'Teacher');
      }
      setUsername(storedName);
    }
  }, []);

  // Central Dynamic Monitor: Re-fetches files depending on selection parameters shifts
  useEffect(() => {
    if (activeTab === 'students') {
      fetchLiveRosterData();
    } else if (activeTab === 'attendance') {
      fetchLiveAttendanceRecords();
    } else if (activeTab === 'exams') {
      fetchLiveExams();
    } else if (activeTab === 'finance') {
      fetchLiveFinanceLedger();
    } else if (activeTab === 'library') {
      fetchLiveLibraryBooks();
    } else if (activeTab === 'teachers' && userRole === 'Admin') {
      fetchSystemUsers();
    }
  }, [selectedGrade, activeTab, attendanceDate, userRole]);
  // REST API Pipeline Fetch Handlers
  async function fetchLiveRosterData() {
    setStudentsLoading(true);
    try {
      const res = await fetch(`/api/students?grade=${encodeURIComponent(selectedGrade)}`);
      const result = await res.json();
      setStudents(result.data || []);
    } catch (err) { console.error("Failed fetching live grid data node:", err); } 
    finally { setStudentsLoading(false); }
  }

  async function fetchLiveAttendanceRecords() {
    setAttendanceLoading(true);
    try {
      const res = await fetch(`/api/attendance?grade=${encodeURIComponent(selectedGrade)}&date=${attendanceDate}`);
      const result = await res.json();
      setAttendanceRecords(result.data || []);
    } catch (err) { console.error("Failed fetching attendance ledger mapping:", err); } 
    finally { setAttendanceLoading(false); }
  }

  async function fetchLiveExams() {
    setExamsLoading(true);
    try {
      const res = await fetch(`/api/exams?grade=${encodeURIComponent(selectedGrade)}`);
      const result = await res.json();
      setExams(result.exams || []);
    } catch (err) { console.error("Failed loading examination modules:", err); } 
    finally { setExamsLoading(false); }
  }

  async function fetchLiveFinanceLedger() {
    setFinanceLoading(true);
    try {
      const res = await fetch('/api/finance');
      const result = await res.json();
      setFinanceLedger(result.ledger || []);
    } catch (err) { console.error("Failed fetching operational financial accounting logs:", err); } 
    finally { setFinanceLoading(false); }
  }

  async function fetchLiveLibraryBooks() {
    setBooksLoading(true);
    try {
      const res = await fetch(`/api/library?grade=${encodeURIComponent(selectedGrade)}`);
      const result = await res.json();
      setBooks(result.books || []);
    } catch (err) { console.error("Failed querying digital resource textbook catalog lists:", err); } 
    finally { setBooksLoading(false); }
  }

  async function fetchSystemUsers() {
    setUsersLoading(true);
    try {
      const res = await fetch('/api/auth'); 
      const result = await res.json();
      setSystemUsers(result.users || []);
    } catch (err) { console.error("Failed fetching infrastructure credentials ledger:", err); } 
    finally { setUsersLoading(false); }
  }
  // Submission Form Event Pipelines
  async function handleEnrollmentSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/students', { 
        method: 'POST', headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ studentId: studentForm.studentId, name: studentForm.name, grade: selectedGrade, subject: 'ICT' }) 
      });
      if (res.ok) { alert("Barataan haaraan milkiin galmeeffameera!"); setStudentForm({ studentId: '', name: '' }); fetchLiveRosterData(); }
    } catch (err) { console.error(err); }
  }

  async function handleFinanceSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/finance', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(financeForm)
      });
      if (res.ok) { alert("Financial dues transaction synchronized successfully!"); setFinanceForm({ studentId: '', feeType: 'Tuition Q1', amountDue: '', amountPaid: '' }); fetchLiveFinanceLedger(); }
    } catch (err) { console.error(err); }
  }

  async function handleLibrarySubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/library', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: libraryForm.title, author: libraryForm.author, gradeSection: selectedGrade, downloadUrl: libraryForm.downloadUrl })
      });
      if (res.ok) { alert("Textbook catalog media asset committed successfully!"); setLibraryForm({ title: '', author: '', downloadUrl: '' }); fetchLiveLibraryBooks(); }
    } catch (err) { console.error(err); }
  }

  async function handleUserCreationSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userForm) });
      if (res.ok) { alert("Account profile generated successfully inside system nodes!"); setUserForm({ username: '', email: '', password: '', role: 'Teacher' }); fetchSystemUsers(); }
    } catch (err) { console.error(err); }
  }

  async function handleCellUpdateSubmit(studentId, subject, fieldName, newScore) {
    try {
      await fetch('/api/roster/update-mark', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId, subject, fieldName, score: Number(newScore) }) });
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
      if (res.ok) { alert("Online examination module deployed successfully!"); setExamForm({ title: '', subject: 'ICT', questions: [] }); fetchLiveExams(); }
    } catch (err) { console.error(err); }
  }

  // AUTOMATED STUDENT REPORT CARD PRINT WINDOW HOOK ENGINE
  function triggerStudentReportCardPrint(student) {
    const pWin = window.open('', '_blank');
    pWin.document.write(`
      <html>
        <head>
          <title>Certificate - ${student.name}</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 30px; text-align: center; color: #000; background: #fff; }
            .cert-box { border: 4px double #000; padding: 25px; }
            .title { font-size: 22px; font-weight: bold; margin-bottom: 5px; }
            .sub { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 25px; }
            .meta { text-align: left; width: 85%; margin: 15px auto; font-size: 13px; line-height: 1.8; }
            .tbl { width: 90%; margin: 20px auto; border-collapse: collapse; text-align: left; font-size: 13px; }
            .tbl th, .tbl td { border: 1px solid #000; padding: 8px; }
            .sig-row { display: flex; justify-content: space-between; margin-top: 45px; font-size: 11px; padding: 0 20px; }
          </style>
        </head>
        <body>
          <div class="cert-box">
            <div class="title">SHEEK BAKRI SECONDARY SCHOOL</div>
            <div class="sub">Official Academic Achievement Record Certificate</div>
            <div class="meta">
              <strong>Student Name:</strong> ${student.name}<br/>
              <strong>Identifier ID:</strong> ${student.studentId}<br/>
              <strong>Class Section:</strong> ${selectedGrade}<br/>
              <strong>Subject Field:</strong> ${student.subject || 'ICT'}
            </div>
            <table class="tbl">
              <thead><tr><th>Assessment Matrix</th><th>Weight Limit</th><th>Mark Obtained</th></tr></thead>
              <tbody>
                <tr><td>Continuous Test 1</td><td>10</td><td>${student.test1 || 0}</td></tr>
                <tr><td>Continuous Test 2</td><td>10</td><td>${student.test2 || 0}</td></tr>
                <tr><td>Practical Assignment</td><td>20</td><td>${student.assignment || 0}</td></tr>
                <tr><td>Final Term Exam</td><td>60</td><td>${student.finalExam || 0}</td></tr>
                <tr style="font-weight:bold; background:#f4f4f4;"><td>Waliigala / Cumulative Total</td><td>100</td><td>${student.totalScore || 0}</td></tr>
              </tbody>
            </table>
            <div class="sig-row">
              <div>Faculty Advisor: _________________</div>
              <div>School Director: _________________</div>
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    pWin.document.close();
  }

  function handleLogoutSequence() {
    localStorage.clear();
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = '/login';
  }
  return (
    <div className="min-h-screen bg-brandNavy text-slate-100 p-6">
      {/* GLOBAL BANNER VIEW */}
      <header className="max-w-6xl mx-auto mb-6 flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">SHEEK BAKRI SECONDARY SCHOOL</h1>
          <p className="text-[10px] text-brandGold font-mono uppercase tracking-widest">Operations Dashboard // Welcome, {username} ({userRole})</p>
        </div>
        <button onClick={handleLogoutSequence} className="bg-red-950/40 border border-red-900 text-red-400 font-mono text-[10px] px-3 py-1 rounded transition-colors">Disconnect</button>
      </header>

      {/* MULTI-TAB ADVANCED NAVIGATION BAR */}
      <nav className="max-w-6xl mx-auto mb-6 flex flex-wrap bg-surfaceCard p-1 rounded-lg border border-slate-800 text-xs font-mono gap-1">
        <button onClick={() => setActiveTab('students')} className={`flex-1 py-2 rounded font-bold uppercase tracking-wider text-center transition-all ${activeTab === 'students' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>Roster Matrix</button>
        <button onClick={() => setActiveTab('attendance')} className={`flex-1 py-2 rounded font-bold uppercase tracking-wider text-center transition-all ${activeTab === 'attendance' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>📅 Attendance</button>
        <button onClick={() => setActiveTab('exams')} className={`flex-1 py-2 rounded font-bold uppercase tracking-wider text-center transition-all ${activeTab === 'exams' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>📝 Exams</button>
        <button onClick={() => setActiveTab('finance')} className={`flex-1 py-2 rounded font-bold uppercase tracking-wider text-center transition-all ${activeTab === 'finance' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>💳 Finance Dues</button>
        <button onClick={() => setActiveTab('library')} className={`flex-1 py-2 rounded font-bold uppercase tracking-wider text-center transition-all ${activeTab === 'library' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>📚 Library</button>
        {userRole === 'Admin' && (<button onClick={() => setActiveTab('teachers')} className={`flex-1 py-2 rounded font-bold uppercase tracking-wider text-center transition-all ${activeTab === 'teachers' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>🔒 Account Console</button>)}
        <button onClick={() => setActiveTab('system')} className={`flex-1 py-2 rounded font-bold uppercase tracking-wider text-center transition-all ${activeTab === 'system' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>⚙️ System Node</button>
      </nav>

      {/* SYSTEM VIEW SWITCH MAIN WINDOW CONTAINER */}
      <main className="max-w-6xl mx-auto">
        {/* TAB VIEW A: CUMULATIVE ROSTER MATRIX & CA UPDATES */}
        {activeTab === 'students' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="bg-surfaceCard p-4 rounded-lg border border-slate-800 h-fit space-y-3 font-mono text-xs">
              <h2 className="font-bold border-b border-slate-700 pb-1 text-slate-100 uppercase">Galmeessi Barataa Haaraa</h2>
              {userRole === 'Admin' ? (
                <form onSubmit={handleEnrollmentSubmit} className="space-y-2">
                  <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="w-full bg-brandNavy border border-slate-800 p-2 text-white outline-none rounded"><option value="12 Natural">12 Natural</option><option value="12 Social">12 Social</option><option value="Kutaa 10ffaa">Kutaa 10ffaa</option><option value="Kutaa 9ffaa">Kutaa 9ffaa</option></select>
                  <input type="text" placeholder="Student ID" value={studentForm.studentId} onChange={e => setStudentForm({...studentForm, studentId: e.target.value})} className="w-full bg-brandNavy border border-slate-800 p-2 text-white outline-none rounded" required />
                  <input type="text" placeholder="Full Name" value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} className="w-full bg-brandNavy border border-slate-800 p-2 text-white outline-none rounded" required />
                  <button type="submit" className="w-full bg-blue-600 p-2 text-white font-bold rounded uppercase">Kuusi Galmeessi</button>
                </form>
              ) : ( <div className="p-2 text-center text-slate-400 bg-brandNavy border border-slate-800 rounded">⚠️ Restricted to Admin accounts.</div> )}
            </section>
            
            <section className="lg:col-span-2 bg-surfaceCard p-4 rounded-lg border border-slate-800 overflow-hidden">
              <div className="flex justify-between items-center mb-3 text-xs"><h3 className="font-bold uppercase text-slate-200">Active Roster Sheets</h3><select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="bg-brandNavy border border-slate-800 p-1 text-white outline-none rounded"><option value="12 Natural">12 Natural</option><option value="12 Social">12 Social</option><option value="Kutaa 10ffaa">Kutaa 10ffaa</option><option value="Kutaa 9ffaa">Kutaa 9ffaa</option></select></div>
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left whitespace-nowrap">
                  <thead><tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]"><th className="pb-2">ID</th><th>Maqaa</th><th>T1 (10)</th><th>T2 (10)</th><th>Asgn (20)</th><th>Final (60)</th><th className="text-center">Total</th><th className="text-right">Export</th></tr></thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {studentsLoading && <tr><td colSpan="8" className="text-center py-4 text-slate-400 animate-pulse">Querying records...</td></tr>}
                    {!studentsLoading && students.length === 0 && <tr><td colSpan="8" className="text-center py-4 text-slate-500">No student rows mapped.</td></tr>}
                    {!studentsLoading && students.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/20">
                        <td className="py-2 font-mono text-blue-400 font-bold">{s.studentId}</td><td className="font-semibold text-slate-200">{s.name}</td>
                        <td><input type="number" defaultValue={s.test1} onBlur={e => handleCellUpdateSubmit(s.studentId, s.subject || 'ICT', 'test1', e.target.value)} className="w-10 bg-brandNavy text-center rounded border border-slate-800 text-white" /></td>
                        <td><input type="number" defaultValue={s.test2} onBlur={e => handleCellUpdateSubmit(s.studentId, s.subject || 'ICT', 'test2', e.target.value)} className="w-10 bg-brandNavy text-center rounded border border-slate-800 text-white" /></td>
                        <td><input type="number" defaultValue={s.assignment} onBlur={e => handleCellUpdateSubmit(s.studentId, s.subject || 'ICT', 'assignment', e.target.value)} className="w-10 bg-brandNavy text-center rounded border border-slate-800 text-white" /></td>
                        <td><input type="number" defaultValue={s.finalExam} onBlur={e => handleCellUpdateSubmit(s.studentId, s.subject || 'ICT', 'finalExam', e.target.value)} className="w-10 bg-brandNavy text-center rounded border border-slate-800 text-white" /></td>
                        <td className="text-center font-black text-emerald-400 font-mono">{s.totalScore || 0}</td>
                        <td className="text-right"><button onClick={() => triggerStudentReportCardPrint(s)} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 font-bold px-2 py-0.5 rounded text-[10px]">🖨️ Cert</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
        {/* TAB VIEW B: DAILY ATTENDANCE LEDGER GRID SUMMARY */}
        {activeTab === 'attendance' && (
          <section className="bg-surfaceCard p-4 rounded-lg border border-slate-800 text-xs">
            <div className="flex justify-between border-b border-slate-800 pb-2 mb-3">
              <h3 className="font-bold uppercase text-slate-200">Daily Attendance Matrix</h3>
              <div className="flex gap-2 font-mono">
                <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="bg-brandNavy border border-slate-800 p-1 text-white rounded"><option value="12 Natural">12 Natural</option><option value="12 Social">12 Social</option><option value="Kutaa 10ffaa">Kutaa 10ffaa</option><option value="Kutaa 9ffaa">Kutaa 9ffaa</option></select>
                <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} className="bg-brandNavy border border-slate-800 p-1 text-white rounded" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead><tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]"><th className="pb-2">ID Barataa</th><th>Maqaa Guutuu</th><th className="text-right">Hordoffii Galmee</th></tr></thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {attendanceLoading && <tr><td colSpan="3" className="text-center py-4 text-slate-400 animate-pulse">Syncing chronological records...</td></tr>}
                  {!attendanceLoading && attendanceRecords.map((s, idx) => (
                    <tr key={idx}>
                      <td className="py-2 font-mono text-blue-400 font-bold">{s.studentId}</td><td className="font-semibold text-slate-200">{s.name}</td>
                      <td className="text-right"><select value={s.status || 'Not Marked'} onChange={(e) => handleAttendanceCellChange(s.studentId, e.target.value)} className={`bg-brandNavy border rounded p-1 text-[11px] font-bold ${s.status === 'Present' ? 'border-emerald-800 text-emerald-400' : s.status === 'Absent' ? 'border-red-800 text-red-400' : 'border-slate-800 text-slate-400'}`}><option value="Not Marked">Not Marked</option><option value="Present">Present (Argameera)</option><option value="Absent">Absent (Hafee)</option><option value="Late">Late (Sifameera)</option></select></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB VIEW C: ONLINE EXAMS ASSESSMENT ENGINE */}
        {activeTab === 'exams' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs font-mono">
            <section className="bg-surfaceCard p-4 rounded-lg border border-slate-800 space-y-3">
              <h2 className="font-bold border-b border-slate-700 pb-1 text-white uppercase">Deploy Examination</h2>
              {userRole === 'Admin' ? (
                <div className="space-y-2">
                  <input type="text" placeholder="Exam Title" value={examForm.title} onChange={e => setExamForm({...examForm, title: e.target.value})} className="w-full bg-brandNavy border border-slate-800 p-2 text-white outline-none rounded" />
                  <div className="bg-brandNavy border border-slate-800 p-2 rounded space-y-2">
                    <textarea placeholder="Question Text" value={currentQuestion.text} onChange={e => setCurrentQuestion({...currentQuestion, text: e.target.value})} className="w-full bg-surfaceCard border border-slate-700 p-1.5 rounded h-12 text-white outline-none"></textarea>
                    <input type="text" placeholder="Option A" value={currentQuestion.a} onChange={e => setCurrentQuestion({...currentQuestion, a: e.target.value})} className="w-full bg-surfaceCard border border-slate-700 p-1 text-white rounded outline-none" />
                    <input type="text" placeholder="Option B" value={currentQuestion.b} onChange={e => setCurrentQuestion({...currentQuestion, b: e.target.value})} className="w-full bg-surfaceCard border border-slate-700 p-1 text-white rounded outline-none" />
                    <select value={currentQuestion.correct} onChange={e => setCurrentQuestion({...currentQuestion, correct: e.target.value})} className="w-full bg-surfaceCard border border-slate-700 p-1 text-white rounded outline-none"><option value="A">Key: A</option><option value="B">Key: B</option></select>
                    <button type="button" onClick={addQuestionToFormState} className="w-full py-1 bg-slate-800 text-slate-300 font-bold border border-slate-700 rounded text-[10px]">ADD QUESTION ({examForm.questions.length})</button>
                  </div>
                  <button onClick={handleExamPublishSubmit} className="w-full bg-emerald-600 p-2 text-white font-bold rounded uppercase">Publish Assessment</button>
                </div>
              ) : ( <div className="text-slate-400 text-center p-4 bg-brandNavy border border-slate-800 rounded">🎒 Active assessments pop up inside the chart grid panel for student access.</div> )}
            </section>
            
            <section className="lg:col-span-2 bg-surfaceCard p-4 rounded-lg border border-slate-800">
              <h3 className="font-bold border-b border-slate-800 pb-2 mb-3 text-slate-200 uppercase">Active Testing Matrix Nodes</h3>
              <div className="space-y-2">
                {examsLoading && <p className="text-slate-400 animate-pulse">Syncing nodes...</p>}
                {!examsLoading && exams.map((ex, idx) => (
                  <div key={idx} className="p-3 bg-brandNavy border border-slate-800 rounded flex justify-between items-center">
                    <div><p className="font-bold text-slate-200">{ex.title}</p><p className="text-[10px] text-slate-500 uppercase">Subject: {ex.subject} // Grade: {ex.grade_section}</p></div>
                    <button onClick={() => alert('Launching container testing terminal.')} className="px-3 py-1 bg-blue-600 font-bold text-white rounded text-[10px] uppercase">Launch</button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
        {/* TAB VIEW D: AUTOMATED TUITION PAYMENT ALLOCATION FORM & REGISTRY LEDGER */}
        {activeTab === 'finance' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs font-mono">
            <section className="bg-surfaceCard p-4 rounded-lg border border-slate-800 space-y-3">
              <h2 className="font-bold border-b border-slate-700 pb-1 text-white uppercase">Log Payment Allocation</h2>
              {userRole === 'Admin' ? (
                <form onSubmit={handleFinanceSubmit} className="space-y-2">
                  <input type="text" placeholder="Student ID (e.g. STU-001)" value={financeForm.studentId} onChange={e => setFinanceForm({...financeForm, studentId: e.target.value})} className="w-full bg-brandNavy border border-slate-800 p-2 text-white outline-none rounded" required />
                  <select value={financeForm.feeType} onChange={e => setFinanceForm({...financeForm, feeType: e.target.value})} className="w-full bg-brandNavy border border-slate-800 p-2 text-white outline-none rounded"><option value="Tuition Q1">Tuition Q1</option><option value="Tuition Q2">Tuition Q2</option><option value="Registration Dues">Registration Dues</option></select>
                  <input type="number" placeholder="Total Amount Due (ETB)" value={financeForm.amountDue} onChange={e => setFinanceForm({...financeForm, amountDue: e.target.value})} className="w-full bg-brandNavy border border-slate-800 p-2 text-white outline-none rounded" required />
                  <input type="number" placeholder="Amount Paid (ETB)" value={financeForm.amountPaid} onChange={e => setFinanceForm({...financeForm, amountPaid: e.target.value})} className="w-full bg-brandNavy border border-slate-800 p-2 text-white outline-none rounded" required />
                  <button type="submit" className="w-full bg-blue-600 p-2 text-white font-bold rounded uppercase">Commit Fee Entry</button>
                </form>
              ) : ( <div className="p-2 text-center text-slate-400 bg-brandNavy border border-slate-800 rounded">⚠️ Restricted to Admin tiers.</div> )}
            </section>
            
            <section className="lg:col-span-2 bg-surfaceCard p-4 rounded-lg border border-slate-800">
              <h3 className="font-bold border-b border-slate-800 pb-2 mb-3 text-slate-200 uppercase">School Revenue Ledger</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead><tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase"><th className="pb-2">Student ID</th><th>Name</th><th>Category</th><th>Due</th><th>Paid</th><th className="text-right">Status</th></tr></thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {financeLoading && <tr><td colSpan="6" className="text-center py-4 text-slate-400">Syncing ledger...</td></tr>}
                    {!financeLoading && financeLedger.map((f, idx) => (
                      <tr key={idx}>
                        <td className="py-2 font-bold text-blue-400">{f.studentId}</td><td className="text-slate-200">{f.name}</td><td>{f.fee_type}</td><td>{f.amount_due}</td><td>{f.amount_paid}</td>
                        <td className="text-right"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${f.payment_status === 'Paid' ? 'border-emerald-800 text-emerald-400' : 'border-amber-800 text-amber-400'}`}>{f.payment_status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* TAB VIEW E: DIGITAL RESOURCE CATALOG TEXTBOOK LOADER INTERFACES */}
        {activeTab === 'library' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs font-mono">
            <section className="bg-surfaceCard p-4 rounded-lg border border-slate-800 space-y-3">
              <h2 className="font-bold border-b border-slate-700 pb-1 text-white uppercase">Catalog Textbook</h2>
              <form onSubmit={handleLibrarySubmit} className="space-y-2">
                <input type="text" placeholder="Resource Title" value={libraryForm.title} onChange={e => setLibraryForm({...libraryForm, title: e.target.value})} className="w-full bg-brandNavy border border-slate-800 p-2 text-white outline-none rounded" required />
                <input type="text" placeholder="Author Name" value={libraryForm.author} onChange={e => setLibraryForm({...libraryForm, author: e.target.value})} className="w-full bg-brandNavy border border-slate-800 p-2 text-white outline-none rounded" required />
                <input type="text" placeholder="Asset Download Link URL" value={libraryForm.downloadUrl} onChange={e => setLibraryForm({...libraryForm, downloadUrl: e.target.value})} className="w-full bg-brandNavy border border-slate-800 p-2 text-white outline-none rounded" required />
                <button type="submit" className="w-full bg-emerald-600 p-2 text-white font-bold rounded uppercase">Commit Media Asset</button>
              </form>
            </section>
            
            <section className="lg:col-span-2 bg-surfaceCard p-4 rounded-lg border border-slate-800">
              <h3 className="font-bold border-b border-slate-800 pb-2 mb-3 text-slate-200 uppercase">Library Catalog Ledger</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead><tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase"><th className="pb-2">Title</th><th>Author</th><th>Section</th><th className="text-right">Access</th></tr></thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {booksLoading && <tr><td colSpan="4" className="text-center py-4 text-slate-400">Loading catalog...</td></tr>}
                    {!booksLoading && books.map((b, idx) => (
                      <tr key={idx}>
                        <td className="py-2 font-semibold text-slate-200">{b.title}</td><td>{b.author}</td><td>{b.grade_section}</td>
                        <td className="text-right"><a href={b.download_url} target="_blank" rel="noreferrer" className="text-blue-400 underline font-bold">Download 📥</a></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* TAB VIEW F: HUMAN RESOURCES USER CREATION ACCOUNT PRIVILEGES PANEL */}
        {activeTab === 'teachers' && userRole === 'Admin' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs font-mono">
            <section className="bg-surfaceCard p-4 rounded-lg border border-slate-800 space-y-3">
              <h2 className="font-bold border-b border-slate-700 pb-1 text-white uppercase">Generate Access</h2>
              <form onSubmit={handleUserCreationSubmit} className="space-y-2">
                <input type="text" placeholder="Username" value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} className="w-full bg-brandNavy border border-slate-800 p-2 text-white outline-none rounded" required />
                <input type="email" placeholder="Email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="w-full bg-brandNavy border border-slate-800 p-2 text-white outline-none rounded" required />
                <input type="password" placeholder="Password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="w-full bg-brandNavy border border-slate-800 p-2 text-white outline-none rounded" required />
                <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})} className="w-full bg-brandNavy border border-slate-800 p-2 text-white outline-none rounded"><option value="Teacher">Teacher</option><option value="Admin">Admin</option></select>
                <button type="submit" className="w-full bg-emerald-600 p-2 text-white font-bold rounded uppercase">Commit User</button>
              </form>
            </section>
            <section className="lg:col-span-2 bg-surfaceCard p-4 rounded-lg border border-slate-800">
              <h3 className="font-bold border-b border-slate-800 pb-2 mb-3 text-slate-200 uppercase">Registry Ledger</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead><tr className="text-slate-400 border-b border-slate-800 text-[10px] uppercase"><th className="pb-2">User Node</th><th>Email Route</th><th className="text-right">Access Tier</th></tr></thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {usersLoading && <tr><td colSpan="3" className="text-center py-4">Syncing...</td></tr>}
                    {!usersLoading && systemUsers.map((user, idx) => (
                      <tr key={idx}>
                        <td className="py-2 font-semibold text-slate-200">{user.username}</td><td>{user.email}</td><td className="text-right font-bold text-purple-400">{user.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
               {/* VIEW 7: DATA ANALYTICS & SYSTEM OPERATIONS METRICS */}
        {activeTab === 'system' && (
          <div className="space-y-6 font-mono text-xs max-w-4xl mx-auto">
            {/* STATS OVERVIEW CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-surfaceCard p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                <span className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Total Tuition Collected</span>
                <span className="text-2xl font-black text-emerald-400 mt-2">
                  ETB {financeLedger.reduce((acc, curr) => acc + Number(curr.amount_paid || 0), 0).toLocaleString()}
                </span>
                <span className="text-[9px] text-slate-500 mt-1">// Computed from active live cloud invoices</span>
              </div>
              
              <div className="bg-surfaceCard p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                <span className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">ICT Core Class Average</span>
                <span className="text-2xl font-black text-blue-400 mt-2">
                  {students.length > 0 
                    ? (students.reduce((acc, curr) => acc + Number(curr.totalScore || 0), 0) / students.length).toFixed(1) 
                    : "0.0"}%
                </span>
                <span className="text-[9px] text-slate-500 mt-1">// Overall section grade metric mean</span>
              </div>

              <div className="bg-surfaceCard p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                <span className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Absolute Pass Rate</span>
                <span className="text-2xl font-black text-amber-400 mt-2">
                  {students.length > 0 
                    ? ((students.filter(s => Number(s.totalScore || 0) >= 50).length / students.length) * 100).toFixed(1) 
                    : "0.0"}%
                </span>
                <span className="text-[9px] text-slate-500 mt-1">// Students achieving benchmarks (>= 50)</span>
              </div>
            </div>

            {/* VISUAL GRAPH METRICS LAYER */}
            <div className="bg-surfaceCard p-5 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-2">Institutional Performance Analytics</h3>
              
              {/* Dynamic Bar Charts using CSS flex layouts */}
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1"><span>Tuition Target vs Collected Dues Balance</span><span>Progress Overview</span></div>
                  <div className="w-full bg-brandNavy h-3 rounded border border-slate-800 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-500" 
                      style={{ 
                        width: `${Math.min(100, (financeLedger.reduce((acc, curr) => acc + Number(curr.amount_paid || 0), 0) / Math.max(1, financeLedger.reduce((acc, curr) => acc + Number(curr.amount_due || 0), 0))) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1"><span>Roster Pass Rate Density</span><span>Benchmark Scale</span></div>
                  <div className="w-full bg-brandNavy h-3 rounded border border-slate-800 overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full transition-all duration-500" 
                      style={{ 
                        width: `${students.length > 0 ? (students.filter(s => Number(s.totalScore || 0) >= 50).length / students.length) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* STATIC CORE OPERATIONS METRICS CARD */}
            <section className="bg-surfaceCard p-4 rounded-xl border border-slate-800 space-y-2">
              <h3 className="font-bold border-b border-slate-800 pb-1 text-white uppercase text-xs">Core Infrastructure Node Metrics</h3>
              <div className="flex justify-between border-b border-slate-900 pb-1"><span>Database Client Connection:</span><span className="text-emerald-400 font-bold">ONLINE (MySQL / alwaysdata)</span></div>
              <div className="flex justify-between border-b border-slate-900 pb-1"><span>Deployment Service Status:</span><span className="text-blue-400 font-bold">PRODUCTION LAYER CONTAINER (Render)</span></div>
              <div className="flex justify-between"><span>Subject Track Assignment:</span><span className="text-amber-400 font-bold">ICT Core Framework Matrix</span></div>
            </section>
          </div>
        )}

      {/* FLOATING CONTEXT-AWARE CONVERSATIONAL TERMINAL SIDE ASSISTANT WIDGET */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-surfaceCard border border-slate-800 shadow-2xl rounded-xl p-4 w-72 space-y-3 font-mono text-xs">
          <div className="flex justify-between items-center border-b border-slate-700 pb-1.5">
            <span className="font-bold text-emerald-400 animate-pulse">● AI System Assistant</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">v3.3 Node</span>
          </div>
          <div className="h-32 overflow-y-auto bg-brandNavy p-2 rounded text-slate-300 space-y-1.5 text-[11px]" id="aiTerminalChatLog">
            <p className="text-slate-500">// Terminal line secure.</p>
            <p className="text-emerald-400 font-bold">AI Support:</p>
            <p className="leading-relaxed">Akkam! How can I assist you with your school management procedures today?</p>
          </div>
          <div className="flex gap-1.5">
            <input 
              type="text" 
              placeholder="Ask assistant..." 
              onKeyDown={async (e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  const txt = e.target.value; e.target.value = '';
                  const log = document.getElementById('aiTerminalChatLog');
                  log.innerHTML += `<p class="text-blue-400 font-bold mt-1">You:</p><p class="text-slate-200">${txt}</p>`;
                  
                  const res = await fetch('/api/ai-chat', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: txt, userRole: 'Admin' })
                  });
                  const d = await res.json();
                  log.innerHTML += `<p class="text-emerald-400 font-bold mt-1">AI Support:</p><p class="text-slate-300">${d.reply}</p>`;
                  log.scrollTop = log.scrollHeight;
                }
              }}
              className="w-full bg-brandNavy border border-slate-800 rounded p-1.5 text-white outline-none text-[11px]" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
