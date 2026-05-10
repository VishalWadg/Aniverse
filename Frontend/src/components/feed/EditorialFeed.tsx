import React, { useMemo, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  formatRelativeTime,
  getDisplayName,
  getHotScore,
  inferCategory,
  matchesSearch,
} from '@/lib/post-helpers'
import Container from '../Container/Container'
import PostCard from '../PostCard'
import { useGetPostsQuery } from '@/api/postsApi'
import {Virtuoso} from "react-virtuoso"

const feedTabs = {
  home: [
    { id: 'hot', label: 'Hot Right Now' },
    { id: 'latest', label: 'Latest' },
    { id: 'deep', label: 'Long Reads' },
  ],
  archive: [
    { id: 'latest', label: 'Latest' },
    { id: 'hot', label: 'Hot Right Now' },
    { id: 'editorial', label: 'Editorial' },
  ],
}

const feedCopy = {
  home: {
    eyebrow: 'Signal Board',
    title: 'Theories, spoilers, and editorial cuts from the archive floor.',
    description:
      'A feed tuned for contrast, long-form reading, and tighter information density without the visual fatigue of harsh pure-black UI.',
    emptyTitle: 'No manuscripts yet.',
    emptyDescription:
      'The archive is quiet right now. Publish the first theory and set the tone for the next thread.',
  },
  archive: {
    eyebrow: 'Archive Run',
    title: 'Every post, lined up like a proper editorial desk.',
    description:
      'Browse the full stack of posts in a tighter feed with a deliberate sidebar rhythm instead of the old detached grid.',
    emptyTitle: 'Nothing has been filed yet.',
    emptyDescription:
      'Once the first post lands, the full archive will surface here with filters, search, and trending picks.',
  },
}

