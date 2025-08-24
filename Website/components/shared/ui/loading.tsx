import { cn } from "@/lib/utils"

export function Loading({ className }: { className?: string }) {
  return (
    <div className={cn("flex w-full min-h-screen items-center justify-center", className)}>
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-5 w-5 rounded-full bg-primary animate-bounce"
              style={{
                animationDelay: `${i * 0.1}s`,
                animationDuration: "0.8s"
              }}
            />
          ))}
        </div>
        <p className="text-lg font-medium text-muted-foreground animate-pulse">
          Loading your data model...
        </p>
      </div>
    </div>
  )
}