"use client";
import dynamic from "next/dynamic";

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
  return (
    <main className="apc-results-main">
      <div className="apc-results-shell">
        <section className="apc-results-left">
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
