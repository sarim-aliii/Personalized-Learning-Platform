import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Ingest } from './components/features/Ingest';
import { Summary } from './components/features/Summary';
import { Flashcards } from './components/features/Flashcards';
import { MCQ } from './components/features/MCQ';
import { AITutor } from './components/features/AskLLM';
import { ConceptMap } from './components/features/ConceptMap';
import { AudioAnalysis } from './components/features/VoiceQA';
import { SemanticSearch } from './components/features/SemanticSearch';
import { LessonPlanner } from './components/features/LessonPlanner';
import { StudyPlanner } from './components/features/StudyPlanner';
import { Tab } from './types';
import { ToastContainer } from './components/ui/Toast';

const MainContent: React.FC = () => {
    const { activeTab } = useAppContext();
    const [displayedTab, setDisplayedTab] = useState(activeTab);
    const [animationClass, setAnimationClass] = useState('fade-in');

    useEffect(() => {
        if (activeTab !== displayedTab) {
            setAnimationClass('fade-out');
            const timer = setTimeout(() => {
                setDisplayedTab(activeTab);
                setAnimationClass('fade-in');
            }, 200); // Match fade-out animation duration

            return () => clearTimeout(timer);
        }
    }, [activeTab, displayedTab]);

    const renderContent = () => {
        switch (displayedTab) {
            case Tab.Ingest:
                return <Ingest />;
            case Tab.Summary:
                return <Summary />;
            case Tab.SRSFlashcards:
                return <Flashcards />;
            case Tab.MCQ:
                return <MCQ />;
            case Tab.SemanticSearch:
                return <SemanticSearch />;
            case Tab.AITutor:
                return <AITutor />;
            case Tab.ConceptMap:
                return <ConceptMap />;
            case Tab.AudioAnalysis:
                return <AudioAnalysis />;
            case Tab.LessonPlanner:
                return <LessonPlanner />;
            case Tab.StudyPlanner:
                return <StudyPlanner />;
            default:
                return <Ingest />;
        }
    };

    return (
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <div className={animationClass}>
                {renderContent()}
            </div>
        </main>
    );
};

const AppLayout: React.FC = () => {
    const { isSidebarCollapsed, setIsSidebarCollapsed } = useAppContext();
    return (
      <div className="min-h-screen text-slate-200 flex flex-col">
        <Header />
        <div className="flex flex-1 flex-col md:flex-row overflow-hidden relative">
          <Sidebar />
           <button 
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                className={`
                    absolute top-1/2 -translate-y-1/2 z-20 md:block hidden bg-slate-800 hover:bg-red-600 
                    text-slate-300 hover:text-white p-2 rounded-full shadow-lg 
                    transition-all duration-300 ease-in-out
                    ${isSidebarCollapsed ? 'left-2' : 'lg:left-[calc(20rem-1.125rem)] md:left-[calc(18rem-1.125rem)]'}
                `}
                aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
          </button>
          <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out">
            <MainContent />
          </div>
        </div>
        <ToastContainer />
      </div>
    );
}

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
};

export default App;