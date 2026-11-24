// Rope Record - calculations and mistake checks. No screen code here (app.js draws the screens).
// Every figure below says where it comes from. ISO tables are as keyed for Acumen's MRT review
// software and are PROVISIONAL until checked against the printed pages; the screens say so.

const PI = Math.PI;

// ---------------------------------------------------------------------------------------------
// Equipment register AIC-0608-E Rev 00, section 3: heads, serials, liner sets.
// d: rope range of the head and temp: working temperature (PRO-AIC-0608 section 5.2).
// t4: the head's air value comes from Intron manual v1.3 Table 4 (false = from the head's own manual).
// ---------------------------------------------------------------------------------------------
export const REGISTER = "equipment register AIC-0608-E Rev 00, section 3";
const ls = (p, pairs) => pairs.map(([a, b]) => ({ name: `${p}${a}-${b}`, from: a, to: b }));
export const HEADS = [
  { model: "MH 6-26", serials: ["705046", "705075"], d: [6, 26], temp: [-25, 55], unit: "BU-M", t4: true,
    liners: ls("LS", [[6, 9], [9, 12], [12, 16], [16, 20], [20, 26]]) },
  { model: "MH 22-45", serials: ["715035"], d: [22, 45], temp: [-25, 55], unit: "BU-M", t4: true,
    liners: ls("LS", [[22, 25], [25, 30], [30, 35], [35, 40], [40, 45]]) },
  { model: "MH 40-70", serials: ["725009"], d: [40, 70], temp: [-25, 55], unit: "BU-M", t4: true,
    liners: ls("LS", [[40, 45], [45, 50], [50, 55], [55, 60], [60, 65], [65, 70]]) },
  { model: "MH 20-40", serials: ["202715"], d: [20, 40], temp: [-10, 50], unit: "BU-16", t4: false,
    liners: ls("", [[20, 25], [25, 30], [30, 35], [35, 40]]) },
  { model: "MH 40-64", serials: ["204540"], d: [40, 64], temp: [-10, 50], unit: "BU-16", t4: false,
    liners: ls("", [[40, 45], [45, 50], [50, 55], [55, 60], [60, 64]]) },
  { model: "MH 80-120", serials: ["230505-1", "230505-2"], d: [80, 120], temp: [-10, 50], unit: "analogue unit + basic unit", t4: false,
    liners: [91, 96, 102, 107, 112, 118, 123, 128].map((s) => ({ name: `CS / LS ${s}`, from: null, to: null, size: s })) },
];
export const HEAD_CHOICES = HEADS.flatMap((h) => h.serials.map((s) => `${h.model} / ${s}`));
export const headOf = (v) => { const [m, s] = String(v || "").split(" / "); const h = HEADS.find((x) => x.model === m); return h ? { ...h, serial: s } : null; };

// Basic units. nocert: no verification certificate on file - flagged red until a reason is given.
export const BASIC_UNITS = [
  { sn: "505026" },
  { sn: "505134", nocert: true },
];
export const BU_OTHER = "Other (type the S/N)";

// Intron manual v1.3, Table 4 - air values by head and metallic area A (mm2), read from a scanned copy.
export const T4 = {
  "MH 6-26": [[19, 70, 105], [70, 180, 106], [180, 450, 107]],
  "MH 22-45": [[215, 360, 101], [360, 600, 102], [600, 820, 104], [820, 1050, 106], [1050, 1350, 109]],
  "MH 40-70": [[520, 870, 102], [870, 1450, 104], [1450, 2000, 109], [2000, 2500, 113], [2500, 3000, 120]],
};

// Intron manual 2.4.2: A = K x pi x D2 / 4 when the rope area is not known.
export const CORES = ["fibre core (FC)", "steel core (IWRC)", "wire strand core (WSC)", "locked coil"];
const K = { "fibre core (FC)": 0.5, "steel core (IWRC)": 0.65, "wire strand core (WSC)": 0.65, "locked coil": 0.8 };
const ISO_COL = { "fibre core (FC)": "C1", "steel core (IWRC)": "C2", "wire strand core (WSC)": "C3" };

// ISO 2408:2017 Annex C, Tables C.1 / C.2 - cross-sectional metallic area factor C (never the weight factor W).
// C1 fibre core, C2 independent wire rope core, C3 wire strand core. null = blank in the standard. 2-60 mm only.
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
export const ISO_NONE = "not in the ISO 2408 list";

