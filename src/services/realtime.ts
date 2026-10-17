import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export type CatalogChangeAction = 'create' | 'update' | 'delete' | 'any';

export interface CatalogChangeEvent {
  type: 'product' | 'category' | 'catalog';
  action: CatalogChangeAction;
  data?: any;
}

type Listener = (event: CatalogChangeEvent) => void;

let channel: RealtimeChannel | null = null;
const listeners: Set<Listener> = new Set();
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Broadcasts an event to all active catalog listeners with lightweight debouncing
 */
function broadcast(event: CatalogChangeEvent) {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in catalog realtime listener:', err);
      }
    });
  }, 120);
}

/**
 * Manually trigger local catalog change notification (used immediately after admin CRUD)
 */
export function notifyCatalogChanged(event: CatalogChangeEvent) {
  broadcast(event);
}

/**
 * Subscribes a component or callback to real-time changes in products or categories
 * Automatically initializes and tears down the Supabase Realtime channel
 */
export function subscribeToCatalog(listener: Listener): () => void {
  listeners.add(listener);

  if (isSupabaseConfigured && !channel) {
    initRealtimeChannel();
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && channel) {
      try {
        supabase.removeChannel(channel);
      } catch (err) {
        console.warn('Error removing Supabase realtime channel:', err);
      }
      channel = null;
    }
  };
}

/**
 * Initializes the single Supabase Realtime WebSocket subscription for products & categories
 */
function initRealtimeChannel() {
  if (!isSupabaseConfigured) return;

  try {
    channel = supabase
      .channel('salalakart_catalog_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          broadcast({
            type: 'product',
            action:
              payload.eventType === 'INSERT'
                ? 'create'
                : payload.eventType === 'DELETE'
                ? 'delete'
                : 'update',
            data: payload.new || payload.old,
          });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        (payload) => {
          broadcast({
            type: 'category',
            action:
              payload.eventType === 'INSERT'
                ? 'create'
                : payload.eventType === 'DELETE'
                ? 'delete'
                : 'update',
            data: payload.new || payload.old,
          });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'product_images' },
        () => {
          broadcast({ type: 'product', action: 'update' });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'product_variants' },
        () => {
          broadcast({ type: 'product', action: 'update' });
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.warn('Supabase Realtime subscription status/error:', status, err);
        }
      });
  } catch (err) {
    console.warn('Failed to initialize Supabase Realtime channel:', err);
  }
}
