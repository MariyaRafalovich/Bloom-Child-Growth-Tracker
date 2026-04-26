import React from "react";
import { type LogEntry } from "../types";
import { THEME } from "../constants";
import { Calendar, ChevronRight, Search } from "lucide-react";
import { motion } from "motion/react";
import Markdown from "react-markdown";

export function ObservationHistory({ history }: { history: LogEntry[] }) {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredHistory = history.filter(entry => 
    entry.input.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.analysis.observation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight" style={{ color: THEME.text }}>History</h2>
          <p className="text-gray-500">Your collection of milestones and observations.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search observations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 pr-4 py-3 rounded-2xl bg-white border border-border focus:ring-2 focus:ring-secondary/50 outline-none w-full md:w-64 transition-all"
          />
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 bg-white/30 rounded-[40px] border border-dashed border-border text-gray-400">
          <Calendar size={48} className="mx-auto mb-4 opacity-20" />
          <p>No observations yet. Start your journey on the Home screen!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((entry, index) => (
            <HistoryItem key={entry.id} entry={entry} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryItem({ entry, index }: { entry: LogEntry; index: number; key?: string }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const date = new Date(entry.date).toLocaleDateString(undefined, { 
    month: "long", 
    day: "numeric", 
    year: "numeric" 
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-white rounded-[24px] border transition-all ${isOpen ? "border-primary shadow-md" : "border-border shadow-sm hover:border-secondary"}`}
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-6 flex justify-between items-center"
      >
        <div className="space-y-1">
          <div className={`text-[10px] font-bold uppercase tracking-widest ${isOpen ? "text-primary" : "text-muted"}`}>{date}</div>
          <h3 className="font-semibold text-text line-clamp-1">{entry.input}</h3>
        </div>
        <div className={`transition-all duration-300 ${isOpen ? "rotate-90 text-primary" : "text-muted"}`}>
          <ChevronRight size={18} />
        </div>
      </button>

      {isOpen && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="px-6 pb-8 border-t border-border bg-light-accent/20"
        >
          <div className="py-6 space-y-8">
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold text-muted tracking-widest">Parent Input</span>
              <p className="text-subtext text-sm leading-relaxed italic border-l-2 border-secondary pl-4 font-medium">{entry.input}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="bg-white p-5 rounded-2xl border border-border">
                 <span className="text-[10px] uppercase font-bold text-primary tracking-widest block mb-2">Observation</span>
                 <div className="text-xs text-subtext leading-relaxed font-medium markdown-body">
                   <Markdown>{entry.analysis.observation}</Markdown>
                 </div>
               </div>
               <div className="bg-white p-5 rounded-2xl border border-border">
                 <span className="text-[10px] uppercase font-bold text-primary tracking-widest block mb-2">Pattern</span>
                 <div className="text-xs text-subtext leading-relaxed font-medium markdown-body">
                   <Markdown>{entry.analysis.pattern}</Markdown>
                 </div>
               </div>
               <div className="bg-white p-5 rounded-2xl border border-border bg-light-accent/30">
                 <span className="text-[10px] uppercase font-bold text-primary tracking-widest block mb-2">The Scaffold</span>
                 <div className="text-xs text-subtext leading-relaxed font-bold markdown-body">
                   <Markdown>{entry.analysis.scaffold}</Markdown>
                 </div>
               </div>
               <div className="bg-white p-5 rounded-2xl border border-border">
                 <span className="text-[10px] uppercase font-bold text-primary tracking-widest block mb-2">The Why</span>
                 <div className="text-xs text-subtext leading-relaxed font-medium markdown-body">
                   <Markdown>{entry.analysis.why}</Markdown>
                 </div>
               </div>
               <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100">
                 <span className="text-[10px] uppercase font-bold text-rose-600 tracking-widest block mb-2">Guidance</span>
                 <div className="text-xs text-subtext leading-relaxed font-medium markdown-body">
                   <Markdown>{entry.analysis.guidance}</Markdown>
                 </div>
               </div>
               <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                 <span className="text-[10px] uppercase font-bold text-blue-600 tracking-widest block mb-2">Resources</span>
                 <div className="text-xs text-subtext leading-relaxed font-medium markdown-body">
                   <Markdown>{entry.analysis.resources}</Markdown>
                 </div>
               </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
