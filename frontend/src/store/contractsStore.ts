import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MOCK_CONTRACTS, MockContract } from '@/data/mockData';

export interface ExtendedMockContract extends MockContract {
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  revocationReason?: string;
  revokedBy?: string;
  revokedAt?: string;
}

interface ContractsStore {
  contracts: ExtendedMockContract[];
  setContracts: (contracts: ExtendedMockContract[]) => void;
  renewContract: (id: string) => void;
  approveContract: (id: string, reviewerName: string, notes?: string) => void;
  rejectContract: (id: string, reviewerName: string, notes?: string) => void;
  revokeContract: (id: string, revokerName: string, reason?: string) => void;
  updateContract: (id: string, updates: Partial<ExtendedMockContract>) => void;
  expiringCount: () => number;
}

export const useContractsStore = create<ContractsStore>()(
  persist(
    (set, get) => ({
      contracts: MOCK_CONTRACTS,
      setContracts: (contracts) => set({ contracts }),
      renewContract: (id) =>
        set((state) => ({
          contracts: state.contracts.map((c) =>
            c.id === id ? { ...c, status: 'under_renewal', isExpiring: false } : c
          ),
        })),
      approveContract: (id, reviewerName, notes) =>
        set((state) => ({
          contracts: state.contracts.map((c) =>
            c.id === id
              ? {
                  ...c,
                  status: 'active',
                  isExpiring: false,
                  reviewNotes: notes || 'Approved contract SLA compliance & vendor renewal',
                  reviewedBy: reviewerName,
                  reviewedAt: new Date().toISOString(),
                }
              : c
          ),
        })),
      rejectContract: (id, reviewerName, notes) =>
        set((state) => ({
          contracts: state.contracts.map((c) =>
            c.id === id
              ? {
                  ...c,
                  status: 'rejected',
                  isExpiring: false,
                  reviewNotes: notes || 'Rejected contract SLA renewal after executive review',
                  reviewedBy: reviewerName,
                  reviewedAt: new Date().toISOString(),
                }
              : c
          ),
        })),
      revokeContract: (id, revokerName, reason) =>
        set((state) => ({
          contracts: state.contracts.map((c) =>
            c.id === id
              ? {
                  ...c,
                  status: 'revoked' as any,
                  isExpiring: false,
                  revocationReason: reason || 'Contract SLA revoked & cancelled by executive manager authority',
                  revokedBy: revokerName,
                  revokedAt: new Date().toISOString(),
                }
              : c
          ),
        })),
      updateContract: (id, updates) =>
        set((state) => ({
          contracts: state.contracts.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),
      expiringCount: () => {
        const { contracts } = get();
        return contracts.filter(
          (c) => c.status === 'expiring_soon' || (c.isExpiring && c.status !== 'under_renewal' && c.status !== 'active')
        ).length;
      },
    }),
    { name: 'kmrl-full-contracts-v5' }
  )
);
