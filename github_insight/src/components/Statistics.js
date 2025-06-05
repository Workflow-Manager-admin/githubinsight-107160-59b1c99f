import React, { useMemo } from "react";

/**
 * PUBLIC_INTERFACE
 * BarChart - simple horizontal bar chart using SVG, accepts data [{label, value, color?}]
 */
function BarChart({ data, width = 320, height = 110, barHeight = 20, barGap = 12, showLabels = true }) {
  const max = Math.max(...data.map(d => d.value)) || 1;
  return (
    <svg width={width} height={height} role="img" aria-label="Bar chart">
      {data.map((item, i) => {
        const barW = (item.value / max) * (width - 90); // leave space for labels
        const y = i * (barHeight + barGap);
        return (
          <g key={item.label}>
            <rect
              x={80}
              y={y}
              width={barW}
              height={barHeight}
              fill={item.color || "var(--color-accent)"}
              rx={5}
              style={{ transition: "width 0.3s" }}
            />
            {showLabels && (
              <>
                <text x={2} y={y + barHeight * 0.7} fontSize="0.95em" fill="var(--color-primary)" fontWeight="600">
                  {item.label}
                </text>
                <text
                  x={barW + 86}
                  y={y + barHeight * 0.74}
                  fontSize="0.94em"
                  fill="var(--color-text-secondary)"
                >
                  {item.value}
                </text>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/**
 * PUBLIC_INTERFACE
 * PieChart - simple SVG pie chart, accepts data [{label, value, color}]
 */
function PieChart({ data, size = 110, strokeWidth = 22 }) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  let acc = 0;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Pie chart">
      {data.map((item, i) => {
        const start = acc / total;
        acc += item.value;
        const end = acc / total;
        const largeArc = end - start > 0.5 ? 1 : 0;
        const theta1 = 2 * Math.PI * start;
        const theta2 = 2 * Math.PI * end;
        const x1 = center + radius * Math.sin(theta1);
        const y1 = center - radius * Math.cos(theta1);
        const x2 = center + radius * Math.sin(theta2);
        const y2 = center - radius * Math.cos(theta2);
        const d = `
          M ${center} ${center}
          L ${x1} ${y1}
          A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
          Z
        `;
        return (
          <path
            key={item.label}
            d={d}
            fill={item.color || `hsl(${i * 47}, 68%, 62%)`}
            stroke="#fff"
            strokeWidth={1.3}
            aria-label={`${item.label}: ${item.value}`}
          />
        );
      })}
      {/* Optionally, show legend with color boxes */}
      <g>
        {data.map((d, i) => (
          <g key={i}>
            <rect x={size + 4} y={12 * i + 7} width={10} height={10} fill={d.color || `hsl(${i * 47}, 68%, 62%)`} rx={2} />
            <text x={size + 17} y={12 * i + 16} fontSize="0.93em" fill="var(--color-primary)">
              {d.label} ({d.value})
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

/**
 * PUBLIC_INTERFACE
 * LineChart - simple SVG line chart (for trends), accepts data [{label, value}]
 */
function LineChart({ data, width = 320, height = 105 }) {
  const max = Math.max(...data.map(d => d.value)) || 1;
  const min = Math.min(...data.map(d => d.value)) || 0;
  const range = Math.max(max - min, 1);
  const stepX = (width - 40) / (data.length - 1 || 1);

  // Build points string
  const points = data
    .map((d, i) => {
      const x = 22 + i * stepX;
      const y = height - 13 - ((d.value - min) / range) * (height - 35);
      return [x, y];
    });
  const pointsStr = points.map(p => p.join(",")).join(" ");

  // Optionally, show value dots
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Line chart">
      {/* guideline bg */}
      <polyline
        points={pointsStr}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={2.5}
        strokeLinejoin="round"
        style={{ filter: "drop-shadow(0px 1.2px 0.3px #bcc2d455)" }}
      />
      {points.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={3.7}
          fill="#fff"
          stroke="var(--color-accent)"
          strokeWidth={1.3}
        >
          <title>{data[i].label}: {data[i].value}</title>
        </circle>
      ))}
      {/* X labels */}
      {points.map(([x, y], i) => (
        <text
          key={i}
          x={x}
          y={height - 2}
          textAnchor="middle"
          fontSize="0.85em"
          fill="var(--color-text-secondary)"
        >
          {data[i].label}
        </text>
      ))}
    </svg>
  );
}

/**
 * PUBLIC_INTERFACE
 * Statistics component displays overall statistics in card format and visualizations.
 * Accepts stats object prop.
 *
 * stats = {
 *   searches: 43,
 *   topSearch: "react",
 *   trendingLang: "JavaScript",
 *   history: [...string],
 *   languageFrequency: {JS: 12, Python: 7, ...},
 *   searchTrends: [{label: 'Mon', value: 8}, ...]
 * }
 */
function Statistics({ stats }) {
  // Memo mock demo data using provided stats + fake data where unset
  // Activity trend over a week (line)
  const trendData = useMemo(() => {
    return stats && stats.searchTrends
      ? stats.searchTrends
      : [
          { label: "Mon", value: 7 },
          { label: "Tue", value: 11 },
          { label: "Wed", value: 17 },
          { label: "Thu", value: 24 },
          { label: "Fri", value: 18 },
          { label: "Sat", value: 6 },
          { label: "Sun", value: 8 },
        ];
  }, [stats]);

  // Language usage breakdown (pie/bar)
  const langFreqObj = stats && stats.languageFrequency
    ? stats.languageFrequency
    : { JavaScript: 13, Python: 8, TypeScript: 4, Go: 2, Ruby: 1 };

  const langFreq = Object.entries(langFreqObj)
    .map(([label, value], i) => ({
      label,
      value,
      color: `hsl(${i * 47},68%,62%)`,
    }))
    .filter(d => value > 0);

  // Search history bar chart
  const history = Array.isArray(stats?.history)
    ? stats.history
    : ["react", "vue", "nextjs", "github", "astro"];
  const freqByHistory = history.map((query, i) => ({
    label: query,
    value: Math.floor(Math.random() * 11 + 3), // random/fake freq for demo
    color: `var(--color-accent)`,
  })).sort((a, b) => b.value - a.value);

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
      {/* Line Chart: Search Trends (activity over days) */}
      <div className="gi-card" style={{ minHeight: 155, margin: "36px 0 16px 0" }}>
        <div className="gi-card-title" style={{ marginBottom: 6 }}>
          Activity Trend (Weekly)
        </div>
        <LineChart data={trendData} width={370} height={102} />
      </div>
      {/* Bar chart: Search History frequencies */}
      <div className="gi-card" style={{ minHeight: 150, marginBottom: 17 }}>
        <div className="gi-card-title" style={{ marginBottom: 7 }}>
          Most Searched Queries
        </div>
        <BarChart data={freqByHistory} width={340} height={Math.max(freqByHistory.length * 32, 100)} />
      </div>
      {/* Pie chart: Language breakdown */}
      <div className="gi-card" style={{ minHeight: 152, display: "flex", alignItems: "center", gap: 17 }}>
        <div>
          <div className="gi-card-title" style={{ marginBottom: 7 }}>
            Language Breakdown
          </div>
          <PieChart data={langFreq} size={116} strokeWidth={22} />
        </div>
      </div>
    </section>
  );
}

export default Statistics;
