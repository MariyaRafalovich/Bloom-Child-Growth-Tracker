import React, { useState } from "react";
import { type ChildProfile, type LogEntry } from "../types";
import { THEME } from "../constants";
import { analyzeObservation } from "../services/geminiService";
import { syncToSheet } from "../services/sheetService";
import { Send, Loader2, Sparkles, BookOpen, HeartPulse } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import Markdown from "react-markdown";

const REFLECTION_PROMPTS = [
  "What made her laugh the hardest today?",
  "How did she handle a frustration or 'no'?",
  "Did she try something new without being asked?",
  "What is she currently obsessed with (a song, a toy, a topic)?",
  "How did she interact with another child or adult today?",
  "Describe a moment where she showed independence.",
  "What is a word or phrase she's started using recently?"
];

export function Home({ profile, onAddEntry }: { profile: ChildProfile | null, onAddEntry: (e: LogEntry) => void }) {
  const [input, setInput] = useState("");
  const [activePrompt, setActivePrompt] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastEntry, setLastEntry] = useState<LogEntry | null>(null);

  React.useEffect(() => {
    const randomPrompt = REFLECTION_PROMPTS[Math.floor(Math.random() * REFLECTION_PROMPTS.length)];
    setActivePrompt(randomPrompt);
  }, []);

  if (!profile) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center space-y-6 pt-20">
        <div className="w-20 h-20 bg-violet-100 rounded-[32px] flex items-center justify-center text-violet-600 mb-2">
          <Sparkles size={40} />
        </div>
        <div className="space-y-4 max-w-sm">
          <h2 className="text-3xl font-bold font-display" style={{ color: THEME.text }}>Ready to Bloom?</h2>
          <p className="font-sans text-gray-500 leading-relaxed">To start tracking development, we first need to create a profile for your child.</p>
        </div>
        <Link 
          to="/profile"
          className="px-10 py-4 rounded-2xl text-white font-bold shadow-xl hover:opacity-90 transition-all hover:scale-105 active:scale-95 font-sans"
          style={{ backgroundColor: THEME.primary }}
        >
          Setup Profile
        </Link>
      </div>
    );
  }

  const handleAnalyze = async () => {
    if (!input.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      const profileString = `${profile.name}, ${profile.age}. Interests: ${profile.interests}. Temperament: ${profile.temperament}.`;
      const analysis = await analyzeObservation(input, profileString, []);
      
      const newEntry: LogEntry = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        input,
        analysis,
      };

      onAddEntry(newEntry);
      setLastEntry(newEntry);
      
      // Sync to Google Sheets if configured
      if (profile.sheetWebhook) {
        await syncToSheet(profile.sheetWebhook, {
          childName: profile.name,
          input: newEntry.input,
          observation: newEntry.analysis.observation,
          pattern: newEntry.analysis.pattern,
          scaffold: newEntry.analysis.scaffold,
          why: newEntry.analysis.why
        });
      }

      setInput("");
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-text">
          Hi {profile.name}'s parent,
        </h2>
        <p className="text-muted font-medium">What did you observe today?</p>
      </div>

      {/* Observation Input */}
      <div className="bg-white rounded-[32px] p-8 border border-border shadow-sm flex flex-col space-y-6">
        <div className="relative">
          <div className="flex items-center gap-2 mb-4 px-2">
            <Sparkles size={14} className="text-secondary" />
            <p className="text-xs font-bold text-muted uppercase tracking-widest">Today's Reflection Prompt</p>
          </div>
          <button 
            type="button"
            onClick={() => setInput(activePrompt)}
            className="w-full text-left p-6 rounded-3xl bg-secondary/5 border border-secondary/10 mb-6 hover:bg-secondary/10 transition-all group"
          >
            <p className="text-sm font-medium text-text italic group-hover:text-primary transition-colors">"{activePrompt}"</p>
            <span className="text-[10px] text-muted mt-2 block font-bold uppercase tracking-tighter">Click to use this prompt</span>
          </button>

          <textarea
            rows={5}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Example: Leo spent 20 minutes trying to zip his jacket alone for the first time. He got frustrated but didn't give up immediately..."
          className="w-full p-6 text-lg bg-background border-none rounded-2xl focus:ring-2 focus:ring-secondary resize-none text-subtext placeholder-muted transition-all outline-none"
        />
        <div className="flex justify-between items-center">
            <p className="text-sm text-muted">Analysis Framework: <span className="text-primary font-semibold">Developmental Strategist</span></p>
            <button
                onClick={handleAnalyze}
                disabled={!input.trim() || isAnalyzing}
                className={`flex items-center gap-2 px-10 py-3 rounded-full text-white font-medium transition-all ${
                !input.trim() || isAnalyzing ? "bg-muted cursor-not-allowed opacity-50" : "bg-primary hover:bg-text shadow-lg active:scale-95"
                }`}
            >
                {isAnalyzing ? (
                <>
                    <Loader2 size={20} className="animate-spin" />
                    Generating Strategist...
                </>
                ) : (
                <>
                    Generate Strategy
                </>
                )}
            </button>
        </div>
      </div>
    </div>

      {/* Result Display */}
      <AnimatePresence mode="wait">
        {lastEntry && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2 text-primary">
              <Sparkles size={20} />
              <h2 className="text-sm font-bold uppercase tracking-wider">Expert Developmental Analysis</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ResultCard 
                title="The Observation" 
                content={lastEntry.analysis.observation} 
                delay={0.1}
              />
              <ResultCard 
                title="The Pattern" 
                content={lastEntry.analysis.pattern} 
                delay={0.2} 
              />
              <ResultCard 
                title="The Scaffold" 
                content={lastEntry.analysis.scaffold} 
                delay={0.3} 
                highlight
              />
              <ResultCard 
                title="The Why" 
                content={lastEntry.analysis.why} 
                delay={0.4} 
              />
              <ResultCard 
                title="Parental Guidance" 
                content={lastEntry.analysis.guidance} 
                delay={0.5} 
                icon="guidance"
              />
              <ResultCard 
                title="Resource Toolkit" 
                content={lastEntry.analysis.resources} 
                delay={0.6} 
                icon="resources"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResultCard({ title, content, delay, highlight, icon }: { title: string, content: string, delay: number, highlight?: boolean, icon?: 'guidance' | 'resources' }) {
  const Icon = icon === 'guidance' ? HeartPulse : icon === 'resources' ? BookOpen : null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`p-6 rounded-[28px] border transition-all h-full ${
        highlight 
          ? "bg-light-accent border-secondary/50 shadow-sm" 
          : icon === 'guidance'
          ? "bg-rose-50 border-rose-100 shadow-sm"
          : icon === 'resources'
          ? "bg-blue-50 border-blue-100 shadow-sm"
          : "bg-white border-border"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className={`text-[10px] font-bold uppercase tracking-widest ${
          highlight ? "text-primary" : 
          icon === 'guidance' ? "text-rose-600" :
          icon === 'resources' ? "text-blue-600" :
          "text-muted"
        }`}>{title}</h3>
        {Icon && <Icon size={14} className={icon === 'guidance' ? "text-rose-400" : "text-blue-400"} />}
      </div>
      <div className="text-sm font-medium leading-relaxed text-subtext markdown-body">
        <Markdown>{content}</Markdown>
      </div>
      {highlight && (
          <div className="mt-4 pt-4 border-t border-secondary/20 flex gap-2">
              <span className="px-2 py-1 bg-green-100 text-green-700 text-[8px] rounded uppercase font-extrabold tracking-tighter">ZPD Target</span>
          </div>
      )}
    </motion.div>
  );
}
