// Rope Record - rules, calculations and checks. No screen code here (app.js draws the screens).
// Every rule and figure follows PRO-AIC-0608 as filed and carries its source. No figure from memory:
// each table below was checked against the page named in its comment.

const PI = Math.PI;

// ---------------------------------------------------------------------------------------------
// Documents the app is built from (shown on the About screen).
// ---------------------------------------------------------------------------------------------
export const PROCEDURE = {
  doc: "PRO-AIC-0608 Rev 00 (EIAC), consolidated amendment of 22-Nov-2026",
  file: "PRO-AIC-0608 Magnetic Rope Testing Procedure Rev 00.pdf",
  sha256: "7911383fd839c3cfcdb2ae670db5ad7adf9cd158de81609e1f85a97a3f7f4952",
  confirmedFiled: false,           // true only when the filed PDF from Drive replaces this copy
};
export const SOURCES = [
  ["Procedure", PROCEDURE.doc],
  ["Site sheet", "AIC-0608 MRT Site Sheet Rev 00 (22-Nov-2026 set)"],
  ["Report guide", "AIC-0608-G Rev 00 (22-Nov-2026 set)"],
  ["Equipment register", "AIC-0608-E – NOT LOADED: head and basic-unit serials typed by the engineer; liner and verification checked by hand"],
  ["Air values", "INTROS MH 6-26 / 22-45 / 40-70 operating manual v1.3, Table 4 (p. 27). Other heads: from the head's own manual (not in the app)"],
  ["ISO 4309 tables", "Tables 3 and 4 as copied in PRO-AIC-0608 §9.2.2; Annex H examples checked against ISO 4309:2017 pp. 51–56"],
  ["ISO 2408 C factors", "ISO 2408:2017 Annex C, Tables C.1 and C.2 (p. 18)"],
];
export const REGISTER_LOADED = false;
export const REGISTER_TEXT = "register AIC-0608-E not loaded – check by hand";

// ---------------------------------------------------------------------------------------------
// LF threshold rule - ONE table. Switch LF_RULESET to "amended" when the 24-Nov-2026 amendment is filed.
// below: [least, most] mV below the one-wire LF signal. kind: which setting the rule is about.
// ---------------------------------------------------------------------------------------------
export const LF_RULESETS = {
  filed: {
    name: "PRO-AIC-0608 as filed: C5 and §5.2 head limits",
    "BU-M": { kind: "alarm", below: [2, 3], words: "LF alarm 2–3 mV below the one-wire LF signal", src: "PRO-AIC-0608 §5.2 head limits, C5 (manual v1.3 2.4.1.9)" },
    "BU-16": { kind: "threshold", below: [2, 2], words: "calibration threshold 2 mV below the one-wire LF signal; alarm limit set separately", src: "PRO-AIC-0608 §5.2 head limits, C5" },
    "MH 80-120": { kind: "threshold", below: [0, 0], words: "LF threshold = the one-wire LF signal", src: "PRO-AIC-0608 §5.2 head limits, C5" },
  },
  amended: {
    name: "PRO-AIC-0608 C5 as amended 24-Nov-2026 (NOT FILED)",
    "BU-M": { kind: "threshold", below: [0, 0], words: "LF threshold = the one-wire LF signal; alarm optional", src: "PRO-AIC-0608 C5 (amendment 24-Nov-2026)" },
    "BU-16": { kind: "threshold", below: [0, 0], words: "LF threshold = the one-wire LF signal; alarm optional", src: "PRO-AIC-0608 C5 (amendment 24-Nov-2026)" },
    "MH 80-120": { kind: "threshold", below: [0, 0], words: "LF threshold = the one-wire LF signal; alarm optional", src: "PRO-AIC-0608 C5 (amendment 24-Nov-2026)" },
  },
};
export const LF_RULESET = "filed";
export const lfRule = (h) => (h ? LF_RULESETS[LF_RULESET][h.lfRule] : null);

// ---------------------------------------------------------------------------------------------
// Heads - PRO-AIC-0608 §5.2 head limits (p. 4). Serials are typed by the engineer until the register is loaded.
// sens: LF sensitivity, one wire as % of A (a function of D for the BU-16 heads).
// t4: the air value is in Intron manual v1.3 Table 4 (p. 27); false = the head's own manual, not in this app.
// ---------------------------------------------------------------------------------------------
const S52 = "PRO-AIC-0608 §5.2 head limits";
export const HEADS = [
  { model: "MH 6-26", unit: "BU-M", d: [6, 26], speed: "up to 2 m/s", temp: [-25, 55], settle: 0, sound: 0.5, wireLen: 0.3, sens: () => 0.5, sensText: "0.5 %", lfRule: "BU-M", t4: true },
  { model: "MH 22-45", unit: "BU-M", d: [22, 45], speed: "up to 2 m/s", temp: [-25, 55], settle: 0, sound: 0.5, wireLen: 0.3, sens: () => 0.5, sensText: "0.5 %", lfRule: "BU-M", t4: true },
  { model: "MH 40-70", unit: "BU-M", d: [40, 70], speed: "up to 2 m/s", temp: [-25, 55], settle: 0, sound: 0.5, wireLen: 0.3, sens: () => 0.5, sensText: "0.5 %", lfRule: "BU-M", t4: true },
  { model: "MH 20-40", unit: "BU-16", d: [20, 40], speed: "up to 2 m/s", temp: [-10, 50], settle: 2, sound: 0.5, wireLen: 0.3, sens: (D) => 20 / D, sensText: "20/D %", lfRule: "BU-16", t4: false },
  { model: "MH 40-64", unit: "BU-16", d: [40, 64], speed: "up to 2 m/s", temp: [-10, 50], settle: 2, sound: 0.5, wireLen: 0.3, sens: (D) => 32 / D, sensText: "32/D %", lfRule: "BU-16", t4: false },
  { model: "MH 80-120", unit: "analogue unit + basic unit", d: [80, 120], speed: "0.2–1.5 m/s", temp: [-10, 50], settle: 2, sound: 2, wireLen: 0.6, sens: () => 0.12, sensText: "0.12 %", lfRule: "MH 80-120", t4: false },
];
export const HEAD_CHOICES = HEADS.map((h) => h.model);
export const headOf = (m) => HEADS.find((h) => h.model === m) || null;
// Basic unit stated to have no verification certificate on file (Acumen, 24-Nov-2026), until the register is loaded.
export const BU_NO_CERT = ["505134"];

