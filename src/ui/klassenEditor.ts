import figurQuelle from "../../java-framework/de/schule/jle/Figur.java?raw";
import weltQuelle from "../../java-framework/de/schule/jle/Welt.java?raw";

interface KlassenInfo {
  /** Voll qualifizierter Name, z. B. "de.schule.jle.Figur". */
  voll: string;
  /** Kurzer Anzeigename, z. B. "Figur". */
  anzeige: string;
  /** Aktueller (ggf. editierter) Java-Quelltext. */
  code: string;
  /** Ursprungsstand für „Zurücksetzen". */
  original: string;
  /** true = von Schüler:innen angelegt (löschbar). */
  eigen: boolean;
  /** false = nur Quelltext (keine Objekte erzeugbar), z. B. Welt. */
  instanziierbar: boolean;
}

/** Vorlage für eine neue, bewegliche Klasse – erbt die Bewegung von Figur. */
function vorlage(name: string): string {
  return `package de.schule.jle;

/**
 * Ein ${name} – eine eigene Figur, die sich bewegen kann.
 *
 * Die Bewegung (geheVor, dreheDich, sage) wird von Figur GEERBT – du musst
 * sie also nicht neu schreiben. Ergänze hier einfach dein eigenes Verhalten.
 */
public class ${name} extends Figur {

  public ${name}(String name) {
    super(name);
  }

  /** Beispiel-Verhalten: fährt ein Quadrat ab. Ändere es nach Belieben! */
  public void fahreImQuadrat(int seite) {
    for (int i = 0; i < 4; i++) {
      geheVor(seite);
      dreheDich(90);
    }
  }
}
`;
}

/**
 * Verwaltet die editierbaren Quelltexte der Klassen (Figur, Welt sowie eigene
 * Klassen wie Auto, Roboter …) und stellt das „Klassen-Quelltext"-Fenster
 * unten rechts dar.
 *
 * Idee: Die Bewegung lebt EINMAL in der Basisklasse Figur. Neue Klassen erben
 * sie über `extends Figur` und „können sich ebenfalls bewegen", ohne die
 * Mathematik zu duplizieren. „Zurücksetzen" stellt den Ursprungsstand wieder
 * her – ein Sicherheitsnetz gegen versehentliches Löschen.
 *
 * Die Startwerte der Framework-Klassen stammen direkt aus den echten Quellen
 * (`?raw`-Import) – also nur EINE Quelle der Wahrheit. Alle Quelltexte werden
 * über `quelltexte()` an die Laufzeit gereicht und dort mitkompiliert.
 */
export class KlassenEditor {
  private readonly klassen = new Map<string, KlassenInfo>();
  private aktiv: string;

  /** Wird gefeuert, wenn Klassen hinzukommen/entfernt werden (für die Objektbank). */
  onAenderung: (() => void) | null = null;

  constructor(
    private readonly box: HTMLElement,
    private readonly tabsEl: HTMLElement,
    private readonly codeEl: HTMLTextAreaElement,
    private readonly aktionenEl: HTMLElement,
    private readonly onSichtbarkeit?: (sichtbar: boolean) => void,
  ) {
    this.registriere("de.schule.jle.Figur", "Figur", figurQuelle, false, true);
    this.registriere("de.schule.jle.Welt", "Welt", weltQuelle, false, false);
    this.aktiv = "de.schule.jle.Figur";

    this.codeEl.addEventListener("input", () => {
      const info = this.klassen.get(this.aktiv);
      if (info) info.code = this.codeEl.value;
    });

    this.zeichne();
  }

  private registriere(
    voll: string,
    anzeige: string,
    code: string,
    eigen: boolean,
    instanziierbar: boolean,
  ): void {
    this.klassen.set(voll, {
      voll,
      anzeige,
      code,
      original: code,
      eigen,
      instanziierbar,
    });
  }

  // ---- Klassen anlegen / entfernen / zurücksetzen ------------------------

  /**
   * Legt eine neue bewegliche Klasse an (extends Figur) und öffnet sie.
   * Gibt den bereinigten Namen zurück – oder null bei ungültigem/doppeltem Namen.
   */
  neueKlasse(rohName: string): string | null {
    const name = this.bereinigeName(rohName);
    if (!name) return null;
    const voll = `de.schule.jle.${name}`;
    if (this.klassen.has(voll)) return null;
    this.registriere(voll, name, vorlage(name), true, true);
    this.aktiv = voll;
    this.zeige(true);
    this.zeichne();
    this.onAenderung?.();
    return name;
  }

