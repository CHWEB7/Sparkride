import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BookPageContent } from "@/components/BookPageContent";

export default function BookPage() {
  return (
    <>
      <Header />
      <main className="pt-24 pb-16 min-h-screen bg-white dark:bg-dark">
        <BookPageContent />
      </main>
      <Footer />
    </>
  );
}