// Intron manual v1.3, Table 4 "LMA values for calibration without WRRS" (p. 27): [A from, A to, air value %].
export const T4 = {
  "MH 6-26": [[19, 70, 105], [70, 180, 106], [180, 450, 107]],
  "MH 22-45": [[215, 360, 101], [360, 600, 102], [600, 820, 104], [820, 1050, 106], [1050, 1350, 109]],
  "MH 40-70": [[520, 870, 102], [870, 1450, 104], [1450, 2000, 109], [2000, 2500, 113], [2500, 3000, 120]],
};
export const T4_SRC = "Intron manual v1.3 Table 4 (p. 27); PRO-AIC-0608 C4 route 2";

// Rope density factor K (A3; manual v1.3 2.4.2): only to choose the air value or S of route 3 when A is not known.
export const CORES = ["fibre core (FC)", "steel core (IWRC)", "wire strand core (WSC)", "locked coil"];
const K = { "fibre core (FC)": 0.5, "steel core (IWRC)": 0.65, "wire strand core (WSC)": 0.65, "locked coil": 0.8 };
const ISO_COL = { "fibre core (FC)": "C1", "steel core (IWRC)": "C2", "wire strand core (WSC)": "C3" };

// ISO 2408:2017 Annex C, Table C.1 / C.2 (p. 18): cross-sectional metallic area factors C1 / C2 / C3 (never W).
const ISO2408 = [
  ["C.1", "6 × 7", 0.369, 0.432, 0.441], ["C.1", "6 × 19", 0.384, 0.449, null], ["C.1", "6 × 24", 0.329, null, null],
  ["C.1", "6 × 36", 0.393, 0.460, null], ["C.1", "6 × 19M", 0.357, 0.398, 0.418], ["C.1", "6 × 37M", 0.357, 0.418, 0.418],
  ["C.1", "8 × 7", 0.335, 0.439, 0.520], ["C.1", "8 × 19", 0.349, 0.457, null], ["C.1", "8 × 36", 0.357, 0.468, null],
  ["C.1", "4 × 19 / 4 × 36", 0.429, null, null], ["C.1", "18 × 7 / 18 × 19", 0.408, null, 0.433],
  ["C.1", "34(M) × 7", 0.424, null, 0.428], ["C.1", "35(W) × 7", null, null, 0.480],
  ["C.2", "6 × K7", 0.426, null, null], ["C.2", "6 × K19 / 6 × K36", 0.453, 0.516, null], ["C.2", "8 × K19 / 8 × K36", 0.400, 0.516, null],
  ["C.2", "K4 × 35N", 0.429, null, null], ["C.2", "15 × K7", null, 0.528, null], ["C.2", "18 × K7 / 18 × K19", 0.449, null, 0.475],
  ["C.2", "35(W) × K7", null, null, 0.527],
].map(([table, cls, C1, C2, C3]) => ({ table, cls, C1, C2, C3 }));
export const ISO_CLASSES = ISO2408.map((r) => `${r.cls} (Table ${r.table})`);
export const ISO_NONE = "not in ISO 2408 Table C.1 / C.2";

// ISO 4309 Table 3 / Table 4 as copied in PRO-AIC-0608 §9.2.2 (p. 13). A ordinary / B Lang on sheaves or
// single-layer drum; C multi-layer drum. M5-M8 doubling not applied (§9.2.2).
const T3 = [
  ["01", 0, 50, [2, 4], [1, 2], [4, 8]], ["02", 51, 75, [3, 6], [2, 3], [6, 12]], ["03", 76, 100, [4, 8], [2, 4], [8, 16]],
  ["04", 101, 120, [5, 10], [2, 5], [10, 20]], ["05", 121, 140, [6, 11], [3, 6], [12, 22]], ["06", 141, 160, [6, 13], [3, 6], [12, 26]],
  ["07", 161, 180, [7, 14], [4, 7], [14, 28]], ["08", 181, 200, [8, 16], [4, 8], [16, 32]], ["09", 201, 220, [9, 18], [4, 9], [18, 36]],
  ["10", 221, 240, [10, 19], [5, 10], [20, 38]], ["11", 241, 260, [10, 21], [5, 10], [20, 42]], ["12", 261, 280, [11, 22], [6, 11], [22, 44]],
  ["13", 281, 300, [12, 24], [6, 12], [24, 48]],
].map(([rcn, lo, hi, A, B, C]) => ({ rcn, lo, hi, A, B, C }));
const T3_ABOVE_300 = { A: [0.04, 0.08], B: [0.02, 0.04], C: [0.08, 0.16] };
const T4R = [
  ["21", "4", 0, 100, [2, 4], [2, 4]], ["22", "3 or 4", 100, null, [2, 4], [4, 8]],
  ["23-1", "11+", 71, 100, [2, 4], [4, 8]], ["23-2", "11+", 101, 120, [3, 5], [5, 10]], ["23-3", "11+", 121, 140, [3, 5], [6, 11]],
  ["24", "11+", 141, 160, [3, 6], [6, 13]], ["25", "11+", 161, 180, [4, 7], [7, 14]], ["26", "11+", 181, 200, [4, 8], [8, 16]],
  ["27", "11+", 201, 220, [4, 9], [9, 18]], ["28", "11+", 221, 240, [5, 10], [10, 19]], ["29", "11+", 241, 260, [5, 10], [10, 21]],
  ["30", "11+", 261, 280, [6, 11], [11, 22]], ["31", "11+", 281, 300, [6, 12], [12, 24]], [null, "11+", 301, null, [6, 12], [12, 24]],
].map(([rcn, strands, lo, hi, A, C]) => ({ rcn, strands, lo, hi, A, C }));
// ISO 4309:2017 Annex H examples (pp. 51–56): construction -> RCN.
const ANNEX_H = [
  ["6x7-FC", "01", 3], ["6x19S-IWRC", "02", 3], ["6x19M-WSC", "04", 3], ["6x25F-IWRC", "04", 3], ["6x25TS-IWRC", "04", 3],
  ["6x36WS-IWRC", "09", 3], ["6x41WS-IWRC", "11", 3], ["6x37M-IWRC", "10", 3], ["8x19S-IWRC", "04", 3], ["8x25F-IWRC", "06", 3],
  ["8x19S-PWRC", "04", 3], ["8xK26WS-IWRC", "09", 3], ["6xK26WS-IWRC", "06", 3], ["6xK36WS-IWRC", "09", 3], ["8xK26WS-PWRC", "09", 3],
  ["4x29F", "21", 4], ["4xK26WS", "22", 4], ["K3x40", "22", 4], ["K4x40", "22", 4], ["K3x48", "22", 4], ["K4x48", "22", 4],
  ["17x7-FC", "23-1", 4], ["18x7-WSC or 19x7", "23-1", 4], ["12xP6:3xQ24 (Paragon)", "23-1", 4],
  ["34(W)x7-WSC or 35(W)x7", "23-2", 4], ["34(W)xK7-WSC", "23-2", 4], ["39(W)x7-WSC", "23-3", 4], ["39(W)xK7-KWSC", "23-3", 4],
  ["18xK19S-WSC or 19xK19S", "26", 4], ["34(W)xK19-WSC", "30", 4],
].map(([c, rcn, table]) => ({ c, rcn, table }));
export const ANNEX_H_CHOICES = ANNEX_H.map((x) => x.c);
export const ANNEX_OTHER = "Other (not in Annex H) – use the counts";
export const ROPE_TYPES = ["single-layer / parallel-closed (Table 3)", "rotation-resistant (Table 4)"];

