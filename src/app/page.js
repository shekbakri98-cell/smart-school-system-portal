'use client';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  // Navigation & Multi-Role Perspective Console States
  const [currentRoleView, setCurrentRoleView] = useState('Director'); 
  const [activeTab, setActiveTab] = useState('director-overview'); 
  const [userRole, setUserRole] = useState('Admin'); 
  const [username, setUsername] = useState('Admin User');

  // SYSTEM SETTINGS STATES
  const [systemSettings, setSystemSettings] = useState({
    academicYear: '2019',
    semester: 'Kurmaana 1ffaa',
    maintenanceMode: false,
    allowStudentLogin: true
  });

  // PROOFAYILII STATES
  const [activeProfile, setActiveProfile] = useState({
    fullName: 'Sheek Bakri',
    email: 'admin@school.edu',
    phone: '+251 emergency services 000 000',
    address: 'Saphaloo, Ciroo',
    joinedDate: '2015-09-11',
    bio: 'Mana Barnoota Sadarkaa 2ffaa Sheek Bakri Saphaloo.'
  });

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
  const [currentQuestion, setCurrentQuestion] = useState({ text: '', a: '', b: '', correct: 'A' });

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

  // NEW CORE FEATURES: CLASS ROUTINE MATRIX DATA STATE
  const [classSchedule, setClassSchedule] = useState([
    { period: 'Period 1 (8:30 AM)', monday: 'ICT', tuesday: 'Mathematics', wednesday: 'ICT', thursday: 'Physics', friday: 'Chemistry' },
    { period: 'Period 2 (9:30 AM)', monday: 'English', tuesday: 'Afan Oromo', wednesday: 'Biology', thursday: 'Mathematics', friday: 'History' },
    { period: 'Period 3 (10:30 AM)', monday: 'Physics', tuesday: 'Chemistry', wednesday: 'English', thursday: 'Afan Oromo', friday: 'ICT' },
  ]);

  // NEW CORE FEATURES: PARENT MONITOR TRACKING STATE
  const [parentStudentSearchId, setParentStudentSearchId] = useState('');
  const [parentMonitoredStudent, setParentMonitoredStudent] = useState(null);

  // Cookieless Server Authentication Hook
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const getCookieValue = (name) => {
        const value = "; " + document.cookie;
        const parts = value.split("; " + name + "=");
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

  // API Pipelines
  async function fetchLiveRosterData() {
    setStudentsLoading(true);
    try {
      const res = await fetch("/api/students?grade=" + encodeURIComponent(selectedGrade));
      const result = await res.json();
      setStudents(result.data || []);
    } catch (err) { console.error(err); } finally { setStudentsLoading(false); }
  }

  async function fetchLiveAttendanceRecords() {
    setAttendanceLoading(true);
    try {
      const res = await fetch("/api/attendance?grade=" + encodeURIComponent(selectedGrade) + "&date=" + attendanceDate);
      const result = await res.json();
      setAttendanceRecords(result.data || []);
    } catch (err) { console.error(err); } finally { setAttendanceLoading(false); }
  }

  async function fetchLiveExams() {
    setExamsLoading(true);
    try {
      const res = await fetch("/api/exams?grade=" + encodeURIComponent(selectedGrade));
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
      const res = await fetch("/api/library?grade=" + encodeURIComponent(selectedGrade));
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

  // Submission Event Handlers
  async function handleEnrollmentSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/students', { 
        method: 'POST', headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ studentId: studentForm.studentId, name: studentForm.name, grade: selectedGrade, subject: 'ICT' }) 
      });
      if (res.ok) { alert("Barataa haaraan galmeeffameera!"); setStudentForm({ studentId: '', name: '' }); fetchLiveRosterData(); }
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
        body: JSON.stringify({ username: userForm.username, email: userForm.email, password: userForm.password, role: userForm.role }) 
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
      alert("⚠️ Validation Rejected! Maximum allowed points score benchmark for " + fieldName + " is exactly " + maxLimits[fieldName] + " marks.");
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
    setCurrentQuestion({ text: '', a: '', b: '', correct: 'A' });
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
    financeLedger.forEach(r => { csv += r.studentId + "," + (r.name ? r.name.replace(/,/g, " ") : "Student") + "," + r.fee_type + "," + r.amount_due + "," + r.amount_paid + "," + r.payment_status + "\n"; });
    const encodedUri = encodeURI(csv);
    const a = document.createElement("a"); a.setAttribute("href", encodedUri); a.setAttribute("download", "sheek_bakri_revenue_ledger.csv");
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }

  function triggerStudentReportCardPrint(student) {
    const pWin = window.open('', '_blank');
    pWin.document.write("<html><head><title>Certificate - " + student.name + "</title></head><body style='font-family:monospace; padding:30px;'><h2>SHEEK BAKRI SECONDARY SCHOOL CERTIFICATE</h2><hr/><p><strong>Student:</strong> " + student.name + " (" + student.studentId + ")</p><p><strong>Total Marks Accumulated:</strong> " + (student.totalScore || 0) + " / 100</p><script>window.print();</script></body></html>");
    pWin.document.close();
  }

  function handleLogoutSequence() {
    localStorage.clear();
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = '/login';
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-6">
      
      {/* ENTERPRISE VIEW CONTROL PANEL HEADER */}
      <header className="max-w-6xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-700 pb-4 gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">SHEK BAKRI SECONDARY SCHOOL PORTAL</h1>
          <p className="text-[10px] text-amber-500 font-mono uppercase tracking-widest">BAGA NAGAAN DHUFTAN // WELCOME: {username}</p>
        </div>
        
        {/* INTERACTIVE MULTI-ROLE PERSPECTIVE NAVIGATION SWITCHER */}
        <div className="flex flex-wrap items-center bg-[#1e293b] border border-slate-700 rounded-lg p-1 text-[11px] font-mono gap-1">
          <span className="text-slate-400 px-2 uppercase text-[9px] font-bold">Daawwannaa:</span>
          
          {userRole && userRole.toUpperCase() === 'ADMIN' && (
            <button onClick={() => { setCurrentRoleView('Director'); setActiveTab('director-overview'); }} className={"px-2.5 py-1 rounded transition-all font-bold " + (currentRoleView === 'Director' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white')}>👨‍💼 Daayirektara</button>
          )}
          
          {(userRole && (userRole.toUpperCase() === 'TEACHER' || userRole.toUpperCase() === 'ADMIN')) && (
            <button onClick={() => { setCurrentRoleView('Instructor'); setActiveTab('instructor-roster'); }} className={"px-2.5 py-1 rounded transition-all font-bold " + (currentRoleView === 'Instructor' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white')}>👩‍🏫 Barsiisaa</button>
          )}
          
          <button onClick={() => { setCurrentRoleView('Student'); setActiveTab('student-transcript'); }} className={"px-2.5 py-1 rounded transition-all font-bold " + (currentRoleView === 'Student' ? 'bg-amber-600 text-black shadow' : 'text-slate-400 hover:text-white')}>🎒 Barataa</button>
          
          {/* NEW ACCOUNT PERSPECTIVE INTERACTIVE TRIGGER NODE */}
          <button onClick={() => { setCurrentRoleView('Parent'); setActiveTab('parent-monitor'); }} className={"px-2.5 py-1 rounded transition-all font-bold " + (currentRoleView === 'Parent' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white')}>👪 Haadha/Abbaa</button>
          
          <button onClick={handleLogoutSequence} className="ml-2 bg-red-950/40 border border-red-900 text-red-400 text-[10px] px-2 py-1 rounded">Ba’i</button>
        </div>
      </header>

      {/* DYNAMIC CONTEXTUAL NAVBAR */}
      <nav className="max-w-6xl mx-auto mb-6 flex flex-wrap bg-[#1e293b] p-1 rounded-lg border border-slate-700 text-xs font-mono gap-1">
        {currentRoleView === 'Director' && (
          <>
            <button onClick={() => setActiveTab('director-overview')} className={"flex-1 py-2 rounded font-bold uppercase text-center " + (activeTab === 'director-overview' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white')}>📊 Fayyaalessa Hojii</button>
            <button onClick={() => setActiveTab('director-finance')} className={"flex-1 py-2 rounded font-bold uppercase text-center " + (activeTab === 'director-finance' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white')}>💳 Galmee Galii</button>
            <button onClick={() => setActiveTab('director-users')} className={"flex-1 py-2 rounded font-bold uppercase text-center " + (activeTab === 'director-users' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white')}>🔒 Galmee Barsiisotaa</button>
            <button onClick={() => setActiveTab('system-settings')} className={"flex-1 py-2 rounded font-bold uppercase text-center " + (activeTab === 'system-settings' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white')}>⚙️ Sirreeffama</button>
          </>
        )}
        {currentRoleView === 'Instructor' && (
          <>
            <button onClick={() => setActiveTab('instructor-roster')} className={"flex-1 py-2 rounded font-bold uppercase text-center " + (activeTab === 'instructor-roster' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white')}>📝 Kuusaa Qabxii</button>
            <button onClick={() => setActiveTab('instructor-attendance')} className={"flex-1 py-2 rounded font-bold uppercase text-center " + (activeTab === 'instructor-attendance' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white')}>📅 Hordoffii Hirmaannaa</button>
            <button onClick={() => setActiveTab('instructor-exams')} className={"flex-1 py-2 rounded font-bold uppercase text-center " + (activeTab === 'instructor-exams' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white')}>📝 Qormaata Baasuu</button>
            <button onClick={() => setActiveTab('instructor-library')} className={"flex-1 py-2 rounded font-bold uppercase text-center " + (activeTab === 'instructor-library' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white')}>📚 Kuusaa Kitaabaa</button>
            <button onClick={() => setActiveTab('teacher-profile')} className={"flex-1 py-2 rounded font-bold uppercase text-center " + (activeTab === 'teacher-profile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white')}>👤 Piroofayilii</button>
          </>
        )}
        {currentRoleView === 'Student' && (
          <>
            <button onClick={() => setActiveTab('student-transcript')} className={"flex-1 py-2 rounded font-bold uppercase text-center " + (activeTab === 'student-transcript' ? 'bg-amber-600 text-black' : 'text-slate-400 hover:text-white')}>🎓 Teessoo Qabxii Koo</button>
            <button onClick={() => setActiveTab('student-exams')} className={"flex-1 py-2 rounded font-bold uppercase text-center " + (activeTab === 'student-exams' ? 'bg-amber-600 text-black' : 'text-slate-400 hover:text-white')}>📝 Wiirtuu Qormaataa</button>
            <button onClick={() => setActiveTab('student-library')} className={"flex-1 py-2 rounded font-bold uppercase text-center " + (activeTab === 'student-library' ? 'bg-amber-600 text-black' : 'text-slate-400 hover:text-white')}>📚 Kitaabbati Dijitaalaa</button>
            <button onClick={() => setActiveTab('class-schedule')} className={"flex-1 py-2 rounded font-bold uppercase text-center " + (activeTab === 'class-schedule' ? 'bg-amber-600 text-black' : 'text-slate-400 hover:text-white')}>📅 Sagantaa Daree</button>
            <button onClick={() => setActiveTab('student-profile')} className={"flex-1 py-2 rounded font-bold uppercase text-center " + (activeTab === 'student-profile' ? 'bg-amber-600 text-black' : 'text-slate-400 hover:text-white')}>👤 Piroofayilii</button>
          </>
        )}
        {currentRoleView === 'Parent' && (
          <>
            <button onClick={() => setActiveTab('parent-monitor')} className={"flex-1 py-2 rounded font-bold uppercase text-center " + (activeTab === 'parent-monitor' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white')}>🔍 Hordoffii Barataa</button>
            <button onClick={() => setActiveTab('class-schedule')} className={"flex-1 py-2 rounded font-bold uppercase text-center " + (activeTab === 'class-schedule' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white')}>📅 Sagantaa Daree</button>
          </>
        )}
      </nav>

      <main className="max-w-6xl mx-auto">
        {/* VIEW 1: EXECUTIVE DIRECTOR OVERVIEW WITH METRIC ANALYTICAL BARS */}
        {activeTab === 'director-overview' && (
          <div className="space-y-6 font-mono text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-700 flex flex-col justify-between shadow-xl">
                <div>
                  <span className="text-slate-300 text-[10px] uppercase font-bold tracking-wider">Waliigala Gali Masruufaa</span>
                  <span className="text-2xl font-black text-emerald-400 mt-2 block">ETB {financeLedger.reduce((acc, curr) => acc + Number(curr.amount_paid || 0), 0).toLocaleString()}</span>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-700">
                  <div className="flex justify-between text-[9px] text-slate-400 mb-1"><span>Milkaa&apos;ina Targetii</span><span>74%</span></div>
                  <svg className="w-full h-1.5 bg-[#0f172a] rounded-full overflow-hidden">
                    <rect x="0" y="0" width="74%" height="100%" fill="#10b981" />
                  </svg>
                </div>
              </div>

              <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-700 flex flex-col justify-between shadow-xl">
                <div>
                  <span className="text-slate-300 text-[10px] uppercase font-bold tracking-wider">Giddu-galeessa Qabxii ICT</span>
                  <span className="text-2xl font-black text-blue-400 mt-2 block">78.4%</span>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-700">
                  <div className="flex justify-between text-[9px] text-slate-400 mb-1"><span>Xumura Silabasii</span><span>78.4%</span></div>
                  <svg className="w-full h-1.5 bg-[#0f172a] rounded-full overflow-hidden">
                    <rect x="0" y="0" width="78.4%" height="100%" fill="#3b82f6" />
                  </svg>
                </div>
              </div>

              <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-700 flex flex-col justify-between shadow-xl">
                <div>
                  <span className="text-slate-300 text-[10px] uppercase font-bold tracking-wider">Reetii Darbiinsa Waliigalaa</span>
                  <span className="text-2xl font-black text-amber-400 mt-2 block">92.1%</span>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-700">
                  <div className="flex justify-between text-[9px] text-slate-400 mb-1"><span>Barattoota Darban</span><span>92.1%</span></div>
                  <svg className="w-full h-1.5 bg-[#0f172a] rounded-full overflow-hidden">
                    <rect x="0" y="0" width="92.1%" height="100%" fill="#f59e0b" />
                  </svg>
                </div>
              </div>
            </div>

            {/* UPGRADED FINANCE ANALYTICS PROGRESS SEGMENTATION BLOCKS */}
            <div className="space-y-4 bg-[#1e293b] p-6 rounded-xl border border-slate-700 shadow-xl">
              <h3 className="font-bold text-white uppercase text-xs">📊 Giddu-galeessa Kaffaltii (Fee Collection Breakdown)</h3>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">Kaffaltii Kurmaana 1ffaa (Tuition Q1 Targets)</span>
                  <span className="text-emerald-400 font-bold">82% Recouped</span>
                </div>
                <div className="w-full h-3 bg-[#0f172a] rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-gradient-to-r from-emerald-600 to-green-400" style={{ width: '82%' }}></div>
                </div>
              </div>
              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">Kaffaltii Galmeessaa & Kitaabaa (Registration Extra Fees)</span>
                  <span className="text-blue-400 font-bold">55% Recouped</span>
                </div>
                <div className="w-full h-3 bg-[#0f172a] rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-400" style={{ width: '55%' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: REVENUE DATA MANAGEMENT */}
        {activeTab === 'director-finance' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
            <section className="bg-[#1e293b] p-4 rounded-lg border border-slate-700 space-y-3 shadow-xl">
              <h2 className="font-bold border-b border-slate-700 pb-1 text-white uppercase text-xs">Kaffaltii Galmeessi</h2>
              {userRole === 'Admin' ? (
                <form onSubmit={handleFinanceSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">ID Barataa</label>
                    <input type="text" value={financeForm.studentId} onChange={e => setFinanceForm({...financeForm, studentId: e.target.value})} className="w-full bg-[#0f172a] border border-slate-700 p-2 text-white outline-none rounded" required />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Ramaddii Kaffaltii</label>
                    <select value={financeForm.feeType} onChange={e => setFinanceForm({...financeForm, feeType: e.target.value})} className="w-full bg-[#0f172a] border border-slate-700 p-2 text-white outline-none rounded cursor-pointer">
                      <option value="Tuition Q1">Kaffaltii Kurmaana 1ffaa</option>
                      <option value="Tuition Q2">Kaffaltii Kurmaana 2ffaa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Idaa Waliigalaa</label>
                    <input type="number" value={financeForm.amountDue} onChange={e => setFinanceForm({...financeForm, amountDue: e.target.value})} className="w-full bg-[#0f172a] border border-slate-700 p-2 text-white outline-none rounded" required />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Hanga Kaffalame</label>
                    <input type="number" value={financeForm.amountPaid} onChange={e => setFinanceForm({...financeForm, amountPaid: e.target.value})} className="w-full bg-[#0f172a] border border-slate-700 p-2 text-white outline-none rounded" required />
                  </div>
                  <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold p-2 rounded uppercase">Commit Dues</button>
                </form>
              ) : (
                <div className="p-4 text-center text-red-400 bg-[#0f172a] border border-red-900/30 rounded-lg">⚠️ Admin authorization layer required.</div>
              )}
            </section>
            
            <section className="lg:col-span-2 bg-[#1e293b] p-4 rounded-lg border border-slate-700 shadow-xl">
              <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-3">
                <h3 className="font-bold text-slate-200 text-xs">Galmee Herregaa Waliigalaa</h3>
                <button onClick={triggerFinanceCSVExport} className="bg-purple-950/60 text-purple-400 px-2 py-1 rounded border border-purple-800 text-[10px] font-bold uppercase">📥 Sanada Baasi</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead>
                    <tr className="text-slate-400 text-[10px] uppercase border-b border-slate-700"><th className="pb-2">ID Barataa</th><th>Maqaa</th><th>Ramaddii</th><th>Idaa</th><th>Kaffalame</th><th className="text-right">Haala Kaffaltii</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {financeLedger.map((f, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 font-bold text-purple-400">{f.studentId}</td>
                        <td>{f.name}</td><td>{f.fee_type}</td><td>ETB {f.amount_due}</td><td>ETB {f.amount_paid}</td>
                        <td className="text-right">
                          <span className={"px-2 py-0.5 rounded text-[10px] font-bold border " + (f.payment_status === 'Paid' ? 'border-emerald-800 text-emerald-400 bg-emerald-950/20' : 'border-amber-800 text-amber-400 bg-amber-950/20')}>{f.payment_status === 'Paid' ? 'Kaffalameera' : 'Hanga Tokko'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* VIEW 3: INSTRUCTOR ROSTER MATRIX */}
        {activeTab === 'instructor-roster' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
            <section className="bg-[#1e293b] p-4 rounded-lg border border-slate-700 h-fit space-y-3 shadow-xl">
              <h2 className="font-bold border-b border-slate-700 pb-1 text-slate-100 uppercase text-xs">Barataa Haaraa Galmeessi</h2>
              <form onSubmit={handleEnrollmentSubmit} className="space-y-2">
                <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 p-2 text-white outline-none rounded cursor-pointer">
                  <option value="12 Natural">12 Natural</option><option value="12 Social">12 Social</option>
                </select>
                <input type="text" placeholder="ID Barataa" value={studentForm.studentId} onChange={e => setStudentForm({...studentForm, studentId: e.target.value})} className="w-full bg-[#0f172a] border border-slate-700 p-2 text-white outline-none rounded" required />
                <input type="text" placeholder="Maqaa Guutuu" value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} className="w-full bg-[#0f172a] border border-slate-700 p-2 text-white outline-none rounded" required />
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 p-2 text-white font-bold rounded uppercase">Kuusi Galmeessi</button>
              </form>
            </section>

            <section className="lg:col-span-2 bg-[#1e293b] p-4 rounded-lg border border-slate-700 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-200 text-xs">Galmee Qabxii Barattootaa</h3>
                <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="bg-[#0f172a] border border-slate-700 p-1 text-white rounded text-xs cursor-pointer">
                  <option value="12 Natural">12 Natural</option><option value="12 Social">12 Social</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 text-[10px] uppercase font-bold"><th>ID</th><th>Maqaa Barataa</th><th>T1 (10)</th><th>T2 (10)</th><th>Asgn (20)</th><th>Final (60)</th><th className="text-center">Waliigala</th><th className="text-right">Waraqa</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700 text-slate-300">
                    {students.map((s, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 font-bold text-blue-400">{s.studentId}</td>
                        <td className="font-semibold text-slate-100">{s.name}</td>
                        <td><input type="number" defaultValue={s.test1} onBlur={e => handleCellUpdateSubmit(s.studentId, s.subject || 'ICT', 'test1', e.target.value)} className="w-12 bg-[#0f172a] text-center rounded border border-slate-700 text-white p-1" /></td>
                        <td><input type="number" defaultValue={s.test2} onBlur={e => handleCellUpdateSubmit(s.studentId, s.subject || 'ICT', 'test2', e.target.value)} className="w-12 bg-[#0f172a] text-center rounded border border-slate-700 text-white p-1" /></td>
                        <td><input type="number" defaultValue={s.assignment} onBlur={e => handleCellUpdateSubmit(s.studentId, s.subject || 'ICT', 'assignment', e.target.value)} className="w-12 bg-[#0f172a] text-center rounded border border-slate-700 text-white p-1" /></td>
                        <td><input type="number" defaultValue={s.finalExam} onBlur={e => handleCellUpdateSubmit(s.studentId, s.subject || 'ICT', 'finalExam', e.target.value)} className="w-12 bg-[#0f172a] text-center rounded border border-slate-700 text-white p-1" /></td>
                        <td className="text-center font-black text-emerald-400">{s.totalScore || 0}</td>
                        <td className="text-right"><button onClick={() => triggerStudentReportCardPrint(s)} className="bg-slate-700 text-amber-400 border border-slate-600 font-bold px-2 py-1 rounded text-[10px]">🖨️ Cert</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* VIEW 4: ATTENDANCE SYSTEM */}
        {activeTab === 'instructor-attendance' && (
          <section className="bg-[#1e293b] p-4 rounded-lg border border-slate-700 text-xs font-mono shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-3">
              <h3 className="font-bold uppercase text-slate-200 text-xs">Daily Attendance Matrix</h3>
              <div className="flex gap-2 text-white">
                <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="bg-[#0f172a] border border-slate-700 p-1 rounded text-xs cursor-pointer"><option value="12 Natural">12 Natural</option><option value="12 Social">12 Social</option></select>
                <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} className="bg-[#0f172a] border border-slate-700 p-1 rounded text-xs" />
              </div>
            </div>
            <table className="w-full text-left">
              <thead><tr className="border-b border-slate-700 text-slate-400 uppercase text-[10px]"><th>ID Barataa</th><th>Maqaa Guutuu</th><th className="text-right">Hordoffii Galmee</th></tr></thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {attendanceRecords.map((s, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 text-blue-400 font-bold">{s.studentId}</td><td className="font-semibold text-slate-200">{s.name}</td>
                    <td className="text-right">
                      <select value={s.status || 'Not Marked'} onChange={(e) => handleAttendanceCellChange(s.studentId, e.target.value)} className="bg-[#0f172a] border rounded p-1 font-bold outline-none cursor-pointer"><option value="Not Marked">Not Marked</option><option value="Present">Present</option><option value="Absent">Absent</option></select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* VIEW 5: EXAM DEPLOYMENT MODULE */}
        {activeTab === 'instructor-exams' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
            <section className="bg-[#1e293b] p-4 rounded-lg border border-slate-700 space-y-3 shadow-xl">
              <h2 className="font-bold border-b border-slate-700 pb-1 text-white uppercase text-xs">Deploy Examination</h2>
              <form onSubmit={handleExamPublishSubmit} className="space-y-2">
                <input type="text" placeholder="Exam Title" value={examForm.title} onChange={e => setExamForm({...examForm, title: e.target.value})} className="w-full bg-[#0f172a] border border-slate-700 p-2 text-white outline-none rounded" required />
                <div className="bg-[#0f172a] border border-slate-700 p-2 rounded space-y-2">
                  <textarea placeholder="Question Text" value={currentQuestion.text} onChange={e => setCurrentQuestion({...currentQuestion, text: e.target.value})} className="w-full bg-[#1e293b] border border-slate-700 p-1.5 rounded h-12 text-white outline-none resize-none"></textarea>
                  <input type="text" placeholder="Option A" value={currentQuestion.a} onChange={e => setCurrentQuestion({...currentQuestion, a: e.target.value})} className="w-full bg-[#1e293b] border border-slate-700 p-1 text-white rounded outline-none" required />
                  <input type="text" placeholder="Option B" value={currentQuestion.b} onChange={e => setCurrentQuestion({...currentQuestion, b: e.target.value})} className="w-full bg-[#1e293b] border border-slate-700 p-1 text-white rounded outline-none" required />
                  <select value={currentQuestion.correct} onChange={e => setCurrentQuestion({...currentQuestion, correct: e.target.value})} className="w-full bg-[#1e293b] border border-slate-700 p-1 text-white rounded cursor-pointer"><option value="A">Key: A</option><option value="B">Key: B</option></select>
                  <button type="button" onClick={addQuestionToFormState} className="w-full py-1 bg-slate-800 text-amber-400 font-bold border border-slate-700 rounded text-[10px]">SAVE ENTRY ({examForm.questions.length})</button>
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded uppercase">Publish Manual Quiz</button>
              </form>
            </section>
            <section className="lg:col-span-2 bg-[#1e293b] p-4 rounded-lg border border-slate-700 shadow-xl">
              <h3 className="font-bold border-b border-slate-700 pb-2 mb-3 text-slate-200 text-xs">Active Testing Matrix</h3>
              <div className="space-y-2">
                {exams.map((ex, idx) => (
                  <div key={idx} className="p-3 bg-[#0f172a] border border-slate-700 rounded-xl flex justify-between items-center">
                    <div><p className="font-bold text-slate-200">{ex.title}</p><p className="text-[10px] text-slate-500 uppercase mt-0.5">Subject: {ex.subject} // Track: {ex.grade_section}</p></div>
                    <span className="text-[10px] bg-slate-800 border border-slate-700 px-2 py-1 rounded text-slate-400 font-bold uppercase">Active Live</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* VIEW 6: DIGITAL CLASS SCHEDULE MATRIX CONTAINER BLOCK */}
        {activeTab === 'class-schedule' && (
          <section className="bg-[#1e293b] p-5 rounded-xl border border-slate-700 font-mono text-xs max-w-4xl mx-auto space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase border-b border-slate-700 pb-2">📅 Sagantaa Daree Waliigalaa (Class Routine Matrix)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0f172a] text-slate-400 text-[10px] uppercase border-b border-slate-700"><th className="p-3">Waktiika (Period)</th><th className="p-3">Wiixata (Mon)</th><th className="p-3">Kibxata (Tue)</th><th className="p-3">Roobii (Wed)</th><th className="p-3">Kamisa (Thu)</th><th className="p-3">Jimata (Fri)</th></tr>
                </thead>
                <tbody className="text-slate-200 divide-y divide-slate-800">
                  {classSchedule.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#0f172a]/30 transition-colors">
                      <td className="p-3 font-bold text-blue-400 bg-[#0f172a]/20">{row.period}</td>
                      <td className="p-3">{row.monday}</td><td className="p-3">{row.tuesday}</td><td className="p-3">{row.wednesday}</td><td className="p-3">{row.thursday}</td><td className="p-3">{row.friday}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* VIEW 7: COMPREHENSIVE PARENT MONITOR SECTION */}
        {activeTab === 'parent-monitor' && (
          <section className="bg-[#1e293b] p-5 rounded-xl border border-slate-700 font-mono text-xs max-w-xl mx-auto space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-emerald-400 uppercase border-b border-slate-700 pb-2">👪 Wiirtuu Hordoffii Warraa (Parent Activity Tracker)</h3>
            <p className="text-slate-400 text-[11px]">Siriin kun warri qabxii fi hirmaannaa ijoollee isaanii akka hordofaniif gargaara. (Enter your child's student ID card metrics to calculate progress).</p>
            <div className="flex gap-2 bg-[#0f172a] p-3 rounded-lg border border-slate-800">
              <input type="text" placeholder="e.g., SMS/001" value={parentStudentSearchId} onChange={(e) => setParentStudentSearchId(e.target.value)} className="flex-1 bg-[#1e293b] border border-slate-700 rounded p-2 text-white outline-none focus:border-emerald-500" />
              <button onClick={() => {
                const match = students.find(s => s.studentId.toUpperCase() === parentStudentSearchId.toUpperCase());
                if (match) { setParentMonitoredStudent(match); } 
                else { alert("Barataan ID kanaan argame hin jiru! (Record match mismatch)."); }
              }} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 rounded font-bold uppercase">Baradi</button>
            </div>
            {parentMonitoredStudent && (
              <div className="mt-4 p-4 bg-[#0f172a] border border-slate-800 rounded-xl space-y-3">
                <p className="text-slate-400 font-bold border-b border-slate-800 pb-1 uppercase text-[10px]">Target Student: <span className="text-white">{parentMonitoredStudent.name}</span></p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-[#141b2d] p-2.5 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[9px] uppercase">Waliigala Qabxii (Cumulative Marks)</span>
                    <span className="text-base font-black text-emerald-400 mt-1 block">{parentMonitoredStudent.totalScore || 0} / 100</span>
                  </div>
                  <div className="bg-[#141b2d] p-2.5 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[9px] uppercase">Haala Kaffaltii (Financial Status)</span>
                    <span className="text-amber-400 font-bold mt-2 block text-[10px]">Settled Enrolled</span>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* VIEW 8: USER LOG TRANSCRIPTS */}
        {activeTab === 'student-transcript' && (
          <section className="bg-[#1e293b] p-5 rounded-xl border border-slate-700 font-mono text-xs max-w-3xl mx-auto space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase border-b border-slate-700 pb-2">Academic Registry Card</h3>
            <table className="w-full text-left">
              <thead><tr className="text-slate-400 text-[10px] uppercase"><th>Student ID</th><th>Full Name</th><th>Test 1</th><th>Test 2</th><th>Assignment</th><th>Final Exam</th><th className="text-right">Total Score</th></tr></thead>
              <tbody className="text-slate-200">
                {students.map((s, idx) => (
                  <tr key={idx}>
                    <td className="py-3 font-bold text-amber-400">{s.studentId}</td><td className="font-semibold">{s.name}</td>
                    <td>{s.test1 || 0} / 10</td><td>{s.test2 || 0} / 10</td><td>{s.assignment || 0} / 20</td><td>{s.finalExam || 0} / 60</td>
                    <td className="text-right font-black text-emerald-400 text-sm">{s.totalScore || 0} / 100</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>

      {/* FLOATING DIGITAL AI ASSISTANT TERMINAL */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-[#1e293b]/95 border border-emerald-500/30 shadow-2xl rounded-2xl p-4 w-76 space-y-3 font-mono text-xs backdrop-blur-md">
          <div className="flex justify-between items-center border-b border-slate-700 pb-2">
            <div className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span><span className="font-bold text-emerald-400">Gargaaraa AI Dijitaalaa</span></div>
            <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">v3.3</span>
          </div>
          <div className="h-36 overflow-y-auto bg-[#0a0f1d] p-2.5 rounded-xl text-slate-300 space-y-2" id="aiTerminalChatLog">
            <p className="text-slate-500 text-[10px]">// Secure terminal bridge initialized.</p>
            <p className="text-emerald-400 font-bold">Gargaaraa AI:</p><p>Akkam! Mana barumsaa keessan irratti har&apos;a maal si gargaaruu danda&apos;a?</p>
          </div>
          <input type="text" placeholder="Gaaffii kee asitti barreessi..." onKeyDown={async (e) => {
            if (e.key === 'Enter' && e.target.value.trim()) {
              const txt = e.target.value; e.target.value = '';
              const log = document.getElementById('aiTerminalChatLog');
              log.innerHTML += `<p class="text-blue-400 font-bold mt-1">Isin:</p><p class="text-slate-200">` + txt + `</p>`;
              const res = await fetch('/api/ai-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: txt, userRole: 'Admin' }) });
              const d = await res.json();
              log.innerHTML += `<p class="text-emerald-400 font-bold mt-1">Gargaaraa AI:</p><p class="text-slate-300">` + d.reply + `</p>`;
              log.scrollTop = log.scrollHeight;
            }
          }} className="w-full bg-[#0a0f1d] border border-slate-800 focus:border-emerald-500 rounded-xl p-2.5 text-white outline-none" />
        </div>
      </div>

    </div>
  );
}
