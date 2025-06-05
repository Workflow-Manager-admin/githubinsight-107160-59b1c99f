import React, { useState, useEffect, useMemo } from "react";
import { searchRepositories } from "../api/github";

/**
 * PUBLIC_INTERFACE
 * Small custom Language Bar visualization component for each repo.
 * Accepts a languages object { JS: 13, Python: 2, ... }
 */
function RepoLanguageBar({ languages }) {
  const entries = Object.entries(languages || {});
  if (!entries.length) {
    return <span style={{ color: "#bbb", fontSize: "0.85em" }}>(no languages)</span>;
  }
  const total = entries.reduce((sum, [, v]) => sum + v, 0) || 1;
  let offset = 0;
  return (
    <svg width={84} height={10} viewBox="0 0 84 10" aria-label="Language bar" style={{ verticalAlign: "middle", marginLeft: 2 }}>
      {entries.map(([lang, value], i) => {
        const w = Math.round((value / total) * 84);
        const color = `hsl(${(lang.charCodeAt(0) * 37 + i * 25) % 360},60%,62%)`;
        const rect = <rect key={lang} x={offset} y={1} width={w} height={8} fill={color} rx={3}>
          <title>{lang}: {value}</title>
        </rect>;
        offset += w;
        return rect;
      })}
    </svg>
  );
}

/**
 * PUBLIC_INTERFACE
 * Filter and sort panel for repo grid.
 */
