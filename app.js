// Rope Record - screens. Calculations and checks are in calc.js.
import * as K from "./calc.js";

const V = self.RR_VERSION || { version: "?", date: "" };
const STORE = "rope-record-records";
const DRAFT = "rope-record-draft";
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const today = () => { const d = new Date(), p = (n) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; };
const blankHint = "leave blank if not available – never 0";

// ---------- field kinds ----------
// num: decimal keypad, not negative. snum: number keypad with minus. int: whole numbers.
const F = (id, label, kind = "text", extra = {}) => ({ id, label, kind, ...extra });
const isRef = (r) => r.type === "reference";

// ---------- screens ----------
function headScreens(i) {
  const p = `h${i}_`, H = (r) => K.headOf(r[p + "head"]);
  const name = (r) => (H(r) ? `${H(r).model} S/N ${H(r).serial}` : `head ${i}`);
  return [
    { id: `h${i}-equip`, group: `Head ${i}`, title: `Head ${i} – equipment`, step: "1 of 7",
      intro: "Pick the head and basic unit from the equipment register. The liner is proposed from the measured diameter.",
      fields: [
        F(p + "head", "Magnetic head (model / S/N)", "select", { opts: K.HEAD_CHOICES, req: true }),
        F(p + "bu", "Basic unit S/N", "select", { opts: [...K.BASIC_UNITS.map((b) => b.sn), K.BU_OTHER], req: true }),
        F(p + "bu_other", "Basic unit S/N (other)", "text", { req: true, show: (r) => r[p + "bu"] === K.BU_OTHER }),
        F(p + "liner", "Liner / sensor set fitted", "liner", { head: i, req: true }),
        F(p + "temp", "Air temperature", "snum", { unit: "°C", req: true }),
      ] },
    { id: `h${i}-zero`, group: `Head ${i}`, title: `Head ${i} – zero on a sound section`, step: "2 of 7",
      intro: "Zero the LMA on a sound section at least 0.5 m long. Distances from the datum, one direction, no minus signs.",
      fields: [F(p + "zf", "Sound section from", "num", { unit: "m", req: true }), F(p + "zt", "Sound section to", "num", { unit: "m", req: true })] },
    { id: `h${i}-air`, group: `Head ${i}`, title: `Head ${i} – air value`, step: "3 of 7",
      intro: "Type the air value you entered on the basic unit. It is checked against Intron Table 4 for this head and A.",
      live: (r, c) => { const hc = c.heads.find((x) => x.i === i); return hc && hc.h ? `<p class="calc"><b>Table 4:</b> ${hc.air != null ? hc.air + " %" : hc.h.t4 ? "–" : "from the head's own manual"}<br><small>${esc(hc.airWorking)}</small></p>` : ""; },
      fields: [F(p + "air", "Air value entered on the BU-M", "num", { unit: "%", req: true })] },
    { id: `h${i}-lma`, group: `Head ${i}`, title: `Head ${i} – LMA check`, step: "4 of 7",
      intro: "Run over the sound section again. The LMA reading must be 0 ± 0.5 %.",
      fields: [F(p + "lma", "LMA check on the sound section", "snum", { unit: "%", req: true }),
        F(p + "lmaneg", "Most negative LMA seen (optional)", "snum", { unit: "%", hint: "only if a negative LMA showed" })] },
    { id: `h${i}-lf`, group: `Head ${i}`, title: `Head ${i} – LF calibration`, step: "5 of 7",
      intro: "Calibrate LF on a known broken wire, or two added wires with a gap of 1–3 wire diameters.",
      fields: [F(p + "lfm", "LF calibrated on", "radio", { opts: K.LF_METHODS, req: true }),
        F(p + "lfwd", "Wire diameter", "num", { unit: "mm", req: true, show: (r) => r[p + "lfm"] && r[p + "lfm"] !== K.LF_METHODS[2] }),
        F(p + "lfgap", "Gap", "num", { unit: "mm", req: true, show: (r) => r[p + "lfm"] && r[p + "lfm"] !== K.LF_METHODS[2] })] },
    { id: `h${i}-sig`, group: `Head ${i}`, title: `Head ${i} – one-wire LF signal`, step: "6 of 7",
      intro: "Read the LF signal of the one wire.",
      fields: [F(p + "sig", "One-wire LF signal", "num", { unit: "mV", req: (r) => r[p + "lfm"] !== K.LF_METHODS[2] })] },
    { id: `h${i}-thr`, group: `Head ${i}`, title: `Head ${i} – LF threshold`, step: "7 of 7",
      intro: "Set the LF threshold to the one-wire signal. The alarm is optional.",
      live: (r) => (r[p + "sig"] ? `<p class="calc"><b>Threshold to set:</b> ${esc(r[p + "sig"])} mV (the one-wire signal)</p>` : ""),
      fields: [F(p + "thr", "LF threshold set", "num", { unit: "mV", req: (r) => r[p + "lfm"] !== K.LF_METHODS[2] }),
        F(p + "alarm", "LF alarm (optional)", "num", { unit: "mV", hint: "blank = not set" }),
        ...(i === 1 ? [F("h2on", "Calibrate a second head on this rope?", "radio", { opts: ["no", "yes"], labels: ["No", "Yes"], req: true })] : [])] },
  ];
}

