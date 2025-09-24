'use client';
import { useSearchParams } from 'next/navigation';
import SearchResultsClient from './SearchResultsClient';

export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  // You can pass q as a prop or use it directly in SearchResultsClient
  // TODO: Replace the empty arrays/objects below with actual data as needed
  return (
    <SearchResultsClient
      q={q}
      members={[]}
      partnerships={[]}
      calls={[]}
      resources={[]}
      events={[]}
    />
  );
}
