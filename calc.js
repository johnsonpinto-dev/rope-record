// Rope Record - rules, calculations and checks. No screen code here (app.js draws the screens).
// Every rule and figure follows PRO-AIC-0608 as filed and carries its source. No figure from memory:
// each table below was checked against the page named in its comment.

const PI = Math.PI;

// ---------------------------------------------------------------------------------------------
// Documents the app is built from (shown on the About screen).
// ---------------------------------------------------------------------------------------------
export const PROCEDURE = {
  doc: "PRO-AIC-0608 Rev 00 (EIAC), refiled 27-Nov-2026 (C5 clean-section route)",
  file: "PRO-AIC-0608 Magnetic Rope Testing Procedure Rev 00.pdf",
  sha256: "37bde04809c4fde624a653b255f1062e0d20d6ca25b43347994d7702e6f42ecb",
  confirmedFiled: false,           // locked setting: true only on the owner's word
};
export const SOURCES = [
  ["Procedure", PROCEDURE.doc],
  ["Site sheet", "AIC-0608 MRT Site Sheet Rev 00 (27-Nov-2026 set)"],
  ["Report guide", "AIC-0608-G Rev 00 (27-Nov-2026 set)"],
  ["Equipment register", "AIC-0608-E Rev 00 (15-Nov-2026): head serials, basic units and liner sets"],
  ["Air values", "MH 6-26 / 22-45 / 40-70: INTROS manual v1.3, Table 4 (p. 27). MH 40-64: INTROS MH40-64 with BU-M manual v1.1, Table 4 (p. 21). MH 20-40, MH 80-120: air value from the head's own manual"],
  ["Liner sets", "MH 6-26 / 22-45 / 40-70: INTROS manual v1.3, Table 2 (p. 15). MH 40-64: INTROS MH40-64 with BU-M manual v1.1, Table 2 (p. 12). MH 20-40: AIC-0608-E §3. MH 80-120: maker's table (AIC-0608-E §3)"],
  ["Head rope ranges", "MH 6-26 / 22-45 / 40-70: manual v1.3 p. 4 and Table 1 (p. 12). MH 40-64: manual v1.1 p. 3. MH 20-40, MH 80-120: PRO-AIC-0608 §5.2"],
  ["ISO 4309 tables", "Tables 3 and 4 as copied in PRO-AIC-0608 §9.2.2; Annex H examples checked against ISO 4309:2017 pp. 51–56"],
  ["ISO 2408 factors", "ISO 2408:2017 Annex C, Tables C.1 and C.2 (p. 18); class contents Tables D.1–D.18 (pp. 19–36)"],
  ["Outer wire factor", "EN 12385-4:2002 Tables 5–16 (pp. 9–20); δa = a × d, EN 12385-2:2002+A1:2008 3.10.26–3.10.27 – estimate only"],
];
// Equipment register AIC-0608-E Rev 00 (15-Nov-2026), read 27-Nov-2026 (sources/, SHA-256 e4de659b…5a00). The owner's
// 1.7.0 block (27-Nov-2026) fills the head serial from it.
export const REGISTER_LOADED = true;
export const REGISTER_SRC = "AIC-0608-E Rev 00 §3 (equipment register)";
export const HEAD_SERIALS = { "MH 6-26": ["705046", "705075"], "MH 22-45": ["715035"], "MH 40-70": ["725009"], "MH 20-40": ["202715"],
  "MH 40-64": ["204540"], "MH 80-120": ["230505-1 / 230505-2"] };
// Basic unit (1.7.0 item 5, owner's ruling 27-Nov-2026): optional; the units on AIC-0608-E §2, plus MH-PC with a computer.
export const BU_MHPC = "MH-PC + computer";
export const BASIC_UNITS = ["BU-M 505026", "BU-M 505134", "BU-M 505152", "BU-16 405651", BU_MHPC];
// Export: the unit's serial digits (Kuzo compares digits with the scan), "" when none is chosen.
export const buSerial = (v) => { const t = String(v ?? "").trim(); if (!t) return ""; if (t === BU_MHPC) return t; const m = t.match(/(\d{5,})\s*$/); return m ? m[1] : t; };
// Liner sets: [from mm, to mm, liner as printed]. Read off the page 27-Nov-2026.
const LT13 = "INTROS MH 6-26 / 22-45 / 40-70 operating manual v1.3, Table 2 (p. 15)";
export const LINERS = {
  // p. 15 prints "LS 20-24" for 20–26 mm (AIC-0608-E lists LS20-26) and "65 – 40" for the LS 65-70 row: shown as printed.
  "MH 6-26": { src: LT13, rows: [[6, 9, "LS 6-9"], [9, 12, "LS 9-12"], [12, 16, "LS 12-16"], [16, 20, "LS 16-20"], [20, 26, "LS 20-24"]],
    note: "Table 2 prints LS 20-24 for 20–26 mm; the register lists LS20-26 – check the liner marking." },
  "MH 22-45": { src: LT13, rows: [[22, 25, "LS 22-25"], [25, 30, "LS 25-30"], [30, 35, "LS 30-35"], [35, 40, "LS 35-40"], [40, 45, "LS 40-45"]] },
  "MH 40-70": { src: LT13, rows: [[40, 45, "LS 40-45"], [45, 50, "LS 45-50"], [50, 55, "LS 50-55"], [55, 60, "LS 55-60"], [60, 65, "LS 60-65"], [65, 70, "LS 65-70"]],
    note: "Table 2 prints the last row as \"65 – 40\" mm; LS 65-70 read as 65–70 mm." },
  "MH 40-64": { src: "INTROS MH40-64 with BU-M operating manual v1.1, Table 2 (p. 12)", rows: [[40, 45, "LS40-45"], [45, 50, "LS45-50"], [50, 55, "LS50-55"], [55, 60, "LS55-60"], [60, 64, "LS60-64"]] },
  "MH 20-40": { src: "AIC-0608-E Rev 00 §3 (INTROS 6-64 BU-16 manual)", rows: [[20, 25, "20-25"], [25, 30, "25-30"], [30, 35, "30-35"], [35, 40, "35-40"]] },
};
// Liner proposal for the measured diameter D (incl. coating): the smaller set where two cover it (manual v1.3 2.2.2).
export function linerFor(model, D) {
  const t = LINERS[model];
  if (!t) return model === "MH 80-120" ? { none: true, text: "MH 80-120: liners (CS / LS 91–128) from the maker's table – choose the set.", src: REGISTER_SRC } : null;
  if (!(D > 0)) return { none: true, text: "Needs the measured diameter (two caliper readings).", src: t.src };
  const fit = t.rows.filter(([a, b]) => D >= a && D <= b);
  if (!fit.length) return { none: true, text: `${r1(D, 2)} mm is outside the liner table for ${model}.`, src: t.src };
  return { value: fit[0][2], also: fit.slice(1).map((x) => x[2]), text: `${r1(D, 2)} mm is in ${fit[0][0]}–${fit[0][1]} mm → ${fit[0][2]}${fit.length > 1 ? ` (also covered by ${fit.slice(1).map((x) => x[2]).join(", ")}; the smaller set is proposed)` : ""}.${t.note ? " " + t.note : ""}`, src: t.src };
}

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
// rangeSrc: where the rope range comes from. The air value comes from AIR below (a table from the head manual),
// or, where no table is held, "from the head's own manual – check it" (amber), never a guessed figure.
// ---------------------------------------------------------------------------------------------
const S52 = "PRO-AIC-0608 §5.2 head limits";
export const HEADS = [
  { model: "MH 6-26", unit: "BU-M", d: [6, 26], speed: "up to 2 m/s", temp: [-25, 55], settle: 0, sound: 0.5, wireLen: 0.3, sens: () => 0.5, sensText: "0.5 %", lfRule: "BU-M", rangeSrc: "Intron manual v1.3 p. 4 (MH notation), Table 1 p. 12; PRO-AIC-0608 §5.2" },
  { model: "MH 22-45", unit: "BU-M", d: [22, 45], speed: "up to 2 m/s", temp: [-25, 55], settle: 0, sound: 0.5, wireLen: 0.3, sens: () => 0.5, sensText: "0.5 %", lfRule: "BU-M", rangeSrc: "Intron manual v1.3 p. 4 (MH notation), Table 1 p. 12; PRO-AIC-0608 §5.2" },
  { model: "MH 40-70", unit: "BU-M", d: [40, 70], speed: "up to 2 m/s", temp: [-25, 55], settle: 0, sound: 0.5, wireLen: 0.3, sens: () => 0.5, sensText: "0.5 %", lfRule: "BU-M", rangeSrc: "Intron manual v1.3 p. 4 (MH notation), Table 1 p. 12; PRO-AIC-0608 §5.2" },
  { model: "MH 20-40", unit: "BU-16", d: [20, 40], speed: "up to 2 m/s", temp: [-10, 50], settle: 2, sound: 0.5, wireLen: 0.3, sens: (D) => 20 / D, sensText: "20/D %", lfRule: "BU-16", rangeSrc: "PRO-AIC-0608 §5.2" },
  { model: "MH 40-64", unit: "BU-16", d: [40, 64], speed: "up to 2 m/s", temp: [-10, 50], settle: 2, sound: 0.5, wireLen: 0.3, sens: (D) => 32 / D, sensText: "32/D %", lfRule: "BU-16", rangeSrc: "INTROS MH40-64 manual v1.1 p. 3; PRO-AIC-0608 §5.2" },
  { model: "MH 80-120", unit: "analogue unit + basic unit", d: [80, 120], speed: "0.2–1.5 m/s", temp: [-10, 50], settle: 2, sound: 2, wireLen: 0.6, sens: () => 0.12, sensText: "0.12 %", lfRule: "MH 80-120", rangeSrc: "PRO-AIC-0608 §5.2" },
];
export const HEAD_CHOICES = HEADS.map((h) => h.model);
export const headOf = (m) => HEADS.find((h) => h.model === m) || null;

// Air value tables ("LMA value without rope", %) read from the head manuals: [A from mm², A to mm², air value %].
const V13 = "INTROS MH 6-26 / 22-45 / 40-70 operating manual v1.3, Table 4 (p. 27)";
export const AIR = {
  "MH 6-26": { src: V13, rows: [[19, 70, 105], [70, 180, 106], [180, 450, 107]] },
  "MH 22-45": { src: V13, rows: [[215, 360, 101], [360, 600, 102], [600, 820, 104], [820, 1050, 106], [1050, 1350, 109]] },
  "MH 40-70": { src: V13, rows: [[520, 870, 102], [870, 1450, 104], [1450, 2000, 109], [2000, 2500, 113], [2500, 3000, 120]] },
  "MH 40-64": { src: "INTROS MH40-64 with BU-M operating manual v1.1, Table 4 (p. 21)", rows: [[215, 820, 92], [820, 1300, 84], [1300, 1550, 78], [1550, 2500, 72]] },
};
export const T4 = Object.fromEntries(Object.entries(AIR).map(([k, v]) => [k, v.rows]));
export const T4_SRC = "PRO-AIC-0608 C4 route 2";
export const airSrc = (model) => (AIR[model] ? `${AIR[model].src}; ${T4_SRC}` : `air value from the ${model} manual; ${T4_SRC}`);
export const OWN_MANUAL = "air value from the head's own manual – check it";

// Rope density factor K (A3; manual v1.3 2.4.2): only to choose the air value or S of route 3 when A is not known.
export const CORES = ["fibre core (FC)", "steel core (IWRC)", "wire strand core (WSC)", "locked coil"];
const K = { "fibre core (FC)": 0.5, "steel core (IWRC)": 0.65, "wire strand core (WSC)": 0.65, "locked coil": 0.8 };
const ISO_COL = { "fibre core (FC)": "C1", "steel core (IWRC)": "C2", "wire strand core (WSC)": "C3" };