const SCREENS = (r) => [
  { id: "job", group: "Job", title: "Job", intro: "Choose the job type, then the job details.",
    fields: [
      F("type", "Job type", "radio", { opts: ["site", "reference"], labels: ["Site rope", "Reference rope"], req: true }),
      F("ref", "Reference rope number", "text", { req: true, show: isRef, hint: "e.g. AIC-RR-48-01" }),
      F("jobno", "Job order no.", "text", { req: (x) => !isRef(x) }),
      F("client", "Client", "text"),
      F("position", "Crane / rope position", "text", { req: (x) => !isRef(x), hint: "e.g. crane no., main hoist" }),
      F("date", "Date", "date", { req: true }),
      F("engineer", "Engineer", "text", { req: true }),
      F("location", "Location", "text"),
      F("length", "Rope length", "num", { unit: "m", hint: blankHint }),
    ] },
  { id: "rope", group: "Rope", title: "Rope data", intro: "Diameters with the caliper at two places 90° apart. Leave a box blank when the value is not available – never type 0.",
    fields: [
      F("dnom", "Nominal diameter", "num", { unit: "mm", req: true }),
      F("d1", "Measured diameter, reading 1", "num", { unit: "mm", req: true }),
      F("d2", "Measured diameter, reading 2 (at 90°)", "num", { unit: "mm" }),
      F("construction", "Construction (as on the certificate)", "text", { req: true, hint: "e.g. 6x36 IWRC, 35(W)x7" }),
      F("annexh", "ISO 4309 Annex H construction", "select", { opts: [...K.ANNEX_H_CHOICES, K.ANNEX_OTHER], req: true, hint: "for the RCN" }),
      F("ropetype", "Rope type", "select", { opts: K.ROPE_TYPES, req: true, show: (x) => x.annexh === K.ANNEX_OTHER }),
      F("seale", "Seale outer strands, 19 wires or fewer?", "radio", { opts: ["no", "yes"], labels: ["No", "Yes"], show: (x) => x.annexh === K.ANNEX_OTHER && x.ropetype === K.ROPE_TYPES[0] }),
      F("core", "Core", "select", { opts: K.CORES, req: true }),
      F("outer", "Outer strands", "int", { req: (x) => x.annexh === K.ANNEX_OTHER }),
      F("wires", "Load-bearing wires per outer strand", "int", { hint: "no filler wires", req: (x) => x.annexh === K.ANNEX_OTHER }),
      F("lay", "Lay", "radio", { opts: K.LAYS, req: true }),
      F("runs", "How the rope runs", "radio", { opts: K.RUNS, req: true }),
      F("asrc", "Metallic area A – source", "select", { opts: K.A_SOURCES, req: true }),
      F("isoclass", "ISO 2408 class (for the C factor)", "select", { opts: [...K.ISO_CLASSES, K.ISO_NONE], req: (x) => x.asrc === K.A_SOURCES[2] }),
      F("a", "Metallic area A", "num", { unit: "mm²", req: (x) => x.asrc === K.A_SOURCES[0] || x.asrc === K.A_SOURCES[1], show: (x) => x.asrc === K.A_SOURCES[0] || x.asrc === K.A_SOURCES[1] }),
      F("dmaxsrc", "Largest wire δmax – source", "select", { opts: K.DMAX_SOURCES, req: true }),
      F("dmax", "Largest wire δmax", "num", { unit: "mm", req: (x) => x.dmaxsrc && x.dmaxsrc !== K.DMAX_SOURCES[2], show: (x) => x.dmaxsrc && x.dmaxsrc !== K.DMAX_SOURCES[2] }),
    ],
    live: (x, c) => (x.asrc === K.A_SOURCES[2] ? `<p class="calc"><b>A from ISO 2408:</b> ${c.Aiso != null ? c.Aiso + " mm²" : "–"}<br><small>${esc(c.iso.ok ? `C × d² = ${c.iso.C.toFixed(3)} × ${c.dn}²` : c.iso.why)}</small></p>` : "") },
  { id: "results", group: "Results", title: "Calculated for this rope", intro: "Worked out from the rope data. Check the working before calibrating.", results: true, fields: [] },
  ...headScreens(1),
  ...(r.h2on === "yes" ? headScreens(2) : []),
  ...(isRef(r) ? [{ id: "sections", group: "Sections", title: "Reference rope sections", intro: "Measure every distance from the datum in one direction. No minus signs.",
    fields: [F("datum", "Datum ('0') is at", "text", { req: true, hint: "e.g. taped end nearest the slings" }),
      ...K.SECTIONS.flatMap((s) => [F(`${s}_from`, `Section ${s} from`, "num", { unit: "m", req: s === "A", group: s }), F(`${s}_to`, `Section ${s} to`, "num", { unit: "m", req: s === "A", group: s }),
        F(`${s}_w`, `Section ${s} wires cut`, "int", { req: s === "A", group: s }), F(`${s}_gap`, `Section ${s} gap`, "num", { unit: "mm", group: s })])] }] : []),
  { id: "finish", group: "Save", title: "Mistakes, sign-off and save", finish: true,
    fields: [F("counted", "Counted by", "text"), F("checked", "Checked by", "text"), F("notes", "Notes", "textarea")] },
];

