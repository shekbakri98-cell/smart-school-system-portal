'use client';
import { useEffect, useState } from 'react';
import BulkExamUpload from '../components/BulkExamUpload';

export default function Dashboard() {
  // Navigation & Multi-Role Perspective Console States
  const [currentRoleView, setCurrentRoleView] = useState('Director'); // Options: 'Director', 'Instructor', 'Student'
  const [activeTab, setActiveTab] = useState('director-overview'); // Maps contextual layout views
  const [examUploadMode, setExamUploadMode] = useState('manual'); // Options: 'manual', 'bulk'
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
      const res = await fetch('/api/auth', { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
          username: userForm.username,
          email: userForm.email,
          password: userForm.password,
          role: userForm.role
        }) 
      });
      
      const data = await res.json();
      
      if (res.ok) { 
        alert("Eenyummaa haaraa milkiin banameera!"); 
        setUserForm({ username: '', email: '', password: '', role: 'Teacher' }); 
        fetchSystemUsers(); 
      } else {
        alert("Dogoggora: " + data.error);
      }
    } catch (err) { 
      console.error("Fashalaayeera:", err); 
    }
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
    financeLedger.forEach(r => { 
      csv += `${r.studentId},${r.name ? r.name.replace(/,/g, " ") : "Student"},${r.fee_type},${r.amount_due},${r.amount_paid},${r.payment_status}\n`; 
    });
    const encodedUri = encodeURI(csv);
    const a = document.createElement("a"); 
    a.setAttribute("href", encodedUri); 
    a.setAttribute("download", "sheek_bakri_revenue_ledger.csv");
    document.body.appendChild(a); 
    a.click(); 
    document.body.removeChild(a);
  }

  if (typeof window !== 'undefined') {
    window.triggerStudentReportCardPrint = function triggerStudentReportCardPrint(student) {
      const pWin = window.open('', '_blank');
      pWin.document.write(`
        <html>
          <head>
            <title>Certificate - ${student.name}</title>
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
              <div class="sub-title">Knowledge is the foundation of progress<br/>Official Student Performance Certificate</div>
              <div class="meta-grid">
                <div><strong>Student Name:</strong> ${student.name}</div>
                <div><strong>Student ID:</strong> ${student.studentId}</div>
                <div><strong>Grade Track:</strong> ${selectedGrade}</div>
                <div><strong>Subject:</strong> ${student.subject || 'ICT'}</div>
              </div>
              <table class="tbl">
                <thead>
                  <tr><th>Assessment Component</th><th>Limit</th><th>Score Achieved</th></tr>
                </thead>
                <tbody>
                  <tr><td>Continuous Assessment Test 1</td><td>10 Marks</td><td>${student.test1 || 0}</td></tr>
                  <tr><td>Continuous Assessment Test 2</td><td>10 Marks</td><td>${student.test2 || 0}</td></tr>
                  <tr><td>Practical Lab Assignment Work</td><td>20 Marks</td><td>${student.assignment || 0}</td></tr>
                  <tr><td>Final Comprehensive Examination</td><td>60 Marks</td><td>${student.finalExam || 0}</td></tr>
                  <tr class="total-row"><td>Cumulative Achievement Scale</td><td>100 Marks</td><td>${student.totalScore || 0} / 100</td></tr>
                </tbody>
              </table>
              <div class="sig-area">
                <div class="sig-line">Instructor Signature</div>
                <div class="sig-line">Directorate Seal</div>
              </div>
            </div>
          </body>
        </html>
      `);
      pWin.document.close();
      pWin.print();
    }
  }

  function handleLogoutSequence() {
    localStorage.clear();
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = '/login';
  }

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-slate-100">
      <header className="mb-6 flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-purple-400">SHEEK BAKRI PORTAL</h1>
          <p className="text-xs text-slate-400">Logged in as: <span className="text-white font-bold">{username} ({userRole})</span></p>
        </div>
        <button onClick={handleLogoutSequence} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-xs font-bold uppercase transition-all">
          Logout
        </button>
      </header>

      <nav className="flex gap-2 mb-6 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
        {currentRoleView === 'Director' && (
          <>
            <button onClick={() => setActiveTab('director-overview')} className={`flex-1 py-2 rounded font-bold uppercase text-center text-xs ${activeTab === 'director-overview' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>📊 Fayyaalessa Hojii</button>
            <button onClick={() => setActiveTab('director-finance')} className={`flex-1 py-2 rounded font-bold uppercase text-center text-xs ${activeTab === 'director-finance' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>💳 Galmee Galii</button>
            <button onClick={() => setActiveTab('director-users')} className={`flex-1 py-2 rounded font-bold uppercase text-center text-xs ${activeTab === 'director-users' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>🔒 Galmee Barsiisotaa</button>
          </>
        )}
        {currentRoleView === 'Instructor' && (
          <>
            <button onClick={() => setActiveTab('instructor-roster')} className={`flex-1 py-2 rounded font-bold uppercase text-center text-xs ${activeTab === 'instructor-roster' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>📝 Kuusaa Qabxii</button>
            <button onClick={() => setActiveTab('instructor-attendance')} className={`flex-1 py-2 rounded font-bold uppercase text-center text-xs ${activeTab === 'instructor-attendance' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>📅 Hordoffii Hirmaannaa</button>
            <button onClick={() => setActiveTab('instructor-exams')} className={`flex-1 py-2 rounded font-bold uppercase text-center text-xs ${activeTab === 'instructor-exams' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>📝 Qormaata Baasuu</button>
            <button onClick={() => setActiveTab('instructor-library')} className={`flex-1 py-2 rounded font-bold uppercase text-center text-xs ${activeTab === 'instructor-library' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>📚 Kuusaa Kitaabaa</button>
          </>
        )}
        {currentRoleView === 'Student' && (
          <>
            <button onClick={() => setActiveTab('student-transcript')} className={`flex-1 py-2 rounded font-bold uppercase text-center text-xs ${activeTab === 'student-transcript' ? 'bg-amber-600 text-black' : 'text-slate-400 hover:text-white'}`}>🎓 Teessoo Qabxii Koo</button>
            <button onClick={() => setActiveTab('student-exams')} className={`flex-1 py-2 rounded font-bold uppercase text-center text-xs ${activeTab === 'student-exams' ? 'bg-amber-600 text-black' : 'text-slate-400 hover:text-white'}`}>📝 Wiirtuu Qormaataa</button>
            <button onClick={() => setActiveTab('student-library')} className={`flex-1 py-2 rounded font-bold uppercase text-center text-xs ${activeTab === 'student-library' ? 'bg-amber-600 text-black' : 'text-slate-400 hover:text-white'}`}>📚 Kitaabbati Dijitaalaa</button>
          </>
        )}
      </nav>

      <main className="bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-xl">
        <div className="mb-4 flex gap-4 items-center">
          <label className="text-xs font-bold text-slate-400 uppercase">Perspective View:</label>
          <select value={currentRoleView} onChange={(e) => { setCurrentRoleView(e.target.value); setActiveTab(e.target.value === 'Director' ? 'director-overview' : e.target.value === 'Instructor' ? 'instructor-roster' : 'student-transcript'); }} className="bg-slate-900 border border-slate-800 rounded p-1 text-xs text-white outline-none">
            <option value="Director">Director Console</option>
            <option value="Instructor">Instructor Console</option>
            <option value="Student">Student Console</option>
          </select>

          <label className="text-xs font-bold text-slate-400 uppercase ml-4">Grade Group:</label>
          <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="bg-slate-900 border border-slate-800 rounded p-1 text-xs text-white outline-none">
            <option value="12 Natural">12 Natural</option>
            <option value="12 Social">12 Social</option>
            <option value="11 Natural">11 Natural</option>
          </select>
        </div>

        {activeTab === 'director-overview' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
              <p className="text-xs text-slate-400 uppercase font-bold">Waliigala Gali Masruufaa</p>
              <p className="text-xl font-black text-emerald-400 mt-1">ETB {financeLedger.reduce((acc, curr) => acc + Number(curr.amount_paid || 0), 0).toLocaleString()}</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
              <p className="text-xs text-slate-400 uppercase font-bold">Milkaa'ina Targetii</p>
              <p className="text-xl font-black text-purple-400 mt-1">74%</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
              <p className="text-xs text-slate-400 uppercase font-bold">Giddu-galeessa Qabxii ICT</p>
              <p className="text-xl font-black text-blue-400 mt-1">78.4%</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
              <p className="text-xs text-slate-400 uppercase font-bold">Reetii Darbiinsa Waliigalaa</p>
              <p className="text-xl font-black text-amber-400 mt-1">92.1%</p>
            </div>
          </div>
        )}

        {activeTab === 'director-finance' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-purple-400">Financial Revenue Ledger</h3>
              <button onClick={triggerFinanceCSVExport} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase px-3 py-1.5 rounded text-xs">
                Export Ledger CSV
              </button>
            </div>
            {userRole === 'Admin' ? (
              <form onSubmit={handleFinanceSubmit} className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-slate-900 p-4 rounded-lg border border-slate-800 mb-6">
                <input type="text" placeholder="Student ID" value={financeForm.studentId} onChange={(e) => setFinanceForm({...financeForm, studentId: e.target.value.toUpperCase()})} className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none" required />
                <select value={financeForm.feeType} onChange={(e) => setFinanceForm({...financeForm, feeType: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none">
                  <option value="Tuition Q1">Tuition Q1</option>
                  <option value="Tuition Q2">Tuition Q2</option>
                  <option value="Registration">Registration</option>
                  <option value="Lab Fee">Lab Fee</option>
                </select>
                <input type="number" placeholder="Amount Due" value={financeForm.amountDue} onChange={(e) => setFinanceForm({...financeForm, amountDue: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none" required />
                <input type="number" placeholder="Amount Paid" value={financeForm.amountPaid} onChange={(e) => setFinanceForm({...financeForm, amountPaid: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none" required />
                <button type="submit" className="bg-purple-600 hover:bg-purple-700 font-bold uppercase rounded text-xs text-white">Record Entry</button>
              </form>
            ) : <p className="text-xs text-red-400 mb-4">Read-only view. Form requires administrator tokens.</p>}
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 border-b border-slate-800"><th className="p-3">Student ID</th><th className="p-3">Fee Type</th><th className="p-3">Due</th><th className="p-3">Paid</th></tr>
                </thead>
                <tbody>
                  {financeLoading ? <tr><td colSpan="4" className="p-3 text-center text-slate-500">Loading ledger hooks...</td></tr> : 
                    financeLedger.length === 0 ? <tr><td colSpan="4" className="p-3 text-center text-slate-500">No transactions found.</td></tr> :
                    financeLedger.map((f, i) => (
                      <tr key={i} className="border-b border-slate-900 hover:bg-slate-900/50">
                        <td className="p-3 font-mono text-purple-400">{f.studentId}</td>
                        <td className="p-3">{f.fee_type}</td>
                        <td className="p-3 font-mono text-red-400">ETB {f.amount_due}</td>
                        <td className="p-3 font-mono text-emerald-400">ETB {f.amount_paid}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'director-users' && (
          <div>
            <h3 className="text-lg font-bold text-purple-400 mb-4">System Identity Credentials Administration</h3>
            {userRole === 'Admin' ? (
              <form onSubmit={handleUserCreationSubmit} className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-slate-900 p-4 rounded-lg border border-slate-800 mb-6">
                <input type="text" placeholder="Username" value={userForm.username} onChange={(e) => setUserForm({...userForm, username: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none" required />
                <input type="email" placeholder="Email" value={userForm.email} onChange={(e) => setUserForm({...userForm, email: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none" required />
                <input type="password" placeholder="Password" value={userForm.password} onChange={(e) => setUserForm({...userForm, password: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none" required />
                <select value={userForm.role} onChange={(e) => setUserForm({...userForm, role: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none">
                  <option value="Teacher">Teacher / Instructor</option>
                  <option value="Admin">System Director</option>
                  <option value="Student">Enrolled Student</option>
                </select>
                <button type="submit" className="bg-purple-600 hover:bg-purple-700 font-bold uppercase rounded text-xs text-white">Provision User</button>
              </form>
            ) : <p className="text-xs text-red-400 mb-4">Access Restricted. Identity management demands root authorization privileges.</p>}
          </div>
        )}

        {activeTab === 'instructor-roster' && (
          <div>
            <h3 className="text-lg font-bold text-blue-400 mb-4">Continuous Assessment Grading Matrix ({selectedGrade})</h3>
            <form onSubmit={handleEnrollmentSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-900 p-4 rounded-lg border border-slate-800 mb-6">
              <input type="text" placeholder="STU-000" value={studentForm.studentId} onChange={(e) => setStudentForm({...studentForm, studentId: e.target.value.toUpperCase()})} className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none" required />
              <input type="text" placeholder="Full Student Name" value={studentForm.name} onChange={(e) => setStudentForm({...studentForm, name: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none" required />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 font-bold uppercase rounded text-xs text-white">Enroll Student</button>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                    <th className="p-3">ID</th><th className="p-3">Name</th><th className="p-3">Test 1 (10)</th><th className="p-3">Test 2 (10)</th><th className="p-3">Assign (20)</th><th className="p-3">Final (60)</th><th className="p-3">Total</th><th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsLoading ? <tr><td colSpan="8" className="p-3 text-center text-slate-500">Connecting database channels...</td></tr> : 
                    students.length === 0 ? <tr><td colSpan="8" className="p-3 text-center text-slate-500">No active students on this grade roster track.</td></tr> :
                    students.map((s) => (
                      <tr key={s.studentId} className="border-b border-slate-900 hover:bg-slate-900/50">
                        <td className="p-3 font-mono text-blue-400">{s.studentId}</td>
                        <td className="p-3 font-bold">{s.name}</td>
                        <td className="p-2"><input type="number" defaultValue={s.test1 || 0} onBlur={(e) => handleCellUpdateSubmit(s.studentId, 'ICT', 'test1', e.target.value)} className="w-14 bg-slate-900 border border-slate-800 rounded p-1 text-center font-mono text-white outline-none text-xs" /></td>
                        <td className="p-2"><input type="number" defaultValue={s.test2 || 0} onBlur={(e) => handleCellUpdateSubmit(s.studentId, 'ICT', 'test2', e.target.value)} className="w-14 bg-slate-900 border border-slate-800 rounded p-1 text-center font-mono text-white outline-none text-xs" /></td>
                        <td className="p-2"><input type="number" defaultValue={s.assignment || 0} onBlur={(e) => handleCellUpdateSubmit(s.studentId, 'ICT', 'assignment', e.target.value)} className="w-14 bg-slate-900 border border-slate-800 rounded p-1 text-center font-mono text-white outline-none text-xs" /></td>
                        <td className="p-2"><input type="number" defaultValue={s.finalExam || 0} onBlur={(e) => handleCellUpdateSubmit(s.studentId, 'ICT', 'finalExam', e.target.value)} className="w-14 bg-slate-900 border border-slate-800 rounded p-1 text-center font-mono text-white outline-none text-xs" /></td>
                        <td className="p-3 font-mono font-black text-amber-400">{s.totalScore || 0}</td>
                        <td className="p-2">
                          <button onClick={() => window.triggerStudentReportCardPrint(s)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded border border-slate-700 font-bold uppercase tracking-wider text-[10px]">
                            Print Cert
                          </button>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'instructor-attendance' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <h3 className="text-lg font-bold text-blue-400">Daily Session Attendance Monitor ({selectedGrade})</h3>
              <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} className="bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white outline-none font-mono" />
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 border-b border-slate-800"><th className="p-3">ID</th><th className="p-3">Student Name</th><th className="p-3">Current Attendance Status Mark</th></tr>
                </thead>
                <tbody>
                  {attendanceLoading ? <tr><td colSpan="3" className="p-3 text-center text-slate-500">Mapping daily checkins...</td></tr> : 
                    attendanceRecords.length === 0 ? <tr><td colSpan="3" className="p-3 text-center text-slate-500">No logs captured. Please register active students into the grading system roster matrix first.</td></tr> :
                    attendanceRecords.map((r) => (
                      <tr key={r.studentId} className="border-b border-slate-900 hover:bg-slate-900/50">
                        <td className="p-3 font-mono text-blue-400">{r.studentId}</td>
                        <td className="p-3 font-bold">{r.name}</td>
                        <td className="p-2 flex gap-1.5">
                          {['Present', 'Absent', 'Late', 'Sick'].map((st) => (
                            <button key={st} onClick={() => handleAttendanceCellChange(r.studentId, st)} className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider border transition-all ${r.status === st ? 'bg-blue-600 text-white border-blue-500 shadow' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'}`}>
                              {st}
                            </button>
                          ))}
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'instructor-exams' && (
          <div>
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-blue-400">Evaluation & Assessment Creator Workspace</h3>
              <div className="flex gap-2">
                <button onClick={() => setExamUploadMode('manual')} className={`px-3 py-1.5 rounded font-bold uppercase transition-all text-xs ${examUploadMode === 'manual' ? 'bg-blue-600 text-white shadow' : 'bg-[#1e293b] text-slate-400 hover:text-white border border-slate-700'}`}>📝 Single Manual Setup</button>
                <button onClick={() => setExamUploadMode('bulk')} className={`px-3 py-1.5 rounded font-bold uppercase transition-all text-xs ${examUploadMode === 'bulk' ? 'bg-purple-600 text-white shadow' : 'bg-[#1e293b] text-slate-400 hover:text-white border border-slate-700'}`}>📥 Bulk Excel / CSV Upload</button>
              </div>
            </div>

            {examUploadMode === 'bulk' ? (
              <BulkExamUpload selectedGrade={selectedGrade} onUploadSuccess={fetchLiveExams} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <form onSubmit={handleExamPublishSubmit} className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
                  <h4 className="text-xs uppercase font-black text-slate-400 tracking-wider">Exam Structural Metadata</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Exam Title (e.g. Midterm)" value={examForm.title} onChange={(e) => setExamForm({...examForm, title: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none col-span-2" required />
                  </div>
                  
                  <div className="border-t border-slate-800 pt-4 space-y-3">
                    <h5 className="text-[11px] uppercase font-black text-blue-400">Append Multiple-Choice Item Node ({examForm.questions.length} saved)</h5>
                    <textarea placeholder="Specify the question prompt text here..." value={currentQuestion.text} onChange={(e) => setCurrentQuestion({...currentQuestion, text: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none h-16 resize-none" />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="Option A" value={currentQuestion.a} onChange={(e) => setCurrentQuestion({...currentQuestion, a: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none" />
                      <input type="text" placeholder="Option B" value={currentQuestion.b} onChange={(e) => setCurrentQuestion({...currentQuestion, b: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none" />
                      <input type="text" placeholder="Option C" value={currentQuestion.c} onChange={(e) => setCurrentQuestion({...currentQuestion, c: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none" />
                      <input type="text" placeholder="Option D" value={currentQuestion.d} onChange={(e) => setCurrentQuestion({...currentQuestion, d: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none" />
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Answer Key:</span>
                        <select value={currentQuestion.correct} onChange={(e) => setCurrentQuestion({...currentQuestion, correct: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-1 text-xs text-white font-mono">
                          <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                        </select>
                      </div>
                      <button type="button" onClick={addQuestionToFormState} className="bg-slate-800 hover:bg-slate-700 text-white text-[10px] px-3 py-1.5 font-bold uppercase tracking-wider rounded border border-slate-700">Add to Sheet</button>
                    </div>
                  </div>

                  <button type="submit" disabled={examForm.questions.length === 0} className="w-full bg-blue-600 disabled:bg-slate-800 disabled:text-slate-500 hover:bg-blue-700 text-white font-bold uppercase py-2 rounded text-xs transition-all shadow-md">
                    Commit & Deploy Live Exam Architecture
                  </button>
                </form>

                <div className="space-y-3">
                  <h4 className="text-xs uppercase font-black text-slate-400 tracking-wider">Active Evaluation Deployments ({selectedGrade})</h4>
                  {examsLoading ? <p className="text-xs text-slate-500">Querying live examination blocks...</p> : 
                    exams.length === 0 ? <p className="text-xs text-slate-500">No evaluations deployed. Use manual configurations or upload Excel formats.</p> :
                    exams.map((ex, i) => (
                      <div key={i} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                        <div>
                          <h5 className="text-sm font-bold text-white">{ex.title}</h5>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{ex.subject} Track • {ex.questions?.length || 0} MCQ Nodes</p>
                        </div>
                        <span className="bg-emerald-950 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded text-[9px] uppercase font-black tracking-widest">Active</span>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'instructor-library' && (
          <div>
            <h3 className="text-lg font-bold text-blue-400 mb-4">Academic Textbook Resource Repository Manager</h3>
            <form onSubmit={handleLibrarySubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-900 p-4 rounded-lg border border-slate-800 mb-6">
              <input type="text" placeholder="Resource Title" value={libraryForm.title} onChange={(e) => setLibraryForm({...libraryForm, title: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none" required />
              <input type="text" placeholder="Author/Publisher" value={libraryForm.author} onChange={(e) => setLibraryForm({...libraryForm, author: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none" required />
              <input type="url" placeholder="Resource CDN URL Link" value={libraryForm.downloadUrl} onChange={(e) => setLibraryForm({...libraryForm, downloadUrl: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none" required />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 font-bold uppercase rounded text-xs text-white">Publish Resource</button>
            </form>
          </div>
        )}

        {activeTab === 'student-transcript' && (
          <div>
            <h3 className="text-lg font-bold text-amber-400 mb-4">Official Continuous Academic Evaluation Performance Card</h3>
            <p className="text-xs text-slate-400 mb-4">Please reference the primary instructor grading matrix to access updated, scaled marks for the current semester cycle.</p>
          </div>
        )}

        {activeTab === 'student-exams' && (
          <div>
            <h3 className="text-lg font-bold text-amber-400 mb-4">Live Examination & Secure Assessment Center</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {examsLoading ? <p className="text-xs text-slate-500">Loading active exam configurations...</p> : 
                exams.length === 0 ? <p className="text-xs text-slate-500">Excellent! No examination tasks assigned for this track currently.</p> :
                exams.map((ex, i) => (
                  <div key={i} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-bold text-white">{ex.title}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{ex.subject} Evaluation Module</p>
                    </div>
                    <button onClick={async () => {
                      try {
                        const res = await fetch(`/api/exams/questions?examId=${ex.exam_id}`);
                        const d = await res.json();
                        setQuizQuestions(d.questions || []);
                        setActiveQuizExam(ex);
                      } catch (err) { console.error(err); }
                    }} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase text-[10px] tracking-wider px-3 py-1.5 rounded transition-all shadow-md">
                      Launch Evaluation
                    </button>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {activeTab === 'student-library' && (
          <div>
            <h3 className="text-lg font-bold text-amber-400 mb-4">Digital Syllabus Materials Library</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {booksLoading ? <p className="text-xs text-slate-500">Querying text resource arrays...</p> : 
                books.length === 0 ? <p className="text-xs text-slate-500">No active library files mapped for this grade track option.</p> :
                books.map((b, i) => (
                  <div key={i} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between h-32">
                    <div>
                      <h4 className="text-sm font-bold text-white truncate">{b.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Author: {b.author}</p>
                    </div>
                    <a href={b.downloadUrl} target="_blank" rel="noreferrer" className="w-full text-center bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-1.5 rounded text-[10px] font-black uppercase tracking-wider transition-all mt-3">
                      Stream / Download PDF File
                    </a>
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </main>

      {/* FLOATING CONTEXT-AWARE CONVERSATIONAL ASSISTANT WIDGET */}
      <div className="fixed bottom-6 right-6 w-72 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-4 flex flex-col h-80 z-40">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Gargaaraa AI Dijitaalaa v3.3</h4>
        </div>
        <div id="aiTerminalChatLog" className="flex-1 overflow-y-auto text-[11px] font-mono space-y-2 pr-1 mb-2 custom-scrollbar">
          <p className="text-slate-400 italic font-sans text-[10px]">Sararri terminal amansiisaa dha.</p>
          <p className="text-emerald-400 font-bold mt-1">Gargaaraa AI:</p>
          <p className="text-slate-300">Akkam! Mana barumsaa keessan irratti har'a maal si gargaaruu danda'a?</p>
        </div>
        <input
          type="text"
          placeholder="Gaaffii kee asitti barreessi..."
          onKeyDown={async (e) => {
            if (e.key === 'Enter' && e.target.value.trim()) {
              const txt = e.target.value;
              e.target.value = '';
              const log = document.getElementById('aiTerminalChatLog');
              
              // Append user text elements
              const uP1 = document.createElement('p'); uP1.className = 'text-blue-400 font-bold mt-1'; uP1.textContent = 'Isin:';
              const uP2 = document.createElement('p'); uP2.className = 'text-slate-200'; uP2.textContent = txt;
              log.appendChild(uP1); log.appendChild(uP2);
              log.scrollTop = log.scrollHeight;

              try {
                const res = await fetch('/api/ai-chat', {
                  method: 'POST', 
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ message: txt, userRole: 'Admin' })
                });
                const d = await res.json();
                
                // Append system answer elements
                const sP1 = document.createElement('p'); sP1.className = 'text-emerald-400 font-bold mt-1'; sP1.textContent = 'Gargaaraa AI:';
                const sP2 = document.createElement('p'); sP2.className = 'text-slate-300'; sP2.textContent = d.reply || 'No server reply.';
                log.appendChild(sP1); log.appendChild(sP2);
              } catch (err) {
                console.error(err);
              }
              log.scrollTop = log.scrollHeight;
            }
          }}
          className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-white outline-none text-[11px] font-sans"
        />
      </div>

      {/* QUIZ SUBMISSION QUESTIONNAIRE MODAL OVERLAY */}
      {activeQuizExam && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-md font-black text-amber-400 uppercase tracking-wide">{activeQuizExam.title}</h3>
              <button onClick={() => setActiveQuizExam(null)} className="bg-slate-900 border border-slate-800 text-slate-400 hover:text-white px-2.5 py-1 rounded text-xs font-bold uppercase transition-all">✕ Close</button>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Enter Student ID Authorization Token:</label>
              <input type="text" placeholder="e.g., STU-001" value={studentExId} onChange={(e) => setStudentExId(e.target.value.toUpperCase())} className="bg-slate-900 border border-slate-800 rounded p-2 w-full text-xs text-white outline-none font-mono" />
            </div>

            <div className="space-y-4 pt-2 border-t border-slate-900">
              {quizQuestions.map((q, qIdx) => (
                <div key={q.q_id || qIdx} className="bg-slate-900/50 p-3 rounded-lg border border-slate-900 space-y-2">
                  <p className="text-xs font-bold text-white"><span className="text-amber-400 font-mono">Q{qIdx + 1}:</span> {q.question_text}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer"><input type="radio" name={`q-${q.q_id}`} checked={studentAnswers[q.q_id] === 'A'} onChange={() => setStudentAnswers({...studentAnswers, [q.q_id]: 'A'})} /> A: {q.option_a}</label>
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer"><input type="radio" name={`q-${q.q_id}`} checked={studentAnswers[q.q_id] === 'B'} onChange={() => setStudentAnswers({...studentAnswers, [q.q_id]: 'B'})} /> B: {q.option_b}</label>
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer"><input type="radio" name={`q-${q.q_id}`} checked={studentAnswers[q.q_id] === 'C'} onChange={() => setStudentAnswers({...studentAnswers, [q.q_id]: 'C'})} /> C: {q.option_c}</label>
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer"><input type="radio" name={`q-${q.q_id}`} checked={studentAnswers[q.q_id] === 'D'} onChange={() => setStudentAnswers({...studentAnswers, [q.q_id]: 'D'})} /> D: {q.option_d}</label>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={async () => {
                if (!studentExId) return alert("Please specify a valid Student ID.");
                try {
                  const res = await fetch('/api/exams/submit', { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify({ studentId: studentExId, examId: activeQuizExam.exam_id, answers: studentAnswers }) 
                  });
                  const data = await res.json();
                  if (res.ok) { 
                    alert(`Exam grading complete! Result Output: ${data.score}%`); 
                    setActiveQuizExam(null); 
                    setStudentAnswers({}); 
                    setStudentExId(''); 
                    fetchLiveRosterData(); 
                  }
                } catch (err) {
                  console.error(err);
                }
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 py-2.5 text-white font-bold uppercase rounded text-xs transition-all shadow-md mt-4"
            >
              Submit Test 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
