import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[120px] w-full rounded-xl border border-rippl-black-3 bg-rippl-black-2/50 px-4 py-3 text-base text-white ring-offset-rippl-black placeholder:text-rippl-gray/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rippl-violet focus-visible:border-rippl-violet disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all resize-y",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
