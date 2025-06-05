import React from "react";

/**
 * PUBLIC_INTERFACE
 * Repositories component displays list of repositories in grid layout.
 */
function Repositories() {
  return (
    <section className="gi-section gi-repo-section">
      <div className="gi-section-header">
        <h2>Repository Management</h2>
      </div>
      <div className="gi-card-grid gi-card-grid-wide">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="gi-card gi-repo-card">
            <div className="gi-card-title">[Repo] Example Repo {i}</div>
            <div className="gi-card-description">
              [Placeholder] Repo card with filters, sorting, stats.
            </div>
            <div className="gi-chip-list">
              <span className="gi-chip">JS</span>
              <span className="gi-chip">Stars: 120</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Repositories;
