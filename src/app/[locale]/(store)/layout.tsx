import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";
import { StoreProvider } from "@/components/store/StoreProvider";
import { SkipLink } from "@/components/layout/SkipLink";

/** Shop chrome: announcement bar, header, footer and the mobile bottom navigation. */
export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <div className="flex min-h-dvh flex-col pb-[calc(56px+env(safe-area-inset-bottom))] md:pb-0">
        <SkipLink />
        <AnnouncementBar />
        <Header />
        <main id="main" tabIndex={-1} className="flex-1 outline-none">{children}</main>
        <Footer />
        <BottomNav />
      </div>
    </StoreProvider>
  );
}
