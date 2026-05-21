import { useState } from "react";
import { CodeBlock } from "./code-block";

const MANAGERS = ["pnpm", "npm", "yarn", "bun"] as const;
type Manager = (typeof MANAGERS)[number];

const cmd = (mgr: Manager, pkg: string) => {
  switch (mgr) {
    case "pnpm": return `pnpm add ${pkg}`;
    case "npm":  return `npm install ${pkg}`;
    case "yarn": return `yarn add ${pkg}`;
    case "bun":  return `bun add ${pkg}`;
  }
};

export function InstallTabs({ pkg }: { pkg: string }) {
  const [active, setActive] = useState<Manager>("pnpm");
  return (
    <div>
      <div className="flex items-center gap-1 border-b border-kite-border mb-2">
        {MANAGERS.map((m) => (
          <button
            key={m}
            onClick={() => setActive(m)}
            className={`px-3 py-1.5 text-xs font-mono tracking-wide border-b-2 -mb-px transition-colors ${
              active === m
                ? "border-kite-primary text-kite-fg"
                : "border-transparent text-kite-fg/50 hover:text-kite-fg"
            }`}
          >
            {m}
          </button>
        ))}
      </div>
      <CodeBlock code={cmd(active, pkg)} language="shell" />
    </div>
  );
}
