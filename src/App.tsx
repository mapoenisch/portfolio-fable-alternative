import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, Download, Layers3, Menu, Plus, X } from 'lucide-react';
import { cases, certificates, profile, type CaseStudy } from './content';
import { RoutingDemo, ProspectingDemo, useProspectReport } from './Demos';
import LeadPilotChronik, { LeadPilotTeaser } from './LeadPilotChronik';
import { AnalysisBlock, RevenueBlock } from './Revenue';

type MediaItem = { src: string; alt: string; caption: string; width?: number; height?: number; description?: string[] };
type CaseMedia = { screenshots: MediaItem[]; diagram?: MediaItem; video?: { src: string; poster: string; subtitles: string; duration: number; captionsBurnedIn?: boolean } };
type MediaManifest = Record<string, CaseMedia>;
function useMedia() {
  const [media, setMedia] = useState<MediaManifest>({});
  useEffect(() => { const controller = new AbortController(); fetch('/data/media.json', { signal: controller.signal }).then(r => r.ok ? r.json() : {}).then(setMedia).catch(() => {}); return () => controller.abort(); }, []);
  return media;
}

/* Jede Route ist ein Blatt des Plansatzes. */
const sheets: { path: string; label: string }[] = [
  { path: '/', label: 'Übersicht' },
  ...cases.map(c => ({ path: `/cases/${c.slug}`, label: c.name })),
  { path: '/nachweise', label: 'Nachweise' },
  { path: '/leadpilot', label: 'Projektchronik' },
  { path: '/hinweise', label: 'Hinweise' },
];
function useSheet() {
  const { pathname } = useLocation();
  const index = sheets.findIndex(s => s.path === pathname);
  return index < 0 ? null : { number: String(index + 1).padStart(2, '0'), total: String(sheets.length).padStart(2, '0'), label: sheets[index].label };
}

function Header() {
  const [open, setOpen] = useState(false); const trigger = useRef<HTMLButtonElement>(null); const location = useLocation(); const sheet = useSheet();
  useEffect(() => { setOpen(false); }, [location]);
  useEffect(() => { const escape = (e: KeyboardEvent) => { if (e.key === 'Escape' && open) { setOpen(false); trigger.current?.focus(); } }; document.addEventListener('keydown', escape); return () => document.removeEventListener('keydown', escape); }, [open]);
  return <>
    <a className="skip-link" href="#inhalt">Zum Inhalt</a>
    <header className="sheet-head">
      <Link className="wordmark" to="/" aria-label="Marc Pönisch – Startseite"><span className="wordmark-mark" aria-hidden="true">MP</span><span>Marc Pönisch</span></Link>
      <button ref={trigger} className="menu-toggle" aria-label={open ? 'Menü schließen' : 'Menü öffnen'} aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen(!open)}>{open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
      <nav id="main-nav" className={open ? 'nav-open' : ''} aria-label="Hauptnavigation">
        <a href="/#arbeitsproben">Arbeitsproben</a>
        <a href="/#profil">Über mich</a>
        <NavLink to="/nachweise">Nachweise</NavLink>
        <a className="nav-contact" href="/#kontakt">Kontakt</a>
      </nav>
      {sheet && <p className="sheet-no" aria-label={`Seite ${Number(sheet.number)} von ${Number(sheet.total)}: ${sheet.label}`}><span>Blatt</span><strong>{sheet.number}</strong><span>/ {sheet.total}</span></p>}
    </header>
  </>;
}

/* Das Schriftfeld schließt jedes Blatt ab, wie auf einem Plan unten rechts. */
function Footer() {
  const sheet = useSheet();
  return <footer className="title-block">
    <dl>
      <div className="tb-wide"><dt>Verfasser</dt><dd><strong>Marc Pönisch</strong> Vertriebspraxis. Klare Prozesse. Digitale Umsetzung.</dd></div>
      <div><dt>Ort</dt><dd>{profile.city}</dd></div>
      <div><dt>Blatt</dt><dd>{sheet ? `${sheet.number} · ${sheet.label}` : '–'}</dd></div>
      <div><dt>Copyright</dt><dd>© 2026</dd></div>
      <div><dt>Anlage</dt><dd><Link to="/hinweise">Hinweise & Datenschutz</Link></dd></div>
    </dl>
  </footer>;
}

