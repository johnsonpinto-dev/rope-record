# Rope Record – handover

Facts only. Owner's notes: vault note "Rope Record app (24-Nov-2026)" and MRTreview/notes/slb-review-app.md (24-Nov entries).

## Where things are
- Repo on the Mac: `/Volumes/mm4 samsung 4tb/johnsonmini/Downloads/developer MRT/rope-record` (git remote `origin` = github.com/johnsonpinto-dev/rope-record, branch `main`).
- Live (GitHub Pages): https://johnsonpinto-dev.github.io/rope-record/ – version 1.2.0 (24-Nov-2026), commit 230cded; version.js on the live address read 1.2.0 on 24-Nov-2026.
- Versions: 1.0.0 cdabb4c · 1.0.1 12c53de · 1.1.0 ab65485 · 1.2.0 230cded.
- Not published (gitignored): `dev/` (tests `dev/calc.test.mjs`, test records `dev/examples.mjs`, real-Chrome check `dev/cdp-check.mjs`, local server `dev/serve.mjs`, icon pages) and `sources/`.
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

## Locked settings (change only on the owner's word)
- `LF_RULESET = "filed"` – until the 24-Nov LF amendment is filed.
- `PROCEDURE.confirmedFiled = false` – until the filed procedure PDF replaces the sources/ copy.
- `REGISTER_LOADED = false` – until register AIC-0608-E is on the Mac.

## Tests
- `node dev/calc.test.mjs` – rules and checks, all pass at 1.2.0.
- `node dev/cdp-check.mjs <url> <outdir>` – headless Chrome at Android size: service worker, installability, airplane mode, full 22 mm record, mistakes caught. Passed on the live 1.2.0.
- iPhone / Safari: NOT tested. 24-Nov-2026: safaridriver refuses – "You must enable 'Allow remote automation' in the Developer section of Safari Settings". No Xcode on the Mac, so no iOS Simulator.

## schema-v1 gaps
Compared 24-Nov-2026: `Downloads/rope-record-schema-v1.json` (SHA-256 starts bfe8654107c57535; same file in MRTreview; no schema v2 found) against `FIELDS`, `CSV_HEAD` and `CALC_COLS` in calc.js 1.2.0. Export and QR NOT built – waiting for the owner's answers.

### App fields with no schema field
1. Diameter: 3 positions (`p1`–`p3`, m from the datum), each with 2 readings at right angles (`d1a`…`d3b`) – PRO-AIC-0608 B2. Schema `rope.measured_diameter_mm` holds at most 2 readings and no position.
2. `csrc` construction source (rope certificate / client / counted on the rope – A3).
3. `spool_from`, `spool_to` – length that spools on a multi-layer drum (§9.2.2; site sheet).
4. C3: `settled`, `selftest`, `counter` (per head).
5. C4: `route` (1 / 2 / 3); route 1 `r1_id`, `r1_zero`, `r1_known`, `r1_seg2`; route 2 `r2_passes`, `air_auto`; route 3 `r3_n`, `r3_dw`, `r3_set`, `r3_zero`; `cal_time` (per head).
6. C5: `lf_at` (known break position, m), `lflen` (added wire length, m), `speedcomp`, `config` (configuration file name) (per head).
7. C6: `c6_done`, `c6_zero`, `c6_len`, `c6_known` (per head).
8. Checks: the correct value or range (`want`) and the clause (`src`); the time of each reason. Schema `checks[]` has `id`, `level`, `text`, `reason` only.
9. Overrides of automatic values (A, LF 6d / 30d, air value to type) with value, reason and time.
10. Calculated values and provenance (CSV only): measured D used, A used and source text, Intron k estimate, one-wire area, single-wire share, n, RCN, 6d / 30d, LF route / limits / drum limits / working, LF rule per head, LF rule set, procedure copy and SHA-256. Schema has only `air_value_proposed_pct`.

### Required schema fields the app does not always collect
11. `heads[].air_value_entered_pct` – required number; null and 0 are not allowed. The app has no air value on C4 route 1, route 3, route 2 with the maker's automatic calibration, or (often) a head with no air table.
12. `heads[].head_serial` – titled "full, from the equipment register"; the app's serials are typed by the engineer (register not loaded).

### Unit, enum or format mismatches
13. `rope.runs_on`: schema "steel sheaves" | "single-layer drum" | "multi-layer drum"; app "steel sheaves / single-layer drum" (one choice, as the site sheet) | "multi-layer drum". The combined app value has no schema value.
14. `rope.metallic_area_source`: app "certificate" / "calculated (ISO 2408, 2–60 mm only)" ↔ schema "rope certificate" / "ISO 2408 (2–60 mm only)" (one-to-one wording); app "maker's data", "not known" match. An overridden A has no source value.
15. `rope.dmax_source`: app "measured on a wire taken from the rope" ↔ "wire taken from the rope" (one-to-one); app "certificate, maker's data or written confirmation" (A3 source b) ↔ schema "rope certificate" only (narrower).
16. `heads[].lf_calibrated_on`: app "known break in the rope" ↔ "known broken wire"; "two added wires" matches; app "base-trace configuration file loaded (repeat test)" and "reference rope fault" have no schema value; schema "no known break" is not an app choice (C5 has none).
17. `heads[].lma_check_pct` ("LMA check on the sound section"): the app records a zero reading per route (`r1_zero`, `r2_zero` after the air value, `r3_zero`); which one goes here is not defined.
18. `rope.measured_diameter_mean_mm` ("mean"): the app's measured D is the largest position average (selects head and liners, B2 / C2), not a mean.
19. `saved_at`: schema "local date and time, ISO 8601 with offset"; the app stores UTC (`toISOString()`, ending Z).
20. `rope.annex_h_construction` null = not in Annex H; app value "Other (not in Annex H) – use the counts" → null. `rope.iso2408_class`: app "not in ISO 2408 Table C.1 / C.2" → null. (One-to-one; listed for confirmation.)

### Build note (not a schema field)
21. QR screen needs a QR encoder in the app (offline) – none is in the repo; one library file would be added. zlib deflate via the browser's CompressionStream (support on the engineers' phones to be checked in the Safari / Chrome tests).