export const CONSTR_SOURCES = ["rope certificate", "client", "counted on the rope"];               // A3
export const A_SOURCES = ["certificate", "maker's data", "calculated (ISO 2408, 2–60 mm only)", "not known"]; // site sheet
export const DMAX_SOURCES = ["measured on a wire taken from the rope", "certificate, maker's data or written confirmation", "not available"]; // A3
export const LAYS = ["ordinary", "Lang", "not known"];
export const RUNS = ["steel sheaves / single-layer drum", "multi-layer drum"];
export const LMA_ROUTES = ["Route 1 – reference rope", "Route 2 – on the rope", "Route 3 – added wires"];
export const LF_METHODS = ["base-trace configuration file loaded (repeat test)", "reference rope fault", "known break in the rope", "two added wires"];
export const YESNO = ["yes", "no"];
export const ACUMEN = "Acumen criterion, derived from ISO 4309 (R08)";

// ---------------------------------------------------------------------------------------------
// Record fields = CSV columns, in this order.
// ---------------------------------------------------------------------------------------------
const HEAD_FIELDS = ["head", "head_sn", "bu_sn", "liner", "temp", "settled", "selftest", "counter",
  "route", "r1_id", "r1_zero", "r1_known", "r1_seg2", "r2_from", "r2_to", "r2_passes", "air", "air_auto", "r2_zero",
  "r3_n", "r3_dw", "r3_set", "r3_zero", "cal_time",
  "lfm", "lf_at", "lfwd", "lflen", "lfgap", "sig", "thr", "alarm", "speedcomp", "config",
  "c6_done", "c6_zero", "c6_len", "c6_known", "lmaneg"];
export const HEAD_KEYS = HEAD_FIELDS;
export const FIELDS = [
  "type", "ref", "jobno", "client", "position", "date", "engineer", "location", "length",
  "dnom", "p1", "d1a", "d1b", "p2", "d2a", "d2b", "p3", "d3a", "d3b",
  "construction", "csrc", "annexh", "ropetype", "seale", "core", "outer", "wires", "lay", "runs", "spool_from", "spool_to",
  "isoclass", "asrc", "a", "dmaxsrc", "dmax",
  ...HEAD_FIELDS.map((f) => "h1_" + f), "h2on", ...HEAD_FIELDS.map((f) => "h2_" + f),
  "datum", "A_from", "A_to", "A_w", "A_gap", "B_from", "B_to", "B_w", "B_gap", "C_from", "C_to", "C_w", "C_gap",
  "counted", "checked", "notes",
];
export const SECTIONS = ["A", "B", "C"];
// Automatic values the engineer may override (only with a reason; saved with the time).
export const OVERRIDABLE = { A: "Metallic area A used", air: "Air value to type into the BU-M", lf6: "LF limit over 6d", lf30: "LF limit over 30d" };

export const num = (v) => { if (v == null) return null; const t = String(v).trim().replace(",", "."); if (t === "") return null; const x = Number(t); return isFinite(x) ? x : null; };
const pos = (x) => (x != null && x > 0 ? x : null);
export const r1 = (x, d = 1) => (x == null || !isFinite(x) ? "–" : Number(x).toFixed(d));
const nearest = (x) => Math.floor(x + 0.5);
export const activeHeads = (rec) => (rec.h2on === "yes" ? [1, 2] : [1]);
const ovr = (rec, k) => { const o = (rec.ovr || {})[k]; return o && num(o.value) != null ? num(o.value) : null; };

function isoFactor(rec, d) {
  const row = ISO2408.find((r) => `${r.cls} (Table ${r.table})` === rec.isoclass);
  if (!row) return { ok: false, why: rec.isoclass ? "construction not in ISO 2408 Table C.1 / C.2 – A not known (A3, R06)" : "ISO 2408 class not chosen" };
  const col = ISO_COL[rec.core];
  if (!col) return { ok: false, why: rec.core ? `ISO 2408 gives no factor for ${rec.core}` : "core not chosen" };
  const C = row[col];
  if (C == null) return { ok: false, why: `ISO 2408 Table ${row.table} gives no ${col} factor for ${row.cls} – A not known (A3, R06)` };
  if (d == null) return { ok: false, why: "nominal diameter not entered" };
  if (d < 2 || d > 60) return { ok: false, why: `d ${d} mm is outside 2–60 mm: ISO 2408 factors not used – A not known (A3, R06)` };
  return { ok: true, C, col, row, A: Math.round(C * d * d * 10) / 10 };
}

export function airFromT4(model, A) {
  const t = T4[model];
  if (!t || A == null) return null;
  for (const [a, b, v] of t) if (A >= a && A <= b) return { value: v, from: a, to: b };
  return { value: null, out: true, lo: t[0][0], hi: t.at(-1)[1] };
}

function rcnFor(rec) {
  if (!rec.annexh) return { ok: false, why: "ISO 4309 Annex H construction not chosen" };
  if (rec.annexh !== ANNEX_OTHER) {
    const e = ANNEX_H.find((x) => x.c === rec.annexh);
    if (!e) return { ok: false, why: "construction not in Annex H" };
    const rows = e.table === 3 ? T3 : T4R;
    return { ok: true, table: e.table, row: rows.find((r) => r.rcn === e.rcn), rcn: e.rcn, how: `RCN ${e.rcn} from ISO 4309 Annex H for ${e.c}` };
  }
  const t = rec.ropetype === ROPE_TYPES[0] ? 3 : rec.ropetype === ROPE_TYPES[1] ? 4 : null;
  const s = pos(num(rec.outer)), w = pos(num(rec.wires));
  if (!t || !s || !w) return { ok: false, why: "not in Annex H: rope type, outer strands and wires per strand all needed (§9.2.2)" };
  const n = s * w;
  let how = `n = ${s} × ${w} = ${n} load-bearing outer wires, fillers excluded`;
  if (t === 3) {
    let i = T3.findIndex((r) => n >= r.lo && n <= r.hi);
    if (i < 0 && n > 300) return { ok: true, table: 3, above300: true, n, rcn: null, how: how + " → more than 300 outer wires: factor × n" };
    if (i < 0) return { ok: false, why: `n = ${n} is not in Table 3` };
    if (rec.seale === "yes" && w <= 19) { i = Math.max(0, i - 2); how += "; Seale outer strands, 19 wires or fewer: two rows above"; }
    return { ok: true, table: 3, row: T3[i], rcn: T3[i].rcn, n, how: how + ` → RCN ${T3[i].rcn}` };
  }
  const fits = T4R.filter((r) => {
    const okS = (r.strands === "4" && s === 4) || (r.strands === "3 or 4" && (s === 3 || s === 4)) || (r.strands === "11+" && s >= 11);
    return okS && n >= r.lo && n <= (r.hi ?? 1e9);
  });
  if (fits.length !== 1) return { ok: false, why: fits.length ? `n = ${n} fits RCN ${fits.map((r) => r.rcn).join(" and ")} – Table 4 as printed overlaps; choose the Annex H construction` : `no Table 4 row for ${s} outer strands and n = ${n}` };
  return { ok: true, table: 4, row: fits[0], rcn: fits[0].rcn, n, how: how + ` → RCN ${fits[0].rcn ?? "(over 300)"}` };
}
const tableFigures = (r, col) => (r.above300 ? T3_ABOVE_300[col].map((f) => nearest(f * r.n)) : r.row[col]);

