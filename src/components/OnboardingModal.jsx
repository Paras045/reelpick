
import { useState } from "react";
import { db } from "../services/firebase";
import { doc, setDoc } from "firebase/firestore";

const GENRES = {
  action: 28,
  drama: 18,
  comedy: 35,
  thriller: 53,
  scifi: 878,
};

export default function OnboardingModal({ user, onComplete }) {
  const [actors, setActors] = useState([]);
  const [actorInput, setActorInput] = useState("");

  const [directors, setDirectors] = useState([]);
  const [directorInput, setDirectorInput] = useState("");

  const [writers, setWriters] = useState([]);
  const [writerInput, setWriterInput] = useState("");

  const [genres, setGenres] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [langInput, setLangInput] = useState("");

  const [vibe, setVibe] = useState("");
  const [saving, setSaving] = useState(false);

  const addChip = (value, setter, setInput) => {
    const v = value.trim();
    if (!v) return;
    setter(prev => [...prev, v]);
    setInput("");
  };

  const removeAt = (index, setter) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const toggleGenre = (name) => {
    const id = GENRES[name];
    if (!id) return;
    setGenres(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  };

  const toggleLang = (code) => {
    setLanguages(prev => prev.includes(code) ? prev.filter(x=>x!==code) : [...prev, code]);
    setLangInput("");
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, "userPreferences", user.uid), {
        actors: actors.map(name => ({ name })),
        directors: directors.map(name => ({ name })),
        writers: writers.map(name => ({ name })),
        genres,
        languages,
        vibe,
        completed: true,
        timestamp: Date.now(),
      });
      onComplete && onComplete();
    } catch (err) {
      console.error("Failed to save preferences:", err);
      alert("Failed to save preferences, try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, "userPreferences", user.uid), {
        completed: true,
        timestamp: Date.now(),
      }, { merge: true });
      onComplete && onComplete();
    } catch (err) {
      console.error("Failed to mark onboarding complete:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="onboard-overlay">
      <div className="onboard-modal card">
        <h2>Tell us about your tastes</h2>

        <div style={{marginTop:8}}>
          <label>Favourite actors</label>
          <div className="chips">
            {actors.map((a, i) => (
              <div className="chip" key={i}>{a} <button onClick={() => removeAt(i, setActors)}>×</button></div>
            ))}
            <input value={actorInput} onChange={e=>setActorInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){addChip(actorInput, setActors, setActorInput)}}} placeholder="Add actor and press Enter" />
          </div>
        </div>

        <div style={{marginTop:8}}>
          <label>Favourite directors</label>
          <div className="chips">
            {directors.map((a, i) => (
              <div className="chip" key={i}>{a} <button onClick={() => removeAt(i, setDirectors)}>×</button></div>
            ))}
            <input value={directorInput} onChange={e=>setDirectorInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){addChip(directorInput, setDirectors, setDirectorInput)}}} placeholder="Add director and press Enter" />
          </div>
        </div>

        <div style={{marginTop:8}}>
          <label>Favourite writers</label>
          <div className="chips">
            {writers.map((a, i) => (
              <div className="chip" key={i}>{a} <button onClick={() => removeAt(i, setWriters)}>×</button></div>
            ))}
            <input value={writerInput} onChange={e=>setWriterInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){addChip(writerInput, setWriters, setWriterInput)}}} placeholder="Add writer and press Enter" />
          </div>
        </div>

        <div style={{marginTop:8}}>
          <label>Genres</label>
          <div className="chips">
            {Object.keys(GENRES).map(k=> (
              <button key={k} className={`chip ${genres.includes(GENRES[k])? 'active':''}`} onClick={()=>toggleGenre(k)}>{k}</button>
            ))}
          </div>
        </div>

        <div style={{marginTop:8}}>
          <label>Languages</label>
          <div className="chips">
            {languages.map((l,i)=> <div className="chip" key={i}>{l} <button onClick={() => removeAt(i, setLanguages)}>×</button></div>)}
            <input value={langInput} placeholder="en, hi" onChange={e=>setLangInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){toggleLang(langInput)}}} />
          </div>
        </div>

        <div style={{marginTop:8}}>
          <label>Vibe</label>
          <select value={vibe} onChange={e=>setVibe(e.target.value)}>
            <option value="">-- pick --</option>
            <option value="thriller">Thriller</option>
            <option value="feel-good">Feel-good</option>
            <option value="slow-burn">Slow-burn</option>
            <option value="dark">Dark</option>
            <option value="comedic">Comedic</option>
          </select>
        </div>

        <div style={{marginTop:12, display:'flex', gap:8}}>
          <button className="btn" onClick={handleSubmit} disabled={saving}>{saving ? 'Saving...' : 'Save preferences'}</button>
          <button className="btn" onClick={handleSkip} disabled={saving} style={{background:'#666'}}>Skip</button>
        </div>

      </div>
    </div>
  );
}