// ISO 4309:2017 Table 3 (single-layer and parallel-closed) and Table 4 (rotation-resistant):
// visible broken outer wires over 6d / 30d. A ordinary lay / B Lang lay on steel sheaves or a single-layer drum,
// C multi-layer drum. Used as the "Acumen criterion" when the Annex C formula cannot be used. No M5-M8 doubling.
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
// ISO 4309 Annex H: construction -> RCN.
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
export const ANNEX_OTHER = "Other (not in Annex H)";
export const ROPE_TYPES = ["single-layer / parallel-closed (Table 3)", "rotation-resistant (Table 4)"];

export const A_SOURCES = ["rope certificate", "maker's data", "ISO 2408 (2–60 mm only)", "not known"];
export const DMAX_SOURCES = ["wire taken from the rope", "rope certificate", "not available"];
export const LAYS = ["ordinary", "Lang", "not known"];
export const RUNS = ["steel sheaves", "single-layer drum", "multi-layer drum"];
export const LF_METHODS = ["known broken wire", "two added wires", "no known break"];
export const ACUMEN = "Acumen criterion (PRO-AIC-0608 amendment pending)";

// ---------------------------------------------------------------------------------------------
// Record fields. These ids are the CSV columns, in this order.
// ---------------------------------------------------------------------------------------------
const HEAD_FIELDS = ["head", "bu", "bu_other", "liner", "temp", "zf", "zt", "air", "lma", "lmaneg", "lfm", "lfwd", "lfgap", "sig", "thr", "alarm"];
export const FIELDS = [
  "type", "ref", "jobno", "client", "position", "date", "engineer", "location", "length",
  "dnom", "d1", "d2", "construction", "annexh", "ropetype", "seale", "core", "outer", "wires", "lay", "runs",
  "isoclass", "asrc", "a", "dmax", "dmaxsrc",
  ...HEAD_FIELDS.map((f) => "h1_" + f), "h2on", ...HEAD_FIELDS.map((f) => "h2_" + f),
  "datum", "A_from", "A_to", "A_w", "A_gap", "B_from", "B_to", "B_w", "B_gap", "C_from", "C_to", "C_w", "C_gap",
  "counted", "checked", "notes",
];
export const SECTIONS = ["A", "B", "C"];

export const num = (v) => { if (v == null) return null; const t = String(v).trim().replace(",", "."); if (t === "") return null; const x = Number(t); return isFinite(x) ? x : null; };
const pos = (x) => (x != null && x > 0 ? x : null);   // a typed 0 counts as "not available" in the sums (and is flagged)
const r1 = (x, d = 1) => (x == null ? "–" : Number(x).toFixed(d));
const nearest = (x) => Math.floor(x + 0.5);
export const activeHeads = (rec) => (rec.h2on === "yes" ? [1, 2] : [1]);

function isoFactor(rec, d) {
  const row = ISO2408.find((r) => `${r.cls} (Table ${r.table})` === rec.isoclass);
  if (!row) return { ok: false, why: rec.isoclass ? "class not in the ISO 2408 list" : "ISO 2408 class not chosen" };
  const col = ISO_COL[rec.core];
  if (!col) return { ok: false, why: rec.core ? `ISO 2408 gives no factor for ${rec.core}` : "core not chosen" };
  const C = row[col];
  if (C == null) return { ok: false, why: `ISO 2408 Table ${row.table} gives no ${col} factor for ${row.cls}` };
  if (d == null) return { ok: false, why: "nominal diameter not entered" };
  if (d < 2 || d > 60) return { ok: false, why: `d ${d} mm is outside 2–60 mm: ISO 2408 gives no area factor` };
  return { ok: true, C, col, row, A: Math.round(C * d * d * 10) / 10 };
}