function Contact() {
  return <section id="kontakt" className="contact-section">
    <div className="contact-copy">
      <h2>Gute Prozesse beginnen mit einem Gespräch.</h2>
      <p>Du suchst jemanden, der Vertrieb aus der Praxis kennt und digitale Prozesse direkt im System umsetzt? Dann lass uns sprechen.</p>
    </div>
    <div className="contact-actions">
      <a className="button on-red" href={`mailto:${profile.email}`}>Kontakt aufnehmen <ArrowUpRight size={18} aria-hidden="true" /></a>
      <a className="contact-link" href={profile.linkedin} target="_blank" rel="noreferrer">Auf LinkedIn vernetzen <ArrowUpRight size={18} aria-hidden="true" /></a>
      <a className="contact-link" href={profile.github} target="_blank" rel="noreferrer">Projekte auf GitHub <ArrowUpRight size={18} aria-hidden="true" /></a>
    </div>
  </section>;
}

/* Schnitt durch den Funnel: Stufenhöhe nach Wurzel des Wertes, die Maßkette nennt die echten Zahlen. */
const funnel = cases[0].revenue!.funnel;
const stageHeights = funnel.map(step => Math.sqrt(step.value / funnel[0].value));
const outline = (() => {
  const top: string[] = []; const bottom: string[] = [];
  stageHeights.forEach((h, i) => {
    const x0 = (i / funnel.length) * 100; const x1 = ((i + 1) / funnel.length) * 100;
    const y0 = 50 - h * 50; const y1 = 50 + h * 50;
    top.push(`${x0},${y0}`, `${x1},${y0}`); bottom.unshift(`${x1},${y1}`, `${x0},${y1}`);
  });
  return [...top, ...bottom];
})();
const zones = [
  'Der gesamte Funnel bis zur Kundenbindung',
  'Am Eingang: prüfen, zuordnen, Folgeaufgabe anlegen',
  'Vor dem Erstkontakt: Profile nach Kriterien priorisieren',
];

function FunnelPlan() {
  const [active, setActive] = useState<number | null>(null);
  const hover = (index: number | null) => ({ onMouseEnter: () => setActive(index), onMouseLeave: () => setActive(null), onFocus: () => setActive(index), onBlur: () => setActive(null) });
  return <div className={`plan ${active !== null ? `plan-active-${active + 1}` : ''}`}>
    <figure className="plan-figure">
      <div className="plan-span" aria-hidden="true"><span className="bubble">01</span></div>
      <div className="plan-body" aria-hidden="true">
        <div className="plan-inflow"><span className="bubble">03</span><i /></div>
        <div className="plan-section">
          <div className="plan-hatch" style={{ clipPath: `polygon(${outline.map(p => p.split(',').map(n => `${n}%`).join(' ')).join(',')})` }} />
          <div className="plan-entry" style={{ height: `${stageHeights[0] * 100}%`, width: `${100 / funnel.length}%` }} />
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
            <polygon className="plan-outline" points={outline.join(' ')} pathLength={1} />
            {stageHeights.slice(1).map((h, i) => <line className="plan-joint" key={i} x1={((i + 1) / funnel.length) * 100} x2={((i + 1) / funnel.length) * 100} y1={50 - h * 50} y2={50 + h * 50} pathLength={1} />)}
            <line className="plan-axis" x1="-3" x2="103" y1="50" y2="50" />
          </svg>
          <span className="bubble plan-bubble-entry">02</span>
        </div>
      </div>
      <ol className="plan-chain" aria-label="Sales Funnel 2025 im LeadPilot-Szenario">
        {funnel.map(step => <li key={step.stage}><span className="chain-stage">{step.stage}</span><strong>{step.value.toLocaleString('de-DE')}</strong><small>{step.rate ? <><span className="sr-only">Conversion zur Vorstufe: </span>{step.rate}</> : <span aria-hidden="true">Start</span>}</small></li>)}
      </ol>
      <figcaption><strong>Schnitt A–A · Sales Funnel 2025</strong><span>Nicht maßstäblich. Zahlen aus dem LeadPilot-Szenario, einem fiktiven Unternehmen. Prozentwerte: Conversion zur Vorstufe.</span></figcaption>
    </figure>
    <ol className="plan-legend" aria-label="Die drei Arbeitsproben im Funnel">
      {cases.map((project, i) => <li key={project.slug} className={active === i ? 'on' : ''}>
        <Link to={`/cases/${project.slug}`} {...hover(i)}>
          <span className="bubble" aria-hidden="true">{project.number}</span>
          <span className="legend-text"><strong>{project.name}</strong><span>{zones[i]}</span></span>
          <ArrowRight size={18} strokeWidth={1.6} aria-hidden="true" />
        </Link>
      </li>)}
    </ol>
  </div>;
}

