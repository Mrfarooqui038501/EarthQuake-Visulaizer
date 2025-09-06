export default function Filters({ filters, setFilters }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-2">Filters</h2>

      {/* Magnitude Filter */}
      <label className="block mb-2">Minimum Magnitude: {filters.magnitude}</label>
      <input
        type="range"
        min="0"
        max="8"
        value={filters.magnitude}
        onChange={(e) =>
          setFilters({ ...filters, magnitude: Number(e.target.value) })
        }
        className="w-full"
      />

      {/* Time Filter */}
      <label className="block mt-4 mb-2">Time Range:</label>
      <select
        className="w-full border rounded p-2"
        value={filters.time}
        onChange={(e) => setFilters({ ...filters, time: e.target.value })}
      >
        <option value="day">Past Day</option>
        <option value="week">Past Week</option>
        <option value="month">Past Month</option>
      </select>
    </div>
  );
}
