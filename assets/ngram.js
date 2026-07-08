// Kleine N-Gramm-Bibliothek auf Wortebene — das gemeinsame „Modell“
// der Stationen „LLM zum Anfassen“ und „Baue deine eigene KI“.
//
// Didaktische Idee: genau dasselbe Prinzip wie bei großen Sprachmodellen
// (aus dem bisherigen Text die Wahrscheinlichkeit des nächsten Wortes
// bestimmen), nur mit einer ehrlichen, vollständig einsehbaren Zähltabelle
// statt eines neuronalen Netzes.

// Zerlegt Text in Wörter und Satzzeichen. Satzzeichen sind eigene Tokens,
// damit das Modell Satzenden lernen kann.
function zerlegeInWoerter(text) {
  const treffer = text.match(/[\p{L}\p{N}]+|[.,!?;:„“"»«()-]/gu);
  return treffer ? treffer : [];
}

class NGrammModell {
  // ordnung = Länge des Kontexts in Wörtern (1 = Bigramm, 2 = Trigramm, ...)
  constructor(ordnung) {
    this.ordnung = ordnung;
    // Für jede Kontextlänge 0..ordnung eine eigene Tabelle, damit wir bei
    // unbekannten Kontexten auf kürzere zurückfallen können (Backoff).
    this.tabellen = [];
    for (let n = 0; n <= ordnung; n++) this.tabellen.push(new Map());
    this.anzahlTokens = 0;
  }

  lerne(text) {
    const woerter = zerlegeInWoerter(text.toLowerCase());
    this.anzahlTokens += woerter.length;
    for (let i = 0; i < woerter.length; i++) {
      for (let n = 0; n <= this.ordnung; n++) {
        if (i < n) continue;
        const kontext = woerter.slice(i - n, i).join(" ");
        const tabelle = this.tabellen[n];
        if (!tabelle.has(kontext)) tabelle.set(kontext, new Map());
        const zaehler = tabelle.get(kontext);
        zaehler.set(woerter[i], (zaehler.get(woerter[i]) || 0) + 1);
      }
    }
  }

  // Liefert die Zähltabelle für den längsten bekannten Kontext-Suffix.
  // Rückgabe: { kontext, zaehler: Map<wort, anzahl> }
  kandidaten(kontextWoerter) {
    for (let n = Math.min(this.ordnung, kontextWoerter.length); n >= 0; n--) {
      const kontext = kontextWoerter.slice(-n).join(" ").toLowerCase();
      const zaehler = this.tabellen[n].get(kontext);
      if (zaehler && zaehler.size > 0) return { kontext, ordnung: n, zaehler };
    }
    return { kontext: "", ordnung: 0, zaehler: new Map() };
  }

  // Wahrscheinlichkeitsverteilung fürs nächste Wort, mit Temperatur.
  // Temperatur < 1: spitzer (mutloser), > 1: flacher (mutiger).
  verteilung(kontextWoerter, temperatur) {
    const { kontext, ordnung, zaehler } = this.kandidaten(kontextWoerter);
    const t = Math.max(0.05, temperatur || 1);
    let summe = 0;
    const eintraege = [];
    for (const [wort, anzahl] of zaehler) {
      const gewicht = Math.pow(anzahl, 1 / t);
      eintraege.push({ wort, anzahl, gewicht });
      summe += gewicht;
    }
    eintraege.forEach((e) => (e.p = e.gewicht / summe));
    eintraege.sort((a, b) => b.p - a.p);
    return { kontext, ordnung, eintraege };
  }

  // Zieht ein Wort gemäß der Verteilung („würfeln“).
  wuerfle(kontextWoerter, temperatur) {
    const { eintraege } = this.verteilung(kontextWoerter, temperatur);
    if (eintraege.length === 0) return null;
    let rest = Math.random();
    for (const e of eintraege) {
      rest -= e.p;
      if (rest <= 0) return e.wort;
    }
    return eintraege[eintraege.length - 1].wort;
  }
}

// Wortfolge hübsch zu Text zusammensetzen (Leerzeichen vor Satzzeichen weg,
// Satzanfänge groß).
function fuegeZusammen(woerter) {
  let text = "";
  let satzanfang = true;
  for (const w of woerter) {
    const istZeichen = /^[.,!?;:„“"»«()-]$/.test(w);
    let wort = w;
    if (!istZeichen && satzanfang) wort = wort.charAt(0).toUpperCase() + wort.slice(1);
    text += istZeichen ? wort : (text ? " " : "") + wort;
    satzanfang = /[.!?]/.test(w);
  }
  return text;
}