function PositionRow({ project, media }: { project: CaseStudy; media?: CaseMedia }) {
  const image = media?.screenshots[0];
  return <article className="pos-row">
    <span className="bubble bubble-lg" aria-hidden="true">{project.number}</span>
    <div className="pos-text">
      <h3><Link to={`/cases/${project.slug}`}>{project.name}</Link></h3>
      <p className="pos-meta"><span>{project.category}</span><span className="status-label">{project.status}</span></p>
      <p>{project.short}</p>
      <p className="pos-decision"><span className="rev-mark" aria-hidden="true" /><span><strong>Meine Entscheidung:</strong> {project.decisions[0].title}.</span></p>
      <Link to={`/cases/${project.slug}`} className="text-link" aria-label={`${project.name}: Arbeitsprobe ansehen`}>Arbeitsprobe ansehen <ArrowRight size={16} aria-hidden="true" /></Link>
    </div>
    <Link className="pos-view" to={`/cases/${project.slug}`} tabIndex={-1} aria-hidden="true">
      {image ? <img src={image.src} alt="" loading="lazy" width="1440" height="1000" /> : <span className="pos-view-empty">{project.name}</span>}
    </Link>
  </article>;
}

function Home() {
  const media = useMedia();
  return <div className="home-page">
    <section className="hero">
      <div className="hero-copy">
        <h1 tabIndex={-1}>Vertrieb kennen. Prozesse <em>weiterdenken.</em></h1>
        <p className="hero-description">Ich komme aus dem B2B-Vertrieb. Heute verbinde ich diese Erfahrung mit CRM, Daten und KI – und baue digitale Vertriebsprozesse in eigenen Praxisprojekten direkt nach.</p>
        <div className="hero-actions"><a className="button" href="#arbeitsproben">Arbeitsproben ansehen <ArrowDown size={17} aria-hidden="true" /></a><a className="button quiet" href={profile.resume} target="_blank" rel="noreferrer">Lebenslauf als PDF <ArrowUpRight size={17} aria-hidden="true" /></a></div>
        <dl className="hero-person">
          <div className="hero-portrait"><img src="/images/marc.webp" alt="Marc Pönisch" width="96" height="96" /></div>
          <div><dt>Name</dt><dd>Marc Pönisch</dd></div>
          <div><dt>Ort</dt><dd>Leipzig</dd></div>
          <div><dt>Schwerpunkt</dt><dd>B2B-Vertrieb & CRM</dd></div>
          <div><dt>Aktuell</dt><dd>Weiterbildung zum Digital Sales Manager</dd></div>
        </dl>
      </div>
      <FunnelPlan />
    </section>

    <section id="arbeitsproben" className="positions-section" aria-labelledby="projects-title">
      <div className="section-heading"><h2 id="projects-title">Drei Arbeitsproben. Entscheidungen zum Nachprüfen.</h2><p>Umsatz analysieren, Anfragen sauber übergeben und passende Profile priorisieren – mit Umsetzung, Ergebnissen und klar benannten Grenzen.</p></div>
      <div className="pos-list">{cases.map(project => <PositionRow project={project} media={media[project.slug]} key={project.slug} />)}</div>
    </section>

    <section className="detail-section" aria-label="Routing-Demo zum Ausprobieren">
      <div className="detail-note">
        <p className="drawing-title"><strong>Detail zu Position 02</strong><span>M 1:1 · läuft im Browser</span></p>
        <p>Vier Testfälle zeigen die Verarbeitung derselben synthetischen Anfrage. Die Demo greift auf kein externes CRM zu.</p>
        <Link className="text-link" to="/cases/lead-routing">Zur vollständigen Routing-Arbeitsprobe <ArrowRight size={16} aria-hidden="true" /></Link>
      </div>
      <RoutingDemo compact />
    </section>

    <section id="profil" className="about-section">
      <div className="about-portrait"><img src="/images/marc.webp" alt="Marc Pönisch, kaufmännischer Hintergrund im B2B-Vertrieb" width="480" height="480" loading="lazy" /><span>Marc Pönisch · Leipzig</span></div>
      <div className="about-copy">
        <h2>Gelernt am Telefon und im ERP-System.</h2>
        <p className="large-copy">Bei der Raiffeisen Waren GmbH in Erfurt habe ich über 30 Stammkunden aus dem Baustoffhandel betreut und jede Woche mehr als 20 Angebote geschrieben. Nachgefasst habe ich am Telefon.</p>
        <p>Mit der Zusage des Kunden ging die Arbeit erst richtig los: Aufträge abwickeln, Lieferungen mit Kunden, Lieferanten und Lager abstimmen, Gutschriften und Rechnungsabweichungen prüfen, damit Fehler nicht erst nach der Buchung auffallen, und die Stammdaten im ERP aktuell halten. Den Außendienst habe ich mit Preisabfragen bei Zulieferern unterstützt; im Einkauf habe ich Angebote von 30 Lieferanten verglichen und verhandelt.</p>
        <p>Seit dem 18. Mai 2026 mache ich in Vollzeit die Weiterbildung zum Digital Sales Manager und arbeite dort mit HubSpot und Salesforce. Für die Arbeitsproben oben lege ich die fachlichen Regeln fest und lasse KI-Coding-Agenten den Code schreiben; ob das Ergebnis stimmt, prüfe ich selbst.</p>
        <p>Ob die Stelle dann Inside Sales oder Sales Operations heißt, ist mir weniger wichtig als zwei Dinge: dass ich mit Kunden zu tun habe und dass die Daten im CRM stimmen.</p>
        <table className="index-table">
          <caption>Stationen</caption>
          <thead><tr><th scope="col">Zeitraum</th><th scope="col">Station</th><th scope="col">Ort</th></tr></thead>
          <tbody>
            <tr><td>2019–2024</td><th scope="row">Ausbildung & B2B-Kundenbetreuung</th><td>Raiffeisen Waren GmbH, Erfurt</td></tr>
            <tr><td>2025</td><th scope="row">Fachberater</th><td>OBI, Jena</td></tr>
            <tr><td>Seit Mai 2026</td><th scope="row">Digital Sales Manager</th><td>Vollzeit-Weiterbildung · remote</td></tr>
          </tbody>
        </table>
        <a className="text-link" href={profile.resume} target="_blank" rel="noreferrer">Lebenslauf als PDF <ArrowUpRight size={17} aria-hidden="true" /></a>
      </div>
    </section>

    <section className="qualifications-section" aria-labelledby="qualifications-title">
      <div className="section-heading"><h2 id="qualifications-title">Wissen mit Grundlage.</h2><p>Ausgewählte Zertifikate aus meiner Weiterbildung und ergänzenden Kursen.</p></div>
      <ul className="attachment-list">{certificates.slice(0, 3).map(c => <li key={c.file}><a href={`/nachweise/${c.file}`} target="_blank" rel="noreferrer"><span className="att-issuer">{c.issuer}</span><strong>{c.title}</strong><span className="att-kind">{c.kind}{c.date && ` · ${c.date.slice(-4)}`}</span><ArrowUpRight size={18} strokeWidth={1.6} aria-hidden="true" /></a></li>)}</ul>
      <Link className="text-link" to="/nachweise">Alle Nachweise ansehen <ArrowRight size={17} aria-hidden="true" /></Link>
    </section>

    <LeadPilotTeaser />
    <Contact />
  </div>;
}

