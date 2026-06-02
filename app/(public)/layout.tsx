import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Oneko from "@/components/Oneko";
import OnekoProvider from "@/components/OnekoProvider";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <OnekoProvider>
      <div className="relative flex min-h-screen flex-col">
        {/* Decorative glow, fixed to the viewport. We use a fixed overlay rather
            than `background-attachment: fixed`, which tears into visible seams on
            mobile Chrome when stacked under the cards' / navbar's backdrop-blur. */}
        <div
          className="pointer-events-none fixed inset-0 -z-10 bg-kawaii-radial dark:bg-kawaii-radial-dark"
          aria-hidden
        />
        <Navbar />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">{children}</main>
        <Footer />
        <Oneko />
      </div>
    </OnekoProvider>
  );
}
