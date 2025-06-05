import React, { useEffect, useState } from "react";
import {
  fetchUserProfile,
  fetchUserRepos,
  fetchOrganization
} from "../api/github";

/**
 * Custom Language Usage SVG Pie Chart (Mini, Adapted from Statistics)
 */
function LanguagePieChart({ data, size = 94, strokeWidth = 17 }) {
  const total = data.reduce((acc, d) => acc + d.value, 0) || 1;
  let acc = 0;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  return (
    <svg width={size + 60} height={size + 5} viewBox={`0 0 ${size + 60} ${size + 5}`}>
      {data.map((item, idx) => {
        const start = acc / total, theta1 = 2 * Math.PI * start;
        acc += item.value;
        const end = acc / total, theta2 = 2 * Math.PI * end;
        const largeArc = end - start > 0.5 ? 1 : 0;
        const x1 = center + radius * Math.sin(theta1),
          y1 = center - radius * Math.cos(theta1),
          x2 = center + radius * Math.sin(theta2),
          y2 = center - radius * Math.cos(theta2);
        const d = `
          M ${center} ${center}
          L ${x1} ${y1}
          A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
          Z
        `;
        return (
          <path
            d={d}
            key={item.label}
            fill={item.color || `hsl(${idx * 47},68%,62%)`}
            stroke="#fff"
            strokeWidth={0.8}
            aria-label={`${item.label}: ${item.value}`}
          />
        );
      })}
      {/* Legend */}
      {data.map((d, i) => (
        <g key={i}>
          <rect x={size + 4} y={10 + 13 * i} width={10} height={10} fill={d.color || `hsl(${i * 47},68%,62%)`} rx={2} />
          <text x={size + 17} y={18 + 13 * i} fontSize="0.90em" fill="var(--color-primary)">
            {d.label} ({d.value})
          </text>
        </g>
      ))}
    </svg>
  );
}

/**
 * Custom SVG Contributions Calendar (Very Basic, 7x18 grid week/day, simple version)
 */
