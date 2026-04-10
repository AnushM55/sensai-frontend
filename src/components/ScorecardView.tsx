import React, { useState } from 'react';
import { ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react';
import {
    ChatMessage,
    FeedbackAttemptSummary,
    FeedbackCriterionDiff,
    ScorecardItem,
} from '../types/quiz';
import LearnerScorecard from './LearnerScorecard';
import FeedbackTimeline from './FeedbackTimeline';

interface ScorecardViewProps {
    activeScorecard: ScorecardItem[];
    handleBackToChat: () => void;
    lastUserMessage: ChatMessage | null;
    feedbackAttempts?: FeedbackAttemptSummary[];
    activeAttemptId?: number;
    onReevaluate?: () => void;
    isReevaluating?: boolean;
    currentDiff?: FeedbackCriterionDiff[];
}

const ScorecardView: React.FC<ScorecardViewProps> = ({
    activeScorecard,
    handleBackToChat,
    lastUserMessage,
    feedbackAttempts = [],
    activeAttemptId,
    onReevaluate,
    isReevaluating = false,
    currentDiff = [],
}) => {
    const [isTextExpanded, setIsTextExpanded] = useState(false);

    const toggleTextExpansion = () => {
        setIsTextExpanded(!isTextExpanded);
    };

    return (
        <div className="flex flex-col h-full px-6 py-6 overflow-auto relative">
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={handleBackToChat}
                    className="inline-flex cursor-pointer justify-center items-center rounded-full w-10 h-10 focus:outline-none bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-[#1D1D1D] dark:text-white dark:hover:bg-[#2A2A2A]"
                >
                    <ChevronLeft size={24} />
                </button>

                {onReevaluate && (
                    <button
                        onClick={onReevaluate}
                        disabled={isReevaluating}
                        className={`px-3 py-1.5 rounded-full text-xs transition-colors border ${isReevaluating
                            ? 'opacity-60 cursor-not-allowed bg-gray-100 text-gray-500 border-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:border-indigo-500 cursor-pointer'
                            }`}
                        type="button"
                    >
                        {isReevaluating ? 'Re-evaluating...' : 'Re-evaluate'}
                    </button>
                )}
            </div>

            <div className="overflow-y-auto hide-scrollbar h-full pt-2">
                <FeedbackTimeline attempts={feedbackAttempts} activeAttemptId={activeAttemptId} />

                {currentDiff.length > 0 && (
                    <div className="rounded-xl p-4 mb-4 bg-white border border-gray-200 dark:bg-zinc-900 dark:border-transparent">
                        <h3 className="text-sm font-medium mb-2 text-slate-900 dark:text-white">Changes from previous attempt</h3>
                        <div className="flex flex-wrap gap-2">
                            {currentDiff.map((diff) => (
                                <span
                                    key={`${diff.criterion_name}-${diff.change}`}
                                    className={`text-[11px] px-2 py-1 rounded-full border ${diff.change === 'improved'
                                        ? 'text-emerald-700 border-emerald-200 bg-emerald-50 dark:text-emerald-300 dark:border-emerald-900/40 dark:bg-emerald-900/20'
                                        : diff.change === 'regressed'
                                            ? 'text-rose-700 border-rose-200 bg-rose-50 dark:text-rose-300 dark:border-rose-900/40 dark:bg-rose-900/20'
                                            : 'text-slate-700 border-slate-200 bg-slate-50 dark:text-slate-300 dark:border-zinc-700 dark:bg-zinc-800/60'
                                        }`}
                                >
                                    {diff.criterion_name}: {diff.change}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex flex-col mb-6">
                    <div className="text-center">
                        {lastUserMessage ? (
                            lastUserMessage.messageType === 'audio' && lastUserMessage.audioData ? (
                                <div className="flex flex-col items-center">
                                    <audio
                                        controls
                                        className="w-full sm:w-3/4 mt-2"
                                        src={`data:audio/wav;base64,${lastUserMessage.audioData}`}
                                    />
                                </div>
                            ) : (
                                <div className="relative">
                                    <div className="max-w-lg mx-auto">
                                        <p className={`text-sm text-left ${!isTextExpanded ? 'line-clamp-2' : ''} text-gray-700 dark:text-gray-300`}>
                                            {lastUserMessage.content}
                                        </p>
                                        {lastUserMessage.content && lastUserMessage.content.length > 80 && (
                                            <button
                                                onClick={toggleTextExpansion}
                                                className="mt-4 px-3 py-1.5 text-sm rounded-full transition-colors flex items-center cursor-pointer mx-auto bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-[#222222] dark:text-white dark:hover:bg-[#333333]"
                                            >
                                                {isTextExpanded ? (
                                                    <>
                                                        <ChevronUp size={14} className="mr-1" />
                                                        View less
                                                    </>
                                                ) : (
                                                    <>
                                                        <ChevronDown size={14} className="mr-1" />
                                                        View more
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        ) : (
                            <h2 className="text-xl font-light text-slate-900 dark:text-white">Detailed Report</h2>
                        )}
                    </div>
                </div>

                <LearnerScorecard scorecard={activeScorecard} className="mt-0" />
            </div>
        </div>
    );
};

export default ScorecardView; 