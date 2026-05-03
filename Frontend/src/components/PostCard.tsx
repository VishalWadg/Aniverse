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
  const interactionHref = canInteract ? postHref : '/login'
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
    <div className="min-w-0 flex-1">
      <div
        className={cn(
          'flex flex-wrap items-center gap-2 font-medium uppercase text-[#7f7f7f]',
          isCompact ? 'text-[10px] tracking-[0.2em]' : 'text-[11px] tracking-[0.24em]'
        )}
      >
        {authorHref ? (
          <Link
            to={authorHref}
            className={cn(
              'normal-case tracking-normal text-[#ededed] transition-colors hover:text-white',
              isCompact ? 'text-[13px]' : 'text-sm'
            )}
          >
            u/{displayName}
          </Link>
        ) : (
          <span className={cn('normal-case tracking-normal text-[#ededed]', isCompact ? 'text-[13px]' : 'text-sm')}>
            u/{displayName}
          </span>
        )}
        <span className="text-[#5c5c5c]">/</span>
        <span>{formatRelativeTime(createdAt)}</span>
      </div>
    </div>
  )

  if (isCompact) {
    return (
      <article className="group flex h-full flex-col border border-white/8 bg-black/25 p-5 transition-colors hover:border-white/14 hover:bg-black/35">
        <div className="flex items-start gap-3 text-sm text-[#9c9c9c]">
          <UserAvatar
            userName={displayName}
            avatarSeed={author?.username || displayName}
            profileUrl={author?.profilePic}
            size="sm"
            className="size-10 data-[size=sm]:size-10"
          />

          {authorMeta}

          <span className="inline-flex shrink-0 items-center border border-[#ff453a]/35 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.24em] text-[#ff8f86]">
            {category}
          </span>
        </div>

        <div className="mt-4 flex flex-1 flex-col space-y-3">
          <Link to={interactionHref} className="block">
            <h2 className="text-xl font-black leading-tight text-[#f5f5f5] transition-colors duration-200 group-hover:text-white">
              {title}
            </h2>
          </Link>

          {coverImage && (
            <Link to={interactionHref} className="block overflow-hidden border border-white/10 bg-[#121212]">
              <img
                src={coverImage}
                alt={title}
                className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </Link>
          )}

          <p className="text-sm leading-6 text-[#a3a3a3]">
            {excerpt || 'Open the manuscript to read the full entry.'}
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/8 pt-4 text-sm text-[#909090]">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2">
              <ClockIcon className="size-4" />
              {readTime} min
            </span>

            <Link
              to={interactionHref}
              className="inline-flex items-center gap-2 text-[#b7b7b7] transition-colors hover:text-white"
            >
              <CommentIcon className="size-4" />
              {canInteract ? 'Read' : 'Log in'}
            </Link>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex h-8 w-8 items-center justify-center border border-transparent text-[#8f8f8f] transition hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
            aria-label={`Share ${title}`}
          >
            <ShareIcon className="size-4" />
          </button>
        </div>
      </article>
    )
  }

  return (
    <article className="group px-5 py-6 sm:px-6 sm:py-7">
      <div className="flex flex-wrap items-center gap-3 text-sm text-[#9c9c9c]">
        <UserAvatar
          userName={displayName}
          avatarSeed={author?.username || displayName}
          profileUrl={author?.profilePic}
          size="default"
          className="size-11 data-[size=default]:size-11"
        />

        {authorMeta}

        <span className="inline-flex items-center border border-[#ff453a]/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#ff7a70]">
          {category}
        </span>
      </div>

      <div className="mt-5 space-y-4">
        <Link to={interactionHref} className="block">
          <h2 className="max-w-4xl text-2xl font-black leading-tight text-[#f5f5f5] transition-colors duration-200 group-hover:text-white sm:text-[2rem]">
            {title}
          </h2>
        </Link>

        {coverImage && (
          <Link to={interactionHref} className="block overflow-hidden border border-white/10 bg-[#121212]">
            <img
              src={coverImage}
              alt={title}
              className="max-h-[420px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
            />
          </Link>
        )}

        <p className="max-w-4xl text-base leading-8 text-[#a3a3a3]">
          {excerpt || 'Open the manuscript to read the full entry.'}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/8 pt-4">
        <div className="flex items-center gap-3 text-sm text-[#909090] sm:gap-5">
          <span className="inline-flex items-center gap-2">
            <ClockIcon className="size-4" />
            {readTime} min read
          </span>

          <Link
            to={interactionHref}
            className="inline-flex items-center gap-2 text-[#b7b7b7] transition-colors hover:text-white"
          >
            <CommentIcon className="size-4" />
            {canInteract ? 'Open thread' : 'Log in to open'}
          </Link>
        </div>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex h-9 w-9 items-center justify-center border border-transparent text-[#8f8f8f] transition hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
          aria-label={`Share ${title}`}
        >
          <ShareIcon className="size-4" />
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
