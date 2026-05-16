interface StatCardProps {
  label: string;
  value: number | string;
  color?: 'green' | 'yellow' | 'gray' | 'blue';
}

const colorClasses = {
  green: 'bg-green-50 text-green-700',
  yellow: 'bg-yellow-50 text-yellow-700',
  gray: 'bg-gray-50 text-gray-600',
  blue: 'bg-blue-50 text-blue-700',
};

export function StatCard({ label, value, color = 'blue' }: StatCardProps) {
  return (
    <div className={`rounded-xl p-4 ${colorClasses[color]}`}>
      <p className="text-sm font-medium opacity-70">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}
