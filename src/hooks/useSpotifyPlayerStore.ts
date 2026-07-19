// hooks/useSpotifyPlayerStore.ts
import { create } from 'zustand';

type SpotifyPlayerState = {
  deviceId: string | null;
  setDeviceId: (id: string | null) => void;
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
  activatePlayer: (() => Promise<void>) | null;
  setActivatePlayer: (activate: (() => Promise<void>) | null) => void;
};

export const useSpotifyPlayerStore = create<SpotifyPlayerState>((set) => ({
  deviceId: null,
  isConnected: false,
  setDeviceId: (id) => set({ deviceId: id }),
  setIsConnected: (connected) => set({ isConnected: connected }),
  activatePlayer: null,
  setActivatePlayer: (activate) => set({ activatePlayer: activate }),
}));
