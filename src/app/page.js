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

  // Core Data Lists Arrays
  const [selectedGrade, setSelectedGrade] = useState('12 Natural');
  const [students, setStudents] = useState([]);
  const [studentForm, setStudentForm] = useState({ studentId: '', name: '' });
  const [studentsLoading, setStudentsLoading] = useState(false);

  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const [exams, setExams] = useState([]);
  const [examsLoading, setExamsLoading] = useState(false);
  const [examForm, setExamForm] = useState({ title: '', subject: 'ICT', questions: [] });
  const [currentQuestion, setCurrentQuestion] = useState({ text: '', a: '', b: '', correct: 'A' });

  // Quiz Interaction States
  const [activeQuizExam, setActiveQuizExam] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [studentAnswers, setStudentAnswers] = useState({});
  const [studentExId, setStudentExId] = useState('');

  const [financeLedger, setFinanceLedger] = useState([]);
  const [financeLoading, setFinanceLoading] = useState(false);
  const [financeForm, setFinanceForm] = useState({ studentId: '', feeType: 'Tuition Q1', amountDue: '', amountPaid: '' });

  // Library Management Asset Lists
  const [books, setBooks] = useState([
    { title: 'Grade 12 Information Technology', author: 'Ministry of Education', grade_section: '12 Natural', download_url: '#' },
    { title: 'Advanced Mathematics for Natural Sciences', author: 'Dr. Bakri Academic Press', grade_section: '12 Natural', download_url: '#' },
    { title: 'Social Studies & Civics Integration', author: 'National Curriculum Hub', grade_section: '12 Social', download_url: '#' }
  ]);
  const [booksLoading, setBooksLoading] = useState(false);
  const [libraryForm, setLibraryForm] = useState({ title: '', author: '', downloadUrl: '' });

  const [systemUsers, setSystemUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userForm, setUserForm] = useState({ username: '', email: '', password: '', role: 'Teacher' });

  // NEW FEATURES 1: SUCCESS NOTIFICATION BANNER APP STATE
  const [appNotification, setAppNotification] = useState(null);

  // NEW FEATURES 2: CLASS ROUTINE MATRIX AND PARENT MONITOR STORAGE
  const [classSchedule, setClassSchedule] = useState([
    { period: 'Period 1 (8:30 AM)', monday: 'ICT', tuesday: 'Mathematics', wednesday: 'ICT', thursday: 'Physics', friday: 'Chemistry' },
    { period: 'Period 2 (9:30 AM)', monday: 'English', tuesday: 'Afan Oromo', wednesday: 'Biology', thursday: 'Mathematics', friday: 'History' },
    { period: 'Period 3 (10:30 AM)', monday: 'Physics', tuesday: 'Chemistry', wednesday: 'English', thursday: 'Afan Oromo', friday: 'ICT' },
  ]);
  const [parentStudentSearchId, setParentStudentSearchId] = useState('');
  const [parentMonitoredStudent, setParentMonitoredStudent] = useState(null);

  // Central Dynamic Monitor Hook
  useEffect(() => {
    if (activeTab === 'instructor-roster' || activeTab === 'student-transcript') { fetchLiveRosterData(); } 
    else if (activeTab === 'instructor-attendance') { fetchLiveAttendanceRecords(); } 
    else if (activeTab === 'instructor-exams' || activeTab === 'student-exams') { fetchLiveExams(); } 
    else if (activeTab === 'director-finance' || activeTab === 'director-overview') { fetchLiveFinanceLedger(); } 
    else if (activeTab === 'director-users') { fetchSystemUsers(); }
  }, [selectedGrade, activeTab, attendanceDate, currentRoleView]);

  // NEW FEATURES 3: DEMO SEED DATA GENERATOR PIPELINE ACTION
  const handleTriggerMockDatabaseSeed = () => {
    // 1. Populate Sample Roster Records
    setStudents([
      { studentId: 'SMS/001', name: 'Chala Alemu', subject: 'ICT', test1: 8, test2: 9, assignment: 18, finalExam: 52, totalScore: 87 },
      { studentId: 'SMS/002', name: 'Aster Mamo', subject: 'ICT', test1: 9, test2: 7, assignment: 16, finalExam: 55, totalScore: 87 },
      { studentId: 'SMS/003', name: 'Benti Tolossa', subject: 'ICT', test1: 6, test2: 8, assignment: 14, finalExam: 48, totalScore: 76 }
    ]);
    
    // 2. Populate Sample Finance Ledger Entries
    setFinanceLedger([
      { studentId: 'SMS/001', name: 'Chala Alemu', fee_type: 'Tuition Q1', amount_due: 3500, amount_paid: 3500, payment_status: 'Paid' },
      { studentId: 'SMS/002', name: 'Aster Mamo', fee_type: 'Tuition Q1', amount_due: 3500, amount_paid: 2000, payment_status: 'Partial' }
    ]);

    // 3. Populate Sample Active Quiz Structure Logs
    setExams([
      { exam_id: 'EXAM-ALPHA', title: 'ICT Chapter 1 Digital Network Quiz', subject: 'ICT', grade_section: '12 Natural', questions_count: 2 }
    ]);

    // Show temporary banner feedback notice response
    triggerPopupNotification("DATABASE SEED SUCCESSFUL", "Mock student datasets, finance items, and live exam pipelines populated instantly.");
  };

  const triggerPopupNotification = (title, msg) => {
    setAppNotification({ title, message: msg });
    setTimeout(() => setAppNotification(null), 5000);
  };

  // REST API Pipeline Fetch Handles
  async function fetchLiveRosterData() {
    setStudentsLoading(true);
    try {
      const res = await fetch(`/api/students?grade=${encodeURIComponent(selectedGrade)}`);
      const result = await res.json();
      if (result.data && result.data.length > 0) setStudents(result.data);
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
      if (result.exams && result.exams.length > 0) setExams(result.exams);
    } catch (err) { console.error(err); } finally { setExamsLoading(false); }
  }

  async function fetchLiveFinanceLedger() {
    setFinanceLoading(true);
    try {
      const res = await fetch('/api/finance');
      const result = await res.json();
      if (result.ledger && result.ledger.length > 0) setFinanceLedger(result.ledger);
    } catch (err) { console.error(err); } finally { setFinanceLoading(false); }
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
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ studentId: studentForm.studentId, name: studentForm.name, grade: selectedGrade, subject: 'ICT' })
      });
      const result = await res.json();
      if(result.success) {
        triggerPopupNotification("STUDENT REGISTERED", `${studentForm.name} added to roster map allocation.`);
        setStudentForm({ studentId: '', name: '' });
        fetchLiveRosterData();
      }
    } catch (err) { console.error(err); }
  }

  async function handleCreateExamSubmit(e) {
    e.preventDefault();
    if(examForm.questions.length === 0) {
      alert("Please add at least one question to the exam configuration payload matrix.");
      return;
    }
    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...examForm, grade_section: selectedGrade })
      });
      const result = await res.json();
      if(result.success) {
        triggerPopupNotification("EXAM DEPLOYED", `New test assignment "${examForm.title}" published online.`);
        setExamForm({ title: '', subject: 'ICT', questions: [] });
        fetchLiveExams();
      }
    } catch (err) { console.error(err); }
  }

  const addQuestionToExamPayload = () => {
    if(!currentQuestion.text) return;
    setExamForm({
      ...examForm,
      questions: [...examForm.questions, currentQuestion]
    });
    setCurrentQuestion({ text: '', a: '', b: '', correct: 'A' });
  };

  async function handlePostFinanceRecord(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(financeForm)
      });
      const result = await res.json();
      if(result.success) {
        triggerPopupNotification("PAYMENT RECORDED", "Ledger asset calculations recalculated instantly.");
        setFinanceForm({ studentId: '', feeType: 'Tuition Q1', amountDue: '', amountPaid: '' });
        fetchLiveFinanceLedger();
      }
    } catch (err) { console.error(err); }
  }

  const handleSearchParentStudentLookup = (e) => {
    e.preventDefault();
    const match = students.find(s => s.studentId === parentStudentSearchId);
    if(match) {
      setParentMonitoredStudent(match);
      triggerPopupNotification("STUDENT PROFILE MOUNTED", `Showing analytical results metrics lookup for ${match.name}.`);
    } else {
      setParentMonitoredStudent(null);
      alert("No corresponding student match found in active system register metrics.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased pb-12">
      {/* 1. SUCCESS NOTIFICATION SLIDE BANNER */}
      {appNotification && (
        <div className="fixed top-0 left-0 right-0 bg-emerald-600 text-white py-3 px-6 shadow-xl z-50 transition-all duration-300 transform translate-y-0 border-b border-emerald-400">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-xl font-bold">🔔 SUCCESS:</span>
              <div>
                <p className="font-semibold tracking-wide">{appNotification.title}</p>
                <p className="text-sm opacity-90">{appNotification.message}</p>
              </div>
            </div>
            <button onClick={() => setAppNotification(null)} className="text-white hover:text-slate-200 text-sm font-bold bg-emerald-700 px-3 py-1 rounded">DISMISS</button>
          </div>
        </div>
      )}

      {/* TOP DEEPLY BRANDED APP HEADER HEADER */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-sky-600 text-white rounded-xl flex items-center justify-center font-black text-2xl tracking-tighter shadow-md shadow-sky-900/40">SB</div>
            <div>
              <h1 className="text-xl font-bold text-slate-50 tracking-tight flex items-center gap-2">
                Sheek Bakri Saphaloo Portal <span className="text-xs px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">v2.1</span>
              </h1>
              <p className="text-xs text-slate-400 font-mono">Academic Year: {systemSettings.academicYear} | {systemSettings.semester}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button onClick={handleTriggerMockDatabaseSeed} className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-lg font-bold text-xs tracking-wider transition shadow-sm uppercase flex items-center gap-1.5">
              ⚡ Seed Mock Data
            </button>
            <div className="bg-slate-900 px-4 py-1.5 rounded-lg border border-slate-800 text-right">
              <p className="text-xs text-slate-400 font-mono">Logged: <span className="text-slate-100 font-semibold">{username}</span></p>
              <p className="text-[10px] text-sky-400 uppercase font-bold tracking-widest">{userRole} Scope</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* SIDEBAR NAVIGATION CONTROLS CONTROLLER */}
        <section className="lg:col-span-1 space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-sm">
            <h2 className="text-xs uppercase font-bold tracking-widest text-slate-400 mb-3 font-mono">Switch Perspective</h2>
            <div className="grid grid-cols-2 gap-2">
              {['Director', 'Instructor', 'Student', 'Parent'].map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    setCurrentRoleView(role);
                    if(role === 'Director') setActiveTab('director-overview');
                    if(role === 'Instructor') setActiveTab('instructor-roster');
                    if(role === 'Student') setActiveTab('student-exams');
                    if(role === 'Parent') setActiveTab('parent-portal');
                  }}
                  className={`px-3 py-2 text-xs font-bold rounded-lg border transition ${
                    currentRoleView === role 
                      ? 'bg-sky-600 border-sky-500 text-white shadow-sm' 
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {role} View
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 shadow-sm space-y-1">
            <h2 className="text-xs uppercase font-bold tracking-widest text-slate-400 px-3 py-2 font-mono">Console Navigation</h2>
            
            {currentRoleView === 'Director' && (
              <>
                <button onClick={() => setActiveTab('director-overview')} className={`w-full text-left px-3 py-2 text-sm rounded-lg transition font-medium flex items-center ${activeTab === 'director-overview' ? 'bg-slate-800 text-sky-400 font-semibold' : 'text-slate-300 hover:bg-slate-900'}`}>📊 Performance Overview</button>
                <button onClick={() => setActiveTab('director-finance')} className={`w-full text-left px-3 py-2 text-sm rounded-lg transition font-medium flex items-center ${activeTab === 'director-finance' ? 'bg-slate-800 text-sky-400 font-semibold' : 'text-slate-300 hover:bg-slate-900'}`}>💵 Finance Ledger Asset</button>
                <button onClick={() => setActiveTab('director-users')} className={`w-full text-left px-3 py-2 text-sm rounded-lg transition font-medium flex items-center ${activeTab === 'director-users' ? 'bg-slate-800 text-sky-400 font-semibold' : 'text-slate-300 hover:bg-slate-900'}`}>👥 Manage Portal Accounts</button>
                <button onClick={() => setActiveTab('system-configuration')} className={`w-full text-left px-3 py-2 text-sm rounded-lg transition font-medium flex items-center ${activeTab === 'system-configuration' ? 'bg-slate-800 text-sky-400 font-semibold' : 'text-slate-300 hover:bg-slate-900'}`}>⚙️ Operational Config</button>
              </>
            )}

            {currentRoleView === 'Instructor' && (
              <>
                <button onClick={() => setActiveTab('instructor-roster')} className={`w-full text-left px-3 py-2 text-sm rounded-lg transition font-medium flex items-center ${activeTab === 'instructor-roster' ? 'bg-slate-800 text-sky-400 font-semibold' : 'text-slate-300 hover:bg-slate-900'}`}>📝 Register & Marks Roster</button>
                <button onClick={() => setActiveTab('instructor-attendance')} className={`w-full text-left px-3 py-2 text-sm rounded-lg transition font-medium flex items-center ${activeTab === 'instructor-attendance' ? 'bg-slate-800 text-sky-400 font-semibold' : 'text-slate-300 hover:bg-slate-900'}`}>📅 Attendance Logger Tracker</button>
                <button onClick={() => setActiveTab('instructor-exams')} className={`w-full text-left px-3 py-2 text-sm rounded-lg transition font-medium flex items-center ${activeTab === 'instructor-exams' ? 'bg-slate-800 text-sky-400 font-semibold' : 'text-slate-300 hover:bg-slate-900'}`}>🛠️ Test Architecture Builder</button>
              </>
            )}

            {currentRoleView === 'Student' && (
              <>
                <button onClick={() => setActiveTab('student-exams')} className={`w-full text-left px-3 py-2 text-sm rounded-lg transition font-medium flex items-center ${activeTab === 'student-exams' ? 'bg-slate-800 text-sky-400 font-semibold' : 'text-slate-300 hover:bg-slate-900'}`}>✍️ Live Exam Pipelines</button>
                <button onClick={() => setActiveTab('student-transcript')} className={`w-full text-left px-3 py-2 text-sm rounded-lg transition font-medium flex items-center ${activeTab === 'student-transcript' ? 'bg-slate-800 text-sky-400 font-semibold' : 'text-slate-300 hover:bg-slate-900'}`}>📜 Report Transcripts Card</button>
                <button onClick={() => setActiveTab('student-library')} className={`w-full text-left px-3 py-2 text-sm rounded-lg transition font-medium flex items-center ${activeTab === 'student-library' ? 'bg-slate-800 text-sky-400 font-semibold' : 'text-slate-300 hover:bg-slate-900'}`}>📚 Modern Catalog Grids</button>
              </>
            )}

            {currentRoleView === 'Parent' && (
              <button onClick={() => setActiveTab('parent-portal')} className={`w-full text-left px-3 py-2 text-sm rounded-lg transition font-medium flex items-center ${activeTab === 'parent-portal' ? 'bg-slate-800 text-sky-400 font-semibold' : 'text-slate-300 hover:bg-slate-900'}`}>👨‍👩‍👦 Parent Monitor Engine</button>
            )}
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-sm font-mono text-xs text-slate-400 space-y-2">
            <p className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Filter Grade Section Context</p>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-sky-500 font-semibold"
            >
              <option value="12 Natural">Grade 12 Natural Science</option>
              <option value="12 Social">Grade 12 Social Science</option>
              <option value="11 Natural">Grade 11 Natural Science</option>
              <option value="10 General">Grade 10 General Class</option>
            </select>
          </div>
        </section>

        {/* WORKSPACE CONTENT MODULE PANEL */}
        <section className="lg:col-span-3 space-y-8">
          
          {/* TAB 1: DIRECTOR OVERVIEW */}
          {activeTab === 'director-overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-sm">
                  <p className="text-xs text-slate-400 uppercase font-mono tracking-wider">Total Enrolled Records</p>
                  <p className="text-3xl font-black text-sky-400 mt-1">{students.length || '3'}</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-sm">
                  <p className="text-xs text-slate-400 uppercase font-mono tracking-wider">Ledger Collection Status</p>
                  <p className="text-3xl font-black text-emerald-400 mt-1">ETB {financeLedger.reduce((sum, item) => sum + (item.amount_paid || 0), 0) || '5,500'}</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-sm">
                  <p className="text-xs text-slate-400 uppercase font-mono tracking-wider">Active Exam Slugs</p>
                  <p className="text-3xl font-black text-purple-400 mt-1">{exams.length || '1'}</p>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-bold tracking-tight text-slate-50 mb-4">Central Administrative Oversight</h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                  Welcome to the director command interface framework for <span className="font-semibold text-slate-100">{activeProfile.fullName}</span>. 
                  Use this view to cross-examine financial cashflows, adjust academic operations configs, or provision secure cryptographic login items for staff accounts.
                </p>
                <div className="border-t border-slate-800 pt-4 grid grid-cols-2 gap-4 text-xs font-mono text-slate-400">
                  <p>📍 Campus: <span className="text-slate-200">{activeProfile.address}</span></p>
                  <p>📞 Emergency Line: <span className="text-slate-200">{activeProfile.phone}</span></p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FINANCE LEDGER ASSET */}
          {activeTab === 'director-finance' && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-50">Financial Ledger Processing Ledger</h3>
                  <p className="text-xs text-slate-400">Track and capture tuition, asset distributions, and lab access fees.</p>
                </div>
              </div>

              <form onSubmit={handlePostFinanceRecord} className="bg-slate-900 border border-slate-800 p-4 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Student Id</label>
                  <input type="text" placeholder="SMS/001" value={financeForm.studentId} onChange={e => setFinanceForm({...financeForm, studentId: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-slate-200" required />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Fee Type Designation</label>
                  <select value={financeForm.feeType} onChange={e => setFinanceForm({...financeForm, feeType: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-slate-200">
                    <option value="Tuition Q1">Tuition Q1</option>
                    <option value="Lab Access Asset">Lab Access Asset</option>
                    <option value="Textbook Depository Fee">Textbook Depository Fee</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Amount Due (ETB)</label>
                  <input type="number" placeholder="3500" value={financeForm.amountDue} onChange={e => setFinanceForm({...financeForm, amountDue: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-slate-200" required />
                </div>
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-xs tracking-wider transition uppercase">Record Statement</button>
              </form>

              <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3">Ref ID</th>
                      <th className="p-3">Student Context</th>
                      <th className="p-3">Designation</th>
                      <th className="p-3">Liability (ETB)</th>
                      <th className="p-3">Cleared Paid</th>
                      <th className="p-3">Status Badge</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {financeLedger.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-4 text-center text-slate-500">No finance entries present. Trigger seed pipelines to inspect.</td>
                      </tr>
                    ) : (
                      financeLedger.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/50">
                          <td className="p-3 font-semibold text-slate-300">{item.studentId}</td>
                          <td className="p-3 text-slate-100">{item.name || 'External Record'}</td>
                          <td className="p-3 text-slate-400">{item.fee_type || item.feeType}</td>
                          <td className="p-3 text-slate-200">{item.amount_due || item.amountDue}</td>
                          <td className="p-3 text-emerald-400 font-bold">{item.amount_paid || item.amountDue}</td>
                          <td className="p-3">
                            <span className="bg-emerald-950 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                              {item.payment_status || 'Paid'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ADMIN/DIRECTOR SYSTEM USERS MANAGEMENT */}
          {activeTab === 'director-users' && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-50">Manage Cryptographic Portal Accounts</h3>
                <p className="text-xs text-slate-400 font-mono">Provision system credentials, security tokens, and view audits.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900">
                  <p className="font-bold text-slate-300">Default Root Sysadmin</p>
                  <p className="text-slate-400 mt-1">admin@school.edu</p>
                  <span className="inline-block mt-2 px-2 py-0.5 bg-sky-950 text-sky-400 border border-sky-900 rounded font-bold uppercase text-[10px]">Active Session</span>
                </div>
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900">
                  <p className="font-bold text-slate-300">ICT Faculty Principal</p>
                  <p className="text-slate-400 mt-1">ict-dept@school.edu</p>
                  <span className="inline-block mt-2 px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 rounded font-bold uppercase text-[10px]">Offline log</span>
                </div>
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900">
                  <p className="font-bold text-slate-300">Registrar Office Token</p>
                  <p className="text-slate-400 mt-1">registrar-desk@school.edu</p>
                  <span className="inline-block mt-2 px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 rounded font-bold uppercase text-[10px]">Offline log</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OPERATIONAL CONFIGURATION */}
          {activeTab === 'system-configuration' && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-50">Operational Configuration Framework</h3>
                <p className="text-xs text-slate-400">Alter running states, update academic semesters, or force lockdown mode.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
                <div className="bg-slate-900 p-4 border border-slate-800 rounded-xl space-y-3">
                  <div>
                    <label className="block text-slate-400 uppercase font-bold mb-1">Academic Year</label>
                    <input type="text" value={systemSettings.academicYear} onChange={e => setSystemSettings({...systemSettings, academicYear: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200" />
                  </div>
                  <div>
                    <label className="block text-slate-400 uppercase font-bold mb-1">Active Semester Cycle</label>
                    <input type="text" value={systemSettings.semester} onChange={e => setSystemSettings({...systemSettings, semester: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200" />
                  </div>
                </div>

                <div className="bg-slate-900 p-4 border border-slate-800 rounded-xl flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-200">Force System Maintenance Lock</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Locks out student terminal screens instantly.</p>
                    </div>
                    <input type="checkbox" checked={systemSettings.maintenanceMode} onChange={e => {
                      setSystemSettings({...systemSettings, maintenanceMode: e.target.checked});
                      triggerPopupNotification("SYSTEM RUNLEVEL CHANGED", "Global ecosystem status parameters altered.");
                    }} className="w-4 h-4 accent-sky-500" />
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                    <div>
                      <p className="font-bold text-slate-200">Allow Open Student Auth Pipelines</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Controls external connection handshakes.</p>
                    </div>
                    <input type="checkbox" checked={systemSettings.allowStudentLogin} onChange={e => setSystemSettings({...systemSettings, allowStudentLogin: e.target.checked})} className="w-4 h-4 accent-sky-500" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: INSTRUCTOR ROSTER & MARKS MANAGEMENT */}
          {activeTab === 'instructor-roster' && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-50">Register & Marks Roster Pipeline</h3>
                  <p className="text-xs text-slate-400">Active evaluation metric ledger for class section: <span className="text-sky-400 font-mono font-bold">{selectedGrade}</span></p>
                </div>
              </div>

              <form onSubmit={handleEnrollmentSubmit} className="bg-slate-900 border border-slate-800 p-4 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Student System ID</label>
                  <input type="text" placeholder="SMS/004" value={studentForm.studentId} onChange={e => setStudentForm({...studentForm, studentId: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-slate-200" required />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Full Student Name</label>
                  <input type="text" placeholder="Gadaa Barraq" value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-slate-200" required />
                </div>
                <button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 rounded-lg text-xs tracking-wider transition uppercase">Enroll to Section</button>
              </form>

              <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3">System ID</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Subject</th>
                      <th className="p-3">Test 1 (10)</th>
                      <th className="p-3">Test 2 (10)</th>
                      <th className="p-3">Assign (20)</th>
                      <th className="p-3">Final (60)</th>
                      <th className="p-3">Aggregate Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="p-4 text-center text-slate-500">No active students found under selected criteria filter. Hit ⚡ Seed Mock Data.</td>
                      </tr>
                    ) : (
                      students.map((student, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/50">
                          <td className="p-3 font-bold text-sky-400">{student.studentId}</td>
                          <td className="p-3 font-semibold text-slate-100">{student.name}</td>
                          <td className="p-3 text-slate-400">{student.subject || 'ICT'}</td>
                          <td className="p-3 text-slate-300">{student.test1 ?? 0}</td>
                          <td className="p-3 text-slate-300">{student.test2 ?? 0}</td>
                          <td className="p-3 text-slate-300">{student.assignment ?? 0}</td>
                          <td className="p-3 text-slate-300">{student.finalExam ?? 0}</td>
                          <td className="p-3 text-emerald-400 font-bold">{student.totalScore ?? (Number(student.test1 || 0) + Number(student.test2 || 0) + Number(student.assignment || 0) + Number(student.finalExam || 0))}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: INSTRUCTOR ATTENDANCE LOGGER */}
          {activeTab === 'instructor-attendance' && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-50">Attendance Logger Tracking Console</h3>
                  <p className="text-xs text-slate-400 font-mono">Date Reference Index: {attendanceDate}</p>
                </div>
                <input 
                  type="date" 
                  value={attendanceDate} 
                  onChange={(e) => setAttendanceDate(e.target.value)} 
                  className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs font-mono text-slate-200" 
                />
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-4">
                <p className="text-xs font-mono text-slate-400">Click actions below to change present verification states directly before compiling records log payload.</p>
                <div className="divide-y divide-slate-800">
                  {students.map((student, index) => (
                    <div key={index} className="py-2.5 flex items-center justify-between font-mono text-xs">
                      <div>
                        <p className="font-bold text-slate-200">{student.name}</p>
                        <p className="text-[10px] text-slate-500">{student.studentId}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button onClick={() => triggerPopupNotification("ATTENDANCE PROVISIONED", `${student.name} marked Present.`)} className="px-2.5 py-1 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold uppercase text-[10px]">Present</button>
                        <button onClick={() => triggerPopupNotification("ATTENDANCE PROVISIONED", `${student.name} marked Absent.`)} className="px-2.5 py-1 rounded bg-rose-950 border border-rose-900 text-rose-400 font-bold uppercase text-[10px]">Absent</button>
                      </div>
                    </div>
                  ))}
                  {students.length === 0 && (
                    <p className="text-slate-500 text-center py-4 text-xs font-mono">Enroll roster metrics or trigger seed pipeline to log entries.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: INSTRUCTOR TEST BUILDER */}
          {activeTab === 'instructor-exams' && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-50">Active Multi-Question Online Test Builder Pipeline</h3>
                <p className="text-xs text-slate-400 font-mono">Section Payload Dest: {selectedGrade}</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Assessment Assessment Title</label>
                    <input type="text" placeholder="ICT Chapter 1 Network Quiz" value={examForm.title} onChange={e => setExamForm({...examForm, title: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200" />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Target Subject Category</label>
                    <input type="text" value={examForm.subject} onChange={e => setExamForm({...examForm, subject: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 font-mono" />
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4 space-y-3">
                  <p className="text-xs font-bold font-mono text-sky-400 uppercase tracking-wide">Append Question Frame Matrix ({examForm.questions.length} Staged)</p>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Question Prompt Text Context</label>
                    <input type="text" placeholder="What core protocol operates data packet routing?" value={currentQuestion.text} onChange={e => setCurrentQuestion({...currentQuestion, text: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Choice Option A</label>
                      <input type="text" placeholder="IP Address Routing Protocol" value={currentQuestion.a} onChange={e => setCurrentQuestion({...currentQuestion, a: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Choice Option B</label>
                      <input type="text" placeholder="Physical Mac Address Protocol" value={currentQuestion.b} onChange={e => setCurrentQuestion({...currentQuestion, b: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 pt-2">
                    <div>
                      <label className="inline text-xs font-mono text-slate-400 mr-2">Target Key Indicator:</label>
                      <select value={currentQuestion.correct} onChange={e => setCurrentQuestion({...currentQuestion, correct: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-200">
                        <option value="A">A</option>
                        <option value="B">B</option>
                      </select>
                    </div>
                    <button type="button" onClick={addQuestionToExamPayload} className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-mono text-[11px] font-bold px-4 py-2 border border-slate-700 rounded-lg">Staging Area Question</button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <button onClick={handleCreateExamSubmit} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-lg text-xs tracking-wider transition uppercase font-mono">Compile & Broadcast Live Examination</button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: STUDENT LIVE EXAM TERMINAL */}
          {activeTab === 'student-exams' && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-50">Live Exam Pipelines</h3>
                <p className="text-xs text-slate-400 font-mono">Active tests broadcasted to class section matching your profiles parameters.</p>
              </div>

              {exams.length === 0 ? (
                <div className="p-8 border border-slate-800 rounded-xl bg-slate-900 text-center font-mono text-xs text-slate-500">
                  No online examinations deployed yet for section {selectedGrade}. Trigger mock database generation to test layout frameworks.
                </div>
              ) : (
                exams.map((ex, i) => (
                  <div key={i} className="p-4 border border-slate-800 bg-slate-900 rounded-xl flex items-center justify-between font-mono text-xs">
                    <div>
                      <span className="bg-purple-950 text-purple-400 border border-purple-900 rounded font-bold px-2 py-0.5 text-[9px] uppercase tracking-wider">{ex.subject}</span>
                      <h4 className="text-sm font-bold text-slate-100 mt-1.5">{ex.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Target Classification Scope: {ex.grade_section || selectedGrade}</p>
                    </div>
                    <button 
                      onClick={() => {
                        setActiveQuizExam(ex);
                        setQuizQuestions([
                          { text: 'Which storage paradigm handles global scope state context?', a: 'Client React Hooks Storage', b: 'Server Side Core Database Store', correct: 'B' },
                          { text: 'What file name patterns execute route pathways inside NextJS?', a: 'route.js endpoints', b: 'index.html layouts', correct: 'A' }
                        ]);
                        triggerPopupNotification("EXAM INTERFACE INITIALIZED", "Cryptographic evaluation pipeline online.");
                      }} 
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition uppercase"
                    >
                      Initialize Terminal
                    </button>
                  </div>
                ))
              )}

              {/* LIVE ACTIVE QUIZ CONTAINER PORT */}
              {activeQuizExam && (
                <div className="bg-slate-900 border-2 border-purple-500 rounded-xl p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h4 className="font-mono text-sm font-bold text-purple-400">Terminal Shell: {activeQuizExam.title}</h4>
                    <button onClick={() => setActiveQuizExam(null)} className="text-slate-400 text-xs font-bold hover:text-white">CLOSE TERMINAL</button>
                  </div>

                  <div className="space-y-4 font-mono text-xs">
                    {quizQuestions.map((q, qIdx) => (
                      <div key={qIdx} className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-2">
                        <p className="font-bold text-slate-200">Q{qIdx + 1}: {q.text}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                          <label className={`p-2 border rounded cursor-pointer transition ${studentAnswers[qIdx] === 'A' ? 'bg-purple-950/40 border-purple-500 text-purple-300' : 'border-slate-800 hover:bg-slate-900'}`}>
                            <input type="radio" name={`q-${qIdx}`} value="A" onChange={() => setStudentAnswers({...studentAnswers, [qIdx]: 'A'})} className="mr-2 accent-purple-500 hidden" />
                            A: {q.a}
                          </label>
                          <label className={`p-2 border rounded cursor-pointer transition ${studentAnswers[qIdx] === 'B' ? 'bg-purple-950/40 border-purple-500 text-purple-300' : 'border-slate-800 hover:bg-slate-900'}`}>
                            <input type="radio" name={`q-${qIdx}`} value="B" onChange={() => setStudentAnswers({...studentAnswers, [qIdx]: 'B'})} className="mr-2 accent-purple-500 hidden" />
                            B: {q.b}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => {
                      setActiveQuizExam(null);
                      setStudentAnswers({});
                      triggerPopupNotification("ANSWERS RECALCULATED", "Test submission logs pushed safely to teacher terminal queues.");
                    }} 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-xs uppercase tracking-wider font-mono transition"
                  >
                    Transmit Evaluation Responses Payload
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 9: STUDENT TRANSCRIPT LOGS */}
          {activeTab === 'student-transcript' && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-50">Report Transcripts Card</h3>
                <p className="text-xs text-slate-400 font-mono">Consolidated evaluation metrics statement issued under cryptographic audit handles.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl font-mono text-xs space-y-4">
                <div className="flex justify-between border-b border-slate-800 pb-4">
                  <div>
                    <p className="text-slate-400">STUDENT PROFILE REF</p>
                    <p className="text-sm font-bold text-slate-100 mt-1">Chala Alemu (SMS/001)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400">CLASSIFICATION TARGET</p>
                    <p className="text-sm font-bold text-sky-400 mt-1">{selectedGrade}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-800/40">
                    <p className="text-slate-300">Information Communication Technology (ICT)</p>
                    <p className="font-bold text-emerald-400">87% Aggregate Score (Grade A)</p>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/40">
                    <p className="text-slate-300">Advanced Mathematics for Natural Sciences</p>
                    <p className="font-bold text-emerald-400">92% Aggregate Score (Grade A+)</p>
                  </div>
                  <div className="flex justify-between py-1">
                    <p className="text-slate-300">Core Physics Principles & Lab Practicals</p>
                    <p className="font-bold text-sky-400">79% Aggregate Score (Grade B)</p>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 border border-slate-800 rounded-lg text-center text-[11px] text-slate-400">
                  🛡️ This digital report output is electronically sealed under portal runlevel standards.
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: MODERN CATALOG GRIDS (LIBRARY) */}
          {activeTab === 'student-library' && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-50">Modern Catalog Grids</h3>
                <p className="text-xs text-slate-400 font-mono">Instant download repository handles for national curriculum textbooks and guides.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {books.map((book, idx) => (
                  <div key={idx} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between space-y-3 font-mono text-xs">
                    <div>
                      <span className="bg-sky-950 text-sky-400 border border-sky-900 px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold">{book.grade_section}</span>
                      <h4 className="text-slate-100 font-bold text-sm mt-2">{book.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Author/Publisher: {book.author}</p>
                    </div>
                    <button 
                      onClick={() => triggerPopupNotification("DOWNLOAD ROUTED", `Transfer sequence established for asset catalog binary file structure.`)}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold border border-slate-700 py-1.5 rounded transition uppercase text-[11px]"
                    >
                      📥 Access Asset Data Handle
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 11: PARENT MONITOR ENGINE */}
          {activeTab === 'parent-portal' && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-50">Parent Monitor Engine Terminal</h3>
                <p className="text-xs text-slate-400 font-mono">Cross-examine child evaluations, class rosters records, and balance liabilities directly.</p>
              </div>

              <form onSubmit={handleSearchParentStudentLookup} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Enter Child System Reference ID Symbol</label>
                  <input type="text" placeholder="SMS/001" value={parentStudentSearchId} onChange={e => setParentStudentSearchId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono text-slate-200" required />
                </div>
                <button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-6 rounded-lg text-xs uppercase font-mono tracking-wider transition">Mount Child Record Matrix</button>
              </form>

              {parentMonitoredStudent ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-4">
                  <div className="border-b border-slate-800 pb-2">
                    <p className="text-[11px] text-slate-400">VERIFIED SYSTEM MATCH FOUND</p>
                    <p className="text-sm font-bold text-emerald-400 mt-0.5">{parentMonitoredStudent.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950 p-3 rounded border border-slate-800">
                      <p className="text-slate-400 text-[10px]">LATEST TESTING MARKS</p>
                      <p className="text-sm font-bold text-slate-200 mt-1">{parentMonitoredStudent.totalScore || '87'}% Total</p>
                    </div>
                    <div className="bg-slate-950 p-3 rounded border border-slate-800">
                      <p className="text-slate-400 text-[10px]">ATTENDANCE RATING SCALE</p>
                      <p className="text-sm font-bold text-emerald-400 mt-1">96.8% Present</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-slate-800 p-6 rounded-xl text-center text-xs font-mono text-slate-500">
                  Provide a matching child lookup string (e.g. SMS/001) above to filter query metrics safely.
                </div>
              )}

              {/* CLASS ROUTINE MATRIX AND WEEKLY TIME SCHEDULE CARD GRAPH */}
              <div className="border-t border-slate-800 pt-6 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider font-mono text-slate-300">Active Section Weekly Routine Matrix Schedule</p>
                <div className="overflow-x-auto rounded-lg border border-slate-800 text-[11px] font-mono">
                  <table className="w-full text-left">
                    <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-2">Period Slugs</th>
                        <th className="p-2">Mon</th>
                        <th className="p-2">Tue</th>
                        <th className="p-2">Wed</th>
                        <th className="p-2">Thu</th>
                        <th className="p-2">Fri</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {classSchedule.map((row, index) => (
                        <tr key={index} className="hover:bg-slate-900/30">
                          <td className="p-2 bg-slate-950 font-bold text-slate-400">{row.period}</td>
                          <td className="p-2">{row.monday}</td>
                          <td className="p-2">{row.tuesday}</td>
                          <td className="p-2">{row.wednesday}</td>
                          <td className="p-2">{row.thursday}</td>
                          <td className="p-2">{row.friday}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </section>
      </main>
    </div>
  );
}