// ISO 2408:2017 Annex C, Table C.1 / C.2 (p. 18): cross-sectional metallic area factors C1 / C2 / C3 (never W) and
// minimum breaking force factors K1 / K2 / K3 (1.5.0, read from p. 18 on 26-Nov-2026). null = blank in the table.
// 35(W) × 7 K3 depends on the rope grade (Table C.1 footnotes a / b): K35W below.
const K35W = "35W";
const ISO2408 = [
  ["C.1", "6 × 7", 0.369, 0.432, 0.441, 0.332, 0.359, 0.388], ["C.1", "6 × 19", 0.384, 0.449, null, 0.330, 0.356, null], ["C.1", "6 × 24", 0.329, null, null, 0.286, null, null],
  ["C.1", "6 × 36", 0.393, 0.460, null, 0.330, 0.356, null], ["C.1", "6 × 19M", 0.357, 0.398, 0.418, 0.307, 0.332, 0.362], ["C.1", "6 × 37M", 0.357, 0.418, 0.418, 0.295, 0.319, 0.346],
  ["C.1", "8 × 7", 0.335, 0.439, 0.520, 0.291, 0.359, 0.404], ["C.1", "8 × 19", 0.349, 0.457, null, 0.293, 0.356, null], ["C.1", "8 × 36", 0.357, 0.468, null, 0.293, 0.356, null],
  ["C.1", "4 × 19 / 4 × 36", 0.429, null, null, 0.360, null, null], ["C.1", "18 × 7 / 18 × 19", 0.408, null, 0.433, 0.328, null, 0.328],
  ["C.1", "34(M) × 7", 0.424, null, 0.428, 0.318, null, 0.318], ["C.1", "35(W) × 7", null, null, 0.480, null, null, K35W],
  ["C.2", "6 × K7", 0.426, null, null, 0.375, null, null], ["C.2", "6 × K19 / 6 × K36", 0.453, 0.516, null, 0.373, 0.410, null], ["C.2", "8 × K19 / 8 × K36", 0.400, 0.516, null, 0.330, 0.410, null],
  ["C.2", "K4 × 35N", 0.429, null, null, 0.375, null, null], ["C.2", "15 × K7", null, 0.528, null, null, 0.410, null], ["C.2", "18 × K7 / 18 × K19", 0.449, null, 0.475, 0.350, null, 0.370],
  ["C.2", "35(W) × K7", null, null, 0.527, null, null, 0.410],
].map(([table, cls, C1, C2, C3, K1, K2, K3]) => ({ table, cls, C1, C2, C3, K1, K2, K3 }));
export const ISO_CLASSES = ISO2408.map((r) => `${r.cls} (Table ${r.table})`);
export const ISO_NONE = "not in ISO 2408 Table C.1 / C.2";
// 1.7.0 item 7: the class list says what is in each class (ISO 2408:2017 Tables D.1–D.18, "typical construction",
// read 27-Nov-2026), so 6 × 19 and 6 × 19M cannot be confused. The stored value stays the 1.0–1.6 string (old records open).
const CLASS_HAS = {
  "6 × 7": "1-6 strands: 6x7 (D.1)", "6 × 19": "Seale / Filler / Warrington strands: 6x19S, 6x21F, 6x26WS, 6x19W, 6x25F (D.5)",
  "6 × 24": "fibre-centre strands: 6x24FC (D.3)", "6 × 36": "Warrington-Seale / Filler strands: 6x31WS, 6x29F, 6x36WS, 6x37FS, 6x41WS, 6x41F, 6x43FS, 6x49SWS, 6x46WS, 6x49FS (D.6)",
  "6 × 19M": "cross-lay strand 1-6/12: 6x19M (D.2)", "6 × 37M": "cross-lay strand 1-6/12/18: 6x37M (D.4)",
  "8 × 7": "1-6 strands: 8x7 (D.7)", "8 × 19": "8x19S, 8x21F, 8x26WS, 8x19W, 8x25F (D.8)", "8 × 36": "8x31WS, 8x29F, 8x36WS, 8x37FS, 8x41WS, 8x41F, 8x43FS, 8x49SWS, 8x46WS, 8x49FS (D.9)",
  "4 × 19 / 4 × 36": "4x19S, 4x25F, 4x26WS, 4x31WS, 4x36WS, 4x41WS (D.13)", "18 × 7 / 18 × 19": "17x7, 18x7, 18x19S, 18x19W (D.10)",
  "34(M) × 7": "34(M)x7, 36(M)x7 (D.11)", "35(W) × 7": "35(W)x7, 40(W)x7 (D.12)",
  "6 × K7": "compacted: 6xK7 (D.14)", "6 × K19 / 6 × K36": "compacted: 6xK19S, 6xK26WS, 6xK31WS, 6xK36WS, 6xK41WS, 6xK49SWS, 6xK46WS (D.15, D.16)",
  "8 × K19 / 8 × K36": "compacted: 8xK19S, 8xK26WS, 8xK31WS, 8xK36WS, 8xK41WS, 8xK49SWS, 8xK46WS (D.17, D.18)",
  "K4 × 35N": "compacted: K4x35N", "15 × K7": "compacted: 15xK7", "18 × K7 / 18 × K19": "compacted: 18xK7, 18xK19", "35(W) × K7": "compacted: 35(W)xK7",
};
export const ISO_CLASS_OPTS = ISO2408.map((r) => ({ value: `${r.cls} (Table ${r.table})`, label: `${r.cls} – ${CLASS_HAS[r.cls] || "Table " + r.table}` }));
export const classOfName = (cls) => ISO_CLASSES.find((x) => x.startsWith(cls + " (Table")) || "";

// 1.7.0 items 6, 7, 12: the construction list. One row per typical construction of ISO 2408:2017 Tables D.1–D.18
// (strand, outer wires per strand, outer strands = total outer wires ÷ per strand), with its ISO 2408 class, the
// ISO 4309 Annex H example where one is named the same, and the EN 12385-4:2002 outer wire factor a where its
// Tables 5–16 give one (pp. 9–20; δa = a × d, EN 12385-2:2002+A1:2008 3.10.27; Warrington: the larger factor, the
// largest outer wire). Fields: name, class, outer strands, outer wires per strand, Seale (19 wires or fewer), rope type
// (3 single-layer / 4 rotation-resistant), cores allowed, a, EN table and page.
const FC_ = "FC", IW_ = "IWRC", WS_ = "WSC";
const CONSTR_BASE = [
  ["6x7", "6 × 7", 6, 6, false, 3, [FC_, IW_, WS_], 0.106, "Table 5, p. 9"],
  ["6x19S", "6 × 19", 6, 9, true, 3, [FC_, IW_], 0.080, "Table 7, p. 11"], ["6x21F", "6 × 19", 6, 10, false, 3, [FC_, IW_], null, ""],
  ["6x26WS", "6 × 19", 6, 10, false, 3, [FC_, IW_], 0.074, "Table 7, p. 11"], ["6x19W", "6 × 19", 6, 12, false, 3, [FC_, IW_], 0.073, "Table 7, p. 11"],
  ["6x25F", "6 × 19", 6, 12, false, 3, [FC_, IW_], 0.064, "Table 7, p. 11"],
  ["6x19M", "6 × 19M", 6, 12, false, 3, [FC_, IW_, WS_], 0.0640, "Table 12, p. 16"], ["6x37M", "6 × 37M", 6, 18, false, 3, [FC_, IW_, WS_], 0.0455, "Table 13, p. 17"],
  ["6x24FC", "6 × 24", 6, 12, false, 3, [FC_], null, ""],
  ["6x31WS", "6 × 36", 6, 12, false, 3, [FC_, IW_], 0.064, "Table 9, p. 13"], ["6x29F", "6 × 36", 6, 14, false, 3, [FC_, IW_], null, ""],
  ["6x36WS", "6 × 36", 6, 14, false, 3, [FC_, IW_], 0.056, "Table 9, p. 13"], ["6x37FS", "6 × 36", 6, 12, false, 3, [FC_, IW_], null, ""],
  ["6x41WS", "6 × 36", 6, 16, false, 3, [FC_, IW_], 0.050, "Table 9, p. 13"], ["6x49SWS", "6 × 36", 6, 16, false, 3, [FC_, IW_], 0.050, "Table 9, p. 13 (named 6x49WS there, strand 1-8-8-8+8-16)"],
  ["6x46WS", "6 × 36", 6, 18, false, 3, [FC_, IW_], 0.0455, "Table 9, p. 13"],
  ["8x7", "8 × 7", 8, 6, false, 3, [FC_, IW_, WS_], 0.087, "Table 6, p. 10"],
  ["8x19S", "8 × 19", 8, 9, true, 3, [FC_, IW_], 0.0655, "Table 8, p. 12"], ["8x26WS", "8 × 19", 8, 10, false, 3, [FC_, IW_], 0.0600, "Table 8, p. 12"],
  ["8x19W", "8 × 19", 8, 12, false, 3, [FC_, IW_], 0.0606, "Table 8, p. 12"], ["8x25F", "8 × 19", 8, 12, false, 3, [FC_, IW_], 0.0525, "Table 8, p. 12"],
  ["8x31WS", "8 × 36", 8, 12, false, 3, [FC_, IW_], 0.0525, "Table 10, p. 14"], ["8x36WS", "8 × 36", 8, 14, false, 3, [FC_, IW_], 0.0460, "Table 10, p. 14"],
  ["8x41WS", "8 × 36", 8, 16, false, 3, [FC_, IW_], 0.0410, "Table 10, p. 14"], ["8x46WS", "8 × 36", 8, 18, false, 3, [FC_, IW_], 0.0373, "Table 10, p. 14"],
  ["4x19S", "4 × 19 / 4 × 36", 4, 9, true, 4, [FC_], null, ""], ["4x31WS", "4 × 19 / 4 × 36", 4, 12, false, 4, [FC_, WS_], null, ""],
  ["17x7", "18 × 7 / 18 × 19", 11, 6, false, 4, [FC_, WS_], 0.070, "Table 14, p. 18"], ["18x7", "18 × 7 / 18 × 19", 12, 6, false, 4, [FC_, WS_], 0.0632, "Table 14, p. 18"],
  ["34(M)x7", "34(M) × 7", 17, 6, false, 4, [FC_, WS_], 0.0472, "Table 15, p. 19"], ["36(M)x7", "34(M) × 7", 18, 6, false, 4, [FC_, WS_], 0.045, "Table 15, p. 19"],
  ["35(W)x7", "35(W) × 7", 16, 6, false, 4, [WS_], 0.0461, "Table 16, p. 20"], ["40(W)x7", "35(W) × 7", 18, 6, false, 4, [WS_], null, ""],
  ["6xK7", "6 × K7", 6, 6, false, 3, [FC_], null, ""], ["6xK19S", "6 × K19 / 6 × K36", 6, 9, true, 3, [FC_, IW_], null, ""],
  ["6xK26WS", "6 × K19 / 6 × K36", 6, 10, false, 3, [FC_, IW_], null, ""], ["6xK36WS", "6 × K19 / 6 × K36", 6, 14, false, 3, [FC_, IW_], null, ""],
  ["8xK19S", "8 × K19 / 8 × K36", 8, 9, true, 3, [FC_, IW_], null, ""], ["8xK26WS", "8 × K19 / 8 × K36", 8, 10, false, 3, [FC_, IW_], null, ""],
  ["8xK36WS", "8 × K19 / 8 × K36", 8, 14, false, 3, [FC_, IW_], null, ""],
  ["35(W)xK7", "35(W) × K7", 16, 6, false, 4, [WS_], null, ""],
];
const CORE_OF = { [FC_]: "fibre core (FC)", [IW_]: "steel core (IWRC)", [WS_]: "wire strand core (WSC)" };
// Annex H examples named exactly like a list entry (ISO 4309:2017 pp. 51–56, as in ANNEX_H below).
const ANNEX_SAME = { "6x7-FC": "6x7-FC", "6x19S-IWRC": "6x19S-IWRC", "6x19M-WSC": "6x19M-WSC", "6x25F-IWRC": "6x25F-IWRC", "6x36WS-IWRC": "6x36WS-IWRC",
  "6x41WS-IWRC": "6x41WS-IWRC", "6x37M-IWRC": "6x37M-IWRC", "8x19S-IWRC": "8x19S-IWRC", "8x25F-IWRC": "8x25F-IWRC", "6xK26WS-IWRC": "6xK26WS-IWRC",
  "6xK36WS-IWRC": "6xK36WS-IWRC", "8xK26WS-IWRC": "8xK26WS-IWRC", "17x7-FC": "17x7-FC", "18x7-WSC": "18x7-WSC or 19x7", "35(W)x7-WSC": "34(W)x7-WSC or 35(W)x7" };
