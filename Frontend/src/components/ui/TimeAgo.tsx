import { useEffect, useState } from 'react';
import { formatRelativeTime } from '@/lib/post-helpers';

interface TimeAgoProps {
  timestamp: string | Date;
  className?: string; // Allows you to pass Tailwind classes from PostCard
}

export function TimeAgo({ timestamp, className }: TimeAgoProps) {
  // 1. Initialize with a deterministic state
  const [mounted, setMounted] = useState(false);
  const [timeString, setTimeString] = useState('');

  // 2. Defer calculation to the client
  useEffect(() => {
    setMounted(true);
    setTimeString(formatRelativeTime(timestamp));
  }, [timestamp]);

  // 3. Render identical fallback for Server and initial Client render
  if (!mounted) {
    // Renders an empty span with the exact same dimensions to prevent layout shift
    return <span className={className}></span>; 
  }

  // 4. Render the client-calculated time
  return <span className={className}>{timeString}</span>;
}