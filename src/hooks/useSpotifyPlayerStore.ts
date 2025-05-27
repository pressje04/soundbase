// hooks/useSpotifyPlayerStore.ts
import { create } from 'zustand';

type SpotifyPlayerState = {
  deviceId: string | null;
  setDeviceId: (id: string) => void;
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
};

export const useSpotifyPlayerStore = create<SpotifyPlayerState>((set) => ({
  deviceId: null,
  isConnected: false,
  setDeviceId: (id) => set({ deviceId: id }),
  setIsConnected: (connected) => set({ isConnected: connected }),
}));