function ImageViewer({ items }: { items: MediaItem[] }) {
  const dialog = useRef<HTMLDialogElement>(null); const [active, setActive] = useState<MediaItem | null>(null);
  if (!items.length) return <div className="pending-media"><Layers3 size={25} aria-hidden="true" /><h3>Aktuelle Anwendungsaufnahmen folgen.</h3><p>Aufgenommen wird eine regulär angemeldete Sitzung. Bis dahin beschreiben die Texte den geprüften Quellstand.</p></div>;
  return <>
    <div className="screenshot-grid">{items.map(item => <figure key={item.src}><button className="screenshot-button" onClick={() => { setActive(item); dialog.current?.showModal(); }} aria-label={`${item.caption} vergrößern`}><img src={item.src} alt={item.alt} loading="lazy" width="1440" height="1000" /><span><Plus size={18} aria-hidden="true" /></span></button><figcaption>{item.caption}</figcaption></figure>)}</div>
    <dialog ref={dialog} className="image-dialog" aria-label={active?.caption || 'Arbeitsprobe vergrößert'} onClick={e => { if (e.target === dialog.current) dialog.current.close(); }}><button className="dialog-close" onClick={() => dialog.current?.close()} aria-label="Bildansicht schließen"><X aria-hidden="true" /></button>{active && <><img src={active.src} alt={active.alt} /><p>{active.caption}</p></>}</dialog>
  </>;
}

