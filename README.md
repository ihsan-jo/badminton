# Badminton Tournament Website: setup guide

> **Update (Oct 2026):** scores now live in a free **Supabase** database instead of the Google Sheet, because the sheet was slow.
> Anyone can enter or edit scores with the buttons on each match card. To fix a score or a team name by hand, open the
> [Supabase dashboard](https://supabase.com/dashboard/project/lvfgvvegnqysiaipyhss/editor) > Table Editor > `matches`.
> Every score change is recorded in the `score_log` table. The free plan pauses the project after a week with no visits;
> if the site says it can't load scores, open the dashboard and click **Restore project**.
> The Google Sheet steps below are kept for reference only.


Total cost: free. Time: about 15 minutes.

Organizers type game scores into a Google Sheet. The website reads the sheet each time someone opens or reloads it, then works out the standings and fills in the semifinal, 3rd place and final pairings by itself.

## 1. Create the Google Sheet

1. Go to sheets.google.com and create a new sheet.
2. Rename the tab at the bottom to **Matches**.
3. Use File > Import > Upload, pick `matches-template.csv`, and choose "Replace current sheet". It already has all 28 group matches plus the knockout rounds.
4. Click **Share**, set General access to **Anyone with the link**, role **Viewer**. Add organizers as **Editors** by email.
5. Copy the sheet ID from the URL. It's the long part between `/d/` and `/edit`:
   `https://docs.google.com/spreadsheets/d/`**`1AbC...xyz`**`/edit`

### Sheet columns

| Column | What it holds |
|---|---|
| No | Match number |
| Stage | `Group`, `Semifinal`, `3rd Place` or `Final` |
| Team A / Team B | Team names. Knockout rows say `Rank 1`, `SF 1 Winner` and so on; leave those as is |
| G1 A, G1 B | Game 1 points for Team A and Team B |
| G2 A, G2 B | Game 2 points |
| G3 A, G3 B | Game 3 points (leave blank if the match ended 2-0) |

Each game uses two columns rather than one "21-15" cell, because Google Sheets can turn "21-12" into a date.

A match counts once a team has won 2 games. Team names must be spelled the same way in every row.

### How the standings work

- Win = 1 point, loss = 0. You can change this at the top of `index.html`.
- Ties on points are broken by: head-to-head between the tied teams, then game difference, then score difference.
- When all 28 group matches are in, `Rank 1` to `Rank 4` in the semifinal rows are replaced with the real team names. When a semifinal is finished, the 3rd place and final rows fill in too.

## 2. Connect the website to the sheet

Open `index.html` in any text editor (Notepad is fine) and change the settings near the top of the `<script>` section:

```js
const TOURNAMENT_NAME = "Badminton Tournament";
const SHEET_ID = "paste-your-sheet-id-here";
const SHEET_TAB = "Matches";
```

With `SHEET_ID` empty, the page shows demo scores, so you can preview it by double-clicking the file.

## 3. Put it online with GitHub Pages

1. Sign in at github.com (free account) and create a **public** repository, e.g. `badminton-tournament`.
2. Click **Add file > Upload files**, upload `index.html`, and commit.
3. Go to **Settings > Pages**. Under Source choose **Deploy from a branch**, branch **main**, folder **/ (root)**, and save.
4. After a minute the site is live at `https://<your-username>.github.io/badminton-tournament/`.

Share that link (or a QR code of it) with everyone. Visitors see the latest scores whenever they open or reload the page.

## Troubleshooting

- **"Could not read the sheet"**: the sheet isn't shared as "Anyone with the link can view", or the tab isn't named `Matches`.
- **A team shows up twice in the standings**: its name is spelled differently in one of the rows.
- **Semifinal still shows "Rank 1"**: at least one group match is missing a result.

