// Rope Record Checklist - the set-up calculator, the screen that opens first. Rules and figures are in calc.js (calculator()).
// 1.7.0 (owner's block 27-Nov-2026): one flow - the calculator's answers start the record ("Start the record" buttons);
// construction list + free text; the class, core and construction details filled from it; two area boxes labelled by
// source; 6d and 30d each in its own box; LF route 4 (clean section); breaking force labelled by source; optional
// estimated δmax; maker's figures kept offline (makers.json) with "Use these figures" / "Not this rope".
// 1.8.0 (owner's block 27-Nov-2026): RCN as in the full record (Annex H, or "Other - use the counts"); the rope's standard
// ("made to"); boxes (a) MRT Table C.1 and (b) visible broken wires Table 3 / 4 side by side, never merged.
import * as K from "./calc.js";

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const inp = { d: "", ckey: "", construction: "", cls: "", core: "", maker: "", head: "", asrc: "", a: "", wsrc: "", w: "", dmaxEst: "",
  aRef: "", bf: "", bfMaker: "", bfMakerRef: "", grade: "", bfUsed: "", route: "", airIn: "", zero: "", addW: "", csFrom: "", csTo: "", csMv: "", sigEst: "",
  madeto: "", annexh: "", ropetype: "", outer: "", wires: "", seale: "", lay: "" };
const auto = {};          // values filled in from the construction (rule 1): kept while the engineer has not changed them
let notThis = "";          // "Not this rope": the maker card stays closed for this maker / d / construction

const num = (id, label, unit, hint = "") => `<label class="f"><span class="lab">${esc(label)}</span>${hint ? `<small>${esc(hint)}</small>` : ""}
  <span class="in"><input id="c_${id}" data-k="${id}" type="text" inputmode="decimal" autocomplete="off" value="${esc(inp[id])}">${unit ? `<span class="unit">${esc(unit)}</span>` : ""}</span></label>`;
const txt = (id, label, hint = "", list = "") => `<label class="f"><span class="lab">${esc(label)}</span>${hint ? `<small>${esc(hint)}</small>` : ""}
  <span class="in"><input id="c_${id}" data-k="${id}" type="text" autocomplete="off" ${list ? `list="${list}"` : ""} value="${esc(inp[id])}"></span></label>`;
const optHtml = (o, v) => { const val = typeof o === "object" ? o.value : o, lab = typeof o === "object" ? o.label : o; return `<option value="${esc(val)}" ${v === val ? "selected" : ""}>${esc(lab)}</option>`; };
const sel = (id, label, opts, hint = "") => `<label class="f"><span class="lab">${esc(label)}</span>${hint ? `<small>${esc(hint)}</small>` : ""}<select id="c_${id}" data-k="${id}"><option value="">– choose –</option>
  ${opts.map((o) => optHtml(o, inp[id])).join("")}</select></label>`;
const radio = (id, label, opts, vals = opts) => `<fieldset class="radio"><legend>${esc(label)}</legend>${opts.map((o, k) =>
  `<label class="opt"><input type="radio" name="c_${id}" data-k="${id}" value="${esc(vals[k])}" ${String(inp[id]) === String(vals[k]) ? "checked" : ""}><span>${esc(o)}</span></label>`).join("")}</fieldset>`;
const tick = (id, label) => `<label class="opt tick"><input type="checkbox" data-k="${id}" ${inp[id] === "yes" ? "checked" : ""}><span>${esc(label)}</span></label>`;
const res = (n, title, value, text, src, cls = "") => `<div class="cres ${cls}"><h3>${n}. ${esc(title)}</h3>${value ? `<b>${esc(value)}</b>` : ""}
  ${text ? `<small>${esc(text)}</small>` : ""}${src ? `<i class="src">${esc(src)}</i>` : ""}</div>`;
const fill = (k) => (auto[k] != null && inp[k] === auto[k] ? ' <i class="filled">filled in</i>' : "");

// construction list grouped by ISO 2408 class
function constrSelect() {
  const groups = [];
  for (const e of K.CONSTRUCTIONS) { let g = groups.find((x) => x.cls === e.cls); if (!g) groups.push(g = { cls: e.cls, items: [] }); g.items.push(e); }
  return `<label class="f"><span class="lab">Construction</span><small>Pick it from the list, or "Other" and type the certificate's words</small><select id="c_ckey" data-k="ckey"><option value="">– choose –</option>
    ${groups.map((g) => `<optgroup label="Class ${esc(g.cls)}">${g.items.map((e) => optHtml({ value: e.key, label: e.key }, inp.ckey)).join("")}</optgroup>`).join("")}
    ${optHtml(K.CONSTR_OTHER, inp.ckey)}</select></label>`;
}

