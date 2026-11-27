'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export const COOKIE_CONSENT_KEY = 'docduit_cookies_accepted';

const NOTICE = {
  id: {
    text: 'Kami menggunakan cookie analitik (Google Analytics) untuk memahami cara pengguna berinteraksi dengan situs ini. Data tidak dijual ke pihak ketiga.',
    policyLabel: 'Kebijakan Privasi',
    policyHref: '/id/privacy-policy',
    decline: 'Tolak',
    accept: 'Terima',
  },
  en: {
    text: 'We use analytics cookies (Google Analytics) to understand how users interact with this site. Data is never sold to third parties.',
    policyLabel: 'Privacy Policy',
    policyHref: '/en/privacy-policy',
    decline: 'Decline',
    accept: 'Accept',
  },
} as const;

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  // The notice is rendered from the root layout, which has no `[lang]` param,
  // so the page's language comes from the first URL segment.
  const pathname = usePathname();
  const isEnglish = pathname?.split('/')[1] === 'en';
  const notice = isEnglish ? NOTICE.en : NOTICE.id;

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) setVisible(true);
  }, []);

  if (!visible) return null;

  const accept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'yes');
    setVisible(false);
    window.dispatchEvent(new Event('cookie-consent-accepted'));
  };

  const decline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'no');
    setVisible(false);
  };

  return (
    <div className='fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-4 py-4 shadow-lg sm:px-6'>
      <div className='mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-sm text-gray-600'>
          {notice.text}{' '}
          <a
            href={notice.policyHref}
            className='font-medium text-slate-800 underline hover:text-slate-600'
          >
            {notice.policyLabel}
          </a>
        </p>
        <div className='flex shrink-0 flex-col gap-1.5 sm:flex-row'>
          <button
            onClick={decline}
            className='rounded-md border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50'
          >
            {notice.decline}
          </button>
          <button
            onClick={accept}
            className='rounded-md bg-slate-800 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-700'
          >
            {notice.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
