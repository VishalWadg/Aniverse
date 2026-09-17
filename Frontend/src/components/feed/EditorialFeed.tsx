import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  extractImageSource,
  formatRelativeTime,
  getDisplayName,
  getExcerpt,
  getHotScore,
  inferCategory,
  matchesSearch,
} from '@/lib/post-helpers'
import Logo from '../Logo'
import Container from '../Container/Container'
import PostCard from '../PostCard'
import { cn } from '@/lib/utils'
import { useGetPostsQuery, useSearchPostsQuery } from '@/api/postsApi'
import { Virtuoso } from "react-virtuoso"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel'

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
const AUTO_ADVANCE_MS = 5000

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

function HeroCarousel({ posts }: { posts: any[] }) {
  const featuredPosts = useMemo(() => posts.filter(Boolean).slice(0, 5), [posts])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [api, setApi] = useState<CarouselApi>()

  // Respect the OS-level reduced-motion setting: no forced auto-advance for
  // people who've asked their system to cut motion.
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(query.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    query.addEventListener('change', handler)
    return () => query.removeEventListener('change', handler)
  }, [])

  // Sync CarouselApi selection state with currentIndex
  useEffect(() => {
    if (!api) return

    const onSelect = () => {
      setCurrentIndex(api.selectedScrollSnap())
    }

    onSelect()
    api.on('select', onSelect)
    api.on('reInit', onSelect)
    return () => {
      api.off('select', onSelect)
    }
  }, [api])

  // Guard against a stale index if the post list shrinks under us
  useEffect(() => {
    if (currentIndex >= featuredPosts.length && featuredPosts.length > 0) {
      setCurrentIndex(0)
      api?.scrollTo(0)
    }
  }, [featuredPosts.length, currentIndex, api])

  // Auto-advance slideshow using Carousel API
  useEffect(() => {
    if (featuredPosts.length <= 1 || isPaused || prefersReducedMotion || !api) return
    const interval = setInterval(() => {
      api.scrollNext()
    }, AUTO_ADVANCE_MS)
    return () => clearInterval(interval)
  }, [featuredPosts.length, isPaused, prefersReducedMotion, api])

  if (featuredPosts.length === 0) {
    return (
      <div className="border border-outline-variant/60 bg-gradient-to-br from-surface-container via-surface-container/95 to-surface-container-high/80 p-6 sm:p-8 rounded-card shadow-elevation-1">
        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-primary">
          FEATURED // ANIVERSE ARCHIVE
        </p>
        <h1 className="mt-2 text-2xl font-black text-on-surface sm:text-3xl">
          Welcome to the Aniverse Theories Archive
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Explore long-form theories, editorial cuts, and community analysis.
        </p>
      </div>
    )
  }

  const goTo = (index: number) => api?.scrollTo(index)
  const goPrev = () => api?.scrollPrev()
  const goNext = () => api?.scrollNext()

  const currentPost = featuredPosts[currentIndex] || featuredPosts[0]

  return (
    <Carousel
      setApi={setApi}
      opts={{ loop: true }}
      className="relative overflow-hidden rounded-card border border-outline-variant/40 shadow-elevation-2 min-h-[420px] sm:min-h-[460px] md:min-h-[480px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured posts"
    >
      {/* 1. Swipable track containing only cover background, title, and excerpt */}
      <CarouselContent className="-ml-0 min-h-[420px] sm:min-h-[460px] md:min-h-[480px]">
        {featuredPosts.map((post) => {
          const imageUrl = post?.coverImage || extractImageSource(post?.content || '')
          return (
            <CarouselItem key={post.id} className="pl-0 min-w-0 shrink-0 basis-full relative min-h-[420px] sm:min-h-[460px] md:min-h-[480px]">
              {/* Background layer */}
              <div className="absolute inset-0">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="relative h-full w-full bg-gradient-to-br from-surface-container-high via-surface-container to-primary/20">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(var(--primary-rgb),0.25),transparent_60%)]" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                      <Logo showText={false} iconClassName="h-24 w-24" />
                    </div>
                  </div>
                )}
                {/* Scrim overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
              </div>

              {/* Swiped Title & Excerpt Content */}
              <div className="absolute inset-x-0 bottom-16 sm:bottom-20 z-10 p-5 sm:p-7 md:p-9">
                <Link to={`/post/${post.id}`} className="group block max-w-3xl">
                  <h2 className="text-2xl font-black leading-[1.1] tracking-tight text-white transition-colors sm:text-3xl md:text-4xl line-clamp-2 group-hover:text-primary">
                    {post.title}
                  </h2>
                  {post.content && (
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/75 line-clamp-2 sm:text-base">
                      {getExcerpt(post.content, 220)}
                    </p>
                  )}
                </Link>
              </div>
            </CarouselItem>
          )
        })}
      </CarouselContent>

      {/* 2. Fixed Top Overlay: Category badge & slide counter (stationary during swipe) */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-start justify-between gap-4 p-5 sm:p-7 pointer-events-none">
        <div className="flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 backdrop-blur-sm pointer-events-auto">
          <span className="size-1.5 rounded-full bg-primary animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white">
            Featured // {inferCategory(currentPost)}
          </p>
        </div>
        <div className="rounded-full bg-black/40 px-3 py-1.5 backdrop-blur-sm pointer-events-auto">
          <span className="text-xs font-bold tracking-wider text-white/90">
            {String(currentIndex + 1).padStart(2, '0')} / {String(featuredPosts.length).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* 3. Fixed Bottom Bar Overlay: Byline, Dots & Prev/Next buttons (stationary during swipe) */}
      <div className="absolute inset-x-0 bottom-0 z-20 p-5 sm:p-7 md:p-9 pt-0 pointer-events-none">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-white/70 pointer-events-auto">
            <span>By {getDisplayName(currentPost.author)}</span>
            <span aria-hidden="true">•</span>
            <span>{formatRelativeTime(currentPost.createdAt)}</span>
          </div>

          <div className="flex items-center gap-3 pointer-events-auto">
            <div className="flex items-center gap-1.5">
              {featuredPosts.map((item, dotIndex) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goTo(dotIndex)}
                  aria-label={`Go to slide ${dotIndex + 1}`}
                  aria-current={currentIndex === dotIndex}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300 cursor-pointer',
                    currentIndex === dotIndex ? 'w-6 bg-primary' : 'w-1.5 bg-white/40 hover:bg-white/70'
                  )}
                />
              ))}
            </div>

            {/* Prev/Next buttons hidden on small screens (< sm), visible on desktop (sm:flex) */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                type="button"
                onClick={goPrev}
                className="inline-flex size-8 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-primary hover:text-on-primary cursor-pointer"
                aria-label="Previous slide"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="inline-flex size-8 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-primary hover:text-on-primary cursor-pointer"
                aria-label="Next slide"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Carousel>
  )
}

function EditorialFeed({ authStatus = true, mode = 'home' }) {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('q')?.trim() ?? ''

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
            <HeroCarousel posts={posts} />

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
                    "{searchQuery}"
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
                <h2 className="mt-4 text-3xl font-black text-on-surface break-words">
                  Nothing matched <span className="inline-block max-w-full truncate align-bottom">"{searchQuery}"</span>.
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
                  itemContent={(index, post) => {
                    return (
                      <div className="pb-5">
                        <PostCard {...post} canInteract={canInteract} />
                      </div>
                    )
                  }}
                />
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