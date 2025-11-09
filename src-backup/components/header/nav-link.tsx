/* *file-summary*
PATH: src/components/header/nav-link.tsx

PURPOSE: A reusable component for client-side navigation links within the Next.js App Router, providing active state styling.

SUMMARY: This component wraps the Next.js `Link` component. It uses the `usePathname` hook (requiring `'use client'`) to determine if the link's `href` matches the current route. Based on the comparison, it dynamically applies styling: an active link gets distinct styling (e.g., `text-white` and a `ring`), while inactive links receive hover effects (`hover:text-white`). This ensures users have clear visual feedback on the active tab or page.

RELATES TO OTHER FILES:
- This component is a foundational UI element that would typically be used within a primary navigation structure, such as 'src/components/header/app-header.tsx' or a desktop sidebar, though it is not explicitly used by the current `AppHeader`.
- It relies on Next.js client-side hooks (`usePathname`) for functionality.

IMPORTS:
- Link from 'next/link'
- usePathname from 'next/navigation'
- ReactNode from 'react'
*/

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface NavLinkProps {
  href: string;
  children: ReactNode;
}

export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`rounded-md px-3 py-2 text-sm font-medium ${
        isActive
          ? 'text-white ring-1 ring-inset ring-purple-500'
          : 'text-gray-400 hover:text-white'
      }`}
    >
      {children}
    </Link>
  );
}
