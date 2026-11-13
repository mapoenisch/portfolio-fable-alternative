# Portfolio Marc Pönisch – Variante „Werkplan“

Alternative Designvariante des Bewerbungsportfolios. Inhalte, Zahlen, Nachweise und Demos stammen unverändert aus dem Hauptportfolio (`~/Projekte/RevOpsPortfolio/gtm-portfolio`); neu ist nur die Gestaltung.

## Starten

```bash
npm install
npm run dev      # http://127.0.0.1:4318/
npm run check    # Tests und Build
```

## Aufbau

- `src/App.tsx` – Seiten: Übersicht, drei Case-Blätter, Nachweise, Hinweise
- `src/LeadPilotChronik.tsx` – Projektchronik
- `src/Demos.tsx`, `demos/` – Routing- und Prospecting-Demo
- `src/content.ts` – alle Texte und Zahlen
- `src/werkplan.css` – das gesamte Design
- `DESIGN.md` – Designsystem dieser Variante
