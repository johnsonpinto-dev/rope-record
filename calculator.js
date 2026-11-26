// Rope Record 1.4.0 (1.5.0: breaking-force check, construction note) - the set-up calculator, the screen that opens first. Rules and figures are in calc.js (calculator()).
// Nothing is saved: no job, no report number, no record. The full site record (app.js) is kept, set aside, behind a link.
import * as K from "./calc.js";

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const inp = { d: "", cls: "", core: "", head: "", asrc: "", a: "", wsrc: "", w: "", route: "", airIn: "", zero: "", addW: "", note: "", bf: "", grade: "" };

const num = (id, label, unit, hint = "") => `<label class="f"><span class="lab">${esc(label)}</span>${hint ? `<small>${esc(hint)}</small>` : ""}
  <span class="in"><input id="c_${id}" data-k="${id}" type="text" inputmode="decimal" autocomplete="off" value="${esc(inp[id])}"><span class="unit">${esc(unit)}</span></span></label>`;
const txt = (id, label, hint = "") => `<label class="f"><span class="lab">${esc(label)}</span>${hint ? `<small>${esc(hint)}</small>` : ""}
  <span class="in"><input id="c_${id}" data-k="${id}" type="text" autocomplete="off" value="${esc(inp[id])}"></span></label>`;
const sel = (id, label, opts) => `<label class="f"><span class="lab">${esc(label)}</span><select id="c_${id}" data-k="${id}"><option value="">– choose –</option>
  ${opts.map((o) => `<option ${inp[id] === o ? "selected" : ""}>${esc(o)}</option>`).join("")}</select></label>`;
const radio = (id, label, opts, vals = opts) => `<fieldset class="radio"><legend>${esc(label)}</legend>${opts.map((o, k) =>
  `<label class="opt"><input type="radio" name="c_${id}" data-k="${id}" value="${esc(vals[k])}" ${String(inp[id]) === String(vals[k]) ? "checked" : ""}><span>${esc(o)}</span></label>`).join("")}</fieldset>`;
const res = (n, title, value, text, src, cls = "") => `<div class="cres ${cls}"><h3>${n}. ${esc(title)}</h3>${value ? `<b>${esc(value)}</b>` : ""}
  ${text ? `<small>${esc(text)}</small>` : ""}${src ? `<i class="src">${esc(src)}</i>` : ""}</div>`;

function inputs() {
  return `
  ${num("d", "Nominal rope diameter", "mm")}
  ${sel("cls", "Construction class (ISO 2408 Table C.1 / C.2)", [...K.ISO_CLASSES, K.ISO_NONE])}
  ${txt("note", "Reason, if the class differs from the certificate", "e.g. certificate says 35W x 7; compacted per DSR catalogue, PowerFlex 35")}
  ${sel("core", "Core", K.CORES)}
  ${num("bf", "Breaking force on the certificate", "kN", "optional – with the grade, checked against ISO 2408 Fmin")}
  ${num("grade", "Rope grade", "N/mm²", "e.g. 1960, 2160")}
  ${sel("head", "Magnetic head", K.CALC_HEADS)}
  ${radio("asrc", "Metallic area A from", K.CALC_A_SOURCES)}
  ${inp.asrc && inp.asrc !== "calculated" ? num("a", `Metallic area A from the ${inp.asrc}`, "mm²") : ""}
  ${radio("wsrc", "Outer wire diameter from", K.CALC_W_SOURCES)}
  ${inp.wsrc ? num("w", "Outer wire diameter δ", "mm", "leave blank if not available – never estimated") : ""}`;
}

