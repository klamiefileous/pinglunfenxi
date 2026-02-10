
import React, { useState, useMemo } from 'react';
import { AnalysisResult } from './types';
import { GeminiService } from './services/geminiService';
import WordCloud from './components/WordCloud';
import TrendChart from './components/TrendChart';
import AIChatBot from './components/AIChatBot';

const SAMPLE_TEXT = `2024-03-01: ⭐⭐⭐⭐⭐ I absolutely love this blender! It's so quiet and powerful.
2024-03-02: ⭐⭐ Disappointed. The lid leaks every time I make a smoothie.
2024-03-05: ⭐⭐⭐⭐ Good product, but the delivery was delayed by 3 days.
2024-03-10: ⭐ The motor burned out after only 2 weeks of use. Customer service was slow.
2024-03-12: ⭐⭐⭐⭐⭐ Best purchase of the year. Easy to clean and looks great on my counter.
2024-03-15: ⭐⭐⭐ Neutral. It works but feels a bit plasticky for the price.`;

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [starFilter, setStarFilter] = useState<number | null>(null);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    try {
      const data = await GeminiService.analyzeReviews(inputText);
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredReviews = useMemo(() => {
    if (!result) return [];
    if (starFilter === null) return result.reviews;
    return result.reviews.filter(r => Math.round(r.rating) === starFilter);
  }, [result, starFilter]);

  const stats = useMemo(() => {
    if (!result) return null;
    const avgRating = result.reviews.reduce((acc, curr) => acc + curr.rating, 0) / result.reviews.length;
    const posCount = result.reviews.filter(r => r.sentiment === 'positive').length;
    return {
      avg: avgRating.toFixed(1),
      posPct: Math.round((posCount / result.reviews.length) * 100),
      total: result.reviews.length
    };
  }, [result]);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              Sentiment Hub
            </h1>
          </div>
          <button 
            onClick={() => setInputText(SAMPLE_TEXT)}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Load Sample Data
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Input Section */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Analyze Customer Voice</h2>
            <p className="text-slate-500">Paste your customer reviews or inquiries below to unlock AI insights.</p>
          </div>
          <textarea 
            className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all resize-none mb-4 font-mono text-sm"
            placeholder="Paste reviews here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing || !inputText.trim()}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyzing with Gemini...
              </>
            ) : (
              'Generate Insight Report'
            )}
          </button>
        </section>

        {result && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
                <span className="text-sm text-slate-500 font-medium mb-1">Avg. Rating</span>
                <span className="text-4xl font-black text-indigo-600">{stats?.avg}</span>
                <div className="flex gap-0.5 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-4 h-4 ${i < Number(stats?.avg) ? 'text-amber-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
                <span className="text-sm text-slate-500 font-medium mb-1">Sentiment Score</span>
                <span className="text-4xl font-black text-emerald-500">{stats?.posPct}%</span>
                <span className="text-xs text-slate-400 mt-2 uppercase tracking-tighter">Positive Sentiment Ratio</span>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
                <span className="text-sm text-slate-500 font-medium mb-1">Total Dataset</span>
                <span className="text-4xl font-black text-slate-800">{stats?.total}</span>
                <span className="text-xs text-slate-400 mt-2 uppercase tracking-tighter">Processed Reviews</span>
              </div>
            </div>

            {/* Analysis Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <TrendChart reviews={result.reviews} />
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-4">AI Trend Analysis</h3>
                  <p className="text-slate-600 leading-relaxed italic border-l-4 border-indigo-200 pl-4">
                    {result.trendAnalysis}
                  </p>
                </div>
                <div className="mt-8">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Summary</h4>
                  <p className="text-slate-700">{result.summary}</p>
                </div>
              </div>
            </div>

            {/* Keyword Visualization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <WordCloud data={result.positiveKeywords} color="#10b981" title="Top Praises" />
              <WordCloud data={result.negativeKeywords} color="#ef4444" title="Top Complaints" />
            </div>

            {/* Like/Dislike Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl">
                <h3 className="text-emerald-800 font-bold text-xl mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  What People Love
                </h3>
                <ul className="space-y-3">
                  {result.mostLiked.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-emerald-700 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-rose-50 border border-rose-100 p-8 rounded-3xl">
                <h3 className="text-rose-800 font-bold text-xl mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                  </svg>
                  Pain Points
                </h3>
                <ul className="space-y-3">
                  {result.mostDisliked.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-rose-700 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actionable Improvements */}
            <div className="bg-slate-900 text-white p-10 rounded-3xl relative overflow-hidden">
               <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                  <span className="p-2 bg-indigo-500 rounded-xl">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </span>
                  Actionable Business Plan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {result.actionableImprovements.map((item, i) => (
                    <div key={i} className="p-6 bg-slate-800 rounded-2xl border border-slate-700 hover:border-indigo-500 transition-colors">
                      <div className="text-3xl font-black text-indigo-400 mb-4 opacity-50">0{i+1}</div>
                      <p className="text-slate-200 font-medium leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
               </div>
               <div className="absolute top-0 right-0 p-20 opacity-10">
                  <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
               </div>
            </div>

            {/* Review Drill Down */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">Review Explorer</h3>
                <div className="flex items-center gap-4">
                  <label className="text-sm text-slate-500 font-medium">Filter by Stars:</label>
                  <select 
                    onChange={(e) => setStarFilter(e.target.value ? parseInt(e.target.value) : null)}
                    className="bg-white border border-slate-200 rounded-lg px-3 py-1 text-sm outline-none"
                  >
                    <option value="">All Ratings</option>
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReviews.map((r) => (
                  <div key={r.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'text-amber-400' : 'text-slate-100'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono uppercase">{r.date}</span>
                    </div>
                    <p className="text-slate-600 text-sm line-clamp-3 mb-4 italic">"{r.text}"</p>
                    <div className={`text-[10px] inline-block px-2 py-0.5 rounded-full font-bold uppercase ${
                      r.sentiment === 'positive' ? 'bg-emerald-100 text-emerald-700' :
                      r.sentiment === 'negative' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {r.sentiment}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <AIChatBot context={result} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-12 text-slate-400 text-xs font-medium uppercase tracking-widest">
        Powered by Gemini Pro Vision & Thinking Models
      </footer>
    </div>
  );
};

export default App;
