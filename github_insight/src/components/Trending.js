import React, { useEffect, useState } from "react";
import { fetchTrendingRepos, fetchTrendingUsers } from "../api/github";

/**
 * PUBLIC_INTERFACE
 * Trending component displays trending repositories and developers,
 * using live GitHub API data with loading/error states.
 */
function Trending() {
  // Trending state
  const [repos, setRepos] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch trending data on mount
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    // Fetch trending repos and users in parallel
    Promise.all([
      fetchTrendingRepos({ per_page: 8 }),
      fetchTrendingUsers({ per_page: 8 })
    ])
      .then(([repoRes, userRes]) => {
        if (!isMounted) return;
        setRepos(Array.isArray(repoRes.items) ? repoRes.items : []);
        setUsers(Array.isArray(userRes.items) ? userRes.items : []);
        setLoading(false);
      })
      .catch(e => {
        if (!isMounted) return;
        setError(
          e?.message?.replace("GitHub API Error:", "API:") ||
            "Failed to fetch trending data"
        );
        setRepos([]);
        setUsers([]);
        setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Helpers for repo/user card URLs and avatars
  function getRepoUrl(repo) {
    return `https://github.com/${repo.full_name}`;
  }
  function getUserUrl(user) {
    return `https://github.com/${user.login}`;
  }
  function getUserAvatar(user) {
    return user.avatar_url || "";
  }

  return (
    <section className="gi-section gi-trending-section">
      <div className="gi-section-header">
        <h2>
          Trending <span className="gi-badge">Repositories</span>
        </h2>
      </div>
      {loading ? (
        <div className="gi-card-description" style={{ color: "var(--color-accent)", fontWeight: 500, marginBottom: 10 }}>Loading…</div>
      ) : error ? (
        <div className="gi-card-description" style={{ color: "#b9002a", fontWeight: 500, marginBottom: 10 }}>{error}</div>
      ) : repos.length === 0 ? (
        <div className="gi-card-description" style={{ color: "var(--color-text-secondary)", margin: "13px 0" }}>
          No trending repositories found.
        </div>
      ) : (
        <div className="gi-card-grid">
          {repos.map(repo => (
            <div key={repo.id} className="gi-card gi-repo-card" tabIndex={0}>
              <div className="gi-card-title">
                <a
                  href={getRepoUrl(repo)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--color-accent)", textDecoration: "none" }}
                >
                  {repo.full_name}
                </a>
              </div>
              <div className="gi-card-description" style={{ minHeight: 34 }}>
                {repo.description
                  ? repo.description.length > 68
                    ? repo.description.slice(0, 68) + "…"
                    : repo.description
                  : <span style={{ color: "var(--color-text-secondary)" }}>(No description)</span>
                }
              </div>
              <div className="gi-chip-list">
                {repo.language && <span className="gi-chip">{repo.language}</span>}
                <span className="gi-chip">★ {repo.stargazers_count}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="gi-section-header" style={{ marginTop: 36 }}>
        <h2>
          Trending <span className="gi-badge">Developers</span>
        </h2>
      </div>
      {loading ? (
        <div className="gi-card-description" style={{ color: "var(--color-accent)", fontWeight: 500, marginBottom: 10 }}>Loading…</div>
      ) : error ? (
        <div className="gi-card-description" style={{ color: "#b9002a", fontWeight: 500, marginBottom: 10 }}>{error}</div>
      ) : users.length === 0 ? (
        <div className="gi-card-description" style={{ color: "var(--color-text-secondary)", margin: "13px 0" }}>
          No trending developers found.
        </div>
      ) : (
        <div className="gi-card-grid">
          {users.map(user => (
            <div key={user.id} className="gi-card" tabIndex={0} style={{display:"flex",alignItems:"center",gap:13}}>
              <a
                href={getUserUrl(user)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--color-accent)", textDecoration: "none", display: "flex", alignItems: "center", gap: 7 }}
              >
                <img
                  src={getUserAvatar(user)}
                  alt={user.login}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    marginRight: 6,
                    background: "#ededed",
                    border: "1.5px solid var(--color-border)",
                  }}
                  loading="lazy"
                />
                <span style={{ fontWeight: 600 }}>@{user.login}</span>
                {user.type === "Organization" && (
                  <span style={{
                    marginLeft: 5,
                    fontSize: "0.89em",
                    background: "#ffefbc",
                    color: "#cd8300",
                    padding: "2px 9px",
                    borderRadius: "8px"
                  }}>ORG</span>
                )}
              </a>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default Trending;