function lfLimit(rec, c) {
  let out;
  if (c.A != null && c.dmax) {
    const wires = c.A * 4 / (PI * c.dmax * c.dmax);
    out = { ok: true, route: `ISO 4309 Annex C formula${c.Aestimate ? " – estimate" : ""}`, src: "PRO-AIC-0608 §9.2.1, E3; ISO 4309 Table C.1",
      l6: nearest(0.06 * wires), l30: nearest(0.10 * wires),
      working: `0.06 × A × 4 ÷ (π × δmax²) = 0.06 × ${r1(c.A)} × 4 ÷ (π × ${c.dmax}²) = ${r1(0.06 * wires, 2)} → ${nearest(0.06 * wires)}; 0.10 × … = ${r1(0.10 * wires, 2)} → ${nearest(0.10 * wires)} (nearest whole wire)` };
  } else {
    const why = c.A == null ? "A not known" : "δmax not available";
    const r = rcnFor(rec);
    if (!r.ok) return { ok: false, why: `LF limit not calculated: ${why} and ${r.why} (A3, R06)`, src: "PRO-AIC-0608 A3, §9.2.2" };
    let col, words;
    if (r.table === 3) {
      if (rec.lay === "ordinary") { col = "A"; words = "sheaves / single-layer drum, ordinary lay"; }
      else if (rec.lay === "Lang") { col = "B"; words = "sheaves / single-layer drum, Lang lay"; }
      else return { ok: false, why: `LF limit not calculated: ${why} and the lay (ordinary / Lang) is needed for Table 3 (§9.2.2)`, src: "PRO-AIC-0608 §9.2.2" };
    } else { col = "A"; words = "sheaves / single-layer drum"; }
    const [s6, s30] = tableFigures(r, col);
    out = { ok: true, route: `ISO 4309 Table ${r.table}, RCN ${r.rcn ?? "> 300 wires"}, column ${words}: ${ACUMEN}`, src: "PRO-AIC-0608 §9.2.2, E3 (R08)",
      l6: s6, l30: s30, rcn: r.rcn, table: r.table,
      working: `${why}, so Table ${r.table}: ${r.how}; ${s6} wires over 6d / ${s30} over 30d; M5–M8 doubling not applied${r.above300 ? "; > 300 wires: factor × n, nearest whole wire" : ""}` };
    if (rec.runs === RUNS[1]) { const [d6, d30] = tableFigures(r, "C"); out.drum6 = d6; out.drum30 = d30; out.working += `; multi-layer drum column for the length that spools on the drum: ${d6} / ${d30}`; }
  }
  out.auto6 = out.l6; out.auto30 = out.l30;
  if (ovr(rec, "lf6") != null) out.l6 = ovr(rec, "lf6");
  if (ovr(rec, "lf30") != null) out.l30 = ovr(rec, "lf30");
  return out;
}

