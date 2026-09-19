'use client';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [currentRoleView, setCurrentRoleView] = useState('Director'); 
  const [activeTab, setActiveTab] = useState('director-overview'); 
  const [userRole, setUserRole] = useState('Admin'); 
  const [username, setUsername] = useState('Admin User');
  
  const [systemSettings, setSystemSettings] = useState({ 
    academicYear: '2019', 
    semester: 'Kurmaana 1ffaa', 
    maintenanceMode: false, 
    allowStudentLogin: true 
  });
  
  const [activeProfile] = useState({ 
    fullName: 'Sheek Bakri', 
    email: 'admin@school.edu', 
    phone: '+251 emergency services 000 000', 
    address: 'Saphaloo, Ciroo' 
  });
  
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
  
  const [activeQuizExam, setActiveQuizExam] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [studentAnswers, setStudentAnswers] = useState({});
  
  const [financeLedger, setFinanceLedger] = useState([]);
  const [financeLoading, setFinanceLoading] = useState(false);
  const [financeForm, setFinanceForm] = useState({ studentId: '', feeType: 'Tuition Q1', amountDue: '', amountPaid: '' });
  
  const [books] = useState([{ title: 'Grade 12 Information Technology', author: 'Ministry of Education', grade_section: '12 Natural', download_url: '#' }]);
  const [appNotification, setAppNotification] = useState(null);
  useEffect(() => {
    if (activeTab === 'instructor-roster' || activeTab === 'instructor-attendance') fetchLiveRosterData();
    if (activeTab === 'instructor-attendance') fetchLiveAttendanceRecords();
    if (activeTab === 'student-exams') fetchLiveExams();
    if (activeTab === 'director-finance' || activeTab === 'director-overview') fetchLiveFinanceLedger();
  }, [selectedGrade, activeTab, attendanceDate, currentRoleView]);

  const triggerPopupNotification = (title, msg) => {
    setAppNotification({ title, message: msg });
    setTimeout(() => setAppNotification(null), 5000);
  };

  async function fetchLiveRosterData() {
    setStudentsLoading(true);
    try {
      const res = await fetch(`/api/students?grade=${encodeURIComponent(selectedGrade)}`);
      const result = await res.json();
      if (result.success && result.data) setStudents(result.data);
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
      if (result.exams) setExams(result.exams);
    } catch (err) { console.error(err); } finally { setExamsLoading(false); }
  }

  async function fetchLiveFinanceLedger() {
    setFinanceLoading(true);
    try {
      const res = await fetch('/api/finance');
      const result = await res.json();
      if (result.ledger) setFinanceLedger(result.ledger);
    } catch (err) { console.error(err); } finally { setFinanceLoading(false); }
  }
  async function handleEnrollmentSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId: studentForm.studentId, name: studentForm.name, grade: selectedGrade }) });
      if ((await res.json()).success) { triggerPopupNotification("REGISTERED", "Student saved."); setStudentForm({ studentId: '', name: '' }); fetchLiveRosterData(); }
    } catch (err) { console.error(err); }
  }

  async function handlePostAttendance(studentId, targetStatus) {
    try {
      const res = await fetch('/api/attendance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId, date: attendanceDate, status: targetStatus }) });
      if ((await res.json()).success) { triggerPopupNotification("ATTENDANCE", "Status updated."); fetchLiveAttendanceRecords(); }
    } catch (err) { console.error(err); }
  }

  async function handlePostFinanceRecord(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/finance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(financeForm) });
      if ((await res.json()).success) { triggerPopupNotification("FINANCE", "Ledger updated."); setFinanceForm({ studentId: '', feeType: 'Tuition Q1', amountDue: '', amountPaid: '' }); fetchLiveFinanceLedger(); }
    } catch (err) { console.error(err); }
  }

  const getAttendanceStatus = (studentId) => {
    const record = attendanceRecords.find(r => r.studentId === studentId);
    return record ? record.status : 'Unmarked';
  };
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-6">
      {appNotification && <div className="bg-emerald-600 p-3 mb-4 rounded text-white font-bold">🔔 {appNotification.title}: {appNotification.message}</div>}
      <header className="border-b border-slate-800 pb-4 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Sheek Bakri Portal Terminal v2.1</h1>
          <p className="text-xs text-slate-400 font-mono">Academic Year: {systemSettings.academicYear} | {systemSettings.semester}</p>
        </div>
        <div className="text-right text-xs font-mono">Logged: {username} ({userRole})</div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="space-y-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h2 className="text-xs uppercase font-bold tracking-widest text-slate-400 mb-2">Perspective</h2>
            <div className="grid grid-cols-2 gap-2">
              {['Director', 'Instructor', 'Student'].map(role => (
                <button key={role} type="button" onClick={() => { setCurrentRoleView(role); setActiveTab(role === 'Director' ? 'director-overview' : role === 'Instructor' ? 'instructor-roster' : 'student-exams'); }} className={`px-2 py-1 text-xs rounded border ${currentRoleView === role ? 'bg-sky-600 text-white' : 'bg-slate-900 text-slate-400'}`}>{role}</button>
              ))}
            </div>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs">
            <label className="block text-slate-400 mb-1">Grade Context</label>
            <select value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)} className="w-full bg-slate-900 border border-slate-800 p-2 text-slate-200 rounded">
              <option value="12 Natural">Grade 12 Natural Science</option>
              <option value="12 Social">Grade 12 Social Science</option>
            </select>
          </div>
        </aside>
        <main className="md:col-span-3 bg-slate-950 p-6 rounded-xl border border-slate-800">
          {currentRoleView === 'Director' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold">Director Console Framework</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 p-4 rounded border border-slate-800">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Total Scholars</p>
                  <p className="text-2xl font-black text-sky-400 mt-1">{studentsLoading ? "..." : students.length}</p>
                </div>
                <div className="bg-slate-900 p-4 rounded border border-slate-800">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Vault Registry</p>
                  <p className="text-2xl font-black text-emerald-400 mt-1">ETB {financeLoading ? "..." : financeLedger.reduce((acc, curr) => acc + (curr.amount_paid || 0), 0)}</p>
                </div>
                <div className="bg-slate-900 p-4 rounded border border-slate-800">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Active Exams</p>
                  <p className="text-2xl font-black text-purple-400 mt-1">{examsLoading ? "..." : exams.length}</p>
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 mt-4">
                <h3 className="text-sm font-bold uppercase mb-3 text-slate-300">Log Cashflow Liability Statement</h3>
                <form onSubmit={handlePostFinanceRecord} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Student Ref ID</label>
                    <input type="text" placeholder="SMS/001" value={financeForm.studentId} onChange={e => setFinanceForm({...financeForm, studentId: e.target.value})} className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-white" required />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Liability Due (ETB)</label>
                    <input type="number" placeholder="3500" value={financeForm.amountDue} onChange={e => setFinanceForm({...financeForm, amountDue: e.target.value})} className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-white" required />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Liability Cleared (ETB)</label>
                    <input type="number" placeholder="3500" value={financeForm.amountPaid} onChange={e => setFinanceForm({...financeForm, amountPaid: e.target.value})} className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-white" required />
                  </div>
                  <button type="submit" className="w-full bg-emerald-600 text-white font-bold p-2 rounded uppercase tracking-wide">Record Vault Log</button>
                </form>
              </div>
            </div>
          )}

          {currentRoleView === 'Instructor' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold">Instructor Assessment Grid</h2>
              <div className="flex space-x-4 border-b border-slate-800 pb-2 mb-4 text-xs font-mono">
                <button type="button" onClick={() => setActiveTab('instructor-roster')} className={`pb-2 px-1 ${activeTab === 'instructor-roster' ? 'border-b-2 border-sky-500 text-sky-400 font-bold' : 'text-slate-400'}`}>Roster Matrix</button>
                <button type="button" onClick={() => setActiveTab('instructor-attendance')} className={`pb-2 px-1 ${activeTab === 'instructor-attendance' ? 'border-b-2 border-sky-500 text-sky-400 font-bold' : 'text-slate-400'}`}>Attendance Logger</button>
              </div>

              {activeTab === 'instructor-roster' && (
                <div className="space-y-4">
                  <form onSubmit={handleEnrollmentSubmit} className="bg-slate-900 p-4 rounded-xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 items-end text-xs">
                    <input type="text" placeholder="Student ID (e.g. SMS/001)" value={studentForm.studentId} onChange={e => setStudentForm({...studentForm, studentId: e.target.value})} className="bg-slate-950 border border-slate-800 p-2 rounded text-white" required />
                    <input type="text" placeholder="Full Academic Name" value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} className="bg-slate-950 border border-slate-800 p-2 rounded text-white" required />
                    <button type="submit" className="bg-sky-600 text-white font-bold p-2 rounded uppercase">Commit Enrollment</button>
                  </form>
                  <div className="overflow-x-auto rounded-lg border border-slate-800">
                    <table className="w-full text-left font-mono text-xs">
                      <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                        <tr><th className="p-3">Ref ID</th><th className="p-3">Scholar Name</th><th className="p-3">Section Filter</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {students.map((st, i) => (
                          <tr key={i} className="hover:bg-slate-900/50">
                            <td className="p-3 text-sky-400">{st.studentId}</td>
                            <td className="p-3 font-semibold">{st.name}</td>
                            <td className="p-3 text-slate-400">{st.grade}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'instructor-attendance' && (
                <div className="space-y-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
                    <h3 className="text-sm font-bold text-slate-300">Commit Daily Checkmarks</h3>
                    <input type="date" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} className="bg-slate-950 border border-slate-800 p-1 text-xs rounded text-white font-mono" />
                  </div>
                  <div className="divide-y divide-slate-800">
                    {students.map((st, idx) => {
                      const currentStatus = getAttendanceStatus(st.studentId);
                      return (
                        <div key={idx} className="py-3 flex justify-between items-center text-xs font-mono">
                          <div>
                            <p className="font-bold text-slate-200">{st.name}</p>
                            <span className={`text-[10px] uppercase font-bold px-1.5 rounded ${currentStatus === 'Present' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>{currentStatus}</span>
                          </div>
                          <div className="flex space-x-2">
                            <button type="button" onClick={() => handlePostAttendance(st.studentId, 'Present')} className="bg-emerald-600 text-white font-bold p-1 rounded text-[10px] uppercase">Present</button>
                            <button type="button" onClick={() => handlePostAttendance(st.studentId, 'Absent')} className="bg-rose-600 text-white font-bold p-1 rounded text-[10px] uppercase">Absent</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentRoleView === 'Student' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Scholar Terminal Interface</h2>
              {exams.map((ex, i) => (
                <div key={i} className="p-4 border border-slate-800 bg-slate-900 rounded-xl flex justify-between items-center font-mono text-xs">
                  <div>
                    <h4 className="font-bold text-slate-200">{ex.title}</h4>
                    <p className="text-slate-400 mt-0.5">Subject Designation Matrix: {ex.subject}</p>
                  </div>
                  <button type="button" onClick={() => { setActiveQuizExam(ex); setQuizQuestions(ex.questions || []); }} className="bg-purple-600 text-white font-bold px-3 py-1 rounded uppercase">Mount Exam Terminal</button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
