"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function PrintQRPage() {
  return (
    <Suspense fallback={null}>
      <PrintQRContent />
    </Suspense>
  );
}

function PrintQRContent() {
  const searchParams = useSearchParams();
  const storageKey = searchParams.get("key");
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!storageKey) return;
    const data = localStorage.getItem(storageKey);
    if (data) {
      setSrc(data);
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!src) return;

    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        window.print();
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [src]);

  return (
    <>
      <style>{`
        @page { size: 20mm 20mm; margin: 0; }
        html, body { margin: 0; padding: 0; }
        body {
          width: 20mm;
          height: 20mm;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        img { width: 20mm; height: 20mm; }
      `}</style>
      {src && <img src={src} alt="QR to print" />}
    </>
  );
}
