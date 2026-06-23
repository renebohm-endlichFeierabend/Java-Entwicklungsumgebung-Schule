# JavaWelt — visuelle Lernumgebung für Java (Prototyp)

Eine web-native Lernumgebung für den Informatik-Unterricht der Oberstufe:
Objekte per Mausklick erzeugen, auf einer Welt platzieren und steuern — und
denselben Effekt mit **echtem Java**-Code erzielen. Ziel: das Gute aus BlueJ
(interaktive Objekte) und Greenfoot (Spielwelt) verbinden, aber **im Browser**
(iPad-tauglich) und **ohne Greenfoots verwirrenden Vererbungszwang**.

> Status: **früher Prototyp / Spike**. Er soll die Machbarkeit zeigen und über
> die Architektur entscheidbar machen — noch kein fertiges Produkt.

## Schnellstart

```bash
npm install
npm run dev      # http://localhost:5173
```

Das läuft sofort mit der **Mock-Laufzeit** (kein Download, kein Server).
Funktioniert ohne Internet und auf dem iPad.

## Was funktioniert (im Sandbox verifiziert)

- **Welt-Engine** (TypeScript/Canvas): Render-Schleife, weiche Bewegung,
  Maus- **und** Touch-Steuerung (Pointer Events → iPad).
- **Objektbank im BlueJ-Stil**: „neue Figur" erzeugt ein Objekt; Methoden
  (`geheVor`, `dreheDich`, `sage`) per Knopf interaktiv aufrufen — **ohne Code**.
- **Platzieren per Klick** auf die Welt; Figuren ziehen.
- **Spielcode-Editor + „Ausführen"** (mit Mock: klar gekennzeichnete Demo-Animation).
- **Klassen-Quelltext** (Fenster unten rechts, optional): Quelltext von `Figur`
  und `Welt` ansehen/ändern. Die Bewegung (`geheVor`) ist jetzt echter,
  lesbarer Java-Code (Trigonometrie) statt einer Black Box.
- **Eigene bewegliche Klassen** („＋ neue Klasse", z. B. `Auto`, `Roboter`):
  Sie `extends Figur` und **erben** die Bewegung – die Mathematik steht nur
  EINMAL in `Figur`. Schüler:innen arbeiten in ihrer kleinen eigenen Klasse,
  ohne die Bewegung anfassen (oder kaputtmachen) zu müssen. **„Zurücksetzen"**
  stellt jede Klasse wieder auf den Ursprungsstand her.
- Sauberer Build (`npm run build`) und Framework-Jar (`npm run build:framework`).

## Was noch zu validieren ist (CheerpJ-Pfad)

Der echte Java-Pfad (`src/java/cheerpjLaufzeit.ts`) ist **vollständig
geschrieben**. Der Eclipse-Compiler liegt jetzt als **`public/ecj.jar`** bei
(Eclipse Compiler for Java, Version 3.33.0), die größte Lücke ist also
geschlossen. CheerpJ selbst konnte im Build-Sandbox trotzdem **nicht
ausgeführt** werden, weil dort das CheerpJ-CDN blockiert ist und kein Browser
läuft. Darum bitte **im Browser bei euch** testen:

1. **Checkbox „echtes Java (CheerpJ)"** oben rechts aktivieren. Dann sollte
   CheerpJ vom CDN laden und „CheerpJ bereit." erscheinen. Klappt das nicht,
   blockiert vermutlich das (Schul-)Netz das CDN `cjrtnc.leaningtech.com`
   → dann CheerpJ selbst hosten (siehe „Warum CheerpJ?").
2. **Kompilieren + Ausführen**: „▶ Ausführen" kompiliert den Spielcode (und die
   editierten Klassen `Figur`/`Welt`) im Browser mit ECJ und startet ihn.
   Fehlermeldung wie „Codeversion" oder „UnsupportedClassVersion"? → die
   `ecj.jar`-Version oder die CheerpJ-Loader-Version in `cheerpjLaufzeit.ts`
   (`LOADER_URL`) aufeinander abstimmen (CheerpJ-Runtime ist Java 8/11).
3. **Interop prüfen**: Figuren werden von Java über die `nativ*`-Methoden
   bewegt (Bridge in `cheerpjLaufzeit.ts`, Java-Seite in
   `java-framework/de/schule/jle/Figur.java`).

Wenn CheerpJ nicht lädt, fällt die App automatisch auf die Mock-Laufzeit
zurück. Die `ecj.jar` (~3 MB) liegt absichtlich im Repo, damit GitHub Pages sie
mit ausliefert.

## Architektur

```
┌─────────────────────────────────────────────────────────┐
│  Oberfläche (TypeScript)                                  │
│  · Welt-Engine (Canvas, Loop, Touch)   src/engine/        │
│  · Objektbank / Inspektor              src/ui/            │
│  · Code-Editor + Konsole               index.html         │
└───────────────┬───────────────────────────────────────────┘
                │ JavaLaufzeit-Interface  (src/java/laufzeit.ts)
        ┌───────┴────────┐
        ▼                ▼
  MockLaufzeit      CheerpJLaufzeit ──► CheerpJ (WASM-JVM)
  (pur JS,           · kompiliert Schülercode (ECJ) im Browser
   sofort lauffähig) · echtes Java + Reflexion, clientseitig
                     · Natives bewegen die Figuren der Engine
```

**Schlüsselidee:** Die Engine kennt CheerpJ nicht direkt. Sowohl die
Maus-Objektbank als auch echter Java-Code rufen **dieselbe Welt-API** auf
(`erzeugeFigur`, `geheVor`, …). Dadurch ist die App heute vorführbar und der
schwer testbare Java-Teil sauber gekapselt und einzeln validierbar.

### Warum CheerpJ?

Es ist (Stand 2026) der einzige Weg, **echtes Java inklusive Kompilierung
vollständig clientseitig** im Browser auszuführen — ohne Compile-Server, auch
auf dem iPad. Alternativen: TeaVM (braucht serverseitiges `javac`), DoppioJVM
(alt/langsam). Zu klären für den Schulbetrieb: CheerpJ-**Lizenz** für
Self-Hosting und **Datenschutz** (eigenes Hosting statt CDN).

## Pädagogik: bewusst anders als Greenfoot

- Die **Welt existiert bereits** als Objekt — sie muss **nicht** beerbt werden.
- Eine **Figur** ist ein normales Objekt: `new Figur("Bello")`. Erst der
  **Objektbegriff**, dann (später, wenn er dran ist) **Vererbung** — nicht vom
  Framework erzwungen.
- Deutsche, sprechende API (`geheVor`, `dreheDich`, `sage`).

## Nächste Schritte (Vorschlag)

1. CheerpJ-Pfad bei euch validieren (Punkte oben) — entscheidet die Architektur.
2. Monaco-Editor mit Java-Syntax statt `textarea`.
3. Eigene Klassen der Schüler in die Objektbank aufnehmen (Reflexion).
4. Framework ausbauen: Kollision, Tastatur/Spiel-Loop, Bilder/Sprites, Klänge.
5. Curriculum-Mapping Oberstufe (OOP, Datenstrukturen, Such-/Sortier­verfahren,
   Zustandsautomaten) als Beispiel-Szenarien.

## Projektstruktur

```
index.html                     Oberfläche
src/engine/                    Welt, Figur, Eingabe (Canvas/Touch)
src/ui/objektbank.ts           BlueJ-artige Objektinteraktion
src/java/laufzeit.ts           Interface MockLaufzeit ⇄ CheerpJLaufzeit
java-framework/                Java-API (Figur), build.sh → public/framework.jar
```
