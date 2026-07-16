import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import UserAvatar from '@/components/User/UserAvatar'
import { cn } from '@/lib/utils'
import {
  estimateReadTime,
  extractImageSource,
  formatRelativeTime,
  getDisplayName,
  getExcerpt,
  inferCategory,
} from '@/lib/post-helpers'

function PostCard({
  id,
  title,
  content = '',
  author,
  createdAt,
  canInteract = true,
  variant = 'default',
}) {
  const postHref = `/post/${id}`
  const interactionHref = postHref
  const displayName = getDisplayName(author)
  const category = inferCategory({ title, content })
  const isCompact = variant === 'compact'
  const excerpt = getExcerpt(content, isCompact ? 140 : 240)
  const readTime = estimateReadTime(content)
  const coverImage = extractImageSource(content)
  const authorHref = author?.username ? `/users/${author.username}` : null
  const navigate = useNavigate()

  const handleShare = async () => {
    if (!canInteract) {
      navigate('/login')
      return
    }

    const shareUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}${postHref}`
        : postHref

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl)
        return
      }
    } catch (error) {
      console.error('Failed to copy post link', error)
    }

    window.open(postHref, '_blank', 'noopener,noreferrer')
  }

  const authorMeta = (
    <div className="min-w-0 flex-1 relative z-20">
      <div
        className={cn(
          'flex items-center gap-2 font-medium uppercase text-on-surface-variant/80',
          isCompact ? 'text-[10px] tracking-[0.2em]' : 'text-[11px] tracking-[0.24em]'
        )}
      >
        {authorHref ? (
          <Link
            to={authorHref}
            className={cn(
              'truncate normal-case tracking-normal text-on-surface transition-colors hover:text-primary min-w-0',
              isCompact ? 'text-[13px]' : 'text-sm'
            )}
            title={`u/${displayName}`}
          >
            u/{displayName}
          </Link>
        ) : (
          <span 
            className={cn('truncate normal-case tracking-normal text-on-surface min-w-0', isCompact ? 'text-[13px]' : 'text-sm')}
            title={`u/${displayName}`}
          >
            u/{displayName}
          </span>
        )}
        <span className="shrink-0 text-on-surface-variant/40">/</span>
        <span className="shrink-0">{formatRelativeTime(createdAt)}</span>
      </div>
    </div>
  )
 
  if (isCompact) {
    return (
      <article className="group relative flex h-full min-w-0 flex-col border border-outline-variant bg-surface-container p-4 sm:p-card rounded-card transition-all duration-300 hover:border-outline hover:bg-surface-container-high shadow-sm">
        {/* Absolute overlay link for card-wide navigation */}
        <Link to={interactionHref} className="absolute inset-0 z-10 rounded-card" aria-label={`Read ${title}`} />
 
        {/* Top Meta Section */}
        <div className="flex items-center sm:items-start gap-2 sm:gap-3 text-sm text-on-surface-variant">
          {authorHref ? (
            <Link to={authorHref} className="relative z-20 shrink-0">
              <UserAvatar
                userName={displayName}
                avatarSeed={author?.username || displayName}
                profileUrl={author?.profilePic}
                size="sm"
                className="size-10 data-[size=sm]:size-10"
              />
            </Link>
          ) : (
            <div className="relative z-20 shrink-0">
              <UserAvatar
                userName={displayName}
                avatarSeed={author?.username || displayName}
                profileUrl={author?.profilePic}
                size="sm"
                className="size-10 data-[size=sm]:size-10"
              />
            </div>
          )}
 
          {authorMeta}
 
          <span className="inline-flex shrink-0 items-center border border-primary/30 rounded-control px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.24em] text-primary">
            {category}
          </span>
        </div>
 
        {/* Title, Cover, and Excerpt Content */}
        <div className="mt-4 sm:mt-card flex flex-1 flex-col gap-3 sm:gap-cluster">
          <h2 className="text-xl font-black leading-tight text-on-surface transition-colors duration-200 group-hover:text-primary">
            {title}
          </h2>
 
          {coverImage && (
            <div className="block overflow-hidden border border-outline-variant/60 bg-card rounded-card">
              <img
                src={coverImage}
                alt={title}
                className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>
          )}
 
          <p className="text-sm leading-6 text-on-surface-variant">
            {excerpt || 'Open the manuscript to read the full entry.'}
          </p>
        </div>
 
        {/* Footer Actions Section */}
        <div className="mt-4 sm:mt-card flex items-center justify-between gap-3 sm:gap-cluster border-t border-outline-variant/50 pt-4 sm:pt-card text-sm text-on-surface-variant/80">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 sm:gap-2">
              <ClockIcon className="size-4 shrink-0" />
              <span className="whitespace-nowrap">{readTime} min<span className="hidden sm:inline"> read</span></span>
            </span>
 
            <span className="inline-flex items-center gap-1.5 sm:gap-2 text-on-surface-variant/90 transition-colors group-hover:text-primary">
              <CommentIcon className="size-4 shrink-0" />
              <span className="whitespace-nowrap"><span className="sm:hidden">Read</span><span className="hidden sm:inline">Open thread</span></span>
            </span>
          </div>
 
          <button
            type="button"
            onClick={handleShare}
            className="relative z-20 inline-flex items-center text-on-surface-variant/90 transition-colors hover:text-primary cursor-pointer"
            aria-label={`Share ${title}`}
          >
            <ShareIcon className="size-4 shrink-0" />
          </button>
        </div>
      </article>
    )
  }

  return (
    <article className="group relative flex h-full min-w-0 flex-col border border-outline-variant/40 rounded-card bg-surface-container p-4 sm:p-card transition-all duration-300 hover:border-outline-variant hover:bg-surface-container-high shadow-sm">
      {/* Absolute overlay link for card-wide navigation */}
      <Link to={interactionHref} className="absolute inset-0 z-10 rounded-card" aria-label={`Read ${title}`} />

      {/* Top Meta Section */}
      <div className="flex items-center gap-2 sm:gap-3 text-sm text-on-surface-variant">
        {authorHref ? (
          <Link to={authorHref} className="relative z-20 shrink-0">
            <UserAvatar
              userName={displayName}
              avatarSeed={author?.username || displayName}
              profileUrl={author?.profilePic}
              size="default"
              className="size-11 data-[size=default]:size-11"
            />
          </Link>
        ) : (
          <div className="relative z-20 shrink-0">
            <UserAvatar
              userName={displayName}
              avatarSeed={author?.username || displayName}
              profileUrl={author?.profilePic}
              size="default"
              className="size-11 data-[size=default]:size-11"
            />
          </div>
        )}

        {authorMeta}

        <span className="inline-flex shrink-0 items-center border border-primary/40 rounded-control px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
          {category}
        </span>
      </div>

      {/* Title, Cover, and Excerpt Content */}
      <div className="mt-4 sm:mt-card flex flex-1 flex-col gap-4 sm:gap-card">
        <h2 className="max-w-4xl text-2xl font-black leading-tight text-on-surface transition-colors duration-200 group-hover:text-primary sm:text-[2rem]">
          {title}
        </h2>

        {coverImage && (
          <div className="block overflow-hidden border border-outline-variant/60 bg-card rounded-card">
            <img
              src={coverImage}
              alt={title}
              className="max-h-[420px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
            />
          </div>
        )}

        <p className="max-w-4xl text-base leading-8 text-on-surface-variant">
          {excerpt || 'Open the manuscript to read the full entry.'}
        </p>
      </div>

      {/* Footer Actions Section */}
      <div className="mt-4 sm:mt-card flex items-center justify-between gap-3 sm:gap-cluster border-t border-outline-variant/50 pt-4 sm:pt-card text-sm text-on-surface-variant/80">
        <div className="flex items-center gap-3 sm:gap-5">
          <span className="inline-flex items-center gap-1.5 sm:gap-2">
            <ClockIcon className="size-4 shrink-0" />
            <span className="whitespace-nowrap">{readTime} min<span className="hidden sm:inline"> read</span></span>
          </span>

          <span className="inline-flex items-center gap-1.5 sm:gap-2 text-on-surface-variant/90 transition-colors group-hover:text-primary">
            <CommentIcon className="size-4 shrink-0" />
            <span className="whitespace-nowrap"><span className="sm:hidden">Read</span><span className="hidden sm:inline">Open thread</span></span>
          </span>
        </div>

        <button
          type="button"
          onClick={handleShare}
          className="relative z-20 inline-flex items-center text-on-surface-variant/90 transition-colors hover:text-primary cursor-pointer"
          aria-label={`Share ${title}`}
        >
          <ShareIcon className="size-4 shrink-0" />
        </button>
      </div>
    </article>
  )
}

function ClockIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v5l3 1.5" />
    </svg>
  )
}

function CommentIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6.5 7.5h11a2.5 2.5 0 0 1 2.5 2.5v5a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 3v-3H6.5A2.5 2.5 0 0 1 4 15v-5a2.5 2.5 0 0 1 2.5-2.5Z" />
    </svg>
  )
}

function ShareIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="2" />
      <circle cx="6" cy="12" r="2" />
      <circle cx="18" cy="19" r="2" />
      <path d="m8 11 8-5" />
      <path d="m8 13 8 5" />
    </svg>
  )
}

export default PostCard
