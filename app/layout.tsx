import "../styles/globals.css";
import { Navbar } from "../components/Navbar";
import MobileNav from "../components/MobileNav";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-800">
        {/* TOP NAVBAR */}
        <Navbar />

        {/* MAIN CONTENT AREA */}
        {/* Added extra pb-24 so bottom nav doesn't cover content */}
        <main className="pt-20 pb-24">{children}</main>

        {/* MOBILE BOTTOM NAVBAR */}
        <MobileNav />
      </body>
    </html>
  );
}
