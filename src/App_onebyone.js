import React, { useEffect, useState, useCallback } from "react";
import { Button, Typography, Container, Box, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';

// VideoPairApp.jsx
// A small Moral-Machine-style app: show 2 videos, let user click one, log choice, then show next 2.

export default function VideoPairApp() {
  const [items, setItems] = useState([]); // full list loaded from JSON
  const [pool, setPool] = useState([]); // shuffled remaining items
  const [pair, setPair] = useState([]); // current pair of two items
  const [results, setResults] = useState([]); // recorded choices: {left, right, chosenId}
  const [loading, setLoading] = useState(true);
  const [ended, setEnded] = useState(false);

  // Utility: shuffle array (Fisher-Yates)
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Build a public URL for a video entry. Assumes video entries in json use paths relative to public/, e.g. "swarm-videos/foo.mp4".
  const makeUrl = (id) => {
    // process.env.PUBLIC_URL is set by CRA at build time; during dev it's empty string
    const base = process.env.PUBLIC_URL;
    // ensure leading slash if PUBLIC_URL empty
    const prefix = base === "" ? "" : base;
    return `${prefix}/${id}`.replace("/\/g", "/");
  };

  // Load json list from public/json-videos.json
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.PUBLIC_URL}/json-videos.JSON`);
        if (!res.ok) throw new Error("Failed to fetch json-videos.json: " + res.status);
        const data = await res.json();
        if (!mounted) return;
        // Normalize: ensure each item has id and name and url
        const normalized = data.map((it, idx) => ({
          ...it,
          _idx: idx,
          id: it.id || String(idx),
          url: makeUrl((it.id || String(idx)).replace(/^\//, "")),
        }));
        const s = shuffle(normalized);
        setItems(normalized);
        setPool(s);
        setResults([]);
        setEnded(false);
        // pick initial pair
        if (s.length >= 2) {
          setPair([s[0], s[1]]);
          setPool(s.slice(2));
        } else {
          setPair(s);
          setPool([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  const advancePair = useCallback(() => {
    if (pool.length >= 2) {
      setPair([pool[0], pool[1]]);
      setPool((p) => p.slice(2));
    } else if (pool.length === 1) {
      // last one plus a random from results or items (fallback), but simplest: end
      setPair([]);
      setPool([]);
      setEnded(true);
    } else {
      setPair([]);
      setEnded(true);
    }
  }, [pool]);

  const onChoose = (chosenSide) => {
    if (pair.length !== 2) return;
    const left = pair[0];
    const right = pair[1];
    const chosen = chosenSide === "left" ? left : right;
    setResults((r) => [...r, { left: left.id, right: right.id, chosen: chosen.id, timestamp: Date.now() }]);
    advancePair();
  };

  // keyboard support: ArrowLeft picks left, ArrowRight picks right
  useEffect(() => {
    const handler = (e) => {
      if (ended || loading) return;
      if (e.key === "ArrowLeft") onChoose("left");
      if (e.key === "ArrowRight") onChoose("right");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [ended, loading, pair]);

  const restart = () => {
    const s = shuffle(items);
    setPool(s);
    if (s.length >= 2) {
      setPair([s[0], s[1]]);
      setPool(s.slice(2));
    } else {
      setPair(s);
      setPool([]);
    }
    setResults([]);
    setEnded(false);
  };

  if (loading) return <div style={{ padding: 20 }}>Loading videos…</div>;
  if (ended) {
    return (
      <div style={{ padding: 20 }}>
        <h2>All done</h2>
        <p>You made {results.length} choices.</p>
        <button onClick={restart}>Restart</button>
        <pre style={{ whiteSpace: "pre-wrap", maxHeight: 400, overflow: "auto" }}>{JSON.stringify(results, null, 2)}</pre>
      </div>
    );
  }

  if (!pair || pair.length < 2) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Not enough videos to compare</h2>
        <button onClick={restart}>Reload</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 10, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" }}>
      <h2>Video Pairwise Sorter</h2>
      <p>
        Click the video you prefer (or press <strong>←</strong> / <strong>→</strong>). Progress: {results.length} completed
      </p>

      <div style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
        <VideoCard item={pair[0]} onChoose={() => onChoose("left")} position="left" />
        <VideoCard item={pair[1]} onChoose={() => onChoose("right")} position="right" />
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={restart}>Restart</button>
      </div>
      <div style={{ marginTop: 1 }}>
        <Timerbox count={1} />
      </div>
    </div>
  );
}

function Timerbox({ count }) {
  return (
    <Box sx={{ width: '30%', height: '15%', borderRadius: '4px', borderColor: 'info.main', backgroundColor: "rgba(0,1,255,0.1)", color: 'primary.main', position: "fixed" }}>
       
    </Box>
  );


} 

function VideoCard({ item, onChoose, position = "left" }) {
  if (!item) return null;
  return (
    <div
      onClick={onChoose}
      role="button"
      tabIndex={0}
      style={{
        cursor: "pointer",
        width: "50%",
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 8,
        boxSizing: "border-box",
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") onChoose();
      }}
    >
      <div style={{ marginBottom: 8, fontWeight: 600 }}>{item.name || item.id}</div>
      <video
        src={item.url}
        controls
        style={{ width: "100%", height: "320px", objectFit: "cover", borderRadius: 6 }}
      />
      <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>{item.id}</div>
    </div>
  );
}