export const CONSTRUCTIONS = CONSTR_BASE.flatMap(([name, cls, s, w, seale, type, cores, a, aSrc]) => cores.map((k) => {
  const key = `${name}-${k}`;
  return { key, name, cls, isoclass: classOfName(cls), outer: s, wires: w, seale, ropetype: type === 3 ? 0 : 1, core: CORE_OF[k], a, aSrc, annexh: ANNEX_SAME[key] || "" };
}));
export const CONSTR_OTHER = "Other – type it below";
export const constructionByKey = (k) => CONSTRUCTIONS.find((x) => x.key === k) || null;
// Free text (the certificate's words) -> list entry, or class + core only. "6x19" with no strand letter -> class 6 × 19
// (Table D.5; owner's 1.7.0 block, item 7), with a note that a cross-lay 1-6/12 strand is class 6 × 19M.
const norm = (t) => String(t ?? "").toLowerCase().replace(/×/g, "x").replace(/\s+/g, "").replace(/\+/g, "-");
export function parseConstruction(text) {
  const t = norm(text); if (!t) return null;
  const core = /iwrc|ipc|steelcore/.test(t) ? CORE_OF[IW_] : /wsc|wirestrand/.test(t) ? CORE_OF[WS_] : /fc|fibre|fiber|sisal|pp/.test(t) ? CORE_OF[FC_] : "";
  const tail = (r) => /^(-|iwrc|ipc|wsc|fc|steel|fibre|fiber|$)/.test(r);
  const byName = [...CONSTR_BASE].sort((a, b) => b[0].length - a[0].length).find(([n]) => t.startsWith(norm(n)) && tail(t.slice(norm(n).length)));
  if (byName) {
    const kk = Object.keys(CORE_OF).find((x) => CORE_OF[x] === core);
    const k = core ? kk : (byName[6].length === 1 ? byName[6][0] : null);
    const e = k && byName[6].includes(k) ? constructionByKey(`${byName[0]}-${k}`) : null;
    if (e) return { entry: e };
    return { cls: byName[1], isoclass: classOfName(byName[1]), core, outer: byName[2], note: core ? `ISO 2408 gives ${byName[0]} no ${core} column.` : "" };
  }
  const m = t.match(/^(\d+)x(k?)(\d+)(m?)(.*)$/);
  if (!m || !tail(m[5])) return core ? { core } : null;
  const s = +m[1], cls = `${s} × ${m[2] ? "K" : ""}${m[3]}${m[4] ? "M" : ""}`;
  const iso = ISO_CLASSES.find((x) => x.split(" (Table")[0].split(" / ").includes(cls)) || "";
  return { cls, isoclass: iso, core, outer: s, note: cls === "6 × 19" ? "\"6x19\" with no strand letter: class 6 × 19 (Seale / Filler / Warrington, ISO 2408 Table D.5). A cross-lay 1-6/12 strand is class 6 × 19M – check the strand." : "" };
}
// 1.7.0 item 12: δmax estimated (nominal), based on construction - optional, never the default, never sets the LF limit.
export const DMAX_EST_LABEL = "δmax estimated (nominal), based on construction";
export function dmaxEstimate(entry, d) {
  const D = pos(num(d));
  if (!entry) return { why: "Pick the construction from the list (strand type needed): EN 12385-4 gives the outer wire factor per strand type." };
  if (entry.a == null) return { why: `EN 12385-4:2002 gives no outer wire factor for ${entry.name}.` };
  if (!D) return { why: "Needs the nominal diameter." };
  const v = Math.round(entry.a * D * 100) / 100;
  return { value: v, a: entry.a, text: `δa = a × d = ${entry.a} × ${D} = ${v.toFixed(2)} mm (EN 12385-4:2002 ${entry.aSrc}, ${entry.name}; EN 12385-2 3.10.27). Estimated – information only; it never sets the LF limit (PRO-AIC-0608 A3: δmax is never assumed from the construction for the limit).`,
    src: `EN 12385-4:2002 ${entry.aSrc}; EN 12385-2:2002+A1:2008 3.10.26–3.10.27` };
}

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

// Choice lists use exactly Kuzo's words (Kuzo is the master, 24-Nov-2026): Kuzo app/src/index.html rope form,
// engine/lftable.py SOURCES. A source blank = A not known (Kuzo "— not chosen —"); nothing extra (ruling D4).
export const CONSTR_SOURCES = ["rope certificate", "client advice", "counted on the rope"];
export const A_CERT = "certificate", A_MAKER = "maker's data", A_WRITTEN = "client or maker written confirmation", A_ISO = "calculated (ISO 2408)";
export const A_SOURCES = [A_CERT, A_MAKER, A_WRITTEN, A_ISO];
export const A_TYPED = [A_CERT, A_MAKER, A_WRITTEN];
export const DMAX_SOURCES = ["measured on a wire taken from the rope", "certificate, rope maker's data or written confirmation for that rope", "not available"];
export const LAYS = ["ordinary", "Lang", "not known"];
export const RUNS = ["steel sheaves / single-layer drum", "multi-layer drum"];
export const LMA_ROUTES = ["Route 1 – reference rope", "Route 2 – on the rope", "Route 3 – added wires"];
export const LF_METHODS = ["base-trace configuration file loaded (repeat test)", "reference rope fault", "known break in the rope", "two added wires",
  "clean section – last resort (no reference rope, no known break, no calibration wires on site)"];
export const LF_CLEAN = LF_METHODS[4];
// Kuzo's own LF route ids (app/src/jobs/calroute.js LF_ROUTES; route 4 = ROUTE4_ID "clean_section", Kuzo 0.2.10).
const KZ_LF_ROUTE = { [LF_METHODS[0]]: "base_trace", [LF_METHODS[1]]: "local_fault", [LF_METHODS[2]]: "broken_wire", [LF_METHODS[3]]: "two_wires", [LF_METHODS[4]]: "clean_section" };
// PRO-AIC-0608 C5 as refiled 27-Nov-2026: the clean-section route (last resort).
export const CLEAN_SRC = "PRO-AIC-0608 C5 (refiled 27-Nov-2026): clean section, last resort";
export function cleanRule(h) {
  if (!h) return "Choose the head.";
  return h.lfRule === "BU-M" ? "BU-M: set the LF threshold at the clean-section reading." : `${h.lfRule === "MH 80-120" ? "MH 80-120" : "BU-16"}: set the LF threshold 1 to 2 mV below the clean-section reading.`;
}
export const CLEAN_TEXT = "Only where there is no reference rope, no known broken wire and no calibration wires on site. Run the head at least twice over a section checked to be sound and read the highest LF signal on it (mV). Every LF pulse above the threshold is checked on the trace of both passes and, where it can be reached, on the rope. No one-wire signal: each pulse counts as one wire, or the pulse divided by an estimated one-wire signal; the wire count is marked 'estimated'. This route alone does not make the result LIMITED.";
// Breaking force (1.7.0 item 11): every figure labelled by its source; the engineer confirms which is used. Not mandatory.
export const BF_CERT = "rope certificate", BF_MAKER = "maker's data / manual", BF_ISO = "calculated from ISO 2408";
export const BF_SOURCES = [BF_CERT, BF_MAKER, BF_ISO];
export const YESNO = ["yes", "no"];
export const ACUMEN = "Acumen criterion, derived from ISO 4309 (R08)";

// ---------------------------------------------------------------------------------------------
// Record fields = CSV columns, in this order.
// ---------------------------------------------------------------------------------------------
// 1.7.0: "temp" and "lmaneg" are no longer asked (owner's 1.7.0 block, item 4) but stay in the record and the CSV, so
// records from 1.0–1.6.1 lose nothing. New head fields (route 4) are added at the end.
const HEAD_FIELDS = ["head", "head_sn", "bu_sn", "liner", "temp", "settled", "selftest", "counter",
  "route", "r1_id", "r1_zero", "r1_known", "r1_seg2", "r2_from", "r2_to", "r2_passes", "air", "air_auto", "r2_zero",
  "r3_n", "r3_dw", "r3_set", "r3_zero", "cal_time",
  "lfm", "lf_at", "lfwd", "lflen", "lfgap", "sig", "thr", "alarm", "speedcomp", "config", "scanstep",
  "c6_done", "c6_zero", "c6_len", "c6_known", "lmaneg", "cs_from", "cs_to", "cs_mv", "sig_est"];
export const HEAD_KEYS = HEAD_FIELDS;
export const FIELDS = [
  "type", "ref", "jobno", "client", "position", "date", "engineer", "location", "length",
  "dnom", "d_cert", "da", "db",
  "construction", "csrc", "annexh", "ropetype", "seale", "core", "outer", "wires", "lay", "runs", "spool_from", "spool_to",
  "isoclass", "asrc", "a", "dmaxsrc", "dmax", "class_note", "bf", "grade",
  ...HEAD_FIELDS.map((f) => "h1_" + f), "h2on", ...HEAD_FIELDS.map((f) => "h2_" + f),
  "datum", "A_from", "A_to", "A_w", "A_gap", "B_from", "B_to", "B_w", "B_gap", "C_from", "C_to", "C_w", "C_gap",
  "counted", "checked", "notes",
  // 1.7.0 (added at the end): construction picked from the list, rope maker, maker's breaking force and where it came
  // from, the breaking force used, the optional estimated δmax.
  "ckey", "maker", "bf_maker", "bf_maker_ref", "bf_used", "dmax_est",
];
export const SECTIONS = ["A", "B", "C"];
// Automatic values the engineer may override (only with a reason; saved with the time).
export const OVERRIDABLE = { air: "Air value to type into the BU-M", lf6: "LF limit over 6d", lf30: "LF limit over 30d" };

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

// ---------------------------------------------------------------------------------------------
// BREAKING-FORCE CHECK (1.5.0, owner's word 26-Nov-2026, item 6). Advice only: nothing is changed by it.
// ISO 2408:2017 Annex C, C.1 (p. 17): Fmin = d² × Rr × K ÷ 1000 (Formula C.1), kN; d nominal mm, Rr rope grade N/mm²,
// 2–60 mm only. K from Table C.1 / C.2 (p. 18): K1 fibre core, K2 IWRC, K3 wire strand core or centre.
// ---------------------------------------------------------------------------------------------
const K_COL = { "fibre core (FC)": "K1", "steel core (IWRC)": "K2", "wire strand core (WSC)": "K3" };
// Same family, compacted (Table C.1 class -> Table C.2 class). Owner's rule 26-Nov-2026: amber when the certificate force
// is at or above the Fmin of this compacted class, same core column (K1 / K2 / K3).
const COMPACTED_OF = { "6 × 7": "6 × K7", "6 × 19": "6 × K19 / 6 × K36", "6 × 36": "6 × K19 / 6 × K36", "8 × 19": "8 × K19 / 8 × K36",
  "8 × 36": "8 × K19 / 8 × K36", "18 × 7 / 18 × 19": "18 × K7 / 18 × K19", "35(W) × 7": "35(W) × K7" };
export const BF_SRC = "ISO 2408:2017 Annex C, Formula (C.1) (p. 17); K from Table C.1 / C.2 (p. 18)";
const rowOf = (isoclass) => ISO2408.find((r) => `${r.cls} (Table ${r.table})` === isoclass) || null;

// K for a class row and core at a grade: { K, col, note } or { why }.
function kFactor(row, core, grade) {
  const col = K_COL[core];
  if (!col) return { why: core ? `ISO 2408 gives no breaking force factor for ${core}` : "core not chosen" };
  const k = row[col];
  if (k == null) return { why: `ISO 2408 Table ${row.table} gives no ${col} for ${row.cls}` };
  if (k !== K35W) return { K: k, col };
  // Table C.1 footnotes: a "Up to rope grade 1960" -> 0.360; b "Rope grade over than 1960 up to 2160" -> 0.350.
  if (grade <= 1960) return { K: 0.360, col, note: "Table C.1 footnote a: up to rope grade 1960" };
  if (grade <= 2160) return { K: 0.350, col, note: "Table C.1 footnote b: rope grade over 1960 up to 2160" };
  return { why: `ISO 2408 Table C.1 gives K3 for ${row.cls} only up to rope grade 2160 (footnotes a, b); grade ${grade} has no K` };
}
const fminOf = (d, grade, K) => d * d * grade * K / 1000;
const pctFrom = (bf, f) => (bf - f) / f * 100;
const aboveBelow = (p) => `${r1(Math.abs(p), 1)} % ${p >= 0 ? "above" : "below"}`;
const EPS = 1e-6;   // kN: equal figures (floating point) count as "at"
export const BF_FITS = "Breaking force fits the compacted class better - check the construction";
export const BF_BELOW = "Certificate breaking force below the ISO 2408 minimum for this class - check the class, core and grade";

