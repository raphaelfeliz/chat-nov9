/* *file-summary*
PATH: src/components/global/card.tsx

PURPOSE: To provide a flexible, styled, multi-part card component for the application's design system, based on shadcn/ui.

SUMMARY: This file defines a set of reusable, composable Card components. It includes the main `Card` container and its constituent parts: `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, and `CardFooter`. Each component is built using `React.forwardRef` to allow parent components to access the underlying DOM element, and it uses the `cn()` utility to merge default Tailwind styles with any custom `className` props passed to it.

RELATES TO OTHER FILES:
- This is a foundational UI primitive file, part of the "global" design system.
- It is imported by components like 'src/components/configurator/option-card.tsx' and 'src/components/configurator/result-product-card.tsx' to provide a consistent visual wrapper.
- It imports the `cn` utility function from '@/lib/utils' for merging Tailwind CSS classes.

IMPORTS:
- React from "react"
- cn from "@/lib/utils"

EXPORTS:
- Card (React component)
- CardHeader (React component)
- CardFooter (React component)
- CardTitle (React component)
- CardDescription (React component)
- CardContent (React component)
*/

import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
