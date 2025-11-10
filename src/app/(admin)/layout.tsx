// src/app/(admin)/layout.tsx
import '../globals.css'; // Reuse your existing global styles

export const metadata = {
  title: 'Admin Chat Viewer',
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      {/* This is a minimal layout for the admin section.
        It does NOT include the AppHeader or ConfiguratorProvider.
      */}
      <body className="font-body antialiased bg-[#0d1a26]">
        {children}
      </body>
    </html>
  );
}