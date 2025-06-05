import React from "react";

/**
 * PUBLIC_INTERFACE
 * Trending component displays trending repositories and developers.
 * Accepts trendingRepos and trendingUsers arrays as props.
 */
function Trending({ trendingRepos, trendingUsers }) {
  return (
    <section className="gi-section gi-trending-section">
      <div className="gi-section-header">
        <h2>
          Trending <span className="gi-badge">Repositories</span>
        </h2>
      </div>
      <div className="gi-card-grid">
        {trendingRepos.map(repo => (
          <div key={repo} className="gi-card" tabIndex={0}>
            <div className="gi-card-title">{repo}</div>
            <div className="gi-card-description">
              [Placeholder] Trending repository info
            </div>
          </div>
        ))}
      </div>
      <div className="gi-section-header" style={{ marginTop: 36 }}>
        <h2>
          Trending <span className="gi-badge">Developers</span>
        </h2>
      </div>
      <div className="gi-card-grid">
        {trendingUsers.map(user => (
          <div key={user} className="gi-card" tabIndex={0}>
            <div className="gi-card-title">@{user}</div>
            <div className="gi-card-description">
              [Placeholder] Trending developer info
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Trending;
