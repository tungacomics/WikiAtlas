import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'Inter, sans-serif',
});

export const Mermaid: React.FC<{ chart: string }> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && chart) {
      ref.current.removeAttribute('data-processed');
      mermaid.contentLoaded();
      // We need to render it manually to be safe in React
      const id = `mermaid-${Math.random().toString(36).substring(7)}`;
      mermaid.render(id, chart).then(({ svg }) => {
        if (ref.current) {
          ref.current.innerHTML = svg;
        }
      }).catch(err => {
        console.error("Mermaid render error:", err);
        if (ref.current) {
          ref.current.innerHTML = `<div class="p-4 bg-red-50 text-red-500 text-xs font-mono">Mermaid Error: ${err.message}</div>`;
        }
      });
    }
  }, [chart]);

  return <div key={chart} ref={ref} className="mermaid flex justify-center my-8 overflow-x-auto" />;
};