export function airFromT4(model, A) {
  const t = T4[model];
  if (!t || A == null) return null;
  for (const [a, b, v] of t) if (A >= a && A <= b) return { value: v, from: a, to: b };
  return { value: null, out: true };
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
  if (!t || !s || !w) return { ok: false, why: "not in Annex H: rope type, outer strands and wires per strand all needed" };
  const n = s * w;
  let how = `n = ${s} × ${w} = ${n} load-bearing outer wires (fillers left out)`;
  if (t === 3) {
    let i = T3.findIndex((r) => n >= r.lo && n <= r.hi);
    if (i < 0 && n > 300) return { ok: true, table: 3, above300: true, n, rcn: null, how: how + " → more than 300 outer wires (factor × n)" };
    if (i < 0) return { ok: false, why: `n = ${n} is not in Table 3` };
    if (rec.seale === "yes" && w <= 19) { i = Math.max(0, i - 2); how += "; Seale outer strands with 19 wires or fewer: two rows above"; }
    return { ok: true, table: 3, row: T3[i], rcn: T3[i].rcn, n, how: how + ` → RCN ${T3[i].rcn}` };
  }
  const fits = T4R.filter((r) => {
    const okS = (r.strands === "4" && s === 4) || (r.strands === "3 or 4" && (s === 3 || s === 4)) || (r.strands === "11+" && s >= 11);
    return okS && n >= r.lo && n <= (r.hi ?? 1e9);
  });
  if (fits.length !== 1) return { ok: false, why: fits.length ? `n = ${n} fits RCN ${fits.map((r) => r.rcn).join(" and ")} - Table 4 as printed overlaps; choose the construction` : `no Table 4 row for ${s} outer strands and n = ${n}` };
  return { ok: true, table: 4, row: fits[0], rcn: fits[0].rcn, n, how: how + ` → RCN ${fits[0].rcn ?? "(over 300)"}` };
}

function tableFigures(r, col) {
  if (r.above300) { const f = T3_ABOVE_300[col]; return [nearest(f[0] * r.n), nearest(f[1] * r.n)]; }
  return r.row[col];
}

