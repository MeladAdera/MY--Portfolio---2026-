'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/cn';

type ContactEnvelopeProps = {
  /** What the picture shows, for screen readers. */
  caption: string;
  /** Written on the envelope. */
  address: string;
  className?: string;
};

/**
 * The sealed letter: a CSS 3D envelope (styles/envelope.css) that plays once when it
 * scrolls into view. The letter slides in, the flap folds down and a seal is pressed on.
 * Under reduced motion it shows the sealed envelope straight away.
 */
export function ContactEnvelope({ caption, address, className }: ContactEnvelopeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [sealed, setSealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver !== 'function') return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      role="img"
      aria-label={caption}
      data-sealed={sealed}
      className={cn('envelope-scene', sealed && 'envelope-sealed', className)}
    >
      <div className="envelope-stage">
        <div className="envelope-body">
          <div className="envelope-shadow" />
          <div className="envelope-back" />
          <div className="envelope-letter">
            <i className="envelope-line" style={{ top: '18%', width: '46%' }} />
            <i className="envelope-line" style={{ top: '30%', width: '62%' }} />
            <i className="envelope-line" style={{ top: '42%', width: '38%' }} />
          </div>
          <div className="envelope-pocket" />
          <span className="envelope-address">{address}</span>
          <div className="envelope-flap" />
          <div className="envelope-seal" />
        </div>
      </div>
    </div>
  );
}
