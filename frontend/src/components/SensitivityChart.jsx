import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceDot
} from 'recharts';
import { LineChart as ChartIcon, SlidersHorizontal } from 'lucide-react';
import { fetchSensitivity } from '../services/api';
import { PARAM_CONFIGS } from '../services/surrogate';

export default function SensitivityChart({ currentParameters, weatherContext }) {
  const [selectedParam, setSelectedParam] = useState('pulse_on_time');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const currentConfig = PARAM_CONFIGS.find(p => p.name === selectedParam) || PARAM_CONFIGS[0];
  const currentValue = currentParameters[selectedParam] ?? currentConfig.default_val;

  useEffect(() => {
    let isMounted = true;
    async function loadSensitivity() {
      setLoading(true);
      try {
        const res = await fetchSensitivity(currentParameters, selectedParam, weatherContext);
        if (isMounted && res.data && res.data.data) {
          setData(res.data.data);
        }
      } catch (e) {
        console.error('Sensitivity sweep error:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadSensitivity();
    return () => {
      isMounted = false;
    };
  }, [selectedParam, currentParameters, weatherContext]);

  const currentPoint = data.reduce((prev, curr) => {
    return Math.abs(curr.param_value - currentValue) < Math.abs(prev.param_value - currentValue) ? curr : prev;
  }, data[0] || {});

  return (
    <div className="claude-card p-5 sm:p-6 transition-all duration-150">
      
      {/* Header and Parameter Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#E8E2D8] dark:border-[#34312B]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#FAF8F5] dark:bg-[#181715] border border-[#E8E2D8] dark:border-[#34312B] text-[#CC5A2B]">
            <ChartIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-[#1F1E1D] dark:text-[#EDE8E1]">
              Response Surface Sensitivity Sweep
            </h3>
            <p className="text-xs text-[#78716C] dark:text-[#A8A29E]">
              Atmospheric-coupled variation across operating parameter bounds
            </p>
          </div>
        </div>

        {/* Parameter Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {PARAM_CONFIGS.map((p) => {
            const isSelected = p.name === selectedParam;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => setSelectedParam(p.name)}
                className={`px-3 py-1 text-xs rounded-xl whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#CC5A2B] text-white font-semibold shadow-sm'
                    : 'bg-[#FAF8F5] dark:bg-[#181715] text-[#78716C] dark:text-[#A8A29E] hover:text-[#1F1E1D] border border-[#E8E2D8] dark:border-[#34312B]'
                }`}
              >
                {p.label.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sweep summary banner */}
      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#FAF8F5] dark:bg-[#181715] border border-[#E8E2D8] dark:border-[#34312B] text-xs mb-3">
        <span className="text-[#78716C] flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#CC5A2B]" />
          Sweeping <strong className="text-[#1F1E1D] dark:text-[#EDE8E1]">{currentConfig.label}</strong>
        </span>
        <span className="font-mono text-[#78716C]">
          Operating Setpoint: <strong className="text-[#CC5A2B]">{currentValue} {currentConfig.unit}</strong>
        </span>
      </div>

      {/* Recharts Curve */}
      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 15, left: -5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis
              dataKey="param_value"
              stroke="#A8A29E"
              fontSize={10}
              tickLine={false}
              unit={` ${currentConfig.unit}`}
            />
            <YAxis
              yAxisId="left"
              stroke="#CC5A2B"
              fontSize={10}
              tickLine={false}
              domain={['auto', 'auto']}
              unit=" mm³"
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#0D9488"
              fontSize={10}
              tickLine={false}
              domain={['auto', 'auto']}
              unit=" µm"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#22201D',
                borderRadius: '8px',
                border: '1px solid #34312B',
                fontSize: '11px',
                color: '#EDE8E1'
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ fontSize: '11px', paddingBottom: '6px' }}
            />

            <Line
              yAxisId="left"
              type="monotone"
              dataKey="mrr"
              name="MRR (mm³/min) [Higher = Better]"
              stroke="#CC5A2B"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="roughness"
              name="Roughness Ra (µm) [Lower = Better]"
              stroke="#0D9488"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />

            {currentPoint && currentPoint.param_value !== undefined && (
              <ReferenceDot
                yAxisId="left"
                x={currentPoint.param_value}
                y={currentPoint.mrr}
                r={5}
                fill="#CC5A2B"
                stroke="#fff"
                strokeWidth={2}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