function DiagramViewer({ item }: { item: MediaItem }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const open = () => { setZoom(window.innerWidth < 768 ? 2.5 : 1); dialog.current?.showModal(); requestAnimationFrame(() => { if (stage.current) { stage.current.scrollTop = 0; stage.current.scrollLeft = Math.max(0, (stage.current.scrollWidth - stage.current.clientWidth) / 2); } }); };
  return <div className="diagram-viewer">
    <figure><button type="button" className="diagram-trigger" onClick={open} aria-label={`${item.caption} vergrößern`}><img src={item.src} alt={item.alt} width={item.width} height={item.height} loading="lazy" /><span><Plus size={17} aria-hidden="true" />Diagramm vergrößern</span></button><figcaption>{item.caption}</figcaption></figure>
    {!!item.description?.length && <details className="diagram-description"><summary>Diagramm als Text <ChevronDown size={16} aria-hidden="true" /></summary><ol>{item.description.map(text => <li key={text}>{text}</li>)}</ol></details>}
    <a className="text-link diagram-download" href={item.src} download>SVG herunterladen <Download size={15} aria-hidden="true" /></a>
    <dialog ref={dialog} className="diagram-dialog" aria-label="Diagramm vergrößert" onClick={event => { if (event.target === dialog.current) dialog.current.close(); }}>
      <div className="diagram-toolbar"><div role="group" aria-label="Diagrammgröße"><button type="button" onClick={() => setZoom(value => Math.max(1, value - .5))} disabled={zoom === 1} aria-label="Diagramm verkleinern">−</button><output aria-live="polite">{Math.round(zoom * 100)} %</output><button type="button" onClick={() => setZoom(value => Math.min(4, value + .5))} disabled={zoom === 4} aria-label="Diagramm weiter vergrößern">+</button><button type="button" className="diagram-fit" onClick={() => setZoom(1)}>Einpassen</button></div><button type="button" className="diagram-close" onClick={() => dialog.current?.close()} aria-label="Diagrammansicht schließen"><X size={20} aria-hidden="true" /></button></div>
      <p className="diagram-pan-hint">Vergrößerte Ansichten lassen sich horizontal und vertikal verschieben.</p>
      <div ref={stage} className="diagram-stage" tabIndex={0} aria-label="Verschiebbarer Diagrammausschnitt"><img src={item.src} alt={item.alt} width={item.width} height={item.height} style={{ width: `${zoom * 100}%` }} /></div>
      <p className="diagram-dialog-caption">{item.caption}</p>
    </dialog>
  </div>;
}

function Walkthrough({ project, media }: { project: CaseStudy; media?: CaseMedia }) {
  const captions = project.slug === 'leadpilot' ? ['Die Umsatzlücke 2025 benennen und im Funnel den Engpass in der Testphase finden.', 'Die Hebel Trial-Conversion und Kundenbindung belegen, Unit Economics einordnen und die Simulation starten.', 'Beide Szenarien vergleichen, die Datenherkunft aus Supabase und n8n live zeigen und den Plan 2026 ableiten.'] : project.slug === 'lead-routing' ? ['Eine vollständige synthetische Anfrage prüfen und die Zuständigkeit erklären.', 'Den doppelten Eingang testen. Ein Kontakt und eine Folgeaufgabe bleiben erhalten.', 'Fehlende Angaben und einen CRM-Fehler zeigen. Den Weg über n8n und HubSpot einordnen.'] : ['Den Datensatz aus 50 synthetischen Profilen und das Zielkundenbild erklären.', 'Priorisierte und ausgesonderte Profile vergleichen. Die sechs Kriterien einzeln aufschlüsseln.', 'Den gespeicherten KI-Kontext und Kontaktentwurf zeigen. Modellantwort und Regelbewertung trennen.'];
  return <div className="walkthrough">
    <h3 className="drawing-title"><strong>Der Ablauf im Überblick</strong><span>in etwa 90 Sekunden</span></h3>
    {media?.video && <video key={project.slug} controls preload="none" poster={media.video.poster} aria-label={`Portfolio-Walkthrough: ${project.name}`}><source src={media.video.src} type="video/mp4" /><track kind="captions" src={media.video.subtitles} srcLang="de" label="Deutsch" default={!media.video.captionsBurnedIn} /></video>}
    <details open={!media?.video}><summary>{media?.video ? 'Text zum Walkthrough' : 'Walkthrough lesen'}<ChevronDown size={18} aria-hidden="true" /></summary><ol>{captions.map((c, i) => <li key={c}><span>{['00:00–00:20', '00:20–01:00', '01:00–01:30'][i]}</span><p>{c}</p></li>)}</ol>{!media?.video && <p className="section-note">Das Ablaufskript ist vorbereitet. Eine Videoaufnahme liegt noch nicht vor.</p>}</details>
  </div>;
}

