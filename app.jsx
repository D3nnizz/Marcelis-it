const PALETTES = {
  electric: { brand: '#007fff', brandDeep: '#0000ff', brandSoft: '#3aa0ff', glow: 'rgba(0,127,255,0.55)', accent: '#ff2d2d' },
  cyan:     { brand: '#22d3ee', brandDeep: '#0066ff', brandSoft: '#7dd3fc', glow: 'rgba(34,211,238,0.55)', accent: '#ff2d2d' },
  crimson:  { brand: '#ff4d6d', brandDeep: '#c4005b', brandSoft: '#ff85a1', glow: 'rgba(255,77,109,0.55)', accent: '#007fff' },
  amber:    { brand: '#fbbf24', brandDeep: '#d97706', brandSoft: '#fcd34d', glow: 'rgba(251,191,36,0.5)',  accent: '#ff2d2d' },
};

function applyPalette(name) {
  const p = PALETTES[name] || PALETTES.electric;
  const r = document.documentElement.style;
  r.setProperty('--brand', p.brand);
  r.setProperty('--brand-deep', p.brandDeep);
  r.setProperty('--brand-soft', p.brandSoft);
  r.setProperty('--brand-glow', p.glow);
  r.setProperty('--accent', p.accent);
}

function readDefaults() {
  try {
    const raw = document.getElementById('tweak-defaults').textContent
      .replace(/\/\*EDITMODE-BEGIN\*\//, '')
      .replace(/\/\*EDITMODE-END\*\//, '');
    return JSON.parse(raw);
  } catch { return { palette: 'electric', servicesLayout: 'mosaic', energyLayout: 'split' }; }
}

function App() {
  const defaults = React.useMemo(readDefaults, []);
  const [values, setValues] = React.useState(defaults);
  const [editOpen, setEditOpen] = React.useState(false);

  React.useEffect(() => { applyPalette(values.palette); }, [values.palette]);

  React.useEffect(() => {
    const onMsg = (e) => {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === '__activate_edit_mode') setEditOpen(true);
      if (e.data.type === '__deactivate_edit_mode') setEditOpen(false);
    };
    window.addEventListener('message', onMsg);
    // announce availability AFTER listener is attached
    try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch {}
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const change = (k, v) => {
    const next = { ...values, [k]: v };
    setValues(next);
    // broadcast locally so section wrappers update immediately
    window.dispatchEvent(new CustomEvent('tweak:broadcast', { detail: { [k]: v } }));
    try { window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [k]: v } }, '*'); } catch {}
  };

  return (
    <>
      <TweaksPanel open={editOpen} values={values} onChange={change} />
    </>
  );
}

// Mount all sections
ReactDOM.createRoot(document.getElementById('hero-visual')).render(<HeroVisual />);

function ServicesWrapper() {
  const [layout, setLayout] = React.useState(readDefaults().servicesLayout);
  React.useEffect(() => {
    const onMsg = (e) => {
      if (e.data?.type === '__edit_mode_set_keys' && e.data.edits?.servicesLayout) {
        setLayout(e.data.edits.servicesLayout);
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);
  // also listen to internal bus via a custom event
  React.useEffect(() => {
    const h = (e) => setLayout(e.detail);
    window.addEventListener('tweak:servicesLayout', h);
    return () => window.removeEventListener('tweak:servicesLayout', h);
  }, []);
  return <Services variant={layout} />;
}

function EnergyWrapper() {
  const [layout, setLayout] = React.useState(readDefaults().energyLayout);
  React.useEffect(() => {
    const h = (e) => setLayout(e.detail);
    window.addEventListener('tweak:energyLayout', h);
    return () => window.removeEventListener('tweak:energyLayout', h);
  }, []);
  return <EnergySection variant={layout} />;
}

ReactDOM.createRoot(document.getElementById('services-root')).render(<ServicesWrapper />);
ReactDOM.createRoot(document.getElementById('energy-root')).render(<EnergyWrapper />);
ReactDOM.createRoot(document.getElementById('crypto-root')).render(<CryptoCard />);
ReactDOM.createRoot(document.getElementById('contact-root')).render(<Contact />);
ReactDOM.createRoot(document.getElementById('tweaks-root')).render(<App />);

// Bridge: when App's change fn fires, also dispatch custom events for other roots
(function installTweakBridge() {
  const origPost = window.postMessage;
  // listen to our own parent-bound messages by intercepting the change call —
  // simpler: listen on window and re-broadcast as custom events
  window.addEventListener('message', (e) => {
    if (e.data?.type === '__edit_mode_set_keys' && e.data.edits) {
      for (const [k, v] of Object.entries(e.data.edits)) {
        window.dispatchEvent(new CustomEvent(`tweak:${k}`, { detail: v }));
      }
    }
  });
  // also hook local dispatch: monkey-patch parent postMessage to broadcast to self too
  const send = (edits) => {
    for (const [k, v] of Object.entries(edits)) {
      window.dispatchEvent(new CustomEvent(`tweak:${k}`, { detail: v }));
    }
  };
  // Intercept postMessage to parent for our own tweak events
  try {
    const origParentPost = window.parent.postMessage.bind(window.parent);
    window.parent.postMessage = function(msg, ...rest) {
      if (msg && msg.type === '__edit_mode_set_keys' && msg.edits) send(msg.edits);
      return origParentPost(msg, ...rest);
    };
  } catch (e) { /* cross-origin — skip monkeypatch, rely on bridge below */ }

  // Bridge internal: listen for a custom event and re-broadcast keys
  window.addEventListener('tweak:broadcast', (e) => send(e.detail || {}));
})();
