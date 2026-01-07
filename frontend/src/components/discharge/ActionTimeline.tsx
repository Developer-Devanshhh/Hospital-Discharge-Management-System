import React from 'react';
import { Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface Task {
    time?: string;
    description: string;
    type?: 'medication' | 'activity' | 'general' | 'warning';
}

interface DayPlan {
    day: string;
    tasks: string[];
    medications?: string[];
}

interface ActionTimelineProps {
    plan: DayPlan[];
}

const ActionTimeline: React.FC<ActionTimelineProps> = ({ plan }) => {
    return (
        <div className="space-y-8 relative before:absolute before:left-4 md:before:left-8 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
            {plan.map((day, i) => (
                <div key={i} className="relative pl-12 md:pl-16">
                    {/* Day Marker */}
                    <div className="absolute left-1.5 md:left-5.5 top-0 w-6 h-6 md:w-6 md:h-6 rounded-full border-4 border-white bg-teal-600 shadow-sm z-10 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>

                    <div className="bg-white rounded-xl border border-stone-200 p-5 hover:border-teal-200 transition-colors shadow-sm">
                        <h3 className="text-lg font-bold text-teal-900 mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-teal-600" />
                            {day.day}
                        </h3>

                        <div className="space-y-3">
                            {day.tasks.map((task, j) => (
                                <div key={j} className="flex items-start gap-3 group">
                                    <div className="mt-1 w-5 h-5 rounded-full border-2 border-stone-300 group-hover:border-teal-500 transition-colors shrink-0" />
                                    <span className="text-stone-700 font-medium leading-relaxed">{task}</span>
                                </div>
                            ))}

                            {/* Medications Section for the Day */}
                            {day.medications && day.medications.length > 0 && (
                                <div className="mt-4 bg-teal-50/50 p-4 rounded-lg border border-teal-100">
                                    <p className="text-xs font-bold text-teal-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        Medications to take
                                    </p>
                                    <ul className="grid gap-2 sm:grid-cols-2">
                                        {day.medications.map((med, k) => (
                                            <li key={k} className="flex items-center gap-2 text-sm text-teal-900 bg-white p-2 rounded border border-teal-100 shadow-sm">
                                                <span className="w-1.5 h-1.5 bg-teal-400 rounded-full"></span>
                                                {med}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ActionTimeline;
