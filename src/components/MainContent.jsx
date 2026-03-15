export default function MainContent({ children }) {
  return (
    <main className="relative min-w-0 flex-1 overflow-x-hidden px-3 py-4 sm:px-5 lg:px-6 lg:py-6">
      <div className="w-full min-w-0">{children}</div>
    </main>
  )
}