import { NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard", roles: ["owner", "admin", "instructor", "student"] },
  { label: "Students", path: "/students", roles: ["owner", "admin", "instructor"] },
  { label: "Instructors", path: "/instructors", roles: ["owner", "admin"] },
  { label: "Courses", path: "/courses", roles: ["owner", "admin"] },
  { label: "Fees", path: "/fees", roles: ["owner", "admin"] },
  { label: "Settings", path: "/settings", roles: ["owner"] },
];

/**
 * Sidebar — styled like a tabbed folder divider system, the kind
 * you'd find labeling sections in a physical register binder,
 * rather than a generic icon + label nav list. Nav items are
 * filtered by the current user's role.
 */
export function Sidebar() {
  const { institute, profile, signOut } = useAuth();
  const role = profile?.role ?? "student";
  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-60 shrink-0 bg-ink text-paper min-h-screen flex flex-col">
      <div className="px-6 py-6 border-b border-paper/10">
        <p className="font-display text-xl font-semibold tracking-tight">
          Eduvia
        </p>
        <p className="font-body text-xs text-paper/50 mt-0.5 truncate">
          {institute?.name ?? "Loading…"}
        </p>
      </div>

      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-0.5">
          {visibleItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `block w-full text-left px-3 py-2 rounded-[var(--radius-card)] font-body text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-light ${
                    isActive
                      ? "bg-paper/10 text-paper font-medium"
                      : "text-paper/60 hover:text-paper hover:bg-paper/5"
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-6 py-4 border-t border-paper/10">
        <p className="font-body text-xs text-paper/50 mb-2 truncate">
          {profile?.full_name} · {role}
        </p>
        <button
          onClick={signOut}
          className="font-body text-xs text-paper/40 hover:text-paper/70 transition-colors"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
