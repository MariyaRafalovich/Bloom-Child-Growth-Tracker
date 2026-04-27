import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./components/Home";
import { ObservationHistory } from "./components/History";
import { Insights } from "./components/Insights";
import { Profile } from "./components/Profile";
import { type ChildProfile, type LogEntry } from "./types";
import { supabase } from "./lib/supabase";

export default function App() {
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [history, setHistory] = useState<LogEntry[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Initial Load from LocalStorage
    const savedProfile = localStorage.getItem("bloom_profile");
    if (savedProfile) setProfile(JSON.parse(savedProfile));

    const savedHistory = localStorage.getItem("bloom_history");
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    // Try to sync with Supabase if available
    const fetchFromSupabase = async () => {
      if (!supabase) return;
      setIsSyncing(true);
      try {
        // Fetch latest profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .limit(1);
        
        if (profileData && profileData.length > 0 && !profileError) {
          const firstProfile = profileData[0];
          const formattedProfile = {
            name: firstProfile.name,
            age: firstProfile.age,
            interests: firstProfile.interests,
            temperament: firstProfile.temperament
          };
          setProfile(formattedProfile);
          localStorage.setItem("bloom_profile", JSON.stringify(formattedProfile));
        }

        // Fetch observations
        const { data: obsData } = await supabase
          .from('observations')
          .select('*')
          .order('created_at', { ascending: false });

        if (obsData) {
          const formattedHistory: LogEntry[] = obsData.map(d => ({
            id: d.id,
            date: d.created_at,
            input: d.input,
            analysis: d.analysis
          }));
          setHistory(formattedHistory);
          localStorage.setItem("bloom_history", JSON.stringify(formattedHistory));
        }
      } catch (err) {
        console.error("Supabase sync failed:", err);
      } finally {
        setIsSyncing(false);
      }
    };

    fetchFromSupabase();
  }, []);

  const saveProfile = async (newProfile: ChildProfile) => {
    setProfile(newProfile);
    localStorage.setItem("bloom_profile", JSON.stringify(newProfile));
    
    if (supabase) {
      setIsSyncing(true);
      try {
        await supabase.from('profiles').upsert({
          id: 1, // Single profile for now
          ...newProfile,
          updated_at: new Date()
        });
      } catch (err) {
        console.error("Profile sync failed:", err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const addEntry = async (entry: LogEntry) => {
    const newHistory = [entry, ...history];
    setHistory(newHistory);
    localStorage.setItem("bloom_history", JSON.stringify(newHistory));

    if (supabase) {
      setIsSyncing(true);
      try {
        const { error } = await supabase.from('observations').insert({
          id: entry.id,
          input: entry.input,
          analysis: entry.analysis,
          created_at: entry.date
        });
        if (error) throw error;
      } catch (err) {
        console.error("Observation sync failed:", err);
        // We still have it in localStorage, so the app won't crash
      } finally {
        setIsSyncing(false);
      }
    }
  };

  return (
    <BrowserRouter>
      <Layout isSyncing={isSyncing}>
        <Routes>
          <Route path="/" element={<Home profile={profile} onAddEntry={addEntry} />} />
          <Route path="/history" element={<ObservationHistory history={history} />} />
          <Route path="/insights" element={<Insights history={history} />} />
          <Route path="/profile" element={<Profile profile={profile} onSave={saveProfile} history={history} />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
