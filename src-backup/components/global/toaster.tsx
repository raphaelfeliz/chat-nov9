/* *file-summary*
PATH: src/components/global/toaster.tsx

PURPOSE: The global container component responsible for rendering and managing all active toast notifications.

SUMMARY: This is the **Toaster component** that must be rendered once near the application root (e.g., in `layout.tsx`). It imports the `useToast` custom hook to access the centralized list of active toasts (`toasts`). It maps over this array and renders each item using the primitive components (`Toast`, `ToastTitle`, `ToastDescription`, `ToastClose`, etc.) imported from the global design system. It wraps all toasts in the required `ToastProvider` and positions them correctly via the `ToastViewport`.

RELATES TO OTHER FILES:
- **State Consumer:** It is the primary consumer of the state managed by the toast system, which is accessed via the custom hook `useToast` from '@/hooks/use-toast.ts'.
- **UI Provider:** It imports and composes all primitive UI elements (`Toast`, `ToastProvider`, `ToastViewport`, etc.) from '@/components/global/toast.tsx'.
- **Root Element:** It is imported and rendered by 'src/app/layout.tsx' to ensure global availability of notifications.

IMPORTS:
- useToast from "@/hooks/use-toast"
- Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport from "@/components/global/toast"

EXPORTS:
- Toaster (React functional component)
*/

"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/global/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
