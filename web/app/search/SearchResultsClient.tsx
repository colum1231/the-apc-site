"use client";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useRef } from "react";

const MembersPaneClient = dynamic(() => import("./MembersPaneClient"), { ssr: false });
const RightSectionClient = dynamic(() => import("./RightSectionClient"), { ssr: false });

type Member = { name: string; industry?: string; quote?: string };
type Item = { title: string; subtitle?: string; quote?: string; url?: string };

type Props = {
  members: Member[];
  partnerships: Item[];
  calls: Item[];
  resources: Item[];
  events: Item[];
  q: string;
};

export default function SearchResultsClient({ members, partnerships, calls, resources, events, q }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = inputRef.current?.value || "";
    if (value.trim()) {
      router.push(`/results?query=${encodeURIComponent(value)}`);
    }
  }

  return (
    <main className="apc-results-main">
      <div className="apc-results-shell">
        <section className="apc-results-left">
          <form onSubmit={handleSubmit} className="results-search" role="search">
            <input
              ref={inputRef}
              name="q"
              defaultValue={q}
              placeholder="Your next move...."
              className="input results-input results-input--home"
              autoFocus
            />
          </form>
          <MembersPaneClient initialItems={members} q={q} />
        </section>
        <section className="apc-results-right">
          <div className="right-inner">
            <RightSectionClient label="PARTNERSHIPS" items={partnerships} href="/partnerships" />
            <RightSectionClient label="CALL LIBRARY" items={calls} href="/calls" />
            <RightSectionClient label="RESOURCES" items={resources} href="/resources" />
            <RightSectionClient label="EVENTS" items={events} href="/events" />
            <div className="other-footer">OTHER</div>
          </div>
        </section>
      </div>
    </main>
  );
}
