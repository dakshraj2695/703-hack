// lib/types.ts
// Shared TS types for intents & matches.

export type Intent = {
  id: string; // from DB or on-chain id
  walletAddress: string;
  description: string;
  category: string;
  budget?: string | null;
  cid: string; // IPFS CID
  createdAt: string; // ISO timestamp
};

export type Match = {
  id: string;
  intentA: Intent;
  intentB: Intent;
  score?: number; // optional similarity score
};
