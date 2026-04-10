import React from 'react';
import { FeedbackAttemptSummary } from '../types/quiz';

interface FeedbackTimelineProps {
    attempts: FeedbackAttemptSummary[];
    activeAttemptId?: number;
    onAttemptSelect?: (attempt: FeedbackAttemptSummary) => void;
}

const formatDate = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
};

const FeedbackTimeline: React.FC<FeedbackTimelineProps> = ({
    attempts,
    activeAttemptId,
    onAttemptSelect,
}) => {
    if (!attempts || attempts.length === 0) {
        return null;
    }

    return (
        <div className="rounded-xl p-4 mb-4 bg-white border border-gray-200 dark:bg-zinc-900 dark:border-transparent">
            <h3 className="text-sm font-medium mb-3 text-slate-900 dark:text-white">Attempt History</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {attempts.map((attempt, index) => {
                    const isActive = attempt.attempt_id === activeAttemptId;

                    return (
                        <button
                            key={attempt.attempt_id}
                            type="button"
                            onClick={() => onAttemptSelect?.(attempt)}
                            className={`rounded-lg px-3 py-2 border text-xs ${isActive
                                ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-700/50 dark:bg-indigo-900/20'
                                : 'border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:bg-zinc-800/80'
                                }`}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-slate-900 dark:text-white">Attempt {attempts.length - index}</span>
                                <span className="text-slate-700 dark:text-zinc-300">{Math.round(attempt.overall_score)}%</span>
                            </div>
                            <div className="text-[11px] mt-1 text-gray-600 dark:text-zinc-400">
                                {formatDate(attempt.created_at)}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default FeedbackTimeline;