function inputs(r) {
  const other = inp.ckey === K.CONSTR_OTHER || !inp.ckey;
  const pn = r.parsed && r.parsed.note ? `<p class="cnote">${esc(r.parsed.note)}</p>` : "";
  const bfu = r.bfFig.figs.map((f) => f.source);
  return `
  ${num("d", "Nominal rope diameter", "mm")}
  ${constrSelect()}
  ${other ? txt("construction", "Construction as on the certificate", "e.g. 6x19 IWRC, 35(W)x7") : ""}${pn}
  <label class="f"><span class="lab">ISO 2408 class${fill("cls")}</span><small>filled in from the construction – what each class holds is in the list</small><select id="c_cls" data-k="cls"><option value="">– choose –</option>
    ${[...K.ISO_CLASS_OPTS, { value: K.ISO_NONE, label: K.ISO_NONE }].map((o) => optHtml(o, inp.cls)).join("")}</select></label>
  <label class="f"><span class="lab">Core${fill("core")}</span><select id="c_core" data-k="core"><option value="">– choose –</option>${K.CORES.map((o) => optHtml(o, inp.core)).join("")}</select></label>
  ${sel("madeto", "Rope made to (from the certificate)", K.MADE_TO, "the rope's own standard – decides whether an ISO 2408 factor may be used")}
  ${rcnInputs(r)}
  ${txt("maker", "Rope maker", "optional – the maker's figures on this phone are shown when they match", "makerList")}
  <datalist id="makerList">${K.makerNames().map((m) => `<option value="${esc(m)}">`).join("")}</datalist>
  ${makerCard(r)}
  ${sel("head", "Magnetic head", K.CALC_HEADS)}
  ${radio("asrc", "Metallic area A from", K.calcASources(inp.madeto))}${K.isoAllowed(inp.madeto) ? "" : `<p class="cnote">"Calculated" (ISO 2408) is not offered: the rope is made to ${esc(inp.madeto)}. With no certificate, maker's or written area, A is not known and broken wires are judged on (b) – ${esc(K.RULING_D1)}.</p>`}
  ${inp.asrc && inp.asrc !== "calculated" ? num("a", `Metallic area A from the ${inp.asrc}`, "mm²") : ""}
  ${radio("wsrc", "Outer wire diameter δmax from (documented)", K.CALC_W_SOURCES)}
  ${inp.wsrc ? num("w", "Outer wire diameter δmax", "mm", "leave blank if not available") : ""}
  ${tick("dmaxEst", `Also show ${K.DMAX_EST_LABEL} (optional – information only)`)}
  <div class="sec"><h3>Breaking force – each figure labelled by its source (optional)</h3>
  ${num("bf", "Breaking force – rope certificate", "kN")}
  ${num("bfMaker", "Breaking force – maker's data / manual", "kN", inp.bfMakerRef ? `from ${inp.bfMakerRef}` : "")}
  ${num("grade", "Rope grade", "N/mm²", "for the ISO 2408 figure, e.g. 1770, 1960, 2160")}
  ${bfu.length ? radio("bfUsed", "Figure used (engineer confirms)", bfu.map((s) => { const f = r.bfFig.figs.find((x) => x.source === s); return `${f.estimated ? K.ESTIMATED + " – " : ""}${s} – ${K.r1(f.kN, 1)} kN`; }), bfu) : ""}</div>`;
}

// RCN as in the full record (item 1): the Annex H construction, or "Other – use the counts".
function rcnInputs(r) {
  const other = inp.annexh === K.ANNEX_OTHER, v = r.vis;
  const t3 = v.ok ? v.table === 3 : other && inp.ropetype === K.ROPE_TYPES[0];
  return `<div class="sec"><h3>RCN – ISO 4309 Annex H</h3>
  <label class="f"><span class="lab">ISO 4309 Annex H construction${fill("annexh")}</span><small>or "Other" and give the counts</small><select id="c_annexh" data-k="annexh"><option value="">– choose –</option>
    ${[...K.ANNEX_H_CHOICES, K.ANNEX_OTHER].map((o) => optHtml(o, inp.annexh)).join("")}</select></label>
  ${other ? `<label class="f"><span class="lab">Rope type${fill("ropetype")}</span><select id="c_ropetype" data-k="ropetype"><option value="">– choose –</option>${K.ROPE_TYPES.map((o) => optHtml(o, inp.ropetype)).join("")}</select></label>
    ${num("outer", "Number of outer strands", "")}
    ${num("wires", "Load-bearing wires per outer strand", "", "fillers left out")}
    ${radio("seale", "Seale outer strands, 19 wires or fewer?", ["yes", "no"])}` : ""}
  ${t3 || !v.ok ? radio("lay", "Lay (Table 3: ordinary / Lang column)", K.LAYS) : ""}
  <p class="cnote">${esc(v.ok ? `n and RCN: ${v.how}` : v.why)}</p></div>`;
}

function makerCard(r) {
  const key = `${inp.maker}|${inp.d}|${inp.construction}|${inp.cls}`;
  const search = inp.maker.trim() ? `<a class="btnlink" href="${esc(K.makerSearchUrl({ maker: inp.maker, construction: inp.construction, d: inp.d }))}" target="_blank" rel="noopener">Search the maker's site</a>` : "";
  if (!inp.maker.trim()) return "";
  if (notThis === key || !r.makers.length) return `<div class="mcard none"><small>${notThis === key ? "Not this rope – maker's figures not used." : "No maker's figures on this phone for this maker, diameter and construction – take them from the certificate or ask the office."}</small>${search}</div>`;
  const e0 = r.makers[0];
  return `<div class="mcard"><b>Maker's figures: ${esc(e0.maker)} ${esc(e0.d)} mm</b>
    <small>Suggestion only – the engineer accepts or rejects it. A figure used from here is labelled ${K.ESTIMATED} (not the rope's certificate). A: ${e0.A_mm2 != null ? `${esc(e0.A_mm2)} mm² (${esc(e0.A_basis || "maker")})` : "not given by the maker"}.${e0.n_outer_wires ? ` Outer strands ${esc(e0.outer_strands)}, load-bearing outer wires n = ${esc(e0.n_outer_wires)} (${esc(e0.n_basis || "maker")}).` : ""}</small>
    ${[...new Set(r.makers.map((e) => `${e.product}|${e.page}`))].map((g) => { const rows = r.makers.map((e, i) => [e, i]).filter(([e]) => `${e.product}|${e.page}` === g), e1 = rows[0][0];
      return `<div class="mgrp"><b>${esc(e1.product)}</b><small>${esc(e1.class ? "ISO 2408 class " + e1.class : e1.construction)} · ${esc(e1.document)}, p. ${esc(e1.page)}, read ${esc(e1.date_read)}${e1.note ? " · " + esc(e1.note) : ""}</small>
      <table class="mtab">${rows.map(([e, i]) => `<tr><td>${esc(e.grade)}</td><td><b>${esc(K.r1(e.MBF_kN, 1))} kN</b></td><td><button type="button" class="ovr" data-use="${i}">Use these figures</button></td></tr>`).join("")}</table></div>`; }).join("")}
    <div class="row"><button type="button" class="ovr" data-notthis="1">Not this rope</button>${search}</div></div>`;
}

