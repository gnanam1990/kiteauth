import { KiteLogo } from "./kite-logo";

interface SiteHeaderProps {
  page: "home" | "docs" | "playground";
  onNavigate: (page: "home" | "docs" | "playground") => void;
}

export function SiteHeader({ page, onNavigate }: SiteHeaderProps) {
  const linkCls = (target: string) =>
    `text-xs font-semibold tracking-widest uppercase transition-colors ${
      page === target ? "text-kite-fg" : "text-kite-fg/55 hover:text-kite-fg"
    }`;
  return (
    <header className="sticky top-0 z-50 w-full border-b border-kite-border bg-kite-bg/95 backdrop-blur-sm shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div
          onClick={() => onNavigate("home")}
          className="cursor-pointer flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <KiteLogo />
          <span className="hidden sm:inline-block h-4 w-px bg-kite-border" />
          <span className="hidden sm:inline-block font-sans text-xs font-bold tracking-widest text-kite-primary uppercase">
            KiteAuth
          </span>
        </div>
        <nav className="flex items-center gap-6">
          <button onClick={() => onNavigate("home")} className={linkCls("home")}>Home</button>
          <button onClick={() => onNavigate("docs")} className={linkCls("docs")}>Docs</button>
          <button onClick={() => onNavigate("playground")} className={linkCls("playground")}>Playground</button>
          <a
            href="https://github.com/gnanam1990/kiteauth"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold tracking-widest uppercase text-kite-fg/55 hover:text-kite-fg transition-colors"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