function ContributionsCalendar({ activity }) {
  // activity: object like { '2024-05-10': 2, ... }
  // GitHub uses a grid: cols for week, rows for days (Sun-Sat), latest date is last col.
  // We'll make 18 weeks (cover ~126 days, 4 months), 7 rows.
  const weeks = 18, days = 7;
  // Find latest date in data, default to today
  let latest = new Date();
  // get history as array of {date: yyyy-mm-dd, count}
  let allDates = [];
  for (let i = weeks * days - 1; i >= 0; --i) {
    let d = new Date();
    d.setDate(d.getDate() - i);
    const yyyy = d.getFullYear(), mm = String(d.getMonth() + 1).padStart(2, "0"), dd = String(d.getDate()).padStart(2, "0");
    allDates.push({ date: `${yyyy}-${mm}-${dd}`, day: d.getDay() });
  }
  // Find min/max in data, to scale colors.
  const counts = allDates.map(d => activity[d.date] || 0);
  const max = Math.max(...counts, 1);
  // Simple color scale (green intensity)
  function getColor(count) {
    if (!count) return "#eaeaea";
    const pct = Math.min(1, count / (max || 1));
    const levels = ["#eaeaea", "#c6f7d3", "#7fd564", "#3aa655", "#195728"];
    if (pct === 0) return levels[0];
    if (pct < 0.15) return levels[1];
    if (pct < 0.50) return levels[2];
    if (pct < 0.85) return levels[3];
    return levels[4];
  }
  // Tooltip (show date/count)
  const [tip, setTip] = useState({ show: false, x: 0, y: 0, date: '', count: 0 });
  return (
    <div style={{ overflowX: "auto", width: "100%" }}>
      <svg width={weeks * 12 + 25} height={days * 12 + 12} style={{ display: "block" }}>
        {allDates.map((d, idx) => {
          const week = Math.floor(idx / days), day = d.day;
          const x = 18 + week * 12, y = 10 + day * 12;
          const count = activity[d.date] || 0;
          return (
            <rect
              key={d.date}
              x={x}
              y={y}
              width={10}
              height={10}
              rx={2}
              fill={getColor(count)}
              stroke="#bababa"
              strokeWidth={count ? 0.5 : 0.25}
              onMouseEnter={e => setTip({ show: true, x: x + 6, y: y - 10, date: d.date, count })}
              onMouseLeave={() => setTip({ show: false })}
            />
          );
        })}
        {/* Weekdays labels (first col) */}
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
          .map((label, i) => (
            <text key={label} x={8} y={19 + i * 12} fontSize="0.74em" fill="#ababab">{label[0]}</text>
          ))}
        {/* Tooltip */}
        {tip.show && (
          <g>
            <rect x={tip.x} y={tip.y} width={67} height={21} fill="#fff" stroke="#3aa655" rx={6} />
            <text x={tip.x + 8} y={tip.y + 13} fontSize="0.92em" fill="#195728">
              {tip.date}: {tip.count} contribution{tip.count === 1 ? "" : "s"}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Profile component displays user profile visualizations.
 * - Fetches user data from GitHub API
 * - Shows name, avatar, bio, followers, orgs, repos, language usage, and activity calendar
 */
function Profile() {
  // Choose a default username for demo or fetch from app state in future
  const DEFAULT_USERNAME = "octocat";
  const [username, setUsername] = useState(DEFAULT_USERNAME);
  const [profile, setProfile] = useState(null);
  const [repos, setRepos] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Demo activity calendar: map date string => integer (should fetch events if GitHub API allowed)
  const [activity, setActivity] = useState({});
  // Language frequency object: { JS: 8, Python: 4, ... }
  const [langFreq, setLangFreq] = useState([]);

  // Fetch profile, repos, orgs on mount/username change
  useEffect(() => {
    let cancel = false;
    setLoading(true);
    setErr(null);
    Promise.all([
      fetchUserProfile(username),
      fetchUserRepos(username, { per_page: 70 }), // Up to 70 for language stats/activity
    ])
      .then(async ([profileData, reposData]) => {
        if (cancel) return;
        setProfile(profileData);
        setRepos(reposData || []);
        // Fetch org details (API doesn't show user's org memberships directly in profile)
        let orgListRaw = profileData.organizations_url
          ? await (await fetch(profileData.organizations_url)).json()
          : [];
        // Defensive: if organizations_url fails, ignore orgs
        setOrgs(Array.isArray(orgListRaw) ? orgListRaw.slice(0, 8) : []);
        // Language frequency breakdown for mini-pie
        let langCount = {};
        (reposData || []).forEach(repo => {
          if (repo.language) {
            langCount[repo.language] = (langCount[repo.language] || 0) + 1;
          }
        });
        // Sort and pick top 7
        const sortedLangs = Object.entries(langCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 7)
          .map(([label, value], i) => ({
            label,
            value,
            color: `hsl(${i*41+201},81%,60%)`
          }));
        setLangFreq(sortedLangs);
        // Activity: use 'pushed_at' fields for primitive calendar
        let act = {};
        (reposData || []).forEach(repo => {
          // If repo has recent activity, mark day(s)
          if (repo.pushed_at) {
            // Only care about date
            const date = repo.pushed_at.slice(0, 10);
            act[date] = (act[date] || 0) + 1;
          }
          // (If we had access, would ideally use commits from events API.)
        });
        setActivity(act);
        setLoading(false);
      })
      .catch(e => {
        if (cancel) return;
        setErr(e.message || "Error fetching user profile");
        setLoading(false);
      });
    return () => { cancel = true; }
  }, [username]);

  // Render main user profile card
  return (
    <section className="gi-section gi-profile-section">
      <div className="gi-section-header">
        <h2>User Profile Visualization</h2>
      </div>
      <div className="gi-card" style={{display:'flex',flexWrap:'wrap',gap:22,alignItems:'flex-start',padding:'20px 13px 18px 23px',minHeight:170}}>
        {/* Left: Avatar & Info */}
        <div style={{minWidth: 160, maxWidth: 235, flex: '1 1 180px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '9px'}}>
          {/* Avatar */}
          {profile && (
            <img
              src={profile.avatar_url}
              alt={profile.name || profile.login}
              style={{ width: 82, height: 82, borderRadius: '50%', border: '3px solid var(--color-accent)', background: '#d7dce3', marginBottom: 3 }}
            />
          )}
          {/* Name & Username */}
          <div style={{fontWeight: "bold", fontSize: "1.19em", display: 'flex', flexDirection: 'column', alignItems: 'center', gap:3}}>
            {profile ? profile.name || profile.login : ""}
            <span style={{color:"var(--color-text-secondary)", fontSize:'0.97em', fontWeight:400}}>
              @{profile ? profile.login : ""}
            </span>
          </div>
          {profile && (
            <span style={{ background: "#e6f3fd", borderRadius: 12, color: "#005be9", padding: "2px 12px", fontSize: ".92em" }}>
              {profile.type}
            </span>
          )}
          {/* Followers/Following/Repos */}
          {profile && (
            <div style={{display:"flex", gap:10, fontSize:"0.96em", marginTop:4, flexWrap:'wrap',justifyContent:"center"}}>
              <span title="Followers">👥 {profile.followers}</span>
              <span title="Following">➡️ {profile.following}</span>
              <span title="Public Repos">📦 {profile.public_repos}</span>
            </div>
          )}
          {/* Link to GitHub */}
          {profile && (
            <a
              href={profile.html_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--color-accent)", fontWeight: 600, fontSize: ".96em", marginTop: 6, textDecoration: 'none' }}
            >
              View on GitHub ↗
            </a>
          )}
        </div>

        {/* Center: Bio, Org */}
        <div style={{minWidth: 180, maxWidth: 370, flex: '2 2 246px', marginLeft: 8}}>
          {/* Bio */}
          {profile && (
            <div>
              {profile.bio && (
                <div style={{ fontStyle: 'italic', color: "var(--color-text-secondary)", marginBottom: 6 }}>{profile.bio}</div>
              )}
              <div style={{ fontSize: "0.99em", marginBottom:6, color: "#035b87" }}>
                <span>🏢 {profile.company || "(No company listed)"}</span>
              </div>
              <div style={{ fontSize: "0.99em", color: "#557899" }}>
                {profile.location && <>📍 {profile.location}&nbsp;&nbsp;</>}
                {profile.blog && (
                  <a href={profile.blog.startsWith('http') ? profile.blog : 'https://' + profile.blog} target='_blank' rel='noopener noreferrer'
                    style={{ color: "#2677c4", textDecoration: "underline", fontSize: ".99em", marginLeft: 3 }}>
                    🌐 Website
                  </a>
                )}
              </div>
              {profile.email && (
                <div><a href={`mailto:${profile.email}`} style={{color: "#2677c4", fontSize: ".99em"}}>📧 {profile.email}</a></div>
              )}
            </div>
          )}

          {/* Orgs: Logo badges */}
          <div style={{marginTop: 8, marginBottom: 2}}>
            <div style={{fontWeight: 500, fontSize: "1.03em", marginBottom: 3, color: "#0c272e"}}>
              Organizations
            </div>
            {orgs && orgs.length === 0 && (
              <span style={{color: "#a0a7ad", fontSize: ".96em"}}>(None)</span>
            )}
            <div style={{display:"flex", flexWrap: "wrap", gap: 7}}>
              {orgs && orgs.map(org =>
                <a
                  key={org.id || org.login}
                  href={`https://github.com/${org.login}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={org.description || org.login}
                  style={{ display: "inline-block" }}
                >
                  <img
                    src={org.avatar_url}
                    alt={org.login}
                    style={{ width: 32, height: 32, borderRadius: "50%", border: "1.7px solid var(--color-border)", background: "#e6e8ee", boxShadow: "0 1px 4px #a5bac443", marginRight: 2 }}
                  />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right: Language SVG pie + Contributions heatmap */}
        <div style={{minWidth: 170, maxWidth: 256, flex: '1 1 180px', marginLeft: "4px", display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14}}>
          <div>
            <div style={{ fontWeight: 500, marginBottom: 1, color: "#095038", fontSize: "0.98em"}}>
              Language Usage
            </div>
            {langFreq && langFreq.length === 0 && <span style={{color: "#aaa"}}>No detected data</span>}
            {langFreq && langFreq.length > 0 && <LanguagePieChart data={langFreq} size={94} strokeWidth={17} />}
          </div>
          <div>
            <div style={{ fontWeight: 500, marginBottom: 1, color: "#095038", fontSize: "0.98em"}}>
              Activity Calendar
            </div>
            <ContributionsCalendar activity={activity} />
          </div>
        </div>
      </div>
      {loading && (
        <div className="gi-card-description" style={{ color: "var(--color-accent)", fontWeight: 500, marginTop: 18 }}>
          Loading GitHub user… <span style={{fontWeight:300,fontSize:".94em"}}>[{username}]</span>
        </div>
      )}
      {err && (
        <div className="gi-card-description" style={{ color: "#b9002a", fontWeight: 500, marginTop:12 }}>
          {err}
        </div>
      )}
      {/* (For demo: allow switching user by editing below. In real app, integrate with search/selection.) */}
      <div style={{marginTop:9, color: "#898f99", fontSize: "0.97em"}}>
        {/* Quick username switcher for testing */}
        <form style={{display:'inline'}} onSubmit={e => { e.preventDefault(); setUsername(e.target.elements.u.value.trim() || 'octocat') }}>
          Change user:
          <input name="u" type="text" style={{ marginLeft: 7, padding: "2.5px 7px", borderRadius: 7, border: "1.3px solid var(--color-border)", fontSize: "1em", background: "#f8fafc", width: 110 }}
            defaultValue={username} />
          <button type="submit" style={{marginLeft:6, background:'var(--color-accent)',color:'#fff',border:'none',borderRadius:5,padding:'4px 10px',fontSize:".93em",fontWeight:500,cursor:'pointer'}}>Go</button>
        </form>
        <span style={{marginLeft:13}}>e.g. octocat, torvalds</span>
      </div>
    </section>
  );
}

export default Profile;