// ---------- state ----------
let rec = null;          // the record being filled in
let screens = [], cur = 0;
let records = [];
const load = (k, d) => { try { const x = JSON.parse(localStorage.getItem(k) || "null"); return x ?? d; } catch { return d; } };
const keep = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } };
const saveDraft = () => { if (rec) keep(DRAFT, { rec, cur }); };

const shown = (f) => !f.show || f.show(rec);
const required = (f) => shown(f) && (typeof f.req === "function" ? f.req(rec) : !!f.req);
const missing = (s) => s.fields.filter((f) => required(f) && String(rec[f.id] ?? "").trim() === "").map((f) => f.label);
const stepDone = (i) => missing(screens[i]).length === 0;

// ---------- drawing ----------
function input(f) {
  const v = rec[f.id] ?? "";
  const unit = f.unit ? `<span class="unit">${esc(f.unit)}</span>` : "";
  const hint = f.hint ? `<small>${esc(f.hint)}</small>` : "";
  const star = required(f) ? ' <i class="req">required</i>' : "";
  const lab = `<span class="lab">${esc(f.label)}${star}</span>${hint}`;
  if (f.kind === "radio") {
    return `<fieldset class="radio" data-f="${f.id}"><legend>${esc(f.label)}${star}</legend>${f.opts.map((o, k) =>
      `<label class="opt"><input type="radio" name="${f.id}" value="${esc(o)}" ${v === o ? "checked" : ""}><span>${esc(f.labels ? f.labels[k] : o)}</span></label>`).join("")}</fieldset>`;
  }
  if (f.kind === "select" || f.kind === "liner") {
    let opts = f.opts;
    if (f.kind === "liner") {
      const h = K.headOf(rec[`h${f.head}_head`]);
      opts = h ? h.liners.map((l) => l.name) : [];
      const hc = K.compute(rec).heads.find((x) => x.i === f.head);
      const prop = hc && hc.liner ? `<small class="ok">Proposed: <b>${esc(hc.liner)}</b> – ${esc(hc.linerWorking)}</small>` : hc && hc.h ? `<small>${esc(hc.linerWorking)}</small>` : "<small>pick the head first</small>";
      return `<label class="f">${lab}${prop}<select id="${f.id}"><option value="">– choose –</option>${opts.map((o) => `<option ${v === o ? "selected" : ""}>${esc(o)}</option>`).join("")}</select></label>`;
    }
    return `<label class="f">${lab}<select id="${f.id}"><option value="">– choose –</option>${opts.map((o) => `<option ${v === o ? "selected" : ""}>${esc(o)}</option>`).join("")}</select></label>`;
  }
  if (f.kind === "textarea") return `<label class="f">${lab}<textarea id="${f.id}" rows="4">${esc(v)}</textarea></label>`;
  const attrs = { num: 'type="text" inputmode="decimal" autocomplete="off"', snum: 'type="text" inputmode="decimal" autocomplete="off"', int: 'type="text" inputmode="numeric" autocomplete="off"', date: 'type="date"', text: 'type="text" autocomplete="off"' }[f.kind];
  return `<label class="f">${lab}<span class="in">${f.kind === "snum" ? `<button type="button" class="neg" data-neg="${f.id}" aria-label="plus or minus">±</button>` : ""}<input id="${f.id}" ${attrs} value="${esc(v)}">${unit}</span></label>`;
}

