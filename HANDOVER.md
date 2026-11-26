# Rope Record – handover

Facts only. Owner's notes: vault note "Rope Record app (24-Nov-2026)" and MRTreview/notes/slb-review-app.md (24-Nov entries).

## Where things are
- Repo on the Mac: `/Volumes/mm4 samsung 4tb/johnsonmini/Downloads/developer MRT/rope-record` (git remote `origin` = github.com/johnsonpinto-dev/rope-record, branch `main`).
- Live (GitHub Pages): https://johnsonpinto-dev.github.io/rope-record/ – see version.js (1.5.0 from 26-Nov-2026).
- Versions: 1.0.0 cdabb4c · 1.0.1 12c53de · 1.1.0 ab65485 · 1.2.0 230cded · 1.3.0 1290116 (.kuzo.json export + QR) · 1.4.0 bdaa67e set-up calculator (25-Nov-2026) · 1.5.0 breaking-force check + construction note (26-Nov-2026; published on the owner's word – hash in the git log and the vault note).
- Not published (gitignored): `dev/` (tests `dev/calc.test.mjs`, `dev/export.test.mjs`, `dev/calculator.test.mjs`; test records `dev/examples.mjs`; real-Chrome checks `dev/cdp-check.mjs`, `dev/qr-screen-check.mjs` + `dev/png2rgba.py`; local server `dev/serve.mjs`; icon pages) and `sources/`.
- `vendor/qrcode.js` = qrcode-generator 1.4.4 (Kazuhiko Arase, MIT licence, header kept), from the npm registry 24-Nov-2026.
- Local preview: MRTreview/.claude/launch.json entry "rope-record" (node dev/serve.mjs, port 8770).

## sources/ (on the Mac only, not in git)
SHA-256 of each file: `sources/SHA256.txt`.
- `PRO-AIC-0608 Magnetic Rope Testing Procedure Rev 00.pdf` – SHA-256 7911383fd839c3cfcdb2ae670db5ad7adf9cd158de81609e1f85a97a3f7f4952 (22-Nov final/ copy; not confirmed as filed)
- `AIC-0608 MRT Site Sheet Rev 00.pdf`
- `AIC-0608 MRT Site Sheet SAMPLE (filled example) Rev 00.pdf`
- `AIC-0608-G MRT Report Guide to Completion Rev 00.pdf`
- `MH6-26, 22-45 & 40-70 OPERATING MANUAL version 1.3 (scanned).pdf`
- `MH6-26, 22-45 & 40-70 OPERATING MANUAL version 1.3 - OCR text.txt`
- `Operating Manual 40-64 version 1.1.pdf` (INTROS MH40-64 with BU-M)
- `BS ISO 4309 - 2017.pdf`
- ISO 2408:2017 copy – full file name in `sources/SHA256.txt` (not repeated in this public file)

## Screenshots (on the Mac, not in git)
Folder base: `/Volumes/mm4 samsung 4tb/johnsonmini/Downloads/developer MRT/MRTreview/runs/for-johnson/`
- `rope-record-screens/` (1.0): 00 start - job type.jpg · 01 results with working - 48 mm.jpg · 02 calibration step 1 - equipment and liner.jpg · 03 calibration step 2 - zero on sound section.jpg · 04 calibration step 3 - air value 109 CAUGHT.jpg · 05 calibration step 4 - LMA check.jpg · 06 calibration step 5 - LF calibration.jpg · 07 calibration step 6 - one-wire LF signal.jpg · 08 calibration step 7 - zero threshold CAUGHT.jpg · 09 save blocked until fixed or reason given.jpg · 10 records on the phone - edit CSV share.jpg · 11 LIVE site in airplane mode - saved.png · 12 LIVE site in airplane mode - opens.png
- `rope-record-1.1-screens/`: 01 C1 equipment - register not loaded (amber) and problems bar.jpg · 02 C1 pop-up - basic unit 505134 no certificate (red).jpg · 03 C4 LMA calibration - air value to type in large print.jpg · 04 C4 pop-up - air value 109 caught (Table 4 gives 101).jpg · 05 C5 pop-up - zero threshold caught.jpg · 06 C5 pop-up - BU-M alarm rule (filed C5, 5.2).jpg · 07 C5 threshold screen - alarm to set in large print.jpg · 08 Save shows the problem list again.jpg · 09 LIVE in airplane mode - About (procedure SHA-256).png · 10 LIVE in airplane mode - saved.png · 11 app icon 512 - AS mark from acumen-watermark-form.png
- `rope-record-1.2-screens/`: 01 out-of-range rope - 100 mm on MH 40-70 (red).jpg · 02 MH 80-120 - air value from own manual (amber, no figure).jpg
- `rope-record-1.3-screens/`: 01 rope data - one pair at the widest point, certificate diameters (D1, D2).jpg · 02 QR for Kuzo - code 1 of 2.jpg · 03 QR screen photographed in Chrome - part 1 (read by Kuzo's reader).png · 04 QR screen photographed in Chrome - part 2 (read by Kuzo's reader).png

## Locked settings (change only on the owner's word)
- `LF_RULESET = "filed"` – until the 24-Nov LF amendment is filed.
- `PROCEDURE.confirmedFiled = false` – until the filed procedure PDF replaces the sources/ copy.
- `REGISTER_LOADED = false` – until register AIC-0608-E is on the Mac.

## Tests
- `node dev/calc.test.mjs` – rules and checks, all pass at 1.3.0.
- `node dev/bf.test.mjs` – 1.5.0 breaking-force check and construction note (see 1.5.0 below).
- `node dev/export.test.mjs` – .kuzo.json and QR against Kuzo's own code (MRTreview, read only): schema validation with Kuzo's `validate()`, structure against Kuzo's sample `AIC-RR-48-01_2026-11-23_1030.kuzo.json` (every key present, same values), Kuzo's `crossCheck()` / `targets()` fill plan, QR round trip (qrcode-generator → jsQR → Kuzo `QrCollector` → CRC → inflate → valid), damaged code refused, missing part named. All pass at 1.3.0. 24-Nov-2026: D3 lines updated for Kuzo K1 / K2 (7d8fd12) - route 1 and route 3 exports now valid in Kuzo, Kuzo ticks the route from the file, a route 2 air-value record without an air value is refused; all pass (test file is in dev/, not published).
- `node dev/qr-screen-check.mjs <url> <outdir>` – real Chrome at Android size: the QR screen photographed code by code, pictures read by jsQR, joined by Kuzo's `QrCollector`, record valid. Passed at 1.3.0.
- `node dev/cdp-check.mjs <url> <outdir>` – headless Chrome at Android size: service worker, installability, airplane mode, full 22 mm record saved with both files. Passed at 1.3.0.
- iPhone / Safari: NOT tested. 24-Nov-2026: safaridriver refuses – "You must enable 'Allow remote automation' in the Developer section of Safari Settings". No Xcode on the Mac, so no iOS Simulator.

## 1.4.0 set-up calculator (25-Nov-2026)
Owner's brief: the job-record form is too heavy; the calculator takes the rope details and gives the LMA and LF set-up values, each with its working and source. No job order, no report number, no saved record. Purpose unchanged: stop LMA and LF calibration mistakes.
- Files: `calculator.js` (screen, opens first), `calc.js` section "CALCULATOR (1.4.0)" (`calculator()`, `calcLfRule()`, `calcRoute()`, `ACUMEN_ONE_WIRE`). It calls the existing `compute()` – A, air value, 6d / 30d and the Annex C broken-wire limits are unchanged. The full site record (`app.js`) is kept as it was, behind "Full site record (old form)"; the records list has a "Set-up calculator" button back.
- In: nominal d; ISO 2408 class and core; head (Acumen's list + MH-PC); A source certificate / rope maker's own data / calculated (ISO 2408, 2–60 mm); outer wire δ with its source certificate / maker's data / measured on a wire.
- Out: A; air value (large), the air value the engineer entered and the zero reading 0 ± 0.5 % (a wrong value is an amber warning, not a stop; warnings stay in a bar at the top of the screen); one outer wire as % of A ("cannot be given" with no δ); the head's LF threshold rule; the LF route used; 6d / 30d and broken-wire limits (only with A and δ – the calculator does not ask for the Annex H construction and lay). A not known (no certificate, no maker's data, no ISO 2408 factor – e.g. over 60 mm): the air value is estimated from the density factor K as PRO-AIC-0608 A3 (p. 8) allows, S = K × π × d² ÷ 4 (K 0.5 fibre core, 0.65 steel core, 0.8 locked coil), amber "estimate - air value only, not reported", with the next band's air value and "Confirm the zero on the rope before relying on this value." No one-wire % and no broken-wire limits from it.
- LF routes (owner's order, 25-Nov-2026 evening): 1 real broken wire (PRO-AIC-0608 C5); 2 Acumen's recorded one-wire value, same head and same nominal d (MH 40-64 manual v1.1 2.5.2.10 p. 21; manual v1.3 2.4.2.10 p. 28) – table `ACUMEN_ONE_WIRE`, approved by the owner, one value: 48 mm, MH 40-64, 10 mV (25-Nov-2026 reference rope rerun), shown "from Acumen records"; 3 indication found by running the head – red: not tied to a known broken wire, a single broken wire may not be detected. Simulated wire shown separately as an option, ready for when the wires arrive – two added wires ≥ 0.3 m (0.6 m MH 80-120), gap 1–3 wire diameters (MH 40-64 manual v1.1 2.5.2.9 p. 21; manual v1.3 2.4.2.9 p. 28).
- LF threshold rule in the calculator: MH 40-64 from the held manual v1.1 2.5.1.7 item 5 (p. 19) – one-wire value minus 2 to 3; the manual states no unit for "2-3" and the screen says so; Acumen example 48 mm reference rope, 10 mV, threshold 8 mV (25-Nov-2026). Other heads: as the app holds them (`LF_RULESET` "filed"). MH-PC: name only – "own manual – check it" for range, air value and LF rule until a manual is held.
- NO outer wire estimate (owner's decision, 25-Nov-2026): tested on the reference ropes it overstated the one-wire share by 16 % on the 48 mm rope – the unsafe direction. Not built.
- 24 mm reference rope: outer wires per strand not known – the owner will have them counted. Nothing assumed.
- Tests: `node dev/calculator.test.mjs` – worked example 48 mm 6 × 36 IWRC, MH 40-64, A calculated, δ 2.7 mm measured on a wire (24-Nov record AIC-RR-48-01): A 0.460 × 48² = 1059.8 mm², air 84 % (820–1300), one wire 5.73 mm² = 0.54 % of A, 6d / 30d 0.288 / 1.44 m, 11 / 19 wires; plus A sources, > 60 mm, EN warnings, no-δ, MH-PC, head range, routes 1–3 and the simulated wire; A not known on a 72 mm rope (fibre core S 2036 mm² → 113 %, next band 120 %; steel core S 2646 mm² → 120 %, no next band; no one-wire %, no limits; 72 mm is outside every head with an air table, so the range warning shows too). All pass; `calc.test.mjs` and `export.test.mjs` still pass.

## 1.5.0 breaking-force check + construction note (26-Nov-2026) – PUBLISHED
Owner's word to build 26-Nov-2026 (vault note items 6–8); published on the owner's word 26-Nov-2026 (version.js 1.5.0). Live check 26-Nov-2026 ~12:49: the Pages address serves version.js 1.5.0, the footer reads "Rope Record version 1.5.0 · 26-Nov-2026", and `dev/bf-chrome-check.mjs` against the live address passed (screenshots `dev/screens-1.5.0-live/`, no console errors).
- Breaking-force check (item 6), in the calculator (result 7) and the full site record (rope screen, results screen, CSV): when a certificate breaking force (kN) and rope grade (N/mm²) are entered, Fmin = d² × Rr × K ÷ 1000 (ISO 2408 Annex C, Formula C.1, p. 17; 2–60 mm). K1 fibre core / K2 IWRC / K3 wire strand core from Table C.1 / C.2 (p. 18), all read from the held text 26-Nov-2026 and kept in calc.js `ISO2408` beside the C factors. 35(W) × 7 K3 = 0.360 up to grade 1960, 0.350 over 1960 up to 2160 (footnotes a, b), and no K over 2160. No K (blank in the table, locked coil, class not in ISO 2408, d outside 2–60 mm) → the screen says so and makes no check. Shown: certificate vs Fmin with the working, % above / below, and the compacted class of the same family (6 × 7 → 6 × K7; 6 × 19 / 6 × 36 → 6 × K19 / 6 × K36; 8 × 19 / 8 × 36 → 8 × K19 / 8 × K36; 18 × 7 / 18 × 19 → 18 × K7 / 18 × K19; 35(W) × 7 → 35(W) × K7) with both Fmin figures and the gap between them. Advice only: nothing changed, never red, never blocks Save.
- Owner's rulings 26-Nov-2026 (the proposed 10 % margin was refused – the 18 × 7 fibre-core gap, K1 0.328 → 0.350, is only 6.7 %):
  1. Amber "Breaking force fits the compacted class better - check the construction" when the certificate force is at or above the Fmin of the same-family compacted class, same core column. No compacted class in the family (or the class chosen is already compacted), or no K in that core column → no amber, and the working says why.
  2. Amber "Certificate breaking force below the ISO 2408 minimum for this class - check the class, core and grade" when the certificate is below Fmin for the chosen class.
  Calculator: in the warnings bar and in result 7. Full record: amber item on the rope screen (field breaking force) and in the CSV problems. Both ambers (ids bf-fits, bf-below) are NOT exported in the .kuzo.json checks[] – Kuzo file unchanged until the owner's word.
- Construction note (item 7): "Reason, if the class differs from the certificate", a free-text box beside the class in the calculator and the full site record. Kept in the record (`class_note`), on the results screen and in the CSV. NOT in the .kuzo.json (schema unchanged; later, after Kuzo 0.2.9). The app has no print view; the note is on the screens and in the CSV.
- Full site record: the ISO 2408 class box is now always shown (required only when A is calculated), so the check works with any A source. New fields `class_note`, `bf`, `grade` follow `dmax`; new CSV columns `bf_Fmin_kN`, `bf_check` at the end of the calculated columns (153 → 158 columns). A 0 typed in the breaking force or grade → red "leave blank" (the existing rule).
- Item 8 (manufacturer lookup): proposal only, `dev/proposal-item8-maker-lookup.md`. Not built.
- Tests: `node dev/bf.test.mjs` (141 checks) – owner's rulings 1 and 2: 26 mm (amber fits, 671.9 ≥ 598.7; gap 87.6 kN / 17.1 %; 598 kN no amber; equal = amber; 500 kN amber below; exactly Fmin no amber), 18 × 7 fibre core 20 mm grade 1960 (Fmin 257.2 / 274.4 kN, gap 6.7 %, 274.4 amber, 270 none), 18 × 7 WSC, 6 × 24 (no compacted class), 6 × 7 IWRC (6 × K7 has no K2), compacted class chosen, ambers in the calculator, the record and the CSV, never in the .kuzo.json, never blocking Save; and every K in Tables C.1 / C.2 against an independent copy of p. 18 (all 20 classes × 3 cores); 26 mm DSR PowerFlex 35, grade 2160, 671.9 kN: 35(W) × 7 Fmin 511 kN (511.056), 35(W) × K7 Fmin 599 kN (598.666), A 0.527 × 26² = 356.3 mm² with wire strand core; footnotes a / b, grade 2360 no K, IWRC no K2, locked coil, > 60 mm, nothing entered; 48 mm worked example unchanged; note and check on the record and in the CSV; .kuzo.json identical with or without them. All pass; calc / calculator / export tests unchanged and pass.
- Real Chrome: `node dev/bf-chrome-check.mjs http://localhost:8771/ dev/screens-1.5.0` (headless Google Chrome, Android size) – calculator and full record give the same figures; no console errors; screenshots in `dev/screens-1.5.0/`.

## Standards and documents held (25-Nov-2026)
- ISO 2408 Tables C.1 / C.2 in calc.js checked against p. 18 on 25-Nov-2026: all 20 classes match. No factor above 60 mm. ISO 2408 stays the only factor table.
- EN 12385-2:2002+A1:2008 3.10.3 is cited beside ISO 2408 Annex C wherever a calculated A is shown. No factor from EN 12385-4 is used.
- Details in the owner's vault note.

## Owner's rulings D1–D5 (24-Nov-2026) – built in 1.3.0
Kuzo is the master; Rope Record adapts.
- D1 Certificate's measured diameter: box "Measured diameter on the certificate" (`d_cert`); kept on the phone and in the CSV; NOT exported.
- D2 Diameter: one position only – two caliper readings at 90° at the widest point (`da`, `db`), plus the nominal diameter and the certificate's measured diameter. The three-position entry is removed. Exported: rope.nominal_diameter_mm, rope.measured_diameter_mm [da, db], rope.measured_diameter_mean_mm (mean). Records saved by 1.2 open with their first pair as da / db.
- D3 LMA route: the engineer chooses the route and enters its details. Only route 2 with the air value has an air value. Exported per head: `lma_calibration_route` = Kuzo's own route ids (app/src/jobs/calroute.js) "ref_rope" | "air" | "auto" | "added"; `air_value_entered_pct` = the air value for "air", null for the others.
- D4 Metallic area source: exactly Kuzo's choices – certificate · maker's data · client or maker written confirmation · calculated (ISO 2408); blank = A not known. The A override is removed (records from 1.2 with an A override keep it as a line in Notes).
- D5 LF threshold (and alarm): any value is recorded; Rope Record makes no check of its own; Kuzo checks. LF_RULESETS / LF_RULESET = "filed" stay in calc.js unchanged and unused for checks.
Other choice words now Kuzo's: construction source "client advice"; δmax source "certificate, rope maker's data or written confirmation for that rope". Optional "Scan step set on the basic unit" box (Kuzo cross-checks it against the scan).

## .kuzo.json export and QR (1.3.0)
- Save downloads `<ref>_<YYYY-MM-DD>_<HHMM>.csv` and `<ref>_<YYYY-MM-DD>_<HHMM>.kuzo.json` (UTF-8, no BOM, schema v1); Share sends both through the share sheet (download where sharing files is not possible). Records list: Edit · Files · Share · QR for Kuzo.
- Export rules (calc.js `kuzoRecord`): numbers in the key's unit; not available (blank or 0) = null; choices mapped as in "The 21 gaps, decided" below; saved_at local time with offset; checks[] = id, level, "<what is wrong> Correct: <value or range> [<clause>]", reason "<reason> (<date time>)".
- QR (schema "x-qr"): compact JSON → zlib (CompressionStream "deflate") → base45 → CRC-32 of the compressed bytes → parts of at most 1000 characters "RR1 PART n/N CRC piece"; one code per screen, ECC M, alphanumeric mode, quiet zone 4; Next / Previous, auto-advance every 2 s, screen kept awake (Wake Lock where the phone allows); works offline (vendor/qrcode.js in the cache). The 48 mm and 22 mm test records each give 2 codes.

## Kuzo-side changes (for the owner – Kuzo NOT changed by Rope Record)
K1 and K2 MADE in Kuzo (acumen-mrt-review 7d8fd12, 24-Nov-2026): schema v1 (still v1) accepts air_value_entered_pct null when lma_calibration_route is not "air" (route 2 air value without an air value still refused); Kuzo ticks the LMA route from lma_calibration_route. K3 and K4 unchanged (as below).
- K1 Air value null: schema v1 requires `heads[].air_value_entered_pct` as a number, so Kuzo's `validate()` refuses Rope Record files for C4 route 1 (reference rope), route 3 (added wires) and route 2 automatic calibration with "heads[0].air_value_entered_pct: must be number, found null" (shown by dev/export.test.mjs). Kuzo's importer must accept null when the route is not "air".
- K2 Route: Rope Record sends `heads[].lma_calibration_route` ("ref_rope" | "air" | "auto" | "added" – Kuzo's calroute ids). Schema v1 does not list it (extra key; Kuzo's validator ignores it). Kuzo's importer today ticks LMA route "air" whenever the air value matches the scan; it should tick cal_lma from this key.
- K3 A source "client or maker written confirmation" (a Kuzo choice) has no value in schema v1's metallic_area_source enum: Rope Record exports A with source "not known" plus an amber check telling the engineer to choose the source in Kuzo.
- K4 LF "base-trace configuration file loaded" and "reference rope fault" (Kuzo ticks base_trace / local_fault) have no value in schema v1's lf_calibrated_on enum: exported as null, ticked in Kuzo.

## schema-v1 gaps (redone 24-Nov-2026: Kuzo is the master)
Rule (owner, 24-Nov-2026): Kuzo is finished and is the master; there is no schema v2; Rope Record adapts to Kuzo.
Read: vault note "Kuzo – status and handover (24-Nov-2026)"; Kuzo code in acumen-mrt-review – `app/src/jobs/siterecord.js` (`validate`, `targets`, `notFilled`, `crossCheck`), `app/src/index.html` rope form, `app/src/jobs/details.js`, `app/src/jobs/calroute.js`, `engine/checks.py` (`c5_check`), `engine/limits.py`, `engine/lftable.py`; `Downloads/rope-record-schema-v1.json` (SHA-256 starts bfe8654107c57535). Export and QR built in 1.3.0 (see above).

### What Kuzo takes from a rope record (schema v1 → Kuzo box, from `siterecord.js targets()`)
Required by the schema: format "rope-record"; schema_version 1; record_id; saved_at; app.name "Rope Record", app.version; job.type ("site" | "reference"), job.date (YYYY-MM-DD), job.engineer; rope.nominal_diameter_mm, rope.construction, rope.core, rope.metallic_area_source, rope.dmax_source; heads (1–2) each with head_model, head_serial, basic_unit_serial, air_value_entered_pct (number); checks (array). Not available = null, never 0 or "".
Filled into Kuzo (engineer confirms each; a value that differs from the scan is red and not filled):
- job.job_order → job_order · job.client → customer · job.location → intro_location · job.position → application · job.rope_length_m (m) → length_installed · job.engineer → d-name
- rope.nominal_diameter_mm (mm) → d_mm · mean of rope.measured_diameter_mm, or measured_diameter_mean_mm (mm) → ref_measured_dia ("Reference diameter (after running-in) / measured diameter")
- rope.annex_h_construction (one of the 30 ISO 4309 Annex H names – same strings as Kuzo's list from engine/iso4309_broken_wires.json) → iso_construction; when null: rope.construction → construction_text, outer_strands / wires_per_strand → other_strands / other_wires
- rope.core → core ("fibre core" / "independent wire rope core (IWRC)" / "wire strand core / centre"; "locked coil" not filled) · rope.lay → lay ("not known" not filled) · rope.runs_on → runs_on ("steel sheaves" and "single-layer drum" both → "steel sheaves / single-layer drum")
- rope.metallic_area_source → A_source ("rope certificate" → certificate, "maker's data", "ISO 2408 (2–60 mm only)" → calculated (ISO 2408), "not known" → blank) · rope.metallic_area_mm2 (mm²) → A_mm2
- rope.dmax_source → dmax_source ("wire taken from the rope" → measured on a wire taken from the rope; "rope certificate" → certificate, rope maker's data or written confirmation for that rope; "not available") · rope.dmax_mm (mm, > 0) → dmax_mm
- heads[].head_model (§5.2 names) → head · head_serial → head_serial_full (cross-checked against the scan's device serial) · liner → liner_set · air_temperature_c (°C) → air_temp · sound_section_from_m / to_m (m) → r2_section · one_wire_lf_mv (mV) → one_wire_mv · lf_threshold_mv (mV) → lf_threshold_mv
- heads[].air_value_entered_pct (%) → cross-checked against the scan's stored calibration; when equal, Kuzo ticks LMA route "air value" (cal_lma = air)
- heads[].lf_calibrated_on → cal_lf ("known broken wire" → broken_wire, "two added wires" → two_wires; others not filled)
- job.reference_rope (reference job) → wrrs_id
Kept in Kuzo's log only (no box filled): basic_unit_serial (cross-checked), air_value_proposed_pct, lma_check_pct, lma_most_negative_pct, lf_calibrated_on, lf_wire_diameter_mm, lf_gap_mm, lf_alarm_mv, every checks[] item with its reason. scan_step_mm (optional) is cross-checked against the scan when given. Not used by the importer: rope_type, seale_19_or_fewer, iso2408_class, liner_proposed, reference_sections, sign_off (validated and shown in the preview only).
Kuzo calculates itself (engine): A from ISO 2408 when the engineer asks; RCN from the Annex H construction or the counts; LF limits (Annex C formula or ISO 4309 Table 3 / 4); 6d / 30d; single-wire share against the head's LF sensitivity (A3); head range (C2); C5 threshold check; LMA and LF evaluation.

### The 21 gaps, decided
(a) Kuzo has a field – Rope Record maps to it · (b) Kuzo takes no such field – stays on the phone and in the CSV, not exported · (c) Kuzo calculates it – not exported · (d) conflict – owner's ruling needed.
1. Diameter – ruled by the owner (24-Nov-2026): export the certificate's nominal diameter, the certificate's measured diameter, and the engineer's two readings at 90°. (a) nominal → rope.nominal_diameter_mm; (a) two readings → rope.measured_diameter_mm [r1, r2] and their mean → measured_diameter_mean_mm (Kuzo fills ref_measured_dia with it); (b) positions and the other reading pairs. (d) D1: schema v1 has no field for the certificate's measured diameter (and Rope Record does not yet ask for it). (d) D2: Rope Record records three pairs (B2); which pair is exported.
2. Construction source – (b): Kuzo has a construction_source box (choices "rope certificate", "client advice", "counted on the rope") but schema v1 has no field; the engineer picks it in Kuzo. Rope Record will use Kuzo's words ("client advice" for "client") in the CSV.
3. Spooling length – (b): Kuzo has drum_from_m / drum_to_m but schema v1 has no field; entered in Kuzo.
4. C3 settled / self-test / counter – (b): no Kuzo box.
5. C4 route and details – route: see D3. Route 1 zero / known / reading and reference rope ID – (b): Kuzo has wrrs_id, r1_zero, r1_span, r1_known but schema v1 has no fields. Route 3 LMA set – (b): Kuzo has cal_lma_value, no schema field. Passes, automatic calibration flag, calibration time – (b).
6. C5 known-break position, wire length, speed compensation – (b): no Kuzo box. Configuration file – (b): Kuzo has config_file, no schema field.
7. C6 closing check – (b): Kuzo has closing_c6 (valid Y / N), no schema field.
8. Checks – (a): checks[].id = Rope Record check id; level red / amber; text = "<what is wrong> Correct: <value or range> [<clause>]"; reason = "<reason> (<date time>)". Kuzo keeps them in its log.
9. Overrides – (a) through checks: each override is already an amber check ("… overridden to <value> (reason …)") with its time in the text. LF 6d / 30d overrides: (c) Kuzo calculates its own limits. Air value override: the Table value goes to air_value_proposed_pct, the override stays in checks. Overridden A: see D4.
10. Calculated values (A used text, Intron k estimate, one-wire area, share, n, RCN, 6d / 30d, LF limits, LF rule) – (c). Procedure copy SHA-256 and LF rule set name – (b). air_value_proposed_pct – (a) from the head's table value (null when no table).
11. air_value_entered_pct required – (d) D3.
12. head_serial – (a): the typed serial goes to head_serial; Kuzo cross-checks its last digits against the scan; the "register not loaded" amber goes in checks.
13. runs_on – (a): "steel sheaves / single-layer drum" → "steel sheaves" (Kuzo turns both schema values back into its own "steel sheaves / single-layer drum"); "multi-layer drum" → "multi-layer drum".
14. metallic_area_source – (a): certificate → "rope certificate", maker's data → "maker's data", calculated (ISO 2408, 2–60 mm only) → "ISO 2408 (2–60 mm only)", not known → "not known" with metallic_area_mm2 null. Overridden A: D4.
15. dmax_source – (a): "measured on a wire taken from the rope" → "wire taken from the rope"; "certificate, maker's data or written confirmation" → "rope certificate" (Kuzo writes it back as "certificate, rope maker's data or written confirmation for that rope"); "not available" → "not available", dmax_mm null.
16. lf_calibrated_on – (a): "known break in the rope" → "known broken wire", "two added wires" → "two added wires". (b): "base-trace configuration file loaded" and "reference rope fault" → null (Kuzo has the ticks base_trace / local_fault, schema v1 has no value; ticked in Kuzo). Schema "no known break" is not used.
17. lma_check_pct – (a): the zero reading of the route used (route 1 zero segment, route 2 zero check after the air value, route 3 zero check). Kuzo log only.
18. measured_diameter_mean_mm – (a): mean of the two exported readings (gap 1).
19. saved_at – (a): local time with offset, e.g. 2026-11-24T14:32:00+04:00 (the CSV keeps its own column).
20. "Other (not in Annex H)" → annex_h_construction null; "not in ISO 2408 Table C.1 / C.2" → iso2408_class null – (a).
21. QR – the schema's "x-qr" rules (zlib, base45, CRC-32, "RR1 PART n/N CRC piece", ≤ 1000 characters, ECC M); needs one QR encoder file in the app. Build item, not a schema gap.
Also found: scan_step_mm is an optional schema field that Kuzo cross-checks against the scan; Rope Record has no scan-step box yet (can be added with the export).

### (d) – ruled by the owner 24-Nov-2026 (see "Owner's rulings D1–D5" above)
- D1 Certificate's measured diameter: no field in schema v1.
- D2 Which of the three caliper pairs is exported.
- D3 Records without an air value (C4 route 1, route 3, automatic calibration): schema v1 requires air_value_entered_pct, and Kuzo's importer then ticks the "air value" route.
- D4 Overridden A: which source to export.
- D5 LF threshold: Kuzo's C5 check (engine/checks.py c5_check) wants the threshold at most one-wire − 2 mV on BU-M and BU-16 heads (= one-wire on MH 80-120), a higher one only with a reason in its lf_threshold_reason box (no schema field). Rope Record's locked "filed" rule checks the BU-M alarm (2–3 mV below), not the threshold, and wants the BU-16 threshold exactly 2 mV below.
