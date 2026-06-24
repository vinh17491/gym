import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children: React.ReactNode }) {
  useEffect(() => {
    if (open) { document.body.style.overflow = 'hidden'; const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler); }
    else document.body.style.overflow = '';
  }, [open, onClose]);
  if (!open) return null
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div className='absolute inset-0 bg-black/60 backdrop-blur-sm' onClick={onClose} />
      <div className='relative bg-[#111827] border border-[#1e293b] rounded-xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl shadow-black/40 animate-scale-in' role='dialog' aria-modal='true' aria-label={title}>
        {title && <div className='flex items-center justify-between p-6 border-b border-[#1e293b]'><h3 className='text-lg font-semibold'>{title}</h3><button onClick={onClose} className='btn-ghost p-1 rounded-lg' aria-label='Close'><X size={18} /></button></div>}
        <div className='p-6'>{children}</div>
      </div>
    </div>
  )
}
