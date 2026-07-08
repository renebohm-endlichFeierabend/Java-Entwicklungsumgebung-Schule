// Station 2 · Baue deine eigene KI
// Trainieren, ins Gedächtnis schauen, Texte erzeugen.

zeigeKompetenzen(document.getElementById("kompetenzleiste"), ["K8", "K1"], ["K2"]);

let modell = null;
let verlauf = [];

const ausgabetext = document.getElementById("ausgabetext");
const erzeugHinweis = document.getElementById("erzeugHinweis");
const temperaturRegler = document.getElementById("temperatur");

function temperatur() { return parseFloat(temperaturRegler.value); }

function trainiere() {
  const ordnung = parseInt(document.getElementById("ordnung").value, 10);
  const text = document.getElementById("trainingstext").value;
  modell = new NGrammModell(ordnung);
  modell.lerne(text);

  // Statistik
  const volleTabelle = modell.tabellen[ordnung];
  const unigramme = modell.tabellen[0].get("") || new Map();
  document.getElementById("statTokens").textContent = modell.anzahlTokens;
  document.getElementById("statKontexte").textContent = volleTabelle.size;
  document.getElementById("statWoerter").textContent = unigramme.size;
  document.getElementById("statistik").hidden = false;

  // Gedächtnistabelle: Kontexte mit den meisten verschiedenen Fortsetzungen.
  const koerper = document.getElementById("gedaechtnisKoerper");
  koerper.replaceChildren();
  const kontexte = [...volleTabelle.entries()]
    .sort((a, b) => b[1].size - a[1].size)
    .slice(0, 10);
  for (const [kontext, zaehler] of kontexte) {
    const zeile = document.createElement("tr");
    const zelleKontext = document.createElement("td");
    zelleKontext.className = "kontext";
    zelleKontext.textContent = `… ${kontext}`;
    const zelleFolgen = document.createElement("td");
    zelleFolgen.textContent = [...zaehler.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([wort, anzahl]) => `${wort} (${anzahl}×)`)
      .join(", ");
    zeile.append(zelleKontext, zelleFolgen);
    koerper.appendChild(zeile);
  }

  document.getElementById("nachTraining").hidden = false;
  neuerAnfang();
}

// Zufälligen Satzanfang aus den Trainingsdaten wählen (Wort nach Satzzeichen
// oder erstes Wort), damit die Erzeugung natürlich startet.
function neuerAnfang() {
  const unigramme = modell.tabellen[0].get("") || new Map();
  const woerter = [...unigramme.keys()].filter((w) => /\p{L}/u.test(w));
  verlauf = woerter.length ? [woerter[Math.floor(Math.random() * woerter.length)]] : [];
  zeigeAusgabe();
}

function zeigeAusgabe() {
  ausgabetext.textContent = fuegeZusammen(verlauf) + " ▁";
  const info = modell.kandidaten(verlauf);
  erzeugHinweis.textContent = info.zaehler.size > 0
    ? `Das Modell schaut auf „${info.kontext || "(nichts)"}“ und kennt dafür ${info.zaehler.size} Fortsetzung(en).`
    : "Für diesen Kontext kennt das Modell keine Fortsetzung — mehr Trainingsdaten helfen!";
}

function einWort() {
  const wort = modell.wuerfle(verlauf, temperatur());
  if (!wort) return false;
  verlauf.push(wort);
  zeigeAusgabe();
  return true;
}

document.getElementById("knopfTrainieren").addEventListener("click", trainiere);
document.getElementById("knopfWeiter").addEventListener("click", einWort);
document.getElementById("knopfNeu").addEventListener("click", neuerAnfang);
document.getElementById("knopfSchreiben").addEventListener("click", () => {
  let uebrig = 30;
  const schritt = () => {
    if (--uebrig < 0 || !einWort()) return;
    setTimeout(schritt, 120);
  };
  schritt();
});
temperaturRegler.addEventListener("input", () => {
  document.getElementById("temperaturWert").textContent =
    temperatur().toFixed(1).replace(".", ",");
});
