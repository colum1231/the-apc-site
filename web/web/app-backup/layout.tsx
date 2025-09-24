
import "./globals.css";
import BodyWithPathname from "./components/BodyWithPathname";

export const metadata = {
  title: "APC",
  description: "A-Players Club",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <BodyWithPathname>
        {children}
      </BodyWithPathname>
    </html>
  );
}