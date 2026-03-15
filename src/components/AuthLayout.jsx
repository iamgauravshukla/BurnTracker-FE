import { Link } from 'react-router-dom'

export default function AuthLayout({ title, subtitle, footerText, footerLink, footerLabel, children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-[#f9fafb] to-[#eef2ff] text-slate-900">
      <div className="absolute inset-0">
        <div className="absolute left-[-8rem] top-[-6rem] h-80 w-80 rounded-full bg-[#fef5ed] blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-6rem] h-[26rem] w-[26rem] rounded-full bg-[#e0f2fe] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:88px_88px] opacity-40" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-10 lg:px-10">
        <section className="grid w-full max-w-6xl overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white/90 shadow-[0_28px_80px_rgba(148,163,184,0.35)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative hidden min-h-[680px] overflow-hidden border-r border-slate-100 bg-gradient-to-b from-[#eef2ff] via-white to-[#fef3c7] p-10 text-slate-900 lg:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,114,182,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.18),transparent_30%)]" />
            <div className="relative flex h-full flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-3 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm text-slate-700 shadow-sm">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[linear-gradient(135deg,#e0f2fe_0%,#f5d0fe_45%,#fee2e2_100%)] text-[11px] font-semibold text-slate-900">
                    SX
                  </span>
                  StartupTracker
                </div>
                <h1 className="mt-10 max-w-md text-5xl font-semibold tracking-[-0.05em] text-slate-900">Run the company from one intentional dashboard.</h1>
                <p className="mt-5 max-w-md text-base leading-8 text-slate-600">
                  Monitor budget, tasks, income, expenses, and AI-generated insights through a cleaner founder operating system.
                </p>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.8rem] border border-white/60 bg-white/80 p-5 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Budget control</p>
                    <p className="mt-3 text-3xl font-semibold text-slate-900">Live</p>
                    <p className="mt-2 text-sm text-slate-600">Leftover fund, overspend, and runway tracked in one view.</p>
                  </div>
                  <div className="rounded-[1.8rem] border border-white/60 bg-white/80 p-5 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Execution</p>
                    <p className="mt-3 text-3xl font-semibold text-slate-900">Aligned</p>
                    <p className="mt-2 text-sm text-slate-600">Deadlines, due-soon notifications, and quick task completion.</p>
                  </div>
                </div>
                <div className="rounded-[1.8rem] border border-white/60 bg-gradient-to-r from-[#eef2ff] via-white to-[#fef3c7] p-5 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">AI capture</p>
                  <p className="mt-3 text-lg font-semibold text-slate-900">Parse chat and documents into financial records automatically.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            <section className="mx-auto flex min-h-full w-full max-w-[30rem] flex-col justify-center">
              <div className="mb-8 text-center lg:hidden">
                <div className="mx-auto inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
                    SX
                  </span>
                  StartupTracker
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-100 bg-white/90 p-3 shadow-[0_22px_60px_rgba(148,163,184,0.28)]">
                <div className="rounded-[1.65rem] border border-slate-100 bg-[#f9fafb] px-6 py-8 sm:px-8 sm:py-9">
                  <div className="mb-8 space-y-3 text-center">
                    <h2 className="text-[2rem] font-semibold tracking-[-0.04em] text-slate-950">{title}</h2>
                    <p className="mx-auto max-w-sm text-sm leading-7 text-slate-500">{subtitle}</p>
                  </div>

                  {children}

                  <p className="mt-8 text-center text-sm text-slate-500">
                    {footerText}{' '}
                    <Link className="font-medium text-slate-950 transition hover:text-slate-700" to={footerLink}>
                      {footerLabel}
                    </Link>
                  </p>
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </div>
  )
}