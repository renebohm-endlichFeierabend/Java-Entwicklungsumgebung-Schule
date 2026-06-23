import { radian, naeheran, winkelDiff } from "./vektor";

/**
 * Eine Figur auf der Welt – die sichtbare (JavaScript-)Repräsentation.
 *
 * Bewusst ohne Pflicht-Vererbung (anders als Greenfoots `Actor`):
 * Eine Figur ist ein ganz normales Objekt, das man erzeugt und steuert.
 * Methoden setzen ein Ziel; gerendert wird weich animiert, damit Bewegung
 * für Schülerinnen und Schüler sichtbar/begreifbar wird.
 */
export class Figur {
  readonly id: number;
  name: string;
  farbe: string;
  /** Anzeigename der Klasse, z. B. "Figur", "Auto", "Roboter". */
  typ = "Figur";

  // Ist-Zustand (gerendert)
  x: number;
  y: number;
  winkel: number; // Grad, 0 = nach rechts

  // Soll-Zustand (Ziel der Animation)
  zielX: number;
  zielY: number;
  zielWinkel: number;

  spruch: string | null = null;
  spruchBisMs = 0;

  ausgewaehlt = false;

  constructor(id: number, name: string, x: number, y: number, farbe: string) {
    this.id = id;
    this.name = name;
    this.farbe = farbe;
    this.x = this.zielX = x;
    this.y = this.zielY = y;
    this.winkel = this.zielWinkel = 0;
  }

  /** Bewegt die Figur `n` Pixel in Blickrichtung. */
  geheVor(n: number): void {
    this.zielX += Math.cos(radian(this.zielWinkel)) * n;
    this.zielY += Math.sin(radian(this.zielWinkel)) * n;
  }

  /**
   * Verschiebt die Figur um (dx, dy) – die Richtung wurde bereits anderswo
   * berechnet (z. B. im Java-Code der Figur). Anders als `geheVor` rechnet
   * diese Methode selbst nichts aus, sie bewegt nur.
   */
  verschiebe(dx: number, dy: number): void {
    this.zielX += dx;
    this.zielY += dy;
  }

  dreheDich(grad: number): void {
    this.zielWinkel += grad;
  }

  setzePosition(x: number, y: number): void {
    this.zielX = x;
    this.zielY = y;
  }

  sage(text: string, dauerMs = 2500): void {
    this.spruch = text;
    this.spruchBisMs = performance.now() + dauerMs;
  }

  /** Pro Frame aufgerufen: nähert Ist- an Soll-Zustand an. */
  schritt(dtMs: number): void {
    const v = (220 * dtMs) / 1000; // Pixel pro Frame
    this.x = naeheran(this.x, this.zielX, v);
    this.y = naeheran(this.y, this.zielY, v);
    const dw = winkelDiff(this.winkel, this.zielWinkel);
    const w = (360 * dtMs) / 1000;
    this.winkel += Math.sign(dw) * Math.min(Math.abs(dw), w);
    if (this.spruch && performance.now() > this.spruchBisMs) this.spruch = null;
  }

  trifft(px: number, py: number): boolean {
    const r = 22;
    return (px - this.x) ** 2 + (py - this.y) ** 2 <= r * r;
  }
}
