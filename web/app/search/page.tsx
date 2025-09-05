// web/app/search/page.tsx
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type RawAPI = {
  ok?: boolean;
  data?: any;
  openai_response?: string;
  [k: string]: any;
};

type Sections = {
  members: any[];
  transcripts: any[];
  resources: any[];
  partnerships: any[];
  events: any[];
  tokens?: Partial<Record<keyof Omit<Sections, "tokens">, string>>;
};

/** Extracts the ```json … ``` block from openai_response and parses it,
 * or maps an already-structured payload. */
function parseStructured(data: any): Sections | null {
  const body = data?.data ?? data;

  const looksStructured =
    body?.transcripts ||
    body?.community_chats ||
    body?.resources ||
    body?.partnerships ||
    body?.events;

  if (looksStructured) {
    return {
      members: body?.community_chats ?? [],
      transcripts: body?.transcripts ?? [],
      resources: body?.resources ?? [],
      partnerships: body?.partnerships ?? [],
      events: body?.events ?? [],
      tokens: {
        members: body?.community_chats?.load_more_token,
        transcripts: body?.transcripts?.load_more_token,
        resources: body?.resources?.load_more_token,
        partnerships: body?.partnerships?.load_more_token,
        events: body?.events?.load_more_token,
      },
    };
  }

  const text: string | undefined =
    body?.openai_response ?? body?.message ?? data?.openai_response;
  if (!text) return null;

  const fence =
    text.match(/```json\s*([\s\S]*?)```/) ?? text.match(/```\s*([\s\S]*?)```/);
  if (!fence) return null;

  try {
    const obj = JSON.parse(fence[1].trim());
    return {
      members: obj.community_chats?.items ?? obj.community_chats ?? [],
      transcripts: obj.transcripts?.items ?? obj.transcripts ?? [],
      resources: obj.resources?.items ?? obj.resources ?? [],
      partnerships: obj.partnerships?.items ?? obj.partnerships ?? [],
      events: obj.events?.items ?? obj.events ?? [],
      tokens: {
        members: obj.community_chats?.load_more_token,
        transcripts: obj.transcripts?.load_more_token,
        resources: obj.resources?.load_more_token,
        partnerships: obj.partnerships?.load_more_token,
        events: obj.events?.load_more_token,
      },
    };
  } catch {
    return null;
  }
}

export default async function SearchPage({
  // IMPORTANT: this is a plain object — do NOT Promise/await it
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const raw = searchParams?.q;
  const q = Array.isArray(raw) ? raw[0] : raw ?? "";

  // Ask API (same-origin)
  let json: RawAPI | null = null;
  if (q) {
    try {
      const res = await fetch(`/api/ask?q=${encodeURIComponent(q)}`, {
        cache: "no-store",
      });
      try {
        json = (await res.json()) as RawAPI;
      } catch {
        json = { ok: false, status: res.status, body: await res.text() } as any;
      }
    } catch {
      json = { ok: false, error: "fetch failed" } as any;
    }
  }

  const sections = json ? parseStructured(json) : null;

  // keep your existing initial counts so CSS layout stays consistent
  const LEFT_COUNT = 5;
  const RIGHT_COUNT = 3;

  return (
    <main className="results">
      {/* reuse landing background */}
      <div className="landing-wrap" aria-hidden="true" />

      <div className="results-shell">
        {/* LEFT: Search + Members */}
        <section className="results-left">
          <form action="/search" method="get" className="results-search" role="search">
            <input
              name="q"
              defaultValue={q}
              placeholder="What’s your next move?"
              className="input results-input"
              autoFocus
            />
          </form>

          <div className="members-wrap">
            {/* corner ticks */}
            <div className="members-title-row" aria-hidden="true">
              <span className="corner left" />
              <span className="corner right" />
            </div>

            <h2 className="members-title">Members</h2>

            {!sections && (
              <p className="muted">Type a search above to see relevant members.</p>
            )}

            {sections && (
              <>
                <ul className="members-list">
                  {(sections.members ?? []).slice(0, LEFT_COUNT).map((m, i) => {
                    const name =
                      m?.title || m?.name || m?.display_name || "Member";
                    const quote = m?.quote || m?.line || m?.excerpt;
                    const meta =
                      m?.role || m?.industry || m?.expertise || m?.username || "";

                    return (
                      <li key={`member-${i}`} className="member-card">
                        <div className="member-head">
                          <span className="member-name">{name}</span>
                          {meta && (
                            <>
                              <span className="sep">|</span>
                              <span className="member-meta">
                                {String(meta).toUpperCase()}
                              </span>
                            </>
                          )}
                        </div>

                        {quote && <div className="member-quote">“{quote}”</div>}

                        <div className="member-contact">CONTACT</div>
                      </li>
                    );
                  })}
                </ul>

                {(sections.members ?? []).length > LEFT_COUNT && (
                  <div className="load-more-row">
                    <button className="load-more-btn" type="button" disabled>
                      LOAD MORE
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* RIGHT: collapsibles */}
        <aside className="results-right">
          <RightSection
            label="PARTNERSHIPS"
            items={sections?.partnerships ?? []}
            count={RIGHT_COUNT}
            href="/partnerships"
          />
          <RightSection
            label="CALL LIBRARY"
            items={sections?.transcripts ?? []}
            count={RIGHT_COUNT}
            href="/calls"
          />
          <RightSection
            label="RESOURCES"
            items={sections?.resources ?? []}
            count={RIGHT_COUNT}
            href="/resources"
          />
          <RightSection
            label="EVENTS"
            items={sections?.events ?? []}
            count={RIGHT_COUNT}
            href="/events"
          />
          <div className="other-footer">OTHER</div>
        </aside>
      </div>
    </main>
  );
}

/** Right hand collapsible section (unchanged structure/visuals). */
function RightSection({
  label,
  items,
  count,
  href,
}: {
  label: string;
  items: any[];
  count: number;
  href: string;
}) {
  if (!items || items.length === 0) {
    return (
      <div className="right-head no-items">
        <Link href={href} className="right-title">
          {label}
        </Link>
        <Link href={href} className="right-arrow" aria-label={`Go to ${label}`}>
          ▸
        </Link>
      </div>
    );
  }

  return (
    <details className="right-acc">
      <summary className="right-head">
        <span className="right-title">{label}</span>
        <span className="right-arrow" aria-hidden>
          ▸
        </span>
      </summary>

      <div className="right-body">
        <ul className="right-list">
          {items.slice(0, count).map((it: any, i: number) => {
            const title =
              it?.title || it?.name || it?.display_name || "Untitled";
            const quote = it?.quote || it?.summary || it?.description;
            const url = it?.url;

            return (
              <li key={`${label}-${i}`} className="right-card">
                {url ? (
                  <a href={url} target="_blank" rel="noreferrer" className="right-card-title">
                    {title}
                  </a>
                ) : (
                  <div className="right-card-title">{title}</div>
                )}
                {quote && <div className="right-card-sub">{quote}</div>}
              </li>
            );
          })}
        </ul>

        {items.length > count && (
          <div className="right-loadmore">
            <button className="load-more-btn" type="button" disabled>
              LOAD MORE
            </button>
          </div>
        )}
      </div>
    </details>
  );
}