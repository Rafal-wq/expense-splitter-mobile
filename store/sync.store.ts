import { create } from 'zustand';

interface SyncState {
    syncVersion: number;
    bumpSyncVersion: () => void;
}

export const useSyncStore = create<SyncState>((set) => ({
    syncVersion: 0,
    bumpSyncVersion: () => set((s) => ({ syncVersion: s.syncVersion + 1 })),
}));
