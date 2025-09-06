export default function EarthquakeList({ data, onSelect }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 h-full flex flex-col">
      <h2 className="text-lg font-bold mb-3 text-red-600">📋 Recent Earthquakes</h2>
      <ul className="overflow-y-auto flex-1 divide-y divide-gray-200">
        {data.slice(0, 10).map((eq) => (
          <li
            key={eq.id}
            className="p-2 cursor-pointer hover:bg-red-50 rounded"
            onClick={() => onSelect(eq)}
          >
            <div className="flex justify-between">
              <span className="font-semibold text-gray-800">
                M {eq.magnitude.toFixed(1)}
              </span>
              <span className="text-xs text-gray-500">{eq.time}</span>
            </div>
            <p className="text-sm text-gray-600 truncate">{eq.place}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
