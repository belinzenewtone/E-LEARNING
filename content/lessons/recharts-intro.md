# Recharts: Building Data Visualisations

## Why This Matters

Raw numbers are forgettable. Charts make data instantly understandable — trends, comparisons, and outliers jump off the screen. Recharts is the most popular React charting library because it's declarative (you compose components, not draw pixels) and works naturally with Next.js.

## Core Concepts

### Setup

```bash
npm install recharts
```

```tsx
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
```

### Your First Chart

```tsx
const data = [
  { name: "Week 1", hours: 12 },
  { name: "Week 2", hours: 15 },
  { name: "Week 3", hours: 10 },
  { name: "Week 4", hours: 18 },
];

function StudyHoursChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="hours" fill="#22d3ee" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

Always wrap charts in `ResponsiveContainer` — they scale to fit any screen.

### Chart Types

```tsx
// Line Chart — trends over time
<LineChart data={xpData}>
  <Line type="monotone" dataKey="xp" stroke="#22d3ee" strokeWidth={2} />
</LineChart>

// Area Chart — cumulative/magnitude
<AreaChart data={weeklyData}>
  <Area type="monotone" dataKey="minutes" fill="#22d3ee33" stroke="#22d3ee" />
</AreaChart>

// Pie Chart — proportions
<PieChart>
  <Pie data={trackData} dataKey="progress" nameKey="track" cx="50%" cy="50%">
    {trackData.map((entry, index) => (
      <Cell key={index} fill={index === 0 ? "#22d3ee" : "#34d399"} />
    ))}
  </Pie>
</PieChart>
```

### Custom Tooltips

```tsx
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border rounded-lg p-3 shadow-lg">
        <p className="font-medium">{label}</p>
        <p className="text-cyan-400">{payload[0].value} hours studied</p>
      </div>
    );
  }
  return null;
};

<Tooltip content={<CustomTooltip />} />
```

### Server Component + Client Chart Pattern

```tsx
// Server Component — fetches data
export default async function AnalyticsPage() {
  const studyData = await getStudyHoursByWeek();
  const xpData = await getXpOverTime();

  return (
    <div>
      <StudyHoursChart data={studyData} />
      <XpChart data={xpData} />
    </div>
  );
}

// Client Component — renders chart
"use client";
function StudyHoursChart({ data }: { data: ChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>{/* ... */}</BarChart>
    </ResponsiveContainer>
  );
}
```

### Multiple Series

```tsx
<LineChart data={progressData}>
  <Line type="monotone" dataKey="web" stroke="#22d3ee" name="Web Dev" />
  <Line type="monotone" dataKey="data" stroke="#34d399" name="Data Engineering" />
  <Legend />
  <Tooltip />
</LineChart>
```

## Try It Yourself

1. Create a bar chart showing study hours per week.
2. Add a line chart tracking XP earned over time.
3. Build a custom tooltip with formatted values.
4. Create a pie chart showing track completion percentages.

## Common Mistakes

- **Forgetting ResponsiveContainer**: Without it, charts have fixed width and overflow on mobile.
- **Client Component without "use client"**: Recharts uses browser APIs. The chart component must be a Client Component.
- **Wrong dataKey**: The `dataKey` prop must match exactly a key in your data objects. Typos cause empty charts.

## Checkpoint

1. How do you make Recharts charts responsive on mobile?
2. Why must chart components be Client Components?
3. How do you show multiple data series on one chart?
4. **Reflection**: What chart type best shows your learning progress?
