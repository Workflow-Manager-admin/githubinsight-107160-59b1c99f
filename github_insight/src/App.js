import React, { useState } from 'react';
import './App.css';

/**
 * PUBLIC_INTERFACE
 * MainContainer is the root of the GitHubInsight app.
 * It manages the core layout: navigation, sidebar, main content.
 * Placeholders for all feature areas are provided in a clean, modern design.
 */
function App() {
  // State for current page/view (home, trending, statistics, profile, repos, etc.)
  const [view, setView] = useState('home');
  // State for search bar & persistent search history
  const [searchInput, setSearchInput] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  // Placeholder: Example trending and stats data
  const trendingRepos = ['octocat/Hello-World', 'facebook/react', 'vercel/next.js'];
  const trendingUsers = ['torvalds', 'gaearon', 'yyx990803'];
  const statsPlaceholder = {
    searches: 43,
    topSearch: 'react',
    trendingLang: 'JavaScript'
  };

  // Handler for navigation
  const handleNav = (target) => setView(target);

  // Handler for search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchHistory(prev => [searchInput, ...prev.filter(q => q !== searchInput)].slice(0, 7));
      setView('search');
    }
  };

  // Handler for clicking search history items
  const handleHistoryClick = (query) => {
    setSearchInput(query);
    setView('search');
  };

  // Render main content by view
  const renderContent = () => {
    switch (view) {
      case 'home':
      case 'search':
        return (
          <>
            <section className="gi-section gi-search-section">
              <form className="gi-searchbar" onSubmit={handleSearch} role="search" aria-label="Search GitHub">
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
              {view === 'search' && (
                <div className="gi-search-results-card">
                  <div className="gi-card-title">Search Results for: <span style={{color: 'var(--color-accent)'}}>{searchInput}</span></div>
                  <div className="gi-card-description">[Placeholder] Show live GitHub search results here.</div>
                </div>
              )}
            </section>
            <section className="gi-section gi-trending-section">
              <div className="gi-section-header">
                <h2>Trending <span className="gi-badge">Repositories</span></h2>
              </div>
              <div className="gi-card-grid">
                {trendingRepos.map(repo => (
                  <div key={repo} className="gi-card" tabIndex={0}>
                    <div className="gi-card-title">{repo}</div>
                    <div className="gi-card-description">[Placeholder] Trending repository info</div>
                  </div>
                ))}
              </div>
              <div className="gi-section-header" style={{marginTop: 36}}>
                <h2>Trending <span className="gi-badge">Developers</span></h2>
              </div>
              <div className="gi-card-grid">
                {trendingUsers.map(user => (
                  <div key={user} className="gi-card" tabIndex={0}>
                    <div className="gi-card-title">@{user}</div>
                    <div className="gi-card-description">[Placeholder] Trending developer info</div>
                  </div>
                ))}
              </div>
            </section>
          </>
        );
      case 'statistics':
        return (
          <section className="gi-section gi-statistics-section">
            <div className="gi-section-header">
              <h2>Statistics Dashboard</h2>
            </div>
            <div className="gi-card-grid">
              <div className="gi-card">
                <div className="gi-card-title">Total Searches</div>
                <div className="gi-stat-number">{statsPlaceholder.searches}</div>
              </div>
              <div className="gi-card">
                <div className="gi-card-title">Top Search</div>
                <div className="gi-stat-number">{statsPlaceholder.topSearch}</div>
              </div>
              <div className="gi-card">
                <div className="gi-card-title">Trending Language</div>
                <div className="gi-stat-number">{statsPlaceholder.trendingLang}</div>
              </div>
            </div>
            <div className="gi-card" style={{marginTop:36,minHeight:150}}>
              <div className="gi-card-title">[Placeholder] Visualizations: Add interactive charts & activity calendar here.</div>
            </div>
          </section>
        );
      case 'profile':
        return (
          <section className="gi-section gi-profile-section">
            <div className="gi-section-header">
              <h2>User Profile Visualization</h2>
            </div>
            <div className="gi-card">
              <div className="gi-card-title">[Placeholder] GitHub user profile: Activity calendar, Orgs, Language breakdown</div>
              <div className="gi-card-description">Show user details, stats and visualizations here.</div>
            </div>
          </section>
        );
      case 'repos':
        return (
          <section className="gi-section gi-repo-section">
            <div className="gi-section-header">
              <h2>Repository Management</h2>
            </div>
            <div className="gi-card-grid gi-card-grid-wide">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="gi-card gi-repo-card">
                  <div className="gi-card-title">[Repo] Example Repo {i}</div>
                  <div className="gi-card-description">[Placeholder] Repo card with filters, sorting, stats.</div>
                  <div className="gi-chip-list">
                    <span className="gi-chip">JS</span>
                    <span className="gi-chip">Stars: 120</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      default:
        return <div className="gi-section">Unknown page.</div>;
    }
  };

  return (
    <div className="gi-app-root">
      {/* Top Navigation Bar */}
      <nav className="gi-navbar" role="navigation" aria-label="Main navigation">
        <div className="gi-navbar-inner">
          <div className="gi-logo" onClick={() => handleNav('home')}>
            <span className="gi-logo-symbol" role="img" aria-label="Insight">🔎</span>
            GitHub<span style={{color:'var(--color-accent)'}}>Insight</span>
          </div>
          <ul className="gi-nav-links">
            <li><button className={`gi-nav-btn${view==='home'||view==='search'?' active':''}`} onClick={()=>handleNav('home')}>Home</button></li>
            <li><button className={`gi-nav-btn${view==='statistics'?' active':''}`} onClick={()=>handleNav('statistics')}>Statistics</button></li>
            <li><button className={`gi-nav-btn${view==='profile'?' active':''}`} onClick={()=>handleNav('profile')}>Profile</button></li>
            <li><button className={`gi-nav-btn${view==='repos'?' active':''}`} onClick={()=>handleNav('repos')}>Repositories</button></li>
          </ul>
        </div>
      </nav>
      {/* Main Content Layout */}
      <div className="gi-main-layout">
        {/* Sidebar with Search History */}
        <aside className="gi-sidebar" aria-label="Sidebar with search history">
          <div className="gi-sidebar-title">Search History</div>
          <ul className="gi-history-list">
            {searchHistory.length === 0 && <li className="gi-empty">(No searches yet)</li>}
            {searchHistory.map((query, idx) => (
              <li
                key={query+idx}
                className="gi-history-item"
                tabIndex={0}
                onClick={()=>handleHistoryClick(query)}
                aria-label={`Search: ${query}`}
              >
                <span className="gi-history-icon">⤹</span>
                <span className="gi-history-text">{query}</span>
              </li>
            ))}
          </ul>
        </aside>
        <main className="gi-content" role="main">
          {renderContent()}
        </main>
      </div>
      {/* Mobile bottom nav for small screens */}
      <nav className="gi-mobile-nav" role="navigation" aria-label="Mobile navigation">
        <button className={`gi-mobile-btn${view==='home'||view==='search'?' active':''}`} title="Home" onClick={()=>handleNav('home')}>🏠</button>
        <button className={`gi-mobile-btn${view==='statistics'?' active':''}`} title="Stats" onClick={()=>handleNav('statistics')}>📊</button>
        <button className={`gi-mobile-btn${view==='profile'?' active':''}`} title="Profile" onClick={()=>handleNav('profile')}>👤</button>
        <button className={`gi-mobile-btn${view==='repos'?' active':''}`} title="Repos" onClick={()=>handleNav('repos')}>📂</button>
      </nav>
    </div>
  );
}

export default App;
