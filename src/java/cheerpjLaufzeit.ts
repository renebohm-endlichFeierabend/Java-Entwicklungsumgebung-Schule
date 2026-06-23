import { JavaLaufzeit, Ausgabe } from "./laufzeit";
import { Welt } from "../engine/welt";

// CheerpJ wird per <script> vom CDN geladen und stellt diese globalen
// Funktionen bereit. Versionen/Signaturen ggf. an die bei euch genutzte
// CheerpJ-Version anpassen (siehe https://cheerpj.com/docs/).
declare function cheerpjInit(opts?: Record<string, unknown>): Promise<void>;
declare function cheerpjRunMain(
  cls: string,
  classPath: string,
  ...args: string[]
): Promise<number>;
declare function cheerpjRunLibrary(classPath: string): Promise<any>;
declare function cheerpjAddStringFile(pfad: string, inhalt: string): void;

const LOADER_URL = "https://cjrtnc.leaningtech.com/4.2/loader.js";
// Eclipse Compiler for Java (javax.tools-kompatibel). Muss unter public/
// liegen; Bezugsquelle siehe README ("In-Browser-Kompilierung validieren").
const ECJ_JAR = "/app/ecj.jar";
const FRAMEWORK_JAR = "/app/framework.jar";

/**
 * Echte Java-Laufzeit über CheerpJ (clientseitige JVM in WebAssembly).
 *
 * STATUS: Der Interop-Bridge-Code ist vollständig, konnte im Build-Sandbox
 * aber NICHT ausgeführt werden (CheerpJ-CDN dort blockiert, kein Browser).
 * Auf eurem Rechner/Netz validieren – Anleitung in der README.
 */
export class CheerpJLaufzeit implements JavaLaufzeit {
  readonly name = "CheerpJ (echtes Java, clientseitig)";
  private welt!: Welt;
  private ausgabe!: Ausgabe;
  private bereit = false;
  private laufNr = 0;
  /** Editierbare Klassen-Quelltexte (z. B. de.schule.jle.Figur → Quelltext). */
  private klassen: Record<string, string> = {};

  setzeKlassen(klassen: Record<string, string>): void {
    this.klassen = klassen;
  }

  async init(welt: Welt, ausgabe: Ausgabe): Promise<void> {
    this.welt = welt;
    this.ausgabe = ausgabe;
    this.ausgabe("Lade CheerpJ …");
    await this.ladeLoader();
    await cheerpjInit({ natives: this.natives() });
    this.bereit = true;
    this.ausgabe("CheerpJ bereit.");
  }

  /** Lädt das CheerpJ-Loader-Skript einmalig. */
  private ladeLoader(): Promise<void> {
    if (typeof (globalThis as any).cheerpjInit === "function")
      return Promise.resolve();
    return new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = LOADER_URL;
      s.onload = () => res();
      s.onerror = () =>
        rej(new Error(`CheerpJ-Loader nicht erreichbar: ${LOADER_URL}`));
      document.head.appendChild(s);
    });
  }

  /**
   * JavaScript-Implementierungen der `native`-Methoden von de.schule.jle.Figur.
   * Konvention: Java_<voll.qualifizierte.Klasse mit _>_<methode>(lib, [self,] ...args).
   * Unsere Natives sind statisch → kein `self`.
   */
  private natives(): Record<string, (...a: any[]) => unknown> {
    const welt = () => this.welt;
    return {
      Java_de_schule_jle_Figur_nativErzeuge: (_lib: unknown, name: unknown) =>
        welt().erzeugeFigur(String(name)),
      Java_de_schule_jle_Figur_nativVerschiebe: (
        _lib: unknown,
        id: number,
        dx: number,
        dy: number,
      ) => welt().verschiebe(id, dx, dy),
      Java_de_schule_jle_Figur_nativDrehe: (
        _lib: unknown,
        id: number,
        grad: number,
      ) => welt().dreheDich(id, grad),
      Java_de_schule_jle_Figur_nativSetzePosition: (
        _lib: unknown,
        id: number,
        x: number,
        y: number,
      ) => welt().setzePosition(id, x, y),
      Java_de_schule_jle_Figur_nativSage: (
        _lib: unknown,
        id: number,
        text: unknown,
      ) => welt().sage(id, String(text)),
    };
  }

  async fuehreAus(quelltext: string): Promise<void> {
    if (!this.bereit) throw new Error("CheerpJ noch nicht initialisiert.");
    const nr = ++this.laufNr;
    const paket = `lauf${nr}`;
    const klasse = "Programm";

    // Schüler schreiben Methodenrumpf; wir betten ihn in ein lauffähiges
    // Gerüst ein, damit der Einstieg ohne main()-Boilerplate gelingt.
    const quelle = this.umhuelle(quelltext, paket, klasse);
    const javaPfad = `/str/${paket}/${klasse}.java`;
    const ausgabeDir = `/files/${paket}`;

    cheerpjAddStringFile(javaPfad, quelle);

    // Editierte Klassen (z. B. Figur, Welt) mitkompilieren. Sie liegen in
    // ihrem eigenen Paket und überlagern beim Ausführen das Framework-Jar.
    const javaPfade = [javaPfad];
    for (const [vollName, inhalt] of Object.entries(this.klassen)) {
      const pfad = `/str/${vollName.replace(/\./g, "/")}.java`;
      cheerpjAddStringFile(pfad, inhalt);
      javaPfade.push(pfad);
    }

    this.ausgabe("Kompiliere mit ECJ …");
    const rc = await cheerpjRunMain(
      "org.eclipse.jdt.internal.compiler.batch.Main",
      ECJ_JAR,
      "-source",
      "11",
      "-target",
      "11",
      "-cp",
      FRAMEWORK_JAR,
      "-d",
      ausgabeDir,
      ...javaPfade,
    );
    if (rc !== 0) {
      this.ausgabe(`Kompilierung fehlgeschlagen (Code ${rc}).`);
      return;
    }
    this.ausgabe("Starte Programm …");
    const lib = await cheerpjRunLibrary(`${ausgabeDir}:${FRAMEWORK_JAR}`);
    const Programm = await lib[paket][klasse];
    const p = await new Programm();
    await p.start();
    this.ausgabe("Programm beendet.");
  }

  private umhuelle(rumpf: string, paket: string, klasse: string): string {
    return `package ${paket};
import de.schule.jle.*;

public class ${klasse} {
  public void start() {
${rumpf
  .split("\n")
  .map((z) => "    " + z)
  .join("\n")}
  }
}
`;
  }
}
