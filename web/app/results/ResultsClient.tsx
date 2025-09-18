"use client";
import dynamic from "next/dynamic";

const MembersPaneClient = dynamic(() => import("../search/MembersPaneClient"), { ssr: false });
const RightSectionClient = dynamic(() => import("../search/RightSectionClient"), { ssr: false });

type Member = { name: string; industry?: string; quote?: string };
type Category = { title: string; subtitle?: string; quote?: string; url?: string };

type Props = {
  members: Member[];
  categories: Category[];
  q: string;
};

export default function ResultsClient({ members, categories, q }: Props) {
  const callTranscripts = categories.filter((c) => c.title === "Call Transcripts").slice(0, 1);
  const resources = categories.filter((c) => c.title === "Resources").slice(0, 1);
  const partnerships = categories.filter((c) => c.title === "Partnerships").slice(0, 1);
  const events = categories.filter((c) => c.title === "Events").slice(0, 1);

  return (
    <main className="apc-results-main">
      <div className="apc-results-shell">
        <section className="apc-results-left">
          <MembersPaneClient initialItems={members} q={q} />
        </section>
        <section className="apc-results-right">
          <div className="right-inner">
            <RightSectionClient label="CALL TRANSCRIPTS" items={callTranscripts} href="/calls" />
            <RightSectionClient label="RESOURCES" items={resources} href="/resources" />
            <RightSectionClient label="PARTNERSHIPS" items={partnerships} href="/partnerships" />
            <RightSectionClient label="EVENTS" items={events} href="/events" />
            <div className="other-footer">OTHER</div>
          </div>
        </section>
      </div>
    </main>
  );
}
