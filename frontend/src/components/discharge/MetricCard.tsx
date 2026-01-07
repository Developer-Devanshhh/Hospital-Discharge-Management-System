import React from 'react';
import { Activity } from 'lucide-react';

interface MetricCardProps {
    label: string;
    value: string | number;
    subtext?: string;
    icon?: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    color?: 'blue' | 'green' | 'red' | 'amber' | 'stone';
}

const MetricCard: React.FC<MetricCardProps> = ({
    label,
    value,
    subtext,
    icon = <Activity className="w-5 h-5" />,
    color = 'blue'
}) => {
    const colorStyles = {
        blue: "bg-blue-50 border-blue-100 text-blue-700",
        green: "bg-green-50 border-green-100 text-green-700",
        red: "bg-red-50 border-red-100 text-red-700",
        amber: "bg-amber-50 border-amber-100 text-amber-700",
        stone: "bg-stone-50 border-stone-100 text-stone-700",
    };

    const iconStyles = {
        blue: "text-blue-500 bg-blue-100",
        green: "text-green-500 bg-green-100",
        red: "text-red-500 bg-red-100",
        amber: "text-amber-500 bg-amber-100",
        stone: "text-stone-500 bg-stone-100",
    };

    return (
        <div className={`p-4 rounded-xl border ${colorStyles[color]} transition-all hover:shadow-md`}>
            <div className="flex justify-between items-start mb-2">
                <p className="font-medium text-sm opacity-80 uppercase tracking-wide">{label}</p>
                <div className={`p-2 rounded-lg ${iconStyles[color]}`}>
                    {icon}
                </div>
            </div>
            <div className="mt-1">
                <h3 className="text-2xl font-bold">{value}</h3>
                {subtext && <p className="text-sm mt-1 opacity-75">{subtext}</p>}
            </div>
        </div>
    );
};

export default MetricCard;
