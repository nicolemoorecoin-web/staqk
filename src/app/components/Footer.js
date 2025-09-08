'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-[#0b0f17] text-gray-300 border-t border-white/5 pt-10 pb-[calc(16px+env(safe-area-inset-bottom))]">
      {/* Top */}
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
        {/* Brand + selectors */}
        <div className="col-span-2 lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <Image
              src="/images/logo.svg"
              alt="STAQK"
              width={32}
              height={32}
              className="opacity-90"
            />
            <span className="text-white font-extrabold tracking-wide text-lg">
              STAQK
            </span>
          </div>

          <p className="text-sm text-gray-400 max-w-sm">
            Trade smarter. Track everything. A modern crypto & markets
            experience built for speed and clarity.
          </p>

          <div className="flex gap-3 mt-4">
            <Select label="Language" options={['English','French','Spanish']} />
            <Select label="Currency" options={['USD','EUR','GBP']} />
          </div>

          <div className="flex gap-3 mt-5">
            <StoreBadge href="#" img="/images/appstore.png" alt="App Store" />
            <StoreBadge href="#" img="/images/playstore.png" alt="Google Play" />
          </div>
        </div>

        {/* Columns */}
        <FooterCol title="Products" links={[
          {href:'/market', label:'Market Watchlist'},
          {href:'/account', label:'Portfolio / Accounts'},
          {href:'/tools/converter', label:'Converter'},
          {href:'/rewards/airdrop', label:'Airdrop'},
          {href:'/api', label:'API & Integrations'},
          {href:'/academy', label:'Trading Academy'},
        ]} />

        <FooterCol title="Company" links={[
          {href:'/about', label:'About STAQK'},
          {href:'/careers', label:'Careers', badge:'Hiring'},
          {href:'/legal/privacy', label:'Privacy Policy'},
          {href:'/legal/terms', label:'Terms of Service'},
          {href:'/legal', label:'Legal & Compliance'},
        ]} />

        <FooterCol title="Support" links={[
          {href:'/support/help-center', label:'Help Center'},
          {href:'/support/faq', label:'FAQ'},
          {href:'/support/contact', label:'Contact Support'},
          {href:'/status', label:'System Status'},
          {href:'/security', label:'Security'},
        ]} />

        <FooterCol title="Community" links={[
          {href:'https://twitter.com', label:'X (Twitter)', external:true},
          {href:'https://t.me', label:'Telegram', external:true},
          {href:'https://instagram.com', label:'Instagram', external:true},
          {href:'https://reddit.com', label:'Reddit', external:true},
          {href:'https://linkedin.com', label:'LinkedIn', external:true},
        ]} />
      </div>

      {/* Bottom */}
      <div className="max-w-6xl mx-auto px-4 border-t border-white/5 mt-10 pt-5 pb-3 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 text-sm">
        <div className="text-gray-500">
          © {new Date().getFullYear()} STAQK. All rights reserved.
        </div>
        <div className="flex gap-4 text-gray-400">
          <Link className="hover:text-white" href="/legal/privacy">Privacy</Link>
          <Link className="hover:text-white" href="/legal/terms">Terms</Link>
          <Link className="hover:text-white" href="/brand" >Brand</Link>
          <Link className="hover:text-white" href="/sitemap">Sitemap</Link>
        </div>
      </div>
    </footer>
  );
}

/* — helpers — */

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="text-white font-bold mb-3">{title}</h4>
      <ul className="space-y-2">
        {links.map(({href,label,badge,external}) =>
          external ? (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white inline-flex items-center gap-2"
              >
                {label}
                {badge && <Badge>{badge}</Badge>}
              </a>
            </li>
          ) : (
            <li key={label}>
              <Link href={href} className="hover:text-white inline-flex items-center gap-2">
                {label}
                {badge && <Badge>{badge}</Badge>}
              </Link>
            </li>
          )
        )}
      </ul>
    </div>
  );
}

function Badge({ children }) {
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-600/20 text-blue-300 border border-blue-500/30">
      {children}
    </span>
  );
}

function Select({ label, options }) {
  return (
    <label className="text-xs text-gray-400 flex items-center gap-2 bg-[#121725] border border-white/10 rounded-lg px-2 py-1">
      <span>{label}</span>
      <select className="bg-transparent outline-none text-gray-200 text-xs">
        {options.map(o => <option key={o} value={o} className="bg-[#0b0f17]">{o}</option>)}
      </select>
    </label>
  );
}

function StoreBadge({ href, img, alt }) {
  return (
    <a href={href} className="block opacity-90 hover:opacity-100 transition">
      <Image src={img} alt={alt} width={128} height={38} />
    </a>
  );
}
