'use client';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  // --- MODULE 1: GLOBAL CONSOLE NAVIGATION STATES ---
  const [currentRoleView, setCurrentRoleView] = useState('Director');
  const [activeTab, setActiveTab] = useState('director-overview');
  const [userRole, setUserRole] = useState('Admin'); 
  const [username, setUsername] = useState('Admin User');

  // --- MODULE 2: ADVANCED 14-FIELD STUDENT FORM STATES ---
  const [selectedGrade, setSelectedGrade] = useState('12 Natural');
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentForm, setStudentForm] = useState({
    barataa_id: '', maqaa: '', maqaa_abbaa: '', maqaa_akaaka: '', saala: 'Dhiira',
    umrii: '', bilbila_wabii: '', kutaa: '12 Natural', sadarkaa_kutaa: 'A',
    bara_galmee: '2019', aradaa: '', ganda: '', bilbila_barataa: '', fan_fayda_aliansn: ''
  });

  // --- MODULE 3: TESTING MATRIX STATES (EXAM CREATOR) ---
  const [exams, setExams] = useState([]);
  const [examsLoading, setExamsLoading] = useState(false);
  const [examForm, setExamForm] = useState({ title: '', subject: 'ICT', questions: [] });
  const [currentQuestion, setCurrentQuestion] = useState({ text: '', a: '', b: '', c: '', d: '', correct: 'A' });

  // --- MODULE 4: DIGITAL LIBRARY STATES ---
  const [books, setBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(false);
  const [libraryForm, setLibraryForm] = useState({ title: '', author: '', downloadUrl: '' });

  // --- MODULE 5: AUXILIARY FINANCE STATES ---
  const [financeLedger, setFinanceLedger] = useState([]);
  const [financeLoading, setFinanceLoading] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toLocaleDateString('sv-SE'));
  // --- HOOK 1: SAFE SESSION INITIALIZER ---
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

  // --- HOOK 2: PROTECTED CONCURRENCY TUNNEL (Prevents 503 Overlap Loops) ---
  useEffect(() => {
    if (activeTab === 'instructor-roster' && !studentsLoading) {
      fetchLiveRosterData();
    } else if (activeTab === 'instructor-exams' && !examsLoading) {
      fetchLiveExams();
    } else if (activeTab === 'director-overview' && !financeLoading) {
      fetchLiveFinanceLedger();
    } else if (activeTab === 'student-library' && !booksLoading) {
      fetchLiveLibraryBooks();
    }
  }, [activeTab, selectedGrade, attendanceDate]); 

  // --- NETWORK CONTROLLER LOGIC ENGINES ---
  async function fetchLiveRosterData() {
    setStudentsLoading(true);
    try {
      const res = await fetch(`/api/students?grade=${encodeURIComponent(selectedGrade)}`);
      if (!res.ok) { setStudents([]); return; }
      const result = await res.json();
      setStudents(result && result.data ? result.data : []);
    } catch (err) { console.error(err); setStudents([]); } finally { setStudentsLoading(false); }
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
    } catch (err) { console.error(err); } finally { setFinanceLoading(false); }
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

  async function handleEnrollmentSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/students', { 
        method: 'POST', headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(studentForm) 
      });
      if (res.ok) { alert("Barataan haaraan galmeeffameera!"); setStudentForm({ barataa_id: '', maqaa: '', maqaa_abbaa: '', maqaa_akaaka: '', saala: 'Dhiira', umrii: '', bilbila_wabii: '', kutaa: selectedGrade, sadarkaa_kutaa: 'A', bara_galmee: '2019', aradaa: '', ganda: '', bilbila_barataa: '', fan_fayda_aliansn: '' }); fetchLiveRosterData(); }
    } catch (err) { console.error(err); }
  }
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {/* TOP HEADER GLOBAL APP BANNER */}
      <header className="bg-gradient-to-r from-purple-800 to-indigo-900 shadow-xl flex flex-col md:flex-row justify-between items-center border-b border-purple-700/60 p-4">
        <div className="text-center md:text-left">
          <h1 className="text-xl md:text-2xl font-black tracking-wide text-cyan-400">Mana Barnoota Sheek Bakrii Saphaloo Sad.2ffaa</h1>
          <p className="text-xs md:text-sm text-yellow-400 font-bold italic tracking-wider mt-0.5">Shek Bekri Sapalo Secondary School Portal</p>
        </div>
        <div className="flex items-center gap-4 mt-3 md:mt-0">
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">Profile: <strong className="text-white">{username}</strong></span>
          <select 
            value={currentRoleView} 
            onChange={(e) => { setCurrentRoleView(e.target.value); setActiveTab(e.target.value === 'Admin' ? 'director-overview' : 'instructor-roster'); }}
            className="bg-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl text-white border border-slate-700 focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer"
          >
            <option value="Admin">⚙️ View: Director (Admin)</option>
            <option value="Teacher">👨‍🏫 View: Instructor</option>
          </select>
        </div>
      </header>

      {/* CORE FRAMEWORK INTERFACE SPLITTING SHELL */}
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Left Side Action Sidebar Panel Menu */}
        <aside className="w-full md:w-64 bg-slate-950/60 p-4 border-b md:border-b-0 md:border-r border-slate-800/80 space-y-1">
          <div className="text-slate-500 text-xs font-black px-2 uppercase tracking-widest mb-3 select-none">Modules</div>
          {currentRoleView === 'Admin' && (
            <>
              <button onClick={() => setActiveTab('director-overview')} className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${activeTab === 'director-overview' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md' : 'text-slate-400 hover:bg-slate-800/60'}`}><span>📊</span> Director Overview</button>
              <button onClick={() => setActiveTab('director-finance')} className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${activeTab === 'director-finance' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md' : 'text-slate-400 hover:bg-slate-800/60'}`}><span>💼</span> Finance Ledger</button>
            </>
          )}
          <button onClick={() => setActiveTab('instructor-roster')} className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${activeTab === 'instructor-roster' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md' : 'text-slate-400 hover:bg-slate-800/60'}`}><span>📝</span> Academic Roster (Galmeesi)</button>
          <button onClick={() => setActiveTab('instructor-exams')} className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${activeTab === 'instructor-exams' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md' : 'text-slate-400 hover:bg-slate-800/60'}`}><span>📋</span> Exam Creator (Gaaffii)</button>
          <button onClick={() => setActiveTab('student-library')} className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${activeTab === 'student-library' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md' : 'text-slate-400 hover:bg-slate-800/60'}`}><span>📚</span> Digital Library</button>
        </aside>

        {/* Right Active View Workspace Shell */}
        <main className="flex-1 p-4 md:p-6 bg-slate-950 overflow-y-auto">
          {/* Active Cohort Filter Dropdown Toolbar */}
          <div className="mb-6 bg-slate-900 p-4 rounded-2xl border border-slate-800/80 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-400 font-black uppercase whitespace-nowrap">Active Target Cohort:</label>
              <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-sm font-semibold text-white focus:outline-none cursor-pointer">
                <option value="9A">Grade 9</option>
                <option value="10A">Grade 10</option>
                <option value="12 Natural">Grade 12 Natural</option>
              </select>
            </div>
          </div>
          {/* TAB AREA 1: SYSTEM OVERVIEW SCREEN */}
          {activeTab === 'director-overview' && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-purple-400 uppercase tracking-wider">📊 Overview Metrics</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-5 rounded-2xl text-slate-950 font-bold shadow-xl">
                  <span className="text-xs block opacity-80 uppercase font-black">Waliiga (Total)</span>
                  <span className="text-4xl font-black mt-1 block">{studentsLoading ? '...' : students.length || 4}</span>
                </div>
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-5 rounded-2xl text-slate-950 shadow-xl">
                  <span className="text-xs block opacity-80 uppercase font-black">Dhiira (Males)</span>
                  <span className="text-4xl font-black mt-1 block">5</span>
                </div>
                <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-5 rounded-2xl text-slate-950 shadow-xl">
                  <span className="text-xs block opacity-80 uppercase font-black">Dubara (Females)</span>
                  <span className="text-4xl font-black mt-1 block">1</span>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-5 rounded-2xl text-slate-950 shadow-xl">
                  <span className="text-xs block opacity-80 uppercase font-black">Ledger Streams</span>
                  <span className="text-4xl font-black mt-1 block">{financeLedger.length}</span>
                </div>
              </div>

              {/* ADVANCED 14-FIELD REGISTRATION REGISTRY SUB-FORM */}
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
                <h3 className="text-sm font-black uppercase tracking-wider mb-6 text-cyan-400 border-b border-slate-800 pb-2">
                  📋 Unka Galmee Barattootaa (Student Registration Form)
                </h3>
                <form onSubmit={handleEnrollmentSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div><label className="text-xs text-slate-400 font-bold block mb-1">Barataa_ID</label><input type="text" value={studentForm.barataa_id} onChange={(e) => setStudentForm({...studentForm, barataa_id: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none" required /></div>
                      <div><label className="text-xs text-slate-400 font-bold block mb-1">Maqaa</label><input type="text" value={studentForm.maqaa} onChange={(e) => setStudentForm({...studentForm, maqaa: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none" required /></div>
                      <div><label className="text-xs text-slate-400 font-bold block mb-1">Maqaa Abbaa</label><input type="text" value={studentForm.maqaa_abbaa} onChange={(e) => setStudentForm({...studentForm, maqaa_abbaa: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none" /></div>
                      <div><label className="text-xs text-slate-400 font-bold block mb-1">Maqaa Akaaka</label><input type="text" value={studentForm.maqaa_akaaka} onChange={(e) => setStudentForm({...studentForm, maqaa_akaaka: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none" /></div>
                      <div><label className="text-xs text-slate-400 font-bold block mb-1">Saala</label><select value={studentForm.saala} onChange={(e) => setStudentForm({...studentForm, saala: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none"><option value="Dhiira">Dhiira (Male)</option><option value="Dubara">Dubara (Female)</option></select></div>
                      <div><label className="text-xs text-slate-400 font-bold block mb-1">Umrii</label><input type="number" value={studentForm.umrii} onChange={(e) => setStudentForm({...studentForm, umrii: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none" /></div>
                      <div><label className="text-xs text-slate-400 font-bold block mb-1">Bilbila Wabii</label><input type="text" value={studentForm.bilbila_wabii} onChange={(e) => setStudentForm({...studentForm, bilbila_wabii: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none" /></div>
                    </div>
                    <div className="space-y-3">
                      <div><label className="text-xs text-slate-400 font-bold block mb-1">Kutaa</label><select value={studentForm.kutaa} onChange={(e) => setStudentForm({...studentForm, kutaa: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none"><option value="9A">Grade 9</option><option value="10A">Grade 10</option><option value="12 Natural">Grade 12 Natural</option></select></div>
                      <div><label className="text-xs text-slate-400 font-bold block mb-1">Sadarkaa Kutaa</label><input type="text" value={studentForm.sadarkaa_kutaa} onChange={(e) => setStudentForm({...studentForm, sadarkaa_kutaa: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none" /></div>
                      <div><label className="text-xs text-slate-400 font-bold block mb-1">Bara Galmee</label><input type="text" value={studentForm.bara_galmee} onChange={(e) => setStudentForm({...studentForm, bara_galmee: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none" /></div>
                      <div><label className="text-xs text-slate-400 font-bold block mb-1">Aradaa</label><input type="text" value={studentForm.aradaa} onChange={(e) => setStudentForm({...studentForm, aradaa: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none" /></div>
                      <div><label className="text-xs text-slate-400 font-bold block mb-1">Ganda</label><input type="text" value={studentForm.ganda} onChange={(e) => setStudentForm({...studentForm, ganda: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none" /></div>
                      <div><label className="text-xs text-slate-400 font-bold block mb-1">Bilbila Barataa</label><input type="text" value={studentForm.bilbila_barataa} onChange={(e) => setStudentForm({...studentForm, bilbila_barataa: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none" /></div>
                      <div><label className="text-xs text-slate-400 font-bold block mb-1">FAN_FaydaAliansN</label><input type="text" value={studentForm.fan_fayda_aliansn} onChange={(e) => setStudentForm({...studentForm, fan_fayda_aliansn: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none" /></div>
                    </div>
                  </div>
                  <div className="flex gap-3 border-t border-slate-800 pt-4 mt-2">
                    <button type="submit" className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl text-sm py-2.5 shadow-md transition transform active:scale-95">💾 Kuus (Save Record)</button>
                    <button type="button" onClick={() => setStudentForm({ barataa_id: '', maqaa: '', maqaa_abbaa: '', maqaa_akaaka: '', saala: 'Dhiira', umrii: '', bilbila_wabii: '', kutaa: '12 Natural', sadarkaa_kutaa: 'A', bara_galmee: '2019', aradaa: '', ganda: '', bilbila_barataa: '', fan_fayda_aliansn: '' })} className="bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition">🔄 Haaraa (Clear)</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB AREA 2: CLASSROOM ENROLLMENT ROSTER MATRICES */}
          {activeTab === 'instructor-roster' && (
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
              <h2 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-4">📋 Classroom Enrollment Matrix View ({selectedGrade})</h2>
              {studentsLoading ? (
                <div className="text-xs text-slate-400 py-4 animate-pulse">Querying database configurations...</div>
              ) : students.length === 0 ? (
                <div className="text-xs text-amber-400 p-4 bg-amber-950/10 border border-amber-900/30 rounded-xl text-center">No student records bound to target grade block currently.</div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-800 text-slate-300 font-bold border-b border-slate-700">
                        <th className="p-3.5 text-xs uppercase">Internal ID Key Mapping</th>
                        <th className="p-3.5 text-xs uppercase">Student Identity Field Label</th>
                        <th className="p-3.5 text-xs uppercase">Assigned Academic Track</th>
                      </tr>
                    </thead>
          {/* --- VIEW SCREEN MODULE 4: DIGITAL LIBRARY FILE DISTRIBUTION MODULE --- */}
          {activeTab === 'student-library' && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-sm font-bold text-purple-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
                <span>📚</span> Digital Library Document Distribution Hierarchy
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
                  <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider">Catalogue Academic Resource</h3>
                  
                  <form onSubmit={async (e) => { 
                    e.preventDefault(); 
                    if (!libraryForm.title || !libraryForm.author || !libraryForm.downloadUrl) return alert("Fields cleanly!"); 
                    try { 
                      const res = await fetch('/api/library', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...libraryForm, grade: selectedGrade }) }); 
                      if (res.ok) { alert("Textbook resource committed safely!"); setLibraryForm({ title: '', author: '', downloadUrl: '' }); fetchLiveLibraryBooks(); } 
                    } catch (err) { console.error(err); } 
                  }} className="space-y-3">
                    
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block mb-1 uppercase">Textbook Title</label>
                      <input type="text" placeholder="e.g., Grade 12 ICT Textbook" value={libraryForm.title} onChange={(e) => setLibraryForm({...libraryForm, title: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none" required />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block mb-1 uppercase">Author / Publisher</label>
                      <input type="text" placeholder="e.g., Ministry of Education" value={libraryForm.author} onChange={(e) => setLibraryForm({...libraryForm, author: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none" required />
                    </div>
                    
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block mb-1 uppercase">Download Link URL</label>
                      <input type="url" placeholder="https://google.com..." value={libraryForm.downloadUrl} onChange={(e) => setLibraryForm({...libraryForm, downloadUrl: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none" required />
                    </div>

                    <button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 font-bold text-white py-2.5 rounded-xl text-sm shadow mt-2">
                      Distribute Textbook File
                    </button>
                  </form>
                </div>
                <div className="lg:col-span-2 p-5 rounded-2xl border border-slate-800 shadow-xl bg-slate-900">
                  <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider mb-4">Available Classroom Material Books</h3>
                  {booksLoading ? ( 
                    <div className="text-xs text-slate-500 animate-pulse text-center py-4">Querying database references...</div> 
                  ) : books.length === 0 ? ( 
                    <div className="text-xs text-amber-400 border border-amber-900/30 bg-amber-950/10 p-4 rounded-xl text-center">No textbooks catalogs linked here currently.</div> 
                  ) : ( 
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                      {books.map((b, idx) => ( 
                        <div key={idx} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-white">{b.title}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">By: {b.author}</p>
                          </div>
                          <div className="flex justify-between items-center border-t border-slate-800/60 mt-3 pt-2">
                            <span className="text-[9px] font-mono text-slate-500">Ref: #B0{b.id}</span>
                            <a href={b.downloadUrl} target="_blank" rel="noopener noreferrer" className="bg-purple-950/60 text-purple-300 border border-purple-800/60 font-bold px-2.5 py-1 rounded text-[10px] tracking-wide">📥 Open Link</a>
                          </div>
                        </div> 
                      ))}
                    </div> 
                  )}
                </div>
              </div>
            </div>
          )}
