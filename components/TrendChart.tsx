
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Review } from '../types';

interface TrendChartProps {
  reviews: Review[];
}

const TrendChart: React.FC<TrendChartProps> = ({ reviews }) => {
  const data = reviews
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(r => ({
      date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: r.score * 100,
      rating: r.rating
    }));

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[400px]">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800">Sentiment Trend</h3>
        <p className="text-sm text-slate-500">Tracking customer satisfaction score (%) over time</p>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
          <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
          />
          <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;
