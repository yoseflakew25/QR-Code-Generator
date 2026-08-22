'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const sizeOptions = [100, 200, 300, 400, 500, 600, 700];

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [size, setSize] = useState('300');
  const [showSpinner, setShowSpinner] = useState(false);
  const [qrValue, setQrValue] = useState('');
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!qrValue || !qrRef.current) return;

    let cancelled = false;

    const render = async () => {
      const { default: QrCreator } = await import('qr-creator');
      if (cancelled || !qrRef.current) return;
      qrRef.current.innerHTML = '';
      QrCreator.render(
        {
          text: qrValue,
          size: Number(size),
          ecLevel: 'M',
          fill: '#000000',
          background: '#ffffff',
          radius: 0.0,
        },
        qrRef.current
      );
    };

    render();
    return () => { cancelled = true; };
  }, [qrValue, size]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!url.trim()) {
      alert('Please enter a URL');
      return;
    }

    setQrValue('');
    setShowSpinner(true);

    setTimeout(() => {
      setShowSpinner(false);
      setQrValue(url);
    }, 1000);
  };

  const handleDownload = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleCopy = async () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;

    try {
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), 'image/png')
      );
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
    } catch {
      alert('Failed to copy. Try downloading instead.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b-2 border-slate-900">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-2 border-red-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight uppercase">QR Generator</span>
          </div>
          <a
            href="/qr-code-extension.zip"
            download
            className="border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white text-xs font-mono font-bold uppercase tracking-widest px-4 py-2 transition-colors"
          >
            Get Extension
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-14 pb-10">
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 border border-red-500 text-red-500 text-xs font-mono uppercase tracking-widest px-3 py-1 mb-6">
            Free &middot; No Sign-up &middot; Private
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight tracking-tight mb-4">
            QR Code Generator
          </h1>
          <p className="text-slate-500 text-base leading-relaxed">
            Enter a URL below to generate a QR code. Download the image or copy it straight to your clipboard.
          </p>
        </div>

        {/* Main Card */}
        <div className="max-w-4xl mx-auto border-2 border-slate-900">
          <div className="grid md:grid-cols-5">
            {/* Form Side */}
            <div className="md:col-span-3 p-8 md:p-10 border-b-2 md:border-b-0 md:border-r-2 border-slate-900">
              <form id="generate-form" onSubmit={handleSubmit}>
                <label className="block text-xs font-mono font-bold text-slate-900 uppercase tracking-widest mb-2">
                  Website URL
                </label>
                <input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  className="w-full border-2 border-slate-300 rounded-none px-4 py-3 text-slate-700 placeholder-slate-400 focus:outline-none focus:border-red-500 transition-colors mb-6 font-mono text-sm"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />

                <label className="block text-xs font-mono font-bold text-slate-900 uppercase tracking-widest mb-2">
                  QR Code Size
                </label>
                <select
                  className="w-full border-2 border-slate-300 rounded-none px-4 py-3 text-slate-700 focus:outline-none focus:border-red-500 transition-colors mb-8 font-mono text-sm"
                  name="size"
                  id="size"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                >
                  {sizeOptions.map((option) => (
                    <option key={option} value={String(option)}>
                      {option} × {option} px
                    </option>
                  ))}
                </select>

                <button
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 px-6 uppercase tracking-wider text-sm transition-colors cursor-pointer active:scale-[0.98]"
                  type="submit"
                >
                  Generate QR Code
                </button>
              </form>
            </div>

            {/* QR Preview Side */}
            <div className="md:col-span-2 p-8 flex flex-col items-center justify-center min-h-[280px] bg-slate-50">
              {showSpinner && (
                <div role="status" className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-slate-300 border-t-red-500 rounded-full animate-spin" />
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Generating</span>
                </div>
              )}

              {!showSpinner && qrValue && (
                <div className="flex flex-col items-center gap-5 animate-fadeIn">
                  <div
                    ref={qrRef}
                    className="border-2 border-slate-900 p-2 bg-white"
                  />
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={handleDownload}
                      className="flex-1 border-2 border-red-500 bg-red-500 hover:bg-red-600 text-white text-xs font-mono font-bold uppercase tracking-widest py-2.5 px-3 transition-colors cursor-pointer active:scale-[0.97]"
                    >
                      ↓ Save
                    </button>
                    <button
                      onClick={handleCopy}
                      className="flex-1 border-2 border-slate-900 bg-white hover:bg-slate-900 hover:text-white text-slate-900 text-xs font-mono font-bold uppercase tracking-widest py-2.5 px-3 transition-colors cursor-pointer active:scale-[0.97]"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              {!showSpinner && !qrValue && (
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-20 h-20 border-2 border-dashed border-slate-300 flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                    Awaiting input
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-0 border-2 border-slate-900">
          {[
            {
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              ),
              title: 'Lightning Fast',
              desc: 'Generated instantly in your browser. No server needed.',
            },
            {
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              ),
              title: '100% Private',
              desc: 'Everything runs locally. No data leaves your device.',
            },
            {
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              ),
              title: 'Save or Copy',
              desc: 'Download as PNG or copy directly to your clipboard.',
            },
          ].map((feature, i) => (
            <div
              key={feature.title}
              className={`p-6 ${i < 2 ? 'border-b-2 md:border-b-0 md:border-r-2 border-slate-900' : ''}`}
            >
              <div className="w-9 h-9 border-2 border-red-500 text-red-500 flex items-center justify-center mb-3">
                {feature.icon}
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1.5">{feature.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-mono">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Chrome Extension Install */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="border-2 border-slate-900 p-8 md:p-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 border border-red-500 text-red-500 text-xs font-mono uppercase tracking-widest px-3 py-1 mb-4">
                Chrome Extension
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                Get it as a Browser Extension
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                Right-click any link to instantly generate a QR code. Auto-fills the current tab URL. No store needed.
              </p>
              <a
                href="/qr-code-extension.zip"
                download
                className="inline-block border-2 border-slate-900 bg-slate-900 text-white font-mono font-bold text-xs uppercase tracking-widest py-3 px-6 hover:bg-white hover:text-slate-900 transition-colors"
              >
                ↓ Download Extension
              </a>
            </div>

            <div className="border-2 border-slate-200 p-6">
              <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-widest mb-4">
                Installation Steps
              </h3>
              <ol className="space-y-3">
                {[
                  { step: '01', text: 'Download the .zip file above' },
                  { step: '02', text: 'Extract the folder anywhere on your computer' },
                  { step: '03', text: 'Open chrome://extensions in your browser' },
                  { step: '04', text: 'Enable "Developer mode" (top right toggle)' },
                  { step: '05', text: 'Click "Load unpacked" and select the extracted folder' },
                ].map((item) => (
                  <li key={item.step} className="flex items-start gap-3">
                    <span className="text-xs font-mono font-bold text-red-500 mt-0.5 shrink-0">
                      {item.step}
                    </span>
                    <span className="text-xs text-slate-600 font-mono leading-relaxed">
                      {item.text}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-slate-900">
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-widest">
            <div className="w-4 h-4 border border-red-500 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-red-500" />
            </div>
            QR Generator
          </div>
          <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">
            Free &middot; No tracking &middot; No ads
          </p>
        </div>
      </footer>
    </div>
  );
}