function SectionHead({ number, label, title }: { number: string; label: string; title: string }) {
  return <header className="sec-head"><span className="bubble" aria-hidden="true">{number}</span><div><h2>{title}</h2><p>{label}</p></div></header>;
}

function CasePage() {
  const { slug } = useParams(); const project = cases.find(c => c.slug === slug); const media = useMedia(); const report = useProspectReport();
  if (!project) return <NotFound />;
  const currentMedia = media[project.slug];
  const shift = project.revenue || project.analysis ? 1 : 0; const label = (n: number) => String(n + (n > 1 ? shift : 0)).padStart(2, '0');
  const status = project.slug === 'ki-prospecting' && report?.status === 'local-ai-verified' ? 'Lokale KI-Auswertung durchgeführt' : project.status;
  return <article className="case-page">
    <section className="case-hero">
      <Link className="back-link" to="/#arbeitsproben"><ArrowLeft size={16} aria-hidden="true" /> Alle Arbeitsproben</Link>
      <div className="case-hero-grid">
        <div>
          <h1 tabIndex={-1}>{project.title}</h1>
          <p className="case-lead">{project.short}</p>
        </div>
        <dl className="case-meta">
          <div><dt>Position</dt><dd>Case {project.number} · {project.category}</dd></div>
          <div><dt>Stand</dt><dd><span className="status-label">{status}</span></dd></div>
          <div><dt>Kontext</dt><dd>{project.slug === 'leadpilot' ? 'Fiktives B2B-Unternehmen' : 'Eigenständige Erweiterungsdemo'}</dd></div>
          <div><dt>Mein Beitrag</dt><dd>Konzept, Anforderungen & Prüfung</dd></div>
          <div><dt>Umsetzung</dt><dd>Mit KI-Coding-Agenten</dd></div>
          <div><dt>Werkzeuge</dt><dd><ul className="tech-list">{project.stack.map(t => <li key={t}>{t}</li>)}</ul></dd></div>
        </dl>
      </div>
    </section>
    <div className="case-body">
      <nav className="case-toc" aria-label="In dieser Fallstudie"><span>In dieser Fallstudie</span><a href="#ausgangslage">Ausgangslage</a>{(project.revenue || project.analysis) && <a href="#analyse">Analyse</a>}<a href="#loesungsweg">Lösungsweg</a><a href="#arbeitsprobe">Arbeitsprobe</a><a href="#mein-beitrag">Mein Beitrag</a><a href="#ergebnis">Ergebnis & Grenzen</a></nav>
      <div className="case-sections">
        <section id="ausgangslage"><SectionHead number="01" label="Die Ausgangslage" title="Welche Frage dahintersteht." /><p>{project.problem}</p><div className="goal-block"><strong>Das Ziel</strong><p>{project.goal}</p></div></section>
        {project.revenue && <section id="analyse"><SectionHead number="02" label="Die Analyse" title="Wo LeadPilot Umsatz verliert." /><RevenueBlock data={project.revenue} /></section>}
        {project.analysis && <section id="analyse"><SectionHead number="02" label="Die Analyse" title={project.analysis.heading} /><AnalysisBlock data={project.analysis} /></section>}
        <section id="loesungsweg"><SectionHead number={label(2)} label="Der Lösungsweg" title="Entscheidungen vor Werkzeugen." />
          <ol className="decision-list">{project.decisions.map((d, i) => <li key={d.title}><span className="rev-mark" aria-hidden="true">{i + 1}</span><div><h3>{d.title}</h3><p>{d.text}</p></div></li>)}</ol>
          {currentMedia?.diagram ? <DiagramViewer key={currentMedia.diagram.src} item={currentMedia.diagram} /> : <div className="diagram-slot"><Layers3 size={28} aria-hidden="true" /><div><h3>Architekturdiagramm in Vorbereitung</h3><p>Der Ablauf ist oben beschrieben. Die grafische Darstellung wird ergänzt.</p></div></div>}
        </section>
        <section id="arbeitsprobe"><SectionHead number={label(3)} label="Die Arbeitsprobe" title="Den Ablauf greifbar machen." />
          {project.slug === 'lead-routing' ? <>
            <p>Vier Testfälle zeigen die Verarbeitung derselben synthetischen Anfrage. Die Demo greift auf kein externes CRM zu.</p>
            <RoutingDemo />
            <div className="run-evidence"><Check size={18} aria-hidden="true" /><div><strong>Separater n8n-/HubSpot-Test bestanden</strong><p>Zwei synthetische Anfragen über Webhook und Gateway verarbeitet. Je ein Kontakt und eine verknüpfte Aufgabe, auch nach Wiederholungen.</p><a className="text-link" href="/data/routing-report.json" download>Testbericht herunterladen <Download size={16} aria-hidden="true" /></a></div></div>
          </> : project.slug === 'ki-prospecting' ? <>
            <p>Wähle ein Testprofil und prüfe, wie die Bewertung entsteht. Die KI-Texte stammen aus dem gespeicherten Laufbericht.</p>
            <ProspectingDemo />
            {report && <div className="run-evidence"><Check size={18} aria-hidden="true" /><div><strong>{report.status === 'local-ai-verified' ? 'Lokaler Modelllauf dokumentiert' : 'Stand des gespeicherten Testlaufs'}</strong><p>{report.stats.aiValid} gültige KI-Einschätzungen · {report.stats.drafts} Kontaktentwürfe · {report.stats.aiErrors} Fehler. {report.model ? `Modell: ${report.model}.` : 'Modellschritt noch nicht ausgeführt.'} Cloud-Aufrufe: {report.stats.cloudCalls}.</p></div></div>}
          </> : <ImageViewer items={currentMedia?.screenshots || []} />}
          <Walkthrough project={project} media={currentMedia} />
        </section>
        <section id="mein-beitrag"><SectionHead number={label(4)} label="Mein Beitrag" title="Fachlich führen. Mit KI umsetzen." /><ul className="contribution-list">{project.contribution.map(c => <li key={c}><Check size={18} aria-hidden="true" /><span>{c}</span></li>)}</ul><p className="small-copy">Ich baue mit KI-Coding-Agenten. Anforderungen, fachliche Regeln und die Abnahme der Ergebnisse verantworte ich selbst.</p></section>
        <section id="ergebnis"><SectionHead number={label(5)} label="Ergebnis & Einordnung" title="Was dabei herausgekommen ist." />
          <ul className="result-list">{project.results.map(r => <li key={r}>{r}</li>)}</ul>
          <div className="boundary-note"><strong>Einordnung</strong><p>{project.limits}</p></div>
          <h3>Was ich daraus mitnehme</h3>
          <ol className="learning-list">{project.learnings.map(l => <li key={l}>{l}</li>)}</ol>
          <details className="sources"><summary>Quellgrundlage ansehen <ChevronDown size={17} aria-hidden="true" /></summary><ul>{project.sources.map(s => <li key={s}>{s}</li>)}</ul>{project.slug === 'lead-routing' && <a href="/downloads/lead-routing.n8n.json" download className="text-link">n8n-Workflow herunterladen <Download size={16} aria-hidden="true" /></a>}{project.slug === 'ki-prospecting' && <a href="/data/prospecting-report.json" download className="text-link">Laufbericht herunterladen <Download size={16} aria-hidden="true" /></a>}</details>
        </section>
      </div>
    </div>
    {project.slug === 'leadpilot' && <div className="lp-case-crosslink"><p>Die Geschichte von LeadPilot – von der ersten Idee bis zum Designsystem.</p><Link className="text-link" to="/leadpilot">Zur Projektchronik <ArrowRight size={16} aria-hidden="true" /></Link></div>}
    <nav className="next-case" aria-labelledby="next-case-title"><h2 id="next-case-title">Weiter entdecken</h2>{cases.filter(c => c.slug !== slug).map(c => <Link to={`/cases/${c.slug}`} key={c.slug}><span className="bubble" aria-hidden="true">{c.number}</span><strong>{c.name}</strong><ArrowRight size={19} strokeWidth={1.6} aria-hidden="true" /></Link>)}</nav>
    <Contact />
  </article>;
}

