export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      <form action="/search" method="get" className="w-full max-w-md flex gap-2">
        <input name="q" placeholder="What’s your next move?" className="flex-1 rounded-md border border-neutral-700 bg-transparent px-4 py-3"/>
        <button type="submit" className="rounded-md border border-neutral-600 px-5 py-3">Ask</button>
      </form>
      <div className="absolute bottom-8">
        <a href="/hq" className="text-neutral-400 underline">Go to HQ</a>
      </div>
    </main>
  );
}