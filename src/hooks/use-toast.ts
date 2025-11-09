/* *file-summary*
PATH: src/hooks/use-toast.ts

PURPOSE: Manages the global state for the toast notification system.

SUMMARY: This file implements the core logic for the toast system.
         It creates a global state (outside React) to hold the list of
         toasts and a reducer to manage that state.
         It exports:
         1. `toast()`: A function anyone can call to add a new toast.
         2. `useToast()`: A hook that the <Toaster> component uses
            to subscribe to the list of toasts and render them.

RELATES TO OTHER FILES:
- This is the "logic" for the toast system.
- It is imported by `src/components/ui/toaster.tsx`.
- It imports types from `src/components/ui/toast.tsx`.

IMPORTS:
- React
- { type ToastProps } from '@/components/ui/toast'
*/

import * as React from "react"
import { type ToastProps } from "@/components/ui/toast"

const TOAST_LIMIT = 5 // Max toasts at one time
const TOAST_REMOVE_DELAY = 5000 // Default auto-dismiss delay

// Define the shape of a toast object in the state
type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactElement
}

// Define the actions our reducer can take
type Action =
  | { type: "ADD_TOAST"; toast: ToasterToast }
  | { type: "UPDATE_TOAST"; toast: Partial<ToasterToast> }
  | { type: "DISMISS_TOAST"; toastId?: ToasterToast["id"] }
  | { type: "REMOVE_TOAST"; toastId?: ToasterToast["id"] }

interface State {
  toasts: ToasterToast[]
}

// A simple queue for pending toasts
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

// Helper to add a toast to the queue for dismissal
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({ type: "REMOVE_TOAST", toastId: toastId })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

// --- Global state managed outside of React ---
let memoryState: State = { toasts: [] }
const listeners = new Set<(state: State) => void>()
// ---

// The reducer function to manage state transitions
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        // Add new toast, limit the total
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST":
      const { toastId } = action
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? { ...t, open: false }
            : t
        ),
      }

    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return { ...state, toasts: [] }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

// The dispatch function that updates the global state and notifies listeners
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

// --- EXPORTED FUNCTIONS ---

// The type for the `toast()` function input
type Toast = Omit<ToasterToast, "id">

/**
 * Public function to add a new toast.
 * This is what other components will call.
 * e.g., toast({ title: "Success!", description: "Data saved." })
 */
function toast(props: Toast) {
  const id = Math.random().toString(36).substring(2, 9) // simple unique ID

  const newToast: ToasterToast = {
    ...props,
    id,
    open: true,
    onOpenChange: (open: boolean) => {
      if (!open) {
        dispatch({ type: "DISMISS_TOAST", toastId: id })
      }
    },
  }

  dispatch({ type: "ADD_TOAST", toast: newToast })

  // Set up auto-dismissal
  setTimeout(() => {
    dispatch({ type: "DISMISS_TOAST", toastId: id })
  }, TOAST_REMOVE_DELAY)

  return {
    id: id,
    dismiss: () => dispatch({ type: "DISMISS_TOAST", toastId: id }),
    update: (props: Partial<ToasterToast>) =>
      dispatch({ type: "UPDATE_TOAST", toast: { ...props, id } }),
  }
}

/**
 * The hook used by the <Toaster> component to get the list of toasts.
 */
function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    // Subscribe to the global state
    const listener = (newState: State) => setState(newState)
    listeners.add(listener)

    // Unsubscribe on unmount
    return () => {
      listeners.delete(listener)
    }
  }, [state])

  return {
    toasts: state.toasts,
  }
}

export { useToast, toast }