  /** Macht aus einer Eingabe einen gültigen, großgeschriebenen Java-Klassennamen. */
  private bereinigeName(roh: string): string | null {
    const sauber = roh
      .trim()
      .replace(/[^A-Za-z0-9_]/g, "")
      .replace(/^[0-9]+/, "");
    if (!sauber) return null;
    return sauber[0].toUpperCase() + sauber.slice(1);
  }

  /** Setzt die aktuell gezeigte Klasse auf ihren Ursprungsstand zurück. */
  zuruecksetzen(): void {
    const info = this.klassen.get(this.aktiv);
    if (!info) return;
    info.code = info.original;
    this.codeEl.value = info.code;
  }

  /** Entfernt die aktuell gezeigte Klasse (nur eigene). */
  loesche(): void {
    const info = this.klassen.get(this.aktiv);
    if (!info || !info.eigen) return;
    this.klassen.delete(info.voll);
    this.aktiv = "de.schule.jle.Figur";
    this.zeichne();
    this.onAenderung?.();
  }

  // ---- Sichtbarkeit ------------------------------------------------------

  /** Öffnet den Editor für die Klasse mit diesem Anzeigenamen und zeigt das Fenster. */
  oeffne(anzeige: string): void {
    const info = [...this.klassen.values()].find((k) => k.anzeige === anzeige);
    if (!info) return;
    this.aktiv = info.voll;
    this.zeige(true);
    this.zeichne();
  }

  zeige(sichtbar: boolean): void {
    this.box.hidden = !sichtbar;
    this.onSichtbarkeit?.(sichtbar);
  }

  sichtbar(): boolean {
    return !this.box.hidden;
  }

  // ---- Daten für andere Module ------------------------------------------

  /** Alle Klassen mit Anzeigename und Flag, ob Objekte erzeugbar sind. */
  klassenListe(): { name: string; instanziierbar: boolean }[] {
    return [...this.klassen.values()].map((k) => ({
      name: k.anzeige,
      instanziierbar: k.instanziierbar,
    }));
  }

  /** Voll qualifizierter Name → Quelltext, für die Laufzeit. */
  quelltexte(): Record<string, string> {
    const r: Record<string, string> = {};
    for (const k of this.klassen.values()) r[k.voll] = k.code;
    return r;
  }

  // ---- Darstellung -------------------------------------------------------

  private zeichne(): void {
    const info = this.klassen.get(this.aktiv)!;
    this.codeEl.value = info.code;
    this.zeichneTabs();
    this.zeichneAktionen(info);
  }

  private zeichneTabs(): void {
    this.tabsEl.innerHTML = "";
    for (const k of this.klassen.values()) {
      const b = document.createElement("button");
      b.textContent = `${k.anzeige}.java`;
      b.className = "tab" + (k.voll === this.aktiv ? " aktiv" : "");
      b.onclick = () => {
        this.aktiv = k.voll;
        this.zeichne();
      };
      this.tabsEl.appendChild(b);
    }
  }

  private zeichneAktionen(info: KlassenInfo): void {
    this.aktionenEl.innerHTML = "";

    const zuruecksetzen = document.createElement("button");
    zuruecksetzen.className = "sekundaer";
    zuruecksetzen.textContent = "↩ Zurücksetzen";
    zuruecksetzen.title = "Diese Klasse auf den Ursprungsstand zurücksetzen";
    zuruecksetzen.onclick = () => {
      if (confirm(`„${info.anzeige}" auf den Ursprungsstand zurücksetzen?`))
        this.zuruecksetzen();
    };
    this.aktionenEl.appendChild(zuruecksetzen);

    if (info.eigen) {
      const loeschen = document.createElement("button");
      loeschen.className = "gefahr";
      loeschen.textContent = "Klasse löschen";
      loeschen.onclick = () => {
        if (confirm(`Klasse „${info.anzeige}" wirklich löschen?`)) this.loesche();
      };
      this.aktionenEl.appendChild(loeschen);
    }
  }
}
