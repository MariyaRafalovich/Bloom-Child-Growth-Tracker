import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, RefreshCw, Sparkles, Loader2, Brain } from "lucide-react";
import { THEME } from "../constants";
import { motion, AnimatePresence } from "motion/react";
import { type ChildProfile, type LogEntry } from "../types";
import { generateProfileUpdate, type ProfileUpdateResponse } from "../services/geminiService";

export function Profile({ profile, onSave, history }: { profile: ChildProfile | null, onSave: (p: ChildProfile) => void, history: LogEntry[] }) {
  const navigate = useNavigate();
  const [isRefining, setIsRefining] = useState(false);
  const [suggestion, setSuggestion] = useState<ProfileUpdateResponse | null>(null);
  const [formData, setFormData] = useState<ChildProfile>(profile || {
    name: "",
    age: "",
    interests: "",
    temperament: "",
    sheetWebhook: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    navigate("/");
  };

  const handleAutoRefine = async () => {
    if (!profile || history.length === 0) return;
    setIsRefining(true);
    try {
      const profileStr = `Name: ${profile.name}, Age: ${profile.age}. Interests: ${profile.interests}. Temperament: ${profile.temperament}`;
      const historyStrs = history.map(h => h.input);
      const update = await generateProfileUpdate(profileStr, historyStrs);
      setSuggestion(update);
    } catch (error) {
      console.error("Profile refinement failed:", error);
    } finally {
      setIsRefining(false);
    }
  };

  const applySuggestion = () => {
    if (!suggestion) return;
    setFormData({
      ...formData,
      interests: suggestion.interests,
      temperament: suggestion.temperament,
      age: suggestion.ageRecommendation || formData.age,
    });
    setSuggestion(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold tracking-tight pb-2" style={{ color: THEME.text }}>Child Profile</h2>
          <p className="font-sans text-gray-500">This profile helps Bloom provide personalized development insights.</p>
        </div>
        
        {profile && history.length > 0 && (
          <button
            onClick={handleAutoRefine}
            disabled={isRefining}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary text-primary font-bold text-xs hover:bg-light-accent transition-all disabled:opacity-50"
          >
            {isRefining ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            Auto-Refine with AI
          </button>
        )}
      </div>

      <AnimatePresence>
        {suggestion && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-light-accent/50 border border-primary/20 rounded-3xl p-6 space-y-4 overflow-hidden"
          >
            <div className="flex items-center gap-2 text-primary">
              <Brain size={20} />
              <h3 className="text-sm font-bold uppercase tracking-widest">AI Suggested Profile Growth</h3>
            </div>
            
            <p className="text-sm text-subtext italic leading-relaxed">
              "{suggestion.reasoning}"
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
               <div className="space-y-1">
                 <span className="text-[10px] font-bold text-muted uppercase">New Interests</span>
                 <p className="text-xs font-medium text-text bg-white/50 p-3 rounded-xl border border-secondary/20">{suggestion.interests}</p>
               </div>
               <div className="space-y-1">
                 <span className="text-[10px] font-bold text-muted uppercase">New Temperament</span>
                 <p className="text-xs font-medium text-text bg-white/50 p-3 rounded-xl border border-secondary/20">{suggestion.temperament}</p>
               </div>
            </div>

            <div className="flex gap-3 pt-2">
               <button
                 onClick={applySuggestion}
                 className="flex-1 py-3 bg-primary text-white rounded-xl font-bold text-xs shadow-md hover:bg-primary/90 transition-all"
               >
                 Accept Changes
               </button>
               <button
                 onClick={() => setSuggestion(null)}
                 className="px-6 py-3 border border-border text-muted rounded-xl font-bold text-xs hover:bg-white transition-all"
               >
                 Dismiss
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[32px] shadow-sm border border-border space-y-8">
        <div className="space-y-6">
          <h3 className="text-xl font-bold opacity-80">Basics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 font-sans">Name</label>
              <input
                type="text"
                required
                className="w-full p-3 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-violet-200 focus:ring-0 transition-all outline-none font-sans"
                placeholder="e.g. Leo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 font-sans">Age / Stage</label>
              <input
                type="text"
                required
                className="w-full p-3 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-violet-200 focus:ring-0 transition-all outline-none font-sans"
                placeholder="e.g. 2 years old"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold opacity-80">Narrative</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 font-sans">Interests</label>
              <textarea
                required
                rows={3}
                className="w-full p-3 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-violet-200 focus:ring-0 transition-all outline-none resize-none font-sans"
                placeholder="What do they love? Blocks, water, dinosaurs..."
                value={formData.interests}
                onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 font-sans">Temperament</label>
              <textarea
                required
                rows={3}
                className="w-full p-3 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-violet-200 focus:ring-0 transition-all outline-none resize-none font-sans"
                placeholder="Observant, energetic, sensitive, determined..."
                value={formData.temperament}
                onChange={(e) => setFormData({ ...formData, temperament: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6 pt-4 border-t border-gray-100">
          <h3 className="text-xl font-bold opacity-80 flex items-center gap-2">
            Sheet Sync
            <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full uppercase">Optional</span>
          </h3>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 font-sans">Google Apps Script Webhook URL</label>
            <input
              type="url"
              className="w-full p-3 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-violet-200 focus:ring-0 transition-all outline-none font-sans"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={formData.sheetWebhook || ""}
              onChange={(e) => setFormData({ ...formData, sheetWebhook: e.target.value })}
            />
            <p className="text-[10px] text-gray-400 leading-tight">
              To save results to a Google Sheet automatically, paste your Apps Script deployment URL here.
            </p>
          </div>
        </div>

        <div className="space-y-6 pt-4 border-t border-gray-100">
          <h3 className="text-xl font-bold opacity-80 flex items-center gap-2">
            Data Backup
            <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full uppercase">Safety</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => {
                const history = localStorage.getItem("bloom_history") || "[]";
                const profileStr = localStorage.getItem("bloom_profile") || "{}";
                const backup = JSON.stringify({ profile: JSON.parse(profileStr), history: JSON.parse(history) }, null, 2);
                const blob = new Blob([backup], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `bloom_backup_${new Date().toISOString().split('T')[0]}.json`;
                a.click();
              }}
              className="p-4 rounded-2xl bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-all text-center flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Export Backup
            </button>
            <label className="p-4 rounded-2xl bg-gray-50 text-gray-700 font-bold text-sm hover:bg-gray-100 transition-all text-center flex items-center justify-center gap-2 cursor-pointer">
              <RefreshCw size={18} />
              Import Backup
              <input
                type="file"
                className="hidden"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    try {
                      const data = JSON.parse(event.target?.result as string);
                      if (data.profile) localStorage.setItem("bloom_profile", JSON.stringify(data.profile));
                      if (data.history) localStorage.setItem("bloom_history", JSON.stringify(data.history));
                      window.location.reload();
                    } catch (err) {
                      alert("Invalid backup file");
                    }
                  };
                  reader.readAsText(file);
                }}
              />
            </label>
          </div>
          <p className="text-[10px] text-gray-400 leading-tight">
            Download your data to keep a copy on your own device. You can restore it at any time.
          </p>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl text-white font-bold shadow-xl hover:opacity-90 transition-all active:scale-[0.98] font-sans"
          style={{ backgroundColor: THEME.primary }}
        >
          <Save size={20} />
          Save Everything
        </button>
      </form>
    </motion.div>
  );
}