function RepoFiltersPanel({ filters, setFilters, availableLanguages }) {
  return (
    <div style={{
      display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 13,
      alignItems: "flex-end", background: "#fff", borderRadius: 10,
      padding: "14px 22px 11px 17px", boxShadow: "0 2px 9px var(--color-shadow)"
    }}>
      <div>
        <label style={{ fontWeight: 600 }}>
          Language:
          <select
            style={{ marginLeft: 8, padding: "3px 13px", borderRadius: 6, border: "1px solid var(--color-border)", background: "#f6f8fa", color: "#222" }}
            value={filters.language}
            onChange={e => setFilters(f => ({ ...f, language: e.target.value }))}
          >
            <option value="">Any</option>
            {availableLanguages.map(lang =>
              <option value={lang} key={lang}>{lang}</option>
            )}
          </select>
        </label>
      </div>
      <div>
        <label style={{ fontWeight: 600 }}>
          Sort by:
          <select
            style={{ marginLeft: 8, padding: "3px 13px", borderRadius: 6, border: "1px solid var(--color-border)", background: "#f6f8fa", color: "#222" }}
            value={filters.sort}
            onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}
          >
            <option value="best match">Best Match</option>
            <option value="stars">Stars</option>
            <option value="forks">Forks</option>
            <option value="updated">Recently Updated</option>
          </select>
        </label>
      </div>
      <div>
        <label style={{ fontWeight: 600 }}>
          Stars:
          <input
            type="number"
            min={0}
            step={1}
            placeholder="min"
            style={{ marginLeft: 8, width: 57, padding: "3px 8px", borderRadius: 6, border: "1px solid var(--color-border)" }}
            value={filters.minStars}
            onChange={e => setFilters(f => ({ ...f, minStars: e.target.value }))}
          />
        </label>
      </div>
      <div>
        <label style={{ fontWeight: 600 }}>
          Order:
          <select
            style={{ marginLeft: 8, padding: "3px 13px", borderRadius: 6, border: "1px solid var(--color-border)", background: "#f6f8fa", color: "#222" }}
            value={filters.order}
            onChange={e => setFilters(f => ({ ...f, order: e.target.value }))}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </label>
      </div>
      <div style={{ flex: 1, minWidth: 110 }} />
      {/* Reserved for future: filter by date, etc. */}
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Repositories component: displays a responsive grid of repositories
 * with advanced filtering, sorting, and language visualization.
 */
function Repositories() {
  // Repo data and UI state
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Advanced filter/sort states
  const [filters, setFilters] = useState({
    language: "",
    minStars: "",
    sort: "best match",
    order: "desc"
  });

  // Search state - For demo, default to "react" as a global search term.
  // In a real app, this might come from a higher-level context or user input.
  const [searchTerm, setSearchTerm] = useState("react");

  // Pagination state (future-proof for more complex paging)
  const [page] = useState(1);

  // Aggregate available languages
  const availableLanguages = useMemo(() => {
    const set = new Set();
    repos.forEach(r => r.language && set.add(r.language));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [repos]);

  // Fetch repository data whenever filters/search change
  useEffect(() => {
    setLoading(true);
    setErr(null);

    // Build search query string for GitHub API
    let q = searchTerm ? `${searchTerm}` : "stars:>1";
    if (filters.language) q += ` language:${filters.language}`;
    if (filters.minStars && Number(filters.minStars) > 0) q += ` stars:>=${filters.minStars}`;
    // Use sort/order from filters, per_page & page handled by state.
    const opts = {
      sort: filters.sort === "best match" ? undefined : filters.sort,
      order: filters.order,
      per_page: 24,
      page
    };

    searchRepositories(q, opts)
      .then(res => {
        setRepos(Array.isArray(res.items) ? res.items : []);
        setLoading(false);
      })
      .catch(e => {
        setRepos([]);
        setErr(e.message || "Error fetching repositories.");
        setLoading(false);
      });
  }, [filters, searchTerm, page]);

  // Helper to fetch languages for a specific repo (calls /languages endpoint)
  // For demo purposes, we'll cache in-session and only fetch top 12
  const [langCache, setLangCache] = useState({});
  useEffect(() => {
    // For the top displayed repos, fetch their language breakdown using the /languages API
    // NOTE: Not all repos have languages_url & this is rate-limited.
    let canceled = false;
    (async () => {
      const topRepos = repos.slice(0, 12).filter(r => r.languages_url);
      const already = Object.keys(langCache);
      // Only fetch for repos not cached yet.
      const toFetch = topRepos.filter(r => !already.includes(String(r.id)));
      if (toFetch.length === 0) return;
      const results = {};
      await Promise.all(
        toFetch.map(async repo => {
          try {
            const resp = await fetch(repo.languages_url);
            if (!resp.ok) throw new Error("API error");
            const langs = await resp.json();
            results[repo.id] = langs;
          } catch {
            results[repo.id] = {};
          }
        })
      );
      if (!canceled) setLangCache(lc => ({ ...lc, ...results }));
    })();
    return () => {
      canceled = true;
    };
    // eslint-disable-next-line
  }, [repos]);

  // UI: Handle filter/sort panel and custom search input
  function handleSearchInput(e) {
    setSearchTerm(e.target.value);
  }

  return (
    <section className="gi-section gi-repo-section">
      <div className="gi-section-header" style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <h2 style={{ marginRight: 11 }}>Repository Management</h2>
        <input
          type="text"
          className="gi-input"
          style={{ width: 180, fontSize: "1em", height: 32 }}
          placeholder="Search repositories…"
          value={searchTerm}
          onChange={handleSearchInput}
          aria-label="Repository search"
        />
      </div>

      <RepoFiltersPanel filters={filters} setFilters={setFilters} availableLanguages={availableLanguages} />

      {loading ? (
        <div className="gi-card-description" style={{ color: "var(--color-accent)", fontWeight: 500, margin: "18px 0" }}>Loading repositories…</div>
      ) : err ? (
        <div className="gi-card-description" style={{ color: "#b9002a", fontWeight: 500, margin: "18px 0" }}>{err}</div>
      ) : repos.length === 0 ? (
        <div className="gi-card-description" style={{ color: "var(--color-text-secondary)", margin: "18px 0" }}>
          No repositories found for this search/filter.
        </div>
      ) : (
        <div className="gi-card-grid gi-card-grid-wide">
          {repos.map(repo => (
            <div key={repo.id} className="gi-card gi-repo-card" style={{ minWidth: 256, maxWidth: 420, display: "flex", flexDirection: "column", gap: 4 }}>
              <div className="gi-card-title" style={{ fontWeight: "bold", fontSize: "1.08em", wordBreak: "break-all" }}>
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--color-accent)", textDecoration: "none" }}
                  title={"Open on GitHub: " + repo.full_name}
                >
                  {repo.full_name}
                </a>
              </div>
              <div className="gi-card-description" style={{ minHeight: 32, color: "#335" }}>
                {repo.description
                  ? repo.description.length > 90
                    ? repo.description.slice(0, 90) + "…"
                    : repo.description
                  : <span style={{ color: "var(--color-text-secondary)" }}>(No description)</span>
                }
              </div>
              <div className="gi-chip-list" style={{ flexWrap: "wrap" }}>
                {repo.language && <span className="gi-chip">{repo.language}</span>}
                <span className="gi-chip">★ {repo.stargazers_count}</span>
                <span className="gi-chip">Forks: {repo.forks_count}</span>
                <span className="gi-chip">Updated: {(repo.updated_at || "").slice(0, 10)}</span>
                <span className="gi-chip">Issues: {repo.open_issues_count}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 3 }}>
                <span style={{ fontWeight: 500, color: "#099", fontSize: ".92em" }}>Languages:</span>
                <RepoLanguageBar languages={langCache[repo.id]} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default Repositories;
