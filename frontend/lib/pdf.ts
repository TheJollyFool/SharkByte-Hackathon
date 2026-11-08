// Real-text PDF helpers on top of jsPDF (selectable text + clickable links via textWithLink).
import { jsPDF } from "jspdf";

export type RGB = [number, number, number];
export const C = {
  text: [30, 41, 59] as RGB,
  muted: [100, 116, 139] as RGB,
  blue: [29, 127, 214] as RGB,
  gray: [148, 163, 184] as RGB,
  orange: [234, 88, 12] as RGB,
  green: [5, 150, 105] as RGB,
  amber: [180, 83, 9] as RGB,
  band: [241, 245, 249] as RGB,
  amberBg: [254, 243, 199] as RGB,
};

export interface TextOpts {
  size?: number;
  bold?: boolean;
  color?: RGB;
  x?: number;
  maxW?: number;
  link?: string;
  after?: number;
}

export class PdfWriter {
  readonly doc: jsPDF;
  readonly margin = 40;
  readonly pageW: number;
  readonly pageH: number;
  y: number;

  constructor() {
    this.doc = new jsPDF({ unit: "pt", format: "letter" });
    this.pageW = this.doc.internal.pageSize.getWidth();
    this.pageH = this.doc.internal.pageSize.getHeight();
    this.y = this.margin;
  }

  get contentW(): number {
    return this.pageW - this.margin * 2;
  }

  ensure(h: number): void {
    if (this.y + h > this.pageH - this.margin - 14) {
      this.doc.addPage();
      this.y = this.margin;
    }
  }

  space(h: number): void {
    this.y += h;
  }

  setFont(size: number, bold: boolean, color: RGB): void {
    this.doc.setFont("helvetica", bold ? "bold" : "normal");
    this.doc.setFontSize(size);
    this.doc.setTextColor(color[0], color[1], color[2]);
  }

  width(str: string, size: number, bold = false): number {
    this.setFont(size, bold, C.text);
    return this.doc.getTextWidth(str);
  }

  fillRect(x: number, y: number, w: number, h: number, c: RGB): void {
    this.doc.setFillColor(c[0], c[1], c[2]);
    this.doc.rect(x, y, w, h, "F");
  }

  /** Wrapped paragraph (real text). With `link`, every line is a clickable, underlined link. */
  text(str: string, o: TextOpts = {}): void {
    const { size = 10, bold = false, color = C.text, x = this.margin, link, after = 2 } = o;
    const maxW = o.maxW ?? this.pageW - this.margin - x;
    this.setFont(size, bold, color);
    const lines = this.doc.splitTextToSize(str, maxW) as string[];
    const lh = size * 1.3;
    for (const ln of lines) {
      this.ensure(lh);
      this.setFont(size, bold, color);
      const base = this.y + size;
      if (link) {
        this.doc.textWithLink(ln, x, base, { url: link });
        const w = this.doc.getTextWidth(ln);
        this.doc.setDrawColor(color[0], color[1], color[2]);
        this.doc.setLineWidth(0.5);
        this.doc.line(x, base + 1.5, x + w, base + 1.5);
      } else {
        this.doc.text(ln, x, base);
      }
      this.y += lh;
    }
    this.y += after;
  }

  /** One line: left text (wrapped, optional link) and a small right-aligned label (e.g. the course code). */
  rowWithRight(left: string, right: string, o: { x: number; size?: number; bold?: boolean; color?: RGB; link?: string }): void {
    const size = o.size ?? 10;
    const rw = right ? this.width(right, 8) + 10 : 0;
    const maxW = this.pageW - this.margin - o.x - rw;
    this.setFont(size, o.bold ?? false, o.color ?? C.text);
    const lines = this.doc.splitTextToSize(left, maxW) as string[];
    const lh = size * 1.3;
    this.ensure(lh * lines.length);
    const top = this.y;
    lines.forEach((ln, i) => {
      this.setFont(size, o.bold ?? false, o.link ? C.blue : (o.color ?? C.text));
      const base = top + i * lh + size;
      if (o.link) this.doc.textWithLink(ln, o.x, base, { url: o.link });
      else this.doc.text(ln, o.x, base);
    });
    if (right) {
      this.setFont(8, false, C.muted);
      this.doc.text(right, this.pageW - this.margin, top + size, { align: "right" });
    }
    this.y = top + lines.length * lh;
  }

  /** Adds footer (disclaimer-free) + page numbers + a clickable mdc.edu link to every page, then downloads. */
  finish(filename: string, opts: { footerLeft: string; linkLabel: string; linkUrl: string; pageWord: string }): void {
    const n = this.doc.getNumberOfPages();
    for (let i = 1; i <= n; i++) {
      this.doc.setPage(i);
      const base = this.pageH - 24;
      this.setFont(8, false, C.muted);
      this.doc.text(opts.footerLeft, this.margin, base);
      this.setFont(8, false, C.blue);
      const lw = this.doc.getTextWidth(opts.linkLabel);
      const lx = this.pageW / 2 - lw / 2;
      this.doc.textWithLink(opts.linkLabel, lx, base, { url: opts.linkUrl });
      this.setFont(8, false, C.muted);
      this.doc.text(`${opts.pageWord} ${i} / ${n}`, this.pageW - this.margin, base, { align: "right" });
    }
    this.doc.save(filename);
  }
}
