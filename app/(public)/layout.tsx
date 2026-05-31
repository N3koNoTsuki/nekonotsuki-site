import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-kawaii-radial bg-fixed dark:bg-kawaii-radial-dark">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">{children}</main>
      <Footer />
    </div>
  );
}
