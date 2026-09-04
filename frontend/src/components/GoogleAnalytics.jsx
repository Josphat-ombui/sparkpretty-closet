import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_ID = import.meta.env.VITE_GA_ID;

export default function GoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    if (!GA_ID) return;
    if (typeof window.gtag !== 'function') return;
    window.gtag('config', GA_ID, { page_path: location.pathname + location.search });
  }, [location]);

  if (!GA_ID) return null;

  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${GA_ID}');`,
        }}
      />
    </>
  );
}
