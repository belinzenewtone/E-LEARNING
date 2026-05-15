# Recharts: Building Data Visualisations

## 🎯 By End of This Lesson You Will:
- Build bar, line, and area charts with Recharts
- Use `ResponsiveContainer` for mobile-friendly charts
- Customize axes, tooltips, and tick formatters

---

## 🌍 Real-World Analogy First

Numbers in a table are facts. Numbers in a chart are **insights**:

```
Table:                          Chart:
Week  XP                              📈
─────────                         ────────
  1    50                              ╱
  2    80                            ╱
  3   120                          ╱
  4   200                        ╱

A table makes you READ. A chart makes you SEE.
```

For learning analytics — your study trends, XP over time, completion rates — charts turn raw numbers into stories.

---

## 📖 Start From Zero

### Install

```bash
npm install recharts
```

### Your First Chart

```tsx
"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { week: 1, xp: 50 },
  { week: 2, xp: 80 },
  { week: 3, xp: 120 },
  { week: 4, xp: 200 }
];

export function XPChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="week" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="xp" stroke="#22d3ee" />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

The structure: Wrap with `ResponsiveContainer`, choose a chart type, declare axes, then `<Line>` (or `<Bar>`, etc.) for each data series.

> **Important:** Recharts is a **client library** — always add `"use client"` at the top.

---

## 🔨 Level Up

### Step 1: Bar Chart

```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

<ResponsiveContainer width="100%" height={250}>
  <BarChart data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
    <XAxis dataKey="week" />
    <YAxis />
    <Tooltip />
    <Bar dataKey="xp" fill="#22d3ee" radius={[6, 6, 0, 0]} />
  </BarChart>
</ResponsiveContainer>
```

`radius={[6, 6, 0, 0]}` rounds the top corners of each bar.

---

### Step 2: Area Chart

```tsx
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

<ResponsiveContainer width="100%" height={300}>
  <AreaChart data={data}>
    <defs>
      <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.8} />
        <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
      </linearGradient>
    </defs>
    <XAxis dataKey="week" />
    <YAxis />
    <Tooltip />
    <Area
      type="monotone"
      dataKey="xp"
      stroke="#22d3ee"
      fill="url(#xpGradient)"
    />
  </AreaChart>
</ResponsiveContainer>
```

Gradients make charts feel modern and easy to scan.

---

### Step 3: Multiple Series

```tsx
const data = [
  { week: 1, web: 50, sql: 30 },
  { week: 2, web: 80, sql: 60 },
  { week: 3, web: 120, sql: 90 }
];

<LineChart data={data}>
  <Line dataKey="web" stroke="#22d3ee" name="Web Dev" />
  <Line dataKey="sql" stroke="#34d399" name="SQL" />
  <Legend />
</LineChart>
```

Two lines, one chart. The `name` prop is what the Legend and Tooltip display.

---

### Step 4: Custom Tooltip

```tsx
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-800 p-2 rounded">
      <p>Week {label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

<Tooltip content={<CustomTooltip />} />
```

Stop using the default Tooltip — custom ones match your design and are clearer.

---

### Step 5: Tick Formatters

For unfriendly numeric data:

```tsx
<XAxis
  dataKey="date"
  tickFormatter={(date) => new Date(date).toLocaleDateString("en", { month: "short", day: "numeric" })}
/>

<YAxis
  tickFormatter={(value) => `${value}xp`}
/>

<YAxis
  tickFormatter={(value) => value >= 1000 ? `${value/1000}k` : String(value)}
/>
```

Format huge numbers as "5k" or "1.2M" for cleaner axes.

---

### Step 6: ResponsiveContainer Tips

```tsx
// Always set height — width is auto
<ResponsiveContainer width="100%" height={300}>
  <LineChart>...</LineChart>
</ResponsiveContainer>

// For aspect ratio control:
<ResponsiveContainer width="100%" aspect={2}>
  <LineChart>...</LineChart>
</ResponsiveContainer>
```

> **Critical:** ResponsiveContainer requires its parent to have a defined height OR use fixed pixel height.

---

### Step 7: Pie Chart for Composition

```tsx
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  { name: "Completed", value: 65 },
  { name: "In Progress", value: 20 },
  { name: "Locked", value: 15 }
];
const colors = ["#34d399", "#22d3ee", "#888"];

<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie data={data} dataKey="value" nameKey="name" outerRadius={100} label>
      {data.map((_, i) => <Cell key={i} fill={colors[i]} />)}
    </Pie>
    <Tooltip />
    <Legend />
  </PieChart>
</ResponsiveContainer>
```

---

### Step 8: Loading and Empty States

```tsx
if (loading) return <Skeleton className="h-[300px]" />;
if (!data?.length) return <div>No data yet — log a study session to see your progress!</div>;
```

Always handle these states — empty charts are confusing.

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Line chart:**
```tsx
// Build a LineChart of XP over weeks 1-8 with mock data
// Add ResponsiveContainer, XAxis, YAxis, Tooltip
```

**Exercise 2 — Bar chart:**
```tsx
// Convert the above to a BarChart
// Round bar tops
```

**Exercise 3 — Area chart:**
```tsx
// Use AreaChart with a vertical gradient fill
```

**Exercise 4 — Multiple series:**
```tsx
// Two lines: web XP and SQL XP
// Different colors, with a Legend
```

**Exercise 5 — Custom tooltip:**
```tsx
// Build a custom tooltip showing "Week N: X XP"
```

**Exercise 6 — Format ticks:**
```tsx
// YAxis ticks should show "50 xp", "100 xp", etc.
// XAxis should show dates as "May 15"
```

**Exercise 7 — Pie chart:**
```tsx
// Pie chart of completion: Completed / In Progress / Locked
// Different colors for each
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Missing `"use client"` | Build error | Always add directive |
| ResponsiveContainer without height | Chart invisible | Set explicit height (px or `aspect`) |
| Wrong `dataKey` | Empty chart | Check the property name on your data |
| No Tooltip | Hard to read data | Always add `<Tooltip />` |
| Too many colors | Visually noisy | Limit to 3-5 series per chart |

---

## 🧠 Mental Model

```
1. <ResponsiveContainer height={N}>
2.   <ChartType data={array}>
3.     <CartesianGrid /> <XAxis> <YAxis>
4.     <Tooltip /> <Legend />
5.     <Bar | Line | Area dataKey="x" />
6.   </ChartType>
7. </ResponsiveContainer>

Recharts is a CLIENT library — always "use client".
Always provide a height for ResponsiveContainer.
```

---

## 📝 Check Your Understanding

1. **Define:** Why does Recharts need `"use client"`?
2. **Predict:** What happens if `ResponsiveContainer` has no height set?
3. **Find the bug:**
   ```tsx
   <LineChart data={data}>
     <Line dataKey="value" />
   </LineChart>
   ```
   Why doesn't this render anywhere?
4. **Write it:** A line chart showing XP over the last 7 days, with a date-formatted X axis.
5. **Apply it:** Build the analytics dashboard's "Study minutes per week" chart.
6. **Reflect:** When does a table beat a chart? When is a chart misleading?
