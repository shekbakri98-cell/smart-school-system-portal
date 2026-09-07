'use client';
import { useEffect, useState } from 'react';
import BulkExamUpload from './components/BulkExamUpload';

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

  function triggerStudentReportCardPrint(student) {
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
          .tbl { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .tbl th { background: #1e3a8a; color: #ffffff; padding: 8px; font-size: 11px; text-transform: uppercase; }
          .tbl td { border: 1px solid #cbd5e1; padding: 8px; }
        </style>
      </head>
      <body>
        <div class="cert-border">
          <div class="header-block">SHEEK BAKRI SECONDARY SCHOOL</div>
          <div class="sub-title">Official Student Performance Certificate</div>
          <p><strong>Student Name:</strong> \${student.name}</p>
          <p><strong>Student ID:</strong> \${student.studentId}</p>
          <p><strong>Grade Track:</strong> \${selectedGrade}</p>
          <table class="tbl">
            <thead>
              <tr><th>Assessment Component</th><th>Limit</th><th>Score Achieved</th></tr>
            </thead>
            <tbody>
              <tr><td>Test 1</td><td>10</td><td>\${student.test1 || 0}</td></tr>
              <tr><td>Test 2</td><td>10</td><td>\${student.test2 || 0}</td></tr>
              <tr><td>Assignment</td><td>20</td><td>\${student.assignment || 0}</td></tr>
              <tr><td>Final Exam</td><td>60</td><td>\${student.finalExam || 0}</td></tr>
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `);
    pWin.document.close();
    pWin.print();
  }

  function handleLogoutSequence() {
    localStorage.clear();
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = '/login';
  }

  return (
    <div className="p-6 bg-slate-900 text-white min-h-screen">
      <header className="mb-6 border-b border-slate-700 pb-4">
        <h1 className="text-2xl font-bold">Sheek Bakri Portal</h1>
        <p className="text-sm text-slate-400">Welcome, {username} ({userRole})</p>
        <button onClick={handleLogoutSequence} className="mt-2 bg-red-600 px-3 py-1 text-xs rounded font-bold">Logout</button>
      </header>

      <div className="flex gap-4 mb-6">
        <button onClick={() => setCurrentRoleView('Director')} className={`px-4 py-2 rounded ${currentRoleView === 'Director' ? 'bg-purple-600' : 'bg-slate-800'}`}>Director View</button>
        <button onClick={() => setCurrentRoleView('Instructor')} className={`px-4 py-2 rounded ${currentRoleView === 'Instructor' ? 'bg-blue-600' : 'bg-slate-800'}`}>Instructor View</button>
        <button onClick={() => setCurrentRoleView('Student')} className={`px-4 py-2 rounded ${currentRoleView === 'Student' ? 'bg-amber-600 text-black' : 'bg-slate-800'}`}>Student View</button>
      </div>

      <main className="bg-slate-800 p-6 rounded-lg shadow-md">
        <p className="text-slate-300">Active View: <strong className="text-white">{activeTab}</strong></p>
        <p className="text-xs text-slate-500 mt-2">The layout components should be injected here based on the active state view rules.</p>
      </main>
    </div>
  );
}