function resultsHTML(c) {
  return `<table class="work">${c.working.map(([a, b, w]) => `<tr><th>${esc(a)}</th><td><b>${esc(b)}</b>${w ? `<small>${esc(w)}</small>` : ""}</td></tr>`).join("")}</table>
  <p class="note">ISO 2408 and ISO 4309 figures are as keyed for Acumen's MRT software and are provisional until checked against the printed pages. Air values: Intron manual v1.3 Table 4 (MH 6-26 / 22-45 / 40-70); MH 20-40, MH 40-64 and MH 80-120 use their own manual.</p>`;
}

function checkList(list, withReasons) {
  if (!list.length) return "";
  return `<ul class="checks">${list.map((x) => `<li class="${x.level}"><span>${x.level === "red" ? "Mistake" : "Warning"}: ${esc(x.text)}</span>${withReasons && x.level === "red"
    ? `<button type="button" class="fix" data-fix="${esc(x.screen)}">Go to the screen to fix it</button><label class="f reason">or the reason it stands (saved with the record)<textarea data-reason="${esc(x.id)}" rows="2">${esc((rec.reasons || {})[x.id] || "")}</textarea></label>` : ""}</li>`).join("")}</ul>`;
}

function drawLive() {
  const s = screens[cur], c = K.compute(rec), all = K.checks(rec, c);
  const here = s.finish ? all : all.filter((x) => x.screen === s.id || (s.results && x.screen === "results"));
  let html = "";
  if (s.live) html += s.live(rec, c);
  if (s.results) html += resultsHTML(c);
  if (s.finish) {
    const open = K.unresolved(all, rec.reasons);
    html += all.length ? `<h3>${all.filter((x) => x.level === "red").length} mistake(s), ${all.filter((x) => x.level === "warn").length} warning(s)</h3>
      <p class="note">Fix each mistake on its screen, or type the reason it stands. Every reason is saved in the CSV.</p>${checkList(all, true)}`
      : `<p class="okbox">No mistakes found.</p>`;
    html += open.length ? `<p class="stop">${open.length} mistake(s) still need fixing or a reason before saving.</p>` : "";
  } else {
    html += checkList(here, false);
    if (here.some((x) => x.level === "red")) html += `<p class="note">Fix it now, or give the reason on the last screen.</p>`;
  }
  $("#live").innerHTML = html;
  $("#live").querySelectorAll("[data-fix]").forEach((bt) => bt.addEventListener("click", () => {
    const i = screens.findIndex((x) => x.id === bt.dataset.fix); if (i >= 0) { cur = i; draw(); scrollTo(0, 0); }
  }));
  // reasons
  $("#live").querySelectorAll("textarea[data-reason]").forEach((t) => t.addEventListener("input", () => {
    rec.reasons = rec.reasons || {}; rec.reasons[t.dataset.reason] = t.value; saveDraft(); drawBar();
  }));
  drawBar();
}

function drawBar() {
  const s = screens[cur];
  $("#back").disabled = cur === 0;
  const miss = missing(s);
  if (s.finish) {
    $("#next").hidden = true; $("#save").hidden = false; $("#share").hidden = false;
    const open = K.unresolved(K.checks(rec), rec.reasons), notDone = screens.findIndex((_, i) => !stepDone(i));
    const blocked = open.length > 0 || notDone >= 0;
    $("#save").disabled = blocked; $("#share").disabled = blocked;
    $("#need").textContent = notDone >= 0 ? `Not finished: ${screens[notDone].title}` : open.length ? `${open.length} mistake(s) need a fix or a reason` : "";
  } else {
    $("#next").hidden = false; $("#save").hidden = true; $("#share").hidden = true;
    $("#next").disabled = miss.length > 0;
    $("#need").textContent = miss.length ? `Still needed: ${miss.join(", ")}` : "";
  }
}

