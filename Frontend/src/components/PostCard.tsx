import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  estimateReadTime,
  extractImageSource,
  formatRelativeTime,
  getDisplayName,
  getExcerpt,
  getInitials,
  inferCategory,
} from '@/lib/post-helpers'

function PostCard({ id, title, content = '', author, createdAt, canInteract = true }) {
  const postHref = `/post/${id}`
  const interactionHref = canInteract ? postHref : '/login'
  const displayName = getDisplayName(author)
  const category = inferCategory({ title, content })
  const excerpt = getExcerpt(content, 240)
  const readTime = estimateReadTime(content)
  const coverImage = extractImageSource(content)
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

  return (
    <article className="group px-5 py-6 sm:px-6 sm:py-7">
      <div className="flex flex-wrap items-center gap-3 text-sm text-[#9c9c9c]">
        <span className="flex h-11 w-11 items-center justify-center border border-white/10 bg-white/[0.03] text-xs font-black tracking-[0.2em] text-[#f5f5f5]">
          {getInitials(displayName)}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-[#7f7f7f]">
            <span className="normal-case text-sm tracking-normal text-[#ededed]">
              u/{displayName}
            </span>
            <span className="text-[#5c5c5c]">/</span>
            <span>{formatRelativeTime(createdAt)}</span>
          </div>
        </div>

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
