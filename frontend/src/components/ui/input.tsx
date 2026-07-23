import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && <label className="label">{label}</label>}
        <div className="relative">
          {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400">{icon}</div>}
          <input
            ref={ref}
            className={cn('w-full bg-[#0F172A] border border-[#1e293b] rounded-xl px-4 py-3 text-white placeholder:text-[#64748B] transition-all duration-300 focus:outline-none focus:border-[#22C55E] focus:bg-[#111827] focus:shadow-lg focus:shadow-emerald-500/10', icon && 'pl-10', error && 'border-red-500 focus:border-red-500', className)}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
export default Input;