function results(r) {
  const air = r.air;
  const est = air.estimate ? `<span class="est">estimate - air value only, not reported</span>` : "";
  const nextB = air.next ? `<span class="nextb">Next band: ${air.next.value} % (${air.next.from}–${air.next.to} mm²)</span>` : "";
  const airBox = `<div class="big ${air.value == null || air.estimate ? "amber" : ""}${air.estimate && air.value != null ? " estv" : ""}"><small>2. Air value to enter for ${esc(r.head || "the head")}</small>${est}<b>${esc(air.value != null ? air.value + " %" : air.own ? K.OWN_MANUAL : "–")}</b>${nextB}
    <small>${esc(air.text)}</small>${air.src ? `<i class="src">${esc(air.src)}</i>` : ""}</div>
    <div class="cback">${num("airIn", "Air value you entered", "%")}${num("zero", "Then the zero reading (0 ± 0.5 %)", "%", "on the zero (sound) section")}<i class="src">PRO-AIC-0608 C4</i></div>`;
  const lr = r.lfRule, rt = r.route;
  let route = `<div class="cres"><h3>5. LF calibration route</h3>${radio("route", "Route used", K.LF_ROUTES.map((t, k) => `${k + 1} · ${t}`), [1, 2, 3, 4])}
    <div class="simopt">${radio("route", "Separate option", [K.LF_SIM], ["sim"])}</div>`;
  if (rt) {
    route += `<div class="${rt.warn ? "cwarnbox" : "calc"}"><b>Used: ${esc(rt.label)} – ${esc(rt.title)}</b><small>${esc(rt.text)}</small>${rt.note ? `<small>${esc(rt.note)}</small>` : ""}`;
    if (rt.n === "sim") route += num("addW", "Added wire diameter (caliper)", "mm") + (rt.gap ? `<small>Gap between the wire ends: ${K.r1(rt.gap[0], 2)} to ${K.r1(rt.gap[1], 2)} mm.${rt.share != null ? ` One added wire = ${K.r1(rt.share, 2)} % of A.` : ""}</small>` : "");
    if (rt.n === 4) route += `<small><b>${esc(rt.rule)}</b></small>` + num("csFrom", "Clean section from", "m") + num("csTo", "Clean section to", "m") + num("csMv", "Highest LF reading on it (two passes)", "mV")
      + (rt.thr ? `<b class="thr">${esc(rt.thr)}</b>` : "") + num("sigEst", "Estimated one-wire signal (optional)", "mV", "only if you record one – the wire count is then the pulse ÷ this; marked 'estimated'");
    route += `<i class="src">${esc(rt.src)}</i></div>`;
  }
  route += "</div>";
  const bf = r.bf, ff = r.bfFig;
  const bfLines = ff.figs.length ? ff.figs.map((f) => `${f.estimated ? K.ESTIMATED + " – " : ""}${f.source}: ${K.r1(f.kN, 1)} kN${ff.used === f ? " – USED" : ""}${f.working ? ` (${f.working})` : f.ref ? ` (${f.ref})` : ""}`).join(" · ") : "";
  const bfBox = res(7, "Breaking force – by source", ff.used ? `${K.r1(ff.used.kN, 1)} kN – ${ff.used.estimated ? K.ESTIMATED + " – " : ""}${ff.used.source}` : "",
    `${bfLines || "Enter the certificate or maker's figure, and the grade for the ISO 2408 figure."}${!ff.iso.value && (ff.cert || ff.maker || num0(inp.grade)) ? ` ISO 2408: ${ff.iso.why}` : ""}${bf && bf.ok ? ` Check: ${bf.amber ? "⚠ " + bf.amber.text + " " : ""}${bf.full}` : bf && !bf.ok && ff.cert ? ` ${bf.why}` : ""} Advice only – nothing is changed by the app.`,
    K.BF_SRC, bf && bf.amber ? "bfamber" : ff.figs.length ? "" : "none");
  const bfBoxN = r.bfNote ? bfBox.replace("</h3>", `</h3><p class="infotag">ℹ ${esc(r.bfNote)}</p>`) : bfBox;   // 1.8.1: beside the figures
  const dEst = r.dEst ? res("3b", K.DMAX_EST_LABEL, r.dEst.value != null ? `${r.dEst.value.toFixed(2)} mm – estimated` : "", r.dEst.value != null ? r.dEst.text : r.dEst.why, r.dEst.src || "", "estbox") : "";
  const len = (n, title, x) => res(n, title, x ? `${K.r1(x.l, n === "6a" ? 3 : 2)} m` : "", x ? x.text : "Needs the nominal diameter.", x && x.src);
  const m = r.mrt, v = r.vis;
  const boxA = `<div class="cres pbox${m.ok ? "" : " none"}"><h3>8a. ${esc(K.MRT_LABEL)}</h3>${m.ok ? `<b>${m.l6} / ${m.l30}</b><small class="clab">over 6d / over 30d${m.estimated ? ` – ${K.ESTIMATED}` : ""}</small>` : "<b>not given</b>"}
    <small>${esc(m.ok ? m.working : m.why + ".")}${r.lfFrom === "b" ? " The record's LF limit then comes from (b) (PRO-AIC-0608 A3, §9.2.2)." : ""}</small><i class="src">${esc(m.src)}</i></div>`;
  const boxB = `<div class="cres pbox${v.ok ? "" : " none"}"><h3>8b. ${esc(K.VIS_LABEL)}</h3>${v.ok ? `<small class="clab">${esc(K.VIS_SHEAVE)}</small>${v.sheave.map((x) => `<b>${x.lay ? esc(x.lay) + ": " : ""}${x.l6} / ${x.l30}</b>`).join("")}
    <small class="clab">${esc(K.VIS_DRUM)}</small><b>${v.drum.l6} / ${v.drum.l30}</b><small class="clab">over 6d / over 30d</small>` : "<b>not given</b>"}
    <small>${esc(v.ok ? `RCN ${v.rcnText} (Table ${v.table}). ${v.layNote ? v.layNote + ". " : ""}` : v.why)}</small><p class="cnote">${esc(K.VIS_NOTE)}</p><i class="src">${esc(v.src)}</i></div>`;
  return [
    res("1a", r.A.label, r.A.value != null ? `${K.r1(r.A.value)} mm²${r.A.estimated ? " – " + K.ESTIMATED : ""}` : "", r.A.text, r.A.src, r.A.estimated ? "estlab" : ""),
    res("1b", r.S.label, r.S.value != null ? `${K.r1(r.S.value, 0)} mm²` : "", r.S.text, r.S.src, r.A.value == null ? "" : "sub2"),
    airBox,
    res(3, "One outer wire as a percentage of A", r.wire.value != null ? `${K.r1(r.wire.value, 2)} % of A` : "", r.wire.text, r.wire.src, r.wire.value == null ? "none" : ""),
    dEst,
    lr ? res(4, "LF threshold rule for this head", "", `${lr.words}${lr.example ? " " + lr.example : ""}`, lr.src, lr.own ? "none" : "") : res(4, "LF threshold rule for this head", "", "Choose the head."),
    route,
    len("6a", "6d", r.len6), len("6b", "30d", r.len30),
    `<div class="pair">${boxA}${boxB}</div>`,
    bfBoxN,
  ].join("");
}
const num0 = (v) => K.num(v);

