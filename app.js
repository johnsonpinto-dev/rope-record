// Rope Record - screens, live checks and pop-ups. Rules, figures and checks are in calc.js.
import * as K from "./calc.js";

const V = self.RR_VERSION || { version: "?", date: "" };
const STORE = "rope-record-records", DRAFT = "rope-record-draft";
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const p2 = (n) => String(n).padStart(2, "0");
const today = () => { const d = new Date(); return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`; };
const stamp = () => { const d = new Date(); return `${today()} ${p2(d.getHours())}:${p2(d.getMinutes())}`; };
const blank = "leave blank if not available – never 0";
const F = (id, label, kind = "text", extra = {}) => ({ id, label, kind, ...extra });
const isRef = (r) => r.type === "reference";
const YN = { opts: K.YESNO, labels: ["Yes", "No"] };

// ---------------- screens ----------------
function headScreens(i) {
  const p = `h${i}_`, H = () => K.headOf(rec[p + "head"]);
  const hc = () => K.compute(rec).heads.find((x) => x.i === i) || {};
  const route = () => rec[p + "route"];
  const airBox = () => {
    const c = hc(); if (!c.h) return "";
    const v = c.air != null ? `${c.air} %` : K.OWN_MANUAL;
    const ov = (rec.ovr || {})[`air${i}`];
    return `<div class="big ${c.air == null ? "amber" : ""}"><small>Air value to TYPE INTO THE ${esc(c.h.unit === "BU-M" ? "BU-M" : "basic unit")}</small><b>${esc(v)}</b>
      <small>${esc(c.airWorking)}${ov && ov.value ? ` · OVERRIDDEN (${esc(ov.reason)}, ${esc(ov.time)})` : ""}</small><i class="src">${esc(K.airSrc(c.h.model))}</i>
      ${c.hasTable ? `<button type="button" class="ovr" data-ovr="air${i}">Change (reason needed)</button>` : ""}</div>`;
  };
  const S = (id, step, title, accept, fields, extra = {}) => ({ id: `h${i}-${id}`, group: `Head ${i}`, step, title: `Head ${i} · ${title}`, accept, fields, ...extra });
  return [
    S("c1", "C1", "Equipment status", () => `On the equipment register; head and basic unit verified within the last 12 months. <b>Register AIC-0608-E not loaded – check by hand.</b>|PRO-AIC-0608 C1, §5.4`,
      [F(p + "head", "Magnetic head model", "select", { opts: K.HEAD_CHOICES, req: true }),
        F(p + "head_sn", "Head serial No.", "text", { req: true, hint: "from the head's plate" }),
        F(p + "bu_sn", "Basic unit serial No.", "text", { req: true, hint: "from the unit's plate" })]),
    S("c2", "C2", "Head and liners", () => { const h = H(), c = K.compute(rec); return h ? `Measured diameter incl. coating ${c.D ? K.r1(c.D, 2) + " mm" : "–"} inside ${h.model} range <b>${h.d[0]}–${h.d[1]} mm</b> and the liner range; ambient temperature <b>${h.temp[0]} to +${h.temp[1]} °C</b>.|PRO-AIC-0608 §5.2 head limits, C2` : "Pick the head first.|PRO-AIC-0608 C2"; },
      [F(p + "liner", "Liner set fitted", "text", { req: true, hint: "register not loaded – check the liner range by hand" }),
        F(p + "temp", "Ambient temperature at the head", "snum", { unit: "°C", req: true })]),
    S("c3", "C3", "Settling and function check", () => { const h = H(); return `${h && h.settle ? `Let the instrument settle <b>${h.settle} h</b> to site conditions. ` : "No settling time stated for this head. "}Self-test passes; distance counter counts both ways.|PRO-AIC-0608 §5.2, C3`; },
      [F(p + "settled", "Settled for the time the manual states?", "radio", { ...YN, req: true, show: () => !!(H() && H().settle) }),
        F(p + "selftest", "Self-test passed?", "radio", { ...YN, req: true }),
        F(p + "counter", "Distance counter counts both ways?", "radio", { ...YN, req: true })], { top: airBox }),
    S("c4", "C4", "LMA calibration", () => `Route 1: zero segment <b>0 ± 0.5 %</b>, segment 2 within <b>± 0.5 %</b> of its known value. Routes 2 and 3: zero section <b>0 ± 0.5 %</b>; sound section at least <b>${H() ? H().sound : 0.5} m</b>; route 3 at least <b>5 %</b> LMA.|PRO-AIC-0608 C4, §5.2`,
      [F(p + "route", "Calibration route", "radio", { opts: K.LMA_ROUTES, req: true }),
        F(p + "r1_id", "Reference rope ID", "text", { req: true, show: () => route() === K.LMA_ROUTES[0] }),
        F(p + "r1_zero", "Zero segment reads", "snum", { unit: "%", req: true, show: () => route() === K.LMA_ROUTES[0] }),
        F(p + "r1_known", "Segment 2 known LMA", "num", { unit: "%", req: true, show: () => route() === K.LMA_ROUTES[0] }),
        F(p + "r1_seg2", "Segment 2 reads", "num", { unit: "%", req: true, show: () => route() === K.LMA_ROUTES[0] }),
        F(p + "r2_from", "Zero (sound) section from", "num", { unit: "m", req: true, show: () => route() && route() !== K.LMA_ROUTES[0] }),
        F(p + "r2_to", "Zero (sound) section to", "num", { unit: "m", req: true, show: () => route() && route() !== K.LMA_ROUTES[0] }),
        F(p + "r2_passes", "Head passed at least twice each way?", "radio", { ...YN, req: true, show: () => route() && route() !== K.LMA_ROUTES[0] }),
        F(p + "r3_n", "Number of added wires", "int", { req: true, show: () => route() === K.LMA_ROUTES[2] }),
        F(p + "r3_dw", "Added wire diameter (caliper)", "num", { unit: "mm", req: true, show: () => route() === K.LMA_ROUTES[2] }),
        F(p + "r3_set", "LMA value set", "snum", { unit: "%", req: true, show: () => route() === K.LMA_ROUTES[2] }),
        F(p + "r3_zero", "Zero check reads", "snum", { unit: "%", req: true, show: () => route() === K.LMA_ROUTES[2] }),
        F(p + "cal_time", "Calibration time", "time", { req: true })],
      { top: () => { const c = hc(); let t = route() === K.LMA_ROUTES[1] ? airBox() : ""; if (route() === K.LMA_ROUTES[2] && c.r3set != null) t += `<div class="calc"><b>LMA to set: ${K.r1(c.r3set, 2)} %</b><small>−(ΔS ÷ S) × 100, ΔS = ${K.r1(c.dS, 2)} mm², S = ${K.r1(K.compute(rec).Aair, 1)} mm²</small><i class="src">PRO-AIC-0608 C4 route 3</i></div>`; return t; } }),
    S("c4air", "C4", "Air value", () => `Switch off, remove and close the head, place it clear of steel, enter the maker's air value for A, re-mount and read the zero section: <b>0 ± 0.5 %</b>.|PRO-AIC-0608 C4 route 2 (manual v1.3 2.4.2.6–2.4.2.8)`,
      [F(p + "air_auto", "Maker's automatic calibration used instead of an air value?", "radio", { ...YN, req: () => !(H() && K.AIR[H().model]) }),
        F(p + "air", "Air value you actually entered", "num", { unit: "%", req: () => rec[p + "air_auto"] !== "yes", show: () => rec[p + "air_auto"] !== "yes" }),
        F(p + "r2_zero", "Zero check on the zero section", "snum", { unit: "%", req: true })], { top: airBox, show: () => route() === K.LMA_ROUTES[1] }),
    S("c5", "C5", "LF calibration", () => `On the reference rope's fault, a known break, or two added wires each at least <b>${H() ? H().wireLen : 0.3} m</b> long with their ends <b>1 to 3 wire diameters</b> apart. Repeat test: load the base-trace configuration file first.|PRO-AIC-0608 C5, §5.2`,
      [F(p + "lfm", "LF calibrated on", "radio", { opts: K.LF_METHODS, req: true }),
        F(p + "lf_at", "Known break at", "num", { unit: "m", req: true, show: () => rec[p + "lfm"] === K.LF_METHODS[2] }),
        F(p + "lfwd", "Added wire diameter", "num", { unit: "mm", req: true, show: () => rec[p + "lfm"] === K.LF_METHODS[3] }),
        F(p + "lflen", "Each wire length", "num", { unit: "m", req: true, show: () => rec[p + "lfm"] === K.LF_METHODS[3] }),
        F(p + "lfgap", "Gap between the wire ends", "num", { unit: "mm", req: true, show: () => rec[p + "lfm"] === K.LF_METHODS[3] })]),
    S("c5sig", "C5", "One-wire LF signal", () => "The local fault gives a clear pulse above the noise. Record the one-wire LF signal.|PRO-AIC-0608 C5",
      [F(p + "sig", "One-wire LF signal", "num", { unit: "mV", req: true })]),
    S("c5thr", "C5", "LF threshold and alarm", () => "Record the LF threshold and the alarm as set on the basic unit. Rope Record does not check them – Kuzo checks the threshold.|PRO-AIC-0608 C5; owner's ruling D5 (24-Nov-2026)",
      [F(p + "thr", "LF threshold set", "num", { unit: "mV", req: true }),
        F(p + "alarm", "LF alarm (blank = not set)", "num", { unit: "mV" }),
        F(p + "speedcomp", "Speed compensation mode", "text", { hint: "where the instrument has one" }),
        F(p + "config", "Configuration file name", "text", { req: true }),
        F(p + "scanstep", "Scan step set on the basic unit (if read)", "num", { unit: "mm", hint: "optional – Kuzo compares it with the scan" }),
        ...(i === 1 ? [F("h2on", "Calibrate a second head on this rope?", "radio", { ...YN, req: true })] : [])],
      ),
    S("c6", "C6", "Closing check (after the recording)", () => "Read the LMA again on the zero section: <b>0 ± 0.5 %</b>. Recorded length within <b>1 %</b> of a known length. Negative LMA not more than <b>1 %</b> (E1).|PRO-AIC-0608 C6, E1",
      [F(p + "c6_done", "Closing check done?", "radio", { opts: ["yes", "no"], labels: ["Yes", "Not yet – after the recording"], req: true }),
        F(p + "c6_zero", "Closing zero reads", "snum", { unit: "%", req: true, show: () => rec[p + "c6_done"] === "yes" }),
        F(p + "c6_len", "Recorded length", "num", { unit: "m", req: true, show: () => rec[p + "c6_done"] === "yes" }),
        F(p + "c6_known", "Known length", "num", { unit: "m", req: true, show: () => rec[p + "c6_done"] === "yes" }),
        F(p + "lmaneg", "Most negative LMA on the trace (if any)", "snum", { unit: "%", show: () => rec[p + "c6_done"] === "yes" })]),
  ];
}

