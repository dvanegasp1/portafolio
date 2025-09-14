import React from 'react';

export default function SimplePage({ title, subtitle, children }) {
  return (
    <section className="py-20 relative overflow-hidden scroll-mt-40">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl lg:text-6xl font-bold mb-4">{title}</h1>
        {subtitle ? (
          <p className="text-xl text-gray-300 mb-10 max-w-3xl">{subtitle}</p>
        ) : null}
        <div className="prose prose-invert max-w-none">
          {children}
        </div>
      </div>
    </section>
  );
}

