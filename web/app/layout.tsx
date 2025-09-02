import "./globals.css";

export const metadata = {
  title: "APC",
  description: "A-Players Club",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}