// Warnings bar: always on screen, one line ("3 warnings - tap to see"), red if any warning is red, otherwise amber.
let warnOpen = false, warnList = [];
function warnBar(list) {
  warnList = list;
  const el = $("#cWarn"), n = list.length;
  el.hidden = !n;
  if (!n) warnOpen = false;
  el.className = `cwarn ${list.some((x) => x.level === "red") ? "red" : "amber"}${warnOpen ? " open" : ""}`;
  el.innerHTML = `<button type="button" class="cwtog" aria-expanded="${warnOpen}">⚠ ${n} warning${n === 1 ? "" : "s"} - ${warnOpen ? "tap to close" : "tap to see"}</button>`
    + (warnOpen ? `<div class="cwlist">${list.map((x) => `<p class="${x.level}">⚠ ${esc(x.text)}<i class="src">${esc(x.src || "")}</i></p>`).join("")}</div>` : "");
}
$("#cWarn").addEventListener("click", (e) => { if (!e.target.closest(".cwtog")) return; warnOpen = !warnOpen; warnBar(warnList); });

// Filled in from the construction (rule 1): set when the box is empty or still holds the earlier filled-in value.
function autoFill() {
  const want = {};
  for (const [f, x] of Object.entries(K.autoValues({ ckey: inp.ckey, construction: inp.construction }))) {
    const k = f === "isoclass" ? "cls" : f;
    if (["cls", "core", "construction", "annexh", "ropetype", "outer", "wires", "seale"].includes(k)) want[k] = x.value;
  }
  if (inp.asrc === "calculated" && !K.isoAllowed(inp.madeto)) inp.asrc = "";
  for (const [k, v] of Object.entries(want)) {
    if (!v) continue;
    if (inp[k] === "" || inp[k] === auto[k]) { inp[k] = v; auto[k] = v; }
  }
  // the breaking force "used" must be one of the figures there now
  if (inp.bfUsed && !K.calculator(inp).bfFig.figs.some((f) => f.source === inp.bfUsed)) inp.bfUsed = "";
}

