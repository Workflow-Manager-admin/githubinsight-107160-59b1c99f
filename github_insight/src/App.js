import React, { useState, useEffect } from "react";
import "./App.css";
import Search from "./components/Search";
import Trending from "./components/Trending";
import Statistics from "./components/Statistics";
import Profile from "./components/Profile";
import Repositories from "./components/Repositories";
import {
  getSearchHistory,
  addSearchQuery,
  setSearchHistory
} from "./utils/storage";

/**
 * PUBLIC_INTERFACE
 * MainContainer is the root of the GitHubInsight app.
 * It manages the core layout: navigation, sidebar, main content.
 * Now delegates feature areas to modular components.
 */
function App() {
  // View states
  const [view, setView] = useState("home");
  const [searchInput, setSearchInput] = useState("");
  const [searchHistory, setSearchHistoryState] = useState([]);

  // On mount, load search history from localStorage
  useEffect(() => {
    setSearchHistoryState(getSearchHistory());
  }, []);

  // Update localStorage when searchHistory changes
  useEffect(() => {
    setSearchHistory(searchHistory);
  }, [searchHistory]);

  // Placeholder: Example trending and stats data
  // (Trending data is now fetched in component; only statsPlaceholder remains here.)
  const statsPlaceholder = {
    searches: 43,
    topSearch: searchHistory[0] || "react",
    trendingLang: "JavaScript"
  };

  // Navigation handler
  const handleNav = (target) => setView(target);

  // Search handler (updates both local state and storage)
  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (trimmed) {
      addSearchQuery(trimmed);
      setSearchHistoryState(getSearchHistory()); // Sync state from storage
      setView("search");
    }
  };

  // History click handler
  const handleHistoryClick = (query) => {
    setSearchInput(query);
    setView("search");
  };

  // Render feature views
  let mainContent = null;
  if (view === "home" || view === "search") {
    mainContent = (
      <>
        <Search
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onSearch={handleSearch}
          showResults={view === "search"}
          searchQuery={searchInput}
        />
        <Trending />
      </>
    );
  } else if (view === "statistics") {
    mainContent = <Statistics stats={statsPlaceholder} />;
  } else if (view === "profile") {
    mainContent = <Profile />;
  } else if (view === "repos") {
    mainContent = <Repositories />;
  } else {
    mainContent = <div className="gi-section">Unknown page.</div>;
  }

  return (
    <div className="gi-app-root">
      {/* Top Navigation Bar */}
      <nav className="gi-navbar" role="navigation" aria-label="Main navigation">
        <div className="gi-navbar-inner">
          <div className="gi-logo" onClick={() => handleNav("home")}>
            <span className="gi-logo-symbol" role="img" aria-label="Insight">
              🔎
            </span>
            GitHub<span style={{ color: "var(--color-accent)" }}>Insight</span>
          </div>
          <ul className="gi-nav-links">
            <li>
              <button
                className={`gi-nav-btn${
                  view === "home" || view === "search" ? " active" : ""
                }`}
                onClick={() => handleNav("home")}
              >
                Home
              </button>
            </li>
            <li>
              <button
                className={`gi-nav-btn${view === "statistics" ? " active" : ""}`}
                onClick={() => handleNav("statistics")}
              >
                Statistics
              </button>
            </li>
            <li>
              <button
                className={`gi-nav-btn${view === "profile" ? " active" : ""}`}
                onClick={() => handleNav("profile")}
              >
                Profile
              </button>
            </li>
            <li>
              <button
                className={`gi-nav-btn${view === "repos" ? " active" : ""}`}
                onClick={() => handleNav("repos")}
              >
                Repositories
              </button>
            </li>
          </ul>
        </div>
      </nav>
      {/* Main Content Layout */}
      <div className="gi-main-layout">
        {/* Sidebar with Search History */}
        <aside className="gi-sidebar" aria-label="Sidebar with search history">
          <div className="gi-sidebar-title">Search History</div>
          <ul className="gi-history-list">
            {searchHistory.length === 0 && (
              <li className="gi-empty">(No searches yet)</li>
            )}
            {searchHistory.map((query, idx) => (
              <li
                key={query + idx}
                className="gi-history-item"
                tabIndex={0}
                onClick={() => handleHistoryClick(query)}
                aria-label={`Search: ${query}`}
              >
                <span className="gi-history-icon">⤹</span>
                <span className="gi-history-text">{query}</span>
              </li>
            ))}
          </ul>
        </aside>
        <main className="gi-content" role="main">
          {mainContent}
        </main>
      </div>
      {/* Mobile bottom nav for small screens */}
      <nav className="gi-mobile-nav" role="navigation" aria-label="Mobile navigation">
        <button
          className={`gi-mobile-btn${
            view === "home" || view === "search" ? " active" : ""
          }`}
          title="Home"
          onClick={() => handleNav("home")}
        >
          🏠
        </button>
        <button
          className={`gi-mobile-btn${view === "statistics" ? " active" : ""}`}
          title="Stats"
          onClick={() => handleNav("statistics")}
        >
          📊
        </button>
        <button
          className={`gi-mobile-btn${view === "profile" ? " active" : ""}`}
          title="Profile"
          onClick={() => handleNav("profile")}
        >
          👤
        </button>
        <button
          className={`gi-mobile-btn${view === "repos" ? " active" : ""}`}
          title="Repos"
          onClick={() => handleNav("repos")}
        >
          📂
        </button>
      </nav>
    </div>
  );
}

export default App;
