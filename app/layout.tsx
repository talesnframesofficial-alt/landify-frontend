import "../styles/globals.css";
import { Navbar } from "../components/Navbar";
import MobileNav from "../components/MobileNav";
import { SupabaseProvider } from "../components/SupabaseProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-800">
        <SupabaseProvider>
          {/* TOP NAVBAR */}
          <Navbar />

          {/* MAIN CONTENT AREA */}
          <main className="pt-20 pb-24">{children}</main>

          {/* MOBILE BOTTOM NAVBAR */}
          <MobileNav />
        </SupabaseProvider>
      </body>
    </html>
  );
}

