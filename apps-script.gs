// Google Apps Script that lets the website save scores into this sheet.
// Setup: in the Google Sheet, open Extensions > Apps Script, replace everything with this file,
// then Deploy > New deployment > Web app, "Execute as: Me", "Who has access: Anyone".
// Every change is also written to a "Log" tab (time, match, old score, new score).

const SHEET_NAME = "Matches";
const LOG_NAME = "Log";
const SCORE_COLS = ["G1 A", "G1 B", "G2 A", "G2 B", "G3 A", "G3 B"];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    const scores = (d.scores || []).map(v => (v === "" || v == null ? "" : Number(v)));
    if (scores.length !== 6 || scores.some(v => v !== "" && !(Number.isInteger(v) && v >= 0 && v <= 99)))
      return json({ ok: false, error: "Scores must be whole numbers between 0 and 99" });

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(SHEET_NAME);
    if (!sh) return json({ ok: false, error: `No tab named "${SHEET_NAME}"` });
    const values = sh.getDataRange().getValues();
    const head = values[0].map(h => String(h).trim());
    const col = name => head.indexOf(name);
    if ([...SCORE_COLS, "No", "Stage"].some(n => col(n) < 0))
      return json({ ok: false, error: "Sheet headers don't match the template" });

    const same = (x, y) => String(x).trim().toLowerCase() === String(y).trim().toLowerCase();
    for (let i = 1; i < values.length; i++) {
      const r = values[i];
      if (!same(r[col("Stage")], d.stage) || !same(r[col("No")], d.no)) continue;
      const before = SCORE_COLS.map(k => r[col(k)]);
      SCORE_COLS.forEach((k, j) => sh.getRange(i + 1, col(k) + 1).setValue(scores[j]));

      const log = ss.getSheetByName(LOG_NAME) || ss.insertSheet(LOG_NAME);
      if (log.getLastRow() === 0) log.appendRow(["Time", "Stage", "No", "Team A", "Team B", "Before", "After"]);
      log.appendRow([new Date(), r[col("Stage")], r[col("No")], r[col("Team A")], r[col("Team B")],
                     fmt(before), fmt(scores)]);
      return json({ ok: true });
    }
    return json({ ok: false, error: `Match ${d.stage} ${d.no} not found in the sheet` });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Score pairs as "21-15, 18-21" for the log.
function fmt(s) {
  const games = [];
  for (let j = 0; j < 6; j += 2) if (s[j] !== "" || s[j + 1] !== "") games.push(`${s[j]}-${s[j + 1]}`);
  return games.join(", ");
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
