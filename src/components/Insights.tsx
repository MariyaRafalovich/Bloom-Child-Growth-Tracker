import React, { useEffect, useState } from "react";
import { type LogEntry } from "../types";
import { THEME } from "../constants";
import { Brain, Star, TrendingUp, Loader2, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { GoogleGenAI, Type } from "@google/genai";
import Markdown from "react-markdown";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface InsightSummary {
  strongSides: { name: string; description: string; score: number }[];
  developmentalSummary: string;
  nextFocus: string;
}

export function Insights({ history }: { history: LogEntry[] }) {
  const [data, setData] = useState<InsightSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateInsights = async () => {
    if (history.length < 1) return;
    setIsLoading(true);

    try {
      const historyText = history.map(h => `- Input: ${h.input}\n  Analysis: ${h.analysis.observation}`).join("\n\n");
      
      const prompt = `Based on the following history of child development observations, identify the child's "Strong Sides" (using Gardner's Multiple Intelligences) and provide a summary of their current developmental trajectory.
      
      HISTORY:
      ${historyText}
      
      Provide the response in JSON format.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              strongSides: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    score: { type: Type.NUMBER, description: "Confidence score from 1-100 based on frequency" }
                  },
                  required: ["name", "description", "score"]
                }
              },
              developmentalSummary: { type: Type.STRING },
              nextFocus: { type: Type.STRING }
            },
            required: ["strongSides", "developmentalSummary", "nextFocus"]
          }
        }
      });

      const result = JSON.parse(response.text);
      setData(result);
    } catch (error) {
      console.error("Failed to generate insights:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (history.length > 0 && !data) {
      generateInsights();
    }
  }, [history.length]);

  if (history.length === 0) {
    return (
      <div className="text-center py-20 px-8 bg-white/50 rounded-[40px] border border-border">
        <Brain size={48} className="mx-auto mb-4 text-violet-200" />
        <h3 className="text-xl font-bold mb-2" style={{ color: THEME.text }}>Insights will Bloom here</h3>
        <p className="text-gray-500 max-w-sm mx-auto">Record some observations on the Home screen to see the patterns in your child's growth.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-text">Insights</h2>
          <p className="text-muted font-medium">Growth patterns and strong sides.</p>
        </div>
        <button 
          onClick={generateInsights}
          disabled={isLoading}
          className="p-3 rounded-xl bg-white border border-border text-primary hover:bg-light-accent transition-all shadow-sm"
        >
          <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 size={40} className="animate-spin text-secondary" />
          <p className="text-muted font-bold uppercase tracking-widest text-[10px]">Identifying patterns...</p>
        </div>
      ) : data ? (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Strong Sides Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[32px] p-6 border border-border shadow-sm space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted">Activity by Domain</h3>
              <div className="space-y-4">
                {["Social", "Cognitive", "Motor", "Emotional", "Creative"].map((domain) => {
                  const count = history.filter(h => h.analysis.domain === domain).length;
                  const percentage = history.length > 0 ? (count / history.length) * 100 : 0;
                  return (
                    <div key={domain} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold uppercase">
                        <span className="text-muted">{domain}</span>
                        <span className="text-secondary">{count}</span>
                      </div>
                      <div className="w-full bg-light-accent h-1.5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          className="bg-secondary h-full rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-[32px] p-6 border border-border shadow-sm space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted">Gardner's Strong Sides</h3>
              <div className="space-y-6">
                {data.strongSides.map((side, i) => (
                  <div key={side.name} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-text">{side.name}</span>
                      <span className="text-primary">{side.score}%</span>
                    </div>
                    <div className="w-full bg-light-accent h-2 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${side.score}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="bg-secondary h-full rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trayectory column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
             <div className="bg-light-accent/50 rounded-[40px] p-8 border border-secondary/30 flex-1 flex flex-col justify-center border-dashed">
                <div className="mb-6">
                    <h2 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Latest Insights</h2>
                    <Brain className="text-primary/20 mb-4" size={40} />
                </div>
                
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-white space-y-6">
                  <div className="text-xl md:text-2xl font-display font-medium italic text-subtext leading-relaxed markdown-body">
                    <Markdown>{data.developmentalSummary}</Markdown>
                  </div>
                  
                  <div className="pt-6 border-t border-light-accent flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted block mb-1">Focus Area</span>
                        <p className="text-sm font-bold text-text">{data.nextFocus}</p>
                    </div>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 bg-primary/10 text-primary text-[8px] rounded-full uppercase font-black">Developmental Milestone</span>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}
