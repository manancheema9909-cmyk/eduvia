import { Sidebar } from "@/components/Sidebar";

export function PageShell({ title, subtitle, actions, children }) {
  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar />
      <main className="flex-1 px-10 py-8">
        <header className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold text-ink">
              {title}
            </h1>
            {subtitle && (
              <p className="font-body text-sm text-ink/50 mt-1">{subtitle}</p>
            )}
          </div>
          {actions}
        </header>
        {children}
      </main>
    </div>
  );
}
