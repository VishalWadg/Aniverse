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
import { useGetPostsQuery, useSearchPostsQuery } from '@/api/postsApi'
import { Virtuoso } from "react-virtuoso"

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

const FEED_PAGE_SIZE = 10

function TrendingManuscripts({ trendingPosts, canInteract }) {
  return (
    <div className="border border-outline-variant bg-surface-container p-card rounded-card shadow-elevation-1">
      <div className="mb-6 flex items-center justify-between gap-3 border-b border-outline-variant/40 pb-3">
        <h2 className="text-sm font-black uppercase tracking-[0.28em] text-on-surface-variant">
          Trending Manuscripts
        </h2>
        <span className="text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/60">
          Desk Live
        </span>
      </div>

      {trendingPosts.length > 0 ? (
        <div className="space-y-6">
          {trendingPosts.map((post, index) => (
            <Link
              key={post.id}
              to={`/post/${post.id}`}
              className="group block"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary">
                {String(index + 1).padStart(2, '0')} / {inferCategory(post)}
              </p>
              <h3 className="mt-2 text-xl font-black leading-tight text-on-surface transition-colors group-hover:text-primary">
                {post.title}
              </h3>
              <p className="mt-2 text-sm text-on-surface-variant/85">
                {getDisplayName(post.author)} / {formatRelativeTime(post.createdAt)}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm leading-7 text-on-surface-variant">
          Trending picks will appear here once the archive has posts to rank.
        </p>
      )}
    </div>
  )
}

function EditorialFeed({ authStatus = true, mode = 'home' }) {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('q')?.trim() ?? ''

  // Truncate query safely to prevent UI breakage from excessively long strings
  const displayQuery = searchQuery.length > 30 
    ? `${searchQuery.slice(0, 30)}...` 
    : searchQuery;

  const tabs = feedTabs[mode]
  const copy = feedCopy[mode]
  const [activeTab, setActiveTab] = useState(mode === 'home' ? 'hot' : 'latest')
  const [page, setPage] = useState(0);
  const sortParam = activeTab === 'deep' ? 'wordCount,desc' : 'createdAt,desc';

  const isSearchActive = Boolean(searchQuery);
  

  // 1. Reset page to 0 when search query changes
  React.useEffect(() => {
    setPage(0);
  }, [searchQuery]);

  // 2. Fetch standard feed, skip if search is active
  const { data: feedData, isLoading: feedLoading, isFetching: feedFetching } = useGetPostsQuery(
    { sort: sortParam, page, size: FEED_PAGE_SIZE },
    { skip: isSearchActive }
  );

  // 3. Fetch search results, skip if search is not active
  const { data: searchData, isLoading: searchLoading, isFetching: searchFetching } = useSearchPostsQuery(
    { q: searchQuery, sort: sortParam, page, size: FEED_PAGE_SIZE }, // <-- Forward sortParam
    { skip: !isSearchActive }
  );

  const data = isSearchActive ? searchData : feedData;
  const isLoading = isSearchActive ? searchLoading : feedLoading;
  const isFetching = isSearchActive ? searchFetching : feedFetching;

  const posts = data?.content || [];
  const hasNextPage = Boolean(data && !data.last);

  const totalMatches = data?.totalElements ?? posts.length;


  const visiblePosts = useMemo(() => {
    let nextPosts = [...posts].filter(Boolean); // No client-side matchesSearch filtering!

    switch (activeTab) {
      case 'hot':
        if (!isSearchActive) {
          nextPosts.sort((left, right) => getHotScore(right) - getHotScore(left));
        }
        break;
      case 'latest':
        break;
      case 'deep':
        break;
      case 'editorial':
        nextPosts = nextPosts.filter((post) => inferCategory(post) === 'Editorial');
        break;
      default:
        break;
    }

    return nextPosts;
  }, [activeTab, posts, isSearchActive])

  const trendingPosts = useMemo(
    () =>
      [...posts]
        .filter(Boolean)
        .sort((left, right) => getHotScore(right) - getHotScore(left))
        .slice(0, 3),
    [posts]
  )

  const clearSearchHref = location.pathname
  const isInitialLoading = isLoading && posts.length === 0
  const hasSearchMiss = !isInitialLoading && Boolean(searchQuery) && visiblePosts.length === 0
  const canInteract = Boolean(authStatus)

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    setPage(0)
  }

  return (
    <section className="pb-14 pt-8 sm:pt-10">
      <Container>
        <div className="flex flex-col gap-stack xl:grid xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start xl:gap-stack">
          <div className="min-w-0">
            <div className="border border-outline-variant bg-surface-container p-card rounded-card shadow-elevation-1">
              <p className="text-[11px] font-black uppercase tracking-[0.32em] text-primary">
                {copy.eyebrow}
              </p>

              <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <h1 className="text-3xl font-black leading-tight text-on-surface sm:text-4xl">
                    {copy.title}
                  </h1>
                  <p className="mt-3 text-base leading-7 text-on-surface-variant">
                    {copy.description}
                  </p>
                </div>

                <p className="text-sm text-on-surface-variant/70">
                  {`${posts.length} manuscript${posts.length === 1 ? '' : 's'} loaded`}
                </p>
              </div>
            </div>

            <div className="mb-6 flex flex-wrap items-center gap-cluster border-b border-outline-variant/60 py-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={[
                    'border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] transition-colors rounded-control cursor-pointer',
                    activeTab === tab.id
                      ? 'border-transparent bg-primary text-on-primary'
                      : 'border-outline-variant bg-surface-container/40 text-on-surface-variant hover:border-outline hover:text-on-surface hover:bg-surface-container-high',
                  ].join(' ')}
                >
                  {tab.label}
                </button>
              ))}
            </div>

                        {isSearchActive && (
              <div className="mb-6 flex items-center justify-between gap-4 border border-outline-variant bg-surface-container-low p-4 rounded-card shadow-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="text-sm font-bold text-on-surface shrink-0">
                    Showing results for:
                  </span>
                  <span className="inline-block rounded-control bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary truncate max-w-[120px] sm:max-w-[240px]">
                    "{displayQuery}"
                  </span>
                  <span className="text-xs text-on-surface-variant/80 shrink-0">
                    ({totalMatches} match{totalMatches === 1 ? '' : 'es'})
                  </span>
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-outline-variant text-on-surface hover:bg-surface-container-high text-xs shrink-0"
                >
                  <Link to={clearSearchHref}>Clear Search</Link>
                </Button>
              </div>
            )}

            <div className="mb-6 xl:hidden">
              <TrendingManuscripts trendingPosts={trendingPosts} canInteract={canInteract} />
            </div>

            {isInitialLoading && (
              <div className="border border-outline-variant bg-surface-container-low p-card rounded-card shadow-sm">
                <p className="text-[11px] font-black uppercase tracking-[0.32em] text-primary">
                  Loading Desk
                </p>
                <div className="mt-card space-y-4">
                  <div className="h-6 w-2/3 animate-pulse bg-on-surface/10" />
                  <div className="h-24 animate-pulse bg-on-surface/6" />
                  <div className="h-4 w-1/4 animate-pulse bg-on-surface/8" />
                </div>
              </div>
            )}

            {hasSearchMiss && (
              <div className="border border-outline-variant bg-surface-container-low p-card rounded-card shadow-sm">
                <p className="text-[11px] font-black uppercase tracking-[0.32em] text-primary">
                  Search Miss
                </p>
                <h2 className="mt-4 text-3xl font-black text-on-surface">
                  Nothing matched "{displayQuery}".
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-on-surface-variant">
                  Try a broader title, author handle, or franchise keyword. The current feed filter is
                  working against an empty result set.
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="mt-6 border-outline-variant text-on-surface hover:bg-surface-container-high"
                >
                  <Link to={clearSearchHref}>Clear Search</Link>
                </Button>
              </div>
            )}

            {!isInitialLoading && !hasSearchMiss && visiblePosts.length === 0 && (
              <div className="border border-outline-variant bg-surface-container-low p-card rounded-card shadow-sm">
                <p className="text-[11px] font-black uppercase tracking-[0.32em] text-primary">
                  Empty Desk
                </p>
                <h2 className="mt-4 text-3xl font-black text-on-surface">{copy.emptyTitle}</h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-on-surface-variant">
                  {copy.emptyDescription}
                </p>
                <Button
                  asChild
                  className="mt-6 px-5 font-black uppercase tracking-[0.18em]"
                >
                  <Link to="/add-post">Write a Theory</Link>
                </Button>
              </div>
            )}

            {!hasSearchMiss && visiblePosts.length > 0 && (
              <div className="rounded-card border border-outline-variant/60 bg-surface-container-low p-card">
                <Virtuoso
                  useWindowScroll
                  data={visiblePosts}
                  computeItemKey={(_, post) => post.id}
                  increaseViewportBy={{ top: 400, bottom: 800 }}
                  endReached={() => {
                    if (!isLoading && !isFetching && hasNextPage) {
                      setPage((prev) => prev + 1);
                    }
                  }}
                  components={{
                    Footer: () => (
                      <div className="pt-card text-center text-sm text-on-surface-variant/70">
                        {isFetching && !isLoading
                          ? 'Loading more manuscripts...'
                          : hasNextPage
                            ? null
                            : 'End of the archive.'}
                      </div>
                    ),
                  }}
                  itemContent={(index, post) => (
                    <div className={`px-card ${index === 0 ? 'border-t border-outline-variant/30 pt-card mt-card' : index === visiblePosts.length-1} ? border-b border-outline-variant/30 pb-card mb-card`}>
                      <PostCard {...post} canInteract={canInteract} />
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
