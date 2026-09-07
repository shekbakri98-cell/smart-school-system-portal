'use client';

export default function BulkExamUpload() {
  return (
    <div className="p-4 bg-slate-700 rounded border border-slate-600">
      <h3 className="font-bold text-sm text-purple-400 mb-2">📥 Bulk Excel / CSV Upload Engine</h3>
      <p className="text-xs text-slate-300">Spreadsheet upload processing pipeline active.</p>
      <input type="file" accept=".csv, .xlsx" className="mt-2 text-xs text-slate-400" />
    </div>
  );
}
