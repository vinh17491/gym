export default function Card({ children, className = '', hover = false, ...props }: { children: React.ReactNode; className?: string; hover?: boolean } & React.HTMLAttributes<HTMLDivElement>) {
  return <div className={['card', hover ? 'card-hover' : '', className].join(' ')} {...props}>{children}</div>
}