// { d, isoclass, core, bf, grade } -> null (nothing entered) | { ok: false, why } | { ok: true, Fmin, K, col, pct, working, compacted }
export function bfCheck({ d, isoclass, core, bf, grade }) {
  const D = pos(num(d)), F = pos(num(bf)), R = pos(num(grade));
  if (F == null && R == null) return null;
  const need = [F == null && "the certificate breaking force", R == null && "the rope grade", D == null && "the nominal diameter",
    !isoclass && "the ISO 2408 class", !core && "the core"].filter(Boolean);
  if (need.length) return { ok: false, why: `Breaking-force check needs ${need.join(", ")}.` };
  if (isoclass === ISO_NONE) return { ok: false, why: "Class not in ISO 2408 Table C.1 / C.2: no K – no breaking-force check." };
  const row = rowOf(isoclass);
  if (!row) return { ok: false, why: "ISO 2408 class not chosen." };
  if (D < 2 || D > 60) return { ok: false, why: `d ${D} mm is outside 2–60 mm: ISO 2408 Annex C (C.1) does not cover it – no breaking-force check.` };
  const k = kFactor(row, core, R);
  if (k.why) return { ok: false, why: `${k.why}: no K – no breaking-force check.` };
  const Fmin = fminOf(D, R, k.K), pct = pctFrom(F, Fmin);
  const out = { ok: true, Fmin, K: k.K, col: k.col, row, pct, bf: F, grade: R, d: D, below: F < Fmin - EPS, fits: false,
    working: `Fmin = d² × Rr × K ÷ 1000 = ${D}² × ${R} × ${k.K.toFixed(3)} ÷ 1000 = ${r1(Fmin, 1)} kN (Table ${row.table}, ${row.cls}, ${k.col}${k.note ? "; " + k.note : ""}). Certificate ${r1(F, 1)} kN is ${aboveBelow(pct)} Fmin.`,
    compacted: null, compNote: "" };
  const cc = COMPACTED_OF[row.cls];
  if (row.table === "C.2") out.compNote = `The class chosen is already compacted (Table C.2): no compacted-class check.`;
  else if (!cc) out.compNote = `ISO 2408 Table C.2 has no compacted class of the ${row.cls} family: no compacted-class check.`;
  else {
    const crow = ISO2408.find((r) => r.cls === cc), ck = kFactor(crow, core, R);
    if (ck.why) out.compNote = `Same family, compacted: ${cc} – ${ck.why.replace(/^ISO 2408 /, "")}: no compacted-class check.`;
    else {
      const cf = fminOf(D, R, ck.K), cp = pctFrom(F, cf);
      out.fits = F >= cf - EPS;
      out.compacted = { cls: cc, table: crow.table, K: ck.K, col: ck.col, Fmin: cf, pct: cp, gap: cf - Fmin, gapPct: (cf - Fmin) / Fmin * 100,
        text: `Same family, compacted: ${cc} (Table ${crow.table}, ${ck.col} ${ck.K.toFixed(3)}): Fmin = ${D}² × ${R} × ${ck.K.toFixed(3)} ÷ 1000 = ${r1(cf, 1)} kN. Gap between the two minimums: ${r1(cf, 1)} − ${r1(Fmin, 1)} = ${r1(cf - Fmin, 1)} kN (${r1((cf - Fmin) / Fmin * 100, 1)} %). Certificate ${r1(F, 1)} kN is ${out.fits ? "at or above" : "below"} the compacted Fmin.` };
    }
  }
  const compLine = out.compacted ? out.compacted.text : out.compNote;
  out.full = `${out.working} ${compLine}`;
  if (out.fits) out.amber = { id: "bf-fits", text: `${BF_FITS}: certificate ${r1(F, 1)} kN is at or above the ${cc} Fmin ${r1(out.compacted.Fmin, 1)} kN (${row.cls} Fmin ${r1(Fmin, 1)} kN).` };
  else if (out.below) out.amber = { id: "bf-below", text: `${BF_BELOW}: certificate ${r1(F, 1)} kN, Fmin ${r1(Fmin, 1)} kN (${r1(Math.abs(pct), 1)} % below).` };
  return out;
}

