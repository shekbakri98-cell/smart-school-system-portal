'use client';

import { useState } from 'react';

export default function BulkExamUpload({ onUploadSuccess, selectedGrade }) {
  const [csvFile, setCsvFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
      setErrorMessage('');
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      setErrorMessage('Please select a valid CSV file first.');
      return;
    }

    setUploading(true);
    setErrorMessage('');

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n');
        const parsedQuestions = [];

        // Skip headers: question_text,option_a,option_b,option_c,option_d,correct_answer
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Simple CSV line splitter (handles basic comma separations)
          const columns = line.split(',');
          if (columns.length >= 6) {
            parsedQuestions.push({
              text: columns[0].trim(),
              a: columns[1].trim(),
              b: columns[2].trim(),
              c: columns[3].trim(),
              d: columns[4].trim(),
              correct: columns[5].trim().toUpperCase()
            });
          }
        }

        if (parsedQuestions.length === 0) {
          throw new Error('No valid questions parsed from the CSV file structure.');
        }

        const res = await fetch('/api/exams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `Bulk Upload - ${new Date().toLocaleDateString()}`,
            gradeSection: selectedGrade,
            subject: 'ICT',
            questions: parsedQuestions
          })
        });

        if (res.ok) {
          alert('Bulk exam structure deployed successfully!');
          setCsvFile(null);
          if (onUploadSuccess) onUploadSuccess();
        } else {
          const data = await res.json();
          throw new Error(data.error || 'Failed to submit exam structure to backend.');
        }
      } catch (err) {
        console.error(err);
        setErrorMessage(err.message || 'Error parsing file.');
      } finally {
        setUploading(false);
      }
    };

    reader.readAsText(csvFile);
  };

  return (
    <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-6 shadow-xl text-white">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-purple-400">📥 Bulk CSV Processing Protocol</h3>
        <p className="text-xs text-slate-400 mt-1">
          Upload a structured format file matching the schema sequence criteria.
        </p>
      </div>

      <div className="bg-[#141b2d] border border-slate-800 rounded p-3 mb-4 text-[11px] font-mono text-slate-300">
        <span className="text-purple-400 font-bold block mb-1">Required Headers:</span>
        question_text, option_a, option_b, option_c, option_d, correct_answer
      </div>

      <form onSubmit={handleBulkSubmit} className="space-y-4">
        <div>
          <label className="block text-xs uppercase font-bold text-slate-400 mb-2">
            Select Spreadsheet Source (.csv)
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="w-full bg-[#141b2d] border border-slate-800 rounded p-2 text-xs text-slate-300 outline-none file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
          />
        </div>

        {errorMessage && (
          <div className="bg-red-950/50 border border-red-800 text-red-200 text-xs p-2.5 rounded">
            ⚠️ {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={uploading}
          className={`w-full py-2 px-4 rounded text-xs font-bold uppercase transition-all ${
            uploading
              ? 'bg-purple-800 text-slate-400 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700 shadow-md'
          }`}
        >
          {uploading ? 'Processing Architecture...' : 'Initialize Bulk Upload Pipeline 🚀'}
        </button>
      </form>
    </div>
  );
}
