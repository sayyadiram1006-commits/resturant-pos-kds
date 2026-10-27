import { useEffect, useState } from 'react';
import { initDB } from '@/lib/db';

export function useDB() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    initDB().then(() => setReady(true)).catch(console.error);
  }, []);
  return ready;
}
