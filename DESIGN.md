---
name: "Marc Pönisch – Portfolio, Variante Werkplan"
description: "Die Website als Plansatz: Tusche auf Planpapier, Neubau-Rot für Aktionen."
colors:
  table: "#d3d8ce"
  paper: "#e9ece6"
  sheet: "#f5f7f2"
  ink: "#16191c"
  ink-2: "#474e54"
  red: "#c42b18"
  red-deep: "#9f2010"
  marker: "#f6d31f"
  ok: "#1d6a43"
typography:
  display: { fontFamily: "Barlow Condensed", fontWeight: 600, textTransform: uppercase, lineHeight: 0.98 }
  body: { fontFamily: "Barlow", fontSize: "17px", lineHeight: 1.6 }
  data: { fontFamily: "B612 Mono", fontSize: "12px" }
rounded: { all: "0", bubble: "50%" }
---

# Design System: Werkplan

## Leitidee

Die Seite ist ein Planblatt aus der Baustoff-Welt, aus der Marc kommt. Jede Route ist ein Blatt des Plansatzes (Blatt 01–07, oben rechts). Der Einstieg zeigt den Sales Funnel als Schnittzeichnung mit Maßkette; die drei Arbeitsproben sind Positionsnummern in dieser Zeichnung.

## Farben

- **Planpapier** (`paper`) als Grund, **Blatt** (`sheet`) für Zeichnungs- und Tabellenflächen, **Tisch** (`table`) hinter dem Blatt.
- **Tusche** (`ink`) für Text und alle Linien, `ink-2` für Nebentext.
- **Neubau-Rot** (`red`): Hauptaktion, Entscheidungen (Revisionsdreieck), aktive Zone in der Zeichnung, das Kontaktfeld als ganze Fläche.
- **Markergelb** (`marker`): ausschließlich Hover, Auswahl und Textmarkierung.
- **Grün** (`ok`): nur Statusquadrate und bestandene Prüfungen, immer mit Text.
- LeadPilot-Flächen (dunkles Grün-Türkis) gehören zur Projektidentität und bleiben auf Chronik und Teaser begrenzt.

## Typografie

- Überschriften h1/h2: Barlow Condensed 600, Versalien. h3 gemischt geschrieben.
- Feldbeschriftungen (dt, Tabellenköpfe): Barlow Condensed 500, 13 px, Versalien, Laufweite .08em.
- Fließtext: Barlow, maximal 68 Zeichen Zeilenlänge.
- B612 Mono nur für Positions- und Blattnummern. Zahlen mit Punkt oder Komma laufen in Barlow mit Tabellenziffern, weil die Mono-Schrift dort sperrt.

## Formen und Linien

Keine Rundungen außer Positionskreisen. Rahmen 1.5 px für Blatt, Schriftfelder und Demos, 1 px für Unterteilungen, Haarlinie für Listenzeilen. Gestrichelt heißt Einordnung oder Grenze (z. B. „Einordnung“, Ergebnisfeld der Demo). Schatten nur am Dialog.

## Bausteine

- **Positionskreis** (`.bubble`): Nummer einer Arbeitsprobe oder eines Abschnitts.
- **Zeichnungstitel** (`.drawing-title`): Name mit Unterstrich, Zusatz darunter.
- **Revisionsdreieck** (`.rev-mark`): markiert Entscheidungen.
- **Schriftfeld**: Fußzeile jedes Blatts, Personenfeld im Einstieg, Metadaten der Case-Blätter.
- **Schnitt A–A** (`.plan`): Funnel-Zeichnung; Hover oder Fokus auf eine Position färbt ihre Zone rot.
- **Schraffur**: Balken in Analysen und die Funnel-Flächen.
- Buttons: rot gefüllt (Hauptaktion), Tuscherahmen (Nebenaktion), 48 px hoch. Textlinks mit roter Unterstreichung.

## Bewegung

Ein einziger gestalteter Moment: Die Funnel-Zeichnung wird beim Laden von links nach rechts „geplottet“, die Maßzahlen setzen sich nacheinander. Sonst nur kurze Farbwechsel. Bei reduzierter Bewegung entfällt alles.

## Layout

Blatt maximal 1480 px mit Rahmen; unter 760 px ohne Rahmen und mit Klappmenü. Umbrüche bei 1040 px (einspaltig) und 760 px (mobil). Abschnitte sind durch 1.5-px-Linien getrennt.

## Regeln

- Kein Label über einer Überschrift; Zusätze stehen darunter oder im Schriftfeld.
- Die Planmetapher trägt Struktur, nicht Dekoration: Raster nur auf der Zeichnungsfläche.
- Fiktive Szenariozahlen bleiben in der Bildunterschrift als solche gekennzeichnet.
