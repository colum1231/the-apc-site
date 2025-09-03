export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default function Page() {
  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Background + vertical fade */}
      <div className="absolute inset-0 -z-10">
        <img
          src="/landing-bg.jpg"
          alt="Background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>

      {/* LOGO — center of the logo at 274px from top */}
      <img
        src="/aplayers-mark.svg"
        alt="A Players Logo"
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: "274px",       // place the element's center on 274px
          transform: "translate(-50%, -50%)",
          height: "120px",    // you can tweak this if you want larger/smaller
          width: "120px",
        }}
      />

      {/* SEARCH (no button; submit on Enter) */}
      <form
        action="/search"
        method="get"
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: "585px",       // top edge at 585px
          width: "800px",     // exact width
          height: "80px",     // exact height (bottom = 665px)
        }}
      >
        <input
          autoFocus
          type="text"
          name="q"
          placeholder="What’s your next move?"
          className="w-full h-full rounded-full bg-transparent text-center outline-none"
          style={{
            border: "1px solid #545454",   // darker grey outline
            color: "#545454",              // input text color
            fontSize: "18px",              // prompt font size
            // optional: dim the caret to match
            caretColor: "#545454",
          }}
        />
        {/* No button needed — hitting Enter submits the form by default */}
      </form>

      {/* GO TO HQ prompt under the box */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{ top: "685px" }}
      >
        <a
          href="/hq"
          className="px-5 py-2 rounded-md"
          style={{
            color: "#272727",       // darker grey
            fontSize: "20px",       // specified size
          }}
        >
          Go to HQ
        </a>
      </div>
    </main>
  );
}