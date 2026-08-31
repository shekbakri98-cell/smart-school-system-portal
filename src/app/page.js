'use client';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [selectedGrade, setSelectedGrade] = useState('12 Natural');
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({ studentId: '', name: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchLiveRosterData(); }, [selectedGrade]);

  async function fetchLiveRosterData() {
    setLoading(true);
    try {
      const res = await fetch(`/api/students?grade=${encodeURIComponent(selectedGrade)}`);
      const result = await res.json();
      setStudents(result.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function handleEnrollmentSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/students', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
          studentId: formData.studentId,
          name: formData.name,
          grade: selectedGrade,
          subject: 'ICT'
        }) 
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setFormData({ studentId: '', name: '' });
        fetchLiveRosterData();
      } else {
        alert(data.error || "Enrollment failed.");
      }
    } catch (err) { console.error(err); }
  }

  async function handleCellUpdateSubmit(studentId, subject, fieldName, newScore) {
    try {
      await fetch('/api/roster/update-mark', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, subject, fieldName, score: Number(newScore) })
      });
      fetchLiveRosterData();
    } catch (err) { console.error(err); }
  }

  return (
    <div className="min-h-screen bg-brandNavy text-slate-100 p-6">
      <header className="max-w-6xl mx-auto mb-8 flex justify-between items-center border-b border-slate-700 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white">SHEEK BAKRI SECONDARY SCHOOL</h1>
          <p className="text-xs text-brandGold uppercase font-mono tracking-wider mt-1">Cloud Management System Terminal</p>
        </div>
        <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="bg-surfaceCard border border-slate-700 rounded p-2 text-xs text-white focus:outline-none">
          <option value="12 Natural">12 Natural</option>
          <option value="12 Social">12 Social</option>
          <option value="Kutaa 10ffaa">Kutaa 10ffaa</option>
          <option value="Kutaa 9ffaa">Kutaa 9ffaa</option>
        </select>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="bg-surfaceCard p-6 rounded-xl border border-slate-800 h-fit space-y-4">
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide border-b border-slate-700 pb-2">Galmeessi Barataa Haaraa</h2>
          <form onSubmit={handleEnrollmentSubmit} className="space-y-3 text-xs font-mono">
            <input type="text" placeholder="ID Barataa" value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} className="w-full bg-brandNavy border border-slate-800 rounded p-2 text-white outline-none" required />
            <input type="text" placeholder="Maqaa Guutuu" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-brandNavy border border-slate-800 rounded p-2 text-white outline-none" required />
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded uppercase">Kuusi Galmeessi</button>
          </form>
        </section>

        <section className="lg:col-span-2 bg-surfaceCard p-6 rounded-xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="pb-3">ID</th>
                  <th className="pb-3">Maqaa</th>
                  <th className="pb-3 text-center">Test 1 (10)</th>
                  <th className="pb-3 text-center">Test 2 (10)</th>
                  <th className="pb-3 text-center">Assign (20)</th>
                  <th className="pb-3 text-center">Final (60)</th>
                  <th className="pb-3 text-right">Waliigala</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {loading && <tr><td colSpan="7" className="text-center p-4">Loading cloud metrics database nodes...</td></tr>}
                {!loading && students.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="py-3 font-mono text-brandGold font-bold">{s.studentId}</td>
                    <td className="py-3 font-semibold text-slate-200">{s.name}</td>
                    <td className="p-1 text-center"><input type="number" defaultValue={s.test1} onBlur={e => handleCellUpdateSubmit(s.studentId, s.subject || 'ICT', 'test1', e.target.value)} className="w-10 bg-brandNavy text-center border border-slate-800 rounded" /></td>
                    <td className="p-1 text-center"><input type="number" defaultValue={s.test2} onBlur={e => handleCellUpdateSubmit(s.studentId, s.subject || 'ICT', 'test2', e.target.value)} className="w-10 bg-brandNavy text-center border border-slate-800 rounded" /></td>
                    <td className="p-1 text-center"><input type="number" defaultValue={s.assignment} onBlur={e => handleCellUpdateSubmit(s.studentId, s.subject || 'ICT', 'assignment', e.target.value)} className="w-10 bg-brandNavy text-center border border-slate-800 rounded" /></td>
                    <td className="p-1 text-center"><input type="number" defaultValue={s.finalExam} onBlur={e => handleCellUpdateSubmit(s.studentId, s.subject || 'ICT', 'finalExam', e.target.value)} className="w-10 bg-brandNavy text-center border border-slate-800 rounded" /></td>
                    <td className="py-3 text-right font-black text-emerald-400">{s.totalScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
