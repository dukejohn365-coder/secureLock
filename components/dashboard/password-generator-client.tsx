"use client"

import * as React from "react"
import { Copy, RefreshCw, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { generatePassword, scorePassword, type GeneratorOptions } from "@/lib/passwords"
import { cn } from "@/lib/utils"

const defaultOptions: GeneratorOptions = {
  length: 20,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeAmbiguous: false,
}

export function PasswordGeneratorClient() {
  const [options, setOptions] = React.useState<GeneratorOptions>(defaultOptions)
  const [password, setPassword] = React.useState("")
  const [copied, setCopied] = React.useState(false)
  const [history, setHistory] = React.useState<string[]>([])

  const generate = React.useCallback(() => {
    const pw = generatePassword(options)
    setPassword(pw)
    setHistory((h) => [pw, ...h].slice(0, 8))
    setCopied(false)
  }, [options])

  // Seed one generated password on mount so the tool is immediately useful.
  // Generating during render would produce a hydration mismatch (random value).
  /* eslint-disable react-hooks/set-state-in-effect -- mount-only seed */
  React.useEffect(() => {
    generate()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleCopy = async () => {
    if (!password) return
    await navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const strength = scorePassword(password)

  const opt = (key: keyof GeneratorOptions, val: boolean | number) =>
    setOptions((o) => ({ ...o, [key]: val }))

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      {/* Left: Generator */}
      <div className="flex flex-col gap-5">
        {/* Generated password display */}
        <div className="group relative rounded-2xl border border-border/60 bg-card p-5">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-3">Generated Password</p>
          <div className="flex items-center gap-3 mb-4">
            <code
              className="flex-1 break-all font-mono text-xl font-semibold leading-relaxed tracking-wide text-foreground"
              id="generated-password"
              aria-live="polite"
            >
              {password || "Click generate to create a password"}
            </code>
          </div>

          {/* Strength */}
          {password && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Strength</span>
                <span className={cn("font-semibold", {
                  "text-red-500": strength.level === "very-weak" || strength.level === "weak",
                  "text-yellow-500": strength.level === "fair",
                  "text-emerald-500": strength.level === "strong",
                  "text-violet-500": strength.level === "very-strong",
                })}>
                  {strength.label}
                </span>
              </div>
              <Progress value={strength.score} className="h-2" indicatorClassName={cn(strength.color, "transition-all duration-700")} />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 mt-4">
            <Button onClick={generate} className="flex-1 glow-sm-violet" id="generate-btn">
              <RefreshCw className="size-4 mr-2" />
              Generate
            </Button>
            <Button
              variant="outline"
              onClick={handleCopy}
              disabled={!password}
              className="flex-1"
              id="copy-generated-btn"
            >
              {copied ? (
                <><Check className="size-4 mr-2 text-emerald-500" />Copied!</>
              ) : (
                <><Copy className="size-4 mr-2" />Copy</>
              )}
            </Button>
          </div>
        </div>

        {/* Options */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-5">
          <h2 className="font-semibold text-sm">Options</h2>

          {/* Length slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="length-slider" className="text-sm">Password Length</Label>
              <span className="text-sm font-mono font-semibold text-primary">{options.length}</span>
            </div>
            <Slider
              value={[options.length]}
              min={8}
              max={64}
              step={1}
              onValueChange={([v]) => opt("length", v)}
              className="py-2"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>8</span>
              <span>16</span>
              <span>32</span>
              <span>64</span>
            </div>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {([
              { key: "uppercase", label: "Uppercase (A-Z)", example: "ABC" },
              { key: "lowercase", label: "Lowercase (a-z)", example: "abc" },
              { key: "numbers", label: "Numbers (0-9)", example: "123" },
              { key: "symbols", label: "Symbols (!@#)", example: "!@#" },
              { key: "excludeAmbiguous", label: "Exclude Ambiguous", example: "0O1l" },
            ] as const).map(({ key, label, example }) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5"
              >
                <div>
                  <Label htmlFor={`opt-${key}`} className="text-sm cursor-pointer">{label}</Label>
                  <p className="text-[10px] text-muted-foreground font-mono">{example}</p>
                </div>
                <Switch
                  id={`opt-${key}`}
                  checked={!!options[key]}
                  onCheckedChange={(v) => opt(key, v)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: History */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Recent History</h2>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground/60 py-4 text-center">Generated passwords will appear here</p>
        ) : (
          <div className="space-y-2">
            {history.map((pw, i) => {
              const s = scorePassword(pw)
              return (
                <div
                  key={i}
                  className="group/hist flex items-center gap-2 rounded-xl border border-border/40 bg-muted/20 px-3 py-2 hover:border-primary/30 transition-all"
                >
                  <code className="flex-1 text-xs font-mono text-muted-foreground truncate">{pw}</code>
                  <div className={cn("size-2 rounded-full shrink-0", s.color)} />
                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText(pw)
                    }}
                    className="opacity-0 group-hover/hist:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                    aria-label="Copy"
                  >
                    <Copy className="size-3" />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Entropy info */}
        {password && (
          <div className="mt-4 rounded-xl bg-muted/40 p-3 space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Security Info</p>
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">Length: <span className="text-foreground font-mono">{password.length} chars</span></p>
              <p className="text-xs text-muted-foreground">Strength: <span className={cn("font-medium", {
                "text-red-500": strength.level === "very-weak" || strength.level === "weak",
                "text-yellow-500": strength.level === "fair",
                "text-emerald-500": strength.level === "strong",
                "text-violet-500": strength.level === "very-strong",
              })}>{strength.label}</span></p>
              <p className="text-xs text-muted-foreground">Score: <span className="text-foreground font-mono">{strength.score}/100</span></p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