// ---------------------------------------------------------------------------------------------
// compute(rec): every automatic value, with its working and source.
// ---------------------------------------------------------------------------------------------
export function compute(rec) {
  const g = (k) => pos(num(rec[k]));
  const dn = g("dnom");
  const posAv = [1, 2, 3].map((i) => { const a = g(`d${i}a`), b = g(`d${i}b`); return a && b ? (a + b) / 2 : null; });
  const have = posAv.filter((x) => x != null);
  const D = have.length ? Math.max(...have) : null;            // largest measured, incl. coating, selects head and liners (B2, C2)
  const k = K[rec.core] ?? null;
  const S = dn && k ? k * PI * dn * dn / 4 : null;               // A3: S = K × π × d² ÷ 4, d nominal - air value / route 3 only
  const iso = isoFactor(rec, dn);
  let Aauto = null, Asrc = rec.asrc || "", Aestimate = false;
  if (rec.asrc === A_SOURCES[2]) { Aauto = iso.ok ? iso.A : null; Aestimate = true; }
  else if (rec.asrc === A_SOURCES[0] || rec.asrc === A_SOURCES[1]) Aauto = g("a");
  const A = ovr(rec, "A") ?? Aauto;
  const Aair = A ?? S;
  const dmax = rec.dmaxsrc === DMAX_SOURCES[2] ? null : g("dmax");
  const wireArea = dmax ? PI * dmax * dmax / 4 : null;
  const outer = g("outer"), wires = g("wires");
  const n = outer && wires ? outer * wires : null;
  const c = { dn, posAv, D, k, S, iso, Aauto, A, Asrc, Aestimate, Aair, dmax, wireArea, n,
    share: wireArea && A ? wireArea / A * 100 : null,
    l6: dn ? 6 * dn / 1000 : null, l30: dn ? 30 * dn / 1000 : null };
  c.lf = lfLimit(rec, c);
  c.heads = activeHeads(rec).map((i) => {
    const h = headOf(rec[`h${i}_head`]);
    const out = { i, h };
    if (!h) return out;
    out.rule = lfRule(h);
    out.sens = D ? h.sens(D) : null;
    if (h.t4) {
      const t = airFromT4(h.model, Aair);
      out.t4 = t;
      out.airAuto = t && t.value != null ? t.value : null;
      out.airWorking = Aair == null ? "A not known yet" : t && t.value != null
        ? `Table 4, ${h.model}: ${A != null ? "A" : "S = K × π × d² ÷ 4"} = ${r1(Aair)} mm² is in ${t.from}–${t.to} mm² → ${t.value} %`
        : `A ${r1(Aair)} mm² is outside ${h.model}'s Table 4 rows (${t.lo}–${t.hi} mm²)`;
    } else out.airWorking = `${h.model}: air value from the head's own manual (not in this app)`;
    out.air = ovr(rec, `air${i}`) ?? out.airAuto ?? null;
    const route3 = rec[`h${i}_route`] === LMA_ROUTES[2];
    if (route3) {
      const nW = g(`h${i}_r3_n`), dw = g(`h${i}_r3_dw`);
      if (nW && dw && Aair) { out.dS = nW * PI * dw * dw / 4; out.r3set = -(out.dS / Aair) * 100; }
    }
    return out;
  });
  c.working = [
    ["Measured diameter (largest of the positions)", D ? `${r1(D, 2)} mm` : "–", have.length ? `position averages ${posAv.map((x) => r1(x, 2)).join(" / ")} mm; each = average of two at right angles` : "", "PRO-AIC-0608 B2, C2"],
    ["Metallic area A used", A != null ? `${r1(A)} mm²${ovr(rec, "A") != null ? " (overridden)" : ""}` : "not known", A != null ? `source: ${Asrc}${Aestimate ? ` – A = C × d² = ${iso.C.toFixed(3)} × ${dn}² (Table ${iso.row.table}, ${iso.row.cls}, ${iso.col}); LF limits marked 'estimate'` : ""}` : iso.ok ? "" : iso.why, "PRO-AIC-0608 A3; ISO 2408 Annex C (p. 18)"],
    ["Rope area S (K)", S ? `${r1(S, 0)} mm²` : "–", S ? `K × π × d² ÷ 4 = ${k} × π × ${dn}² ÷ 4 – only to choose the air value / route 3 S when A is not known; not reported` : "", "PRO-AIC-0608 A3; manual v1.3 2.4.2"],
    ["One-wire area", wireArea ? `${r1(wireArea, 2)} mm²` : "–", wireArea ? `π × δmax² ÷ 4 = π × ${dmax}² ÷ 4` : "δmax not available", "PRO-AIC-0608 A3"],
    ["Single-wire share", c.share ? `${r1(c.share, 2)} % of A` : "–", c.share ? "(π × δmax² ÷ 4) ÷ A × 100, compared with the head's LF sensitivity" : "needs A and δmax", "PRO-AIC-0608 A3"],
    ["D ÷ δmax", dn && dmax ? r1(dn / dmax, 1) : "–", dn && dmax ? `${dn} ÷ ${dmax}` : "", "nominal d"],
    ["Load-bearing outer wires n", n ?? "–", n ? `${outer} strands × ${wires} wires, fillers excluded` : "", "PRO-AIC-0608 §9.2.2"],
    ["6d / 30d", dn ? `${r1(c.l6, 3)} m / ${r1(c.l30, 2)} m` : "–", dn ? `6 × ${dn} mm and 30 × ${dn} mm, nominal d` : "", "ISO 4309 Table C.1; site sheet"],
    ["RCN", c.lf.rcn ?? (rcnFor(rec).ok ? rcnFor(rec).rcn ?? "> 300 wires" : "–"), rcnFor(rec).ok ? rcnFor(rec).how : rcnFor(rec).why, "ISO 4309 Annex H (pp. 51–56); PRO-AIC-0608 §9.2.2"],
    ["LF limit 6d / 30d", c.lf.ok ? `${c.lf.l6} / ${c.lf.l30} wires${c.lf.drum6 != null ? ` (multi-layer drum ${c.lf.drum6} / ${c.lf.drum30})` : ""}${ovr(rec, "lf6") != null || ovr(rec, "lf30") != null ? " (overridden)" : ""}` : "not calculated", c.lf.ok ? `${c.lf.route}. ${c.lf.working}` : c.lf.why, c.lf.src],
  ];
  for (const hc of c.heads) if (hc.h) {
    c.working.push([`Air value to type into the BU-M – ${hc.h.model}`, hc.air != null ? `${hc.air} %` : "from the head's own manual", hc.airWorking, T4_SRC]);
    c.working.push([`LF rule – ${hc.h.model}`, hc.rule.words, `rule set: ${LF_RULESETS[LF_RULESET].name}`, hc.rule.src]);
  }
  return c;
}

// ---------------------------------------------------------------------------------------------
// checks(rec, c): every rule broken, with what is wrong, the correct value or range, and the clause.
// level red = fix, or give a reason (saved with the time); amber = warning, can continue.
// ---------------------------------------------------------------------------------------------
const ZERO_FIELDS = { length: "Rope length", dnom: "Nominal diameter", d1a: "Diameter 1a", d1b: "Diameter 1b", d2a: "Diameter 2a", d2b: "Diameter 2b", d3a: "Diameter 3a", d3b: "Diameter 3b",
  outer: "Outer strands", wires: "Wires per strand", a: "Metallic area A", dmax: "δmax", A_gap: "Section A gap", B_gap: "Section B gap", C_gap: "Section C gap" };
const HEAD_ZERO = { air: "Air value", lfwd: "Wire diameter", lflen: "Wire length", lfgap: "Gap", sig: "One-wire LF signal", thr: "LF threshold", alarm: "LF alarm", r3_dw: "Added wire diameter", r1_known: "Known LMA of segment 2" };
const SCREEN_OF = { length: "job", A_gap: "sections", B_gap: "sections", C_gap: "sections" };
const HSCREEN = { head: "c1", head_sn: "c1", bu_sn: "c1", liner: "c2", temp: "c2", settled: "c3", selftest: "c3", counter: "c3",
  route: "c4", r1_zero: "c4", r1_known: "c4", r1_seg2: "c4", r2_from: "c4", r2_to: "c4", r2_passes: "c4", air: "c4air", r2_zero: "c4air", r3_n: "c4", r3_dw: "c4", r3_set: "c4", r3_zero: "c4",
  lfm: "c5", lfwd: "c5", lflen: "c5", lfgap: "c5", sig: "c5sig", thr: "c5thr", alarm: "c5thr", c6_zero: "c6", c6_len: "c6", c6_known: "c6", lmaneg: "c6", c6_done: "c6" };

