import React from 'react';
import { cn } from '../utils';

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface SimpleChartProps {
  data: ChartDataPoint[];
  height?: number;
  showValues?: boolean;
  type?: 'bar' | 'line';
}

/**
 * Simple SVG-based chart component
 * No external dependencies required
 */
const SimpleChart: React.FC<SimpleChartProps> = ({
  data,
  height = 200,
  showValues = true,
  type = 'bar',
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-[#86868b]">
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;
  const padding = 40;
  const chartWidth = 600;
  const chartHeight = height;
  const barWidth = (chartWidth - padding * 2) / data.length - 10;

  if (type === 'bar') {
    return (
      <div className="w-full overflow-x-auto">
        <svg width={chartWidth} height={chartHeight + padding} className="w-full">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding + (chartHeight - padding) * (1 - ratio);
            return (
              <g key={ratio}>
                <line
                  x1={padding}
                  y1={y}
                  x2={chartWidth - padding}
                  y2={y}
                  stroke="#e5e5ea"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
                <text
                  x={padding - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill="#86868b"
                >
                  {Math.round(maxValue * ratio).toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {data.map((point, index) => {
            const barHeight = ((point.value - minValue) / range) * (chartHeight - padding);
            const x = padding + index * (barWidth + 10);
            const y = chartHeight - barHeight;
            const color = point.color || '#ffd700';

            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={color}
                  rx="4"
                  className="hover:opacity-80 transition-opacity"
                />
                {showValues && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 5}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#1d1d1f"
                    fontWeight="600"
                  >
                    {point.value.toLocaleString()}
                  </text>
                )}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 20}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#86868b"
                  transform={`rotate(-45 ${x + barWidth / 2} ${chartHeight + 20})`}
                >
                  {point.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  // Line chart
  const points = data.map((point, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * (chartWidth - padding * 2);
    const y = padding + (chartHeight - padding) * (1 - (point.value - minValue) / range);
    return { x, y, ...point };
  });

  const pathData = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  return (
    <div className="w-full overflow-x-auto">
      <svg width={chartWidth} height={chartHeight + padding} className="w-full">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padding + (chartHeight - padding) * (1 - ratio);
          return (
            <g key={ratio}>
              <line
                x1={padding}
                y1={y}
                x2={chartWidth - padding}
                y2={y}
                stroke="#e5e5ea"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <text
                x={padding - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="12"
                fill="#86868b"
              >
                {Math.round(maxValue * ratio).toLocaleString()}
              </text>
            </g>
          );
        })}

        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke={data[0]?.color || '#ffd700'}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill={point.color || '#ffd700'}
              className="hover:r-6 transition-all"
            />
            {showValues && (
              <text
                x={point.x}
                y={point.y - 10}
                textAnchor="middle"
                fontSize="11"
                fill="#1d1d1f"
                fontWeight="600"
              >
                {point.value.toLocaleString()}
              </text>
            )}
            <text
              x={point.x}
              y={chartHeight + 20}
              textAnchor="middle"
              fontSize="11"
              fill="#86868b"
              transform={`rotate(-45 ${point.x} ${chartHeight + 20})`}
            >
              {point.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export default SimpleChart;

