import React, { useState } from 'react';
import { FeedbackGroup, FeedbackItem } from '@/api/adminFeedbackApi';

interface FeedbackGroupCardProps {
  group: FeedbackGroup;
  onApprove?: (group: FeedbackGroup) => void;
  onDiscard?: (groupId: string) => void;
  onRestore?: (groupId: string) => void;
  onMoveItem?: (item: FeedbackItem, group: FeedbackGroup) => void;
  isExpandedDefault?: boolean;
}

export const FeedbackGroupCard: React.FC<FeedbackGroupCardProps> = ({
  group,
  onApprove,
  onDiscard,
  onRestore,
  onMoveItem,
  isExpandedDefault = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(isExpandedDefault);

  // Extract unique tags across all member feedback items
  const allTags = Array.from(
    new Set(group.feedbacks?.flatMap((f) => f.tags?.map((t) => t.name) || []) || [])
  );

  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 shadow-lg transition-all duration-200 hover:border-[#3f3f46]">
      {/* Group Card Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Chat / Speech Bubble Icon */}
          <div className="mt-0.5 shrink-0 text-neutral-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3 className="text-base font-medium text-neutral-100 leading-snug">
              {group.title}
            </h3>

            {/* Badges: Impact Count + Tags */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {/* Impact Count Badge */}
              <span className="bg-[#27272a] text-neutral-200 text-xs px-2.5 py-0.5 rounded-full font-medium tracking-wide">
                {group.impactCount} {group.impactCount === 1 ? 'report' : 'reports'}
              </span>

              {/* Tag Badges */}
              {allTags.map((tag) => (
                <span
                  key={tag}
                  className="bg-[#27272a] text-neutral-400 text-xs px-2.5 py-0.5 rounded-full font-normal"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Accordion Expand / Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-[#27272a] rounded-lg transition-colors shrink-0"
          aria-label={isExpanded ? 'Collapse report details' : 'Expand report details'}
        >
          <svg
            className={`w-5 h-5 transform transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Expanded Report Details Section */}
      {isExpanded && group.feedbacks && group.feedbacks.length > 0 && (
        <div className="mt-4 pt-3 border-t border-[#27272a] space-y-3">
          {group.feedbacks.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 py-2 px-3 rounded-xl bg-[#09090b]/50 border border-[#27272a]/50 hover:border-[#3f3f46]/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-neutral-300 font-normal leading-relaxed">
                  {item.content}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  {new Date(item.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>

              {/* Per-Item Detach / Move Action Button */}
              {onMoveItem && (
                <button
                  onClick={() => onMoveItem(item, group)}
                  className="shrink-0 px-3 py-1 text-xs font-medium text-neutral-300 border border-[#3f3f46] hover:bg-[#27272a] hover:text-white rounded-lg transition-colors"
                >
                  Detach
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Group Action Buttons Bar */}
      <div className="flex items-center gap-3 mt-4 pt-2">
        {group.status === 'PENDING' && (
          <>
            {/* Approve -> Create Issue Button */}
            {onApprove && (
              <button
                onClick={() => onApprove(group)}
                className="bg-[#14532d]/80 text-[#4ade80] hover:bg-[#14532d] border border-[#166534] px-4 py-1.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                Approve → create issue
              </button>
            )}

            {/* Discard Button */}
            {onDiscard && (
              <button
                onClick={() => onDiscard(group.id)}
                className="bg-transparent text-[#f87171] border border-[#7f1d1d]/80 hover:bg-[#450a0a]/60 px-4 py-1.5 rounded-xl font-medium text-sm transition-all duration-200 active:scale-95"
              >
                Discard
              </button>
            )}
          </>
        )}

        {/* Restore Button (Discarded Tab) */}
        {group.status === 'DISCARDED' && onRestore && (
          <button
            onClick={() => onRestore(group.id)}
            className="bg-transparent text-[#60a5fa] border border-[#1e3a8a] hover:bg-[#1e293b] px-4 py-1.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-1.5 active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Restore to pending
          </button>
        )}
      </div>
    </div>
  );
};