const SCREENS = (r) => [
  { id: "job", group: "Job", title: "Job", accept: () => "Rope and extent confirmed with the client's representative.|PRO-AIC-0608 A1",
    fields: [
      F("type", "Job type", "radio", { opts: ["site", "reference"], labels: ["Site rope", "Reference rope"], req: true }),
      F("ref", "Reference rope number", "text", { req: true, show: () => isRef(rec), hint: "e.g. AIC-RR-48-01" }),
      F("jobno", "Job order No.", "text", { req: () => !isRef(rec) }),
      F("client", "Client", "text"),
      F("position", "Crane / rope position", "text", { req: () => !isRef(rec) }),
      F("date", "Test date", "date", { req: true }),
      F("engineer", "Engineer (MRT Level II)", "text", { req: true }),
      F("location", "Location", "text"),
      F("length", "Rope length", "num", { unit: "m", hint: blank }),
    ] },
  { id: "rope", group: "Rope", title: "Rope data", accept: () => "Nominal and measured diameter from the certificate; two caliper readings at 90° to each other at the widest point; A and δmax with their source, or the RCN.|Owner's ruling D2 (24-Nov-2026); PRO-AIC-0608 B2, A3",
    fields: [
      F("dnom", "Nominal diameter d (certificate)", "num", { unit: "mm", req: true }),
      F("d_cert", "Measured diameter on the certificate", "num", { unit: "mm", hint: "blank if the certificate gives none – kept on the phone and in the CSV" }),
      F("da", "Reading 1 at the widest point", "num", { unit: "mm", req: true, group: "Caliper readings" }),
      F("db", "Reading 2 at 90° to reading 1", "num", { unit: "mm", req: true, group: "Caliper readings" }),
      F("construction", "Construction (as on the certificate)", "text", { req: true, hint: "e.g. 6x36 IWRC, 35(W)x7" }),
      F("csrc", "Construction from", "radio", { opts: K.CONSTR_SOURCES, req: true }),
      F("annexh", "ISO 4309 Annex H construction (for the RCN)", "select", { opts: [...K.ANNEX_H_CHOICES, K.ANNEX_OTHER], req: true }),
      F("ropetype", "Rope type", "select", { opts: K.ROPE_TYPES, req: true, show: () => rec.annexh === K.ANNEX_OTHER }),
      F("seale", "Seale outer strands, 19 wires or fewer?", "radio", { ...YN, show: () => rec.annexh === K.ANNEX_OTHER && rec.ropetype === K.ROPE_TYPES[0] }),
      F("outer", "Outer strands (count)", "int", { req: () => rec.annexh === K.ANNEX_OTHER }),
      F("wires", "Load-bearing wires per outer strand", "int", { hint: "no filler wires", req: () => rec.annexh === K.ANNEX_OTHER }),
      F("core", "Core", "select", { opts: K.CORES, req: true }),
      F("lay", "Lay", "radio", { opts: K.LAYS, req: true }),
      F("runs", "How the rope runs", "radio", { opts: K.RUNS, req: true }),
      F("spool_from", "Spooling length from", "num", { unit: "m", show: () => rec.runs === K.RUNS[1] }),
      F("spool_to", "Spooling length to", "num", { unit: "m", show: () => rec.runs === K.RUNS[1] }),
      F("asrc", "Source of A", "select", { opts: () => { const d = K.num(rec.dnom); return d != null && (d < 2 || d > 60) ? K.A_SOURCES.filter((x) => x !== K.A_ISO) : K.A_SOURCES; },
        hint: () => `Kuzo's choices; leave blank when A is not known.${K.num(rec.dnom) > 60 ? " Over 60 mm: no ISO 2408 factor (2–60 mm only); Intron k gives an estimate for the air value only (A3)." : ""}` }),
      F("a", "Metallic area A", "num", { unit: "mm²", req: () => K.A_TYPED.includes(rec.asrc), show: () => K.A_TYPED.includes(rec.asrc) }),
      F("isoclass", "ISO 2408 class (for the C factor)", "select", { opts: [...K.ISO_CLASSES, K.ISO_NONE], req: () => rec.asrc === K.A_ISO, show: () => rec.asrc === K.A_ISO }),
      F("dmaxsrc", "Largest wire δmax – source", "select", { opts: K.DMAX_SOURCES, req: true }),
      F("dmax", "Largest wire δmax", "num", { unit: "mm", req: () => rec.dmaxsrc && rec.dmaxsrc !== K.DMAX_SOURCES[2], show: () => rec.dmaxsrc && rec.dmaxsrc !== K.DMAX_SOURCES[2] }),
    ],
    top: () => { const c = K.compute(rec); return c.D ? `<div class="calc"><b>Measured diameter ${K.r1(c.D, 2)} mm</b><small>mean of ${c.da} and ${c.db} mm at the widest point – selects the head and liners</small><i class="src">PRO-AIC-0608 C2; owner's ruling D2</i></div>` : ""; } },
  { id: "results", group: "Results", title: "Filled in for this rope", accept: () => "Check the working. An automatic value can be changed only with a reason, saved with the time.|Rope Record", results: true, fields: [] },
  ...headScreens(1).filter((s) => !s.show || s.show()),
  ...(r.h2on === "yes" ? headScreens(2).filter((s) => !s.show || s.show()) : []),
  ...(isRef(r) ? [{ id: "sections", group: "Sections", title: "Reference rope sections", accept: () => "Every distance from the datum in one direction; no minus signs.|PRO-AIC-0608 §5.3, D1",
    fields: [F("datum", "Datum ('0') is at", "text", { req: true }),
      ...K.SECTIONS.flatMap((s) => [F(`${s}_from`, "From", "num", { unit: "m", req: s === "A", group: `Section ${s}` }), F(`${s}_to`, "To", "num", { unit: "m", req: s === "A", group: `Section ${s}` }),
        F(`${s}_w`, "Wires cut", "int", { req: s === "A", group: `Section ${s}` }), F(`${s}_gap`, "Gap", "num", { unit: "mm", group: `Section ${s}` })])] }] : []),
  { id: "finish", group: "Save", title: "Problems, sign-off and save", finish: true, accept: () => "Every red problem fixed or given a reason; reasons and overrides are saved in the CSV with the time.|Rope Record",
    fields: [F("counted", "Counted by", "text"), F("checked", "Checked by", "text"), F("notes", "Notes / remarks", "textarea")] },
];

