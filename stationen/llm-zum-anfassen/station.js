// Station 1 · LLM zum Anfassen
// Teil A: vereinfachter Subword-Tokenizer · Teil B: Nächstes-Wort-Spielplatz

zeigeKompetenzen(document.getElementById("kompetenzleiste"), ["K1"], ["K2", "K4"]);

// ---------- Teil A: Tokenizer ----------------------------------------------

// Kleiner Demonstrations-Wortschatz. Reihenfolge egal — es zählt der längste
// Treffer ab der aktuellen Position (greedy longest match), wie bei BPE.
const WORTSCHATZ = [
  "der", "die", "das", "und", "ein", "eine", "einen", "einem", "einer",
  "ich", "du", "er", "sie", "es", "wir", "ihr", "nicht", "ist", "sind",
  "war", "wird", "kann", "hat", "mit", "auf", "in", "an", "zu", "von",
  "den", "dem", "des", "im", "am", "um", "bei", "nach", "vor", "aus",
  "über", "unter", "wenn", "dann", "auch", "noch", "sehr", "kleine",
  "kleiner", "große", "großer", "gute", "guter", "heute", "morgen",
  "schule", "schul", "klasse", "lehrer", "lehrerin", "kinder", "kind",
  "drache", "fuchs", "wald", "schatz", "haus", "hund", "katze", "tür",
  "wort", "satz", "text", "sprache", "sprach", "modell", "daten",
  "intelligenz", "künstliche", "wahrscheinlichkeit", "weihnacht", "feier",
  "besucht", "geht", "kommt", "lebt", "spielt", "lernt", "fest",
  "chen", "lein", "ung", "heit", "keit", "schaft", "lich", "isch",
  "ge", "be", "ver", "ent", "er", "en", "el", "es", "et", "st",
  "sch", "ch", "ck", "ei", "ie", "au", "eu", "äu", "qu", "th",
];
// Nach Länge absteigend sortieren, dann findet die Schleife automatisch den
// längsten Treffer zuerst.
WORTSCHATZ.sort((a, b) => b.length - a.length);

