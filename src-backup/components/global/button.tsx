/* *file-summary*
PATH: src/components/global/button.tsx

PURPOSE: Provides a highly customizable and reusable Button component for the application's design system, using CVA for styling variations.

SUMMARY: This file defines the core `Button` component, which is a foundational UI primitive. Styling is managed using the `class-variance-authority` (CVA) library, allowing for predefined `variant` (default, destructive, outline, ghost, etc.) and `size` (default, sm, lg, icon) options. The component utilizes `React.forwardRef` to allow access to the underlying DOM element and supports the `asChild` prop from `@radix-ui/react-slot`. If `asChild` is true, the button renders as a `Slot` (passing its styles and properties to a child element) instead of a native `<button>`, enabling composition. The utility `cn` is used to merge CVA-generated classes with any custom `className` passed by the user.

RELATES TO OTHER FILES:
- This is a foundational UI element used widely throughout the application, such as by 'src/components/header/restart-button.tsx' and potentially 'src/components/configurator/option-card.tsx' (if they use the Button primitive).
- It relies on the class utility function imported from '@/lib/utils.ts' for Tailwind class merging.
- It exports both the `Button` component and the `buttonVariants` object for external use (e.g., for creating components that share button styling).

IMPORTS:
- React from "react"
- Slot from "@radix-ui/react-slot"
- cva, type VariantProps from "class-variance-authority"
- cn from "@/lib/utils"

EXPORTS:
- Button (React functional component)
- buttonVariants (CVA object for button styling)
*/

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
