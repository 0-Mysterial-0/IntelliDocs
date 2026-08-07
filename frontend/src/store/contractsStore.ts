import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Contract {
  id: string;
  daysRemaining: number;
  status: 'active' | 'expiring_soon' | 'expired' | 'under_renewal';
}

interface ContractsStore {
  contracts: Contract[];
  setContracts: (contracts: Contract[]) => void;
  updateContract: (id: string, updates: Partial<Contract>) => void;
  expiringCount: () => number;
}

const INITIAL_CONTRACTS: Contract[] = [
  { id: 'cnt-01', daysRemaining: 23,  status: 'expiring_soon' },
  { id: 'cnt-02', daysRemaining: 39,  status: 'expiring_soon' },
  { id: 'cnt-03', daysRemaining: 146, status: 'active' },
  { id: 'cnt-04', daysRemaining: 236, status: 'active' },
  { id: 'cnt-05', daysRemaining: 3,   status: 'expiring_soon' },
  { id: 'cnt-06', daysRemaining: 205, status: 'active' },
];

export const useContractsStore = create<ContractsStore>()(
  persist(
    (set, get) => ({
      contracts: INITIAL_CONTRACTS,
      setContracts: (contracts) => set({ contracts }),
      updateContract: (id, updates) =>
        set((state) => ({
          contracts: state.contracts.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),
      expiringCount: () => {
        const { contracts } = get();
        // Only count those still in expiring_soon (not yet under renewal)
        return contracts.filter(
          (c) => c.daysRemaining <= 60 && c.status !== 'under_renewal'
        ).length;
      },
    }),
    { name: 'kmrl-contracts-v1' }
  )
);
