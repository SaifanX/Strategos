import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsProps {
  data: {
    generation: number;
    [key: string]: number;
  }[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ data }) => {
  const behaviors = [
    { key: 'ALWAYS_COOPERATE', color: '#FFFFFF', label: 'Coop' },
    { key: 'ALWAYS_DEFECT', color: '#FF4500', label: 'Defect' },
    { key: 'TIT_FOR_TAT', color: '#00FFCC', label: 'T4T' },
    { key: 'GRUDGER', color: '#FFCC00', label: 'Grudge' },
    { key: 'RANDOM', color: '#9933FF', label: 'Rand' },
  ];

  const currentData = behaviors.map(b => ({
    name: b.label,
    value: data[data.length - 1]?.[b.key] || 0,
    color: b.color
  }));

  return (
    <div className="w-full h-full bg-black/40 backdrop-blur-sm border border-white/5 p-4 font-mono flex flex-col md:flex-row gap-4">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[10px] uppercase tracking-widest text-white/40">Population_Dynamics</h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[8px] uppercase tracking-widest justify-end">
            {behaviors.map(b => (
              <span key={b.key} style={{ color: b.color }}>
                {b.label}: {data[data.length - 1]?.[b.key] || 0}
              </span>
            ))}
          </div>
        </div>

        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis 
                dataKey="generation" 
                stroke="#ffffff20" 
                fontSize={8} 
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#ffffff20" 
                fontSize={8} 
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff10', fontSize: '10px' }}
                itemStyle={{ color: '#fff' }}
              />
              {behaviors.map(b => (
                <Line 
                  key={b.key}
                  type="monotone" 
                  dataKey={b.key} 
                  stroke={b.color} 
                  strokeWidth={1} 
                  dot={false} 
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="w-full md:w-32 flex flex-col items-center justify-center border-l border-white/5 pl-4">
        <h3 className="text-[8px] uppercase tracking-widest text-white/40 mb-2">Distribution</h3>
        <div className="h-24 w-24">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={currentData}
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={40}
                paddingAngle={2}
                dataKey="value"
                isAnimationActive={false}
              >
                {currentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 text-[8px] text-white/20 uppercase">Current_State</div>
      </div>
    </div>
  );
};
