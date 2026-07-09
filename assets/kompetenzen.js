// Kompetenzcluster K1–K8 der KI-Werkstatt.
// Herleitung aus KMK-Handlungsempfehlung (2024), UNESCO AI Competency
// Framework for Students (2024) und EU-OECD AILit Framework (2026):
// siehe KOMPETENZRAHMEN-KI.md im Repository.

const KOMPETENZEN = {
  K1: {
    titel: "Funktionsweise verstehen",
    erklaerung: "Wie „denkt“ ein Sprachmodell? Trainingsdaten, Wahrscheinlichkeiten, Muster statt Wissen.",
    referenz: "UNESCO: AI foundations · AILit: Engage with AI",
  },
  K2: {
    titel: "Grenzen & Fehler einschätzen",
    erklaerung: "Halluzinationen, Bias und Unsicherheit erkennen; wissen, wo KI systematisch scheitert.",
    referenz: "AILit: Engage with AI · KMK: kritisch-konstruktiver Umgang",
  },
  K3: {
    titel: "Kompetent anwenden",
    erklaerung: "Prompting, Werkzeugwahl, Ergebnisse prüfen und weiterverarbeiten.",
    referenz: "UNESCO: application skills · AILit: Create with AI",
  },
  K4: {
    titel: "Ausgaben kritisch bewerten",
    erklaerung: "Quellenkritik, Fakt vs. Fabriziertes, Verifikationsstrategien.",
    referenz: "AILit: Engage with AI · KMK: digitale Mündigkeit",
  },
  K5: {
    titel: "Sicher & verantwortungsvoll nutzen",
    erklaerung: "Datenschutz, Urheberrecht, Kennzeichnung; Manipulation und Prompt Injection kennen.",
    referenz: "UNESCO: safe and responsible use",
  },
  K6: {
    titel: "Gesellschaftliche Wirkung reflektieren",
    erklaerung: "Fairness, Arbeitswelt, Demokratie, Nachhaltigkeit — Mündigkeit im KI-Zeitalter.",
    referenz: "UNESCO: citizenship in the era of AI",
  },
  K7: {
    titel: "Menschliche Handlungsmacht behalten",
    erklaerung: "Entscheiden, wann KI (nicht) das richtige Werkzeug ist; Verantwortung bleibt beim Menschen.",
    referenz: "UNESCO: human agency/accountability · AILit: Manage AI",
  },
  K8: {
    titel: "KI (mit)gestalten",
    erklaerung: "Eigene Modelle und Werkzeuge bauen: Problem definieren, entwerfen, iterieren — Ethik von Anfang an.",
    referenz: "UNESCO: AI system design · AILit: Shape AI",
  },
};

// Hängt Kompetenz-Etiketten in das Element `ziel`.
// haupt: Hauptziele der Station, neben: mitbediente Cluster.
function zeigeKompetenzen(ziel, haupt, neben) {
  const liste = document.createElement("ul");
  liste.className = "kompetenzen";
  const anhaengen = (id, istHaupt) => {
    const k = KOMPETENZEN[id];
    if (!k) return;
    const li = document.createElement("li");
    li.className = "kbadge" + (istHaupt ? " haupt" : "");
    li.style.background = `var(--${id.toLowerCase()})`;
    li.textContent = `${id} ${k.titel}`;
    li.title = `${k.erklaerung}\n(${k.referenz})` + (istHaupt ? "" : "\nWird an dieser Station mitbedient.");
    liste.appendChild(li);
  };
  (haupt || []).forEach((id) => anhaengen(id, true));
  (neben || []).forEach((id) => anhaengen(id, false));
  ziel.appendChild(liste);
}
