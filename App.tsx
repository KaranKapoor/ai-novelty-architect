import React, { useState, useRef } from 'react';
import { generateIdeasFromKeywords, generateClaymationImage } from './services/geminiService';
import { DEFAULT_USER_PROFILE, Idea } from './types';
import { IdeaCard } from './components/IdeaCard';

const App: React.FC = () => {
  const [keywords, setKeywords] = useState('');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Progress state
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startProgressSimulation = () => {
    setProgress(0);
    setProgressStatus("Initializing architect agent...");
    
    // Define steps for status updates based on progress percentage
    const steps = [
      { threshold: 10, text: "Analyzing domain context and user profile..." },
      { threshold: 30, text: "Searching prior art and patents..." },
      { threshold: 50, text: "Synthesizing novel architectural patterns..." },
      { threshold: 70, text: "Drafting detailed invention claims..." },
      { threshold: 85, text: "Designing claymation visual specifications..." },
    ];

    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        // Slow down as we approach 95%
        const increment = Math.max(0.5, (95 - prev) / 50); 
        const next = prev + increment;
        const capped = next > 95 ? 95 : next;

        // Find the most appropriate status message
        // We want the highest threshold that is less than or equal to current progress
        const currentStep = [...steps].reverse().find(s => capped >= s.threshold);
        if (currentStep) {
          setProgressStatus(currentStep.text);
        }

        return capped;
      });
    }, 100);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keywords.trim()) return;

    setLoading(true);
    setError(null);
    setIdeas([]);
    startProgressSimulation();

    try {
      // 1. Generate Text Ideas first
      const generatedIdeas = await generateIdeasFromKeywords(keywords, DEFAULT_USER_PROFILE);
      
      // Complete the progress bar
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setProgress(100);
      setProgressStatus("Finalizing visualization protocols...");

      // Short delay to show completion state before rendering results
      await new Promise(resolve => setTimeout(resolve, 800));

      setIdeas(generatedIdeas);
      setLoading(false);

      // 2. Generate Images in parallel for all ideas
      generatedIdeas.forEach(async (idea) => {
        try {
          const imageUrl = await generateClaymationImage(idea.visualPrompt);
          setIdeas((prevIdeas) =>
            prevIdeas.map((prevIdea) =>
              prevIdea.id === idea.id
                ? { ...prevIdea, imageUrl: imageUrl || undefined, loadingImage: false }
                : prevIdea
            )
          );
        } catch (imgErr) {
          console.error(`Failed to generate image for idea ${idea.id}`, imgErr);
          setIdeas((prevIdeas) =>
            prevIdeas.map((prevIdea) =>
              prevIdea.id === idea.id
                ? { ...prevIdea, loadingImage: false }
                : prevIdea
            )
          );
        }
      });

    } catch (err: any) {
      console.error(err);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setError(err.message || "An unexpected error occurred while generating ideas.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 text-white pt-16 pb-24 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Novelty<span className="text-blue-400">Architect</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-slate-300 font-light">
            Generate patent-worthy invention ideas grounded in enterprise architecture and licensing, visualized in clay.
          </p>
        </div>
      </header>

      {/* Main Content / Input Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 mb-12">
          <form onSubmit={handleGenerate} className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <label htmlFor="keywords" className="sr-only">Keywords</label>
              <input
                id="keywords"
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Enter keywords (e.g., 'distributed ledger for license enforcement', 'AI semantic caching')..."
                className="w-full px-6 py-4 text-lg bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800 placeholder-slate-400"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !keywords.trim()}
              className={`px-8 py-4 rounded-xl text-lg font-bold shadow-lg transition-all flex items-center justify-center whitespace-nowrap
                ${loading || !keywords.trim()
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/25 active:scale-95'
                }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Architecting...
                </>
              ) : (
                'Generate Ideas'
              )}
            </button>
          </form>

          {/* Progress Bar */}
          {loading && (
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-blue-700">{progressStatus}</span>
                <span className="text-sm font-medium text-slate-500">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
              {error}
            </div>
          )}
          
          {!loading && (
            <p className="mt-4 text-sm text-slate-500 text-center">
              Leverages Google Search grounding for prior art research and Gemini 2.5 Flash for high-speed visuals.
            </p>
          )}
        </div>

        {/* Results Grid */}
        {ideas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ideas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        )}
        
        {/* Empty State / Initial Loading Guide */}
        {!loading && ideas.length === 0 && !error && (
          <div className="text-center py-20 opacity-60">
            <div className="inline-block p-4 rounded-full bg-slate-100 mb-4">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-slate-700 mb-2">Ready to Innovate?</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Enter your domain keywords above to generate novel ideas complete with visual prototypes and patent claims.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;