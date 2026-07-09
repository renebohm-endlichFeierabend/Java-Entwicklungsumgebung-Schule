# 🛠️ KI-Werkstatt — Lernstationen zu künstlicher Intelligenz

Interaktive Stationen für den **Unterricht** (ab Sek I/II) und für
**Lehrkräfte-Fortbildungen**: verstehen, wie KI funktioniert — durch
Ausprobieren statt Vortrag.

**Grundprinzipien:**

- 🧩 **Buildfrei & offline:** reines HTML/CSS/JavaScript, kein Build-Schritt,
  keine externen Dienste. Repo herunterladen, `index.html` doppelklicken —
  läuft, auch ohne Internet, im Schulnetz und auf dem iPad.
- 🔒 **Datenschutzfreundlich:** alles rechnet lokal im Browser, keine Daten
  verlassen das Gerät, keine Anmeldung.
- 🧑‍🏫 **Didaktik eingebaut:** jede Station hat einen Kasten „Für Lehrkräfte"
  mit Leitfragen, Zeitbedarf und Kernbotschaft.
- 🎯 **Kompetenzorientiert:** jede Station trägt Etiketten der Kompetenzcluster
  **K1–K8**, hergeleitet aus KMK-Handlungsempfehlung KI (2024), UNESCO AI
  Competency Framework for Students (2024) und EU-OECD AILit Framework (2026)
  — siehe [KOMPETENZRAHMEN-KI.md](KOMPETENZRAHMEN-KI.md).

## Nutzung

**Lokal:** Repo als ZIP herunterladen (grüner „Code"-Knopf → *Download ZIP*),
entpacken, `index.html` im Browser öffnen. Fertig.

**Online:** Der Branch wird per GitHub Actions auf GitHub Pages veröffentlicht
(siehe `.github/workflows/pages.yml`).

## Stationen

| # | Station | Status | Hauptkompetenzen |
|---|---------|--------|------------------|
| 1 | **LLM zum Anfassen** — Tokenizer & Nächstes-Wort-Spielplatz | ✓ nutzbar | K1 Funktionsweise |
| 2 | **Baue deine eigene KI** — N-Gramm-Textgenerator mit Einblick ins „Gedächtnis" | ✓ nutzbar | K8 Gestalten, K1 |
| 3 | Trainingsdaten & Bias (Kamera-Klassifikator) | geplant | K2 Grenzen, K6 Gesellschaft |
| 4 | Einem neuronalen Netz beim Lernen zusehen | geplant | K1 |
| 5 | Das Prompt-Labyrinth (Prompt-Injection-Spiel) | geplant | K3 Anwenden, K5 Sicherheit |
| 6 | Fakt oder KI? | geplant | K4 Bewerten |
| 7 | KI einsetzen — ja, nein, wie? (Szenario-Spiel) | geplant | K7 Handlungsmacht |
| 8 | KI-Projekt-Canvas | geplant | K8, K7 |

## Projektstruktur

```
index.html                  Startseite: Stationsübersicht + Kompetenzlegende
assets/werkstatt.css        gemeinsames Layout
assets/kompetenzen.js       Kompetenzcluster K1–K8 + Etiketten-Renderer
assets/ngram.js             kleine N-Gramm-Bibliothek (Stationen 1+2)
assets/korpus.js            Übungstext für Station 1
stationen/<name>/           je Station: index.html + station.js
KOMPETENZRAHMEN-KI.md       Recherche: KMK / UNESCO / EU-OECD → Cluster K1–K8
```

**Konventionen für neue Stationen:** keine ES-Module, kein `fetch()` auf
lokale Dateien (beides scheitert bei `file://`), keine CDN-Abhängigkeiten —
Bibliotheken ggf. als Datei ins Repo legen. Jede Station bekommt
Kompetenz-Etiketten (`zeigeKompetenzen(...)`) und einen Didaktik-Kasten.
