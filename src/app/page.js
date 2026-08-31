'use client';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  // Navigation & Access Control States
  const [activeTab, setActiveTab] = useState('students'); // Choices: 'students', 'attendance', 'exams', 'teachers', 'system'
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

  // User Administration Section States
  const [systemUsers, setSystemUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userForm, setUserForm] = useState({ username: '', email: '', password: '', role: 'Teacher' });

  // Load client credentials safely from active browser cookies on initialization
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

  // Central Monitor: Re-fetches records depending on active views and selection shifts
  useEffect(() => {
    if (activeTab === 'students') {
      fetchLiveRosterData();
    } else if (activeTab === 'attendance') {
      fetchLiveAttendanceRecords();
    } else if (activeTab === 'exams') {
      fetchLiveExams();
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
    } catch (err) {
      console.error("Failed fetching live grid data node:", err);
    } finally {
      setStudentsLoading(false);
    }
  }

  async function fetchLiveAttendanceRecords() {
    setAttendanceLoading(true);
    try {
      const res = await fetch(`/api/attendance?grade=${encodeURIComponent(selectedGrade)}&date=${attendanceDate}`);
      const result = await res.json();
      setAttendanceRecords(result.data || []);
    } catch (err) {
      console.error("Failed fetching attendance ledger mapping:", err);
    } finally {
      setAttendanceLoading(false);
    }
  }

  async function fetchLiveExams() {
    setExamsLoading(true);
    try {
      const res = await fetch(`/api/exams?grade=${encodeURIComponent(selectedGrade)}`);
      const result = await res.json();
      setExams(result.exams || []);
    } catch (err) {
      console.error("Failed loading examination modules:", err);
    } finally {
      setExamsLoading(false);
    }
  }

  async function fetchSystemUsers() {
    setUsersLoading(true);
    try {
      const res = await fetch('/api/auth'); 
      const result = await res.json();
      setSystemUsers(result.users || []);
    } catch (err) {
      console.error("Failed fetching infrastructure credentials ledger:", err);
    } finally {
      setUsersLoading(false);
    }
  }
  // Submission Form Handlers
  async function handleEnrollmentSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/students', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
          studentId: studentForm.studentId,
          name: studentForm.name,
          grade: selectedGrade,
          subject: 'ICT'
        }) 
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Barataan haaraan milkiin galmeeffameera!");
        setStudentForm({ studentId: '', name: '' });
        fetchLiveRosterData();
      } else {
        alert(data.error || "Enrollment sequence execution rejected.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleUserCreationSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      });
      const data = await res.json();
      if (res.ok) {
        alert("Account profile generated successfully inside system nodes!");
        setUserForm({ username: '', email: '', password: '', role: 'Teacher' });
        fetchSystemUsers();
      } else {
        alert(data.error || "Account generation script parameters invalid.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCellUpdateSubmit(studentId, subject, fieldName, newScore) {
    try {
      await fetch('/api/roster/update-mark', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, subject, fieldName, score: Number(newScore) })
      });
      fetchLiveRosterData();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAttendanceCellChange(studentId, targetStatus) {
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, date: attendanceDate, status: targetStatus })
      });
      if (res.ok) {
        fetchLiveAttendanceRecords();
      }
    } catch (err) {
      console.error("Attendance synchronization failed:", err);
    }
  }

  function addQuestionToFormState() {
    if (!currentQuestion.text || !currentQuestion.a || !currentQuestion.b) {
      alert("Please provide the question content along with basic options.");
      return;
    }
    setExamForm({ ...examForm, questions: [...examForm.questions, currentQuestion] });
    setCurrentQuestion({ text: '', a: '', b: '', c: '', d: '', correct: 'A' });
  }

  async function handleExamPublishSubmit(e) {
    e.preventDefault();
    if (!examForm.title || examForm.questions.length === 0) {
      alert("Exam configuration requires a clear title name and question entries.");
      return;
    }
    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: examForm.title,
          gradeSection: selectedGrade,
          subject: examForm.subject,
          questions: examForm.questions
        })
      });
      if (res.ok) {
        alert("Online examination module deployed successfully!");
        setExamForm({ title: '', subject: 'ICT', questions: [] });
        fetchLiveExams();
      }
    } catch (err) {
      console.error(err);
    }
  }

  function handleLogoutSequence() {
    localStorage.clear();
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = '/login';
  }
  return (
    <div className="min-h-screen bg-brandNavy text-slate-100 p-6">
      {/* GLOBAL HEADER HEADER */}
      <header className="max-w-6xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">SHEEK BAKRI SECONDARY SCHOOL</h1>
          <p className="text-xs text-brandGold uppercase font-mono tracking-wider mt-1">
            Welcome, <span className="text-white font-bold">{username} ({userRole})</span>
          </p>
        </div>
        <button onClick={handleLogoutSequence} className="bg-red-950/40 hover:bg-red-900 border border-red-900 text-red-400 font-mono text-[10px] tracking-widest uppercase px-3 py-1.5 rounded transition-all">
          Disconnect Session
        </button>
      </header>

      {/* RE-ENGINEERED MULTI-VIEW NAVBAR */}
      <nav className="max-w-6xl mx-auto mb-6 flex flex-wrap bg-surfaceCard p-1.5 rounded-xl border border-slate-800 text-xs font-mono gap-1">
        <button onClick={() => setActiveTab('students')} className={`flex-1 min-w-[120px] text-center py-2.5 rounded-lg font-bold uppercase transition-all ${activeTab === 'students' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>Anba: Student Matrix</button>
        <button onClick={() => setActiveTab('attendance')} className={`flex-1 min-w-[120px] text-center py-2.5 rounded-lg font-bold uppercase transition-all ${activeTab === 'attendance' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>📅 Hordoffii Galmee</button>
        <button onClick={() => setActiveTab('exams')} className={`flex-1 min-w-[120px] text-center py-2.5 rounded-lg font-bold uppercase transition-all ${activeTab === 'exams' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>📝 Online Exams</button>
        {userRole === 'Admin' && (<button onClick={() => setActiveTab('teachers')} className={`flex-1 min-w-[120px] text-center py-2.5 rounded-lg font-bold uppercase transition-all ${activeTab === 'teachers' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>🔒 Account Console</button>)}
        <button onClick={() => setActiveTab('system')} className={`flex-1 min-w-[120px] text-center py-2.5 rounded-lg font-bold uppercase transition-all ${activeTab === 'system' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>⚙️ Operations Node</button>
      </nav>

      {/* MASTER SYSTEM VIEWPORT */}
      <main className="max-w-6xl mx-auto">
        {/* VIEW 1: STUDENT MATRIX VIEW */}
        {activeTab === 'students' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="bg-surfaceCard p-6 rounded-xl border border-slate-800 h-fit space-y-4">
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide border-b border-slate-700 pb-2">Galmeessi Barataa Haaraa</h2>
              {userRole === 'Admin' ? (
                <form onSubmit={handleEnrollmentSubmit} className="space-y-3 text-xs font-mono">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Target Grade Section</label>
                    <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="w-full bg-brandNavy border border-slate-800 rounded p-2 text-white outline-none">
                      <option value="12 Natural">12 Natural</option><option value="12 Social">12 Social</option><option value="Kutaa 10ffaa">Kutaa 10ffaa</option><option value="Kutaa 9ffaa">Kutaa 9ffaa</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Student ID</label>
                    <input type="text" placeholder="e.g. STU-001" value={studentForm.studentId} onChange={e => setStudentForm({...studentForm, studentId: e.target.value})} className="w-full bg-brandNavy border border-slate-800 rounded p-2 text-white outline-none" required />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Full Legal Name</label>
                    <input type="text" placeholder="e.g. Kedir Ahmed" value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} className="w-full bg-brandNavy border border-slate-800 rounded p-2 text-white outline-none" required />
                  </div>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded uppercase">Kuusi Galmeessi</button>
                </form>
              ) : (
                <div className="text-xs text-slate-400 bg-brandNavy border border-slate-800 p-4 rounded text-center font-mono">⚠️ Profile Enrollment tools are restricted to Admin roles. Use the grading table cells to edit live academic marks.</div>
              )}
            </section>

            <section className="lg:col-span-2 bg-surfaceCard p-6 rounded-xl border border-slate-800 overflow-hidden">
              <div className="flex justify-between border-b border-slate-800 pb-4 mb-4">
                <h3 className="text-sm font-bold uppercase text-slate-200">Active Roster Sheets</h3>
                <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="bg-brandNavy border border-slate-800 rounded p-1.5 text-white font-bold outline-none text-xs">
                  <option value="12 Natural">12 Natural</option><option value="12 Social">12 Social</option><option value="Kutaa 10ffaa">Kutaa 10ffaa</option><option value="Kutaa 9ffaa">Kutaa 9ffaa</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                      <th className="pb-3">ID</th><th className="pb-3">Maqaa</th><th className="pb-3 text-center">Test 1</th><th className="pb-3 text-center">Test 2</th><th className="pb-3 text-center">Assign</th><th className="pb-3 text-center">Final</th><th className="pb-3 text-right">Waliigala</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {studentsLoading && <tr><td colSpan="7" className="text-center py-4 font-mono text-slate-400 animate-pulse">Syncing matrix tables...</td></tr>}
                    {!studentsLoading && students.length === 0 && <tr><td colSpan="7" className="text-center py-4 text-slate-500">No records found.</td></tr>}
                    {!studentsLoading && students.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        <td className="py-3 font-mono text-blue-400 font-bold">{s.studentId}</td>
                        <td className="py-3 font-semibold text-slate-200">{s.name}</td>
                        <td className="p-1 text-center"><input type="number" defaultValue={s.test1} onBlur={e => handleCellUpdateSubmit(s.studentId, s.subject || 'ICT', 'test1', e.target.value)} className="w-12 bg-brandNavy text-center border border-slate-800 rounded" /></td>
                        <td className="p-1 text-center"><input type="number" defaultValue={s.test2} onBlur={e => handleCellUpdateSubmit(s.studentId, s.subject || 'ICT', 'test2', e.target.value)} className="w-12 bg-brandNavy text-center border border-slate-800 rounded" /></td>
                        <td className="p-1 text-center"><input type="number" defaultValue={s.assignment} onBlur={e => handleCellUpdateSubmit(s.studentId, s.subject || 'ICT', 'assignment', e.target.value)} className="w-12 bg-brandNavy text-center border border-slate-800 rounded" /></td>
                        <td className="p-1 text-center"><input type="number" defaultValue={s.finalExam} onBlur={e => handleCellUpdateSubmit(s.studentId, s.subject || 'ICT', 'finalExam', e.target.value)} className="w-12 bg-brandNavy text-center border border-slate-800 rounded" /></td>
                        <td className="py-3 text-right font-black text-emerald-400 font-mono">{s.totalScore || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
        {/* VIEW 2: DAILY ATTENDANCE LEDGER */}
        {activeTab === 'attendance' && (
          <section className="bg-surfaceCard p-6 rounded-xl border border-slate-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 mb-4 gap-4">
              <h3 className="text-sm font-bold uppercase text-slate-200">Daily Attendance Matrix</h3>
              <div className="flex items-center gap-4 text-xs font-mono">
                <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="bg-brandNavy border border-slate-800 rounded p-1 text-white font-bold outline-none">
                  <option value="12 Natural">12 Natural</option><option value="12 Social">12 Social</option><option value="Kutaa 10ffaa">Kutaa 10ffaa</option><option value="Kutaa 9ffaa">Kutaa 9ffaa</option>
                </select>
                <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} className="bg-brandNavy border border-slate-800 rounded p-1 text-white font-bold outline-none" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead><tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]"><th className="pb-3">ID Barataa</th><th className="pb-3">Maqaa Guutuu</th><th className="pb-3 text-right">Status</th></tr></thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {attendanceLoading && <tr><td colSpan="3" className="text-center py-4 font-mono text-slate-400 animate-pulse">Syncing...</td></tr>}
                  {!attendanceLoading && attendanceRecords.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40">
                      <td className="py-3 font-mono text-blue-400 font-bold">{s.studentId}</td>
                      <td className="py-3 font-semibold text-slate-200">{s.name}</td>
                      <td className="py-3 text-right">
                        <select value={s.status || 'Not Marked'} onChange={(e) => handleAttendanceCellChange(s.studentId, e.target.value)} className={`border rounded p-1 font-bold text-[11px] bg-brandNavy outline-none ${s.status === 'Present' ? 'border-emerald-800 text-emerald-400' : s.status === 'Absent' ? 'border-red-800 text-red-400' : s.status === 'Late' ? 'border-amber-800 text-amber-400' : 'border-slate-800 text-slate-400'}`}>
                          <option value="Not Marked">Not Marked</option><option value="Present">Present (Argameera)</option><option value="Absent">Absent (Hafee)</option><option value="Late">Late (Sifameera)</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* VIEW 3: ONLINE EXAMS MATRIX CENTER */}
        {activeTab === 'exams' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs font-mono">
            <section className="bg-surfaceCard p-6 rounded-xl border border-slate-800 space-y-3 h-fit">
              <h2 className="font-bold border-b border-slate-700 pb-2 text-white">Deploy Digital Examination</h2>
              {userRole === 'Admin' ? (
                <div className="space-y-3">
                  <input type="text" placeholder="Exam Title" value={examForm.title} onChange={e => setExamForm({...examForm, title: e.target.value})} className="w-full bg-brandNavy border border-slate-800 p-2 text-white outline-none rounded" />
                  
                  <div className="bg-brandNavy border border-slate-800 p-3 rounded space-y-2">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">// Append Question Element</p>
                    <textarea placeholder="Question Text" value={currentQuestion.text} onChange={e => setCurrentQuestion({...currentQuestion, text: e.target.value})} className="w-full bg-surfaceCard border border-slate-700 p-2 rounded h-16 text-white text-xs"></textarea>
                    <input type="text" placeholder="Option A" value={currentQuestion.a} onChange={e => setCurrentQuestion({...currentQuestion, a: e.target.value})} className="w-full bg-surfaceCard border border-slate-700 p-1 text-white text-xs" />
                    <input type="text" placeholder="Option B" value={currentQuestion.b} onChange={e => setCurrentQuestion({...currentQuestion, b: e.target.value})} className="w-full bg-surfaceCard border border-slate-700 p-1 text-white text-xs" />
                    <input type="text" placeholder="Option C" value={currentQuestion.c} onChange={e => setCurrentQuestion({...currentQuestion, c: e.target.value})} className="w-full bg-surfaceCard border border-slate-700 p-1 text-white text-xs" />
                    <input type="text" placeholder="Option D" value={currentQuestion.d} onChange={e => setCurrentQuestion({...currentQuestion, d: e.target.value})} className="w-full bg-surfaceCard border border-slate-700 p-1 text-white text-xs" />
                    <select value={currentQuestion.correct} onChange={e => setCurrentQuestion({...currentQuestion, correct: e.target.value})} className="w-full bg-surfaceCard border border-slate-700 p-1 text-white text-xs">
                      <option value="A">Answer Key: A</option><option value="B">Answer Key: B</option><option value="C">Answer Key: C</option><option value="D">Answer Key: D</option>
                    </select>
                    <button type="button" onClick={addQuestionToFormState} className="w-full py-1 bg-slate-800 text-slate-300 font-bold border border-slate-700 rounded text-[11px]">ADD QUESTION NODE ({examForm.questions.length})</button>
                  </div>
                  <button onClick={handleExamPublishSubmit} className="w-full bg-emerald-600 p-2 text-white font-bold rounded uppercase">Publish Assessment</button>
                </div>
              ) : (
                <div className="text-slate-400 text-center p-4 bg-brandNavy border border-slate-800 rounded">🎒 Assessments will be listed inside the main matrix board for students to access.</div>
              )}
            </section>

            <section className="lg:col-span-2 bg-surfaceCard p-6 rounded-xl border border-slate-800">
              <h3 className="font-bold border-b border-slate-800 pb-3 mb-4 text-slate-200">Active Online Testing Matrix</h3>
              <div className="space-y-2">
                {examsLoading && <p className="text-slate-400 animate-pulse">Syncing data nodes...</p>}
                {!examsLoading && exams.map((ex, idx) => (
                  <div key={idx} className="p-3 bg-brandNavy border border-slate-800 rounded flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-200 text-sm">{ex.title}</p>
                      <p className="text-[10px] text-slate-500 uppercase mt-0.5">Subject: {ex.subject} // Grade: {ex.grade_section}</p>
                    </div>
                    <button onClick={() => alert('Launching localized secure browser container test framework.')} className="px-3 py-1 bg-blue-600 font-bold text-white rounded text-[11px] uppercase">Launch Test</button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
        {/* VIEW 4: ADMIN TEACHER USER MANAGEMENT CONSOLE */}
        {activeTab === 'teachers' && userRole === 'Admin' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs font-mono">
            <section className="bg-surfaceCard p-6 rounded-xl border border-slate-800 h-fit space-y-4">
              <h2 className="font-bold border-b border-slate-700 pb-2">Generate Profile Access</h2>
              <form onSubmit={handleUserCreationSubmit} className="space-y-3">
                <input type="text" placeholder="Username" value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} className="w-full bg-brandNavy border border-slate-800 p-2 text-white outline-none" required />
                <input type="email" placeholder="Email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="w-full bg-brandNavy border border-slate-800 p-2 text-white outline-none" required />
                <input type="password" placeholder="Password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="w-full bg-brandNavy border border-slate-800 p-2 text-white outline-none" required />
                <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})} className="w-full bg-brandNavy border border-slate-800 p-2 text-white outline-none"><option value="Teacher">Teacher</option><option value="Admin">Admin</option></select>
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 p-2.5 text-white font-bold rounded uppercase">Commit User</button>
              </form>
            </section>
            
            <section className="lg:col-span-2 bg-surfaceCard p-4 rounded-lg border border-slate-800">
              <h3 className="font-bold border-b border-slate-800 pb-2 mb-3">Registry Ledger</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs whitespace-nowrap">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800 text-[10px] uppercase">
                      <th className="pb-2">User Node</th><th className="pb-2">Email Route</th><th className="pb-2 text-right">Access Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {usersLoading && <tr><td colSpan="3" className="text-center py-4 animate-pulse">Syncing...</td></tr>}
                    {!usersLoading && systemUsers.map((user, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        <td className="py-2 font-semibold text-slate-200">{user.username}</td><td className="py-2 text-slate-400">{user.email}</td><td className="py-2 text-right font-bold text-purple-400">{user.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* VIEW 5: CORE NODE CONFIGURATIONS */}
        {activeTab === 'system' && (
          <section className="bg-surfaceCard p-6 rounded-xl border border-slate-800 max-w-sm mx-auto text-xs font-mono space-y-2">
            <h3 className="font-bold border-b border-slate-800 pb-1 text-white">Node Metrics</h3>
            <div className="flex justify-between border-b border-slate-900 pb-1"><span>Database Link:</span><span className="text-emerald-400">ONLINE (MySQL / alwaysdata)</span></div>
            <div className="flex justify-between border-b border-slate-900 pb-1"><span>Deployment Engine:</span><span className="text-blue-400">Render Container</span></div>
            <div className="flex justify-between"><span>Subject Track:</span><span className="text-amber-400 font-bold">ICT Matrix System</span></div>
          </section>
        )}
      </main>

      {/* FLOATING CONTEXT-AWARE SMART AI SIDE ASSISTANT MODULE DRAWER */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-surfaceCard border border-slate-800 shadow-2xl rounded-xl p-4 w-72 space-y-3 font-mono text-xs">
          <div className="flex justify-between items-center border-b border-slate-700 pb-1.5">
            <span className="font-bold text-emerald-400 animate-pulse">● AI System Assistant</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">v3.1 Node</span>
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
                  const txt = e.target.value;
                  e.target.value = '';
                  const log = document.getElementById('aiTerminalChatLog');
                  log.innerHTML += `<p class="text-blue-400 font-bold mt-1">You:</p><p class="text-slate-200">${txt}</p>`;
                  
                  const res = await fetch('/api/ai-chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
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
