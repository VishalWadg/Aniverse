import React, { useState } from 'react';
import { FeedbackItem, FeedbackGroup } from '@/api/adminFeedbackApi';

interface MoveFeedbackModalProps {
  item: FeedbackItem | null;
  currentGroup: FeedbackGroup | null;
  availableGroups: FeedbackGroup[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (feedbackId: string, targetGroupId: string | undefined, createNewGroup: boolean) => void;
  isLoading?: boolean;
}

export const MoveFeedbackModal: React.FC<MoveFeedbackModalProps> = ({
  item,
  currentGroup,
  availableGroups,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [option, setOption] = useState<'new' | 'existing'>('new');
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen || !item) return null;

  const otherGroups = availableGroups.filter((g) => g.id !== currentGroup?.id);
  const filteredGroups = otherGroups.filter((g) =>
    g.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (option === 'new') {
      onConfirm(item.id, undefined, true);
    } else if (option === 'existing' && selectedTargetId) {
      onConfirm(item.id, selectedTargetId, false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 text-neutral-100">
        <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
          <h2 className="text-base font-semibold text-neutral-100">Move feedback to...</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-200 p-1 rounded-lg hover:bg-[#27272a]"
          >
            ✕
          </button>
        </div>

        {/* Selected Item Preview */}
        <div className="p-3 rounded-xl bg-[#09090b] border border-[#27272a]">
          <p className="text-xs text-neutral-400 font-medium mb-1">Selected Report:</p>
          <p className="text-sm text-neutral-200 line-clamp-2">{item.content}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Option 1: New Group */}
          <label className="flex items-start gap-3 p-3 rounded-xl border border-[#27272a] hover:border-[#3f3f46] cursor-pointer transition-colors bg-[#09090b]/40">
            <input
              type="radio"
              name="moveOption"
              checked={option === 'new'}
              onChange={() => setOption('new')}
              className="mt-1 accent-indigo-500"
            />
            <div>
              <span className="text-sm font-medium text-neutral-200">
                New group (splits off on its own)
              </span>
              <p className="text-xs text-neutral-500 mt-0.5">
                Creates a brand new triage cluster with this report as founder.
              </p>
            </div>
          </label>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#27272a]"></div>
            <span className="flex-shrink mx-3 text-xs text-neutral-500">or</span>
            <div className="flex-grow border-t border-[#27272a]"></div>
          </div>

          {/* Option 2: Move to Existing Group */}
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="moveOption"
                checked={option === 'existing'}
                onChange={() => setOption('existing')}
                className="accent-indigo-500"
              />
              <span className="text-sm font-medium text-neutral-200">
                Move to existing group
              </span>
            </label>

            {option === 'existing' && (
              <div className="pl-6 space-y-2 pt-1">
                <input
                  type="text"
                  placeholder="Search existing groups..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
                />

                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {filteredGroups.length === 0 ? (
                    <p className="text-xs text-neutral-500 py-2 text-center">
                      No matching groups found.
                    </p>
                  ) : (
                    filteredGroups.map((g) => (
                      <div
                        key={g.id}
                        onClick={() => setSelectedTargetId(g.id)}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                          selectedTargetId === g.id
                            ? 'bg-indigo-950/40 border-indigo-500 text-indigo-200'
                            : 'bg-[#09090b] border-[#27272a] text-neutral-300 hover:border-[#3f3f46]'
                        }`}
                      >
                        <p className="font-medium truncate">{g.title}</p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">
                          {g.impactCount} reports
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#27272a]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200 rounded-xl hover:bg-[#27272a]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || (option === 'existing' && !selectedTargetId)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-5 py-2 rounded-xl transition-all shadow-md disabled:opacity-50"
            >
              {isLoading ? 'Moving...' : 'Move'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