function results(r) {
  const air = r.air;
  const est = air.estimate ? `<span class="est">estimate - air value only, not reported</span>` : "";
  const nextB = air.next ? `<span class="nextb">Next band: ${air.next.value} % (${air.next.from}–${air.next.to} mm²)</span>` : "";
  const airBox = `<div class="big ${air.value == null || air.estimate ? "amber" : ""}${air.estimate && air.value != null ? " estv" : ""}"><small>2. Air value to enter for ${esc(r.head || "the head")}</small>${est}<b>${esc(air.value != null ? air.value + " %" : air.own ? K.OWN_MANUAL : "–")}</b>${nextB}
    <small>${esc(air.text)}</small>${air.src ? `<i class="src">${esc(air.src)}</i>` : ""}</div>
    <div class="cback">${num("airIn", "Air value you entered", "%")}${num("zero", "Then the zero reading (0 ± 0.5 %)", "%", "on the zero (sound) section")}<i class="src">PRO-AIC-0608 C4</i></div>`;
  const lr = r.lfRule;
  const rt = r.route;
  let route = `<div class="cres"><h3>5. LF calibration route</h3>${radio("route", "Route used", K.LF_ROUTES.map((t, k) => `${k + 1} · ${t}`), [1, 2, 3])}
    <div class="simopt">${radio("route", "Separate option", [K.LF_SIM], ["sim"])}</div>`;
  if (rt) {
    route += `<div class="${rt.warn ? "cwarnbox" : "calc"}"><b>Used: ${esc(rt.label)} – ${esc(rt.title)}</b><small>${esc(rt.text)}</small>${rt.note ? `<small>${esc(rt.note)}</small>` : ""}`;
    if (rt.n === "sim") route += num("addW", "Added wire diameter (caliper)", "mm") + (rt.gap ? `<small>Gap between the wire ends: ${K.r1(rt.gap[0], 2)} to ${K.r1(rt.gap[1], 2)} mm.${rt.share != null ? ` One added wire = ${K.r1(rt.share, 2)} % of A.` : ""}</small>` : "");
    route += `<i class="src">${esc(rt.src)}</i></div>`;
  }
  route += "</div>";
  const bf = r.bf;
  const bfBox = !bf ? res(7, "Breaking-force check (ISO 2408)", "", "Enter the certificate breaking force and the rope grade to compare them with the ISO 2408 minimum for the class and core chosen.", "", "none")
    : !bf.ok ? res(7, "Breaking-force check (ISO 2408)", "", bf.why, K.BF_SRC, "none")
    : res(7, "Breaking-force check (ISO 2408)", `Certificate ${K.r1(bf.bf, 1)} kN vs Fmin ${K.r1(bf.Fmin, 1)} kN`,
      `${bf.amber ? "⚠ " + bf.amber.text + " " : ""}${bf.full} Advice only – nothing is changed by the app.`, K.BF_SRC, bf.amber ? "bfamber" : "");
  const noteBox = r.note ? `<div class="cres sub"><small>Construction note: ${esc(r.note)}</small><i class="src">engineer</i></div>` : "";
  return [
    res(1, "Metallic area A", r.A.value != null ? `${K.r1(r.A.value)} mm²` : "", r.A.text, r.A.src) + noteBox,
    airBox,
    res(3, "One outer wire as a percentage of A", r.wire.value != null ? `${K.r1(r.wire.value, 2)} % of A` : "", r.wire.text, r.wire.src, r.wire.value == null ? "none" : ""),
    lr ? res(4, "LF threshold rule for this head", "", `${lr.words}${lr.example ? " " + lr.example : ""}`, lr.src, lr.own ? "none" : "") : res(4, "LF threshold rule for this head", "", "Choose the head."),
    route,
    res(6, "6d / 30d and broken-wire limits", r.len ? `${K.r1(r.len.l6, 3)} m / ${K.r1(r.len.l30, 2)} m` : "", r.len ? r.len.text : "Needs the nominal diameter.", r.len && r.len.src)
      + `<div class="cres sub">${r.lf.l6 != null ? `<b>${r.lf.l6} wires over 6d / ${r.lf.l30} over 30d</b>` : ""}<small>${esc(r.lf.text)}</small>${r.lf.src ? `<i class="src">${esc(r.lf.src)}</i>` : ""}</div>`,
    bfBox,
  ].join("");
}

// Warnings bar: always on screen, one line ("3 warnings - tap to see"), red if any warning is red, otherwise amber.
// Tap opens the full list, tap again closes it. Stays open or closed across redraws.
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

function draw(focusId) {
  const r = K.calculator(inp);
  $("#cIn").innerHTML = inputs();
  $("#cOut").innerHTML = results(r);
  warnBar(r.warn);
  if (focusId) { const f = document.getElementById(focusId); if (f) { f.focus(); if (f.setSelectionRange) f.setSelectionRange(f.value.length, f.value.length); } }
}

// Typing redraws the results only (the box keeps its focus); a choice redraws the whole screen.
$("#calc").addEventListener("input", (e) => {
  const k = e.target.dataset.k; if (!k) return;
  inp[k] = e.target.value;
  if (e.target.type !== "text") return draw();
  const r = K.calculator(inp), inOut = $("#cOut").contains(e.target), id = e.target.id;
  $("#cOut").innerHTML = results(r);
  warnBar(r.warn);
  if (inOut) { const f = document.getElementById(id); if (f) { f.focus(); f.setSelectionRange(f.value.length, f.value.length); } }
});

function showCalc() {
  for (const s of ["#home", "#about", "#form", "#qr"]) $(s).hidden = true;
  $("#bar").hidden = true; $("#calc").hidden = false;
  $(".banner").textContent = "Set-up calculator – not a report";
  scrollTo(0, 0);
}
function showOldForm() {
  $("#calc").hidden = true; $("#home").hidden = false;
  $(".banner").textContent = "Site record – not a report";
  scrollTo(0, 0);
}
$("#toForm").addEventListener("click", showOldForm);
$("#menu").addEventListener("click", () => { $("#calc").hidden = true; $(".banner").textContent = "Site record – not a report"; });
const back = document.createElement("button");
back.type = "button"; back.className = "wide p"; back.textContent = "Set-up calculator"; back.id = "toCalc";
back.addEventListener("click", showCalc);
$("#home").prepend(back);

draw();
showCalc();
