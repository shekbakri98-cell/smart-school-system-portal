'use client';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [currentRoleView, setCurrentRoleView] = useState('Director'); 
  const [activeTab, setActiveTab] = useState('director-overview'); 
  const [userRole, setUserRole] = useState('Admin'); 
  const [username, setUsername] = useState('Admin User');
  const [systemSettings, setSystemSettings] = useState({ academicYear: '2019', semester: 'Kurmaana 1ffaa', maintenanceMode: false, allowStudentLogin: true });
  const [activeProfile] = useState({ fullName: 'Sheek Bakri', email: 'admin@school.edu', phone: '+251 emergency services 000 000', address: 'Saphaloo, Ciroo' });
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
                <button key={role} onClick={() => { setCurrentRoleView(role); setActiveTab(role === 'Director' ? 'director-overview' : role === 'Instructor' ? 'instructor-roster' : 'student-exams'); }} className={`px-2 py-1 text-xs rounded border ${currentRoleView === role ? 'bg-sky-600 text-white' : 'bg-slate-900 text-slate-400'}`}>{role}</button>
              ))}
            </div>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs">
            <label className="block text-slate-400 mb-1">Grade Context</label>
            <select value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)} className="w-full bg-slate-900 border p-2 text-slate-200 rounded">
              <option value="12 Natural">Grade 12 Natural Science</option>
              <option value="12 Social">Grade 12 Social Science</option>
            </select>
          </div>
        </aside>
        <main className="md:col-span-3 bg-slate-950 p-6 rounded-xl border border-slate-800">
          {currentRoleView === 'Director' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Director Console Framework</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-900 p-4 rounded border border-slate-800">
                  <p className="text-xs text-slate-400">Total Records</p>
                  <p className="text-2xl font-bold text-sky-400">{studentsLoading ? '...' : students.length}</p>
                </div>
                <div className="bg-slate-900 p-4 rounded border border-slate-800">
                  <p className="text-xs text-slate-400">Collections (ETB)</p>
                  <p className="text-2xl font-bold text-emerald-400">{financeLoading ? '...' : financeLedger.reduce((sum, item) => sum + (item.amount_paid || 0), 0)}</p>
                </div>
              </div>
            </div>
          )}
          {currentRoleView === 'Instructor' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Instructor Roster Configuration</h2>
              <form onSubmit={handleEnrollmentSubmit} className="grid grid-cols-3 gap-2">
                <input type="text" placeholder="ID (SMS/004)" value={studentForm.studentId} onChange={e => setStudentForm({...studentForm, studentId: e.target.value})} className="bg-slate-900 border p-2 text-xs rounded" required />
                <input type="text" placeholder="Full Name" value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} className="bg-slate-900 border p-2 text-xs rounded" required />
                <button type="submit" className="bg-sky-600 text-white font-bold text-xs rounded">Commit Student</button>
              </form>
              <table className="w-full text-left font-mono text-xs border border-slate-800">
                <thead className="bg-slate-900 text-slate-400"><tr><th className="p-2">ID</th><th className="p-2">Name</th><th className="p-2">Total Score</th></tr></thead>
                <tbody>
                  {students.map((s, idx) => <tr key={idx} className="border-t border-slate-800"><td className="p-2 text-sky-400">{s.studentId}</td><td className="p-2">{s.name}</td><td className="p-2 text-emerald-400 font-bold">{s.test1 + s.test2 + s.assignment + s.finalExam}</td></tr>)}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}