// ---------------- state ----------------
let rec = null, screens = [], cur = 0, records = [];
const popped = new Set();
const load = (k, d) => { try { const x = JSON.parse(localStorage.getItem(k) || "null"); return x ?? d; } catch { return d; } };
const keep = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } };
const saveDraft = () => { if (rec) keep(DRAFT, { rec, cur }); };
const shown = (f) => !f.show || f.show();
const required = (f) => shown(f) && (typeof f.req === "function" ? f.req() : !!f.req);
const missing = (s) => s.fields.filter((f) => required(f) && String(rec[f.id] ?? "").trim() === "").map((f) => f.label);
const probs = () => K.checks(rec);
const openRed = (s, list = probs()) => K.unresolved(list, rec).filter((x) => x.screen === s.id);
const stepDone = (i) => missing(screens[i]).length === 0 && openRed(screens[i]).length === 0;

// ---------------- drawing ----------------
function input(f) {
  const v = rec[f.id] ?? "";
  const unit = f.unit ? `<span class="unit">${esc(f.unit)}</span>` : "";
  const ht = typeof f.hint === "function" ? f.hint() : f.hint;
  const hint = ht ? `<small>${esc(ht)}</small>` : "";
  const star = required(f) ? ' <i class="req">required</i>' : "";
  if (f.kind === "radio") return `<fieldset class="radio fw" data-f="${f.id}"><legend>${esc(f.label)}${star}</legend>${f.opts.map((o, k) =>
    `<label class="opt"><input type="radio" name="${f.id}" value="${esc(o)}" ${v === o ? "checked" : ""}><span>${esc(f.labels ? f.labels[k] : o)}</span></label>`).join("")}</fieldset>`;
  const lab = `<span class="lab">${esc(f.label)}${star}</span>${hint}`;
  const opts = typeof f.opts === "function" ? f.opts() : f.opts;
  if (f.kind === "select") return `<label class="f fw" data-f="${f.id}">${lab}<select id="${f.id}"><option value="">– choose –</option>${opts.map((o) => `<option ${v === o ? "selected" : ""}>${esc(o)}</option>`).join("")}</select></label>`;
  if (f.kind === "textarea") return `<label class="f fw" data-f="${f.id}">${lab}<textarea id="${f.id}" rows="4">${esc(v)}</textarea></label>`;
  const attrs = { num: 'type="text" inputmode="decimal" autocomplete="off"', snum: 'type="text" inputmode="decimal" autocomplete="off"', int: 'type="text" inputmode="numeric" autocomplete="off"', date: 'type="date"', time: 'type="time"', text: 'type="text" autocomplete="off"' }[f.kind];
  return `<label class="f fw" data-f="${f.id}">${lab}<span class="in">${f.kind === "snum" ? `<button type="button" class="neg" data-neg="${f.id}" aria-label="plus or minus">±</button>` : ""}<input id="${f.id}" ${attrs} value="${esc(v)}">${unit}</span></label>`;
}
const srcLine = (t) => { const [a, b] = t.split("|"); return `<p class="accept">${a}</p>${b ? `<i class="src">${esc(b)}</i>` : ""}`; };

