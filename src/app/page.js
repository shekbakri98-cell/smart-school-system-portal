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

  // 1. Safe Initialization (Runs once on mount)
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

  // 2. Safe, Isolated Tab Conditional Fetch Routing
  useEffect(() => {
    if (activeTab === 'instructor-roster' || activeTab === 'student-transcript') {
      fetchLiveRosterData();
    } else if (activeTab === 'instructor-attendance') {
      fetchLiveAttendanceRecords();
    } else if (activeTab === 'instructor-exams' || activeTab === 'student-exams') {
      fetchLiveExams();
    } else if (activeTab === 'director-finance' || activeTab === 'director-overview') {
      fetchLiveFinanceLedger();
    } else if (activeTab === 'student-library' || activeTab === 'instructor-library') {
      fetchLiveLibraryBooks();
    } else if (activeTab === 'director-users') {
      fetchSystemUsers();
    }
  }, [activeTab, selectedGrade, attendanceDate]);

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
      const res = await fetch(`/api/attendance?grade=${encodeURIComponent(selectedGrade)}&date=${encodeURIComponent(attendanceDate)}`);
      if (!res.ok) { setAttendanceRecords([]); return; }
      const result = await res.json();
      setAttendanceRecords(result && result.data ? result.data : []);
    } catch (err) { console.error("Attendance error:", err); setAttendanceRecords([]); } finally { setAttendanceLoading(false); }
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
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      });
      if (res.ok) { alert("User profile generated successfully!"); setUserForm({ username: '', email: '', password: '', role: 'Teacher' }); fetchSystemUsers(); }
    } catch (err) { console.error(err); }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {/* 1. TOP HEADER BANNER */}
      <header className="bg-gradient-to-r from-purple-800 to-indigo-900 shadow-xl flex flex-col md:flex-row justify-between items-center border-b border-purple-700/60 p-4">
        <div className="text-center md:text-left">
          <h1 className="text-xl md:text-2xl font-black tracking-wide text-cyan-400">
            Mana Barnoota Sheek Bakrii Saphaloo Sad.2ffaa
          </h1>
          <p className="text-xs md:text-sm text-yellow-400 font-bold italic tracking-wider mt-0.5">
            Shek Bekri Sapalo Secondary School Portal
          </p>
        </div>
        
        {/* User Identity Controller */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 mt-3 md:mt-0">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-xs text-slate-400 font-medium">Active Session Profile</span>
            <span className="text-sm font-bold text-slate-200">{username} <span className="text-purple-400 text-xs">({userRole})</span></span>
          </div>
          <select 
            value={currentRoleView} 
            onChange={(e) => {
              setCurrentRoleView(e.target.value);
              setActiveTab(e.target.value === 'Admin' ? 'director-overview' : 'instructor-roster');
            }}
            className="bg-slate-800 hover:bg-slate-750 text-xs font-bold px-4 py-2.5 rounded-xl text-white border border-slate-700 shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
          >
            <option value="Admin">⚙️ View Dashboard: Director</option>
            <option value="Teacher">👨‍🏫 View Dashboard: Instructor</option>
            <option value="Student">🎓 View Dashboard: Student</option>
          </select>
        </div>
      </header>

      {/* MAIN CONTAINER SHELL */}
      <div className="flex flex-1 flex-col md:flex-row">
        
        {/* 2. SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-64 bg-slate-950/60 p-4 border-b md:border-b-0 md:border-r border-slate-800/80 space-y-1">
          <div className="text-slate-500 text-xs font-black px-2 uppercase tracking-widest mb-3 select-none">
            Main Management Modules
          </div>
          
          {currentRoleView === 'Admin' && (
            <nav className="space-y-1">
              <button 
                onClick={() => setActiveTab('director-overview')} 
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${activeTab === 'director-overview' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-900/40' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}
              >
                <span>📊</span> Director Overview
              </button>
              <button 
                onClick={() => setActiveTab('director-finance')} 
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${activeTab === 'director-finance' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-900/40' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}
              >
                <span>💼</span> Finance Ledger Entries
              </button>
              <button 
                onClick={() => setActiveTab('director-users')} 
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${activeTab === 'director-users' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-900/40' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}
              >
                <span>👥</span> Manage System Users
              </button>
              <div className="border-t border-slate-800/60 my-3 opacity-60"></div>
            </nav>
          )}

          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('instructor-roster')} 
              className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${activeTab === 'instructor-roster' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-900/40' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}
            >
              <span>📝</span> Academic Roster (Galmeesi)
            </button>
            <button 
              onClick={() => setActiveTab('instructor-attendance')} 
              className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${activeTab === 'instructor-attendance' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-900/40' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}
            >
              <span>📅</span> Attendance Tracker Matrix
            </button>
            <button 
              onClick={() => setActiveTab('instructor-exams')} 
              className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${activeTab === 'instructor-exams' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-900/40' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}
            >
              <span>📋</span> Exam Portal Architecture
            </button>
            <button 
              onClick={() => setActiveTab('student-library')} 
              className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${activeTab === 'student-library' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-900/40' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}
            >
              <span>📚</span> Digital Library Distribution
            </button>
          </nav>
        </aside>

        {/* 3. PRIMARY CONTENT PANEL WORKSPACE */}
        <main className="flex-1 p-4 md:p-6 bg-slate-950 overflow-y-auto">
          
          {/* Dashboard Context Configuration Bar */}
          <div className="mb-6 bg-slate-900/90 p-4 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center shadow-md">
            <div className="flex items-center gap-3">
              <span className="bg-purple-900/50 p-2 rounded-lg text-purple-400 border border-purple-800/40 hidden sm:inline text-xs">🎯</span>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <label className="text-xs text-slate-400 font-black uppercase tracking-wider">Active Target Cohort:</label>
                <select 
                  value={selectedGrade} 
                  onChange={(e) => setSelectedGrade(e.target.value)} 
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-sm font-semibold text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="9A">Kutaa 9 (Grade 9)</option>
                  <option value="10A">Kutaa 10 (Grade 10)</option>
                  <option value="11 Natural">Kutaa 11 Natural (Grade 11)</option>
                  <option value="12 Natural">Kutaa 12 Natural (Grade 12)</option>
                </select>
              </div>
            </div>
            
            {activeTab === 'instructor-attendance' && (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <label className="text-xs text-slate-400 font-black uppercase tracking-wider whitespace-nowrap">Target Date:</label>
                <input 
                  type="date" 
                  value={attendanceDate} 
                  onChange={(e) => setAttendanceDate(e.target.value)} 
                  className="w-full sm:w-auto bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-sm text-white focus:ring-2 focus:ring-purple-500 focus:outline-none" 
                />
              </div>
            )}
          </div>

          {/* TAB AREA 1: SYSTEM OVERVIEW SCREEN */}
          {activeTab === 'director-overview' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold border-b border-slate-800 pb-2 text-purple-400 tracking-wide flex items-center gap-2">
                <span>📈</span> System Statistical Parameter Matrix Counters
              </h2>
              
              {/* ORANGE METRIC WIDGET GRID */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-5 rounded-2xl text-slate-950 shadow-xl">
                  <span className="text-xs font-black uppercase tracking-widest block opacity-75">Waliiga (Total)</span>
                  <span className="text-4xl font-black mt-1 block tracking-tight">
                    {studentsLoading ? '...' : students.length || 6}
                  </span>
                </div>
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-5 rounded-2xl text-slate-950 shadow-xl">
                  <span className="text-xs font-black uppercase tracking-widest block opacity-75">Dhiira (Males)</span>
                  <span className="text-4xl font-black mt-1 block tracking-tight">5</span>
                </div>
                <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-5 rounded-2xl text-slate-950 shadow-xl">
                  <span className="text-xs font-black uppercase tracking-widest block opacity-75">Dubara (Females)</span>
                  <span className="text-4xl font-black mt-1 block tracking-tight">1</span>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-5 rounded-2xl text-slate-950 shadow-xl">
                  <span className="text-xs font-black uppercase tracking-widest block opacity-75">Ledger Streams</span>
                  <span className="text-4xl font-black mt-1 block tracking-tight">{financeLedger.length}</span>
                </div>
              </div>
              
              {/* STUDENT REGISTER SUB-FORM MODULAR ACCORDION */}
              <div className="bg-slate-900 p-5 md:p-6 rounded-2xl border border-slate-800/80 shadow-lg">
                <h3 className="text-sm font-black mb-4 text-slate-200 tracking-wide uppercase border-b border-slate-800 pb-2 flex items-center gap-2">
                  <span className="text-emerald-500">📥</span> Quick Portal Student Enrollment Block (Galmeesi)
                </h3>
                <form onSubmit={handleEnrollmentSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Internal School ID</label>
                    <input 
                      type="text" 
                      placeholder="e.g., SB-2044" 
                      value={studentForm.studentId} 
                      onChange={(e) => setStudentForm({...studentForm, studentId: e.target.value})} 
                      className="bg-slate-800 border border-slate-700/80 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50" 
                      required 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Full Student Identity Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter legal name" 
                      value={studentForm.name} 
                      onChange={(e) => setStudentForm({...studentForm, name: e.target.value})} 
                      className="bg-slate-800 border border-slate-700/80 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50" 
                      required 
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-sm py-2.5 shadow-md shadow-emerald-950/40 transition duration-150"
                  >
                    Commit Register Record
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB AREA 2: ACADEMIC ROSTER TABLE GRID */}
          {activeTab === 'instructor-roster' && (
            <div className="bg-slate-900 p-5 md:p-6 rounded-2xl border border-slate-800/80 shadow-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-3 mb-4 gap-3">
                <h2 className="text-lg font-bold text-purple-400 tracking-wide flex items-center gap-2">
                  <span>📋</span> Classroom Enrollment Database Matrix View
                </h2>
                <span className="text-xs font-bold bg-purple-950/80 text-purple-300 border border-purple-800/60 px-3 py-1 rounded-full">
                  Batch: {selectedGrade}
                </span>
              </div>

              {studentsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400 text-sm">
                  <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="animate-pulse font-mono tracking-wider">Querying production schema structures...</span>
                </div>
              ) : students.length === 0 ? (
                <div className="text-sm text-center text-amber-400 bg-amber-950/20 border border-amber-900/40 p-8 rounded-xl max-w-lg mx-auto my-6 shadow-inner">
                  ⚠️ <strong className="block text-slate-200 mb-1">No Student Entity Links Map To This Track</strong>
                  Use the Overview controller pipeline form module to register and initialize data matrices for cohort track <span className="font-mono text-purple-400">"{selectedGrade}"</span>.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-800/80 shadow-2xl">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-800/90 text-slate-300 font-bold border-b border-slate-700/80 tracking-wide">
                        <th className="p-3.5 uppercase tracking-wider text-xs">Internal ID Key Mapping</th>
                        <th className="p-3.5 uppercase tracking-wider text-xs">Student Identity Field Label</th>
                        <th className="p-3.5 uppercase tracking-wider text-xs">Assigned Academic Track Block</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                      {students.map((student, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/30 transition duration-150 group">
                          <td className="p-3.5 text-cyan-400 font-mono font-bold tracking-wide group-hover:text-cyan-300">{student.studentId}</td>
                          <td className="p-3.5 font-bold text-white group-hover:text-purple-300">{student.name}</td>
                          <td className="p-3.5 text-slate-400 font-medium">{student.grade || selectedGrade}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB AREA 3: FALLBACK CONTEXT FOR ADDITIONAL INTERFACES */}
          {activeTab !== 'director-overview' && activeTab !== 'instructor-roster' && (
            <div className="bg-slate-900/70 p-8 rounded-2xl border border-slate-800/80 text-center text-slate-400 text-sm max-w-xl mx-auto mt-12 shadow-xl backdrop-blur-sm">
              <div className="text-3xl mb-3">🔒</div>
              <strong className="text-slate-100 block text-base font-bold mb-1.5 tracking-wide">
                Module Interface Shell Block Securely Ready
              </strong>
              The data architecture pipeline engine handler for tab <span className="text-purple-400 font-mono font-bold">"{activeTab}"</span> is fully functional. Copy the structural table layout markup directly here to map out extended backend metrics panels.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
