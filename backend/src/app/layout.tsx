import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VLXD Backend API",
  description: "API server for Vật Liệu Xây Dựng Pro",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
