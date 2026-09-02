'use client';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  // Navigation & Multi-Role Perspective Console States
  const [currentRoleView, setCurrentRoleView] = useState('Director'); // Options: 'Director', 'Instructor', 'Student'
  const [activeTab, setActiveTab] = useState('director-overview'); // Maps contextual layout views
  const [userRole, setUserRole] = useState('Admin'); 
  const [username, setUsername] = useState('Admin User');

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

  // Student Testing Modal States
  const [activeQuizExam, setActiveQuizExam] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [studentAnswers, setStudentAnswers] = useState({});
  const [studentExId, setStudentExId] = useState('');
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

  // Cookieless Server Authentication Hook
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
  // Central Dynamic Monitor Hook
  useEffect(() => {
    if (activeTab === 'instructor-roster' || activeTab === 'student-transcript') { fetchLiveRosterData(); } 
    else if (activeTab === 'instructor-attendance') { fetchLiveAttendanceRecords(); } 
    else if (activeTab === 'instructor-exams' || activeTab === 'student-exams') { fetchLiveExams(); } 
    else if (activeTab === 'director-finance' || activeTab === 'director-overview') { fetchLiveFinanceLedger(); } 
    else if (activeTab === 'student-library' || activeTab === 'instructor-library') { fetchLiveLibraryBooks(); } 
    else if (activeTab === 'director-users') { fetchSystemUsers(); }
  }, [selectedGrade, activeTab, attendanceDate, currentRoleView]);

  // REST API Pipeline Fetch Handlers
  async function fetchLiveRosterData() {
    setStudentsLoading(true);
    try {
      const res = await fetch(`/api/students?grade=${encodeURIComponent(selectedGrade)}`);
      const result = await res.json();
      setStudents(result.data || []);
    } catch (err) { console.error(err); } finally { setStudentsLoading(false); }
  }

  async function fetchLiveAttendanceRecords() {
    setAttendanceLoading(true);
    try {
      const res = await fetch(`/api/attendance?grade=${encodeURIComponent(selectedGrade)}&date=${attendanceDate}`);
      const result = await res.json();
      setAttendanceRecords(result.data || []);
    } catch (err) { console.error(err); } finally { setAttendanceLoading(false); }
  }
  async function fetchLiveExams() {
    setExamsLoading(true);
    try {
      const res = await fetch(`/api/exams?grade=${encodeURIComponent(selectedGrade)}`);
      const result = await res.json();
      setExams(result.exams || []);
    } catch (err) { console.error(err); } finally { setExamsLoading(false); }
  }

  async function fetchLiveFinanceLedger() {
    setFinanceLoading(true);
    try {
      const res = await fetch('/api/finance');
      const result = await res.json();
      setFinanceLedger(result.ledger || []);
    } catch (err) { console.error(err); } finally { setFinanceLoading(false); }
  }

  async function fetchLiveLibraryBooks() {
    setBooksLoading(true);
    try {
      const res = await fetch(`/api/library?grade=${encodeURIComponent(selectedGrade)}`);
      const result = await res.json();
      setBooks(result.books || []);
    } catch (err) { console.error(err); } finally { setBooksLoading(false); }
  }

  async function fetchSystemUsers() {
    setUsersLoading(true);
    try {
      const res = await fetch('/api/auth'); 
      const result = await res.json();
      setSystemUsers(result.users || []);
    } catch (err) { console.error(err); } finally { setUsersLoading(false); }
  }
  // Submission Form Event Handlers
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
      const res = await fetch('/api/auth', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userForm) });
      if (res.ok) { alert("Access identity node profile generated!"); setUserForm({ username: '', email: '', password: '', role: 'Teacher' }); fetchSystemUsers(); }
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
    pWin.document.write(`
      <html>
        <head>
          <title>Certificate - \${student.name}</title>
          <style>
            @import url('https://googleapis.com');
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
            <div style="text-align:center; font-size:10px; color:#b45309; text-transform:uppercase; letter-spacing:1px; margin-bottom:15px;">Knowledge is the foundation of progress</div>
            <div class="sub-title">Official Student Performance Certificate</div>
            <div class="meta-grid">
              <div><strong>Student Name:</strong> \${student.name}</div>
              <div><strong>Student ID:</strong> \${student.studentId}</div>
              <div><strong>Grade Track:</strong> \${selectedGrade}</div>
              <div><strong>Subject:</strong> \${student.subject || 'ICT'}</div>
            </div>
            <table class="tbl">
              <thead><tr><th style="text-align:left;">Assessment Component</th><th>Limit</th><th>Score Achieved</th></tr></thead>
              <tbody>
                <tr><td>Continuous Assessment Test 1</td><td>10 Marks</td><td style="text-align:center;">\${student.test1 || 0}</td></tr>
                <tr><td>Continuous Assessment Test 2</td><td>10 Marks</td><td style="text-align:center;">\${student.test2 || 0}</td></tr>
                <tr><td>Practical Lab Assignment Work</td><td>20 Marks</td><td style="text-align:center;">\${student.assignment || 0}</td></tr>
                <tr><td>Final Comprehensive Examination</td><td>60 Marks</td><td style="text-align:center;">\${student.finalExam || 0}</td></tr>
                <tr class="total-row"><td>Cumulative Achievement Scale</td><td>100 Marks</td><td style="text-align:center; color:#10b981;">\${student.totalScore || 0} / 100</td></tr>
              </tbody>
            </table>
            <div class="sig-area"><div class="sig-line">Instructor Signature</div><div class="sig-line">Directorate Seal</div></div>
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
      {/* ENTERPRISE VIEW CONTROL PANEL HEADER */}
      <header className="max-w-6xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">SHEEK BAKRI SECONDARY SCHOOL</h1>
          <p className="text-[10px] text-brandGold font-mono uppercase tracking-widest">Enterprise Console Layer // Connected: {username}</p>
        </div>
        
        {/* INTERACTIVE PERSPECTIVE SWITCHER BUTTON MODULES */}
        <div className="flex flex-wrap items-center bg-[#141b2d] border border-slate-800 rounded-lg p-1 text-[11px] font-mono gap-1">
          <span className="text-slate-500 px-2 uppercase text-[9px] font-bold">View Perspective:</span>
          <button onClick={() => { setCurrentRoleView('Director'); setActiveTab('director-overview'); }} className={`px-2.5 py-1 rounded transition-all font-bold ${currentRoleView === 'Director' ? 'bg-purple-600 text-white shadow' : 'text-slate-400'}`}>👨‍💼 Director</button>
          <button onClick={() => { setCurrentRoleView('Instructor'); setActiveTab('instructor-roster'); }} className={`px-2.5 py-1 rounded transition-all font-bold ${currentRoleView === 'Instructor' ? 'bg-blue-600 text-white shadow' : 'text-slate-400'}`}>👩‍🏫 Instructor</button>
          <button onClick={() => { setCurrentRoleView('Student'); setActiveTab('student-transcript'); }} className={`px-2.5 py-1 rounded transition-all font-bold ${currentRoleView === 'Student' ? 'bg-amber-600 text-black shadow' : 'text-slate-400'}`}>🎒 Student</button>
          <button onClick={handleLogoutSequence} className="ml-2 bg-red-950/40 border border-red-900 text-red-400 text-[10px] px-2 py-1 rounded">Sign Out</button>
        </div>
      </header>

      {/* DYNAMIC NAV CONTENT WRAPPER */}
      <nav className="max-w-6xl mx-auto mb-6 flex flex-wrap bg-surfaceCard p-1 rounded-lg border border-slate-800 text-xs font-mono gap-1">
        {currentRoleView === 'Director' && (
          <>
            <button onClick={() => setActiveTab('director-overview')} className={`flex-1 py-2 rounded font-bold uppercase text-center ${activeTab === 'director-overview' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>📊 Operational Health</button>
            <button onClick={() => setActiveTab('director-finance')} className={`flex-1 py-2 rounded font-bold uppercase text-center ${activeTab === 'director-finance' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>💳 Revenue Ledger</button>
            <button onClick={() => setActiveTab('director-users')} className={`flex-1 py-2 rounded font-bold uppercase text-center ${activeTab === 'director-users' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>🔒 Faculty Registry</button>
          </>
        )}
        {currentRoleView === 'Instructor' && (
          <>
            <button onClick={() => setActiveTab('instructor-roster')} className={`flex-1 py-2 rounded font-bold uppercase text-center ${activeTab === 'instructor-roster' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>📝 Grading Matrix</button>
            <button onClick={() => setActiveTab('instructor-attendance')} className={`flex-1 py-2 rounded font-bold uppercase text-center ${activeTab === 'instructor-attendance' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>📅 Session Attendance</button>
            <button onClick={() => setActiveTab('instructor-exams')} className={`flex-1 py-2 rounded font-bold uppercase text-center ${activeTab === 'instructor-exams' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>📝 Test Deployment</button>
            <button onClick={() => setActiveTab('instructor-library')} className={`flex-1 py-2 rounded font-bold uppercase text-center ${activeTab === 'instructor-library' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>📚 Library Catalog</button>
          </>
        )}
        {currentRoleView === 'Student' && (
          <>
            <button onClick={() => setActiveTab('student-transcript')} className={`flex-1 py-2 rounded font-bold uppercase text-center ${activeTab === 'student-transcript' ? 'bg-amber-600 text-black' : 'text-slate-400'}`}>🎓 My Transcript</button>
            <button onClick={() => setActiveTab('student-exams')} className={`flex-1 py-2 rounded font-bold uppercase text-center ${activeTab === 'student-exams' ? 'bg-amber-600 text-black' : 'text-slate-400'}`}>📝 Exam Center</button>
            <button onClick={() => setActiveTab('student-library')} className={`flex-1 py-2 rounded font-bold uppercase text-center ${activeTab === 'student-library' ? 'bg-amber-600 text-black' : 'text-slate-400'}`}>📚 Digital Library</button>
          </>
        )}
      </nav>

      <main className="max-w-6xl mx-auto">
        {/* VIEW 1: EXECUTIVE DIRECTOR OVERVIEW */}
        {activeTab === 'director-overview' && (
          <div className="space-y-6 font-mono text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-surfaceCard p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Total Revenue Pool</span>
                <span className="text-2xl font-black text-emerald-400 mt-2">ETB {financeLedger.reduce((acc, curr) => acc + Number(curr.amount_paid || 0), 0).toLocaleString()}</span>
              </div>
              <div className="bg-surfaceCard p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">ICT Class Performance Mean</span>
                <span className="text-2xl font-black text-blue-400 mt-2">78.4%</span>
              </div>
              <div className="bg-surfaceCard p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Absolute Institution Pass Rate</span>
                <span className="text-2xl font-black text-amber-400 mt-2">92.1%</span>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: DIRECTOR REVENUE LEDGER */}
        {activeTab === 'director-finance' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
            <section className="bg-surfaceCard p-4 rounded-lg border border-slate-800 space-y-3">
              <h2 className="font-bold border-b border-slate-700 pb-1 text-white uppercase text-xs">Log Invoiced Fee</h2>
              <form onSubmit={handleFinanceSubmit} className="space-y-2">
                <input type="text" placeholder="Student ID" value={financeForm.studentId} onChange={e => setFinanceForm({...financeForm, studentId: e.target.value})} className="w-full bg-brandNavy border border-slate-800 p-2 text-white outline-none rounded" required />
                <select value={financeForm.feeType} onChange={e => setFinanceForm({...financeForm, feeType: e.target.value})} className="w-full bg-brandNavy border border-slate-800 p-2 text-white outline-none rounded"><option value="Tuition Q1">Tuition Q1</option><option value="Tuition Q2">Tuition Q2</option></select>
                <input type="number" placeholder="Total Due" value={financeForm.amountDue} onChange={e => setFinanceForm({...financeForm, amountDue: e.target.value})} className="w-full bg-brandNavy border border-slate-800 p-2 text-white outline-none rounded" required />
                <input type="number" placeholder="Amount Paid" value={financeForm.amountPaid} onChange={e => setFinanceForm({...financeForm, amountPaid: e.target.value})} className="w-full bg-brandNavy border border-slate-800 p-2 text-white outline-none rounded" required />
                <button type="submit" className="w-full bg-purple-600 p-2 text-white font-bold rounded uppercase">Commit Dues</button>
              </form>
            </section>
            <section className="lg:col-span-2 bg-surfaceCard p-4 rounded-lg border border-slate-800">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3"><h3 className="font-bold text-slate-200 text-xs">Accounting Registry</h3><button onClick={triggerFinanceCSVExport} className="bg-purple-950/60 text-purple-400 px-2 py-1 rounded border border-purple-800 text-[10px] font-bold uppercase">📥 CSV Sheet</button></div>
              <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="text-slate-400 text-[10px] uppercase"><th className="pb-2">Student ID</th><th>Name</th><th>Category</th><th>Due</th><th>Paid</th><th className="text-right">Status</th></tr></thead><tbody className="divide-y divide-slate-800 text-slate-300">{financeLedger.map((f, idx) => (<tr key={idx}><td className="py-2.5 font-bold text-purple-400">{f.studentId}</td><td>{f.name}</td><td>{f.fee_type}</td><td>{f.amount_due}</td><td>{f.amount_paid}</td><td className="text-right"><span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${f.payment_status === 'Paid' ? 'border-emerald-800 text-emerald-400' : 'border-amber-800 text-amber-400'}`}>{f.payment_status}</span></td></tr>))}</tbody></table></div>
            </section>
          </div>
        )}

        {/* VIEW 3: DIRECTOR FACULTY PROFILES */}
        {activeTab === 'director-users' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
            <section className="bg-surfaceCard p-4 rounded-lg border border-slate-800 h-fit space-y-3"><h2 className="font-bold border-b border-slate-700 pb-1 text-white uppercase text-xs">Create Profile Access</h2><form onSubmit={handleUserCreationSubmit} className="space-y-2"><input type="text" placeholder="Username" value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} className="w-full bg-brandNavy border border-slate-800 p-2 text-white outline-none rounded" required /><input type="email" placeholder="Email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="w-full bg-brandNavy border border-slate-800 p-2 text-white outline-none rounded" required /><input type="password" placeholder="Password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="w-full bg-brandNavy border border-slate-800 p-2 text-white outline-none rounded" required /><select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})} className="w-full bg-brandNavy border border-slate-800 p-2 text-white outline-none rounded"><option value="Teacher">Teacher</option><option value="Admin">Admin</option></select><button type="submit" className="w-full bg-purple-600 p-2 text-white font-bold rounded uppercase">Commit Profile</button></form></section>
            <section className="lg:col-span-2 bg-surfaceCard p-4 rounded-lg border border-slate-800"><h3 className="font-bold border-b border-slate-800 pb-2 mb-3 text-slate-200 text-xs">Faculty Registry</h3><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="text-slate-400 text-[10px] uppercase"><th className="pb-2">User Identity</th><th>Email Route</th><th className="text-right">Access Permission</th></tr></thead><tbody className="divide-y divide-slate-800 text-slate-300">{systemUsers.map((user, idx) => (<tr key={idx}><td className="py-2.5 font-semibold text-slate-200">{user.username}</td><td>{user.email}</td><td className="text-right font-bold text-purple-400">{user.role}</td></tr>))}</tbody></table></div></section>
          </div>
        )}
        {/* VIEW 4: INSTRUCTOR GRADING SHEET MATRIX */}
        {activeTab === 'instructor-roster' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
            <section className="bg-surfaceCard p-4 rounded-lg border border-slate-800 h-fit space-y-3">
              <h2 className="font-bold border-b border-slate-700 pb-1 text-slate-100 uppercase text-xs">Enroll Scholar</h2>
              <form onSubmit={handleEnrollmentSubmit} className="space-y-2">
                <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="w-full bg-brandNavy border border-slate-800 p-2 text-white outline-none rounded">
                  <option value="12 Natural">12 Natural</option>
                  <option value="12 Social">12 Social</option>
                </select>
                <input type="text" placeholder="Student ID" value={studentForm.studentId} onChange={e => setStudentForm({...studentForm, studentId: e.target.value})} className="w-full bg-brandNavy border border-slate-800 p-2 text-white outline-none rounded" required />
                <input type="text" placeholder="Full Name" value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} className="w-full bg-brandNavy border border-slate-800 p-2 text-white outline-none rounded" required />
                <button type="submit" className="w-full bg-blue-600 p-2 text-white font-bold rounded uppercase">Kuusi Galmeessi</button>
              </form>
            </section>

            <section className="lg:col-span-2 bg-surfaceCard p-4 rounded-lg border border-slate-800 overflow-hidden">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-slate-200 text-xs">Active Marks Sheets</h3>
                <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="bg-brandNavy border border-slate-800 p-1 text-white rounded outline-none">
                  <option value="12 Natural">12 Natural</option>
                  <option value="12 Social">12 Social</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                      <th className="pb-2">ID</th>
                      <th>Maqaa</th>
                      <th>T1 (10)</th>
                      <th>T2 (10)</th>
                      <th>Asgn (20)</th>
                      <th>Final (60)</th>
                      <th className="text-center">Total</th>
                      <th className="text-right">Print</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {students.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/20">
                        <td className="py-2.5 font-bold text-blue-400">{s.studentId}</td>
                        <td className="font-semibold text-slate-200">{s.name}</td>
                        <td><input type="number" defaultValue={s.test1} onBlur={e => handleCellUpdateSubmit(s.studentId, s.subject || 'ICT', 'test1', e.target.value)} className="w-10 bg-brandNavy text-center rounded border border-slate-800 text-white" /></td>
                        <td><input type="number" defaultValue={s.test2} onBlur={e => handleCellUpdateSubmit(s.studentId, s.subject || 'ICT', 'test2', e.target.value)} className="w-10 bg-brandNavy text-center rounded border border-slate-800 text-white" /></td>
                        <td><input type="number" defaultValue={s.assignment} onBlur={e => handleCellUpdateSubmit(s.studentId, s.subject || 'ICT', 'assignment', e.target.value)} className="w-10 bg-brandNavy text-center rounded border border-slate-800 text-white" /></td>
                        <td><input type="number" defaultValue={s.finalExam} onBlur={e => handleCellUpdateSubmit(s.studentId, s.subject || 'ICT', 'finalExam', e.target.value)} className="w-10 bg-brandNavy text-center rounded border border-slate-800 text-white" /></td>
                        <td className="text-center font-black text-emerald-400">{s.totalScore || 0}</td>
                        <td className="text-right"><button onClick={() => triggerStudentReportCardPrint(s)} className="bg-slate-800 text-amber-400 border border-slate-700 font-bold px-2 py-0.5 rounded text-[10px]">🖨️ Cert</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* VIEW 5: INSTRUCTOR SESSION ATTENDANCE MATRIX */}
        {activeTab === 'instructor-attendance' && (
          <section className="bg-surfaceCard p-4 rounded-lg border border-slate-800 text-xs font-mono w-full">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
              <h3 className="font-bold uppercase text-slate-200 text-xs">Daily Attendance Matrix</h3>
              <div className="flex gap-2 text-white">
                <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="bg-brandNavy border border-slate-800 p-1 rounded text-xs">
                  <option value="12 Natural">12 Natural</option>
                  <option value="12 Social">12 Social</option>
                </select>
                <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} className="bg-brandNavy border border-slate-800 p-1 rounded text-xs" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="pb-2">ID Barataa</th>
                    <th>Maqaa Guutuu</th>
                    <th className="text-right">Hordoffii Galmee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {attendanceRecords.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/20">
                      <td className="py-2.5 text-blue-400 font-bold">{s.studentId}</td>
                      <td className="font-semibold text-slate-200">{s.name}</td>
                      <td className="text-right">
                        <select 
                          value={s.status || 'Not Marked'} 
                          onChange={(e) => handleAttendanceCellChange(s.studentId, e.target.value)} 
                          className={`bg-brandNavy border rounded p-1 text-[11px] font-bold outline-none ${s.status === 'Present' ? 'border-emerald-800 text-emerald-400' : s.status === 'Absent' ? 'border-red-800 text-red-400' : 'border-slate-800 text-slate-400'}`}
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
          </section>
        )}

        {/* VIEW 6: INSTRUCTOR EXAMS MODULE */}
        {activeTab === 'instructor-exams' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
            <section className="bg-surfaceCard p-4 rounded-lg border border-slate-800 space-y-3">
              <h2 className="font-bold border-b border-slate-700 pb-1 text-white uppercase text-xs">Deploy Examination</h2>
              <form onSubmit={handleExamPublishSubmit} className="space-y-2">
                <input type="text" placeholder="Exam Title" value={examForm.title} onChange={e => setExamForm({...examForm, title: e.target.value})} className="w-full bg-brandNavy border border-slate-800 p-2 text-white outline-none rounded" required />
                <div className="bg-brandNavy border border-slate-800 p-2 rounded space-y-2">
                  <textarea placeholder="Question Text" value={currentQuestion.text} onChange={e => setCurrentQuestion({...currentQuestion, text: e.target.value})} className="w-full bg-surfaceCard border border-slate-700 p-1.5 rounded h-12 text-white outline-none"></textarea>
                  <input type="text" placeholder="Option A" value={currentQuestion.a} onChange={e => setCurrentQuestion({...currentQuestion, a: e.target.value})} className="w-full bg-surfaceCard border border-slate-700 p-1 text-white rounded outline-none" required />
                  <input type="text" placeholder="Option B" value={currentQuestion.b} onChange={e => setCurrentQuestion({...currentQuestion, b: e.target.value})} className="w-full bg-surfaceCard border border-slate-700 p-1 text-white rounded outline-none" required />
                  <select value={currentQuestion.correct} onChange={e => setCurrentQuestion({...currentQuestion, correct: e.target.value})} className="w-full bg-surfaceCard border border-slate-700 p-1 text-white rounded outline-none">
                    <option value="A">Key: A</option>
                    <option value="B">Key: B</option>
                  </select>
                  <button type="button" onClick={addQuestionToFormState} className="w-full py-1 bg-slate-800 text-amber-400 font-bold border border-slate-700 rounded text-[10px]">SAVE ENTRY ({examForm.questions.length})</button>
                </div>
Publish Manual Quiz
  )}
{/* VIEW 7: INSTRUCTOR LIBRARY TEXTBOOK CATALOG */}
{activeTab === 'instructor-library' && ()
  }
 {/* VIEW 8: STUDENT TRANSCRIPT ACCESSIBILITY */}
        {activeTab === 'student-transcript' && (
          <section className="bg-surfaceCard p-5 rounded-xl border border-slate-800 font-mono text-xs max-w-3xl mx-auto space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3"><div><h3 className="text-sm font-bold text-white uppercase">Personal Academic Registry Card</h3></div><select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="bg-brandNavy border border-slate-800 p-1 rounded text-white outline-none"><option value="12 Natural">12 Natural</option><option value="12 Social">12 Social</option></select></div>
            <div className="overflow-x-auto"><table className="w-full text-left whitespace-nowrap"><thead><tr className="text-slate-400 text-[10px] uppercase border-b border-slate-800"><th className="pb-2">Student ID</th><th>Full Name</th><th>Test 1</th><th>Test 2</th><th>Assignment</th><th>Final Exam</th><th className="text-right">Total Score</th></tr></thead><tbody className="text-slate-200 divide-y divide-slate-800">{students.map((s, idx) => (<tr key={idx}><td className="py-3 font-bold text-amber-400">{s.studentId}</td><td className="font-semibold">{s.name}</td><td>{s.test1 || 0} / 10</td><td>{s.test2 || 0} / 10</td><td>{s.assignment || 0} / 20</td><td>{s.finalExam || 0} / 60</td><td className="text-right font-black text-emerald-400 text-sm">{s.totalScore || 0} / 100</td></tr>))}</tbody></table></div>
          </section>
        )}

        {/* VIEW 9: STUDENT EXAM TESTING PORTAL */}
        {activeTab === 'student-exams' && (
          <section className="bg-surfaceCard p-4 rounded-lg border border-slate-800 max-w-xl mx-auto font-mono text-xs">
            <h3 className="font-bold border-b border-slate-800 pb-2 mb-3 text-slate-200 uppercase text-xs">Interactive Testing Center</h3>
            <div className="space-y-2">
              {exams.length === 0 && <p className="text-slate-500 text-center py-4">// No exams active currently.</p>}
              {exams.map((ex, idx) => (
                <div key={idx} className="p-3 bg-brandNavy border border-slate-800 rounded-xl flex justify-between items-center">
                  <div><p className="font-bold text-slate-200">{ex.title}</p><p className="text-[10px] text-slate-500 uppercase mt-0.5">Track: {ex.subject}</p></div>
                  <button 
                    onClick={async () => {
                      const response = await fetch(`/api/exams?examId=${ex.exam_id}`);
                      const dbData = await response.json();
                      if (dbData.success && dbData.questions && dbData.questions.length > 0) {
                        setActiveQuizExam(ex); setQuizQuestions(dbData.questions); setStudentAnswers({}); setStudentExId('');
                      } else { alert("Questions matrix empty."); }
                    }}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-500 font-bold text-black text-[10px] rounded uppercase"
                  >
                    Take Test 📝
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* VIEW 10: STUDENT DIGITAL LIBRARY TEXTBOOKS INDEX */}
        {activeTab === 'student-library' && (
          <section className="bg-surfaceCard p-4 rounded-lg border border-slate-800 max-w-2xl mx-auto font-mono text-xs">
            <h3 className="font-bold border-b border-slate-800 pb-2 mb-3 text-slate-200 uppercase text-xs">Digital Textbook Library</h3>
            <div className="overflow-x-auto"><table className="w-full text-left whitespace-nowrap"><thead><tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase"><th className="pb-2">Resource Title</th><th>Author Course Route</th><th className="text-right">Action Handle</th></tr></thead><tbody className="divide-y divide-slate-800 text-slate-300">{books.map((b, idx) => (<tr key={idx}><td className="py-2.5 font-semibold text-slate-200">{b.title}</td><td>{b.author}</td><td className="text-right"><a href={b.download_url} target="_blank" rel="noreferrer" className="text-amber-400 font-bold underline">Download Resource 📥</a></td></tr>))}</tbody></table></div>
          </section>
        )}
      </main>

      {/* QUIZ SUBMISSION QUESTIONNAIRE MODAL OVERLAY */}
      {activeQuizExam && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto font-mono text-xs text-slate-100">
          <div className="bg-[#141b2d] border border-slate-800 rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3"><div><h3 className="text-base font-bold text-white uppercase">{activeQuizExam.title}</h3></div><button onClick={() => setActiveQuizExam(null)} className="bg-slate-800 text-slate-400 px-2.5 py-1 rounded">✕ Close</button></div>
            <div className="bg-[#0a0f1d] p-3 rounded border border-slate-800"><label className="text-[10px] uppercase text-slate-400 font-bold block mb-1">Enter Student ID:</label><input type="text" placeholder="e.g., STU-001" value={studentExId} onChange={(e) => setStudentExId(e.target.value.toUpperCase())} className="bg-[#141b2d] border border-slate-800 rounded p-2 w-full text-white outline-none" /></div>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {quizQuestions.map((q, qIdx) => (
                <div key={q.q_id} className="bg-[#0a0f1d] p-4 rounded-lg border border-slate-800 space-y-2">
                  <p className="font-bold text-slate-200">Q{qIdx + 1}: {q.question_text}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-[11px]">
                    <label className="flex items-center gap-2 p-2 rounded border border-slate-800 cursor-pointer"><input type="radio" name={`q-${q.q_id}`} onChange={() => setStudentAnswers({...studentAnswers, [q.q_id]: 'A'})} /> A: {q.option_a}</label>
                    <label className="flex items-center gap-2 p-2 rounded border border-slate-800 cursor-pointer"><input type="radio" name={`q-${q.q_id}`} onChange={() => setStudentAnswers({...studentAnswers, [q.q_id]: 'B'})} /> B: {q.option_b}</label>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={async () => {
                if (!studentExId) return alert("Please specify a valid Student ID.");
                const res = await fetch('/api/exams/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId: studentExId, examId: activeQuizExam.exam_id, answers: studentAnswers }) });
                const data = await res.json();
                if (res.ok) { alert(`Exam grading complete! Result Output: ${data.score}%`); setActiveQuizExam(null); setStudentAnswers({}); setStudentExId(''); fetchLiveRosterData(); }
              }}
              className="w-full bg-emerald-600 py-2.5 text-white font-bold uppercase rounded text-xs"
            >
              Submit Test 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
