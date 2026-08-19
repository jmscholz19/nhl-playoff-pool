export function rawDraftValue(draftNumber, { slope, intercept }) {
  return (intercept - slope * (draftNumber - 1)) / intercept;
}

export function applyDraftWeights(selections, params) {
  const withRaw = selections.map(s => ({
    ...s,
    rawDraftValue: Number.isFinite(s.rawDraftValue) ? s.rawDraftValue : rawDraftValue(s.draftNumber, params),
  }));
  const rawSum = withRaw.reduce((sum, s) => sum + s.rawDraftValue, 0);
  const scale = withRaw.length / rawSum;
  return {
    scale,
    selections: withRaw.map(s => ({ ...s, weightedDraftValue: s.rawDraftValue * scale })),
  };
}

export function teamExposure(selections, entrants) {
  const exposure = Object.fromEntries(entrants.map(e => [e.name ?? e, {}]));
  for (const s of selections) {
    const owner = s.owner;
    const team = s.teamAbbrev;
    if (!exposure[owner]) exposure[owner] = {};
    exposure[owner][team] = (exposure[owner][team] || 0) + (s.weightedDraftValue || 0);
  }
  return exposure;
}

export function relativeGainsForSeries(selections, entrants, teamA, teamB) {
  const names = entrants.map(e => e.name ?? e);
  const exposure = teamExposure(selections, entrants);
  const net = Object.fromEntries(names.map(name => [
    name,
    (exposure[name]?.[teamA] || 0) - (exposure[name]?.[teamB] || 0),
  ]));
  const gains = {};
  for (const name of names) {
    const others = names.filter(n => n !== name).map(n => net[n]);
    gains[name] = net[name] - (others.reduce((a,b) => a+b, 0) / Math.max(1, others.length));
  }
  return { teamA, teamB, exposure, net, gains };
}

export function calculateStandings(selections, entrants, pointsLastNight = {}) {
  const rows = entrants.map(e => {
    const owner = e.name ?? e;
    const mine = selections.filter(s => s.owner === owner);
    const playerPicks = mine.filter(s => s.type === 'player');
    const teamPicks = mine.filter(s => s.type === 'team');
    const playerPoints = playerPicks.reduce((sum,s) => sum + (s.stats?.points || 0), 0);
    const teamPoints = teamPicks.reduce((sum,s) => sum + (s.stats?.points || 0), 0);
    const active = playerPicks.filter(s => s.active);
    const activeGp = active.reduce((sum,s) => sum + (s.stats?.gp || 0), 0);
    const activePts = active.reduce((sum,s) => sum + (s.stats?.points || 0), 0);
    return {
      owner,
      playerPoints,
      teamPoints,
      total: playerPoints + teamPoints,
      pointsLastNight: pointsLastNight[owner] || 0,
      activePlayers: active.length,
      activePlayerPpg: activeGp ? activePts / activeGp : null,
      activePointShare: playerPoints ? activePts / playerPoints : null,
    };
  }).sort((a,b) => b.total - a.total || a.owner.localeCompare(b.owner));
  const lead = rows[0]?.total || 0;
  rows.forEach((r,i) => { r.rank=i+1; r.gapToLeader=lead-r.total; });
  return rows;
}

export function teamPickPoints(wins, seriesWins, scoring={teamWin:1,seriesWin:2}) {
  return wins * scoring.teamWin + seriesWins * scoring.seriesWin;
}

export function playerPickPoints(goals, assists, scoring={playerGoal:1,playerAssist:1}) {
  return goals * scoring.playerGoal + assists * scoring.playerAssist;
}

export function pairKey(a,b) { return [String(a),String(b)].sort().join('|'); }
