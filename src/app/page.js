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
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(studentForm) 
      });
      if (res.ok) { 
        alert("Barataa haaraan galmeeffameera!"); 
        setStudentForm({ 
          barataa_id: '', maqaa: '', maqaa_abbaa: '', maqaa_akaaka: '', saala: 'Dhiira',
          umrii: '', bilbila_wabii: '', kutaa: selectedGrade, sadarkaa_kutaa: 'A',
          bara_galmee: '2019', aradaa: '', ganda: '', bilbila_barataa: '', fan_fayda_aliansn: '' 
        }); 
        fetchLiveRosterData(); 
      }
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
            onChange={(e) => { 
              setCurrentRoleView(e.target.value); 
              setActiveTab(e.target.value === 'Admin' ? 'director-overview' : 'instructor-roster'); 
            }}
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
              <button onClick={() => setActiveTab('director-overview')} className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${activeTab === 'director-overview' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md' : 'text-slate-400 hover:bg-slate-800/50'}`}>
                📊 Director Overview
              </button>
              <button onClick={() => setActiveTab('student-enrollment')} className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${activeTab === 'student-enrollment' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md' : 'text-slate-400 hover:bg-slate-800/50'}`}>
                📝 Student Enrollment
              </button>
            </>
          )}

          <button onClick={() => setActiveTab('instructor-roster')} className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${activeTab === 'instructor-roster' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md' : 'text-slate-400 hover:bg-slate-800/50'}`}>
            👥 Student Roster
          </button>
          <button onClick={() => setActiveTab('instructor-exams')} className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${activeTab === 'instructor-exams' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md' : 'text-slate-400 hover:bg-slate-800/50'}`}>
            ✍️ Exam Matrix Creator
          </button>
          <button onClick={() => setActiveTab('student-library')} className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${activeTab === 'student-library' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md' : 'text-slate-400 hover:bg-slate-800/50'}`}>
            📚 Digital Library
          </button>
        </aside>

        {/* Right Main Working Layout Window */}
        <main className="flex-1 p-6 space-y-6">
          
          {/* Grade Filtering Node */}
          <div className="flex flex-wrap justify-between items-center gap-4 bg-slate-950/30 p-4 border border-slate-800 rounded-2xl">
            <div>
              <h2 className="text-lg font-bold text-white capitalize">{activeTab.replace('-', ' ')}</h2>
              <p className="text-xs text-slate-400">Real-time school management workspace environment.</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Kutaa / Grade:</label>
              <select 
                value={selectedGrade} 
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs px-3 py-2 rounded-xl text-white font-semibold cursor-pointer focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="9">Grade 9</option>
                <option value="10">Grade 10</option>
                <option value="11 Natural">Grade 11 Natural</option>
                <option value="11 Social">Grade 11 Social</option>
                <option value="12 Natural">Grade 12 Natural</option>
                <option value="12 Social">Grade 12 Social</option>
              </select>
            </div>
          </div>

          {/* --- TAB VIEW 1: DIRECTOR OVERVIEW --- */}
          {activeTab === 'director-overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-2xl">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Finance Ledger</span>
                <h3 className="text-2xl font-black text-white mt-1">{financeLoading ? "Loading..." : `${financeLedger.length} Records`}</h3>
              </div>
              <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-2xl">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Enrolled Students</span>
                <h3 className="text-2xl font-black text-white mt-1">{studentsLoading ? "Syncing..." : `${students.length} Active`}</h3>
              </div>
              <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-2xl">
                <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Online Exams</span>
                <h3 className="text-2xl font-black text-white mt-1">{examsLoading ? "Processing..." : `${exams.length} Configured`}</h3>
              </div>
            </div>
          )}

          {/* --- TAB VIEW 2: STUDENT ENROLLMENT --- */}
          {activeTab === 'student-enrollment' && (
            <form onSubmit={handleEnrollmentSubmit} className="bg-slate-950/40 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800/80 pb-2">Galmee Barataa Haaraa</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">ID Barataa *</label>
                  <input type="text" placeholder="E.g., SMS/001" value={studentForm.barataa_id} onChange={e => setStudentForm({...studentForm, barataa_id: e.target.value})} className="w-full bg-slate-900 border border-slate-700 text-sm p-2.5 rounded-xl text-white" required />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Maqaa Barataa *</label>
                  <input type="text" placeholder="Maqaa First" value={studentForm.maqaa} onChange={e => setStudentForm({...studentForm, maqaa: e.target.value})} className="w-full bg-slate-900 border border-slate-700 text-sm p-2.5 rounded-xl text-white" required />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Maqaa Abbaa *</label>
                  <input type="text" placeholder="Maqaa Middle" value={studentForm.maqaa_abbaa} onChange={e => setStudentForm({...studentForm, maqaa_abbaa: e.target.value})} className="w-full bg-slate-900 border border-slate-700 text-sm p-2.5 rounded-xl text-white" required />
                </div>
              </div>
              <div className="pt-2">
                <button type="submit" className="bg-purple-600 text-sm font-bold px-6 py-2.5 rounded-xl text-white">
                  Save Barataa
                </button>
              </div>
            </form>
          )}

          {/* --- TAB VIEW 3: STUDENT ROSTER --- */}
          {activeTab === 'instructor-roster' && (
            <div className="bg-slate-950/40 border border-slate-800 p-6 rounded-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs uppercase bg-slate-900 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">ID Barataa</th>
                      <th className="p-3">Maqaa Guutuu</th>
                      <th className="p-3">Saala</th>
                      <th className="p-3">Kutaa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsLoading ? (
                      <tr><td colSpan="4" className="text-center p-6 text-slate-400">Loading student directory pipeline...</td></tr>
                    ) : students.length === 0 ? (
                      <tr><td colSpan="4" className="text-center p-6 text-slate-500">No student records matches found for "{selectedGrade}".</td></tr>
                    ) : (
                      students.map((student, idx) => (
                        <tr key={idx} className="border-b border-slate-800/60 hover:bg-slate-900/30 transition">
                          <td className="p-3 text-cyan-400 font-mono font-bold">{student.barataa_id}</td>
                          <td className="p-3 text-white">{student.maqaa} {student.maqaa_abbaa}</td>
                          <td className="p-3">{student.saala}</td>
                          <td className="p-3">{student.kutaa} ({student.sadarkaa_kutaa})</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- TAB VIEW 4 & 5 FALLBACK PLACEHOLDERS --- */}
          {['instructor-exams', 'student-library'].includes(activeTab) && (
            <div className="bg-slate-950/40 border border-slate-800 p-12 rounded-2xl text-center">
              <p className="text-slate-400 text-sm">The <strong>{activeTab.replace('-', ' ')}</strong> database controller is actively synced.</p>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