function resultsHTML(c) {
  const ovBtn = { "LF limit 6d / 30d": "lf" };
  return `<table class="work">${c.working.map(([a, b, w, src]) => `<tr><th>${esc(a)}</th><td><b>${esc(b)}</b>${w ? `<small>${esc(w)}</small>` : ""}<i class="src">${esc(src)}</i>
    ${ovBtn[a] === "lf" && c.lf.ok ? `<button type="button" class="ovr" data-ovr="lf6">Change 6d</button> <button type="button" class="ovr" data-ovr="lf30">Change 30d</button>` : ""}</td></tr>`).join("")}</table>`;
}

function problemList(list, withButtons) {
  if (!list.length) return "";
  return `<ul class="checks">${list.map((x) => { const rs = K.reasonOf(rec, x.id);
    return `<li class="${x.level}${rs ? " reasoned" : ""}"><b>${x.level === "red" ? (rs ? "Red – reason given" : "Red – must fix") : "Amber"}:</b> ${esc(x.text)}<span class="want">${esc(x.want)}</span><i class="src">${esc(x.src)}</i>
      ${rs ? `<span class="rsn">Reason (${esc(rs.time)}): ${esc(rs.text)}</span>` : ""}
      ${withButtons ? `<span class="row">${screens[cur] && x.screen !== screens[cur].id ? `<button type="button" data-go-s="${esc(x.screen)}">Go to it</button>` : ""}${x.level === "red" ? `<button type="button" data-reason="${esc(x.id)}">${rs ? "Change reason" : "Give reason"}</button>` : ""}</span>` : ""}</li>`; }).join("")}</ul>`;
}

function drawProbs(list) {
  const open = list.filter((x) => !(x.level === "red" && K.reasonOf(rec, x.id)));
  const red = open.filter((x) => x.level === "red").length, amb = open.filter((x) => x.level === "amber").length;
  $("#probs").hidden = !open.length;
  $("#probs").className = red ? "probs red" : "probs amber";
  $("#probs").innerHTML = open.length ? `<details><summary>${red ? `${red} red` : ""}${red && amb ? " · " : ""}${amb ? `${amb} amber` : ""} open problem${open.length > 1 ? "s" : ""} – tap to see</summary>${open.map((x) =>
    `<button type="button" class="pi ${x.level}" data-go-s="${esc(x.screen)}">${esc(x.text)}</button>`).join("")}</details>` : "";
}

function highlight(list) {
  document.querySelectorAll("#fields .fw").forEach((el) => el.classList.remove("p-red", "p-amber", "p-ok"));
  for (const x of list) {
    if (!x.field) continue;
    const el = document.querySelector(`#fields [data-f="${x.field}"]`); if (!el) continue;
    el.classList.add(x.level === "red" && !K.reasonOf(rec, x.id) ? "p-red" : x.level === "red" ? "p-ok" : "p-amber");
  }
}

