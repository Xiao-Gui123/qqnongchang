import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LandType, UserSettings } from '../types';
import { STORAGE_KEYS } from '../utils/constants';

interface AppState {
  settings: UserSettings;
  setLandType: (type: LandType) => void;
  setUseFertilizer: (use: boolean) => void;
  toggleFavorite: (cropId: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      settings: {
        landType: 'normal',
        useFertilizer: false,
        favoriteCrops: [],
      },
      setLandType: (landType) =>
        set((state) => ({
          settings: { ...state.settings, landType },
        })),
      setUseFertilizer: (useFertilizer) =>
        set((state) => ({
          settings: { ...state.settings, useFertilizer },
        })),
      toggleFavorite: (cropId) =>
        set((state) => {
          const { favoriteCrops } = state.settings;
          const isFavorite = favoriteCrops.includes(cropId);
          const newFavorites = isFavorite
            ? favoriteCrops.filter((id) => id !== cropId)
            : [...favoriteCrops, cropId];
          return {
            settings: { ...state.settings, favoriteCrops: newFavorites },
          };
        }),
    }),
    {
      name: STORAGE_KEYS.SETTINGS,
    }
  )
);
