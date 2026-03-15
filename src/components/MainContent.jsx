export default function MainContent({ children }) {
  return (
    <main className="relative min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <div className="w-full min-w-0">{children}</div>
    </main>
  )
}