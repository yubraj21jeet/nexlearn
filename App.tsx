import React, { useState, useEffect } from 'react';
import { StudySession, StudyTopic } from './types';
import { generateSyllabus, generateTopicContent } from './services/geminiService';
import Flashcard from './components/Flashcard';
import ResourceCard from './components/ResourceCard';
import QuizModule from './components/QuizModule';
import { 
  BrainCircuit, 
  Sparkles, 
  Library, 
  Layers, 
  CheckSquare, 
  ArrowRight,
  BookOpenCheck,
  Loader2
} from 'lucide-react';

const App: React.FC = () => {
  const [topicInput, setTopicInput] = useState('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [session, setSession] = useState<StudySession | null>(null);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [loadingTopicId, setLoadingTopicId] = useState<string | null>(null);

  // Generate the initial syllabus
  const handleStart = async () => {
    if (!topicInput.trim()) return;
    
    setIsGeneratingPlan(true);
    try {
      const syllabus = await generateSyllabus(topicInput);
      
      const newPlan: StudyTopic[] = syllabus.map((item, index) => ({
        id: `topic-${index}`,
        title: item.title,
        description: item.description,
        resources: [],
        flashcards: [],
        quiz: [],
        prerequisites: "",
        keyConcepts: "",
        practiceIdeas: "",
        isLoaded: false
      }));

      const newSession: StudySession = {
        id: crypto.randomUUID(),
        userId: 'student_01',
        topic: topicInput,
        createdAt: Date.now(),
        plan: newPlan
      };

      setSession(newSession);
      if (newPlan.length > 0) {
        // Automatically fetch the first topic
        handleLoadTopic(newSession, newPlan[0].id);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to generate study plan. Please try again.");
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Load content for a specific topic (Lazy loading for agents)
  const handleLoadTopic = async (currentSession: StudySession, topicId: string) => {
    const topicIndex = currentSession.plan.findIndex(t => t.id === topicId);
    if (topicIndex === -1) return;

    const topic = currentSession.plan[topicIndex];
    setActiveTopicId(topicId);

    // If already loaded, don't refetch
    if (topic.isLoaded) return;

    setLoadingTopicId(topicId);
    
    try {
      const content = await generateTopicContent(topic.title, currentSession.topic);
      
      setSession(prev => {
        if (!prev) return null;
        const newPlan = [...prev.plan];
        newPlan[topicIndex] = { ...newPlan[topicIndex], ...content, isLoaded: true };
        return { ...prev, plan: newPlan };
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTopicId(null);
    }
  };

  const activeTopic = session?.plan.find(t => t.id === activeTopicId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-tr from-cyan-600 to-indigo-600 rounded-lg">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
              NexLearn
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-400 font-mono ml-2">
              v1.0
            </span>
          </div>
          {session && (
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span className="hidden sm:inline">User: <span className="text-slate-200">student_01</span></span>
              <div className="h-4 w-px bg-slate-700"></div>
              <span>Session ID: <span className="font-mono text-xs">{session.id.slice(0, 8)}...</span></span>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Landing / Input View */}
        {!session ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
                Master any subject <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
                  in seconds.
                </span>
              </h1>
              <p className="text-lg text-slate-400 max-w-xl mx-auto">
                AI Agents that research, create flashcards, and build quizzes for you. Stop searching, start learning.
              </p>
            </div>

            <div className="w-full max-w-md relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-indigo-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex bg-slate-900 rounded-lg p-1 ring-1 ring-slate-700 shadow-2xl">
                <input 
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                  placeholder="What do you want to learn? (e.g., AI Agents, Physics)"
                  className="flex-1 bg-transparent border-none focus:ring-0 text-slate-100 placeholder-slate-500 px-4 py-3"
                  disabled={isGeneratingPlan}
                />
                <button 
                  onClick={handleStart}
                  disabled={isGeneratingPlan || !topicInput.trim()}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingPlan ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Generate
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left w-full pt-8">
              {[
                { icon: Layers, title: "Curated Plan", desc: "Structured daily goals" },
                { icon: Library, title: "Smart Resources", desc: "Verified links & notes" },
                { icon: CheckSquare, title: "Active Recall", desc: "Quizzes & flashcards" }
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                  <item.icon className="w-6 h-6 text-cyan-500 mb-2" />
                  <h3 className="font-semibold text-slate-200">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Main Dashboard */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-8rem)]">
            
            {/* Sidebar / Syllabus */}
            <aside className="lg:col-span-3 lg:border-r border-slate-800 pr-0 lg:pr-6 overflow-y-auto">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Study Plan</h2>
              <div className="space-y-2">
                {session.plan.map((topic, idx) => (
                  <button
                    key={topic.id}
                    onClick={() => handleLoadTopic(session, topic.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all relative overflow-hidden group ${
                      activeTopicId === topic.id 
                        ? 'bg-slate-800 border-indigo-500 shadow-md shadow-indigo-900/10' 
                        : 'bg-transparent border-transparent hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between relative z-10">
                      <div>
                        <span className={`text-xs font-mono mb-1 block ${activeTopicId === topic.id ? 'text-indigo-400' : 'text-slate-500'}`}>
                          Module 0{idx + 1}
                        </span>
                        <h3 className={`font-medium ${activeTopicId === topic.id ? 'text-slate-100' : 'text-slate-400 group-hover:text-slate-200'}`}>
                          {topic.title}
                        </h3>
                      </div>
                      {topic.isLoaded ? (
                         <div className="h-2 w-2 rounded-full bg-green-500 mt-1"></div>
                      ) : activeTopicId === topic.id && loadingTopicId === topic.id ? (
                        <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                      ) : (
                        <ArrowRight className={`w-4 h-4 text-slate-600 transition-opacity ${activeTopicId === topic.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </aside>

            {/* Content Area */}
            <div className="lg:col-span-9 overflow-y-auto pr-2 pb-20">
              {activeTopic ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  
                  {/* Topic Header */}
                  <div>
                    <h2 className="text-3xl font-bold text-slate-100 mb-2">{activeTopic.title}</h2>
                    <p className="text-slate-400 text-lg leading-relaxed">{activeTopic.description}</p>
                  </div>

                  {loadingTopicId === activeTopic.id ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                      <div className="relative">
                        <div className="h-12 w-12 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-indigo-400" />
                        </div>
                      </div>
                      <p className="text-slate-400 animate-pulse">Agents are researching content...</p>
                    </div>
                  ) : (
                    <>
                      {/* Three Column Info Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                            <h4 className="text-xs font-mono text-cyan-500 uppercase mb-2">Prerequisites</h4>
                            <p className="text-sm text-slate-300">{activeTopic.prerequisites}</p>
                         </div>
                         <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                            <h4 className="text-xs font-mono text-indigo-500 uppercase mb-2">Key Concepts</h4>
                            <p className="text-sm text-slate-300">{activeTopic.keyConcepts}</p>
                         </div>
                         <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                            <h4 className="text-xs font-mono text-pink-500 uppercase mb-2">Practice</h4>
                            <p className="text-sm text-slate-300">{activeTopic.practiceIdeas}</p>
                         </div>
                      </div>

                      {/* Resources Section */}
                      <section>
                        <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
                           <Library className="w-5 h-5 text-indigo-400" />
                           <h3 className="text-xl font-semibold text-slate-200">Resources</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {activeTopic.resources.map((res, i) => (
                            <ResourceCard key={i} resource={res} />
                          ))}
                          {activeTopic.resources.length === 0 && (
                            <div className="col-span-2 text-center py-8 border border-dashed border-slate-800 rounded-lg text-slate-500">
                              No external resources found for this specific module.
                            </div>
                          )}
                        </div>
                      </section>

                      {/* Flashcards Section */}
                      <section>
                        <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
                           <Layers className="w-5 h-5 text-indigo-400" />
                           <h3 className="text-xl font-semibold text-slate-200">Flashcards</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {activeTopic.flashcards.map((card) => (
                            <Flashcard key={card.id} card={card} />
                          ))}
                        </div>
                      </section>

                      {/* Quiz Section */}
                      <section>
                        <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
                           <BookOpenCheck className="w-5 h-5 text-indigo-400" />
                           <h3 className="text-xl font-semibold text-slate-200">Knowledge Check</h3>
                        </div>
                        <div className="space-y-6">
                          {activeTopic.quiz.map((q) => (
                            <QuizModule key={q.id} question={q} />
                          ))}
                        </div>
                      </section>
                    </>
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500">
                  Select a module from the study plan to begin.
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;