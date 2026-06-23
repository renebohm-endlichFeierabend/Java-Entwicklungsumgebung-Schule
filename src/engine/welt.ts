import { Figur } from "./figur";
import { radian } from "./vektor";

const FARBEN = ["#4f8cff", "#ff5d73", "#42c98e", "#f5a623", "#a974ff", "#2dd4bf"];

/**
 * Die Welt ist die Bühne. Wichtig (Unterschied zu Greenfoot):
 * Die Welt EXISTIERT bereits als Objekt – sie muss NICHT beerbt werden.
 * Schülerinnen und Schüler erzeugen Figuren und platzieren sie.
 *
 * Diese Klasse ist zugleich die "Maschinenseite": Sowohl die interaktive
 * Objektbank (Mausklick) als auch der echte Java-Code (über CheerpJ-Natives)
 * rufen exakt dieselben Methoden auf – `erzeugeFigur`, `geheVor`, ...
 */
export class Welt {
  readonly breite: number;
  readonly hoehe: number;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly figuren = new Map<number, Figur>();
  private naechsteId = 1;
  private letzteZeit = 0;

  /** Beobachter für die UI (z. B. Objektbank), wenn sich Figuren ändern. */
  onAenderung: (() => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D-Kontext nicht verfügbar");
    this.ctx = ctx;
    this.breite = canvas.width;
    this.hoehe = canvas.height;
    requestAnimationFrame((t) => this.schleife(t));
  }

  // ---- API: identisch für Maus-Interaktion und Java-Code -----------------

  erzeugeFigur(
    name: string,
    x = this.breite / 2,
    y = this.hoehe / 2,
    typ = "Figur",
  ): number {
    const id = this.naechsteId++;
    const farbe = FARBEN[(id - 1) % FARBEN.length];
    const figur = new Figur(id, name || `Figur${id}`, x, y, farbe);
    figur.typ = typ;
    this.figuren.set(id, figur);
    this.onAenderung?.();
    return id;
  }

  entferne(id: number): void {
    if (this.figuren.delete(id)) this.onAenderung?.();
  }

  geheVor(id: number, n: number): void {
    this.figuren.get(id)?.geheVor(n);
  }

  verschiebe(id: number, dx: number, dy: number): void {
    this.figuren.get(id)?.verschiebe(dx, dy);
  }

  dreheDich(id: number, grad: number): void {
    this.figuren.get(id)?.dreheDich(grad);
  }

  setzePosition(id: number, x: number, y: number): void {
    this.figuren.get(id)?.setzePosition(x, y);
  }

  sage(id: number, text: string): void {
    this.figuren.get(id)?.sage(text);
  }

  // ---- Zugriff für die UI -------------------------------------------------

  alleFiguren(): Figur[] {
    return [...this.figuren.values()];
  }

  figurBei(px: number, py: number): Figur | null {
    const alle = this.alleFiguren();
    for (let i = alle.length - 1; i >= 0; i--) {
      if (alle[i].trifft(px, py)) return alle[i];
    }
    return null;
  }

  waehle(id: number | null): void {
    for (const f of this.figuren.values()) f.ausgewaehlt = f.id === id;
  }

  // ---- Render-Schleife ----------------------------------------------------

  private schleife(t: number): void {
    const dt = this.letzteZeit ? t - this.letzteZeit : 16;
    this.letzteZeit = t;
    for (const f of this.figuren.values()) f.schritt(dt);
    this.zeichne();
    requestAnimationFrame((tt) => this.schleife(tt));
  }

  private zeichne(): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.breite, this.hoehe);
    this.zeichneGitter();
    for (const f of this.figuren.values()) this.zeichneFigur(f);
  }

  private zeichneGitter(): void {
    const ctx = this.ctx;
    ctx.fillStyle = "#0f1525";
    ctx.fillRect(0, 0, this.breite, this.hoehe);
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    const s = 40;
    for (let x = 0; x <= this.breite; x += s) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.hoehe);
      ctx.stroke();
    }
    for (let y = 0; y <= this.hoehe; y += s) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.breite, y);
      ctx.stroke();
    }
  }

  private zeichneFigur(f: Figur): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(f.x, f.y);

    if (f.ausgewaehlt) {
      ctx.beginPath();
      ctx.arc(0, 0, 28, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Körper
    ctx.rotate(radian(f.winkel));
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fillStyle = f.farbe;
    ctx.fill();
    // Blickrichtung (Pfeil)
    ctx.beginPath();
    ctx.moveTo(8, 0);
    ctx.lineTo(20, 0);
    ctx.lineTo(8, -7);
    ctx.lineTo(8, 7);
    ctx.closePath();
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fill();
    ctx.restore();

    // Name
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "12px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(f.name, f.x, f.y + 36);

    // Sprechblase
    if (f.spruch) {
      ctx.font = "13px system-ui, sans-serif";
      const w = ctx.measureText(f.spruch).width + 16;
      const bx = f.x + 24;
      const by = f.y - 36;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.roundRect(bx, by, w, 26, 8);
      ctx.fill();
      ctx.fillStyle = "#111";
      ctx.textAlign = "left";
      ctx.fillText(f.spruch, bx + 8, by + 17);
    }
  }
}
