import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export type CatalogChangeAction = 'create' | 'update' | 'delete' | 'any';

export interface CatalogChangeEvent {
  type: 'product' | 'category' | 'banner' | 'customer' | 'catalog';
  action: CatalogChangeAction;
  data?: any;
}

type Listener = (event: CatalogChangeEvent) => void;

let channel: RealtimeChannel | null = null;
const listeners: Set<Listener> = new Set();
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

// Cross-tab synchronization via Browser BroadcastChannel API
const BROADCAST_CHANNEL_NAME = 'salalakart_catalog_broadcast';
let crossTabChannel: BroadcastChannel | null = null;

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    crossTabChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    crossTabChannel.onmessage = (messageEvent) => {
      if (messageEvent?.data?.type) {
        dispatchLocal(messageEvent.data);
      }
    };
  } catch (err) {
    console.warn('BroadcastChannel initialization note:', err);
  }
}

// Fallback cross-tab synchronization via localStorage storage event
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (storageEvent) => {
    if (storageEvent.key === 'salalakart_catalog_sync_ping' && storageEvent.newValue) {
      try {
        const parsed = JSON.parse(storageEvent.newValue);
        if (parsed?.type) {
          dispatchLocal(parsed);
        }
      } catch {
        // ignore JSON parse errors
      }
    }
  });

  // Revalidate whenever user switches back to this tab
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      dispatchLocal({ type: 'catalog', action: 'any' });
    }
  });
}

/**
 * Dispatches an event to all local active listeners with debouncing
 */
function dispatchLocal(event: CatalogChangeEvent) {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in catalog realtime listener:', err);
      }
    });
  }, 80);
}

/**
 * Manually trigger catalog change notification
 * Immediately updates:
 * 1. Current window in-memory listeners
 * 2. Other open tabs in the same browser (via BroadcastChannel & Storage event)
 * 3. Remote clients/sessions (via Supabase Realtime WebSocket broadcast)
 */
export function notifyCatalogChanged(event: CatalogChangeEvent) {
  // 1. Dispatch locally in this window
  dispatchLocal(event);

  // 2. Broadcast across tabs in the same browser
  if (crossTabChannel) {
    try {
      crossTabChannel.postMessage(event);
    } catch {
      // ignore
    }
  }

  // 3. Fallback cross-tab notification
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(
        'salalakart_catalog_sync_ping',
        JSON.stringify({ ...event, _t: Date.now() })
      );
    } catch {
      // ignore
    }
  }

  // 4. Broadcast across different browser sessions/devices via Supabase Realtime channel
  if (channel) {
    try {
      channel.send({
        type: 'broadcast',
        event: 'catalog_change',
        payload: event,
      });
    } catch (err) {
      // Non-fatal if channel is connecting
    }
  }
}

/**
 * Subscribes a component or callback to real-time changes in products, categories, or banners
 * Automatically manages Supabase Realtime channel lifecycle
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
 * Initializes the Supabase Realtime WebSocket subscription for products, categories, banners, etc.
 */
function initRealtimeChannel() {
  if (!isSupabaseConfigured) return;

  try {
    channel = supabase
      .channel('salalakart_catalog_sync')
      // 1. Listen for Supabase Realtime Broadcasts from other sessions/tabs
      .on('broadcast', { event: 'catalog_change' }, (payload) => {
        if (payload?.payload?.type) {
          dispatchLocal(payload.payload);
        }
      })
      // 2. Listen for Database CDC postgres_changes on products
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          dispatchLocal({
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
      // 3. Listen for Database CDC postgres_changes on categories
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        (payload) => {
          dispatchLocal({
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
      // 4. Listen for Database CDC postgres_changes on banners
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'banners' },
        (payload) => {
          dispatchLocal({
            type: 'banner',
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
      // 5. Listen for Database CDC on product_images
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'product_images' },
        () => {
          dispatchLocal({ type: 'product', action: 'update' });
        }
      )
      // 6. Listen for Database CDC on product_variants
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'product_variants' },
        () => {
          dispatchLocal({ type: 'product', action: 'update' });
        }
      )
      // 7. Listen for Database CDC on profiles (customer registrations & updates)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          dispatchLocal({
            type: 'customer',
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
      .subscribe((status, err) => {
        if (err) {
          console.warn('Supabase Realtime subscription status/error:', status, err);
        }
      });
  } catch (err) {
    console.warn('Failed to initialize Supabase Realtime channel:', err);
  }
}
