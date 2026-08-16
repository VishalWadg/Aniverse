import React, { useState, useEffect } from 'react';
import { FeedbackGroup } from '@/api/adminFeedbackApi';

interface ApproveIssueModalProps {
  group: FeedbackGroup | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { groupId: string; title: string; body: string; labels: string[] }) => void;
  isLoading?: boolean;
}

export const ApproveIssueModal: React.FC<ApproveIssueModalProps> = ({
  group,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [labels, setLabels] = useState<string[]>([]);
  const [newLabelInput, setNewLabelInput] = useState('');

  useEffect(() => {
    if (group) {
      setTitle(group.title);

      // Pre-fill body from aggregated reports
      const aggregatedContent = group.feedbacks
        ?.map((f, idx) => `### Report ${idx + 1}\n${f.content}`)
        .join('\n\n');
      setBody(
        `## Summary\n${group.title}\n\n## Feedback Reports (${group.impactCount} reports)\n${
          aggregatedContent || ''
        }`
      );

      // Extract labels from tags
      const groupLabels = Array.from(
        new Set(group.feedbacks?.flatMap((f) => f.tags?.map((t) => t.name) || []) || [])
      );
      setLabels(groupLabels);
    }
  }, [group]);

  if (!isOpen || !group) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      groupId: group.id,
      title,
      body,
      labels,
    });
  };

  const addLabel = () => {
    if (newLabelInput.trim() && !labels.includes(newLabelInput.trim())) {
      setLabels([...labels, newLabelInput.trim()]);
      setNewLabelInput('');
    }
  };

  const removeLabel = (labelToRemove: string) => {
    setLabels(labels.filter((l) => l !== labelToRemove));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 text-neutral-100">
        <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
          <h2 className="text-lg font-semibold text-neutral-100 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Create GitHub Issue
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-200 p-1 rounded-lg hover:bg-[#27272a]"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              Issue Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#09090b] border border-[#27272a] focus:border-green-500 rounded-xl px-3.5 py-2 text-sm text-neutral-100 focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Body Textarea */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              Issue Body (Markdown, editable)
            </label>
            <textarea
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full bg-[#09090b] border border-[#27272a] focus:border-green-500 rounded-xl px-3.5 py-2 text-sm text-neutral-100 focus:outline-none transition-colors font-mono text-xs leading-relaxed"
              required
            />
          </div>

          {/* Labels Selection */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              GitHub Labels
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {labels.map((label) => (
                <span
                  key={label}
                  className="bg-[#27272a] text-neutral-200 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5"
                >
                  {label}
                  <button
                    type="button"
                    onClick={() => removeLabel(label)}
                    className="hover:text-red-400 text-xs font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add label..."
                value={newLabelInput}
                onChange={(e) => setNewLabelInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addLabel();
                  }
                }}
                className="bg-[#09090b] border border-[#27272a] rounded-lg px-3 py-1 text-xs text-neutral-200 focus:outline-none"
              />
              <button
                type="button"
                onClick={addLabel}
                className="bg-[#27272a] hover:bg-[#3f3f46] text-xs text-neutral-200 px-3 py-1 rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#27272a]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200 rounded-xl hover:bg-[#27272a] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-500 text-white font-medium text-sm px-5 py-2 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
