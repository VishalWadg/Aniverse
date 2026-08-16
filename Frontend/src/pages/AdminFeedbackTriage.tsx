import React, { useState } from 'react';
import {
  useGetFeedbackGroupsQuery,
  useApproveFeedbackGroupMutation,
  useDiscardFeedbackGroupMutation,
  useRestoreFeedbackGroupMutation,
  useMoveFeedbackItemMutation,
  FeedbackGroup,
  FeedbackGroupStatus,
  FeedbackItem,
} from '@/api/adminFeedbackApi';
import { FeedbackGroupCard } from '@/components/admin/FeedbackGroupCard';
import { ApproveIssueModal } from '@/components/admin/ApproveIssueModal';
import { MoveFeedbackModal } from '@/components/admin/MoveFeedbackModal';

export const AdminFeedbackTriage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FeedbackGroupStatus>('PENDING');
  const [page, setPage] = useState(0);

  // Modals state
  const [approveModalGroup, setApproveModalGroup] = useState<FeedbackGroup | null>(null);
  const [moveModalItem, setMoveModalItem] = useState<{
    item: FeedbackItem;
    group: FeedbackGroup;
  } | null>(null);

  // API Queries & Mutations
  const { data, isLoading, error } = useGetFeedbackGroupsQuery({
    status: activeTab,
    page,
  });

  const [approveGroup, { isLoading: isApproving }] = useApproveFeedbackGroupMutation();
  const [discardGroup] = useDiscardFeedbackGroupMutation();
  const [restoreGroup] = useRestoreFeedbackGroupMutation();
  const [moveFeedbackItem, { isLoading: isMoving }] = useMoveFeedbackItemMutation();

  const displayGroups = data?.content || [];

  const handleApproveSubmit = async (payload: {
    groupId: string;
    title: string;
    body: string;
    labels?: string[];
  }) => {
    try {
      await approveGroup(payload).unwrap();
      setApproveModalGroup(null);
    } catch (err) {
      console.error('Failed to approve group:', err);
    }
  };

  const handleDiscard = async (groupId: string) => {
    try {
      await discardGroup(groupId).unwrap();
    } catch (err) {
      console.error('Failed to discard group:', err);
    }
  };

  const handleRestore = async (groupId: string) => {
    try {
      await restoreGroup(groupId).unwrap();
    } catch (err) {
      console.error('Failed to restore group:', err);
    }
  };

  const handleMoveConfirm = async (
    feedbackId: string,
    targetGroupId: string | undefined,
    createNewGroup: boolean
  ) => {
    try {
      await moveFeedbackItem({
        feedbackId,
        targetGroupId,
        createNewGroup,
      }).unwrap();
      setMoveModalItem(null);
    } catch (err) {
      console.error('Failed to move feedback:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-neutral-100 p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272a] pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Feedback Triage
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Review AI-clustered feedback groups, create GitHub issues, or detach misplaced reports.
            </p>
          </div>

          {/* Navigation Tab Bar */}
          <div className="flex items-center bg-[#18181b] p-1 rounded-xl border border-[#27272a] shrink-0">
            <button
              onClick={() => {
                setActiveTab('PENDING');
                setPage(0);
              }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'PENDING'
                  ? 'bg-[#27272a] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Pending Queue
            </button>
            <button
              onClick={() => {
                setActiveTab('DISCARDED');
                setPage(0);
              }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'DISCARDED'
                  ? 'bg-[#27272a] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Discarded
            </button>
          </div>
        </div>

        {/* Triage Group List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-[#18181b] border border-[#27272a] rounded-2xl h-36 animate-pulse"
              />
            ))}
          </div>
        ) : displayGroups.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-[#27272a] rounded-2xl bg-[#18181b]/30">
            <svg
              className="w-12 h-12 mx-auto text-neutral-600 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1.001 1.001 0 01.707.293l5.414 5.414a1.001 1.001 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-neutral-400 font-medium">No feedback groups in this queue.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayGroups.map((group, index) => (
              <FeedbackGroupCard
                key={group.id}
                group={group}
                isExpandedDefault={index === 0}
                onApprove={(g) => setApproveModalGroup(g)}
                onDiscard={handleDiscard}
                onRestore={handleRestore}
                onMoveItem={(item, g) => setMoveModalItem({ item, group: g })}
              />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-[#27272a]">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 text-xs font-medium bg-[#18181b] border border-[#27272a] rounded-xl disabled:opacity-40 hover:bg-[#27272a]"
            >
              Previous
            </button>
            <span className="text-xs text-neutral-400">
              Page {page + 1} of {data.totalPages}
            </span>
            <button
              disabled={page + 1 >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 text-xs font-medium bg-[#18181b] border border-[#27272a] rounded-xl disabled:opacity-40 hover:bg-[#27272a]"
            >
              Next
            </button>
          </div>
        )}

        {/* Approve Review Modal */}
        <ApproveIssueModal
          group={approveModalGroup}
          isOpen={!!approveModalGroup}
          onClose={() => setApproveModalGroup(null)}
          onSubmit={handleApproveSubmit}
          isLoading={isApproving}
        />

        {/* Move / Detach Modal */}
        <MoveFeedbackModal
          item={moveModalItem?.item || null}
          currentGroup={moveModalItem?.group || null}
          availableGroups={displayGroups}
          isOpen={!!moveModalItem}
          onClose={() => setMoveModalItem(null)}
          onConfirm={handleMoveConfirm}
          isLoading={isMoving}
        />
      </div>
    </div>
  );
};

export default AdminFeedbackTriage;
