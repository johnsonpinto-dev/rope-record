# Rope Record

An installable phone app (PWA) for MRT engineers on site: rope data and calibration for any rope, with the
working shown and mistakes stopped before the record is saved. **Site record – not a report.**

Open: https://johnsonpinto-dev.github.io/rope-record/

**1.4.0: the set-up calculator opens first.** Rope details in (nominal d, ISO 2408 class and core, head,
A from certificate / maker / calculated, outer wire δ with its source) – LMA and LF set-up values out, each with its working
and source: A, the air value to enter, the zero check, one outer wire as % of A, the head's LF threshold rule, the LF
calibration route used, 6d / 30d and broken-wire limits. Nothing is saved. The full site record below is kept behind
"Full site record (old form)".

**1.5.0: breaking-force check and construction note.** Enter the certificate breaking force and the rope grade, and the
app works out the ISO 2408 minimum Fmin = d² × Rr × K ÷ 1000 (Annex C, Formula C.1, 2–60 mm) for the class and core
chosen, with the working. An amber note shows when the certificate is at or above the minimum of the compacted class of the
same family ("fits the compacted class better – check the construction"), or below the minimum for the chosen class.
Advice only: nothing is changed. A free-text box beside the class records the reason when the class differs from the
certificate (kept in the record and the CSV).

## Install on an Android phone

1. Open the address above in **Chrome** (with signal, once).
2. Tap **Install app** on the app's home screen, or Chrome menu **⋮** → **Add to home screen** → **Install**.
3. Open **Rope Record** from the home screen. From then on it works with no signal (airplane mode).

## Install on an iPhone

1. Open the address above in **Safari** (with signal, once).
2. Tap **Share** (square with arrow) → **Add to Home Screen** → **Add**.
3. Open **Rope Record** from the home screen; it works with no signal.

## Air value tables used

| Head | Table | Source |
|---|---|---|
| MH 6-26, MH 22-45, MH 40-70 | Table 4 "LMA values for calibration without WRRS" | INTROS manual v1.3, p. 27 |
| MH 40-64 | Table 4 | INTROS MH40-64 with BU-M manual v1.1, p. 21 |
| MH 20-40, MH 80-120 | none held | "air value from the head's own manual – check it" (amber, no figure) |

A outside a table also gives the amber "own manual" message, never a guessed figure.

## What it does

Follows **PRO-AIC-0608 as filed** and fills in what it can, so the engineer enters only what he measures.

- Job type first: **Site rope** or **Reference rope** (the reference rope adds sections A/B/C).
- Engineer enters the measured diameter (three positions, two readings at right angles – B2), the construction or the
  counts, the core and the head. The app fills in, with the working and the clause in small print: A (certificate,
  or ISO 2408 C × d², 2–60 mm), the air value to type into the BU-M (Intron Table 4), 6d / 30d, one-wire area, n,
  RCN and the LF limit (Annex C formula, or ISO 4309 Table 3 / 4 – Acumen criterion).
- Calibration in the procedure's order, one screen each, with the acceptance figure on the screen: C1 equipment,
  C2 head and liners, C3 settling and function check, C4 LMA calibration (route 1 / 2 / 3, air value in large print),
  C5 LF calibration, one-wire signal, threshold and alarm, C6 closing check.
- Live checks: each value is checked when the engineer leaves the box. A pop-up says what is wrong, the correct
  value or range and the clause. Red = fix, or give a reason (saved with the time); amber = warning. Open problems
  are listed at the top of every screen and again before saving.
- An automatic value can be changed only with a reason, saved in the CSV with the time.
- The LF threshold rule is one table in `calc.js` (`LF_RULESETS`); `LF_RULESET` switches it when the procedure is amended.
- Save keeps the record on the phone and downloads its CSV (UTF-8 with BOM); **Share** sends it through the Android
  share sheet. Records stay on the phone.
- **Kuzo link:** Save also writes `<ref>_<date>_<HHMM>.kuzo.json` (rope-record-schema-v1, Kuzo is the master); Share sends the CSV and the .kuzo.json together; "QR for Kuzo" on a saved record shows the same record as QR codes (one per screen, auto-advance every 2 s). QR encoder: `vendor/qrcode.js` (qrcode-generator 1.4.4, MIT).
- Register AIC-0608-E is not loaded yet: serials are typed, liner and verification are shown "check by hand".

## Files

`index.html`, `styles.css`, `calculator.js` (set-up calculator, opens first), `app.js` (full site record), `calc.js` (rules with their sources, calculations and checks), `version.js` (version and
date, shown in the app and naming the offline cache), `sw.js` (offline cache), `manifest.webmanifest`, `icons/`.

To publish a new version: change `version.js`, then push. Phones pick it up the next time the app opens with signal.

Every figure was checked against its source page: ISO 4309 Tables 3 / 4 as copied in PRO-AIC-0608 §9.2.2; Annex H
examples (ISO 4309 pp. 51–56); ISO 2408 Tables C.1 / C.2 (p. 18); Intron manual v1.3 Table 4 (p. 27). The procedure
copy used is named, with its SHA-256, on the About screen; the source documents are not published here.
