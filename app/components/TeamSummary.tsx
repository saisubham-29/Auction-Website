import { TeamSummary } from "../lib/api";

export default function TeamSummaryTable({ data }: { data: TeamSummary[] }) {
  const max = Math.max(...data.map((t) => t.startValue || 0), 1);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-400">
            <tr>
              {["Team", "Start Budget", "Total Spent", "Remaining", "Budget Used"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-gray-500">No team data.</td></tr>
            ) : data.map((t, i) => (
              <tr key={i} className={`border-t border-gray-800 hover:bg-yellow-500/5 transition-colors ${i % 2 === 0 ? "bg-gray-900/40" : ""}`}>
                <td className="px-5 py-3 font-semibold text-white">{t.team}</td>
                <td className="px-5 py-3 text-gray-300">₹{t.startValue.toLocaleString()}</td>
                <td className="px-5 py-3 text-red-400 font-medium">₹{t.totalSpent.toLocaleString()}</td>
                <td className={`px-5 py-3 font-semibold ${t.currentAmount >= 0 ? "text-green-400" : "text-red-400"}`}>
                  ₹{t.currentAmount.toLocaleString()}
                </td>
                <td className="px-5 py-3 w-48">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-800 rounded-full h-2">
                      <div className="bg-yellow-400 h-2 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min((t.totalSpent / max) * 100, 100)}%` }} />
                    </div>
                    <span className="text-xs text-gray-400 w-8">{Math.round((t.totalSpent / max) * 100)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
