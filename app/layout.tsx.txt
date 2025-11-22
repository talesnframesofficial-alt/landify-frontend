import "../styles/globals.css";
import { Navbar } from "../components/Navbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-800">
        <Navbar />
        <main className="pt-20 pb-10">{children}</main>
      </body>
    </html>
  );
}
