import * as React from "react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative h-svh overflow-hidden auth-gradient text-foreground flex flex-col justify-center items-center p-4 md:p-8">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

      {/* Main glass card container — capped to the viewport, scrolls internally */}
      <div className="relative z-10 w-full max-w-[420px] max-h-[calc(100svh-2rem)] overflow-y-auto rounded-3xl border border-border/70 bg-card/80 p-5 md:p-6 shadow-2xl backdrop-blur-xl animate-fade-in-up glow-sm-violet dark:border-white/10 dark:bg-card/70">
        {children}
      </div>
    </div>
  )
}