function draw(focusId) {
  autoFill();
  const r = K.calculator(inp);
  $("#cIn").innerHTML = inputs(r);
  $("#cOut").innerHTML = results(r);
  warnBar(r.warn);
  if (focusId) { const f = document.getElementById(focusId); if (f) { f.focus(); if (f.setSelectionRange) f.setSelectionRange(f.value.length, f.value.length); } }
}

// Typing redraws the results only (the box keeps its focus); a choice redraws the whole screen.
$("#calc").addEventListener("input", (e) => {
  const k = e.target.dataset.k; if (!k) return;
  inp[k] = e.target.type === "checkbox" ? (e.target.checked ? "yes" : "") : e.target.value;
  if (k === "ckey" && inp.ckey === K.CONSTR_OTHER && inp.construction === auto.construction) { inp.construction = ""; delete auto.construction; }
  if (e.target.type !== "text") return draw();
  autoFill();
  const r = K.calculator(inp), inOut = $("#cOut").contains(e.target), id = e.target.id;
  $("#cOut").innerHTML = results(r);
  warnBar(r.warn);
  if (inOut) { const f = document.getElementById(id); if (f) { f.focus(); f.setSelectionRange(f.value.length, f.value.length); } }
});
// leaving a typed box redraws the inputs too (filled-in class / core, maker card, breaking-force choice)
$("#calc").addEventListener("focusout", (e) => { if (e.target.dataset && e.target.dataset.k && e.target.type === "text" && $("#cIn").contains(e.target)) setTimeout(() => { if (!$("#cIn").contains(document.activeElement)) draw(); }, 0); });
$("#calc").addEventListener("click", (e) => {
  const u = e.target.closest("[data-use]");
  if (u) { const m = K.calculator(inp).makers[+u.dataset.use]; if (m) { inp.bfMaker = String(m.MBF_kN); inp.bfMakerRef = `${m.maker} ${m.product}, ${m.d} mm, ${m.grade}: ${m.document}, p. ${m.page}, read ${m.date_read}`; if (m.A_mm2 != null) { inp.asrc = K.CALC_A_SOURCES[1]; inp.a = String(m.A_mm2); inp.aRef = `${m.maker} ${m.product}, ${m.d} mm: ${m.A_basis || "metallic area"}; ${m.document}, p. ${m.page}, read ${m.date_read}`; }
    if (m.grade_n_mm2 && !inp.grade) inp.grade = String(m.grade_n_mm2);
    // 1.8.0 item 1: where the maker gives them, n and the outer strands (-> "Other - use the counts")
    if (m.n_outer_wires && m.outer_strands && Number.isInteger(m.n_outer_wires / m.outer_strands)) {
      inp.annexh = K.ANNEX_OTHER; inp.outer = String(m.outer_strands); inp.wires = String(m.n_outer_wires / m.outer_strands);
      if (m.rope_type) inp.ropetype = m.rope_type === "rotation-resistant" ? K.ROPE_TYPES[1] : K.ROPE_TYPES[0];
      if (m.seale === false) inp.seale = "no";
    }
    draw(); } return; }
  if (e.target.closest("[data-notthis]")) { notThis = `${inp.maker}|${inp.d}|${inp.construction}|${inp.cls}`; draw(); return; }
  const s = e.target.closest("[data-start]");
  if (s) document.dispatchEvent(new CustomEvent("rr:start", { detail: K.recordFromCalc(inp, s.dataset.start) }));
});

function showCalc() {
  for (const s of ["#home", "#about", "#form", "#qr"]) $(s).hidden = true;
  $("#bar").hidden = true; $("#calc").hidden = false; $("#probs").hidden = true;
  $(".banner").textContent = "Set-up calculator – not a report";
  scrollTo(0, 0);
}
function showRecords() {
  $("#calc").hidden = true; $("#home").hidden = false;
  $(".banner").textContent = "Site checklist – not a report";
  scrollTo(0, 0);
}
$("#toForm").addEventListener("click", showRecords);
$("#menu").addEventListener("click", () => { $("#calc").hidden = true; $(".banner").textContent = "Site checklist – not a report"; });
document.addEventListener("rr:calc", showCalc);
const back = document.createElement("button");
back.type = "button"; back.className = "wide p"; back.textContent = "Set-up calculator"; back.id = "toCalc";
back.addEventListener("click", showCalc);
$("#home").prepend(back);

// maker's figures kept offline (in the app's cache); none -> an empty list, the card says so
fetch("./makers.json").then((r) => (r.ok ? r.json() : null)).then((m) => { K.setMakers(m); draw(); }).catch(() => {});
draw();
showCalc();
