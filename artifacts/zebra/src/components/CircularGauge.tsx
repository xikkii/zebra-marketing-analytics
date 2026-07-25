export default function CircularGauge({ 
  value, 
  size = 160, 
  strokeWidth = 12 
}: { 
  value: number; 
  size?: number; 
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - value * circumference;

  let color = "#F2637B"; // Red
  if (value >= 0.7) color = "#10B981"; // Green
  else if (value >= 0.4) color = "#E8A33D"; // Amber

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Text inside */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className="font-mono text-4xl font-bold text-foreground">
          {Math.round(value * 100)}%
        </span>
        <span className="text-xs uppercase tracking-wider text-muted-foreground mt-1 font-medium">
          Success Prob
        </span>
      </div>
    </div>
  );
}