function drawSteps() {
  const reach = rec.reach ?? 0;
  $("#steps").innerHTML = screens.map((s, i) => `<button type="button" class="chip ${i === cur ? "on" : ""} ${i < reach ? "done" : ""}" data-go="${i}" ${i > reach ? "disabled" : ""}>${i + 1}. ${esc(s.group === s.title ? s.title : s.title.replace(/^Head \d – /, ""))}</button>`).join("");
  const on = $("#steps .on"); if (on) on.scrollIntoView({ block: "nearest", inline: "center" });
}

function draw() {
  screens = SCREENS(rec);
  if (cur >= screens.length) cur = screens.length - 1;
  const s = screens[cur];
  $("#home").hidden = true; $("#form").hidden = false; $("#bar").hidden = false;
  $("#where").textContent = `${s.group}${s.step ? " · step " + s.step : ""} · screen ${cur + 1} of ${screens.length}`;
  $("#title").textContent = s.title;
  $("#intro").textContent = s.intro || "";
  let fields = "", lastGroup = null;
  for (const f of s.fields.filter(shown)) {
    if (f.group && f.group !== lastGroup) { if (lastGroup) fields += "</div>"; fields += `<div class="sec"><h3>Section ${f.group}</h3>`; lastGroup = f.group; }
    fields += input(f);
  }
  if (lastGroup) fields += "</div>";
  $("#fields").innerHTML = fields;
  drawSteps(); drawLive(); saveDraft();
}

// ---------- events ----------
$("#fields").addEventListener("input", (e) => {
  const t = e.target;
  if (t.matches("input[type=radio]")) return;
  if (!t.id) return;
  rec[t.id] = t.value;
  saveDraft(); drawLive();
});
$("#fields").addEventListener("change", (e) => {
  const t = e.target;
  if (t.matches("input[type=radio]")) rec[t.name] = t.value;
  else if (t.id) rec[t.id] = t.value;
  if (t.matches("select, input[type=radio]")) {
    // a new head proposes its liner
    const m = (t.id || "").match(/^h(\d)_head$/);
    if (m) { const hc = K.compute(rec).heads.find((x) => x.i === +m[1]); rec[`h${m[1]}_liner`] = hc && hc.liner ? hc.liner : ""; }
    draw();
  } else { saveDraft(); drawLive(); }
});
$("#fields").addEventListener("click", (e) => {
  const b = e.target.closest("[data-neg]"); if (!b) return;
  const inp = document.getElementById(b.dataset.neg); const v = inp.value.trim();
  inp.value = v.startsWith("-") ? v.slice(1) : "-" + v; rec[inp.id] = inp.value; saveDraft(); drawLive(); inp.focus();
});
$("#steps").addEventListener("click", (e) => { const b = e.target.closest("[data-go]"); if (!b || b.disabled) return; cur = +b.dataset.go; draw(); scrollTo(0, 0); });
$("#back").addEventListener("click", () => { if (cur > 0) { cur--; draw(); scrollTo(0, 0); } });
$("#next").addEventListener("click", () => {
  if (missing(screens[cur]).length) return;
  cur++; rec.reach = Math.max(rec.reach ?? 0, cur); draw(); scrollTo(0, 0);
});
$("#menu").addEventListener("click", () => { saveDraft(); home(); });

// ---------- save, download, share ----------
function download(name, text) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const u = URL.createObjectURL(blob), a = document.createElement("a");
  a.href = u; a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(u); a.remove(); }, 1500);
}
async function share(name, text, title) {
  const file = new File([text], name, { type: "text/csv" });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title, text: title }); return "shared"; }
    catch (e) { if (e && e.name === "AbortError") return "cancelled"; }
  }
  download(name, text); return "downloaded";
}
function store(r) {
  const now = new Date();
  r.savedAt = now.toISOString(); r.appVersion = `${V.version} (${V.date})`;
  if (!r.id) r.id = (K.fileName(r, now).replace(/\.csv$/, "")) + "-" + now.getTime();
  const i = records.findIndex((x) => x.id === r.id);
  if (i >= 0) records[i] = structuredClone(r); else records.unshift(structuredClone(r));
  const ok = keep(STORE, records);
  return { name: K.fileName(r, now), replaced: i >= 0, ok };
}
function finishMsg(t) { $("#msg").textContent = t; $("#msg").hidden = false; $("#msg").scrollIntoView({ block: "center", behavior: "smooth" }); }
$("#save").addEventListener("click", () => {
  const s = store(rec); download(s.name, K.csvOf([rec])); saveDraft();
  finishMsg(`Saved on this phone${s.replaced ? " (the earlier copy was replaced)" : ""} and ${s.name} downloaded.${s.ok ? "" : " WARNING: the phone's storage refused the copy – keep the CSV."}`);
});
$("#share").addEventListener("click", async () => {
  const s = store(rec); saveDraft();
  const how = await share(s.name, K.csvOf([rec]), `Rope record ${s.name}`);
  finishMsg(`Saved on this phone${s.replaced ? " (the earlier copy was replaced)" : ""}. ${how === "shared" ? "CSV sent to the share sheet." : how === "cancelled" ? "Sharing cancelled." : "Sharing is not available here – the CSV was downloaded instead."}`);
});

