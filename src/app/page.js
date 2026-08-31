'use client';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  // Navigation & Access Control States
  const [activeTab, setActiveTab] = useState('students'); // Choices: 'students', 'attendance', 'teachers', 'system'
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

  // Central State Monitor: Re-fetches records depending on active views and selection shifts
  useEffect(() => {
    if (activeTab === 'students') {
      fetchLiveRosterData();
    } else if (activeTab === 'attendance') {
      fetchLiveAttendanceRecords();
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

  function handleLogoutSequence() {
    localStorage.clear();
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = '/login';
  }
  return (
    <div className="min-h-screen bg-brandNavy text-slate-100 p-6">
      {/* CENTRAL PORTAL BANNER */}
      <header className="max-w-6xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">SHEEK BAKRI SECONDARY SCHOOL</h1>
          <p className="text-xs text-brandGold uppercase font-mono tracking-wider mt-1">
            Cloud Terminal Dashboard // Welcome, <span className="text-white font-bold">{username} ({userRole})</span>
          </p>
        </div>
        <button 
          onClick={handleLogoutSequence} 
          className="bg-red-950/40 hover:bg-red-900 border border-red-900 text-red-400 font-mono text-[10px] tracking-widest uppercase px-3 py-1.5 rounded transition-all"
        >
          Disconnect Session
        </button>
      </header>

      {/* CORE NAVIGATION NAVBAR */}
      <nav className="max-w-6xl mx-auto mb-6 flex flex-wrap bg-surfaceCard p-1.5 rounded-xl border border-slate-800 text-xs font-mono gap-1">
        <button onClick={() => setActiveTab('students')} className={`flex-1 min-w-[120px] text-center py-2.5 rounded-lg font-bold uppercase transition-all ${activeTab === 'students' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>Anba: Student Matrix</button>
        <button onClick={() => setActiveTab('attendance')} className={`flex-1 min-w-[120px] text-center py-2.5 rounded-lg font-bold uppercase transition-all ${activeTab === 'attendance' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>📅 Hordoffii Galmee</button>
        {userRole === 'Admin' && (<button onClick={() => setActiveTab('teachers')} className={`flex-1 min-w-[120px] text-center py-2.5 rounded-lg font-bold uppercase transition-all ${activeTab === 'teachers' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>🔒 Account Console</button>)}
        <button onClick={() => setActiveTab('system')} className={`flex-1 min-w-[120px] text-center py-2.5 rounded-lg font-bold uppercase transition-all ${activeTab === 'system' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>⚙️ Operations Node</button>
      </nav>

      {/* VIEW GRID RENDERING AREA */}
      <main className="max-w-6xl mx-auto">
        {activeTab === 'students' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="bg-surfaceCard p-6 rounded-xl border border-slate-800 h-fit space-y-4">
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide border-b border-slate-700 pb-2">Galmeessi Barataa Haaraa</h2>
              {userRole === 'Admin' ? (
                <form onSubmit={handleEnrollmentSubmit} className="space-y-3 text-xs font-mono">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Target Grade Section</label>
                    <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="w-full bg-brandNavy border border-slate-800 rounded p-2 text-white outline-none">
                      <option value="12 Natural">12 Natural</option>
                      <option value="12 Social">12 Social</option>
                      <option value="Kutaa 10ffaa">Kutaa 10ffaa</option>
                      <option value="Kutaa 9ffaa">Kutaa 9ffaa</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 tracking-wider block mb-1">Student ID</label>
                    <input type="text" placeholder="e.g. STU-001" value={studentForm.studentId} onChange={e => setStudentForm({...studentForm, studentId: e.target.value})} className="w-full bg-brandNavy border border-slate-800 rounded p-2 text-white outline-none" required />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 tracking-wider block mb-1">Full Legal Name</label>
                    <input type="text" placeholder="e.g. Kedir Ahmed" value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} className="w-full bg-brandNavy border border-slate-800 rounded p-2 text-white outline-none" required />
                  </div>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded uppercase transition-colors">Kuusi Galmeessi</button>
                </form>
              ) : (
                <div className="text-xs text-slate-400 bg-brandNavy border border-slate-800 p-4 rounded text-center font-mono">⚠️ Profile Enrollment tools are restricted to Admin roles. Use the grading table cells to edit live academic marks.</div>
              )}
            </section>

            <section className="lg:col-span-2 bg-surfaceCard p-6 rounded-xl border border-slate-800 overflow-hidden">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 mb-4 gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">Active Roster Sheets</h3>
                <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="bg-brandNavy border border-slate-800 rounded p-1.5 text-white font-bold outline-none text-xs">
                  <option value="12 Natural">12 Natural</option>
                  <option value="12 Social">12 Social</option>
                  <option value="Kutaa 10ffaa">Kutaa 10ffaa</option>
                  <option value="Kutaa 9ffaa">Kutaa 9ffaa</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="pb-3">ID</th><th className="pb-3">Maqaa</th><th className="pb-3 text-center">Test 1</th><th className="pb-3 text-center">Test 2</th><th className="pb-3 text-center">Assign</th><th className="pb-3 text-center">Final</th><th className="pb-3 text-right">Waliigala</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {studentsLoading && <tr><td colSpan="7" className="text-center py-4 font-mono text-slate-400 animate-pulse">Syncing...</td></tr>}
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

        {activeTab === 'attendance' && (
          <section className="bg-surfaceCard p-6 rounded-xl border border-slate-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 mb-4 gap-4">
              <h3 className="text-sm font-bold uppercase text-slate-200">Daily Attendance Ledger</h3>
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="bg-brandNavy border border-slate-800 rounded p-1.5 text-white font-bold outline-none">
                  <option value="12 Natural">12 Natural</option><option value="12 Social">12 Social</option><option value="Kutaa 10ffaa">Kutaa 10ffaa</option><option value="Kutaa 9ffaa">Kutaa 9ffaa</option>
                </select>
                <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} className="bg-brandNavy border border-slate-800 rounded p-1 text-white font-bold outline-none" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
  return (
    <div className="min-h-screen bg-brandNavy text-slate-100 p-6">
      {/* HEADER BANNER */}
      <header className="max-w-6xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">SHEEK BAKRI SECONDARY SCHOOL</h1>
          <p className="text-xs text-brandGold uppercase font-mono tracking-wider mt-1">
            Cloud Terminal Dashboard // Welcome, <span className="text-white font-bold">{username} ({userRole})</span>
          </p>
        </div>
        <button onClick={handleLogoutSequence} className="bg-red-950/40 hover:bg-red-900 border border-red-900 text-red-400 font-mono text-[10px] tracking-widest uppercase px-3 py-1.5 rounded transition-all">
          Disconnect Session
        </button>
      </header>

      {/* CORE NAVBAR */}
      <nav className="max-w-6xl mx-auto mb-6 flex flex-wrap bg-surfaceCard p-1.5 rounded-xl border border-slate-800 text-xs font-mono gap-1">
        <button onClick={() => setActiveTab('students')} className={`flex-1 min-w-[120px] text-center py-2.5 rounded-lg font-bold uppercase transition-all ${activeTab === 'students' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>Anba: Student Matrix</button>
        <button onClick={() => setActiveTab('attendance')} className={`flex-1 min-w-[120px] text-center py-2.5 rounded-lg font-bold uppercase transition-all ${activeTab === 'attendance' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>📅 Hordoffii Galmee</button>
        {userRole === 'Admin' && (<button onClick={() => setActiveTab('teachers')} className={`flex-1 min-w-[120px] text-center py-2.5 rounded-lg font-bold uppercase transition-all ${activeTab === 'teachers' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>🔒 Account Console</button>)}
        <button onClick={() => setActiveTab('system')} className={`flex-1 min-w-[120px] text-center py-2.5 rounded-lg font-bold uppercase transition-all ${activeTab === 'system' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>⚙️ Operations Node</button>
      </nav>

      {/* DISPLAY SWITCH LAYER */}
      <main className="max-w-6xl mx-auto">
        {/* VIEW 1: STUDENT MATRIX */}
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
                <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="bg-brandNavy border border-slate-800 rounded p-1 text-white font-bold outline-none text-xs">
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
                    {studentsLoading && <tr><td colSpan="7" className="text-center py-4 font-mono text-slate-400">Syncing...</td></tr>}
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
            <div className="flex justify-between border-b border-slate-800 pb-4 mb-4">
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
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="pb-3">ID Barataa</th><th className="pb-3">Maqaa Guutuu</th><th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
  return (
    <div className="min-h-screen bg-brandNavy text-slate-100 p-6">
      {/* APP BANNER */}
      <header className="max-w-6xl mx-auto mb-6 flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black text-white">SHEEK BAKRI SECONDARY SCHOOL</h1>
          <p className="text-[10px] text-brandGold font-mono">Welcome, {username} ({userRole})</p>
        </div>
        <button onClick={handleLogoutSequence} className="bg-red-950/40 border border-red-900 text-red-400 font-mono text-[10px] px-3 py-1 rounded">Disconnect</button>
      </header>

      {/* COMPACT GLOBAL NAVBAR */}
      <nav className="max-w-6xl mx-auto mb-6 flex bg-surfaceCard p-1 rounded-lg border border-slate-800 text-xs font-mono gap-1">
        <button onClick={() => setActiveTab('students')} className={`flex-1 py-2 rounded ${activeTab === 'students' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Roster</button>
        <button onClick={() => setActiveTab('attendance')} className={`flex-1 py-2 rounded ${activeTab === 'attendance' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>📅 Attendance</button>
        {userRole === 'Admin' && (<button onClick={() => setActiveTab('teachers')} className={`flex-1 py-2 rounded ${activeTab === 'teachers' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>🔒 Users</button>)}
        <button onClick={() => setActiveTab('system')} className={`flex-1 py-2 rounded ${activeTab === 'system' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>⚙️ System</button>
      </nav>

      {/* CORE DISPLAY WINDOW SWITCH */}
      <main className="max-w-6xl mx-auto">
        {/* TAB 1: STUDENT MATRIX */}
        {activeTab === 'students' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="bg-surfaceCard p-4 rounded-lg border border-slate-800 space-y-3 font-mono text-xs">
              <h2 className="font-bold border-b border-slate-700 pb-1">Galmeessi Barataa Haaraa</h2>
              {userRole === 'Admin' ? (
                <form onSubmit={handleEnrollmentSubmit} className="space-y-2">
                  <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="w-full bg-brandNavy border border-slate-800 p-2 text-white outline-none"><option value="12 Natural">12 Natural</option><option value="12 Social">12 Social</option><option value="Kutaa 10ffaa">Kutaa 10ffaa</option><option value="Kutaa 9ffaa">Kutaa 9ffaa</option></select>
                  <input type="text" placeholder="ID" value={studentForm.studentId} onChange={e => setStudentForm({...studentForm, studentId: e.target.value})} className="w-full bg-brandNavy border border-slate-800 p-2 text-white outline-none" required />
                  <input type="text" placeholder="Name" value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} className="w-full bg-brandNavy border border-slate-800 p-2 text-white outline-none" required />
                  <button type="submit" className="w-full bg-blue-600 p-2 text-white font-bold rounded">SAVE STUDENT</button>
                </form>
              ) : (
                <div className="p-2 text-center text-slate-400 bg-brandNavy border border-slate-800 rounded">⚠️ Restricted to Admin accounts.</div>
              )}
            </section>

            <section className="lg:col-span-2 bg-surfaceCard p-4 rounded-lg border border-slate-800">
              <div className="flex justify-between items-center mb-3 text-xs"><h3 className="font-bold">Active Roster</h3><select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="bg-brandNavy border border-slate-800 p-1 text-white outline-none"><option value="12 Natural">12 Natural</option><option value="12 Social">12 Social</option><option value="Kutaa 10ffaa">Kutaa 10ffaa</option><option value="Kutaa 9ffaa">Kutaa 9ffaa</option></select></div>
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left whitespace-nowrap">
                  <thead><tr className="border-b border-slate-800 text-slate-400"><th className="pb-2">ID</th><th>Maqaa</th><th>T1</th><th>T2</th><th>Asgn</th><th>Final</th><th className="text-right">Total</th></tr></thead>
                  <tbody className="divide-y divide-slate-800">
                    {studentsLoading && <tr><td colSpan="7" className="text-center py-4 text-slate-400">Loading...</td></tr>}
                    {!studentsLoading && students.map((s, idx) => (
                      <tr key={idx}>
                        <td className="py-2 font-mono text-blue-400">{s.studentId}</td><td>{s.name}</td>
                        <td><input type="number" defaultValue={s.test1} onBlur={e => handleCellUpdateSubmit(s.studentId, s.subject || 'ICT', 'test1', e.target.value)} className="w-10 bg-brandNavy text-center" /></td>
                        <td><input type="number" defaultValue={s.test2} onBlur={e => handleCellUpdateSubmit(s.studentId, s.subject || 'ICT', 'test2', e.target.value)} className="w-10 bg-brandNavy text-center" /></td>
                        <td><input type="number" defaultValue={s.assignment} onBlur={e => handleCellUpdateSubmit(s.studentId, s.subject || 'ICT', 'assignment', e.target.value)} className="w-10 bg-brandNavy text-center" /></td>
                        <td><input type="number" defaultValue={s.finalExam} onBlur={e => handleCellUpdateSubmit(s.studentId, s.subject || 'ICT', 'finalExam', e.target.value)} className="w-10 bg-brandNavy text-center" /></td>
                        <td className="text-right font-black text-emerald-400 font-mono">{s.totalScore || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: ATTENDANCE LEDGER */}
        {activeTab === 'attendance' && (
          <section className="bg-surfaceCard p-4 rounded-lg border border-slate-800 text-xs">
            <div className="flex justify-between border-b border-slate-800 pb-2 mb-3">
              <h3 className="font-bold">Daily Attendance Matrix</h3>
              <div className="flex gap-2">
                <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="bg-brandNavy border border-slate-800 p-1 text-white"><option value="12 Natural">12 Natural</option><option value="12 Social">12 Social</option><option value="Kutaa 10ffaa">Kutaa 10ffaa</option><option value="Kutaa 9ffaa">Kutaa 9ffaa</option></select>
                <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} className="bg-brandNavy border border-slate-800 p-1 text-white" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead><tr className="border-b border-slate-800 text-slate-400"><th className="pb-2">ID Barataa</th><th>Maqaa Guutuu</th><th className="text-right">Status</th></tr></thead>
                <tbody className="divide-y divide-slate-800">
                  {attendanceLoading && <tr><td colSpan="3" className="text-center py-4 text-slate-400">Syncing...</td></tr>}
                  {!attendanceLoading && attendanceRecords.map((s, idx) => (
                    <tr key={idx}>
                      <td className="py-2 font-mono text-blue-400">{s.studentId}</td><td>{s.name}</td>
                      <td className="text-right"><select value={s.status || 'Not Marked'} onChange={(e) => handleAttendanceCellChange(s.studentId, e.target.value)} className="bg-brandNavy border border-slate-800 rounded p-1 text-[11px] font-bold"><option value="Not Marked">Not Marked</option><option value="Present">Present</option><option value="Absent">Absent</option><option value="Late">Late</option></select></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 3: ACCOUNT CONSOLE */}
        {activeTab === 'teachers' && userRole === 'Admin' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs font-mono">
            <section className="bg-surfaceCard p-4 rounded-lg border border-slate-800 space-y-3">
              <h2 className="font-bold border-b border-slate-700 pb-1">Generate Profile Access</h2>
              <form onSubmit={handleUserCreationSubmit} className="space-y-2">
                <input type="text" placeholder="Username" value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} className="w-full bg-brandNavy border border-slate-800 p-2 text-white outline-none" required />
                <input type="email" placeholder="Email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="w-full bg-brandNavy border border-slate-800 p-2 text-white outline-none" required />
                <input type="password" placeholder="Password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="w-full bg-brandNavy border border-slate-800 p-2 text-white outline-none" required />
                <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})} className="w-full bg-brandNavy border border-slate-800 p-2 text-white outline-none"><option value="Teacher">Teacher</option><option value="Admin">Admin</option></select>
                <button type="submit" className="w-full bg-emerald-600 p-2 text-white font-bold rounded">COMMIT USER</button>
              </form>
            </section>
            <section className="lg:col-span-2 bg-surfaceCard p-4 rounded-lg border border-slate-800">
              <h3 className="font-bold border-b border-slate-800 pb-2 mb-3">Registry Ledger</h3>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* TAB 4: SYSTEM INFO */}
        {activeTab === 'system' && (
          <section className="bg-surfaceCard p-4 rounded-lg border border-slate-800 max-w-sm mx-auto text-xs font-mono space-y-2">
            <h3 className="font-bold border-b border-slate-800 pb-1 text-white">Node Metrics</h3>
            <div className="flex justify-between border-b border-slate-900 pb-1"><span>Database Client:</span><span className="text-emerald-400">MySQL / alwaysdata</span></div>
            <div className="flex justify-between border-b border-slate-900 pb-1"><span>Deployment Engine:</span><span className="text-blue-400">Render Container</span></div>
            <div className="flex justify-between"><span>Subject Track:</span><span className="text-amber-400 font-bold">ICT</span></div>
          </section>
        )}
      </main>
    </div>
  );
}
