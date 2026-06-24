import React from 'react'

interface Column { key: string; header: string; render?: (row: any) => React.ReactNode }

export default function DataTable({ columns, data, loading, emptyMessage = 'No data found' }: { columns: Column[]; data: any[]; loading?: boolean; emptyMessage?: string }) {
  if (loading) return <div className='p-8'><div className='space-y-3'>{[1,2,3,4,5].map(i => <div key={i} className='skeleton h-10 w-full'/>)}</div></div>
  if (!data.length) return (
    <div className='empty-state'>
      <div className='empty-state-icon'><svg className='w-6 h-6 text-[#64748B]' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4'/></svg></div>
      <p className='text-[#94A3B8] text-sm'>{emptyMessage}</p>
    </div>
  )
  return (
    <div className='table-wrap'>
      <table className='w-full'>
        <thead><tr>{columns.map(c => <th key={c.key} className='table-header'>{c.header}</th>)}</tr></thead>
        <tbody>{data.map((row, i) => <tr key={i} className='table-row'>{columns.map(c => <td key={c.key} className='table-cell'>{c.render ? c.render(row) : row[c.key]}</td>)}</tr>)}</tbody>
      </table>
    </div>
  )
}