function TrendingManuscripts({ trendingPosts, canInteract }) {
  return (
    <div className="border border-white/8 bg-black/30 p-6 ">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="text-sm font-black uppercase tracking-[0.28em] text-[#8b8b8b]">
          Trending Manuscripts
        </h2>
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#5f5f5f]">
          Desk Live
        </span>
      </div>

      {trendingPosts.length > 0 ? (
        <div className="space-y-6">
          {trendingPosts.map((post, index) => (
            <Link
              key={post.id}
              to={canInteract ? `/post/${post.id}` : '/login'}
              className="group block"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#ff6c62]">
                {String(index + 1).padStart(2, '0')} / {inferCategory(post)}
              </p>
              <h3 className="mt-2 text-xl font-black leading-tight text-[#f1f1f1] transition-colors group-hover:text-white">
                {post.title}
              </h3>
              <p className="mt-2 text-sm text-[#7d7d7d]">
                {getDisplayName(post.author)} / {formatRelativeTime(post.createdAt)}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm leading-7 text-[#8b8b8b]">
          Trending picks will appear here once the archive has posts to rank.
        </p>
      )}
    </div>
  )
}

function EditorialFeed({authStatus = true, mode = 'home' }) {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('q')?.trim() ?? ''
  const tabs = feedTabs[mode]
  const copy = feedCopy[mode]
  const [activeTab, setActiveTab] = useState(mode === 'home' ? 'hot' : 'latest')
  const [page, setPage] = useState(0);
  const sortParam = activeTab === 'deep' ? 'wordCount,desc' : 'createdAt,desc';


  const { data, isLoading, isFetching } = useGetPostsQuery({ sort: sortParam, page });
  const posts = data?.content || [];
  const hasNextPage = !data?.last;
  

  const visiblePosts = useMemo(() => {
    let nextPosts = [...posts].filter(Boolean).filter((post) => matchesSearch(post, searchQuery))

    switch (activeTab) {
      case 'hot':
        nextPosts.sort((left, right) => getHotScore(right) - getHotScore(left))
        break
      case 'latest':
        nextPosts.sort(
          (left, right) =>
            new Date(right?.createdAt ?? 0).getTime() -
            new Date(left?.createdAt ?? 0).getTime()
        )
        break
      case 'deep':
        nextPosts.sort(
          (left, right) => (right?.content?.length ?? 0) - (left?.content?.length ?? 0)
        )
        break
      case 'editorial':
        nextPosts = nextPosts
          .filter((post) => inferCategory(post) === 'Editorial')
          .sort(
            (left, right) =>
              new Date(right?.createdAt ?? 0).getTime() -
              new Date(left?.createdAt ?? 0).getTime()
          )
        break
      default:
        break
    }

    return nextPosts
  }, [activeTab, posts, searchQuery])

  const trendingPosts = useMemo(
    () =>
      [...posts]
        .filter(Boolean)
        .sort((left, right) => getHotScore(right) - getHotScore(left))
        .slice(0, 3),
    [posts]
  )

  const clearSearchHref = location.pathname
  const hasSearchMiss = Boolean(searchQuery) && visiblePosts.length === 0
  const canInteract = Boolean(authStatus)

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    setPage(0)
  }

  return (
    <section className="pb-14 pt-8 sm:pt-10">
      <Container>
        <div className="flex flex-col gap-8 xl:grid xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start xl:gap-8">
          <div className="min-w-0">
            <div className="border border-white/8 bg-black/30 px-5 py-6 sm:px-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#ff453a]">
                {copy.eyebrow}
              </p>

              <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <h1 className="text-3xl font-black leading-tight text-[#f5f5f5] sm:text-4xl">
                    {copy.title}
                  </h1>
                  <p className="mt-3 text-base leading-7 text-[#a3a3a3]">
                    {copy.description}
                  </p>
                </div>

                <p className="text-sm text-[#858585]">
                  {searchQuery
                    ? `Results for "${searchQuery}"`
                    : `${posts.length} manuscript${posts.length === 1 ? '' : 's'} loaded`}
                </p>
              </div>
            </div>

            <div className="mb-6 flex flex-wrap items-center gap-3 border-b border-white/8 py-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={[
                    'border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] transition-colors',
                    activeTab === tab.id
                      ? 'border-[#ff453a] bg-[#ff453a] text-white'
                      : 'border-white/10 bg-white/[0.02] text-[#7f7f7f] hover:border-white/20 hover:text-[#ededed]',
                  ].join(' ')}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mb-6 xl:hidden">
              <TrendingManuscripts trendingPosts={trendingPosts} canInteract={canInteract} />
            </div>

            {hasSearchMiss && (
              <div className="border border-white/8 bg-black/20 px-6 py-10 sm:px-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#ff453a]">
                  Search Miss
                </p>
                <h2 className="mt-4 text-3xl font-black text-[#f5f5f5]">
                  Nothing matched "{searchQuery}".
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-[#a3a3a3]">
                  Try a broader title, author handle, or franchise keyword. The current feed filter is
                  working against an empty result set.
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="mt-6 rounded-none border-white/20 bg-transparent text-[#f5f5f5] hover:bg-white/[0.05] hover:text-white"
                >
                  <Link to={clearSearchHref}>Clear Search</Link>
                </Button>
              </div>
            )}

            {!hasSearchMiss && visiblePosts.length === 0 && (
              <div className="border border-white/8 bg-black/20 px-6 py-10 sm:px-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#ff453a]">
                  Empty Desk
                </p>
                <h2 className="mt-4 text-3xl font-black text-[#f5f5f5]">{copy.emptyTitle}</h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-[#a3a3a3]">
                  {copy.emptyDescription}
                </p>
                <Button
                  asChild
                  className="mt-6 rounded-none bg-[#ff453a] px-5 font-black uppercase tracking-[0.18em] text-white hover:bg-[#ff5f55]"
                >
                  <Link to="/add-post">Write a Theory</Link>
                </Button>
              </div>
            )}

            {!hasSearchMiss && visiblePosts.length > 0 && (
              <div className="overflow-hidden border border-white/8 bg-black/20">
                <Virtuoso
                    useWindowScroll
                    data={visiblePosts}
                    endReached={() => {
                        if (!isFetching && hasNextPage) {
                          setPage((prev) => prev + 1);
                        }
                    }}
                    itemContent={(index, post) => (
                        // Render your PostCard inside here exactly as you did in the map!
                        <div className={index === 0 ? '' : 'border-t border-white/8 p-5 sm:p-7'}>
                            <PostCard {...post} />
                        </div>
                    )}
                />

              </div>
            )}
          </div>

          <aside className="hidden space-y-6 xl:sticky xl:top-28 xl:block">
            <TrendingManuscripts trendingPosts={trendingPosts} canInteract={canInteract} />
          </aside>
        </div>
      </Container>
    </section>
  )
}

export default EditorialFeed