export function checks(rec, c = compute(rec)) {
  const out = [];
  const add = (level, id, field, screen, text, want, src) => out.push({ level, id, field, screen, text, want, src });
  const raw = (k) => String(rec[k] ?? "").trim();
  const isZero = (k) => raw(k) !== "" && num(rec[k]) === 0;
  const ZSRC = "Rope Record rule: blank = not available (PRO-AIC-0608 A3: a value is never assumed)";

  for (const [k, lab] of Object.entries(ZERO_FIELDS)) if (isZero(k)) add("red", "zero-" + k, k, SCREEN_OF[k] || "rope", `${lab}: 0 typed.`, "Leave the box blank if the value is not available – never type 0.", ZSRC);
  // diameter (B2)
  const dn = c.dn;
  if (c.D && dn) {
    const p = (c.D - dn) / dn * 100;
    const lim = rec.core === CORES[0] ? 10 : 5;
    if (p >= lim) add("amber", "dia-up", "d1a", "rope", `Measured diameter ${r1(c.D, 2)} mm is ${r1(p, 1)} % above the nominal ${dn} mm.`, `An increase of ${lim} % or more (${rec.core === CORES[0] ? "fibre" : "steel"} core) is investigated and discard considered; check the nominal size.`, "PRO-AIC-0608 B2, §9.3 (ISO 4309 6.7.6)");
    if (p < 0) add("amber", "dia-down", "d1a", "rope", `Measured diameter ${r1(c.D, 2)} mm is below the nominal ${dn} mm.`, "Decrease is evaluated against the reference diameter, never the nominal – record the reference diameter if known.", "PRO-AIC-0608 B2, §9.3 (ISO 4309 Table 5)");
  }
  if (dn && dn > 63.5) add("amber", "over635", "dnom", "rope", `Rope ${dn} mm is over 63.5 mm.`, "Tested only by client agreement recorded on the Job Order.", "PRO-AIC-0608 §1.2, A1 (ASTM E1571-21 1.1.1)");
  // A and δmax (A3)
  if (rec.asrc === A_SOURCES[2] && !c.iso.ok) add("red", "iso", "isoclass", "rope", `A cannot be calculated from ISO 2408: ${c.iso.why}.`, "Use the certificate or maker's A, or choose 'not known'.", "PRO-AIC-0608 A3; ISO 2408 Annex C (2–60 mm only)");
  if ((rec.asrc === A_SOURCES[0] || rec.asrc === A_SOURCES[1]) && c.Aauto == null && !isZero("a")) add("red", "a-missing", "a", "rope", `A source is "${rec.asrc}" but no A is entered.`, "Type A from the document, or choose 'not known'.", "PRO-AIC-0608 A3");
  if (c.A != null && dn && c.A >= PI * dn * dn / 4) add("red", "a-circle", "a", "rope", `A ${r1(c.A)} mm² is not less than the circle area π × d² ÷ 4 = ${r1(PI * dn * dn / 4)} mm².`, "A is the metallic area (always less than the circle area); the circle area is never entered as A.", "PRO-AIC-0608 A3, §9.2.1");
  if (rec.dmaxsrc && rec.dmaxsrc !== DMAX_SOURCES[2] && !pos(num(rec.dmax)) && !isZero("dmax")) add("red", "dmax-missing", "dmax", "rope", `δmax source is "${rec.dmaxsrc}" but no δmax is entered.`, "Type δmax, or choose 'not available' (then the ISO 4309 table limit is used).", "PRO-AIC-0608 A3");
  if (rec.runs === RUNS[1] && (raw("spool_from") === "" || raw("spool_to") === "")) add("amber", "spool", "spool_to", "rope", "Multi-layer drum: the spooling length is not entered.", "Enter the length that spools on the drum; the drum column applies only there.", "PRO-AIC-0608 §9.2.2; site sheet");

  for (const i of activeHeads(rec)) {
    const p = `h${i}_`, scr = (f) => `h${i}-${HSCREEN[f]}`;
    const hc = c.heads.find((x) => x.i === i) || {};
    const h = hc.h, name = h ? h.model : `Head ${i}`;
    const A2 = (lev, id, f, text, want, src) => add(lev, `${id}-${p}`, p + f, scr(f), `${name}: ${text}`, want, src);
    for (const [k, lab] of Object.entries(HEAD_ZERO)) if (isZero(p + k)) A2("red", "zero-" + k, k, `${lab}: 0 typed.`, "Leave the box blank if the value is not available – never type 0.", ZSRC);
    // C1 equipment status
    if (h && !REGISTER_LOADED) A2("amber", "reg", "bu_sn", `verification status of head S/N ${raw(p + "head_sn") || "?"} and basic unit S/N ${raw(p + "bu_sn") || "?"} – ${REGISTER_TEXT}.`, "Both on the register and verified within the last 12 months.", "PRO-AIC-0608 C1, §5.4");
    if (BU_NO_CERT.includes(raw(p + "bu_sn"))) A2("red", "bucert", "bu_sn", `basic unit S/N ${raw(p + "bu_sn")} has no verification certificate on file.`, "Basic unit verified within the last 12 months; otherwise not used.", "PRO-AIC-0608 C1, §5.4");
    if (!h) continue;
    // C2 head range, liner, temperature
    if (c.D && (c.D < h.d[0] || c.D > h.d[1])) A2("red", "range", "head", `measured diameter ${r1(c.D, 2)} mm is outside the head range.`, `${h.model} takes ${h.d[0]}–${h.d[1]} mm including coating; choose a head that covers the rope.`, `${S52}; C2`);
    if (raw(p + "liner")) A2("amber", "liner", "liner", `liner ${raw(p + "liner")} – ${REGISTER_TEXT}.`, `Liner range must cover ${c.D ? r1(c.D, 2) + " mm" : "the measured diameter"} (maker's liner table).`, "PRO-AIC-0608 C2 (AIC-0608-E §3)");
    const t = num(rec[p + "temp"]);
    if (t != null && (t < h.temp[0] || t > h.temp[1])) A2("red", "temp", "temp", `air temperature ${t} °C is outside the head's range.`, `${h.temp[0]} to +${h.temp[1]} °C; not tested until it is inside.`, `${S52}; C2`);
    if (hc.sens != null && c.share != null && c.share < hc.sens) A2("amber", "share", "head", `single-wire share ${r1(c.share, 2)} % of A is below the head's LF sensitivity ${r1(hc.sens, 2)} % (${h.sensText}).`, "LF trace reported, LF not evaluated: LIMITED (R06) – use the head with the lowest LF sensitivity limit.", "PRO-AIC-0608 A3, C2");
    // C3
    if (rec[p + "settled"] === "no") A2("red", "settle", "settled", `instrument not settled ${h.settle} h as the manual states.`, "Not calibrated until the settling time is met.", `${S52}; C3`);
    if (rec[p + "selftest"] === "no") A2("red", "selftest", "selftest", "self-test did not pass.", "Not used until corrected.", "PRO-AIC-0608 C3");
    if (rec[p + "counter"] === "no") A2("red", "counter", "counter", "distance counter does not count both ways.", "Not used until corrected.", "PRO-AIC-0608 C3");
    // C4 LMA calibration
    const route = rec[p + "route"];
    const zchk = (f, lab) => { const z = num(rec[p + f]); if (z != null && Math.abs(z) > 0.5) A2("red", "z-" + f, f, `${lab} ${z} %.`, "0 ± 0.5 %. Repeat the calibration; still outside → head withdrawn.", "PRO-AIC-0608 C4 (manual v1.3 2.4.2.8)"); };
    if (route === LMA_ROUTES[0]) {
      zchk("r1_zero", "zero segment reads");
      const kn = num(rec[p + "r1_known"]), s2 = num(rec[p + "r1_seg2"]);
      if (kn != null && s2 != null && Math.abs(s2 - kn) > 0.5) A2("red", "seg2", "r1_seg2", `segment 2 reads ${s2} %, known value ${kn} %.`, `${r1(kn - 0.5, 1)} to ${r1(kn + 0.5, 1)} % (within ± 0.5 % of its known value).`, "PRO-AIC-0608 C4");
      if (kn != null && (kn < 14 || kn > 16)) A2("amber", "seg2known", "r1_known", `known LMA of segment 2 is ${kn} %.`, "A reference rope made to §5.3 has segment 2 at 15 ± 1 %.", "PRO-AIC-0608 §5.3");
    }
    if (route === LMA_ROUTES[1] || route === LMA_ROUTES[2]) {
      const zf = num(rec[p + "r2_from"]), zt = num(rec[p + "r2_to"]);
      if (zf != null && zt != null) {
        if (zf < 0 || zt < 0) A2("red", "zneg", "r2_from", "sound section has a negative distance.", "Measure every distance from the datum in one direction.", "PRO-AIC-0608 D1");
        else if (zt - zf < h.sound) A2("red", "sound", "r2_to", `sound section ${r1(zt - zf, 2)} m is too short.`, `At least ${h.sound} m with no loss for ${h.model}; otherwise use route 1 or 3.`, `${S52}; C4`);
      }
      if (rec[p + "r2_passes"] === "no") A2("red", "passes", "r2_passes", "head not passed at least twice each way over the sound section.", `At least two passes each way, ${h.model === "MH 80-120" ? "± 2 m" : "at least 0.75 m"}.`, "PRO-AIC-0608 C4; site sheet");
    }
    if (route === LMA_ROUTES[1]) {
      zchk("r2_zero", "zero check reads");
      const air = num(rec[p + "air"]);
      if (!h.t4) A2("amber", "airman", "air", "air value from the head's own manual – not in this app.", "Use the head's own manual; Table 4 covers MH 6-26 / 22-45 / 40-70 only.", "PRO-AIC-0608 C4 route 2");
      else if (air != null && air !== 0 && rec[p + "air_auto"] !== "yes") {
        if (hc.t4 && hc.t4.out) A2("red", "airout", "air", `A ${r1(c.Aair)} mm² is outside the head's Table 4 rows.`, `${h.model} Table 4 covers ${hc.t4.lo}–${hc.t4.hi} mm²; check the head and A.`, T4_SRC);
        else if (hc.air != null && air !== hc.air) A2("red", "air", "air", `air value entered ${air} %.`, `Must be ${hc.air} % – ${hc.airWorking}.`, T4_SRC);
      }
    }
    if (route === LMA_ROUTES[2]) {
      zchk("r3_zero", "zero check reads");
      if (hc.r3set != null && Math.abs(hc.r3set) < 5) A2("red", "r3min", "r3_n", `added wires give only ${r1(Math.abs(hc.r3set), 2)} % LMA.`, "At least 5 % LMA – add wires, or LMA is not evaluated (LIMITED).", "PRO-AIC-0608 C4 route 3");
      const set = num(rec[p + "r3_set"]);
      if (set != null && hc.r3set != null && Math.abs(set - hc.r3set) > 0.1) A2("red", "r3set", "r3_set", `LMA set ${set} %.`, `Must be −(ΔS ÷ S) × 100 = ${r1(hc.r3set, 2)} %.`, "PRO-AIC-0608 C4 route 3");
    }
    // C5 LF calibration
    const m = rec[p + "lfm"], sig = pos(num(rec[p + "sig"])), thr = pos(num(rec[p + "thr"])), alarm = pos(num(rec[p + "alarm"]));
    const wd = pos(num(rec[p + "lfwd"])), gap = pos(num(rec[p + "lfgap"])), len = pos(num(rec[p + "lflen"]));
    if (m === LF_METHODS[3]) {
      if (wd && gap && (gap < wd || gap > 3 * wd)) A2("red", "gap", "lfgap", `gap ${gap} mm between the added wires.`, `1 to 3 wire diameters: ${r1(wd, 2)}–${r1(3 * wd, 2)} mm.`, "PRO-AIC-0608 C5 (manual v1.3 2.4.2.9)");
      if (len && len < h.wireLen) A2("red", "wlen", "lflen", `added wires ${len} m long.`, `Each at least ${h.wireLen} m for ${h.model}.`, "PRO-AIC-0608 C5, §5.2");
    }
    if ((c.dmax == null || c.A == null) && m && m !== LF_METHODS[3] && m !== LF_METHODS[0]) A2("amber", "lfadd", "lfm", "δmax or A not available.", "LF is calibrated with added wires of known diameter; record the wire diameter and the one-wire signal.", "PRO-AIC-0608 A3, §9.2.2");
    const rule = hc.rule;
    if (rule && sig) {
      const [lo, hi] = [sig - rule.below[1], sig - rule.below[0]];
      const want = lo === hi ? `${r1(lo, 1).replace(/\.0$/, "")} mV` : `${r1(lo, 1).replace(/\.0$/, "")}–${r1(hi, 1).replace(/\.0$/, "")} mV`;
      const val = rule.kind === "alarm" ? alarm : thr;
      const fld = rule.kind === "alarm" ? "alarm" : "thr";
      if (val != null && val < lo) A2("red", "lfrule", fld, `LF ${rule.kind} ${val} mV is too low.`, `${rule.words}: ${want} (one-wire signal ${sig} mV).`, rule.src);
      if (val != null && val > hi) {
        if (rule.kind === "threshold") A2("red", "lfrule", fld, `LF threshold ${val} mV is above ${want}.`, `${rule.words}: ${want} (one-wire signal ${sig} mV). Raised for rope noise only with the reason recorded.`, `${rule.src}; C5 (raised threshold – Acumen criterion)`);
        else A2("red", "lfrule", fld, `LF alarm ${val} mV is not ${want}.`, `${rule.words}: ${want} (one-wire signal ${sig} mV).`, rule.src);
      }
    }
    // C6 closing check, E1
    if (rec[p + "c6_done"] === "no") A2("amber", "c6", "c6_done", "closing check not recorded yet.", "After the recording: zero 0 ± 0.5 %, recorded length within 1 % of a known length.", "PRO-AIC-0608 C6");
    const cz = num(rec[p + "c6_zero"]);
    if (cz != null && Math.abs(cz) > 0.5) A2("red", "c6zero", "c6_zero", `closing zero ${cz} %.`, "0 ± 0.5 % – find the cause; correct with the software shift and record it, or repeat the recording.", "PRO-AIC-0608 C6");
    const L = pos(num(rec[p + "c6_len"])), Lk = pos(num(rec[p + "c6_known"]));
    if (L && Lk && Math.abs(L - Lk) / Lk > 0.01) A2("red", "c6len", "c6_len", `recorded length ${L} m vs known ${Lk} m (${r1(Math.abs(L - Lk) / Lk * 100, 2)} %).`, "Within 1 % – otherwise positions are written as approximate.", "PRO-AIC-0608 C6");
    const neg = num(rec[p + "lmaneg"]);
    if (neg != null && neg < -1) A2("red", "lmaneg", "lmaneg", `negative LMA ${neg} %.`, "Not more than 1 % negative – find the cause (zero section not sound, steel nearby, magnetic mark); re-reference or repeat.", "PRO-AIC-0608 E1");
  }
  if (rec.type === "reference") {
    const L = pos(num(rec.length));
    for (const s of SECTIONS) {
      const a = num(rec[s + "_from"]), b = num(rec[s + "_to"]);
      if (a != null && b != null) {
        if (a < 0 || b < 0) add("red", `sneg-${s}`, s + "_from", "sections", `Section ${s}: negative distance.`, "Measure every distance from the datum in one direction.", "PRO-AIC-0608 D1");
        else if (b <= a) add("red", `sord-${s}`, s + "_to", "sections", `Section ${s}: 'to' is not after 'from'.`, "'To' must be greater than 'from'.", "PRO-AIC-0608 D1");
        else if (L && b > L) add("red", `slen-${s}`, s + "_to", "sections", `Section ${s} ends at ${b} m, beyond the rope length ${L} m.`, `Within 0–${L} m.`, "PRO-AIC-0608 §5.3");
      }
      const gp = pos(num(rec[s + "_gap"]));
      if (gp && c.dmax && gp < 3 * c.dmax) add("amber", `sgap-${s}`, s + "_gap", "sections", `Section ${s}: gap ${gp} mm is under 3 × δmax (${r1(3 * c.dmax, 1)} mm).`, "The manual's LF sensitivity assumes a gap of at least 3 wire diameters.", "Intron manual v1.3 Table 1 note; PRO-AIC-0608 §5.3");
    }
  }
  if (!c.lf.ok && rec.annexh) add("amber", "lf", null, "results", c.lf.why, "Enter A and δmax, or the construction / counts, lay and how the rope runs.", c.lf.src);
  for (const [k, o] of Object.entries(rec.ovr || {})) if (o && String(o.value ?? "").trim() !== "") add("amber", "ovr-" + k, null, "results", `${OVERRIDABLE[k.replace(/\d$/, "")] || k} overridden to ${o.value} (reason: ${o.reason}).`, "Automatic value replaced by the engineer.", "Rope Record: override with a reason, saved with the time");
  return out;
}

