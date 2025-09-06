import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function EarthquakeChart({ data }) {
  const chartData = data.map((eq) => ({
    name: eq.place.split(",")[0],
    magnitude: eq.magnitude,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData.slice(0, 10)}>
        <XAxis dataKey="name" hide />
        <YAxis />
        <Tooltip />
        <Bar dataKey="magnitude" fill="#ef4444" />
      </BarChart>
    </ResponsiveContainer>
  );
}