export function lfLimit(rec, c) {
  if (c.A != null && c.dmax) {
    const wires = c.A / c.wireArea;
    const s6 = nearest(0.06 * wires), s30 = nearest(0.10 * wires);
    return { ok: true, route: "Annex C formula", l6: s6, l30: s30,
      working: `wires in A = A ÷ one-wire area = ${r1(c.A)} ÷ ${r1(c.wireArea, 2)} = ${r1(wires)}; 6d: 6 % × ${r1(wires)} = ${r1(0.06 * wires, 2)} → ${s6} wires; 30d: 10 % × ${r1(wires)} = ${r1(0.10 * wires, 2)} → ${s30} wires (ISO 4309 Annex C, nearest whole wire)${c.Aestimate ? "; A is an ISO 2408 estimate" : ""}` };
  }
  const why = c.A == null ? "A not known" : "δmax not available";
  const r = rcnFor(rec);
  if (!r.ok) return { ok: false, why: `LF limit not calculated: ${why} and ${r.why}` };
  let col, words;
  if (r.table === 3) {
    if (rec.lay === "ordinary") { col = "A"; words = "ordinary lay, steel sheaves / single-layer drum"; }
    else if (rec.lay === "Lang") { col = "B"; words = "Lang lay, steel sheaves / single-layer drum"; }
    else return { ok: false, why: `LF limit not calculated: ${why} and the lay (ordinary / Lang) is needed for Table 3` };
  } else { col = "A"; words = "steel sheaves / single-layer drum"; }
  const [s6, s30] = tableFigures(r, col);
  const out = { ok: true, route: `ISO 4309 Table ${r.table} – ${ACUMEN}`, l6: s6, l30: s30, rcn: r.rcn,
    working: `${why}, so ISO 4309 Table ${r.table}: ${r.how}; column ${col} (${words}): ${s6} wires over 6d / ${s30} over 30d; no M5–M8 doubling${r.above300 ? "; more than 300 wires: factor × n, nearest whole wire" : ""}` };
  if (rec.runs === "multi-layer drum") {
    const [d6, d30] = tableFigures(r, "C");
    out.drum6 = d6; out.drum30 = d30;
    out.working += `; length that spools on the multi-layer drum, column C: ${d6} / ${d30}`;
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// compute(rec): every calculated figure, with its working.
// ---------------------------------------------------------------------------------------------
export function compute(rec) {
  const g = (k) => pos(num(rec[k]));
  const d1 = g("d1"), d2 = g("d2"), dn = g("dnom");
  const D = d1 && d2 ? (d1 + d2) / 2 : (d1 || d2 || null);
  const dRef = dn ?? D;                      // 6d / 30d and the ISO 2408 area use the nominal diameter
  const k = K[rec.core] ?? null;
  const Ai = D && k ? k * PI * D * D / 4 : null;
  const iso = isoFactor(rec, dn);
  const Aiso = iso.ok ? iso.A : null;
  let A = null, Asrc = rec.asrc || "", Aestimate = false;
  if (rec.asrc === A_SOURCES[2]) { A = Aiso; Aestimate = true; }
  else if (rec.asrc === A_SOURCES[0] || rec.asrc === A_SOURCES[1]) A = g("a");
  const Aair = A ?? Ai;
  const dmax = rec.dmaxsrc === DMAX_SOURCES[2] ? null : g("dmax");
  const wireArea = dmax ? PI * dmax * dmax / 4 : null;
  const outer = g("outer"), wires = g("wires");
  const n = outer && wires ? outer * wires : null;
  const c = { D, d1, d2, dn, dRef, k, Ai, iso, Aiso, A, Asrc, Aestimate, Aair, dmax, wireArea, n,
    ratio: dRef && dmax ? dRef / dmax : null,
    l6: dRef ? 6 * dRef / 1000 : null, l30: dRef ? 30 * dRef / 1000 : null };
  c.lf = lfLimit(rec, c);
  c.heads = activeHeads(rec).map((i) => {
    const h = headOf(rec[`h${i}_head`]);
    const out = { i, h };
    if (!h) return out;
    if (h.t4) {
      const t = airFromT4(h.model, Aair);
      out.t4 = t;
      out.air = t && t.value != null ? t.value : null;
      out.airWorking = Aair == null ? "A not known yet" : t && t.value != null
        ? `Intron Table 4, ${h.model}, A ${r1(Aair)} mm² is in ${t.from}–${t.to} mm² → ${t.value} %` : `A ${r1(Aair)} mm² is outside ${h.model}'s Table 4 rows (${T4[h.model][0][0]}–${T4[h.model].at(-1)[1]} mm²)`;
    } else out.airWorking = `${h.model}: air value from the head's own manual, not Table 4`;
    const dl = D ?? dn;
    const fit = dl ? h.liners.find((l) => l.from != null && dl >= l.from && dl <= l.to) : null;
    out.liner = fit ? fit.name : null;
    out.linerWorking = !dl ? "diameter not entered" : fit ? `measured D ${r1(dl, 2)} mm → ${fit.name} (${h.model} S/N ${h.serial}, ${REGISTER})`
      : h.liners[0].from == null ? `${h.model}: the register lists single sizes - pick the set` : `no ${h.model} liner set takes ${r1(dl, 2)} mm`;
    return out;
  });
  c.working = [
    ["Measured diameter D", D ? `${r1(D, 2)} mm` : "–", d1 && d2 ? `(${d1} + ${d2}) ÷ 2` : D ? "one reading" : ""],
    ["Metallic area, Intron", Ai ? `${r1(Ai, 0)} mm²` : "–", Ai ? `k × π × D² ÷ 4 = ${k} × π × ${r1(D, 2)}² ÷ 4 (k ${k}: ${rec.core})` : "needs D and core"],
    ["Metallic area, ISO 2408", Aiso ? `${r1(Aiso)} mm²` : "–", iso.ok ? `C × d² = ${iso.C.toFixed(3)} × ${dn}² (Table ${iso.row.table}, ${iso.row.cls}, ${iso.col}); C factor, never W; factors provisional` : iso.why],
    ["A used", A != null ? `${r1(A)} mm²` : Aair != null ? `${r1(Aair, 0)} mm² (Intron, for the air value only)` : "–", A != null ? `source: ${Asrc}` : "A not known: the air value uses the Intron estimate; the LF limit cannot use the formula"],
    ["One-wire area", wireArea ? `${r1(wireArea, 2)} mm²` : "–", wireArea ? `π × δmax² ÷ 4 = π × ${dmax}² ÷ 4` : "δmax not available"],
    ["D ÷ δmax", c.ratio ? r1(c.ratio, 1) : "–", c.ratio ? `${dRef} ÷ ${dmax}` : ""],
    ["Load-bearing outer wires n", n ?? "–", n ? `${outer} strands × ${wires} wires (no fillers)` : ""],
    ["6d / 30d", dRef ? `${r1(c.l6, 3)} m / ${r1(c.l30, 2)} m` : "–", dRef ? `6 × ${dRef} mm and 30 × ${dRef} mm (nominal d)` : ""],
    ["LF limit 6d / 30d", c.lf.ok ? `${c.lf.l6} / ${c.lf.l30} wires` + (c.lf.drum6 != null ? ` (drum ${c.lf.drum6} / ${c.lf.drum30})` : "") : "not calculated", c.lf.ok ? `${c.lf.route}: ${c.lf.working}` : c.lf.why],
  ];
  for (const hc of c.heads) if (hc.h) {
    c.working.push([`Air value, ${hc.h.model}`, hc.air != null ? `${hc.air} %` : hc.h.t4 ? "–" : "own manual", hc.airWorking]);
    c.working.push([`Liner, ${hc.h.model}`, hc.liner ?? "–", hc.linerWorking]);
  }
  return c;
}

// ---------------------------------------------------------------------------------------------
// checks(rec, c): mistakes. red = must be fixed or given a reason (saved with the record); warn = shown only.
// screen = where the value is entered.
// ---------------------------------------------------------------------------------------------
const ZERO_FIELDS = [
  ["length", "Rope length", "job"], ["dnom", "Nominal diameter", "rope"], ["d1", "Measured diameter 1", "rope"], ["d2", "Measured diameter 2", "rope"],
  ["outer", "Outer strands", "rope"], ["wires", "Wires per strand", "rope"], ["a", "Metallic area A", "rope"], ["dmax", "δmax", "rope"],
];
const HEAD_ZERO = [["air", "Air value", "air"], ["lfwd", "Wire diameter", "lf"], ["lfgap", "Gap", "lf"], ["sig", "One-wire LF signal", "sig"], ["thr", "LF threshold", "thr"], ["alarm", "LF alarm", "thr"]];

export function checks(rec, c = compute(rec)) {
  const out = [];
  const red = (id, screen, text) => out.push({ id, screen, level: "red", text });
  const warn = (id, screen, text) => out.push({ id, screen, level: "warn", text });
  const raw = (k) => String(rec[k] ?? "").trim();
  const isZero = (k) => raw(k) !== "" && num(rec[k]) === 0;
  const zeroText = (lab) => `${lab}: 0 typed. If the value is not available leave the box blank – never type 0.`;

  for (const [k, lab, s] of ZERO_FIELDS) if (isZero(k)) red("zero-" + k, s, zeroText(lab));
  for (const s of SECTIONS) if (isZero(s + "_gap")) red(`zero-${s}_gap`, "sections", zeroText(`Section ${s} gap`));

  if (c.D && c.dn) {
    const p = (c.D - c.dn) / c.dn * 100;
    if (Math.abs(p) > 5) red("dia", "rope", `Measured diameter ${r1(c.D, 2)} mm is ${r1(Math.abs(p), 1)} % ${p < 0 ? "below" : "above"} the nominal ${c.dn} mm (more than 5 %) – check the reading and the nominal size.`);
  }
  if (rec.asrc === A_SOURCES[2] && !c.iso.ok) red("iso", "rope", `A from ISO 2408 cannot be worked out: ${c.iso.why}. Choose another source or "not known".`);
  if ((rec.asrc === A_SOURCES[0] || rec.asrc === A_SOURCES[1]) && c.A == null && !isZero("a")) red("a-missing", "rope", `A source is "${rec.asrc}" but no A is entered.`);
  if (rec.dmaxsrc && rec.dmaxsrc !== DMAX_SOURCES[2] && !pos(num(rec.dmax)) && !isZero("dmax")) red("dmax-missing", "rope", `δmax source is "${rec.dmaxsrc}" but no δmax is entered. Leave δmax blank only with "not available".`);
  if (rec.dmaxsrc === DMAX_SOURCES[2] && raw("dmax") !== "" && !isZero("dmax")) red("dmax-src", "rope", "δmax is entered but its source says \"not available\" – give the source.");

  for (const i of activeHeads(rec)) {
    const p = `h${i}_`, sc = (s) => `h${i}-${s}`;
    const hc = c.heads.find((x) => x.i === i) || {};
    const h = hc.h, name = h ? `${h.model} S/N ${h.serial}` : `Head ${i}`;
    for (const [k, lab, s] of HEAD_ZERO) if (isZero(p + k)) red(`zero-${p}${k}`, sc(s), zeroText(`${name}: ${lab}`));
    const bu = rec[p + "bu"];
    const buu = BASIC_UNITS.find((b) => b.sn === bu);
    if (buu && buu.nocert) red(`bu-${p}`, sc("equip"), `Basic unit S/N ${bu} has no verification certificate on file.`);
    if (h && c.D && (c.D < h.d[0] || c.D > h.d[1])) red(`range-${p}`, sc("equip"), `${name} takes ropes of ${h.d[0]}–${h.d[1]} mm; measured D is ${r1(c.D, 2)} mm.`);
    if (h && raw(p + "liner") && hc.liner && raw(p + "liner") !== hc.liner) {
      const l = h.liners.find((x) => x.name === raw(p + "liner"));
      if (l && l.from != null && !(c.D >= l.from && c.D <= l.to)) red(`liner-${p}`, sc("equip"), `Liner ${l.name} does not take ${r1(c.D, 2)} mm – ${hc.liner} does.`);
    }
    const t = num(rec[p + "temp"]);
    if (h && t != null && (t < h.temp[0] || t > h.temp[1])) red(`temp-${p}`, sc("equip"), `Air temperature ${t} °C is outside ${h.model}'s ${h.temp[0]} to ${h.temp[1]} °C.`);
    const zf = num(rec[p + "zf"]), zt = num(rec[p + "zt"]);
    if (zf != null && zt != null) {
      if (zf < 0 || zt < 0) red(`zneg-${p}`, sc("zero"), `${name}: sound section has a negative distance – measure one way from the datum.`);
      else if (zt - zf < 0.5) red(`sound-${p}`, sc("zero"), `${name}: sound section ${r1(zt - zf, 2)} m is under 0.5 m – too short for the zero.`);
    }
    const air = num(rec[p + "air"]);
    if (h && h.t4 && air != null && air !== 0) {
      if (hc.t4 && hc.t4.out) red(`airout-${p}`, sc("air"), `${name}: A ${r1(c.Aair)} mm² is outside the head's Table 4 rows – check the head and A.`);
      else if (hc.air != null && air !== hc.air) red(`air-${p}`, sc("air"), `${name}: air value entered ${air} %, Intron Table 4 gives ${hc.air} % for A ${r1(c.Aair)} mm².`);
    }
    const lma = num(rec[p + "lma"]);
    if (lma != null && Math.abs(lma) > 0.5) red(`lma-${p}`, sc("lma"), `${name}: LMA check ${lma} % is outside ± 0.5 % – zero and calibrate again.`);
    const neg = num(rec[p + "lmaneg"]);
    if (neg != null && neg < -1) red(`lmaneg-${p}`, sc("lma"), `${name}: negative LMA ${neg} % is below −1 %.`);
    const m = rec[p + "lfm"];
    const sig = num(rec[p + "sig"]), thr = num(rec[p + "thr"]);
    if (m === LF_METHODS[2]) red(`lfk-${p}`, sc("lf"), `${name}: LF calibrated with no known break – the one-wire signal has no source and breaks cannot be counted.`);
    const wd = pos(num(rec[p + "lfwd"])), gap = pos(num(rec[p + "lfgap"]));
    if (m === LF_METHODS[1] && wd && gap && (gap < wd || gap > 3 * wd)) red(`gap13-${p}`, sc("lf"), `${name}: gap ${gap} mm is outside 1–3 wire diameters (${r1(wd, 2)}–${r1(3 * wd, 2)} mm) for the two added wires.`);
    if (gap && c.dmax && gap < 3 * c.dmax) warn(`gap3-${p}`, sc("lf"), `${name}: gap ${gap} mm is under 3 × δmax (${r1(3 * c.dmax, 1)} mm) – the manual's LF sensitivity assumes at least 3.`);
    if (thr != null && sig != null && thr !== 0 && sig !== 0 && thr !== sig) red(`thr-${p}`, sc("thr"), `${name}: LF threshold ${thr} mV is not the one-wire signal ${sig} mV – set the threshold to the one-wire signal.`);
  }
  if (rec.type === "reference") {
    const L = pos(num(rec.length));
    for (const s of SECTIONS) {
      const a = num(rec[s + "_from"]), b = num(rec[s + "_to"]);
      if (a != null && b != null) {
        if (a < 0 || b < 0) red(`sneg-${s}`, "sections", `Section ${s}: negative distance – measure one way from the datum.`);
        else if (b <= a) red(`sord-${s}`, "sections", `Section ${s}: "to" must be after "from".`);
        else if (L && b > L) red(`slen-${s}`, "sections", `Section ${s} ends beyond the rope length ${L} m.`);
      }
      const gp = pos(num(rec[s + "_gap"]));
      if (gp && c.dmax && gp < 3 * c.dmax) warn(`sgap-${s}`, "sections", `Section ${s}: gap ${gp} mm is under 3 × δmax (${r1(3 * c.dmax, 1)} mm) – the manual's LF sensitivity assumes at least 3.`);
    }
  }
  if (!c.lf.ok && rec.annexh) warn("lf", "results", c.lf.why);
  return out;
}

export const unresolved = (list, reasons = {}) => list.filter((x) => x.level === "red" && !String(reasons[x.id] || "").trim());

// ---------------------------------------------------------------------------------------------
// CSV: one line per record. UTF-8 with BOM, CRLF, every value quoted when needed.
// ---------------------------------------------------------------------------------------------
const CALC_COLS = ["D_measured_mm", "A_intron_mm2", "A_iso2408_mm2", "A_used_mm2", "A_source", "wire_area_mm2", "D_over_dmax", "n_outer_wires",
  "len_6d_m", "len_30d_m", "lf_route", "lf_6d", "lf_30d", "lf_drum_6d", "lf_drum_30d", "lf_working",
  "h1_table4_air", "h1_liner_proposed", "h2_table4_air", "h2_liner_proposed"];
export const CSV_HEAD = ["record_id", "saved_at", "app_version", ...FIELDS, ...CALC_COLS, "mistakes_red", "warnings", "reasons"];
const q = (x) => { const t = String(x ?? ""); return /[",\n\r]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t; };
const fx = (x, d) => (x == null || !isFinite(x) ? "" : Number(x.toFixed(d)));
export function csvLine(rec) {
  const c = compute(rec), ch = checks(rec, c), H = (i) => c.heads.find((x) => x.i === i) || {};
  const reasons = rec.reasons || {};
  const calc = [fx(c.D, 2), fx(c.Ai, 1), fx(c.Aiso, 1), fx(c.A, 1), c.A != null ? c.Asrc : "", fx(c.wireArea, 3), fx(c.ratio, 2), c.n ?? "",
    fx(c.l6, 3), fx(c.l30, 3), c.lf.ok ? c.lf.route : "not calculated", c.lf.ok ? c.lf.l6 : "", c.lf.ok ? c.lf.l30 : "", c.lf.drum6 ?? "", c.lf.drum30 ?? "",
    c.lf.ok ? c.lf.working : c.lf.why, H(1).air ?? "", H(1).liner ?? "", H(2).air ?? "", H(2).liner ?? ""];
  return [rec.id, rec.savedAt, rec.appVersion, ...FIELDS.map((f) => rec[f] ?? ""), ...calc,
    ch.filter((x) => x.level === "red").map((x) => x.text).join(" | "),
    ch.filter((x) => x.level === "warn").map((x) => x.text).join(" | "),
    ch.filter((x) => x.level === "red" && reasons[x.id]).map((x) => `${x.text} REASON: ${reasons[x.id]}`).join(" | ")].map(q).join(",");
}
export const csvOf = (list) => "﻿" + [CSV_HEAD.map(q).join(","), ...list.map(csvLine)].join("\r\n") + "\r\n";
export const fileName = (rec, when = new Date()) => {
  const p = (n) => String(n).padStart(2, "0");
  const base = (rec.type === "reference" ? rec.ref : [rec.jobno, rec.position].filter((x) => String(x || "").trim()).join("_")) || "rope-record";
  return `${String(base).trim().replace(/[^A-Za-z0-9_\-.]+/g, "-")}_${when.getFullYear()}-${p(when.getMonth() + 1)}-${p(when.getDate())}_${p(when.getHours())}${p(when.getMinutes())}.csv`;
};
