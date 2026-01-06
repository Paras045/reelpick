import "./Search.css";
import debounce from "lodash.debounce";
import { searchMulti } from "../services/tmdb";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";

export default function Search(){
  const [query,setQuery]=useState("");
  const [results,setResults]=useState([]);
  const [selected,setSelected]=useState(-1);
  const navigate = useNavigate();

  const doSearch = useMemo(() => debounce(async(q)=>{
    if(!q) return setResults([]);
    try{
      const res = await searchMulti(q);
      setResults(res.data.results.slice(0,8));
      setSelected(-1);
    }catch(e){
      console.error("Search error:", e);
    }
  },300), []);

  useEffect(()=>{ doSearch(query); return () => doSearch.cancel(); },[query, doSearch]);

  const handleKeyDown = (e)=>{
    if(e.key === 'ArrowDown'){
      setSelected(s => Math.min(s+1, results.length-1));
    } else if(e.key === 'ArrowUp'){
      setSelected(s => Math.max(s-1, 0));
    } else if(e.key === 'Enter'){
      const item = selected >=0 ? results[selected] : results[0];
      if(item) navigate(`/movie/${item.id}`, { state: item });
    } else if(e.key === 'Escape'){
      setResults([]);
    }
  };

  return(
    <div style={{padding:20}}>

      <h2>Search</h2>

      <input
        className="search-box"
        placeholder="Search movies & shows"
        value={query}
        onChange={e=>setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
      />

      <div style={{marginTop:10,borderRadius:12,overflow:"hidden"}}>
        {results.map((r, i)=>(
          <div
            key={r.id}
            className={`suggest-item ${selected===i? 'selected':''}`}
            onClick={()=>navigate(`/movie/${r.id}`,{state:r})}
          >
            {r.title || r.name}
          </div>
        ))}
      </div>
    </div>
  );
}
