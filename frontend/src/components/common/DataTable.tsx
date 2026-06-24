interface Column { key: string; header: string; render?: (row: any) => React.ReactNode; }
export default function DataTable({ columns, data, loading }: { columns: Column[]; data: any[]; loading?: boolean }) {
  if (loading) return <div className="p-8 text-center text-dark-400">Loading...</div>;
  if (!data.length) return <div className="p-8 text-center text-dark-400">No data</div>;
  return (
    <div className="overflow-x-auto"><table className="w-full">
      <thead><tr>{columns.map(c => <th key={c.key} className="table-header">{c.header}</th>)}</tr></thead>
      <tbody>{data.map((row, i) => <tr key={i} className="hover:bg-dark-700/50">{columns.map(c => <td key={c.key} className="table-cell">{c.render ? c.render(row) : row[c.key]}</td>)}</tr>)}</tbody>
    </table></div>
  );
}
