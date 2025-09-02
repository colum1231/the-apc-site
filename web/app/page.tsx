export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-6">What’s your next move?</h1>
      <form action="/results" method="get" className="w-full max-w-md flex">
        <input
          type="text"
          name="q"
          placeholder="Enter your prompt..."
          className="flex-grow p-3 rounded-l-md text-black"
        />
        <button type="submit" className="bg-yellow-500 text-black px-4 py-3 rounded-r-md font-bold">
          Go
        </button>
      </form>
    </main>
  );
}