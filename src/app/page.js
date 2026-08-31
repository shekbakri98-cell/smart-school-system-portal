'use client';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  // Navigation & Access States
  const [activeTab, setActiveTab] = useState('students'); // Choices: 'students', 'teachers', 'system'
  const [userRole, setUserRole] = useState('Teacher'); // Fallback safe role default
  const [username, setUsername] = useState('User');

  // Student Section States
  const [selectedGrade, setSelectedGrade] = useState('12 Natural');
  const [students, setStudents] = useState([]);
  const [studentForm, setStudentForm] = useState({ studentId: '', name: '' });
  const [studentsLoading, setStudentsLoading] = useState(false);

  // User Administration Section States
  const [systemUsers, setSystemUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userForm, setUserForm] = useState({ username: '', email: '', password: '', role: 'Teacher' });

  // Load client cookies/storage configurations on initialization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('userRole') || 'Teacher';
      const storedName = localStorage.getItem('username') || 'User';
      setUserRole(storedRole);
      setUsername(storedName);
    }
  }, []);

  // Fetch student roster data when selected grade or active tab shifts
  useEffect(() => {
    if (activeTab === 'students') {
      fetchLiveRosterData();
    } else if (activeTab === 'teachers' && userRole === 'Admin') {
      fetchSystemUsers();
    }
  }, [selectedGrade, activeTab, userRole]);

  // REST API Pipeline Handlers
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

  async function fetchSystemUsers() {
    setUsersLoading(true);
    try {
      // Endpoint utility routing straight back into the central users management structure
      const res = await fetch('/api/auth'); 
      const result = await res.json();
      // Graceful fallback array filtering if route handles data mutations differently
      setSystemUsers(result.users || []);
    } catch (err) {
      console.error("Failed fetching infrastructure credentials ledger:", err);
    } finally {
      setUsersLoading(false);
    }
  }

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
        method: 'PUT', // Assuming PUT handles management expansions on credentials mapping files
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

  function handleLogoutSequence() {
    localStorage.clear();
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = '/login';
  }

  return (
    <div className="min-h-screen bg-brandNavy text-slate-100 p-6">
      {/* CENTRAL SCHOOL HEADER */}
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

      {/* 1. UPGRADE BAR: NAVIGATION NAVBAR */}
      <nav className="max-w-6xl mx-auto mb-6 flex bg-surfaceCard p-1.5 rounded-xl border border-slate-800 text-xs font-mono">
        <button 
          onClick={() => setActiveTab('students')}
          className={`flex-1 text-center py-2.5 rounded-lg font-bold uppercase transition-all ${activeTab === 'students' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
        >
          📖 Student Records Matrix
        </button>
        
        {/* 2. UPGRADE BAR: ROLE-BASED VISIBILITY FILTER (Only Admin can view User management options) */}
        {userRole === 'Admin' && (
          <button 
            onClick={() => setActiveTab('teachers')}
            className={`flex-1 text-center py-2.5 rounded-lg font-bold uppercase transition-all ${activeTab === 'teachers' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            🔒 Account Management Console
          </button>
        )}

        <button 
          onClick={() => setActiveTab('system')}
          className={`flex-1 text-center py-2.5 rounded-lg font-bold uppercase transition-all ${activeTab === 'system' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
        >
          ⚙️ Core Settings
        </button>
      </nav>

      {/* CORE ROUTING COMPONENT CONTAINER VIEWS */}
      <main className="max-w-6xl mx-auto">
        
        {/* VIEW A: STUDENT RECORDS MATRIX TAB */}
        {activeTab === 'students' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Enrollment Form Side Control Panel (Hidden from pure Teachers if necessary, or open for registrations) */}
                       <section className="bg-surfaceCard p-6 rounded-xl border border-slate-800 h-fit space-y-4">
              <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">Galmeessi Barataa Haaraa</h2>
              </div>
              
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
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Student Identifier Hash</label>
                    <input type="text" placeholder="e.g. STU-001" value={studentForm.studentId} onChange={e => setStudentForm({...studentForm, studentId: e.target.value})} className="w-full bg-brandNavy border border-slate-800 rounded p-2 text-white outline-none" required />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Full Legal Name</label>
                    <input type="text" placeholder="e.g. Kedir Ahmed" value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} className="w-full bg-brandNavy border border-slate-800 rounded p-2 text-white outline-none" required />
                  </div>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded uppercase tracking-wider transition-colors mt-2">Kuusi Galmeessi</button>
                </form>
              ) : (
                <div className="text-xs text-slate-400 bg-brandNavy border border-slate-800 p-4 rounded text-center font-mono">
                  ⚠️ Profile Enrollment tools are restricted to Admin roles. Use the grading table cells to edit live academic marks.
                </div>
              )}
            </section>
          </div>
        )}

        {/* 3. UPGRADE COMPONENT VIEW B: TEACHER & ADMIN CREATIVE CONSOLE PANEL */}
        {activeTab === 'teachers' && userRole === 'Admin' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Generate Teacher User Profile Form */}
            <section className="bg-surfaceCard p-6 rounded-xl border border-slate-800 h-fit space-y-4">
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide border-b border-slate-700 pb-2">Generate Profile Access</h2>
              <form onSubmit={handleUserCreationSubmit} className="space-y-3 text-xs font-mono">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Username Identifier</label>
                  <input type="text" placeholder="e.g. chala_teacher" value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} className="w-full bg-brandNavy border border-slate-800 rounded p-2 text-white outline-none" required />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Secure Contact Email</label>
                  <input type="email" placeholder="teacher@school.edu" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="w-full bg-brandNavy border border-slate-800 rounded p-2 text-white outline-none" required />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Initial Password Token</label>
                  <input type="password" placeholder="••••••••" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="w-full bg-brandNavy border border-slate-800 rounded p-2 text-white outline-none" required />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Access Authorization Level</label>
                  <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})} className="w-full bg-brandNavy border border-slate-800 rounded p-2 text-white outline-none">
                    <option value="Teacher">Teacher / Instructor</option>
                    <option value="Admin">System Administrator</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded uppercase tracking-wider transition-colors mt-2">Commit User Profile</button>
              </form>
            </section>

            {/* Network Active Credentials Ledger Grid */}
            <section className="lg:col-span-2 bg-surfaceCard p-6 rounded-xl border border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-4 mb-4">Core Infrastructure Registry Ledger</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="pb-3">User Node</th>
                      <th className="pb-3">Email Address Route</th>
                      <th className="pb-3 text-right">Access Permission Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                    {usersLoading && <tr><td colSpan="3" className="text-center py-8 text-slate-400 animate-pulse">Syncing user directory...</td></tr>}
                    {!usersLoading && systemUsers.length === 0 && (
                      <tr className="text-slate-400">
                        <td className="py-3 text-blue-400 font-bold">admin</td>
                        <td className="py-3">admin@hub.edu</td>
                        <td className="py-3 text-right text-purple-400 font-bold">Admin</td>
                      </tr>
                    )}
                    {!usersLoading && systemUsers.map((user, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        <td className="py-3 font-semibold text-slate-200">{user.username}</td>
                        <td className="py-3 text-slate-400">{user.email}</td>
                        <td className={`py-3 text-right font-bold ${user.role === 'Admin' ? 'text-purple-400' : 'text-slate-300'}`}>{user.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* VIEW C: STATIC SYSTEM CONFIGURATION VIEW */}
        {activeTab === 'system' && (
          <section className="bg-surfaceCard p-6 rounded-xl border border-slate-800 max-w-xl mx-auto text-xs font-mono space-y-4">
            <h3 className="text-sm font-bold uppercase border-b border-slate-800 pb-2 text-white">System Operations Node Metrics</h3>
            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between border-b border-slate-900 pb-1"><span>Database Client Link:</span><span className="text-emerald-400">ONLINE (MySQL / alwaysdata)</span></div>
              <div className="flex justify-between border-b border-slate-900 pb-1"><span>Deployment Engine:</span><span className="text-blue-400">Production Layer Container (Render)</span></div>
              <div className="flex justify-between border-b border-slate-900 pb-1"><span>Current Version State:</span><span>v2.1.0-Stable-Release</span></div>
              <div className="flex justify-between"><span>Core Tracking Subject Parameter:</span><span className="text-amber-400 font-bold">Information &amp; Communication Technology (ICT)</span></div>
            </div>
            <div className="bg-brandNavy p-3 border border-slate-800 rounded text-slate-400 text-[11px] leading-relaxed">
              💡 To modify default class subjects or append parameters like attendance percentages, update row field bindings within the backend `src/app/api/students/route.js` routing logic.
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
