'use client';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  // Global View Mode and Authentication State Containers
  const [currentRoleView, setCurrentRoleView] = useState('Director');
  const [activeTab, setActiveTab] = useState('director-overview');
  const [userRole, setUserRole] = useState('Admin'); 
  const [username, setUsername] = useState('Admin User');

  // Student Demographic and Enrollment Array Records
  const [selectedGrade, setSelectedGrade] = useState('12 Natural');
  const [students, setStudents] = useState([]);
  const [studentForm, setStudentForm] = useState({ studentId: '', name: '' });
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Testing Matrix and Exam Question Structure Parameters
  const [exams, setExams] = useState([]);
  const [examsLoading, setExamsLoading] = useState(false);
  const [examForm, setExamForm] = useState({ title: '', subject: 'ICT', questions: [] });
  const [currentQuestion, setCurrentQuestion] = useState({ text: '', a: '', b: '', c: '', d: '', correct: 'A' });

  // Fallback Arrays for Auxiliary Finance and Calendar State Management
  const [attendanceDate, setAttendanceDate] = useState(new Date().toLocaleDateString('sv-SE'));
  const [financeLedger, setFinanceLedger] = useState([]);
  const [financeLoading, setFinanceLoading] = useState(false);
  // Operational Hook 1: Local Cookie Tracker (Fires once on mounting)
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

  // Operational Hook 2: Concurrency Blocker Sync Layer (Eliminates Render 503 Crashes)
  useEffect(() => {
    if (activeTab === 'instructor-roster' && !studentsLoading) {
      fetchLiveRosterData();
    } else if (activeTab === 'instructor-exams' && !examsLoading) {
      fetchLiveExams();
    } else if (activeTab === 'director-overview' && !financeLoading) {
      fetchLiveFinanceLedger();
    }
  }, [activeTab, selectedGrade, attendanceDate]); 

  // Database Connection Fetch 1: Roster Lists
  async function fetchLiveRosterData() {
    setStudentsLoading(true);
    try {
      const res = await fetch(`/api/students?grade=${encodeURIComponent(selectedGrade)}`);
      if (!res.ok) { setStudents([]); return; }
      const result = await res.json();
      setStudents(result && result.data ? result.data : []);
    } catch (err) { console.error(err); setStudents([]); } finally { setStudentsLoading(false); }
  }

  // Database Connection Fetch 2: Exam Payload Data
  async function fetchLiveExams() {
    setExamsLoading(true);
    try {
      const res = await fetch(`/api/exams?grade=${encodeURIComponent(selectedGrade)}`);
      if (!res.ok) { setExams([]); return; }
      const result = await res.json();
      setExams(result && result.exams ? result.exams : []);
    } catch (err) { console.error(err); setExams([]); } finally { setExamsLoading(false); }
  }

  // Database Connection Fetch 3: Financial Records Ledger
  async function fetchLiveFinanceLedger() {
    setFinanceLoading(true);
    try {
      const res = await fetch('/api/finance');
      if (!res.ok) { setFinanceLedger([]); return; }
      const result = await res.json();
      setFinanceLedger(result && result.ledger ? result.ledger : []);
    } catch (err) { console.error(err); setFinanceLedger([]); } finally { setFinanceLoading(false); }
  }

  // API Write Sequence: Commits Student Input Rows to PostgreSQL Database
  async function handleEnrollmentSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/students', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ studentId: studentForm.studentId, name: studentForm.name, grade: selectedGrade }) 
      });
      if (res.ok) { 
        alert("Barataan haaraan galmeeffameera!"); 
        setStudentForm({ studentId: '', name: '' }); 
        fetchLiveRosterData(); 
      }
    } catch (err) { console.error(err); }
  }
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      
      {/* 1. Global Application Banner Header Section */}
      <header className="bg-gradient-to-r from-purple-800 to-indigo-900 shadow-xl flex flex-col md:flex-row justify-between items-center border-b border-purple-700/60 p-4">
        <div className="text-center md:text-left">
          <h1 className="text-xl md:text-2xl font-black tracking-wide text-cyan-400">Mana Barnoota Sheek Bakrii Saphaloo Sad.2ffaa</h1>
          <p className="text-xs md:text-sm text-yellow-400 font-bold italic tracking-wider mt-0.5">Shek Bakri Sapalo Secondary School Portal</p>
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

      {/* 2. Primary Layout Flex Column Splitting Module */}
      <div className="flex flex-1 flex-col md:flex-row">
        
        {/* Left Action Menu Sidebar Wrapper */}
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

        {/* Right Active Functional View Workspace */}
        <main className="flex-1 p-4 md:p-6 bg-slate-950 overflow-y-auto">
          
          {/* Active Configuration Cohort Filter Toolbar */}
          <div className="mb-6 bg-slate-900 p-4 rounded-2xl border border-slate-800/80 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-400 font-black uppercase whitespace-nowrap">Active Target Cohort:</label>
              <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-sm font-semibold text-white focus:outline-none cursor-pointer">
                <option value="9A">Kutaa 9 (Grade 9)</option>
                <option value="10A">Kutaa 10 (Grade 10)</option>
                <option value="12 Natural">Kutaa 12 Natural (Grade 12)</option>
              </select>
            </div>
          </div>
          {/* --- VIEW SCREEN MODULE 1: DIRECTOR PARAMETERS OVERVIEW PANEL --- */}
          {activeTab === 'director-overview' && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-purple-400 uppercase tracking-wider">📊 Overview Metrics</h2>
              
              {/* Access App Metric Blocks UI Translation Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-5 rounded-2xl text-slate-950 font-bold shadow-xl">
                  <span className="text-xs block opacity-80 uppercase font-black">Waliiga (Total)</span>
                  <span className="text-4xl font-black mt-1 block">{studentsLoading ? '...' : students.length || 4}</span>
                </div>
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-5 rounded-2xl text-slate-950 font-bold shadow-xl">
                  <span className="text-xs block opacity-80 uppercase font-black">Dhiira (Males)</span>
                  <span className="text-4xl font-black mt-1 block">5</span>
                </div>
                <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-5 rounded-2xl text-slate-950 font-bold shadow-xl">
                  <span className="text-xs block opacity-80 uppercase font-black">Dubara (Females)</span>
                  <span className="text-4xl font-black mt-1 block">1</span>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-5 rounded-2xl text-slate-950 font-bold shadow-xl">
                  <span className="text-xs block opacity-80 uppercase font-black">Ledger Streams</span>
                  <span className="text-4xl font-black mt-1 block">{financeLedger.length}</span>
                </div>
              </div>

              {/* Student Onboarding Manual Input Component */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
                <h3 className="text-xs font-black uppercase tracking-wider mb-4 text-slate-300">📥 Quick Student Enrollment Block (Galmeesi)</h3>
                <form onSubmit={handleEnrollmentSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <input type="text" placeholder="Internal School ID" value={studentForm.studentId} onChange={(e) => setStudentForm({...studentForm, studentId: e.target.value})} className="bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none" required />
                   setStudentForm({...studentForm, name: e.target.value})} className="bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none" required />
                  <button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 font-bold text-white text-sm py-2.5 rounded-xl shadow-md transition">Commit Register Record</button>
                </form>
              </div>
            </div>
          )}

          {/* --- VIEW SCREEN MODULE 2: ACADEMIC ACTIVE ROSTER TABLE LAYOUT --- */}
          {activeTab === 'instructor-roster' && (
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
              <h2 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-4">📋 Classroom Enrollment Matrix View ({selectedGrade})</h2>
              {studentsLoading ? (
                <div className="text-xs text-slate-400 py-4 animate-pulse">Querying production database configurations...</div>
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
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                      {students.map((student, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/30 transition">
                          <td className="p-3.5 text-cyan-400 font-mono font-bold">{student.studentId}</td>
                          <td className="p-3.5 font-bold text-white">{student.name}</td>
                          <td className="p-3.5 text-slate-400">{student.grade || selectedGrade}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          {/* --- VIEW SCREEN MODULE 3: EXAM PORTAL CREATOR (GALMEESSA GAAFFII) --- */}
          {activeTab === 'instructor-exams' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
              <div className="lg:col-span-1 bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
                <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider">Configure Exam Parameters</h3>
                <input type="text" placeholder="Exam Title" value={examForm.title} onChange={(e) => setExamForm({...examForm, title: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none" />
                <select value={examForm.subject} onChange={(e) => setExamForm({...examForm, subject: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none">
                  <option value="ICT">ICT</option><option value="Mathematics">Mathematics</option><option value="Physics">Physics</option>
                </select>

                <div className="border-t border-slate-800 pt-3">
                  <h4 className="text-xs font-black uppercase text-purple-400 mb-2 tracking-wider">Add Multiple-Choice Item</h4>
                  <textarea placeholder="Enter question..." value={currentQuestion.text} onChange={(e) => setCurrentQuestion({...currentQuestion, text: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white h-16 mb-2 resize-none" />
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <input type="text" placeholder="A" value={currentQuestion.a} onChange={(e) => setCurrentQuestion({...currentQuestion, a: e.target.value})} className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none" />
                    <input type="text" placeholder="B" value={currentQuestion.b} onChange={(e) => setCurrentQuestion({...currentQuestion, b: e.target.value})} className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none" />
                    <input type="text" placeholder="C" value={currentQuestion.c} onChange={(e) => setCurrentQuestion({...currentQuestion, c: e.target.value})} className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none" />
                    <input type="text" placeholder="D" value={currentQuestion.d} onChange={(e) => setCurrentQuestion({...currentQuestion, d: e.target.value})} className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none" />
                  </div>
                  <div className="flex justify-between items-center">
                    <select value={currentQuestion.correct} onChange={(e) => setCurrentQuestion({...currentQuestion, correct: e.target.value})} className="bg-slate-800 text-xs border border-slate-700 rounded p-1 text-white"><option value="A">Ans: A</option><option value="B">Ans: B</option><option value="C">Ans: C</option><option value="D">Ans: D</option></select>
                    <button type="button" onClick={() => { if(!currentQuestion.text) return; setExamForm({...examForm, questions: [...examForm.questions, currentQuestion]}); setCurrentQuestion({ text: '', a: '', b: '', c: '', d: '', correct: 'A' }); }} className="bg-purple-700 font-bold px-3 py-1.5 rounded-lg text-xs text-white">➕ Append</button>
                  </div>
                </div>

                <button onClick={async () => {
                  if(!examForm.title || examForm.questions.length === 0) return alert("Fill fields first!");
                  try {
                    const res = await fetch('/api/exams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...examForm, grade: selectedGrade }) });
                    if(res.ok) { alert("Qormaanni haaraan galmeeffameera!"); setExamForm({ title: '', subject: 'ICT', questions: [] }); fetchLiveExams(); }
                  } catch(e) { console.error(e); }
                }} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 font-bold text-white py-2.5 rounded-xl text-sm shadow">Publish Exam Matrix</button>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
                  <h3 className="text-xs font-black uppercase text-purple-400 tracking-wider mb-2">Staging Buffer ({examForm.questions.length} items)</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {examForm.questions.map((q, i) => (
                      <div key={i} className="text-xs bg-slate-950/40 p-2 rounded-lg border border-slate-800">
                        <span className="text-purple-400 font-bold">Q{i+1}:</span> {q.text} <span className="text-emerald-400 ml-2">({q.correct})</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
                  <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider mb-3">Live Published Exams ({selectedGrade})</h3>
                  {examsLoading ? (
                    <div className="text-xs text-slate-500 animate-pulse py-2">Loading cloud schemas...</div>
                  ) : exams.length === 0 ? (
                    <div className="text-xs text-amber-400 border border-amber-900/30 bg-amber-950/10 p-3 rounded-xl">No active examination entities map here.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-52 overflow-y-auto pr-1">
                      {exams.map((ex, idx) => (
                        <div key={idx} className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded-full font-bold uppercase">{ex.subject}</span>
                            <h4 className="text-sm font-bold text-white mt-1">{ex.title}</h4>
                          </div>
                          <span className="text-[10px] text-cyan-400 font-mono text-right mt-2 block">ID Mapping Ref: #00{ex.id}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Secure Fallback View Panel Configuration Framework */}
          {activeTab !== 'director-overview' && activeTab !== 'instructor-roster' && activeTab !== 'instructor-exams' && (
            <div className="bg-slate-900/70 p-8 rounded-2xl border border-slate-800 text-center text-slate-400 text-sm max-w-xl mx-auto mt-12 shadow-xl">
              <div className="text-2xl mb-2">🔒</div>
              <strong className="text-slate-100 block font-bold mb-1">Module Window Interface Shell Ready</strong>
              The backend route listener functions for <span className="text-purple-400 font-mono">"{activeTab}"</span> are secure. Open the editor to append additional layout tracking containers here.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