function drawLive() {
  const s = screens[cur], c = K.compute(rec), all = K.checks(rec, c);
  $("#top").innerHTML = s.top ? s.top() : "";
  $("#accept").innerHTML = s.accept ? srcLine(s.accept()) : "";
  let html = "";
  if (s.results) html += resultsHTML(c);
  if (s.finish) {
    const open = K.unresolved(all, rec);
    html += all.length ? `<h3>${all.filter((x) => x.level === "red").length} red, ${all.filter((x) => x.level === "amber").length} amber</h3>${problemList(all, true)}` : `<p class="okbox">No problems found.</p>`;
    if (open.length) html += `<p class="stop">${open.length} red problem(s) still need fixing or a reason before saving.</p>`;
  } else html += problemList(all.filter((x) => x.screen === s.id), true);
  $("#live").innerHTML = html;
  drawProbs(all); highlight(all.filter((x) => x.screen === s.id)); drawBar(all);
}

function drawBar(all = probs()) {
  const s = screens[cur], miss = missing(s), red = openRed(s, all);
  $("#back").disabled = cur === 0;
  if (s.finish) {
    $("#next").hidden = true; $("#save").hidden = false; $("#share").hidden = false;
    const notDone = screens.findIndex((_, i) => i !== cur && !stepDone(i));
    $("#need").textContent = notDone >= 0 ? `Not finished: ${screens[notDone].title}` : K.unresolved(all, rec).length ? `${K.unresolved(all, rec).length} red problem(s) need a fix or a reason` : "";
  } else {
    $("#next").hidden = false; $("#save").hidden = true; $("#share").hidden = true;
    $("#next").disabled = miss.length > 0 || red.length > 0;
    $("#need").textContent = miss.length ? `Still needed: ${miss.join(", ")}` : red.length ? "Fix the red problem or give a reason to continue" : "";
  }
}

function drawSteps() {
  const reach = rec.reach ?? 0;
  $("#steps").innerHTML = screens.map((s, i) => `<button type="button" class="chip ${i === cur ? "on" : ""} ${i < reach ? "done" : ""}" data-go="${i}" ${i > reach ? "disabled" : ""}>${s.step ? s.step + " " : ""}${esc(s.title.replace(/^Head \d · /, ""))}</button>`).join("");
  const on = $("#steps .on"); if (on) on.scrollIntoView({ block: "nearest", inline: "center" });
}

function draw() {
  screens = SCREENS(rec);
  if (cur >= screens.length) cur = screens.length - 1;
  const s = screens[cur];
  $("#home").hidden = true; $("#about").hidden = true; $("#form").hidden = false; $("#bar").hidden = false;
  $("#where").textContent = `${s.group}${s.step ? " · " + s.step : ""} · screen ${cur + 1} of ${screens.length}`;
  $("#title").textContent = s.title;
  if (s.id.endsWith("-c4") && !rec[s.id.slice(0, 2) + "_cal_time"]) { const d = new Date(); rec[s.id.slice(0, 2) + "_cal_time"] = `${p2(d.getHours())}:${p2(d.getMinutes())}`; }
  let html = "", g = null;
  for (const f of s.fields.filter(shown)) {
    if (f.group && f.group !== g) { if (g) html += "</div>"; html += `<div class="sec"><h3>${esc(f.group)}</h3>`; g = f.group; }
    if (!f.group && g) { html += "</div>"; g = null; }
    html += input(f);
  }
  if (g) html += "</div>";
  $("#fields").innerHTML = html;
  drawSteps(); drawLive(); saveDraft();
}

