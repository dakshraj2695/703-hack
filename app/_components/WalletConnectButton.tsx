// app/_components/WalletConnectButton.tsx
"use client";

import { useWallet } from "@/hooks/useWallet";

export function WalletConnectButton() {
  const { account, connect, isConnecting } = useWallet();

  if (account) {
    return (
      <button
        className="px-4 py-2 rounded-lg border text-sm bg-white/5"
        // You can show a small menu later here
      >
        Connected: {account.slice(0, 6)}...{account.slice(-4)}
      </button>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={isConnecting}
      className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-500 disabled:opacity-60"
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
