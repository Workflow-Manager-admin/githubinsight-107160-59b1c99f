import React, { useState, useEffect, useRef } from "react";
import { searchRepositories, searchUsers } from "../api/github";

/**
 * PUBLIC_INTERFACE
 * Search component renders the search section, including the search bar,
 * provides debounced real-time GitHub API queries, and displays results with loading/error UI.
 */
function Search({
  searchInput,
  setSearchInput,
  onSearch,
  showResults,
  searchQuery
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [repoResults, setRepoResults] = useState([]);
  const [userResults, setUserResults] = useState([]);
  const [resultsReadyFor, setResultsReadyFor] = useState(""); // which query are results for
  const debounceRef = useRef();

  // Debounced side-effect for searching on query change when showing results
  useEffect(() => {
    // Only run when results to be shown, and there is nontrivial input/query
    if (!showResults || !searchQuery.trim()) {
      setRepoResults([]);
      setUserResults([]);
      setError(null);
      setPending(false);
      return;
    }
    setPending(true);
    setError(null);

    // Debounce
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // Parallel search both repos and users
      Promise.all([
        searchRepositories(searchQuery, { per_page: 5 }),
        searchUsers(searchQuery, { per_page: 5 })
      ])
        .then(([repoData, userData]) => {
          setRepoResults(Array.isArray(repoData.items) ? repoData.items : []);
          setUserResults(Array.isArray(userData.items) ? userData.items : []);
          setResultsReadyFor(searchQuery);
          setPending(false);
        })
        .catch(e => {
          setError(e.message || "Error fetching GitHub data");
          setRepoResults([]);
          setUserResults([]);
          setPending(false);
        });
    }, 450);

    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line
  }, [showResults, searchQuery]);

  // Helpers: Result links
  function getRepoUrl(repo) {
    return `https://github.com/${repo.full_name}`;
  }
  function getUserUrl(user) {
    return `https://github.com/${user.login}`;
  }

  // Main UI
  return (
    <section className="gi-section gi-search-section">
      <form
        className="gi-searchbar"
        onSubmit={onSearch}
        role="search"
        aria-label="Search GitHub"
      >
        <input
          type="text"
          placeholder="Search GitHub users or repositories…"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          className="gi-input"
          aria-label="GitHub search"
        />
        <button className="gi-btn gi-btn-accent" type="submit" aria-label="Submit Search">
          Search
        </button>
      </form>
      {showResults && (
        <div className="gi-search-results-card">
          <div className="gi-card-title">
            Search Results for: <span style={{ color: "var(--color-accent)" }}>{searchQuery}</span>
          </div>
          {/* Loading state */}
          {pending && (
            <div className="gi-card-description" style={{ color: "var(--color-accent)", fontWeight: 500 }}>
              Loading&hellip;
            </div>
          )}
          {/* Error state */}
          {error && (
            <div className="gi-card-description" style={{ color: "#b9002a", fontWeight: 500 }}>
              {error}
            </div>
          )}
          {/* Repo Results */}
          {!pending && !error && repoResults.length > 0 && (
            <>
              <div style={{marginTop:10, fontWeight:"bold"}}>Top Repositories</div>
              <ul style={{ listStyle: "none", paddingLeft: 0, margin: "7px 0 0 0" }}>
                {repoResults.map(repo => (
                  <li key={repo.id} style={{ marginBottom: 7 }}>
                    <a
                      href={getRepoUrl(repo)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "var(--color-accent)",
                        textDecoration: "none",
                        fontWeight: 500,
                      }}
                      className="gi-history-item"
                    >
                      <span style={{marginRight:6}}>📦</span>{repo.full_name}
                      <span style={{color:"var(--color-text-secondary)", marginLeft:7, fontSize:"0.98em"}}>
                        {repo.description && repo.description.length > 46
                          ? repo.description.slice(0, 46) + "…"
                          : repo.description}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
          {/* User Results */}
          {!pending && !error && userResults.length > 0 && (
            <>
              <div style={{marginTop:13, fontWeight:"bold"}}>Top Users</div>
              <ul style={{ listStyle: "none", paddingLeft: 0, margin: "7px 0 0 0" }}>
                {userResults.map(user => (
                  <li key={user.id} style={{ marginBottom: 7 }}>
                    <a
                      href={getUserUrl(user)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "var(--color-accent)",
                        textDecoration: "none",
                        fontWeight: 500,
                      }}
                      className="gi-history-item"
                    >
                      <span style={{marginRight:6}}>👤</span>
                      {user.login}
                      {user.type === "Organization" && (
                        <span style={{marginLeft:6, fontSize:"0.89em", background:"#ffefbc", color:"#cd8300", padding:"2px 7px", borderRadius:"8px"}}>ORG</span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
          {/* No Results */}
          {!pending && !error && repoResults.length === 0 && userResults.length === 0 && (
            <div className="gi-card-description" style={{ color: "var(--color-text-secondary)", marginTop:10 }}>
              No matches found for this query.
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default Search;