function Certificates() {
  const [topic, setTopic] = useState('Alle'); const topics = ['Alle', ...new Set(certificates.map(c => c.topic))]; const filtered = certificates.filter(c => topic === 'Alle' || c.topic === topic);
  return <div className="certificates-page">
    <Link className="back-link" to="/"><ArrowLeft size={16} aria-hidden="true" /> Zur Startseite</Link>
    <h1 tabIndex={-1}>Wissen mit Grundlage.</h1>
    <p className="case-lead">Ausgewählte Originalnachweise zu CRM, Vertrieb, Reporting und KI. Die Art des Nachweises ist jeweils benannt.</p>
    <div className="filter-buttons" role="group" aria-label="Nachweise nach Thema filtern">{topics.map(t => <button key={t} aria-pressed={t === topic} className={topic === t ? 'active' : ''} onClick={() => setTopic(t)}>{t}</button>)}</div>
    <p className="result-caption" aria-live="polite">{filtered.length} Nachweise</p>
    <ul className="certificate-list">{filtered.map(c => <li key={c.file}>
      <span className="certificate-provider">{c.issuer}</span>
      <div className="certificate-main"><h2>{c.title}</h2><p>{c.text}</p></div>
      <div className="certificate-meta"><span>{c.kind}</span>{c.date && <span>Ausgestellt: {c.date}</span>}{c.until && <span>Gültig bis: {c.until}</span>}</div>
      <a href={`/nachweise/${c.file}`} target="_blank" rel="noreferrer" className="text-link" aria-label={`${c.title}: Originalnachweis öffnen`}>Originalnachweis öffnen <ArrowUpRight size={17} aria-hidden="true" /></a>
    </li>)}</ul>
    <div className="boundary-note"><strong>Weiterbildung läuft.</strong><p>Die Weiterbildung zum Digital Sales Manager läuft seit dem 18.05.2026. Der Abschluss ist für Februar 2027 geplant.</p></div>
  </div>;
}

