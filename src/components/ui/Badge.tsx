type Variant = 'owned' | 'repeated' | 'missing' | 'neutral';

interface BadgeProps {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  owned: 'bg-green-100 text-green-800',
  repeated: 'bg-yellow-100 text-yellow-800',
  missing: 'bg-gray-100 text-gray-600',
  neutral: 'bg-blue-100 text-blue-800',
};

export function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
