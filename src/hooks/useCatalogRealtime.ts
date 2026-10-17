import { useEffect, useRef } from 'react';
import { subscribeToCatalog, CatalogChangeEvent } from '../services/realtime';

/**
 * Custom React Hook that triggers a reload whenever products or categories are updated in Supabase Realtime
 * @param onReload Callback invoked when any catalog change occurs
 * @param deps Optional dependency array
 */
export function useCatalogRealtime(
  onReload: (event?: CatalogChangeEvent) => void | Promise<void>,
  deps: any[] = []
) {
  const onReloadRef = useRef(onReload);

  useEffect(() => {
    onReloadRef.current = onReload;
  }, [onReload]);

  useEffect(() => {
    const unsubscribe = subscribeToCatalog((event) => {
      onReloadRef.current(event);
    });

    return () => {
      unsubscribe();
    };
  }, deps);
}
