export function BrandName({ className = "" }: { className?: string }) {
  return (
    <span className={`font-bold tracking-tight ${className}`}>
      PRIME <span className="text-blue-soft">BOT</span>
    </span>
  );
}
