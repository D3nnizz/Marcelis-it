// ═════════════════════════════════════════════════════════════════════════════
// MARCELIS.IT COMPONENTS
// ═════════════════════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────────────────
// 1. IMPORTS & CONSTANTS
// ───────────────────────────────────────────────────────────────────────────

const { useEffect, useRef, useState, useMemo } = React;

// ───────────────────────────────────────────────────────────────────────────
// 2. HERO VISUAL - Animated Energy Flow Canvas
// ───────────────────────────────────────────────────────────────────────────
// Interactive animated visualization showing energy flow from solar to home

function HeroVisual() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf, t = 0;
    const dpr = window.devicePixelRatio || 1;

    function resize() {
      const r = canvas.getBoundingClientRect();
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      ctx.scale(dpr, dpr);
    }
    resize();
    window.addEventListener('resize', resize);

    // particle paths — flowing from top-right to center (solar to home)
    const nodes = [
      { x: 0.88, y: 0.12, label: '☀' },   // sun
      { x: 0.5,  y: 0.52, label: 'hub' }, // smart hub
      { x: 0.12, y: 0.82, label: '⌂' },   // home
      { x: 0.82, y: 0.82, label: '⚡' },   // device
      { x: 0.18, y: 0.22, label: '◉' },   // battery
    ];
    const edges = [
      [0, 1], [1, 2], [1, 3], [1, 4],
    ];
    const particles = edges.flatMap(([a, b]) =>
      Array.from({ length: 5 }, (_, i) => ({ a, b, p: i / 5 }))
    );

    function draw() {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      // soft glow bg
      const g = ctx.createRadialGradient(w * 0.5, h * 0.52, 10, w * 0.5, h * 0.52, Math.max(w, h) * 0.6);
      g.addColorStop(0, 'rgba(0,127,255,0.12)');
      g.addColorStop(1, 'rgba(0,0,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // edges
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(140,180,255,0.2)';
      edges.forEach(([ai, bi]) => {
        const a = nodes[ai], b = nodes[bi];
        ctx.beginPath();
        ctx.moveTo(a.x * w, a.y * h);
        ctx.lineTo(b.x * w, b.y * h);
        ctx.stroke();
      });

      // particles
      particles.forEach(pt => {
        pt.p += 0.0035;
        if (pt.p > 1) pt.p = 0;
        const a = nodes[pt.a], b = nodes[pt.b];
        const x = (a.x + (b.x - a.x) * pt.p) * w;
        const y = (a.y + (b.y - a.y) * pt.p) * h;
        const alpha = Math.sin(pt.p * Math.PI);
        ctx.fillStyle = `rgba(58,160,255,${0.9 * alpha})`;
        ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill();
        // glow
        ctx.fillStyle = `rgba(58,160,255,${0.2 * alpha})`;
        ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
      });

      // nodes
      nodes.forEach((n, i) => {
        const x = n.x * w, y = n.y * h;
        // outer ring
        ctx.strokeStyle = 'rgba(140,180,255,0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(x, y, 22 + Math.sin(t * 0.03 + i) * 1.5, 0, Math.PI * 2); ctx.stroke();
        // inner fill
        const grad = ctx.createRadialGradient(x, y, 0, x, y, 18);
        grad.addColorStop(0, 'rgba(0,127,255,0.7)');
        grad.addColorStop(1, 'rgba(0,0,255,0.05)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(x, y, 16, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#e8eeff';
        ctx.font = '600 13px "Space Grotesk"';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(n.label, x, y + 1);
      });

      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <div style={{
      position: 'relative',
      aspectRatio: '1 / 1',
      maxHeight: 520,
      borderRadius: 22,
      overflow: 'hidden',
      border: '1px solid var(--border-strong)',
      background:
        'radial-gradient(circle at 80% 20%, rgba(0,127,255,0.14), transparent 50%), ' +
        'radial-gradient(circle at 20% 80%, rgba(0,0,255,0.14), transparent 50%), ' +
        'var(--surface-2)',
      backdropFilter: 'blur(18px)',
    }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      {/* corner overlays */}
      <div style={{
        position: 'absolute', top: 16, left: 16,
        fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.12em',
        color: 'var(--text-faint)', textTransform: 'uppercase',
      }}>
        live · energy graph
      </div>
      <div style={{
        position: 'absolute', top: 16, right: 16,
        display: 'flex', alignItems: 'center', gap: 8,
        fontFamily: 'var(--font-mono)', fontSize: 10.5,
        color: 'var(--text-dim)',
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: 'var(--good)', boxShadow: '0 0 8px var(--good)',
          animation: 'pulse 1.6s ease-in-out infinite',
        }}/>
        sync
      </div>
      <div style={{
        position: 'absolute', bottom: 16, left: 16, right: 16,
        display: 'flex', justifyContent: 'space-between',
        fontFamily: 'var(--font-mono)', fontSize: 10.5,
        color: 'var(--text-dim)',
      }}>
        <span>lat: 52.37° N</span>
        <span>lon: 04.90° E</span>
        <span style={{ color: 'var(--brand-soft)' }}>NL-AMSTERDAM</span>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// 3. IT SERVICES SECTION - Cards and Layout
// ───────────────────────────────────────────────────────────────────────────
// Service offerings: Support, Networks, Custom Dev, Consulting, Maintenance

const SERVICES = [
  {
    n: '01',
    title: 'Support & Troubleshooting',
    body: 'Een vastgelopen PC, een wifi dat het niet doet, een printer die zich verzet. We komen langs, bellen mee of loggen veilig in.',
    accent: 'wide',
    chip: 'Particulier · MKB',
  },
  {
    n: '02',
    title: 'Netwerken',
    body: 'Van een sterk thuisnetwerk tot een zakelijk VLAN met glasvezel. Stabiel, snel, veilig.',
    accent: '',
    chip: 'Wi-Fi 7 · Mesh · VPN',
  },
  {
    n: '03',
    title: 'Maatwerk',
    body: 'Custom software, automatisering of hardware — als een bestaande oplossing niet past, bouwen we een die wél past.',
    accent: '',
    chip: 'Dev · IoT · Scripts',
  },
  {
    n: '04',
    title: 'Advies bij aankoop',
    body: 'Onafhankelijk advies over wat je écht nodig hebt — geen dure specs waar je niks mee doet.',
    accent: '',
    chip: 'Laptops · Servers',
  },
  {
    n: '05',
    title: 'Onderhoud',
    body: 'Updates, back-ups, monitoring. We zorgen dat het werkt — voordat het stuk gaat.',
    accent: 'wide',
    chip: 'Proactief · Continu',
  },
];

function Services({ variant }) {
  const cls = variant === 'rows' ? 'service-grid variant-b' : 'service-grid';
  return (
    <div className={cls}>
      {SERVICES.map((s, i) => (
        <div key={s.n} className={`svc-card ${s.accent} ${s.accent === 'wide' && variant !== 'rows' ? '' : ''}`}>
          <div className="glow" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
            <span className="svc-num">{s.n} / 05</span>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.08em',
              color: 'var(--text-faint)', padding: '4px 10px', borderRadius: 999,
              border: '1px solid var(--border)', background: 'rgba(5,7,13,0.5)',
            }}>{s.chip}</span>
          </div>
          <div className="svc-title" style={{ marginTop: variant === 'rows' ? 48 : 80 }}>{s.title}</div>
          <div className="svc-body">{s.body}</div>
          {s.accent === 'wide' && variant !== 'rows' && (
            <div style={{
              position: 'absolute', right: 24, bottom: 24,
              fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--brand-soft)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              meer →
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// 4. SMART ENERGY DASHBOARD - Flow Visualization & Statistics
// ───────────────────────────────────────────────────────────────────────────
// Real-time energy flow diagram with live power generation, consumption, and battery data

function EnergyFlow() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT(x => x + 1), 50);
    return () => clearInterval(id);
  }, []);

  // live-ish values
  const solar = 3.42 + Math.sin(t / 30) * 0.25;
  const home = 1.18 + Math.sin(t / 25 + 1) * 0.15;
  const battery = 0.8 + Math.sin(t / 40 + 2) * 0.2;
  const grid = solar - home - battery;

  return (
    <div className="flow-canvas">
      <svg viewBox="0 0 400 280" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="wire" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="rgba(58,160,255,0.1)" />
            <stop offset="0.5" stopColor="rgba(58,160,255,0.6)" />
            <stop offset="1" stopColor="rgba(58,160,255,0.1)" />
          </linearGradient>
          <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="rgba(0,127,255,0.8)" />
            <stop offset="1" stopColor="rgba(0,0,255,0.05)" />
          </radialGradient>
        </defs>

        {/* wires */}
        <path d="M 60 60 Q 200 60 200 140" stroke="rgba(140,180,255,0.22)" strokeWidth="1.5" fill="none"/>
        <path d="M 200 140 Q 200 220 60 220" stroke="rgba(140,180,255,0.22)" strokeWidth="1.5" fill="none"/>
        <path d="M 200 140 Q 200 220 340 220" stroke="rgba(140,180,255,0.22)" strokeWidth="1.5" fill="none"/>
        <path d="M 200 140 Q 340 140 340 60" stroke="rgba(140,180,255,0.22)" strokeWidth="1.5" fill="none"/>

        {/* flowing particles */}
        {[0, 0.25, 0.5, 0.75].map(p => {
          const phase = (t / 80 + p) % 1;
          return (
            <g key={p}>
              <circle cx={60 + (200-60) * phase} cy={60 + (140-60) * (phase*phase)} r="3" fill="#3aa0ff" opacity={Math.sin(phase * Math.PI)}/>
              <circle cx={200 - (200-60) * phase} cy={140 + (220-140) * phase} r="3" fill="#3aa0ff" opacity={Math.sin(phase * Math.PI)}/>
              <circle cx={200 + (340-200) * phase} cy={140 + (220-140) * phase} r="3" fill="#3aa0ff" opacity={Math.sin(phase * Math.PI)}/>
            </g>
          );
        })}

        {/* center hub */}
        <circle cx="200" cy="140" r="38" fill="url(#glow)" />
        <circle cx="200" cy="140" r="28" fill="none" stroke="rgba(140,180,255,0.4)" strokeWidth="1" />
        <text x="200" y="136" textAnchor="middle" fill="#e8eeff" style={{ fontFamily: 'Space Grotesk', fontSize: 11, fontWeight: 500 }}>SMART</text>
        <text x="200" y="150" textAnchor="middle" fill="#3aa0ff" style={{ fontFamily: 'Space Grotesk', fontSize: 11, fontWeight: 500 }}>HUB</text>

        {/* nodes */}
        {[
          { cx: 60, cy: 60, icon: '☀' },
          { cx: 340, cy: 60, icon: '▲' },
          { cx: 60, cy: 220, icon: '⌂' },
          { cx: 340, cy: 220, icon: '⚡' },
        ].map((n, i) => (
          <g key={i}>
            <circle cx={n.cx} cy={n.cy} r="18" fill="rgba(12,16,32,0.9)" stroke="rgba(140,180,255,0.3)" />
            <text x={n.cx} y={n.cy + 4} textAnchor="middle" fill="#e8eeff" style={{ fontFamily: 'Space Grotesk', fontSize: 14 }}>{n.icon}</text>
          </g>
        ))}
      </svg>

      <div className="flow-label" style={{ top: 16, left: 16 }}>
        Zonnepanelen
        <div className="flow-value">{solar.toFixed(2)}<span className="u"> kW</span></div>
      </div>
      <div className="flow-label" style={{ top: 16, right: 16, textAlign: 'right' }}>
        Batterij
        <div className="flow-value">{(battery * 100).toFixed(0)}<span className="u"> %</span></div>
      </div>
      <div className="flow-label" style={{ bottom: 16, left: 16 }}>
        Huis
        <div className="flow-value">{home.toFixed(2)}<span className="u"> kW</span></div>
      </div>
      <div className="flow-label" style={{ bottom: 16, right: 16, textAlign: 'right' }}>
        {grid > 0 ? 'Teruglevering' : 'Verbruik net'}
        <div className="flow-value" style={{ color: grid > 0 ? 'var(--good)' : 'var(--accent-soft)' }}>
          {Math.abs(grid).toFixed(2)}<span className="u"> kW</span>
        </div>
      </div>
    </div>
  );
}

function EnergySection({ variant }) {
  const [tab, setTab] = useState('vandaag');
  const [t, setT] = useState(0);
  useEffect(() => { const id = setInterval(() => setT(x => x + 1), 1000); return () => clearInterval(id); }, []);

  const bars = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const peak = 12; // noon
      const d = Math.max(0, 1 - Math.abs(i - peak) / 7);
      return d * (0.7 + Math.random() * 0.3);
    });
  }, [tab]);

  const now = new Date();
  const clock = now.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className={`energy-grid ${variant === 'stacked' ? 'variant-b' : ''}`}>
      <div className="energy-copy">
        <div className="img-ph" data-label="foto · smart energy module in meterkast" style={{ aspectRatio: '4/3', marginBottom: 28 }} />
        <h3 style={{ fontSize: 28, letterSpacing: '-0.02em', fontWeight: 500, marginBottom: 16 }}>
          Minder teruggeven. Méér zelf gebruiken.
        </h3>
        <p style={{ color: 'var(--text-dim)', fontSize: 15.5, lineHeight: 1.6, marginBottom: 24 }}>
          Smart Energy meet realtime wat je zonnepanelen opwekken en wat je verbruikt. Zodra er overschot is,
          schakelt het automatisch apparaten aan — boiler, laadpaal, warmtepomp, vaatwasser.
          Zo verdwijnt gratis stroom niet meer onderbetaald naar het net.
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            'Plug & play installatie in meterkast',
            'Werkt met elke omvormer via P1-poort',
            'Dynamische energieprijzen (Tibber, Easy Energy)',
            'Lokale verwerking — geen cloud-afhankelijkheid',
          ].map(f => (
            <li key={f} style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 14.5 }}>
              <span style={{
                width: 18, height: 18, borderRadius: 5,
                background: 'linear-gradient(180deg, var(--brand), var(--brand-deep))',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 0 1px rgba(140,180,255,0.3)',
              }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
              {f}
            </li>
          ))}
        </ul>
        <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
          <a className="btn-primary" href="#contact">Vraag offerte</a>
        </div>
      </div>

      <div className="dashboard">
        <div className="dash-head">
          <div className="dash-title">
            <span className="live-dot" />
            Smart Energy · live
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)' }}>
            {clock} · NL
          </div>
        </div>

        <EnergyFlow />

        <div className="dash-tabs">
          {['vandaag', 'week', 'maand', 'jaar'].map(tk => (
            <span key={tk} className={tab === tk ? 'on' : ''} onClick={() => setTab(tk)}>{tk}</span>
          ))}
        </div>

        <div className="dash-stats">
          <div className="stat">
            <div className="k">Opbrengst {tab}</div>
            <div className="v">{(tab === 'vandaag' ? 18.4 : tab === 'week' ? 142 : tab === 'maand' ? 612 : 7340).toFixed(1)}<span className="u"> kWh</span></div>
            <div className="delta">▲ {(tab === 'vandaag' ? 12 : 8)}% vs gem.</div>
          </div>
          <div className="stat">
            <div className="k">Zelfverbruik</div>
            <div className="v">{tab === 'vandaag' ? 64 : tab === 'week' ? 58 : tab === 'maand' ? 54 : 52}<span className="u"> %</span></div>
            <div className="delta">▲ +38% met SE</div>
          </div>
          <div className="stat">
            <div className="k">Besparing</div>
            <div className="v">€ {(tab === 'vandaag' ? 4.82 : tab === 'week' ? 32.1 : tab === 'maand' ? 128 : 1520).toFixed(tab === 'vandaag' ? 2 : 0)}</div>
            <div className="delta">t.o.v. terugleveren</div>
          </div>
        </div>

        <div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: 'var(--text-faint)',
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span>Opbrengst per uur · 00 → 23</span>
            <span>kWh</span>
          </div>
          <div className="bar-chart">
            {bars.map((b, i) => (
              <div key={i} className="bar" style={{ height: `${10 + b * 90}%`, opacity: 0.4 + b * 0.6 }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// 5. CRYPTO TEASER - Price Ticker & Market Scanner
// ───────────────────────────────────────────────────────────────────────────
// Live crypto ticker with market data: BTC, ETH, SOL, ARB with price charts

function CryptoCard() {
  const [t, setT] = useState(0);
  useEffect(() => { const id = setInterval(() => setT(x => x + 1), 1200); return () => clearInterval(id); }, []);

  const coins = [
    { s: 'BTC', price: 112400, chg: 2.14, seed: 3 },
    { s: 'ETH', price: 6280, chg: -0.82, seed: 7 },
    { s: 'SOL', price: 312, chg: 4.02, seed: 2 },
    { s: 'ARB', price: 1.74, chg: -1.24, seed: 5 },
  ];

  const spark = (seed) => {
    const pts = Array.from({ length: 20 }, (_, i) => {
      const y = 11 + Math.sin((i + seed + t * 0.2) * 0.7) * 6 + (Math.sin(i * 1.3) * 3);
      return `${i * 4},${y}`;
    }).join(' ');
    return pts;
  };

  return (
    <div className="glass crypto-card">
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', color: 'var(--brand-soft)', textTransform: 'uppercase' }}>crypto.marcelis.it</div>
        <h3 style={{ fontSize: 32, letterSpacing: '-0.02em', fontWeight: 500, marginTop: 14, marginBottom: 18, maxWidth: '18ch' }}>
          Scanners en bots die de markt niet laten liggen.
        </h3>
        <p style={{ color: 'var(--text-dim)', fontSize: 15, lineHeight: 1.6, marginBottom: 24, maxWidth: '42ch' }}>
          We ontwikkelen eigen tooling die 24/7 patronen en kansen signaleert en — als je dat wil — automatisch
          handelt. Minder schermen staren, meer tijd voor leven.
        </p>
        <a className="btn-ghost" href="https://crypto.marcelis.it" target="_blank" rel="noreferrer">
          Bezoek crypto.marcelis.it
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M5 11L11 5M11 5H6M11 5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </a>
      </div>
      <div className="ticker">
        <div style={{
          display: 'grid', gridTemplateColumns: '80px 1fr 90px 70px',
          gap: 12, padding: '0 14px 6px',
          fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--text-faint)',
        }}>
          <span>SYM</span><span>24H</span><span style={{ textAlign: 'right' }}>PRICE</span><span style={{ textAlign: 'right' }}>CHG</span>
        </div>
        {coins.map(c => (
          <div key={c.s} className="tick-row">
            <span className="tick-sym">{c.s}</span>
            <span className="tick-spark">
              <svg viewBox="0 0 80 22" preserveAspectRatio="none">
                <polyline fill="none" stroke={c.chg >= 0 ? 'var(--good)' : 'var(--accent-soft)'} strokeWidth="1.2" points={spark(c.seed)} />
              </svg>
            </span>
            <span className="tick-price">${c.price.toLocaleString('en-US')}</span>
            <span className={`tick-chg ${c.chg < 0 ? 'down' : ''}`}>{c.chg >= 0 ? '+' : ''}{c.chg}%</span>
          </div>
        ))}
        <div style={{
          marginTop: 4, padding: '8px 14px',
          fontSize: 10.5, color: 'var(--text-faint)',
          display: 'flex', justifyContent: 'space-between',
        }}>
          <span>feed: marcelis-scanner/v3.2</span>
          <span style={{ color: 'var(--good)' }}>● live</span>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// 6. CONTACT FORM - Message submission
// ───────────────────────────────────────────────────────────────────────────
// Form to send inquiries with name, email, subject, and message

function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <div className="contact-grid">
      <form className="glass contact-card" onSubmit={e => { e.preventDefault(); setSent(true); }}>
        <div className="eyebrow" style={{ marginBottom: 24 }}>Stuur een bericht</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="form-field"><label>Naam</label><input placeholder="Jouw naam" /></div>
          <div className="form-field"><label>E-mail</label><input type="email" placeholder="jij@voorbeeld.nl" /></div>
        </div>
        <div className="form-field">
          <label>Onderwerp</label>
          <input placeholder="Bijv. Smart Energy offerte, support, …" />
        </div>
        <div className="form-field">
          <label>Bericht</label>
          <textarea placeholder="Vertel kort waar ik mee kan helpen…" />
        </div>
        <button className="btn-primary" type="submit" style={{ border: 'none', cursor: 'pointer', width: '100%', justifyContent: 'center' }}>
          {sent ? '✓ Verzonden — ik reageer snel' : 'Verstuur bericht'}
          {!sent && <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10m0 0L9 4m4 4l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </button>
      </form>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// 7. TWEAKS PANEL - Live UI Controls
// ───────────────────────────────────────────────────────────────────────────
// Debug panel for testing color palettes and layout variants

function TweaksPanel({ open, values, onChange }) {
  if (!open) return null;
  return (
    <div className="tweaks-panel on">
      <div className="tweaks-head">
        <div className="t">Tweaks</div>
        <span style={{ color: 'var(--text-faint)', fontSize: 10 }}>live</span>
      </div>

      <div className="tweaks-group">
        <div className="lbl">Color palette</div>
        <div className="tweaks-swatches">
          <button
            className={values.palette === 'electric' ? 'on' : ''}
            onClick={() => onChange('palette', 'electric')}
            style={{ background: 'linear-gradient(90deg, #007fff, #0000ff)' }}
            title="Electric (default)"
          />
          <button
            className={values.palette === 'cyan' ? 'on' : ''}
            onClick={() => onChange('palette', 'cyan')}
            style={{ background: 'linear-gradient(90deg, #22d3ee, #0066ff)' }}
            title="Cyan"
          />
          <button
            className={values.palette === 'crimson' ? 'on' : ''}
            onClick={() => onChange('palette', 'crimson')}
            style={{ background: 'linear-gradient(90deg, #ff4d6d, #c4005b)' }}
            title="Crimson"
          />
          <button
            className={values.palette === 'amber' ? 'on' : ''}
            onClick={() => onChange('palette', 'amber')}
            style={{ background: 'linear-gradient(90deg, #fbbf24, #d97706)' }}
            title="Amber"
          />
        </div>
      </div>

      <div className="tweaks-group">
        <div className="lbl">IT-diensten layout</div>
        <div className="tweaks-options">
          <button className={values.servicesLayout === 'mosaic' ? 'on' : ''} onClick={() => onChange('servicesLayout', 'mosaic')}>Mosaic</button>
          <button className={values.servicesLayout === 'rows' ? 'on' : ''} onClick={() => onChange('servicesLayout', 'rows')}>2-kolom</button>
        </div>
      </div>

      <div className="tweaks-group">
        <div className="lbl">Smart Energy layout</div>
        <div className="tweaks-options">
          <button className={values.energyLayout === 'split' ? 'on' : ''} onClick={() => onChange('energyLayout', 'split')}>Split</button>
          <button className={values.energyLayout === 'stacked' ? 'on' : ''} onClick={() => onChange('energyLayout', 'stacked')}>Gestapeld</button>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 8. COMPONENT EXPORTS - Global accessibility
// ═════════════════════════════════════════════════════════════════════════════
// Make all components available globally for React rendering

Object.assign(window, {
  HeroVisual, Services, EnergySection, CryptoCard, Contact, TweaksPanel,
});