export const reasonOf = (rec, id) => { const r = (rec.reasons || {})[id]; return r && String(r.text || "").trim() ? r : null; };
export const unresolved = (list, rec) => list.filter((x) => x.level === "red" && !reasonOf(rec, x.id));

// ---------------------------------------------------------------------------------------------
// CSV: one line per record. UTF-8 with BOM, CRLF.
// ---------------------------------------------------------------------------------------------
const CALC_COLS = ["D_measured_mm", "A_used_mm2", "A_source", "S_K_mm2", "wire_area_mm2", "single_wire_share_pct", "n_outer_wires", "RCN",
  "len_6d_m", "len_30d_m", "lf_route", "lf_6d", "lf_30d", "lf_drum_6d", "lf_drum_30d", "lf_working",
  "h1_air_to_type", "h1_lf_rule", "h2_air_to_type", "h2_lf_rule", "lf_ruleset", "procedure_copy"];
export const CSV_HEAD = ["record_id", "saved_at", "app_version", ...FIELDS, ...CALC_COLS, "problems_red", "problems_amber", "reasons_with_time", "overrides_with_time"];
const q = (x) => { const t = String(x ?? ""); return /[",\n\r]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t; };
const fx = (x, d) => (x == null || !isFinite(x) ? "" : Number(x.toFixed(d)));
export function csvLine(rec) {
  const c = compute(rec), ch = checks(rec, c), H = (i) => c.heads.find((x) => x.i === i) || {};
  const rc = rcnFor(rec);
  const calc = [fx(c.D, 2), fx(c.A, 1), c.A != null ? c.Asrc : "", fx(c.S, 1), fx(c.wireArea, 3), fx(c.share, 3), c.n ?? "", rc.ok ? rc.rcn ?? "> 300" : "",
    fx(c.l6, 3), fx(c.l30, 3), c.lf.ok ? c.lf.route : "not calculated", c.lf.ok ? c.lf.l6 : "", c.lf.ok ? c.lf.l30 : "", c.lf.drum6 ?? "", c.lf.drum30 ?? "",
    c.lf.ok ? c.lf.working : c.lf.why, H(1).air ?? (H(1).h ? "own manual" : ""), H(1).rule ? H(1).rule.words : "", H(2).air ?? (H(2).h ? "own manual" : ""), H(2).rule ? H(2).rule.words : "",
    LF_RULESETS[LF_RULESET].name, `${PROCEDURE.file} SHA-256 ${PROCEDURE.sha256}${PROCEDURE.confirmedFiled ? "" : " (copy not confirmed as filed)"}`];
  const fmt = (x) => `${x.text} ${x.want} [${x.src}]`;
  return [rec.id, rec.savedAt, rec.appVersion, ...FIELDS.map((f) => rec[f] ?? ""), ...calc,
    ch.filter((x) => x.level === "red").map(fmt).join(" | "),
    ch.filter((x) => x.level === "amber").map(fmt).join(" | "),
    ch.filter((x) => x.level === "red" && reasonOf(rec, x.id)).map((x) => `${x.text} REASON (${reasonOf(rec, x.id).time}): ${reasonOf(rec, x.id).text}`).join(" | "),
    Object.entries(rec.ovr || {}).filter(([, o]) => o && String(o.value ?? "").trim() !== "").map(([k, o]) => `${k} = ${o.value} (${o.time}): ${o.reason}`).join(" | "),
  ].map(q).join(",");
}
export const csvOf = (list) => "﻿" + [CSV_HEAD.map(q).join(","), ...list.map(csvLine)].join("\r\n") + "\r\n";
export const fileName = (rec, when = new Date()) => {
  const p = (n) => String(n).padStart(2, "0");
  const base = (rec.type === "reference" ? rec.ref : [rec.jobno, rec.position].filter((x) => String(x || "").trim()).join("_")) || "rope-record";
  return `${String(base).trim().replace(/[^A-Za-z0-9_\-.]+/g, "-")}_${when.getFullYear()}-${p(when.getMonth() + 1)}-${p(when.getDate())}_${p(when.getHours())}${p(when.getMinutes())}.csv`;
};
