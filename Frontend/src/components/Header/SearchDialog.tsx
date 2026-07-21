import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { SearchIcon, QuillIcon } from '@/components/ui/Icons'
import { useSearchPostsQuery } from '@/api/postsApi'
import UserAvatar from '../User/UserAvatar'
import { formatRelativeTime } from '@/lib/post-helpers'

interface SearchDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialQuery?: string
}

export default function SearchDialog({
    open,
    onOpenChange,
    initialQuery = '',
}: SearchDialogProps) {
    const [query, setQuery] = useState(initialQuery)
    const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)
    const navigate = useNavigate()

    useEffect(() => {
        if (open) {
            setQuery(initialQuery)
            setDebouncedQuery(initialQuery)
        }
    }, [open, initialQuery])

    // 300ms Debounce effect: update debouncedQuery only after user stops typing for 300ms
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query.trim())
        }, 300)

        return () => {
            clearTimeout(handler)
        }
    }, [query])

    // Query live search using debouncedQuery (only fires when debouncedQuery is non-empty)
    const { data, isFetching, isError } = useSearchPostsQuery(
        { q: debouncedQuery, page: 0, size: 8 },
        { skip: !debouncedQuery }
    )

    const handleSelectPost = (postId: string) => {
        onOpenChange(false)
        navigate(`/post/${postId}`)
    }

    const handleFullSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const trimmed = query.trim()
        if (!trimmed) return
        onOpenChange(false)
        navigate(`/?q=${encodeURIComponent(trimmed)}`)
    }

    const isSearching = isFetching || (query.trim() !== '' && query.trim() !== debouncedQuery)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[calc(100%-2rem)] max-w-2xl h-[75vh] sm:h-[520px] flex flex-col p-0 overflow-hidden border border-outline-variant bg-surface-container rounded-card">
                {/* Accessible Dialog Title */}
                <DialogHeader className="sr-only">
                    <DialogTitle>Search Manuscripts & Theories</DialogTitle>
                </DialogHeader>

                {/* Search Input Bar inside Modal (Fixed Top Header) */}
                <form onSubmit={handleFullSearchSubmit} className="relative border-b border-outline-variant p-4 shrink-0">
                    <SearchIcon className="pointer-events-none absolute left-7 top-1/2 size-5 -translate-y-1/2 text-on-surface-variant" />
                    <Input
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search theories, manuscripts, authors..."
                        className="h-12 w-full rounded-control border-none bg-surface-container-high pl-12 pr-10 text-sm font-semibold text-on-surface focus-visible:ring-1 focus-visible:ring-primary"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => {
                                setQuery('');
                                setDebouncedQuery(''); // Force clear immediately
                            }}
                            className="absolute right-7 top-1/2 -translate-y-1/2 text-xs font-bold uppercase tracking-wider text-on-surface-variant/70 hover:text-on-surface"
                        >
                            Clear
                        </button>
                    )}
                </form>

                {/* Results Container (Fixed Scroll Region - Fills remaining height) */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {!query.trim() ? (
                        <div className="py-12 text-center text-on-surface-variant/70">
                            <SearchIcon className="mx-auto size-8 mb-2 opacity-50" />
                            <p className="text-sm font-semibold">Type a keyword to search theories</p>
                            <p className="text-xs text-on-surface-variant/50 mt-1">
                                Explore long-form manuscripts, community takes, and research.
                            </p>
                        </div>
                    ) : isSearching ? (
                        <div className="py-12 text-center text-on-surface-variant/70">
                            <div className="inline-block size-6 animate-spin rounded-full border-2 border-primary border-t-transparent mb-2" />
                            <p className="text-sm font-medium">Searching archive floor...</p>
                        </div>
                    ) : isError || !data?.content || data.content.length === 0 ? (
                        <div className="py-12 text-center text-on-surface-variant/70">
                            <QuillIcon className="mx-auto size-8 mb-2 opacity-40" />
                            <p className="text-sm font-semibold">No manuscripts found for "{debouncedQuery}"</p>
                            <p className="text-xs text-on-surface-variant/50 mt-1">
                                Try searching with a different term or keyword.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <div className="px-2 py-1 text-[11px] font-black uppercase tracking-[0.25em] text-on-surface-variant/60">
                                Found {data.totalElements ?? data.content.length} Matching Theory{data.content.length === 1 ? '' : 's'}
                            </div>

                            {data.content.map((post) => (
                                <button
                                    key={post.id}
                                    type="button"
                                    onClick={() => handleSelectPost(post.id)}
                                    className="group flex flex-col gap-1.5 rounded-control p-3 text-left transition-colors hover:bg-surface-container-high focus:bg-surface-container-high focus:outline-none"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                                            {post.title}
                                        </span>
                                        <span className="shrink-0 text-[10px] text-on-surface-variant/60 font-medium">
                                            {formatRelativeTime(post.createdAt)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                                        <UserAvatar
                                            userName={post.author?.name || post.author?.username || 'Author'}
                                            avatarSeed={post.author?.username || 'author'}
                                            profileUrl={post.author?.profilePic}
                                            size="sm"
                                            className="size-5 data-[size=sm]:size-5"
                                        />
                                        <span className="font-medium">{post.author?.name || `@${post.author?.username}`}</span>
                                    </div>
                                </button>
                            ))}

                            <button
                                type="button"
                                onClick={handleFullSearchSubmit}
                                className="mt-2 text-center text-xs font-bold text-primary hover:underline py-2"
                            >
                                View all results for "{query.trim()}" &rarr;
                            </button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}