// ISO 2408 Fmin for the class, core and grade on their own (1.7.0 item 11: figure (3), "calculated from ISO 2408").
export function fminFor({ d, isoclass, core, grade }) {
  const D = pos(num(d)), R = pos(num(grade));
  const need = [D == null && "the nominal diameter", R == null && "the rope grade (N/mm²)", !isoclass && "the ISO 2408 class", !core && "the core"].filter(Boolean);
  if (need.length) return { why: `Needs ${need.join(", ")}.` };
  if (isoclass === ISO_NONE) return { why: "Class not in ISO 2408 Table C.1 / C.2: no K." };
  const row = rowOf(isoclass); if (!row) return { why: "ISO 2408 class not chosen." };
  if (D < 2 || D > 60) return { why: `d ${D} mm is outside 2–60 mm: ISO 2408 Annex C (C.1) does not cover it.` };
  const k = kFactor(row, core, R); if (k.why) return { why: `${k.why}: no K.` };
  const F = fminOf(D, R, k.K);
  return { value: F, text: `Fmin = d² × Rr × K ÷ 1000 = ${D}² × ${R} × ${k.K.toFixed(3)} ÷ 1000 = ${r1(F, 1)} kN (Table ${row.table}, ${row.cls}, ${k.col}${k.note ? "; " + k.note : ""})`, src: BF_SRC };
}
// Every breaking-force figure with its source label; the one the engineer confirms (bf_used), or none.
export function bfFigures(rec) {
  const cert = pos(num(rec.bf)), maker = pos(num(rec.bf_maker)), iso = fminFor({ d: rec.dnom, isoclass: rec.isoclass, core: rec.core, grade: rec.grade });
  const figs = [cert != null && { source: BF_CERT, kN: cert }, maker != null && { source: BF_MAKER, kN: maker, ref: String(rec.bf_maker_ref || "").trim() || null },
    iso.value != null && { source: BF_ISO, kN: Math.round(iso.value * 10) / 10, working: iso.text }].filter(Boolean);
  return { cert, maker, iso, figs, used: figs.find((f) => f.source === rec.bf_used) || null };
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
export const S_LABEL = "S - Intron density factor K (air value only)";
export const aLabel = (src) => (src === A_ISO ? "A - ISO 2408 factor (broken-wire limits)" : src ? `A - ${src} (broken-wire limits)` : "A - metallic area (broken-wire limits)");
export function compute(rec) {
  const g = (k) => pos(num(rec[k]));
  const dn = g("dnom");
  const da = g("da"), db = g("db");
  const D = da && db ? (da + db) / 2 : (da || db || null);     // two readings at 90° at the widest point (ruling D2); selects head and liners
  const k = K[rec.core] ?? null;
  const S = dn && k ? k * PI * dn * dn / 4 : null;               // A3: S = K × π × d² ÷ 4, d nominal - air value / route 3 only
  const iso = isoFactor(rec, dn);
  let Aauto = null, Asrc = rec.asrc || "", Aestimate = false;
  if (rec.asrc === A_ISO) { Aauto = iso.ok ? iso.A : null; Aestimate = true; }
  else if (A_TYPED.includes(rec.asrc)) Aauto = g("a");
  const A = Aauto;
  const Aair = A ?? S;
  const dmax = rec.dmaxsrc === DMAX_SOURCES[2] ? null : g("dmax");
  const wireArea = dmax ? PI * dmax * dmax / 4 : null;
  const outer = g("outer"), wires = g("wires");
  const n = outer && wires ? outer * wires : null;
  const c = { dn, da, db, D, dcert: g("d_cert"), k, S, iso, Aauto, A, Asrc, Aestimate, Aair, dmax, wireArea, n,
    share: wireArea && A ? wireArea / A * 100 : null,
    l6: dn ? 6 * dn / 1000 : null, l30: dn ? 30 * dn / 1000 : null };
  c.lf = lfLimit(rec, c);
  c.bf = bfCheck({ d: rec.dnom, isoclass: rec.isoclass, core: rec.core, bf: rec.bf, grade: rec.grade });
  c.bfFig = bfFigures(rec);
  c.entry = constructionByKey(rec.ckey);
  c.dEst = rec.dmax_est === "yes" ? dmaxEstimate(c.entry, rec.dnom) : null;
  c.heads = activeHeads(rec).map((i) => {
    const h = headOf(rec[`h${i}_head`]);
    const out = { i, h };
    if (!h) return out;
    out.rule = lfRule(h);
    out.liner = linerFor(h.model, D);
    out.serials = HEAD_SERIALS[h.model] || [];
    out.sens = D ? h.sens(D) : null;
    out.hasTable = !!AIR[h.model];
    if (out.hasTable) {
      const t = airFromT4(h.model, Aair);
      out.t4 = t;
      out.airAuto = t && t.value != null ? t.value : null;
      out.airWorking = Aair == null ? "A not known yet" : t && t.value != null
        ? `${h.model} table: ${A != null ? "A" : "A estimate (Intron k)"} = ${r1(Aair)} mm² is in ${t.from}–${t.to} mm² → ${t.value} %`
        : `A ${r1(Aair)} mm² is outside the ${h.model} table (${t.lo}–${t.hi} mm²) – ${OWN_MANUAL}`;
    } else out.airWorking = `${h.model}: ${OWN_MANUAL}`;
    out.air = ovr(rec, `air${i}`) ?? out.airAuto ?? null;
    const route3 = rec[`h${i}_route`] === LMA_ROUTES[2];
    if (route3) {
      const nW = g(`h${i}_r3_n`), dw = g(`h${i}_r3_dw`);
      if (nW && dw && Aair) { out.dS = nW * PI * dw * dw / 4; out.r3set = -(out.dS / Aair) * 100; }
    }
    return out;
  });
  c.working = [
    ["Measured diameter (mean of the two readings)", D ? `${r1(D, 2)} mm` : "–", da && db ? `(${da} + ${db}) ÷ 2, two readings at 90° at the widest point${c.dcert ? `; certificate: ${c.dcert} mm` : ""}` : "", "PRO-AIC-0608 B2, C2; owner's ruling D2 (24-Nov-2026)"],
    [aLabel(Asrc), A != null ? `${r1(A)} mm²` : "not known", A != null ? `source: ${Asrc}${Aestimate ? ` – A = C × d² = ${iso.C.toFixed(3)} × ${dn}² (Table ${iso.row.table}, ${iso.row.cls}, ${iso.col}); LF limits marked 'estimate'` : ""}` : iso.ok ? "" : iso.why, "PRO-AIC-0608 A3; ISO 2408 Annex C (p. 18)"],
    [S_LABEL, S ? `${r1(S, 0)} mm²` : "–", S ? `S = K × π × d² ÷ 4 = ${k} × π × ${dn}² ÷ 4 (K: ${rec.core}). Used only to choose the air value / route 3 S when A is not known; not reported and no limit is calculated from it` : "needs nominal d and core", "PRO-AIC-0608 A3; manual v1.3 2.4.2 (p. 27)"],
    ["One-wire area", wireArea ? `${r1(wireArea, 2)} mm²` : "–", wireArea ? `π × δmax² ÷ 4 = π × ${dmax}² ÷ 4` : "δmax not available", "PRO-AIC-0608 A3"],
    ["Single-wire share", c.share ? `${r1(c.share, 2)} % of A` : "–", c.share ? "(π × δmax² ÷ 4) ÷ A × 100, compared with the head's LF sensitivity" : "needs A and δmax", "PRO-AIC-0608 A3"],
    ["D ÷ δmax", dn && dmax ? r1(dn / dmax, 1) : "–", dn && dmax ? `${dn} ÷ ${dmax}` : "", "nominal d"],
    ["Load-bearing outer wires n", n ?? "–", n ? `${outer} strands × ${wires} wires, fillers excluded` : "", "PRO-AIC-0608 §9.2.2"],
    ["6d", dn ? `${r1(c.l6, 3)} m${c.lf.ok ? ` – LF limit ${c.lf.l6} wires` : ""}` : "–", dn ? `6 × ${dn} mm, nominal d` : "", "ISO 4309 Table C.1; site sheet"],
    ["30d", dn ? `${r1(c.l30, 2)} m${c.lf.ok ? ` – LF limit ${c.lf.l30} wires` : ""}` : "–", dn ? `30 × ${dn} mm, nominal d` : "", "ISO 4309 Table C.1; site sheet"],
    ["RCN", c.lf.rcn ?? (rcnFor(rec).ok ? rcnFor(rec).rcn ?? "> 300 wires" : "–"), rcnFor(rec).ok ? rcnFor(rec).how : rcnFor(rec).why, "ISO 4309 Annex H (pp. 51–56); PRO-AIC-0608 §9.2.2"],
    ["LF limit 6d / 30d", c.lf.ok ? `${c.lf.l6} / ${c.lf.l30} wires${c.lf.drum6 != null ? ` (multi-layer drum ${c.lf.drum6} / ${c.lf.drum30})` : ""}${ovr(rec, "lf6") != null || ovr(rec, "lf30") != null ? " (overridden)" : ""}` : "not calculated", c.lf.ok ? `${c.lf.route}. ${c.lf.working}` : c.lf.why, c.lf.src],
  ];
  if (c.dEst) c.working.push([DMAX_EST_LABEL, c.dEst.value != null ? `${c.dEst.value.toFixed(2)} mm (estimated)` : "not given", c.dEst.value != null ? c.dEst.text : c.dEst.why, c.dEst.src || "EN 12385-4:2002"]);
  for (const f of c.bfFig.figs) c.working.push([`Breaking force – ${f.source}`, `${r1(f.kN, 1)} kN${c.bfFig.used === f ? " – used" : ""}`, f.working || f.ref || "", f.source === BF_ISO ? BF_SRC : f.source]);
  if (c.bf) c.working.push(["Breaking-force check (ISO 2408)", c.bf.ok ? `Fmin ${r1(c.bf.Fmin, 1)} kN – certificate ${r1(c.bf.bf, 1)} kN, ${aboveBelow(c.bf.pct)}` : "no check",
    c.bf.ok ? `${c.bf.full} Advice only – nothing is changed.` : c.bf.why, BF_SRC]);
  for (const hc of c.heads) if (hc.h) {
    c.working.push([`Air value to type into the BU-M – ${hc.h.model}`, hc.air != null ? `${hc.air} %` : OWN_MANUAL, hc.airWorking, airSrc(hc.h.model)]);
  }
  return c;
}

// ---------------------------------------------------------------------------------------------
// checks(rec, c): every rule broken, with what is wrong, the correct value or range, and the clause.
// level red = fix, or give a reason (saved with the time); amber = warning, can continue.
// ---------------------------------------------------------------------------------------------
const ZERO_FIELDS = { length: "Rope length", dnom: "Nominal diameter", d_cert: "Measured diameter (certificate)", da: "Diameter reading 1", db: "Diameter reading 2",
  outer: "Outer strands", wires: "Wires per strand", a: "Metallic area A", bf: "Breaking force (certificate)", grade: "Rope grade", dmax: "δmax", A_gap: "Section A gap", B_gap: "Section B gap", C_gap: "Section C gap" };
// LF threshold and alarm are recorded with no check of Rope Record's own; Kuzo checks them (ruling D5, 24-Nov-2026).
const HEAD_ZERO = { air: "Air value", lfwd: "Wire diameter", lflen: "Wire length", lfgap: "Gap", sig: "One-wire LF signal", r3_dw: "Added wire diameter", r1_known: "Known LMA of segment 2", scanstep: "Scan step" };
const SCREEN_OF = { length: "job", A_gap: "sections", B_gap: "sections", C_gap: "sections" };
const HSCREEN = { head: "c1", head_sn: "c1", bu_sn: "c1", liner: "c2", temp: "c2", settled: "c3", selftest: "c3", counter: "c3",
  route: "c4", r1_zero: "c4", r1_known: "c4", r1_seg2: "c4", r2_from: "c4", r2_to: "c4", r2_passes: "c4", air: "c4air", r2_zero: "c4air", r3_n: "c4", r3_dw: "c4", r3_set: "c4", r3_zero: "c4",
  lfm: "c5", lfwd: "c5", lflen: "c5", lfgap: "c5", sig: "c5sig", thr: "c5thr", alarm: "c5thr", c6_zero: "c6", c6_len: "c6", c6_known: "c6", lmaneg: "c6", c6_done: "c6",
  cs_from: "c5", cs_to: "c5", cs_mv: "c5", sig_est: "c5" };
// Filled-in fields (1.7.0 rule 1): field -> label and screen, for the "changed by the engineer" line.
export const FILLED = { engineer: ["Engineer", "job"], construction: ["Construction", "rope"], annexh: ["ISO 4309 Annex H construction", "rope"], ropetype: ["Rope type", "rope"],
  seale: ["Seale outer strands", "rope"], outer: ["Outer strands", "rope"], wires: ["Wires per outer strand", "rope"], core: ["Core", "rope"], isoclass: ["ISO 2408 class", "rope"],
  head_sn: ["Head serial No.", "c1"], liner: ["Liner set", "c2"], lfwd: ["Added wire diameter (LF)", "c5"], r3_dw: ["Added wire diameter (LMA route 3)", "c4"] };

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
    if (p >= lim) add("amber", "dia-up", "da", "rope", `Measured diameter ${r1(c.D, 2)} mm is ${r1(p, 1)} % above the nominal ${dn} mm.`, `An increase of ${lim} % or more (${rec.core === CORES[0] ? "fibre" : "steel"} core) is investigated and discard considered; check the nominal size.`, "PRO-AIC-0608 B2, §9.3 (ISO 4309 6.7.6)");
    if (p < 0) add("amber", "dia-down", "da", "rope", `Measured diameter ${r1(c.D, 2)} mm is below the nominal ${dn} mm.`, "Decrease is evaluated against the reference diameter, never the nominal – record the reference diameter if known.", "PRO-AIC-0608 B2, §9.3 (ISO 4309 Table 5)");
  }
  if (dn && dn > 63.5) add("amber", "over635", "dnom", "rope", `Rope ${dn} mm is over 63.5 mm.`, "Tested only by client agreement recorded on the Job Order.", "PRO-AIC-0608 §1.2, A1 (ASTM E1571-21 1.1.1)");
  // A and δmax (A3)
  if (rec.asrc === A_ISO && !c.iso.ok) add("red", "iso", "isoclass", "rope", `A cannot be calculated from ISO 2408: ${c.iso.why}.`, "Use the certificate, maker's data or written confirmation, or leave the source blank (A not known).", "PRO-AIC-0608 A3; ISO 2408 Annex C (2–60 mm only)");
  if (A_TYPED.includes(rec.asrc) && c.Aauto == null && !isZero("a")) add("red", "a-missing", "a", "rope", `A source is "${rec.asrc}" but no A is entered.`, "Type A from the document, or leave the source blank (A not known).", "PRO-AIC-0608 A3");
  if (c.A != null && dn && c.A >= PI * dn * dn / 4) add("red", "a-circle", "a", "rope", `A ${r1(c.A)} mm² is not less than the circle area π × d² ÷ 4 = ${r1(PI * dn * dn / 4)} mm².`, "A is the metallic area (always less than the circle area); the circle area is never entered as A.", "PRO-AIC-0608 A3, §9.2.1");
  if (rec.dmaxsrc && rec.dmaxsrc !== DMAX_SOURCES[2] && !pos(num(rec.dmax)) && !isZero("dmax")) add("red", "dmax-missing", "dmax", "rope", `δmax source is "${rec.dmaxsrc}" but no δmax is entered.`, "Type δmax, or choose 'not available' (then the ISO 4309 table limit is used).", "PRO-AIC-0608 A3");
  if (c.bf && c.bf.amber) add("amber", c.bf.amber.id, "bf", "rope", c.bf.amber.text, "Advice only – the app changes nothing. Check the certificate and the maker's data.", BF_SRC);
  if (rec.runs === RUNS[1] && (raw("spool_from") === "" || raw("spool_to") === "")) add("amber", "spool", "spool_to", "rope", "Multi-layer drum: the spooling length is not entered.", "Enter the length that spools on the drum; the drum column applies only there.", "PRO-AIC-0608 §9.2.2; site sheet");

  for (const i of activeHeads(rec)) {
    const p = `h${i}_`, scr = (f) => `h${i}-${HSCREEN[f]}`;
    const hc = c.heads.find((x) => x.i === i) || {};
    const h = hc.h, name = h ? h.model : `Head ${i}`;
    const A2 = (lev, id, f, text, want, src) => add(lev, `${id}-${p}`, p + f, scr(f), `${name}: ${text}`, want, src);
    for (const [k, lab] of Object.entries(HEAD_ZERO)) if (isZero(p + k)) A2("red", "zero-" + k, k, `${lab}: 0 typed.`, "Leave the box blank if the value is not available – never type 0.", ZSRC);
    // C1 equipment status
    // 1.7.0: the register checks of 1.1–1.6 ("register not loaded", basic unit 505134 "no certificate ... otherwise not used")
    // are removed - the basic unit is optional (owner's ruling 27-Nov-2026) and rule 2 (no "do not use until" wording).
    if (!h) continue;
    // C2 head range, liner, temperature
    if (c.D && (c.D < h.d[0] || c.D > h.d[1])) A2("red", "range", "head", `rope ${r1(c.D, 2)} mm (measured) is outside the head's range.`, `${h.model} takes ${h.d[0]}–${h.d[1]} mm including coating; choose a head that covers the rope: ${HEADS.filter((x) => c.D >= x.d[0] && c.D <= x.d[1]).map((x) => x.model).join(", ") || "none – rope not tested (C2, §1.5)"}.`, `${h.rangeSrc}; C2`);
    // 1.7.0: no ambient temperature box (owner's ruling 27-Nov-2026, PRO-AIC-0608 C2 / §8 step 5 amended at Rev 01) - no check.
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
      if (!hc.hasTable) A2("amber", "airman", "air", `${OWN_MANUAL}.`, `Take the air value for ${h.model} from its manual – the app gives no figure.`, airSrc(h.model));
      else if (hc.t4 && hc.t4.out) A2("amber", "airout", "air", `A ${r1(c.Aair)} mm² is outside the ${h.model} table (${hc.t4.lo}–${hc.t4.hi} mm²): ${OWN_MANUAL}.`, "The app gives no figure outside the table.", airSrc(h.model));
      else if (air != null && air !== 0 && rec[p + "air_auto"] !== "yes" && hc.air != null && air !== hc.air) A2("red", "air", "air", `air value entered ${air} %.`, `Must be ${hc.air} % – ${hc.airWorking}.`, airSrc(h.model));
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
    if (m === LF_CLEAN) {
      const a = num(rec[p + "cs_from"]), b = num(rec[p + "cs_to"]), mv = pos(num(rec[p + "cs_mv"])), est = pos(num(rec[p + "sig_est"]));
      A2("amber", "lf-route4", "lfm", `LF calibrated by the clean-section route (last resort): section ${a ?? "?"} to ${b ?? "?"} m, highest LF reading ${mv ?? "?"} mV${est ? `, estimated one-wire signal ${est} mV` : ""}; the wire count is marked 'estimated'.`,
        `${cleanRule(h)} Every LF pulse above the threshold checked on both passes. Only where there is no reference rope, no known break and no calibration wires on site.`, CLEAN_SRC);
    }
    if ((c.dmax == null || c.A == null) && m && m !== LF_METHODS[3] && m !== LF_METHODS[0] && m !== LF_CLEAN) A2("amber", "lfadd", "lfm", "δmax or A not available.", "LF is calibrated with added wires of known diameter; record the wire diameter and the one-wire signal.", "PRO-AIC-0608 A3, §9.2.2");
    // C6 closing check, E1
    if (rec[p + "c6_done"] === "no") A2("amber", "c6", "c6_done", "closing check not recorded yet.", "After the recording: zero 0 ± 0.5 %, recorded length within 1 % of a known length.", "PRO-AIC-0608 C6");
    const cz = num(rec[p + "c6_zero"]);
    if (cz != null && Math.abs(cz) > 0.5) A2("red", "c6zero", "c6_zero", `closing zero ${cz} %.`, "0 ± 0.5 % – find the cause; correct with the software shift and record it, or repeat the recording.", "PRO-AIC-0608 C6");
    const L = pos(num(rec[p + "c6_len"])), Lk = pos(num(rec[p + "c6_known"]));
    if (L && Lk && Math.abs(L - Lk) / Lk > 0.01) A2("red", "c6len", "c6_len", `recorded length ${L} m vs known ${Lk} m (${r1(Math.abs(L - Lk) / Lk * 100, 2)} %).`, "Within 1 % – otherwise positions are written as approximate.", "PRO-AIC-0608 C6");
    // 1.7.0: most negative LMA is no longer asked - Kuzo reads it from the trace (E1) - no check.
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
  // 1.7.0 rule 1: a filled-in value the engineer changed is recorded (amber, with the time): CSV and Kuzo log.
  for (const [f, ch] of Object.entries(rec.changes || {})) {
    if (!ch) continue;
    const base = f.replace(/^h\d_/, ""), lab = FILLED[base] || [f, "rope"], hi = f.match(/^h(\d)_/);
    add("amber", "chg-" + f, f, hi ? `h${hi[1]}-${lab[1]}` : lab[1], `${hi ? `Head ${hi[1]}: ` : ""}${lab[0]} filled in as "${ch.from}" was changed to "${ch.to}" (${ch.time}).`, "Filled-in value replaced by the engineer – check it.", "Rope Record Checklist: filled-in values are editable; a change is recorded");
  }
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
  "h1_air_to_type", "h2_air_to_type", "procedure_copy", "bf_Fmin_kN", "bf_check"];
export const CSV_HEAD = ["record_id", "saved_at", "app_version", ...FIELDS, ...CALC_COLS, "problems_red", "problems_amber", "reasons_with_time", "overrides_with_time",
  "filled_in_changes", "dmax_estimated_mm", "bf_figures"];
