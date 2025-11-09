/* *file-summary*
PATH: src/components/ui/toaster.tsx

PURPOSE: The global container component responsible for rendering
         and managing all active toast notifications.

SUMMARY: This component is rendered once in the root layout. It imports
         the `useToast` hook to get the list of active toasts. It
         then maps over this array and renders each toast using the
         primitive components (Toast, ToastTitle, etc.).

RELATES TO OTHER FILES:
- This is the "renderer" for the toast system.
- It is imported by `src/app/layout.tsx`.
- It consumes the state from `src/hooks/use-toast.ts`.
- It imports its building blocks from `src/components/ui/toast.tsx`.

IMPORTS:
- useToast from '@/hooks/use-toast'
- { Toast, ToastClose, ... } from '@/components/ui/toast'
*/

"use client"

// --- REFACTOR: Import from new 'hooks' path ---
import { useToast } from "@/hooks/use-toast"
// --- REFACTOR: Import from new 'components/ui' path ---
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

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