function tokenisiere(text) {
  const tokens = [];
  let i = 0;
  while (i < text.length) {
    const zeichen = text[i];
    if (/\s/.test(zeichen)) { i++; continue; } // Leerraum trennt nur
    if (/[.,!?;:„“"»«()-]/.test(zeichen)) { tokens.push(zeichen); i++; continue; }
    const rest = text.slice(i).toLowerCase();
    let treffer = null;
    for (const eintrag of WORTSCHATZ) {
      if (rest.startsWith(eintrag)) {
        // Ganze Wörter nur am Wortanfang bevorzugen wäre komplexer —
        // für die Demonstration reicht der reine längste Treffer.
        treffer = text.slice(i, i + eintrag.length);
        break;
      }
    }
    if (!treffer) treffer = zeichen; // unbekannt → einzelnes Zeichen
    tokens.push(treffer);
    i += treffer.length;
  }
  return tokens;
}

// Stabile Pastellfarbe je Token-Text, damit gleiche Tokens gleich aussehen.
function tokenFarbe(text) {
  let hash = 0;
  for (const z of text.toLowerCase()) hash = (hash * 31 + z.codePointAt(0)) % 3600;
  return `hsl(${hash / 10} 70% 82%)`;
}

const tokenEingabe = document.getElementById("tokenEingabe");
const tokenband = document.getElementById("tokenband");
const tokenstatistik = document.getElementById("tokenstatistik");

function zeigeTokens() {
  const tokens = tokenisiere(tokenEingabe.value);
  tokenband.replaceChildren();
  tokens.forEach((t, index) => {
    const chip = document.createElement("span");
    chip.className = "token";
    chip.style.background = tokenFarbe(t);
    chip.style.color = "#1c2333";
    chip.textContent = t;
    // "Token-ID": Position im Wortschatz, als Anschauung für Zahlencodes.
    const id = WORTSCHATZ.indexOf(t.toLowerCase());
    chip.title = `Token ${index + 1}` + (id >= 0 ? ` · Wortschatz-Nr. ${id}` : " · nicht im Wortschatz (einzelnes Zeichen)");
    tokenband.appendChild(chip);
  });
  const zeichen = tokenEingabe.value.replace(/\s/g, "").length;
  tokenstatistik.textContent = `${zeichen} Zeichen → ${tokens.length} Tokens. Gleiche Farbe = gleiches Token.`;
}
tokenEingabe.addEventListener("input", zeigeTokens);
zeigeTokens();

// ---------- Teil B: Nächstes-Wort-Spielplatz --------------------------------

const modell = new NGrammModell(2); // Trigramm mit Backoff
modell.lerne(KORPUS);
document.getElementById("korpusanzeige").textContent = KORPUS.trim();

const STANDARDSTART = ["es", "war", "einmal"];
let verlauf = [...STANDARDSTART];

const ausgabetext = document.getElementById("ausgabetext");
const balkenliste = document.getElementById("balkenliste");
const kontextanzeige = document.getElementById("kontextanzeige");
const temperaturRegler = document.getElementById("temperatur");
const temperaturWert = document.getElementById("temperaturWert");

function temperatur() { return parseFloat(temperaturRegler.value); }

function zeigeAusgabe() {
  const text = fuegeZusammen(verlauf);
  ausgabetext.replaceChildren();
  const davor = document.createTextNode(text + " ");
  const cursor = document.createElement("span");
  cursor.className = "cursorwort";
  cursor.textContent = "▁";
  ausgabetext.append(davor, cursor);
}

function zeigeVerteilung() {
  const { kontext, ordnung, eintraege } = modell.verteilung(verlauf, temperatur());
  kontextanzeige.textContent = ordnung > 0
    ? `Das Modell schaut auf die letzten ${ordnung} Wörter: „${kontext}“ — und hat dazu ${eintraege.length} Fortsetzung(en) gezählt:`
    : "Diesen Kontext kennt das Modell nicht — es rät nur noch nach Wort-Häufigkeit:";
  balkenliste.replaceChildren();
  const maxP = eintraege.length ? eintraege[0].p : 1;
  for (const e of eintraege.slice(0, 8)) {
    const zeile = document.createElement("div");
    zeile.className = "balkenzeile";
    const knopf = document.createElement("button");
    knopf.textContent = e.wort;
    knopf.className = "wort";
    knopf.title = `„${e.wort}“ übernehmen — kam im Übungstext ${e.anzahl}× nach diesem Kontext`;
    knopf.addEventListener("click", () => uebernehme(e.wort));
    const balken = document.createElement("div");
    balken.className = "balken";
    balken.style.width = `${(e.p / maxP) * 100}%`;
    const prozent = document.createElement("span");
    prozent.className = "prozent";
    prozent.textContent = `${(e.p * 100).toFixed(1)} %`;
    zeile.append(knopf, balken, prozent);
    balkenliste.appendChild(zeile);
  }
}

function uebernehme(wort) {
  verlauf.push(wort);
  zeigeAusgabe();
  zeigeVerteilung();
}

document.getElementById("knopfWahrscheinlichstes").addEventListener("click", () => {
  const { eintraege } = modell.verteilung(verlauf, temperatur());
  if (eintraege.length) uebernehme(eintraege[0].wort);
});

document.getElementById("knopfWuerfeln").addEventListener("click", () => {
  const wort = modell.wuerfle(verlauf, temperatur());
  if (wort) uebernehme(wort);
});

document.getElementById("knopfAuto").addEventListener("click", () => {
  // Zeitversetzt einfügen, damit man dem Modell beim „Schreiben“ zusieht.
  let uebrig = 10;
  const schritt = () => {
    const wort = modell.wuerfle(verlauf, temperatur());
    if (!wort || --uebrig < 0) return;
    uebernehme(wort);
    setTimeout(schritt, 220);
  };
  schritt();
});

document.getElementById("knopfNeustart").addEventListener("click", () => {
  verlauf = [...STANDARDSTART];
  zeigeAusgabe();
  zeigeVerteilung();
});

document.getElementById("knopfStart").addEventListener("click", () => {
  const woerter = zerlegeInWoerter(document.getElementById("startEingabe").value.toLowerCase());
  if (woerter.length) {
    verlauf = woerter;
    zeigeAusgabe();
    zeigeVerteilung();
  }
});

temperaturRegler.addEventListener("input", () => {
  temperaturWert.textContent = temperatur().toFixed(1).replace(".", ",");
  zeigeVerteilung();
});

zeigeAusgabe();
zeigeVerteilung();
