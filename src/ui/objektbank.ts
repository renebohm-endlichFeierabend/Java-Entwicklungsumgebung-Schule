import { Welt } from "../engine/welt";
import { Figur } from "../engine/figur";

/**
 * Objektbank im Stil von BlueJ – das Feature, das wir behalten wollen:
 * Objekte per Mausklick erzeugen und ihre Methoden interaktiv aufrufen,
 * ohne Code zu schreiben.
 *
 * Bewusst KEINE Pflicht-Vererbung: `Figur` wird einfach instanziiert.
 * Die Methodenaufrufe gehen exakt durch dieselbe Welt-API wie späterer
 * Java-Code – Schülerinnen und Schüler sehen also "denselben" Effekt.
 */
export class Objektbank {
  private aktiv: Figur | null = null;
  /** Bekannte Klassen (von außen gesetzt); Default deckt den Start ab. */
  private klassen: { name: string; instanziierbar: boolean }[] = [
    { name: "Figur", instanziierbar: true },
    { name: "Welt", instanziierbar: false },
  ];

  /** Wird aufgerufen, wenn der Quelltext einer Klasse geöffnet werden soll. */
  onKlasseOeffnen: ((anzeige: string) => void) | null = null;
  /** Wird aufgerufen, wenn eine neue Klasse angelegt werden soll. */
  onNeueKlasse: (() => void) | null = null;

  constructor(
    private readonly welt: Welt,
    private readonly klassenEl: HTMLElement,
    private readonly objekteEl: HTMLElement,
    private readonly methodenEl: HTMLElement,
  ) {
    this.zeichneKlassen();
    this.welt.onAenderung = () => this.zeichneObjekte();
    this.zeichneObjekte();
    this.zeichneMethoden();
  }

  /** Aktualisiert die Klassenliste (z. B. nach „neue Klasse"). */
  setzeKlassen(klassen: { name: string; instanziierbar: boolean }[]): void {
    this.klassen = klassen;
    this.zeichneKlassen();
  }

  waehleAktiv(f: Figur | null): void {
    this.aktiv = f;
    this.zeichneObjekte();
    this.zeichneMethoden();
  }

  private zeichneKlassen(): void {
    this.klassenEl.innerHTML = "";

    for (const k of this.klassen) {
      const [karte, aktionen] = this.klassenKarte(k.name);
      if (k.instanziierbar) {
        const neu = document.createElement("button");
        neu.textContent = `neue ${k.name}`;
        neu.onclick = () => this.erzeugeObjekt(k.name);
        aktionen.prepend(neu);
      }
      this.klassenEl.appendChild(karte);
    }

    const neueKlasse = document.createElement("button");
    neueKlasse.className = "sekundaer neue-klasse";
    neueKlasse.textContent = "＋ neue Klasse";
    neueKlasse.onclick = () => this.onNeueKlasse?.();
    this.klassenEl.appendChild(neueKlasse);
  }

  /** Erzeugt ein Objekt der Klasse `klasse` und wählt es aus. */
  private erzeugeObjekt(klasse: string): void {
    const id = this.welt.erzeugeFigur(klasse, undefined, undefined, klasse);
    this.welt.waehle(id);
    this.aktiv = this.welt.alleFiguren().find((f) => f.id === id) ?? null;
    this.zeichneObjekte();
    this.zeichneMethoden();
  }

  /** Baut eine Klassenkarte mit Namen und „Quelltext"-Knopf; gibt Karte + Aktionsleiste zurück. */
  private klassenKarte(name: string): [HTMLDivElement, HTMLSpanElement] {
    const karte = document.createElement("div");
    karte.className = "klasse";
    karte.innerHTML = `<span class="klasse-name">${name}</span>`;

    const aktionen = document.createElement("span");
    aktionen.className = "aktionen";

    const quelltext = document.createElement("button");
    quelltext.className = "quelltext";
    quelltext.textContent = "Quelltext";
    quelltext.onclick = () => this.onKlasseOeffnen?.(name);
    aktionen.appendChild(quelltext);

    karte.appendChild(aktionen);
    return [karte, aktionen];
  }

  private zeichneObjekte(): void {
    this.objekteEl.innerHTML = "";
    for (const f of this.welt.alleFiguren()) {
      const el = document.createElement("div");
      el.className = "objekt" + (f === this.aktiv ? " aktiv" : "");
      el.innerHTML = `<span class="punkt" style="background:${f.farbe}"></span>
        <span class="objekt-name">${f.name}</span>
        <span class="objekt-typ">: ${f.typ}</span>`;
      el.onclick = () => {
        this.welt.waehle(f.id);
        this.waehleAktiv(f);
      };
      this.objekteEl.appendChild(el);
    }
    if (this.welt.alleFiguren().length === 0) {
      this.objekteEl.innerHTML =
        '<p class="leer">Noch keine Objekte. Klick auf „neue Figur".</p>';
    }
  }

  private zeichneMethoden(): void {
    this.methodenEl.innerHTML = "";
    const f = this.aktiv;
    if (!f) {
      this.methodenEl.innerHTML =
        '<p class="leer">Objekt auswählen, um Methoden aufzurufen.</p>';
      return;
    }
    const kopf = document.createElement("div");
    kopf.className = "methoden-kopf";
    kopf.textContent = `${f.name}.`;
    this.methodenEl.appendChild(kopf);

    this.zahlMethode("geheVor", "Pixel", 50, (n) => this.welt.geheVor(f.id, n));
    this.zahlMethode("dreheDich", "Grad", 90, (g) =>
      this.welt.dreheDich(f.id, g),
    );
    this.textMethode("sage", "Hallo!", (t) => this.welt.sage(f.id, t));

    const del = document.createElement("button");
    del.className = "gefahr";
    del.textContent = "entfernen";
    del.onclick = () => {
      this.welt.entferne(f.id);
      this.waehleAktiv(null);
    };
    this.methodenEl.appendChild(del);
  }

  private zahlMethode(
    name: string,
    label: string,
    standard: number,
    aktion: (n: number) => void,
  ): void {
    const zeile = document.createElement("div");
    zeile.className = "methode";
    const eingabe = document.createElement("input");
    eingabe.type = "number";
    eingabe.value = String(standard);
    const btn = document.createElement("button");
    btn.textContent = `${name}(…)`;
    btn.title = label;
    btn.onclick = () => aktion(Number(eingabe.value));
    zeile.append(btn, eingabe);
    this.methodenEl.appendChild(zeile);
  }

  private textMethode(
    name: string,
    standard: string,
    aktion: (t: string) => void,
  ): void {
    const zeile = document.createElement("div");
    zeile.className = "methode";
    const eingabe = document.createElement("input");
    eingabe.type = "text";
    eingabe.value = standard;
    const btn = document.createElement("button");
    btn.textContent = `${name}(…)`;
    btn.onclick = () => aktion(eingabe.value);
    zeile.append(btn, eingabe);
    this.methodenEl.appendChild(zeile);
  }
}
