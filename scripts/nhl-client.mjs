const BASE=process.env.NHL_API_BASE||'https://api-web.nhle.com/v1';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
export async function fetchJson(path,{attempts=4}={}){let last;for(let i=0;i<attempts;i++){try{const r=await fetch(`${BASE}${path}`,{headers:{accept:'application/json','user-agent':'nhl-playoff-pool/1.0'}});if(!r.ok)throw Error(`${r.status} ${r.statusText} for ${path}`);return await r.json()}catch(e){last=e;if(i<attempts-1)await sleep(750*(2**i))}}throw last}
export const getPlayoffBracket=season=>fetchJson(`/playoff-bracket/${season}`);
export const getClubSeasonSchedule=(team,seasonId)=>fetchJson(`/club-schedule-season/${team}/${seasonId}`);
export const getBoxscore=id=>fetchJson(`/gamecenter/${id}/boxscore`);
export async function getPlayoffGames(teams,seasonId){const all=new Map();for(const team of [...new Set(teams)]){const p=await getClubSeasonSchedule(team,seasonId);for(const g of p.games||[])if(Number(g.gameType)===3)all.set(g.id,g)}return [...all.values()].sort((a,b)=>String(a.startTimeUTC||a.gameDate).localeCompare(String(b.startTimeUTC||b.gameDate))||a.id-b.id)}
