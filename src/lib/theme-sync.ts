/**
 * Theme synchronization utilities using BroadcastChannel API
 * Allows real-time theme updates between admin panel and public menu pages
 */

export interface ThemeConfig {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  font: 'Sans Serif' | 'Serif' | 'Monospace';
}

export interface ThemeSyncMessage {
  type: 'THEME_UPDATE';
  slug: string;
  themeConfig: ThemeConfig;
}

const CHANNEL_NAME = 'scanmenu-theme-sync';

let broadcastChannel: BroadcastChannel | null = null;

/**
 * Get or create the broadcast channel
 */
function getChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null;
  
  if (!broadcastChannel) {
    try {
      broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
    } catch (e) {
      console.warn('BroadcastChannel not supported:', e);
      return null;
    }
  }
  return broadcastChannel;
}

/**
 * Broadcast theme changes to all listening tabs/windows
 */
export function broadcastThemeUpdate(slug: string, themeConfig: ThemeConfig): void {
  const channel = getChannel();
  if (!channel) return;

  const message: ThemeSyncMessage = {
    type: 'THEME_UPDATE',
    slug,
    themeConfig,
  };

  channel.postMessage(message);
}

/**
 * Subscribe to theme updates for a specific slug
 * Returns cleanup function
 */
export function subscribeToThemeUpdates(
  slug: string,
  onUpdate: (themeConfig: ThemeConfig) => void
): () => void {
  const channel = getChannel();
  if (!channel) return () => {};

  const handler = (event: MessageEvent<ThemeSyncMessage>) => {
    if (event.data?.type === 'THEME_UPDATE' && event.data.slug === slug) {
      onUpdate(event.data.themeConfig);
    }
  };

  channel.addEventListener('message', handler);

  return () => {
    channel.removeEventListener('message', handler);
  };
}

/**
 * Close the broadcast channel (cleanup)
 */
export function closeThemeSync(): void {
  if (broadcastChannel) {
    broadcastChannel.close();
    broadcastChannel = null;
  }
}