function Notes() { return <div className="legal-page"><h1 tabIndex={-1}>Hinweise zu diesem Portfolio.</h1><h2>Lokale Vorschau</h2><p>Diese Fassung ist zur lokalen Durchsicht gedacht. Es ist keine öffentliche Veröffentlichung erfolgt. Öffentliche Anbieterangaben werden vor einer Veröffentlichung ergänzt.</p><h2>Person und Kontakt</h2><p>Marc Pönisch · Leipzig<br /><a href={`mailto:${profile.email}`}>{profile.email}</a></p><h2>Projekte und Beispieldaten</h2><p>LeadPilot ist ein fiktives Unternehmen. Die weiteren Demos nutzen erfundene Testdaten. Sie belegen keine realen Kundenergebnisse. Der jeweilige Projektstand und offene externe Testläufe werden auf den Case-Seiten erläutert.</p><h2>KI-Unterstützung</h2><p>Konzeption, Texte und Software entstehen mit KI-Unterstützung. Fachliche Anforderungen, Entscheidungen und die Prüfung der Ergebnisse bleiben bei Marc.</p><h2>Datenverarbeitung in der Vorschau</h2><p>Die Website nutzt keine Analyse-Dienste, Tracking-Cookies oder extern geladenen Schriftarten. Die interaktiven Arbeitsproben verarbeiten Eingaben im Browser. Die Website sendet sie weder an HubSpot noch an einen KI-Anbieter. Beim Öffnen externer Links gelten die Bedingungen der jeweiligen Website.</p><h2>Nachweise</h2><p>Die verlinkten Lernnachweise sind Kopien vorhandener Originaldateien. Zertifizierungen, Kursabschlüsse und digitale Badges werden unterschiedlich bezeichnet.</p></div>; }
function NotFound() { return <div className="not-found"><h1 tabIndex={-1}>Hier geht es nicht weiter.</h1><p>Fehler 404: Diese Seite gibt es in diesem Portfolio nicht.</p><Link className="button" to="/">Zur Startseite <ArrowRight size={17} aria-hidden="true" /></Link></div>; }

export default function App() {
  const location = useLocation();
  const previousPath = useRef(location.pathname);
  useEffect(() => {
    const titles: Record<string, string> = { '/': 'Marc Pönisch · B2B-Vertrieb & CRM', '/leadpilot': 'LeadPilot · Projektchronik', '/nachweise': 'Qualifikationen · Marc Pönisch', '/hinweise': 'Hinweise · Marc Pönisch' };
    const project = cases.find(c => location.pathname === `/cases/${c.slug}`);
    document.title = titles[location.pathname] || (project ? `${project.name} · Marc Pönisch` : 'Seite nicht gefunden · Marc Pönisch');
    if (location.hash) { requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView()); }
    else { window.scrollTo(0, 0); if (previousPath.current !== location.pathname) document.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true }); }
    previousPath.current = location.pathname;
  }, [location.pathname, location.hash]);
  return <div className="sheet"><Header /><main id="inhalt"><Routes><Route path="/" element={<Home />} /><Route path="/leadpilot" element={<LeadPilotChronik />} /><Route path="/cases/:slug" element={<CasePage />} /><Route path="/nachweise" element={<Certificates />} /><Route path="/hinweise" element={<Notes />} /><Route path="*" element={<NotFound />} /></Routes></main><Footer /></div>;
}
