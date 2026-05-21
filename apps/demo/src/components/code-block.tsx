import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export function CodeBlock({ code, language, className = "" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  return (
    <div className={`relative rounded-lg border border-kite-border bg-[#2A241B] text-[#F1EBE0] ${className}`}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        <span className="text-[10px] font-mono tracking-widest uppercase text-kite-primary/80">
          {language ?? "code"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-kite-primary/80 hover:text-[#F1EBE0] transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-kite-accent" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre className="px-4 py-4 overflow-x-auto text-sm font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