// ---------- home ----------
function newRecord(type) {
  rec = { type, date: today(), h2on: "", reasons: {}, reach: 0 };
  cur = 0; $("#msg").hidden = true; draw(); scrollTo(0, 0);
}
function home() {
  $("#home").hidden = false; $("#form").hidden = true; $("#bar").hidden = true; $("#msg").hidden = true;
  $("#where").textContent = "Acumen MRT";
  let d = load(DRAFT, null);
  // a draft that is the same as its saved copy is not offered again
  const strip = (r) => JSON.stringify({ ...r, reach: 0, savedAt: 0 });
  if (d && d.rec && d.rec.id) { const s = records.find((x) => x.id === d.rec.id); if (s && strip(s) === strip(d.rec)) d = null; }
  $("#cont").hidden = !(d && d.rec);
  if (d && d.rec) $("#cont").textContent = `Continue: ${d.rec.type === "reference" ? d.rec.ref || "reference rope" : [d.rec.jobno, d.rec.position].filter(Boolean).join(" – ") || "site rope"}`;
  $("#list").innerHTML = records.length ? records.map((r, i) => `<li><div><b>${esc(r.type === "reference" ? r.ref : [r.jobno, r.position].filter(Boolean).join(" – "))}</b>
    <small>${esc(r.type === "reference" ? "Reference rope" : "Site rope")} · ${esc(r.date)} · ${esc(r.engineer)} · ${esc(r.dnom)} mm</small></div>
    <span class="rb"><button type="button" data-edit="${i}">Edit</button><button type="button" data-csv="${i}">CSV</button><button type="button" data-share="${i}">Share</button></span></li>`).join("")
    : "<li class='none'>No records on this phone yet.</li>";
  $("#all").hidden = !records.length;
  scrollTo(0, 0);
}
$("#newsite").addEventListener("click", () => newRecord("site"));
$("#newref").addEventListener("click", () => newRecord("reference"));
$("#cont").addEventListener("click", () => { const d = load(DRAFT, null); if (!d) return; rec = d.rec; cur = d.cur || 0; draw(); });
$("#list").addEventListener("click", async (e) => {
  const b = e.target.closest("button"); if (!b) return;
  const r = records[+(b.dataset.edit ?? b.dataset.csv ?? b.dataset.share)];
  if (b.dataset.edit != null) { rec = structuredClone(r); screens = SCREENS(rec); rec.reach = screens.length - 1; cur = 0; draw(); finishMsg(`Editing ${b.closest("li").querySelector("b").textContent}. Save again to replace the stored copy.`); }
  if (b.dataset.csv != null) download(K.fileName(r, new Date(r.savedAt)), K.csvOf([r]));
  if (b.dataset.share != null) await share(K.fileName(r, new Date(r.savedAt)), K.csvOf([r]), "Rope record");
});
const allName = () => `rope-records_${today()}.csv`;
$("#allcsv").addEventListener("click", () => download(allName(), K.csvOf(records)));
$("#allshare").addEventListener("click", () => share(allName(), K.csvOf(records), "Rope records"));

// ---------- install ----------
let deferred = null;
addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e; $("#install").hidden = false; });
$("#install").addEventListener("click", async () => { if (!deferred) return; deferred.prompt(); await deferred.userChoice; deferred = null; $("#install").hidden = true; });
addEventListener("appinstalled", () => { $("#install").hidden = true; });

// ---------- start ----------
$("#ver").textContent = `Rope Record version ${V.version} · ${V.date}`;
records = load(STORE, []);
if (!Array.isArray(records)) records = [];
home();
if ("serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
