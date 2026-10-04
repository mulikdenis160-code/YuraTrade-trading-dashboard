export function BrandName({ className = "" }: { className?: string }) {
  return (
    <span className={`font-bold tracking-tight ${className}`}>
      VLADOS <span className="text-blue-soft">PRIME</span>
    </span>
  );
}
