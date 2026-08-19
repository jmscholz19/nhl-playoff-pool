# NHL Playoff Pool

A self-updating web version of Jason's NHL playoff pool, rebuilt from the 2025 and 2026 Excel workbooks.

## What is included

- Player scoring: 1 point per goal + 1 point per assist.
- Team scoring: 1 point per playoff game win + 2 points per series win.
- Dashboard standings, player/team split and round-by-round scoring.
- Full draft/roster view.
- Cumulative Point History chart.
- Four-round playoff bracket.
- Draft-position-weighted Relative Gains analysis.
- Historical 2025 and 2026 seasons.
- Automated NHL data updater for future live seasons.
- Regression tests against the original spreadsheets.

## Public website

GitHub Pages publishes the `docs/` folder through `.github/workflows/deploy.yml`.

Pages is configured to deploy with GitHub Actions. The public site is:

`https://jmscholz19.github.io/nhl-playoff-pool/`

## New playoff season

The only annual setup is `config/live.json`.

1. Set `enabled` to `true`.
2. Set the playoff year and NHL `seasonId`.
3. Enter the pool entrants.
4. Enter each draft pick once, including NHL player IDs for player picks.
5. Commit the file.

After that, the GitHub Action validates the draft, reads NHL playoff data, calculates the pool and republishes the site automatically.

A player pick looks like:

```json
{"type":"player","owner":"Jay","draftRound":1,"draftNumber":4,"name":"Nathan MacKinnon","playerId":8477492,"teamAbbrev":"COL"}
```

A team pick looks like:

```json
{"type":"team","owner":"Norm","draftRound":3,"draftNumber":12,"name":"Carolina","teamAbbrev":"CAR"}
```

## Regression results

The tests preserve the workbook finals:

| Season | Norm | Bee | Jay | Finney |
|---|---:|---:|---:|---:|
| 2025 | 169 | 192 | 158 | 86 |
| 2026 | 191 | 162 | 125 | 124 |

The Relative Gains regression test also reproduces the 2026 Colorado vs Los Angeles values from the workbook.

## Architecture

`NHL web data → NHL adapter → scoring engine → generated season JSON → static dashboard → GitHub Pages`

The NHL endpoint assumptions are isolated in `scripts/nhl-client.mjs`, so a future API change does not require rewriting the scoring/UI layers.

## Local checks

Requires Node 20+.

```bash
npm test
npm run validate
npm run dev
```

The live season is currently disabled because the next draft has not happened yet; the website defaults to the completed 2026 pool.
