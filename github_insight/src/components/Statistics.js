import React from "react";

/**
 * PUBLIC_INTERFACE
 * Statistics component displays overall statistics in card format.
 * Accepts stats object prop.
 */
function Statistics({ stats }) {
  return (
    <section className="gi-section gi-statistics-section">
      <div className="gi-section-header">
        <h2>Statistics Dashboard</h2>
      </div>
      <div className="gi-card-grid">
        <div className="gi-card">
          <div className="gi-card-title">Total Searches</div>
          <div className="gi-stat-number">{stats.searches}</div>
        </div>
        <div className="gi-card">
          <div className="gi-card-title">Top Search</div>
          <div className="gi-stat-number">{stats.topSearch}</div>
        </div>
        <div className="gi-card">
          <div className="gi-card-title">Trending Language</div>
          <div className="gi-stat-number">{stats.trendingLang}</div>
        </div>
      </div>
      <div className="gi-card" style={{ marginTop: 36, minHeight: 150 }}>
        <div className="gi-card-title">
          [Placeholder] Visualizations: Add interactive charts & activity calendar here.
        </div>
      </div>
    </section>
  );
}

export default Statistics;