const q = (x) => { const t = String(x ?? ""); return /[",\n\r]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t; };
const fx = (x, d) => (x == null || !isFinite(x) ? "" : Number(x.toFixed(d)));
export function csvLine(rec) {
  const c = compute(rec), ch = checks(rec, c), H = (i) => c.heads.find((x) => x.i === i) || {};
  const rc = rcnFor(rec);
  const calc = [fx(c.D, 2), fx(c.A, 1), c.A != null ? c.Asrc : "", fx(c.S, 1), fx(c.wireArea, 3), fx(c.share, 3), c.n ?? "", rc.ok ? rc.rcn ?? "> 300" : "",
    fx(c.l6, 3), fx(c.l30, 3), c.lf.ok ? c.lf.route : "not calculated", c.lf.ok ? c.lf.l6 : "", c.lf.ok ? c.lf.l30 : "", c.lf.drum6 ?? "", c.lf.drum30 ?? "",
    c.lf.ok ? c.lf.working : c.lf.why, H(1).air ?? (H(1).h ? "own manual" : ""), H(2).air ?? (H(2).h ? "own manual" : ""),
    `${PROCEDURE.file} SHA-256 ${PROCEDURE.sha256}${PROCEDURE.confirmedFiled ? "" : " (copy not confirmed as filed)"}`,
    c.bf && c.bf.ok ? fx(c.bf.Fmin, 1) : "", c.bf ? (c.bf.ok ? c.bf.full : c.bf.why) : ""];
  const fmt = (x) => `${x.text} ${x.want} [${x.src}]`;
  return [rec.id, rec.savedAt, rec.appVersion, ...FIELDS.map((f) => rec[f] ?? ""), ...calc,
    ch.filter((x) => x.level === "red").map(fmt).join(" | "),
    ch.filter((x) => x.level === "amber").map(fmt).join(" | "),
    ch.filter((x) => x.level === "red" && reasonOf(rec, x.id)).map((x) => `${x.text} REASON (${reasonOf(rec, x.id).time}): ${reasonOf(rec, x.id).text}`).join(" | "),
    Object.entries(rec.ovr || {}).filter(([, o]) => o && String(o.value ?? "").trim() !== "").map(([k, o]) => `${k} = ${o.value} (${o.time}): ${o.reason}`).join(" | "),
    Object.entries(rec.changes || {}).filter(([, x]) => x).map(([k, x]) => `${k}: ${x.from} -> ${x.to} (${x.time})`).join(" | "),
    c.dEst && c.dEst.value != null ? c.dEst.value : "",
    c.bfFig.figs.map((f) => `${f.source} ${f.kN} kN${f.ref ? ` (${f.ref})` : ""}${c.bfFig.used === f ? " USED" : ""}`).join(" | "),
  ].map(q).join(",");
}
export const csvOf = (list) => "﻿" + [CSV_HEAD.map(q).join(","), ...list.map(csvLine)].join("\r\n") + "\r\n";
export const fileName = (rec, when = new Date()) => {
  const p = (n) => String(n).padStart(2, "0");
  const base = (rec.type === "reference" ? rec.ref : [rec.jobno, rec.position].filter((x) => String(x || "").trim()).join("_")) || "rope-record";
  return `${String(base).trim().replace(/[^A-Za-z0-9_\-.]+/g, "-")}_${when.getFullYear()}-${p(when.getMonth() + 1)}-${p(when.getDate())}_${p(when.getHours())}${p(when.getMinutes())}.csv`;
};

// ---------------------------------------------------------------------------------------------
// Records saved by 1.2 and earlier -> today's fields (nothing guessed): first diameter pair -> da / db,
// source words -> Kuzo's words. Applied when a record or draft is opened.
// ---------------------------------------------------------------------------------------------
export function migrate(r) {
  if (!r) return r;
  const x = { ...r };
  if (x.da == null && x.d1a != null) { x.da = x.d1a; x.db = x.d1b; }
  const A_OLD = { "calculated (ISO 2408, 2–60 mm only)": A_ISO, "not known": "" };
  if (x.asrc in A_OLD) x.asrc = A_OLD[x.asrc];
  if (x.dmaxsrc === "certificate, maker's data or written confirmation") x.dmaxsrc = DMAX_SOURCES[1];
  if (x.csrc === "client") x.csrc = "client advice";
  if (x.ovr && x.ovr.A) { const o = x.ovr.A; delete x.ovr.A; x.notes = [x.notes, `A override from an older version: ${o.value} (${o.reason}, ${o.time})`].filter(Boolean).join("\n"); }
  return x;
}

// ---------------------------------------------------------------------------------------------
// Site record for Kuzo: <ref>_<YYYY-MM-DD>_<HHMM>.kuzo.json to rope-record-schema-v1.json (Kuzo is the master).
// Numbers in the key's unit; not available = null (never 0, never ""); choices exactly as the schema's enums.
// heads[].lma_calibration_route carries the C4 route with Kuzo's own route ids (app/src/jobs/calroute.js):
// "ref_rope" | "air" | "auto" | "added". Only "air" has an air value; the others export air_value_entered_pct null
// (ruling D3, 24-Nov-2026) - schema v1 requires a number there, so Kuzo's importer must accept null (Kuzo-side change).
// ---------------------------------------------------------------------------------------------
export const SCHEMA_VERSION = 1;
const KZ_NUM = (v) => { const x = num(v); return x == null || x === 0 ? null : x; };
const KZ_INT = (v) => { const x = KZ_NUM(v); return x != null && Number.isInteger(x) ? x : null; };
const KZ_TXT = (v) => { const t = String(v ?? "").trim(); return t === "" ? null : t; };
const KZ_ROUTE = { [LMA_ROUTES[0]]: "ref_rope", [LMA_ROUTES[2]]: "added" };
const KZ_A_SRC = { [A_CERT]: "rope certificate", [A_MAKER]: "maker's data", [A_ISO]: "ISO 2408 (2–60 mm only)" };
const KZ_DMAX_SRC = { [DMAX_SOURCES[0]]: "wire taken from the rope", [DMAX_SOURCES[1]]: "rope certificate", [DMAX_SOURCES[2]]: "not available" };
const KZ_LF = { [LF_METHODS[2]]: "known broken wire", [LF_METHODS[3]]: "two added wires" };
export function localIso(d) {
  const t = d instanceof Date ? d : new Date(d);
  const off = -t.getTimezoneOffset(), sg = off >= 0 ? "+" : "-", a = Math.abs(off), p = (n) => String(n).padStart(2, "0");
  return `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())}T${p(t.getHours())}:${p(t.getMinutes())}:${p(t.getSeconds())}${sg}${p(Math.floor(a / 60))}:${p(a % 60)}`;
}
export function kuzoRecord(rec, appVersion) {
  const c = compute(rec), ch = checks(rec, c), isRef = rec.type === "reference";
  const heads = activeHeads(rec).map((i) => {
    const p = `h${i}_`, hc = c.heads.find((x) => x.i === i) || {}, route = rec[p + "route"];
    const lmaRoute = route === LMA_ROUTES[1] ? (rec[p + "air_auto"] === "yes" ? "auto" : "air") : KZ_ROUTE[route] || null;
    const zero = route === LMA_ROUTES[0] ? rec[p + "r1_zero"] : route === LMA_ROUTES[1] ? rec[p + "r2_zero"] : route === LMA_ROUTES[2] ? rec[p + "r3_zero"] : null;
    const onRope = route === LMA_ROUTES[1] || route === LMA_ROUTES[2], clean = rec[p + "lfm"] === LF_CLEAN;
    return {
      // basic unit (1.7.0 item 5): the chosen unit's serial digits, "" when none is chosen (owner's ruling 27-Nov-2026)
      head_model: String(rec[p + "head"] || ""), head_serial: String(rec[p + "head_sn"] || "").trim(), basic_unit_serial: buSerial(rec[p + "bu_sn"]),
      liner: KZ_TXT(rec[p + "liner"]), liner_proposed: hc.liner && hc.liner.value ? hc.liner.value : null, scan_step_mm: KZ_NUM(rec[p + "scanstep"]),
      air_temperature_c: num(rec[p + "temp"]),
      sound_section_from_m: onRope ? num(rec[p + "r2_from"]) : null, sound_section_to_m: onRope ? num(rec[p + "r2_to"]) : null,
      air_value_proposed_pct: hc.airAuto ?? null,
      air_value_entered_pct: lmaRoute === "air" ? KZ_NUM(rec[p + "air"]) : null,
      lma_calibration_route: lmaRoute,
      lma_check_pct: num(zero), lma_most_negative_pct: num(rec[p + "lmaneg"]),
      lf_calibrated_on: KZ_LF[rec[p + "lfm"]] || null,
      lf_wire_diameter_mm: rec[p + "lfm"] === LF_METHODS[3] ? KZ_NUM(rec[p + "lfwd"]) : null,
      lf_gap_mm: rec[p + "lfm"] === LF_METHODS[3] ? KZ_NUM(rec[p + "lfgap"]) : null,
      one_wire_lf_mv: clean ? null : KZ_NUM(rec[p + "sig"]), lf_threshold_mv: KZ_NUM(rec[p + "thr"]), lf_alarm_mv: KZ_NUM(rec[p + "alarm"]),
      // 1.7.0 (new keys, schema v1 unchanged in version: extra keys are ignored by Kuzo's validate()): the LF route as
      // Kuzo's own id (calroute.js), and route 4's section, reading and estimated count - read by the next Kuzo version.
      lf_calibration_route: KZ_LF_ROUTE[rec[p + "lfm"]] || null,
      ...(clean ? { lf_clean_section_from_m: num(rec[p + "cs_from"]), lf_clean_section_to_m: num(rec[p + "cs_to"]), lf_clean_section_reading_mv: KZ_NUM(rec[p + "cs_mv"]),
        one_wire_lf_estimated_mv: KZ_NUM(rec[p + "sig_est"]), lf_count_estimated: true } : {}),
    };
  });
  // Owner's rule 28 (26-Nov-2026), with Kuzo 0.2.10: the breaking-force ambers (bf-fits, bf-below) ARE exported in checks[] -
  // Kuzo shows them as advisory lines and never uses them for a result. Schema stays v1.
  const out = ch.map((x) => { const rs = reasonOf(rec, x.id); return { id: x.id, level: x.level, text: `${x.text} Correct: ${x.want} [${x.src}]`, reason: rs ? `${rs.text} (${rs.time})` : null }; });
  if (rec.asrc === A_WRITTEN) out.push({ id: "a-src-written", level: "amber", text: `A source "${A_WRITTEN}" is not one of schema v1's values: exported as "not known" with A ${c.A ?? "–"} mm² – choose the source in Kuzo.`, reason: null });
  const da = KZ_NUM(rec.da), db = KZ_NUM(rec.db), pair = [da, db].filter((x) => x != null);
  return {
    format: "rope-record", schema_version: SCHEMA_VERSION, record_id: String(rec.id || ""), saved_at: localIso(rec.savedAt || new Date()),
    app: { name: "Rope Record", version: String(appVersion || rec.appVersion || "") },
    job: { type: isRef ? "reference" : "site", reference_rope: isRef ? KZ_TXT(rec.ref) : null, job_order: isRef ? KZ_TXT(rec.jobno) : KZ_TXT(rec.jobno),
      client: KZ_TXT(rec.client), position: KZ_TXT(rec.position), location: KZ_TXT(rec.location), date: String(rec.date || ""), engineer: String(rec.engineer || "").trim(),
      rope_length_m: KZ_NUM(rec.length) },
    rope: {
      nominal_diameter_mm: num(rec.dnom), measured_diameter_mm: pair,
      measured_diameter_mean_mm: pair.length === 2 ? Math.round((da + db) / 2 * 1000) / 1000 : pair.length === 1 ? pair[0] : null,
      construction: String(rec.construction || "").trim(),
      annex_h_construction: rec.annexh && rec.annexh !== ANNEX_OTHER ? rec.annexh : null,
      rope_type: rec.annexh === ANNEX_OTHER && ROPE_TYPES.includes(rec.ropetype) ? rec.ropetype : null,
      seale_19_or_fewer: rec.annexh === ANNEX_OTHER && (rec.seale === "yes" || rec.seale === "no") ? rec.seale : null,
      core: rec.core, outer_strands: KZ_INT(rec.outer), wires_per_strand: KZ_INT(rec.wires),
      lay: LAYS.includes(rec.lay) ? rec.lay : null, runs_on: rec.runs === RUNS[0] ? "steel sheaves" : rec.runs === RUNS[1] ? "multi-layer drum" : null,
      iso2408_class: rec.asrc === A_ISO && c.iso.ok ? rec.isoclass : null,
      metallic_area_mm2: c.A != null ? c.A : null,
      metallic_area_source: c.A != null ? (KZ_A_SRC[rec.asrc] || "not known") : "not known",
      dmax_mm: c.dmax ?? null, dmax_source: KZ_DMAX_SRC[rec.dmaxsrc] || "not available",
      // rule 28: the construction note - an optional key (schema v1 unchanged in version; older files have no such key)
      ...(String(rec.class_note ?? "").trim() ? { class_note: String(rec.class_note).trim() } : {}),
      // 1.7.0 new keys (only when entered, so older files keep their shape): rope maker; every breaking-force figure with
      // its source label and the one the engineer confirms (item 11); the estimated δmax, never used for the limit (item 12).
      ...(KZ_TXT(rec.maker) ? { maker: KZ_TXT(rec.maker) } : {}),
      ...(c.bfFig.figs.length ? { breaking_force_figures: c.bfFig.figs.map((f) => ({ source: f.source, kN: f.kN, ...(f.ref ? { reference: f.ref } : {}), ...(f.working ? { working: f.working } : {}) })),
        breaking_force_kn: c.bfFig.used ? c.bfFig.used.kN : null, breaking_force_source: c.bfFig.used ? c.bfFig.used.source : null,
        rope_grade_n_mm2: KZ_NUM(rec.grade) } : {}),
      ...(c.dEst && c.dEst.value != null ? { dmax_estimated_mm: c.dEst.value, dmax_estimated_source: `${DMAX_EST_LABEL}: ${c.dEst.src} – estimated, never used for the LF limit` } : {}),
    },
    heads,
    reference_sections: isRef ? { datum: KZ_TXT(rec.datum), sections: SECTIONS.map((s) => ({ name: s, from_m: num(rec[s + "_from"]), to_m: num(rec[s + "_to"]), wires_cut: KZ_INT(rec[s + "_w"]), gap_mm: KZ_NUM(rec[s + "_gap"]) })).filter((x) => x.from_m != null || x.to_m != null || x.wires_cut != null || x.gap_mm != null) } : null,
    checks: out,
    sign_off: { counted_by: KZ_TXT(rec.counted), checked_by: KZ_TXT(rec.checked), notes: KZ_TXT(rec.notes) },
  };
}
export const kuzoFileName = (rec, when) => fileName(rec, when).replace(/\.csv$/, ".kuzo.json");
export const kuzoText = (rec, appVersion) => JSON.stringify(kuzoRecord(rec, appVersion));   // compact JSON (x-qr payload)

// QR route, schema "x-qr": zlib (RFC 1950) -> base45 (RFC 9285) -> CRC-32 of the compressed bytes -> parts of at most
// 1000 characters, each "RR1 PART <n>/<N> <CRC> <piece>". Same algorithms as Kuzo's reader (siterecord.js).
const B45 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";
export function base45(bytes) {
  let s = "";
  for (let i = 0; i < bytes.length; i += 2) {
    if (i + 1 < bytes.length) { let x = bytes[i] * 256 + bytes[i + 1]; const e = Math.floor(x / 2025); x %= 2025; s += B45[x % 45] + B45[Math.floor(x / 45)] + B45[e]; }
    else { const x = bytes[i]; s += B45[x % 45] + B45[Math.floor(x / 45)]; }
  }
  return s;
}
let CRC_T = null;
export function crc32(bytes) {
  if (!CRC_T) { CRC_T = new Uint32Array(256); for (let i = 0; i < 256; i++) { let c = i; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; CRC_T[i] = c >>> 0; } }
  let c = 0xFFFFFFFF; for (const b of bytes) c = CRC_T[(c ^ b) & 255] ^ (c >>> 8);
  return ((c ^ 0xFFFFFFFF) >>> 0).toString(16).toUpperCase().padStart(8, "0");
}
export async function zlib(text) {
  const cs = new CompressionStream("deflate");                 // "deflate" = zlib format (RFC 1950)
  const buf = await new Response(new Blob([new TextEncoder().encode(text)]).stream().pipeThrough(cs)).arrayBuffer();
  return new Uint8Array(buf);
}
export async function qrParts(text, size = 1000) {
  const z = await zlib(text), t = base45(z), crc = crc32(z), N = Math.max(1, Math.ceil(t.length / size));
  return Array.from({ length: N }, (_, i) => `RR1 PART ${i + 1}/${N} ${crc} ${t.slice(i * size, (i + 1) * size)}`);
}

// =============================================================================================
// CALCULATOR (1.4.0) - rope details in, LMA and LF set-up values out, each with its working and source.
// No job, no record, nothing saved. Reuses compute() above; changes nothing in it.
// =============================================================================================
export const MH_PC = "MH-PC";                     // name only (owner, 25-Nov-2026)
export const CALC_HEADS = [...HEAD_CHOICES, MH_PC];
export const CALC_A_SOURCES = ["rope certificate", "rope maker's own data", "calculated"];
export const CALC_W_SOURCES = ["rope certificate", "rope maker's own data", "measured on a wire"];
// Owner's order (25-Nov-2026 evening): 1 broken wire, 2 Acumen record, 3 indication. The simulated wire is a separate
// option ("sim"), ready for when the engineers carry the wires.
export const LF_ROUTES = [
  "A real broken wire on the rope",
  "Acumen's recorded one-wire value for this head on a similar rope",
  "An indication found by running the head over the rope",
  "Clean section – last resort (PRO-AIC-0608 C5, refiled 27-Nov-2026)",
];
export const LF_SIM = "Simulated wire (two added wires, as the Intron manual describes) – ready for when the wires arrive";
// Head manuals, cited by head and version.
const M13 = "Intron MH 6-26 / 22-45 / 40-70 operating manual v1.3";
const M64 = "Intron MH 40-64 operating manual v1.1";
const V13_HEADS = ["MH 6-26", "MH 22-45", "MH 40-70"];
const manualRef = (m, c13, p13, c64, p64) => (m === "MH 40-64" ? `${M64}, ${c64} (p. ${p64})` : V13_HEADS.includes(m) ? `${M13}, ${c13} (p. ${p13})` : null);
const ISO_SRC = "ISO 2408:2017 Annex C, Table C.1 / C.2 (p. 18); A = C × d²: EN 12385-2:2002+A1:2008, 3.10.3";

// Acumen's recorded one-wire LF values. One table, approved by the owner. Match: same head and same nominal diameter.
export const ACUMEN_ONE_WIRE = [
  { head: "MH 40-64", d: 48, mv: 10, note: "48 mm reference rope, rerun 25-Nov-2026" },
];
export const acumenOneWire = (head, d) => ACUMEN_ONE_WIRE.find((x) => x.head === head && x.d === d) || null;

// LF threshold rule shown by the calculator. MH 40-64 from the held manual (owner, 25-Nov-2026); the others as the app holds them (LF_RULESET).
export function calcLfRule(model) {
  if (!model) return null;
  if (model === MH_PC) return { words: `${OWN_MANUAL}.`, src: "MH-PC manual", own: true };
  if (model === "MH 40-64") return {
    words: "LF threshold = the one-wire LF value minus 2 to 3. The manual does not state the unit for \"2-3\".",
    src: `${M64}, 2.5.1.7 item 5 (p. 19)`,
    example: "Acumen example: 48 mm reference rope, one-wire 10 mV, threshold 8 mV (25-Nov-2026).",
  };
  const r = lfRule(headOf(model));
  return r ? { words: r.words, src: `${r.src} (${LF_RULESETS[LF_RULESET].name})` } : null;
}

export function calcRoute(n, model, d, A) {
  const h = headOf(model);
  if (n === 1) return { n, label: "route 1", title: LF_ROUTES[0], text: "Set the LF channel on the broken wire. Record the one-wire LF signal.", src: "PRO-AIC-0608 C5" };
  if (n === "sim") {
    const len = model === "MH 80-120" ? 0.6 : 0.3;
    const src = manualRef(model, "2.4.2.9", 28, "2.5.2.9", 21) || (model === MH_PC ? OWN_MANUAL : "PRO-AIC-0608 C5");
    return { n, label: "simulated wire (separate option)", title: LF_SIM, src, len,
      text: `Two steel wires of known diameter, each at least ${len} m long, fixed along the rope axis one after the other, with a gap of 1 to 3 wire diameters, on a sound section. Set the LF channel on them as on a broken wire.`,
      note: "The engineers do not carry these wires yet." };
  }
  if (n === 2) {
    const rec = acumenOneWire(model, d);
    const src = manualRef(model, "2.4.2.10", 28, "2.5.2.10", 21) || "Acumen records";
    if (!rec) return { n, label: "route 2", title: LF_ROUTES[1], src, none: true, text: "No Acumen record for this head on a rope of this nominal diameter – choose another route." };
    return { n, label: "route 2", title: LF_ROUTES[1], src, mv: rec.mv, text: `One-wire LF value ${rec.mv} mV – from Acumen records (${rec.head}, ${rec.note}). Enter it as the known one-wire value.` };
  }
  if (n === 3) return { n, label: "route 3", title: LF_ROUTES[2], warn: true, src: "Acumen practice – not a PRO-AIC-0608 C5 method",
    text: "This value is NOT tied to a known broken wire. A single broken wire may not be detected." };
  if (n === 4) return { n, label: "route 4", title: LF_ROUTES[3], src: CLEAN_SRC, text: CLEAN_TEXT, rule: cleanRule(h) };
  return null;
}

// =============================================================================================
// 1.7.0 "only what is mandated, each fact asked once" (owner's block, 27-Nov-2026)
// =============================================================================================
// Filled in from an earlier answer (rule 1): field -> { value, src }. Still editable; a change is recorded (app.js).
export function autoValues(rec) {
  const out = {}, put = (f, v, src) => { if (v != null && String(v) !== "") out[f] = { value: String(v), src }; };
  const fromEntry = (e) => {
    const S = `construction list: ${e.name} (ISO 2408 class ${e.cls}, Table D)`;
    put("construction", e.key, S); put("core", e.core, S); put("isoclass", e.isoclass, S);
    put("annexh", e.annexh || ANNEX_OTHER, e.annexh ? "ISO 4309 Annex H (pp. 51–56)" : S);
    put("outer", e.outer, S); put("wires", e.wires, S);
    if (!e.annexh) { put("ropetype", ROPE_TYPES[e.ropetype], S); if (e.ropetype === 0) put("seale", e.seale ? "yes" : "no", S); }
  };
  const e = constructionByKey(rec.ckey);
  if (e) fromEntry(e);
  else {
    const pc = parseConstruction(rec.construction);
    if (pc && pc.entry) { const x = pc.entry, S = `construction "${String(rec.construction).trim()}" read as ${x.name}`; put("core", x.core, S); put("isoclass", x.isoclass, S); put("annexh", x.annexh || ANNEX_OTHER, S); put("outer", x.outer, S); put("wires", x.wires, S);
      if (!x.annexh) { put("ropetype", ROPE_TYPES[x.ropetype], S); if (x.ropetype === 0) put("seale", x.seale ? "yes" : "no", S); } }
    else if (pc) {
      const S = `construction "${String(rec.construction).trim()}"`; put("core", pc.core, S); put("isoclass", pc.isoclass, S); put("outer", pc.outer, S);
      const types = [...new Set(CONSTR_BASE.filter((x) => x[1] === pc.cls).map((x) => x[5]))];   // the class's rope type (ISO 2408 Table C.1 / C.2 grouping)
      if (types.length === 1) put("ropetype", ROPE_TYPES[types[0] === 3 ? 0 : 1], `ISO 2408 class ${pc.cls}`);
    }
  }
  const c = compute(rec);
  for (const hc of c.heads) {
    if (!hc.h) continue;
    const p = `h${hc.i}_`;
    if (hc.serials.length === 1) put(p + "head_sn", hc.serials[0], REGISTER_SRC);
    if (hc.liner && hc.liner.value) put(p + "liner", hc.liner.value, hc.liner.src);
    if (c.dmax) { put(p + "lfwd", c.dmax, "δmax (same wire size) – change it if the wires differ"); put(p + "r3_dw", c.dmax, "δmax (same wire size) – change it if the wires differ"); }
  }
  return out;
}

// Maker's figures held offline (item 13): makers.json, loaded by the page; a suggestion only.
let MAKERS = { entries: [] };
export const setMakers = (m) => { MAKERS = m && Array.isArray(m.entries) ? m : { entries: [] }; };
export const makersData = () => MAKERS;
export const makerNames = () => [...new Set(MAKERS.entries.map((e) => e.maker))];
const family = (t) => { const m = norm(t).match(/^(\d+x\d+)/); return m ? m[1] : ""; };
export function makerMatches({ maker, d, construction, isoclass, core }) {
  const M = String(maker || "").trim().toLowerCase(), D = pos(num(d)), fam = family(construction);
  if (!M || !D) return [];
  return MAKERS.entries.filter((e) => e.maker.toLowerCase() === M && e.d === D && (!core || !e.core || e.core === core)
    && (e.class ? e.class === isoclass : !!fam && family(e.construction) === fam));
}
// "Search the maker's site": a plain link that opens the phone's browser; the app reads nothing from it.
export const makerSearchUrl = ({ maker, construction, d }) => "https://www.google.com/search?q=" + encodeURIComponent([maker, construction, d ? `${d} mm` : "", "wire rope minimum breaking force"].filter((x) => String(x || "").trim()).join(" "));

// Calculator answers -> a new record (item 3: one flow; the calculator's answers start the record).
const CALC_A_MAP = { calculated: A_ISO, [CALC_A_SOURCES[0]]: A_CERT, [CALC_A_SOURCES[1]]: A_MAKER };
const CALC_W_MAP = { "rope certificate": DMAX_SOURCES[1], "rope maker's own data": DMAX_SOURCES[1], "measured on a wire": DMAX_SOURCES[0] };
export function recordFromCalc(inp, type = "site") {
  const r = { type, reasons: {}, ovr: {}, reach: 0, auto: {}, changes: {} };
  const set = (k, v) => { if (v != null && String(v).trim() !== "") r[k] = String(v).trim(); };
  set("dnom", inp.d); set("ckey", inp.ckey); set("construction", inp.construction); set("isoclass", inp.cls); set("core", inp.core); set("maker", inp.maker);
  set("asrc", CALC_A_MAP[inp.asrc]); if (A_TYPED.includes(r.asrc)) set("a", inp.a);
  if (inp.wsrc) { set("dmaxsrc", CALC_W_MAP[inp.wsrc]); set("dmax", inp.w); }
  if (inp.dmaxEst === "yes") r.dmax_est = "yes";
  set("bf", inp.bf); set("bf_maker", inp.bfMaker); set("bf_maker_ref", inp.bfMakerRef); set("grade", inp.grade); set("bf_used", inp.bfUsed);
  if (headOf(inp.head)) r.h1_head = inp.head;
  if (num(inp.airIn) != null) { r.h1_route = LMA_ROUTES[1]; set("h1_air", inp.airIn); set("h1_r2_zero", inp.zero); }
  const rt = inp.route === "sim" ? "sim" : Number(inp.route) || 0;
  if (rt === 1) r.h1_lfm = LF_METHODS[2];
  if (rt === "sim") { r.h1_lfm = LF_METHODS[3]; set("h1_lfwd", inp.addW); }
  if (rt === 4) { r.h1_lfm = LF_CLEAN; set("h1_cs_from", inp.csFrom); set("h1_cs_to", inp.csTo); set("h1_cs_mv", inp.csMv); set("h1_sig_est", inp.sigEst); }
  return r;
}

// inp: { d, ckey, construction, cls, core, maker, head, asrc, a, wsrc, w, dmaxEst, bf, bfMaker, bfMakerRef, grade, bfUsed,
//        route, airIn, zero, addW, csFrom, csTo, csMv, sigEst }
export function calculator(inp) {
  const d = pos(num(inp.d)), head = inp.head || "", h = headOf(head);
  const warn = [];
  const W = (level, text, src) => warn.push({ level, text, src });
  const asrc = inp.asrc || "";
  const rec = { dnom: inp.d, ckey: inp.ckey, construction: inp.construction, isoclass: inp.cls, core: inp.core, h1_head: h ? head : "", dmaxsrc: "",
    asrc: asrc === "calculated" ? A_ISO : asrc === CALC_A_SOURCES[0] ? A_CERT : asrc === CALC_A_SOURCES[1] ? A_MAKER : "",
    a: inp.a, dmax: inp.wsrc ? inp.w : "", dmax_est: inp.dmaxEst, bf: inp.bf, bf_maker: inp.bfMaker, bf_maker_ref: inp.bfMakerRef, grade: inp.grade, bf_used: inp.bfUsed };
  const c = compute(rec);
  const out = { d, head, warn };

  // Construction (item 7): from the list, or the certificate's words read as a class
  out.entry = c.entry;
  out.parsed = c.entry ? null : parseConstruction(inp.construction);

  // 1. Two area boxes, each labelled by its source (item 8)
  if (!asrc) out.A = { value: null, label: aLabel(""), text: "Choose where A comes from: certificate, rope maker's own data, or calculated." };
  else if (asrc === "calculated") {
    out.A = c.iso.ok
      ? { value: c.A, label: aLabel(A_ISO), text: `A = C × d² = ${c.iso.C.toFixed(3)} × ${d}² = ${r1(c.A)} mm² (Table ${c.iso.row.table}, ${c.iso.row.cls}, ${c.iso.col})`, src: ISO_SRC }
      : { value: null, label: aLabel(A_ISO), text: `A cannot be calculated: ${c.iso.why}. Take A from the certificate or the rope maker.`, src: ISO_SRC };
    if (c.iso.ok && inp.core === CORES[2] && c.iso.row.cls === "6 × 7") W("amber", "6 × 7 with wire strand core: EN 12385-4:2002 Table B.1 gives C3 = 0.432, ISO 2408 gives 0.441. Take A from the certificate or the rope maker where possible.", "EN 12385-4:2002 Table B.1 (p. 23); ISO 2408:2017 Table C.1 (p. 18)");
    if (c.iso.ok && inp.core === CORES[2] && c.iso.row.cls === "8 × 7") W("red", "8 × 7 with wire strand core: the standards disagree – EN 12385-4:2002 Table 6 gives C3 = 0.379, ISO 2408 gives 0.520. The calculated area is NOT reliable. Use the certificate or the rope maker.", "EN 12385-4:2002 Table 6 (p. 10); ISO 2408:2017 Table C.1 (p. 18)");
  } else {
    out.A = c.A != null ? { value: c.A, label: aLabel(asrc), text: `A = ${r1(c.A)} mm², as given`, src: asrc } : { value: null, label: aLabel(asrc), text: `Type A from the ${asrc}.` };
    if (c.A != null && d && c.A >= PI * d * d / 4) W("red", `A ${r1(c.A)} mm² is not less than the circle area π × d² ÷ 4 = ${r1(PI * d * d / 4)} mm² – the circle area is never A.`, "PRO-AIC-0608 A3, §9.2.1");
  }
  const A = out.A.value;
  const K3 = "PRO-AIC-0608 A3 (p. 8): rope density factor K, S = K × π × d² ÷ 4 – air value only";
  out.S = c.S ? { value: c.S, label: S_LABEL, text: `S = K × π × d² ÷ 4 = ${c.k} × π × ${d}² ÷ 4 = ${r1(c.S, 0)} mm² (K for ${inp.core}). ${A == null ? "Used for the air value, because A is not known." : "Not used: A is known."} Never reported; no limit is calculated from it.`, src: K3 }
    : { value: null, label: S_LABEL, text: "Needs the nominal diameter and the core.", src: K3 };

  // head range (nominal diameter)
  if (h && d && (d < h.d[0] || d > h.d[1])) W("red", `${d} mm is outside the ${head} range ${h.d[0]}–${h.d[1]} mm.`, `${h.rangeSrc}; C2`);
  if (head === MH_PC) W("amber", `MH-PC: rope range, air value and LF rule from the MH-PC manual – ${OWN_MANUAL}.`, "MH-PC manual");

  // 2. Air value and zero
  const tbl = h && AIR[head];
  const airSrcC = manualRef(head, "Table 4", 27, "Table 4", 21);
  if (!head) out.air = { value: null, text: "Choose the head." };
  else if (!tbl) out.air = { value: null, own: true, text: `${head}: ${OWN_MANUAL}.`, src: `air value from the ${head} manual` };
  else if (A == null) {
    if (!c.S) out.air = { value: null, text: "A not known. An estimate from K needs the nominal diameter and the core.", src: K3 };
    else {
      const t = airFromT4(head, c.S);
      const base = `A not known. S = ${r1(c.S, 0)} mm² (box S)`;
      if (t.value == null) out.air = { value: null, own: true, estimate: true, S: c.S, text: `${base}; outside the ${head} table (${t.lo}–${t.hi} mm²): ${OWN_MANUAL}.`, src: `${K3}; ${airSrcC}` };
      else {
        const rows = AIR[head].rows, i = rows.findIndex((x) => x[0] === t.from && x[1] === t.to), nx = rows[i + 1] || null;
        out.air = { value: t.value, estimate: true, S: c.S, next: nx ? { value: nx[2], from: nx[0], to: nx[1] } : null,
          text: `${base} is in ${t.from}–${t.to} mm² → ${t.value} %. ${nx ? `Next band: ${nx[0]}–${nx[1]} mm² → ${nx[2]} %.` : "No next band in the table."} Confirm the zero on the rope before relying on this value.`,
          src: `${K3}; ${airSrcC}; ${T4_SRC}` };
      }
      W("amber", `Air value: estimate - air value only, not reported (A not known; S from the density factor K). Confirm the zero on the rope before relying on this value.`, K3);
    }
  } else {
    const t = airFromT4(head, A);
    out.air = t.value != null
      ? { value: t.value, text: `A ${r1(A)} mm² is in ${t.from}–${t.to} mm² → ${t.value} %`, src: `${airSrcC}; ${T4_SRC}` }
      : { value: null, own: true, text: `A ${r1(A)} mm² is outside the ${head} table (${t.lo}–${t.hi} mm²): ${OWN_MANUAL}.`, src: `${airSrcC}; ${T4_SRC}` };
  }
  const airIn = num(inp.airIn), zero = num(inp.zero);
  if (airIn != null && out.air.value != null && airIn !== out.air.value && !(out.air.next && airIn === out.air.next.value)) W("amber", `Air value entered ${airIn} % – the table gives ${out.air.value} %. Correct it, or go on with this warning.`, out.air.src);
  if (zero != null && Math.abs(zero) > 0.5) W("amber", `Zero reading ${zero} % is outside 0 ± 0.5 %. Repeat the calibration; still outside → head withdrawn.`, "PRO-AIC-0608 C4");

  // 3. One outer wire as % of A - documented δ only (the estimate never feeds it)
  const w = inp.wsrc ? pos(num(inp.w)) : null;
  if (!w) out.wire = { value: null, text: pos(num(inp.w)) && !inp.wsrc ? "Choose where the outer wire diameter comes from." : "No documented outer wire diameter: one outer wire as a percentage of A cannot be given." };
  else if (A == null) out.wire = { value: null, text: "One outer wire as a percentage of A needs A." };
  else out.wire = { value: c.share, area: c.wireArea, text: `π × ${w}² ÷ 4 = ${r1(c.wireArea, 2)} mm²; ÷ ${r1(A)} × 100 = ${r1(c.share, 2)} % of A`, src: `outer wire δ: ${inp.wsrc}; PRO-AIC-0608 A3` };
  // δmax estimated (nominal), based on construction - optional (item 12)
  out.dEst = inp.dmaxEst === "yes" ? dmaxEstimate(c.entry || (out.parsed && out.parsed.entry) || null, inp.d) : null;

  // 4. LF threshold rule; 5. LF route
  out.lfRule = calcLfRule(head);
  const rn = inp.route === "sim" ? "sim" : Number(inp.route) || 0;
  out.route = rn ? calcRoute(rn, head, d, A) : null;
  if (out.route && rn === "sim") { const dw = pos(num(inp.addW)); if (dw) { out.route.gap = [dw, 3 * dw]; if (A != null) out.route.share = PI * dw * dw / 4 / A * 100; } }
  if (out.route && rn === 4) {
    const mv = pos(num(inp.csMv));
    if (mv && h) out.route.thr = h.lfRule === "BU-M" ? `LF threshold ${r1(mv, 1)} mV (= the reading)` : `LF threshold ${r1(Math.max(0, mv - 2), 1)} to ${r1(Math.max(0, mv - 1), 1)} mV (1 to 2 mV below the reading)`;
  }
  if (rn === 3) W("red", "LF set from an indication found by running the head: not tied to a known broken wire – a single broken wire may not be detected.", out.route.src);

  // 6. 6d and 30d, each in its own box (item 9)
  out.len6 = d ? { l: c.l6, lf: c.lf.ok ? c.lf.l6 : null, text: `6 × ${d} mm = ${r1(c.l6, 3)} m`, src: "ISO 4309 Table C.1; site sheet" } : null;
  out.len30 = d ? { l: c.l30, lf: c.lf.ok ? c.lf.l30 : null, text: `30 × ${d} mm = ${r1(c.l30, 2)} m`, src: "ISO 4309 Table C.1; site sheet" } : null;
  out.lf = c.lf.ok ? { l6: c.lf.l6, l30: c.lf.l30, text: `${c.lf.route}. ${c.lf.working}`, src: c.lf.src }
    : { l6: null, text: "Broken-wire limits need A and a documented outer wire diameter here; otherwise the record gives the ISO 4309 Table 3 / 4 limit by RCN (construction and lay)." };

  // 7. Breaking force - every figure with its source; the engineer confirms the one used (item 11). Advice only.
  out.bf = c.bf; out.bfFig = c.bfFig;
  if (c.bf && c.bf.amber) W("amber", `${c.bf.amber.text} Advice only – nothing is changed.`, BF_SRC);
  out.makers = makerMatches({ maker: inp.maker, d: inp.d, construction: inp.construction || (c.entry && c.entry.key), isoclass: inp.cls, core: inp.core });
  return out;
}