// ---------------- pop-ups ----------------
function modal(html, onReady) {
  $("#modal").innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}</div>`;
  $("#modal").hidden = false; document.body.classList.add("noscroll");
  if (onReady) onReady($("#modal .sheet"));
}
function closeModal() { $("#modal").hidden = true; $("#modal").innerHTML = ""; document.body.classList.remove("noscroll"); }

function popProblems(list) {
  const x = list[0], more = list.length - 1, red = x.level === "red";
  modal(`<h2 class="${red ? "t-red" : "t-amber"}">${red ? "Must fix" : "Warning"}</h2><p class="what">${esc(x.text)}</p><p class="want"><b>Correct:</b> ${esc(x.want)}</p><p class="src">${esc(x.src)}</p>
    ${red ? `<label class="f">Or the reason it stands (saved with the time)<textarea id="m-reason" rows="3"></textarea></label>` : ""}
    <div class="row">${red ? `<button type="button" class="p" id="m-fix">Fix it</button><button type="button" id="m-save" disabled>Save reason</button>` : `<button type="button" class="p" id="m-ok">OK, continue</button>`}</div>${more ? `<p class="note">${more} more problem(s) follow.</p>` : ""}`,
    (el) => {
      const next = () => { closeModal(); if (more) popProblems(list.slice(1)); };
      if (red) {
        el.querySelector("#m-reason").addEventListener("input", (e) => { el.querySelector("#m-save").disabled = !e.target.value.trim(); });
        el.querySelector("#m-fix").addEventListener("click", () => { closeModal(); const f = document.getElementById(x.field) || document.querySelector(`[name="${x.field}"]`); if (f) f.focus(); });
        el.querySelector("#m-save").addEventListener("click", () => { setReason(x.id, el.querySelector("#m-reason").value); next(); });
      } else el.querySelector("#m-ok").addEventListener("click", next);
    });
}
function setReason(id, text) { rec.reasons = rec.reasons || {}; if (text.trim()) rec.reasons[id] = { text: text.trim(), time: stamp() }; else delete rec.reasons[id]; saveDraft(); drawLive(); drawSteps(); }
function liveCheck(fieldId) {
  if (!$("#modal").hidden) return;
  const mine = probs().filter((x) => x.field === fieldId && !(x.level === "red" && K.reasonOf(rec, x.id)));
  const fresh = mine.filter((x) => !popped.has(x.id + "|" + x.text));
  fresh.forEach((x) => popped.add(x.id + "|" + x.text));
  if (fresh.length) popProblems(fresh.sort((a, b) => (a.level === "red" ? 0 : 1) - (b.level === "red" ? 0 : 1)));
}
function reasonDialog(id) {
  const x = probs().find((y) => y.id === id); if (!x) return;
  const rs = K.reasonOf(rec, id);
  modal(`<h2 class="t-red">Reason it stands</h2><p class="what">${esc(x.text)}</p><p class="want"><b>Correct:</b> ${esc(x.want)}</p><p class="src">${esc(x.src)}</p>
    <label class="f">Reason (saved with the time)<textarea id="m-reason" rows="3">${esc(rs ? rs.text : "")}</textarea></label>
    <div class="row"><button type="button" id="m-cancel">Cancel</button><button type="button" class="p" id="m-save">Save reason</button></div>`, (el) => {
    el.querySelector("#m-cancel").addEventListener("click", closeModal);
    el.querySelector("#m-save").addEventListener("click", () => { setReason(id, el.querySelector("#m-reason").value); closeModal(); });
  });
}
function overrideDialog(key) {
  const c = K.compute(rec), base = key.replace(/\d$/, "");
  const auto = key === "A" ? c.Aauto : key === "lf6" ? c.lf.auto6 : key === "lf30" ? c.lf.auto30 : (c.heads.find((h) => `air${h.i}` === key) || {}).airAuto;
  const o = (rec.ovr || {})[key] || {};
  modal(`<h2>${esc(K.OVERRIDABLE[base])}</h2><p>Automatic value: <b>${esc(auto ?? "–")}</b>. Change it only with a reason; the reason and the time are saved in the CSV.</p>
    <label class="f">New value<span class="in"><input id="m-val" type="text" inputmode="decimal" value="${esc(o.value ?? "")}"></span></label>
    <label class="f">Reason<textarea id="m-reason" rows="3">${esc(o.reason ?? "")}</textarea></label>
    <div class="row"><button type="button" id="m-cancel">Cancel</button>${o.value ? `<button type="button" id="m-clear">Use automatic</button>` : ""}<button type="button" class="p" id="m-save" disabled>Save</button></div>`, (el) => {
    const v = el.querySelector("#m-val"), r = el.querySelector("#m-reason"), sv = el.querySelector("#m-save");
    const upd = () => { sv.disabled = !(K.num(v.value) != null && r.value.trim()); };
    v.addEventListener("input", upd); r.addEventListener("input", upd); upd();
    el.querySelector("#m-cancel").addEventListener("click", closeModal);
    const cl = el.querySelector("#m-clear"); if (cl) cl.addEventListener("click", () => { delete rec.ovr[key]; closeModal(); saveDraft(); draw(); });
    sv.addEventListener("click", () => { rec.ovr = rec.ovr || {}; rec.ovr[key] = { value: v.value.trim(), reason: r.value.trim(), time: stamp() }; closeModal(); saveDraft(); draw(); });
  });
}

// ---------------- events ----------------
$("#fields").addEventListener("input", (e) => { const t = e.target; if (t.matches("input[type=radio]") || !t.id) return; rec[t.id] = t.value; saveDraft(); drawLive(); });
$("#fields").addEventListener("focusout", (e) => { const t = e.target; if (t.matches("input:not([type=radio]), textarea") && t.id) { if (t.id === "dnom") { const f = screens[cur].fields.find((x) => x.id === "asrc"), el = document.querySelector('[data-f="asrc"]'); if (f && el) el.outerHTML = input(f); } liveCheck(t.id); } });
$("#fields").addEventListener("change", (e) => {
  const t = e.target;
  if (t.matches("input[type=radio]")) rec[t.name] = t.value; else if (t.id) rec[t.id] = t.value;
  if (t.matches("select, input[type=radio]")) { draw(); liveCheck(t.name || t.id); } else { saveDraft(); drawLive(); }
});
$("#fields").addEventListener("click", (e) => {
  const b = e.target.closest("[data-neg]"); if (!b) return;
  const inp = document.getElementById(b.dataset.neg), v = inp.value.trim();
  inp.value = v.startsWith("-") ? v.slice(1) : "-" + v; rec[inp.id] = inp.value; saveDraft(); drawLive(); inp.focus();
});
document.addEventListener("click", (e) => {
  const g = e.target.closest("[data-go-s]"); if (g) { if (!$("#modal").hidden) closeModal(); const i = screens.findIndex((s) => s.id === g.dataset.goS); if (i >= 0) { cur = i; draw(); scrollTo(0, 0); } return; }
  const r = e.target.closest("[data-reason]"); if (r) { reasonDialog(r.dataset.reason); return; }
  const o = e.target.closest("[data-ovr]"); if (o) overrideDialog(o.dataset.ovr);
});
$("#steps").addEventListener("click", (e) => { const b = e.target.closest("[data-go]"); if (!b || b.disabled) return; cur = +b.dataset.go; draw(); scrollTo(0, 0); });
$("#back").addEventListener("click", () => { if (cur > 0) { cur--; draw(); scrollTo(0, 0); } });
$("#next").addEventListener("click", () => { if ($("#next").disabled) return; cur++; rec.reach = Math.max(rec.reach ?? 0, cur); draw(); scrollTo(0, 0); });
$("#menu").addEventListener("click", () => { saveDraft(); home(); });

// ---------------- save, download, share ----------------
function download(name, text, type = "text/csv") {
  const blob = new Blob([text], { type: `${type};charset=utf-8` }), u = URL.createObjectURL(blob), a = document.createElement("a");
  a.href = u; a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(u); a.remove(); }, 1500);
}
// files: [{ name, text, type }]. One share sheet with every file; where sharing files is not possible, each is downloaded.
async function shareFiles(files, title) {
  const fs = files.map((f) => new File([f.text], f.name, { type: f.type }));
  if (navigator.canShare && navigator.canShare({ files: fs })) {
    try { await navigator.share({ files: fs, title, text: title }); return "shared"; } catch (e) { if (e && e.name === "AbortError") return "cancelled"; }
  }
  files.forEach((f) => download(f.name, f.text, f.type)); return "downloaded";
}
const share = (name, text, title) => shareFiles([{ name, text, type: "text/csv" }], title);
const recFiles = (r, when) => [{ name: K.fileName(r, when), text: K.csvOf([r]), type: "text/csv" }, { name: K.kuzoFileName(r, when), text: JSON.stringify(K.kuzoRecord(r, `${V.version}`), null, 1), type: "application/json" }];
function store(r) {
  const now = new Date();
  r.savedAt = now.toISOString(); r.appVersion = `${V.version} (${V.date})`;
  if (!r.id) r.id = K.fileName(r, now).replace(/\.csv$/, "") + "-" + now.getTime();
  const i = records.findIndex((x) => x.id === r.id);
  if (i >= 0) records[i] = structuredClone(r); else records.unshift(structuredClone(r));
  return { name: K.fileName(r, now), kname: K.kuzoFileName(r, now), when: now, replaced: i >= 0, ok: keep(STORE, records) };
}
function finishMsg(t) { $("#msg").textContent = t; $("#msg").hidden = false; $("#msg").scrollIntoView({ block: "center" }); }
function beforeSave(go) {
  const all = probs(), open = K.unresolved(all, rec), notDone = screens.findIndex((_, i) => i !== cur && !stepDone(i));
  if (notDone >= 0 && !open.length) { modal(`<h2 class="t-red">Not finished</h2><p>${esc(screens[notDone].title)} is not complete.</p><div class="row"><button type="button" class="p" data-go-s="${esc(screens[notDone].id)}">Go to it</button></div>`); return; }
  modal(`<h2 class="${open.length ? "t-red" : ""}">${open.length ? "Cannot save yet" : "Save this record?"}</h2>
    ${all.length ? `<p>${open.length ? "Fix these, or give a reason:" : "Problems in this record (saved with it):"}</p>${problemList(all, true)}` : `<p class="okbox">No problems found.</p>`}
    <div class="row"><button type="button" id="m-cancel">Back</button>${open.length ? "" : `<button type="button" class="p" id="m-go">Save</button>`}</div>`, (el) => {
    el.querySelector("#m-cancel").addEventListener("click", closeModal);
    const g = el.querySelector("#m-go"); if (g) g.addEventListener("click", () => { closeModal(); go(); });
  });
}
$("#save").addEventListener("click", () => beforeSave(() => {
  const s = store(rec); recFiles(rec, s.when).forEach((f) => download(f.name, f.text, f.type)); saveDraft();
  finishMsg(`Saved on this phone${s.replaced ? " (the earlier copy was replaced)" : ""}; ${s.name} and ${s.kname} downloaded.${s.ok ? "" : " WARNING: the phone refused to keep a copy – keep the files."}`);
}));
$("#share").addEventListener("click", () => beforeSave(async () => {
  const s = store(rec); saveDraft();
  const how = await shareFiles(recFiles(rec, s.when), `Rope record ${s.name}`);
  finishMsg(`Saved on this phone${s.replaced ? " (the earlier copy was replaced)" : ""}. ${how === "shared" ? "CSV and Kuzo file sent to the share sheet." : how === "cancelled" ? "Sharing cancelled." : "Sharing is not available here – the CSV and the Kuzo file were downloaded instead."}`);
}));

// ---------------- QR for Kuzo (schema "x-qr") ----------------
let qrState = null;
async function showQr(r) {
  const parts = await K.qrParts(K.kuzoText(r, V.version));
  qrState = { parts, i: 0, auto: true, timer: null, lock: null, title: r.type === "reference" ? r.ref : [r.jobno, r.position].filter(Boolean).join(" – ") };
  $("#home").hidden = true; $("#about").hidden = true; $("#form").hidden = true; $("#bar").hidden = true; $("#qr").hidden = false;
  $("#where").textContent = "QR for Kuzo";
  try { if (navigator.wakeLock) qrState.lock = await navigator.wakeLock.request("screen"); } catch {}
  drawQr(); qrTimer();
}
function qrSvg(text) {
  const q = qrcode(0, "M"); q.addData(text, "Alphanumeric"); q.make();
  const n = q.getModuleCount(), m = 4, W = n + 2 * m; let d = "";
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c + m} ${r + m}h1v1h-1z`;
  return `<svg viewBox="0 0 ${W} ${W}" shape-rendering="crispEdges" role="img" aria-label="QR code"><rect width="${W}" height="${W}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
}
function drawQr() {
  const q = qrState; if (!q) return;
  $("#qrTitle").textContent = q.title || "Rope record";
  $("#qrPart").textContent = `Code ${q.i + 1} of ${q.parts.length}`;
  $("#qrCode").innerHTML = qrSvg(q.parts[q.i]);
  $("#qrAuto").textContent = q.auto ? "Stop auto (every 2 s)" : "Auto every 2 s";
}
function qrTimer() { const q = qrState; if (!q) return; clearInterval(q.timer); if (q.auto && q.parts.length > 1) q.timer = setInterval(() => { q.i = (q.i + 1) % q.parts.length; drawQr(); }, 2000); }
function closeQr() { if (qrState) { clearInterval(qrState.timer); try { qrState.lock && qrState.lock.release(); } catch {} } qrState = null; $("#qr").hidden = true; home(); }
$("#qrNext").addEventListener("click", () => { const q = qrState; if (!q) return; q.i = (q.i + 1) % q.parts.length; drawQr(); qrTimer(); });
$("#qrPrev").addEventListener("click", () => { const q = qrState; if (!q) return; q.i = (q.i - 1 + q.parts.length) % q.parts.length; drawQr(); qrTimer(); });
$("#qrAuto").addEventListener("click", () => { const q = qrState; if (!q) return; q.auto = !q.auto; drawQr(); qrTimer(); });
$("#qrClose").addEventListener("click", closeQr);
document.addEventListener("visibilitychange", async () => { if (qrState && document.visibilityState === "visible" && navigator.wakeLock) { try { qrState.lock = await navigator.wakeLock.request("screen"); } catch {} } });

// ---------------- home and About ----------------
function newRecord(type) { rec = { type, date: today(), reasons: {}, ovr: {}, reach: 0 }; cur = 0; popped.clear(); $("#msg").hidden = true; draw(); scrollTo(0, 0); }
function home() {
  $("#qr").hidden = true;
  $("#home").hidden = false; $("#about").hidden = true; $("#form").hidden = true; $("#bar").hidden = true; $("#msg").hidden = true; $("#probs").hidden = true;
  $("#where").textContent = "Acumen MRT – site record";
  let d = load(DRAFT, null);
  const strip = (r) => JSON.stringify({ ...r, reach: 0, savedAt: 0 });
  if (d && d.rec && d.rec.id) { const s = records.find((x) => x.id === d.rec.id); if (s && strip(s) === strip(d.rec)) d = null; }
  $("#cont").hidden = !(d && d.rec);
  if (d && d.rec) $("#cont").textContent = `Continue: ${d.rec.type === "reference" ? d.rec.ref || "reference rope" : [d.rec.jobno, d.rec.position].filter(Boolean).join(" – ") || "site rope"}`;
  $("#list").innerHTML = records.length ? records.map((r, i) => `<li><div><b>${esc(r.type === "reference" ? r.ref : [r.jobno, r.position].filter(Boolean).join(" – "))}</b>
    <small>${esc(r.type === "reference" ? "Reference rope" : "Site rope")} · ${esc(r.date)} · ${esc(r.engineer)} · ${esc(r.dnom)} mm</small></div>
    <span class="rb"><button type="button" data-edit="${i}">Edit</button><button type="button" data-csv="${i}">Files</button><button type="button" data-share="${i}">Share</button><button type="button" data-qr="${i}">QR for Kuzo</button></span></li>`).join("")
    : "<li class='none'>No records on this phone yet.</li>";
  $("#all").hidden = !records.length;
  scrollTo(0, 0);
}
function about() {
  $("#home").hidden = true; $("#about").hidden = false; $("#form").hidden = true; $("#bar").hidden = true; $("#probs").hidden = true;
  $("#where").textContent = "About";
  const P = K.PROCEDURE;
  $("#aboutBody").innerHTML = `<p><b>Rope Record ${esc(V.version)}</b> · ${esc(V.date)}</p>
    ${P.confirmedFiled ? "" : `<p class="stop">Procedure copy not confirmed as filed.</p>`}
    <dl class="about"><dt>Procedure followed</dt><dd>${esc(P.doc)}<br><small>${esc(P.file)}<br>SHA-256 ${esc(P.sha256)}</small></dd>
    <dt>LF threshold</dt><dd>Recorded as entered, not checked by Rope Record; Kuzo checks it (owner's ruling D5, 24-Nov-2026). Rule set held for reference: ${esc(K.LF_RULESETS[K.LF_RULESET].name)}</dd>
    <dt>Kuzo link</dt><dd>Save and Share give the CSV and a .kuzo.json file (rope-record-schema-v1); "QR for Kuzo" shows the same record as QR codes.</dd>
    ${K.SOURCES.map(([a, b]) => `<dt>${esc(a)}</dt><dd>${esc(b)}</dd>`).join("")}</dl>
    <p class="note">Records stay on this phone. This is a site record, not a report.</p>`;
  scrollTo(0, 0);
}
$("#newsite").addEventListener("click", () => newRecord("site"));
$("#newref").addEventListener("click", () => newRecord("reference"));
$("#aboutBtn").addEventListener("click", about);
$("#aboutBack").addEventListener("click", home);
$("#cont").addEventListener("click", () => { const d = load(DRAFT, null); if (!d) return; rec = K.migrate(d.rec); rec.reasons = rec.reasons || {}; rec.ovr = rec.ovr || {}; cur = d.cur || 0; draw(); });
$("#list").addEventListener("click", async (e) => {
  const b = e.target.closest("button"); if (!b) return;
  const r = K.migrate(records[+(b.dataset.edit ?? b.dataset.csv ?? b.dataset.share ?? b.dataset.qr)]);
  if (b.dataset.edit != null) { rec = structuredClone(r); screens = SCREENS(rec); rec.reach = screens.length - 1; cur = 0; popped.clear(); draw(); finishMsg(`Editing ${b.closest("li").querySelector("b").textContent}. Save again to replace the stored copy.`); }
  if (b.dataset.csv != null) recFiles(r, new Date(r.savedAt)).forEach((f) => download(f.name, f.text, f.type));
  if (b.dataset.share != null) await shareFiles(recFiles(r, new Date(r.savedAt)), "Rope record");
  if (b.dataset.qr != null) showQr(r);
});
const allName = () => `rope-records_${today()}.csv`;
$("#allcsv").addEventListener("click", () => download(allName(), K.csvOf(records)));
$("#allshare").addEventListener("click", () => share(allName(), K.csvOf(records), "Rope records"));

let deferred = null;
addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e; $("#install").hidden = false; });
$("#install").addEventListener("click", async () => { if (!deferred) return; deferred.prompt(); await deferred.userChoice; deferred = null; $("#install").hidden = true; });
addEventListener("appinstalled", () => { $("#install").hidden = true; });

$("#ver").textContent = `Rope Record version ${V.version} · ${V.date}${K.PROCEDURE.confirmedFiled ? "" : " · procedure copy not confirmed as filed"}`;
records = load(STORE, []); if (!Array.isArray(records)) records = []; records = records.map(K.migrate);
home();
if ("serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
