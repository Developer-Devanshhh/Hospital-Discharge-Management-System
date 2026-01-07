"use client";

import { useState } from 'react';
import { Upload, FileText, AlertTriangle, Calendar, Volume2, CheckCircle2, Copy, Download, ShieldCheck, Activity } from 'lucide-react';
import MetricCard from '@/components/discharge/MetricCard';
import ActionTimeline from '@/components/discharge/ActionTimeline';

export default function DischargePage() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setText("");
    }
  };

  // Submit Handler
  const handleSubmit = async () => {
    if (!file && !text) {
      setError("Please provide a file or text.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    if (file) {
      formData.append("file", file);
    } else {
      formData.append("text", text);
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch("/api/discharge/simplify", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process discharge instructions.");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Text-to-Speech Handler
  const handleReadAloud = async () => {
    if (!result || !result.simplified_summary) return;

    if (speaking && audioUrl) {
      const audio = document.getElementById('tts-audio') as HTMLAudioElement;
      if (audio) {
        audio.pause();
        setSpeaking(false);
      }
      return;
    }

    setSpeaking(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          text: result.simplified_summary,
          language_code: "en-IN" // Default to Indian English context
        }),
      });

      if (!response.ok) throw new Error("TTS failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      const audio = new Audio(url);
      audio.id = 'tts-audio';
      audio.onended = () => setSpeaking(false);
      audio.play();
    } catch (err) {
      console.error("TTS Error:", err);
      setSpeaking(false);
    }
  };

  // Download ICS
  const handleDownloadCalendar = () => {
    if (!result?.ics_content) return;

    const blob = new Blob([result.ics_content], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'recovery_schedule.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] font-sans text-stone-800 pb-20">

      {/* Hero Header */}
      <div className="bg-[#f0f9f9] border-b border-teal-100 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-teal-950 tracking-tight">
            Simplify Your Hospital Discharge
          </h1>
          <p className="text-lg md:text-xl text-teal-800/80 max-w-2xl mx-auto leading-relaxed">
            Understand your care plan instantly. We translate complex medical jargon into clear, actionable steps for a safer recovery.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-8">
        {/* Input Section */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-teal-50">
          <div className="space-y-6">

            {/* File Upload Zone */}
            <label className={`
              border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer block group
              ${file ? 'border-teal-500 bg-teal-50' : 'border-stone-300 hover:border-teal-400 hover:bg-stone-50'}
            `}>
              <input type="file" accept=".pdf,.txt,.docx" onChange={handleFileUpload} className="hidden" />
              <div className="flex flex-col items-center gap-4">
                <div className={`p-4 rounded-full ${file ? 'bg-teal-100 text-teal-600' : 'bg-stone-100 text-stone-400 group-hover:text-teal-500 transition-colors'}`}>
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-stone-700">
                    {file ? file.name : "Upload Discharge Summary PDF"}
                  </p>
                  {!file && <p className="text-stone-500 mt-1">or drag and drop your file here</p>}
                </div>
              </div>
            </label>

            {/* Manual Text Option */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-sm text-gray-500 uppercase tracking-widest">Or paste text</span>
              </div>
            </div>

            <textarea
              className="w-full border border-stone-200 rounded-xl p-4 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder:text-stone-400 text-base"
              rows={3}
              placeholder="Paste the text from your discharge papers here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={!!file}
            ></textarea>

            {/* Action Button */}
            <button
              onClick={handleSubmit}
              disabled={loading || (!file && !text)}
              className={`
                w-full py-4 rounded-xl font-bold text-lg shadow-md transition-all flex items-center justify-center gap-3
                ${loading || (!file && !text)
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : 'bg-teal-600 text-white hover:bg-teal-700 hover:shadow-lg hover:-translate-y-0.5'}
              `}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                  Analyzing & Simplifying...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Generate My Recovery Plan
                </>
              )}
            </button>

            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 border border-red-100 animate-in slide-in-from-top-2">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Blockchain Badge */}
            <div className="flex justify-center items-center gap-2 text-xs text-stone-400 pt-2">
              <ShieldCheck className="w-3 h-3" />
              <span>Secured & Audited via Blockchain</span>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="mt-12 space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">

            {/* 1. Evaluation Cards */}
            {result.evaluation && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                  label="Readability"
                  value={result.evaluation.readability_score?.toFixed(1) || "N/A"}
                  subtext="Grade Level"
                  color="blue"
                  icon={<FileText className="w-4 h-4" />}
                />
                <MetricCard
                  label="Safety Check"
                  value={result.evaluation.safety_warnings_present ? "Pass" : "Review"}
                  subtext="Warnings Found"
                  color={result.evaluation.safety_warnings_present ? "green" : "amber"}
                  icon={<ShieldCheck className="w-4 h-4" />}
                />
                <MetricCard
                  label="Completeness"
                  value={Object.values(result.evaluation.completeness).filter(Boolean).length}
                  subtext="Checks Passed"
                  color="stone"
                  icon={<CheckCircle2 className="w-4 h-4" />}
                />
                <MetricCard
                  label="Blockchain"
                  value="Verified"
                  subtext="Audit Logged"
                  color="amber" // Gold for premium/blockchain
                  icon={<Activity className="w-4 h-4" />}
                />
              </div>
            )}

            {/* 2. Critical Alerts */}
            {result.danger_signs && result.danger_signs.length > 0 && (
              <div className="bg-red-50 border-l-4 border-red-500 p-6 md:p-8 rounded-r-xl shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-full text-red-500 shadow-sm shrink-0">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-red-900 mb-2">Warning Signs</h3>
                    <p className="text-red-800 mb-4 font-medium">If you experience any of these symptoms, call your doctor or 911 immediately:</p>
                    <div className="grid md:grid-cols-2 gap-3">
                      {result.danger_signs.map((sign: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 bg-white/60 p-2 rounded text-red-900 font-semibold border border-red-100">
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          {sign}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Simplified Summary with Voice */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif font-bold text-stone-900">Summary</h2>
                <button
                  onClick={handleReadAloud}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${speaking ? 'bg-teal-100 text-teal-700 animate-pulse' : 'bg-stone-100 text-stone-600 hover:bg-teal-50 hover:text-teal-600'}`}
                >
                  <Volume2 className="w-4 h-4" />
                  {speaking ? "Listening..." : "Read Aloud"}
                </button>
              </div>
              <div className="prose prose-lg text-stone-700 leading-relaxed font-normal">
                {result.simplified_summary}
              </div>
            </div>

            {/* 4. Action Plan Timeline */}
            <div className="bg-[#fffefe] p-8 rounded-2xl shadow-sm border border-stone-200">
              <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2bg-teal-100 rounded-lg text-teal-700">
                    <Calendar className="w-8 h-8 text-teal-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-stone-900">Recovery Action Plan</h2>
                    <p className="text-stone-500">Your day-by-day guide to recovery</p>
                  </div>
                </div>

                {result.ics_content && (
                  <button
                    onClick={handleDownloadCalendar}
                    className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-5 py-3 rounded-xl transition-all shadow-md active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    Add to Calendar
                  </button>
                )}
              </div>

              <ActionTimeline plan={result.action_plan || []} />
            </div>

            {/* 5. Additional Info Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Lifestyle Changes */}
              {result.lifestyle_changes && (
                <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
                  <h3 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    Healthy Habits
                  </h3>
                  <div className="text-emerald-800/90 leading-relaxed">
                    {Array.isArray(result.lifestyle_changes) ? (
                      <ul className="space-y-2">
                        {result.lifestyle_changes.map((item: string, i: number) => (
                          <li key={i} className="flex gap-2">
                            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : <p>{result.lifestyle_changes}</p>}
                  </div>
                </div>
              )}

              {/* Restrictions */}
              {result.activity_restrictions && (
                <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
                  <h3 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    Important Restrictions
                  </h3>
                  <div className="text-amber-800/90 leading-relaxed">
                    {Array.isArray(result.activity_restrictions) ? (
                      <ul className="space-y-2">
                        {result.activity_restrictions.map((item: string, i: number) => (
                          <li key={i} className="flex gap-2">
                            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : <p>{result.activity_restrictions}</p>}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
