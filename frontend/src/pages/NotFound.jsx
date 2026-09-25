import { Link } from 'react-router-dom';
import { Home, ShoppingBag, Search } from 'lucide-react';
import SEO from '../components/SEO';
import Reveal from '../components/Reveal';

export default function NotFound() {
  return (
    <div>
      <SEO title="Page Not Found" description="The page you're looking for doesn't exist. Head back to Sparkpretty Closet." url="/404" />

      <section className="section-padding min-h-[60vh] flex items-center">
        <div className="max-w-xl mx-auto text-center">
          <Reveal variant="scale">
            <p className="font-heading text-[7rem] md:text-[9rem] leading-none font-bold text-transparent" style={{ WebkitTextStroke: '2px var(--primary)' }}>404</p>
            <h1 className="font-heading text-3xl md:text-4xl font-bold mt-4 mb-3">This page has gone shopping</h1>
            <p className="text-text-light text-lg mb-8 leading-relaxed">
              The page you are looking for doesn't exist or has been moved. Let's get you back to the good stuff.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/" className="btn-primary px-8 py-4 inline-flex items-center justify-center gap-2">
                <Home size={18} /> Back to Home
              </Link>
              <Link to="/shop" className="btn-outline px-8 py-4 inline-flex items-center justify-center gap-2">
                <ShoppingBag size={18} /> Browse the Shop
              </Link>
            </div>
            <Link to="/shop" className="inline-flex items-center gap-2 mt-8 text-secondary font-semibold text-sm hover:underline">
              <Search size={15} /> Or search for your perfect piece
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}