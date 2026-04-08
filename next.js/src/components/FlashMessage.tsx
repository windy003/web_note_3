'use client';

import { useEffect, useState } from 'react';

export default function FlashMessage({ message, type = 'info' }: { message: string; type?: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible || !message) return null;

  return (
    <div className={`alert alert-${type} alert-dismissible fade show`}>
      {message}
      <button type="button" className="btn-close" onClick={() => setVisible(false)} aria-label="Close" />
    </div>
  );
}
