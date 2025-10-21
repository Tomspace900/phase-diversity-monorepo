import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CodeBlockProps {
  content: string;
  language?: "python" | "log" | "json" | "text";
  maxHeight?: string;
  searchable?: boolean;
  downloadable?: boolean;
  filename?: string;
  className?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  content,
  language = "text",
  maxHeight = "400px",
  searchable = false,
  downloadable = false,
  filename = "output.txt",
  className = "",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  // Simple syntax highlighting
  const highlightSyntax = (code: string): string => {
    if (language === "python") {
      return code
        .replace(
          /\b(def|class|import|from|return|if|else|elif|for|while|try|except|with|as)\b/g,
          '<span class="text-accent-purple">$1</span>'
        )
        .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-accent-cyan">$1</span>')
        .replace(
          /(["'])(.*?)\1/g,
          '<span class="text-accent-green">$1$2$1</span>'
        )
        .replace(/#.*/g, '<span class="text-muted-foreground">$&</span>');
    } else if (language === "json") {
      return code
        .replace(
          /(["'])(.*?)\1:/g,
          '<span class="text-accent-cyan">$1$2$1</span>:'
        )
        .replace(
          /:\s*(["'])(.*?)\1/g,
          ': <span class="text-accent-green">$1$2$1</span>'
        )
        .replace(
          /:\s*(\d+\.?\d*)/g,
          ': <span class="text-accent-purple">$1</span>'
        )
        .replace(
          /:\s*(true|false|null)/g,
          ': <span class="text-accent-orange">$1</span>'
        );
    } else if (language === "log") {
      return code
        .replace(
          /\[ERROR\]|\bERROR\b/gi,
          '<span class="text-error font-semibold">$&</span>'
        )
        .replace(
          /\[WARN\]|\bWARN(ING)?\b/gi,
          '<span class="text-accent-orange font-semibold">$&</span>'
        )
        .replace(
          /\[INFO\]|\bINFO\b/gi,
          '<span class="text-info font-semibold">$&</span>'
        )
        .replace(
          /\[SUCCESS\]|\bSUCCESS\b/gi,
          '<span class="text-accent-green font-semibold">$&</span>'
        )
        .replace(
          /\d{4}-\d{2}-\d{2}/g,
          '<span class="text-accent-cyan">$&</span>'
        )
        .replace(
          /\d{2}:\d{2}:\d{2}/g,
          '<span class="text-accent-cyan">$&</span>'
        );
    }
    return code;
  };

  // Filter content by search term
  const filteredContent = searchTerm
    ? content
        .split("\n")
        .filter((line) => line.toLowerCase().includes(searchTerm.toLowerCase()))
        .join("\n")
    : content;

  const highlightedContent = highlightSyntax(filteredContent);

  // Copy to clipboard
  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download file
  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`border border-border rounded-lg overflow-hidden ${className}`}
    >
      {/* Header with actions */}
      <div className="flex items-center justify-between gap-2 px-4 py-2 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xs text-muted-foreground font-mono uppercase">
            {language}
          </span>
          {searchable && (
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-7 pl-8 text-xs"
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 text-xs"
          >
            <Copy className="h-3.5 w-3.5 mr-1" />
            {copied ? "Copied!" : "Copy"}
          </Button>
          {downloadable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="h-7 px-2 text-xs"
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              Download
            </Button>
          )}
        </div>
      </div>

      {/* Code content */}
      <div className="relative">
        <pre
          ref={preRef}
          className="overflow-auto p-4 bg-muted/10 text-sm font-mono"
          style={{ maxHeight }}
        >
          <code
            dangerouslySetInnerHTML={{ __html: highlightedContent }}
            className="text-foreground"
          />
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;
