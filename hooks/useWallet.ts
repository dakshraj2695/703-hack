// hooks/useWallet.ts
"use client";

import { useEffect, useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import { INTENT_REGISTRY_ABI, INTENT_REGISTRY_ADDRESS } from "@/lib/config";

export function useWallet() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Connect to MetaMask when user clicks button
  const connect = async () => {
    if (typeof window === "undefined") return;
    const { ethereum } = window as any;

    if (!ethereum) {
      alert("MetaMask not detected. Please install MetaMask.");
      return;
    }

    try {
      setIsConnecting(true);
      const provider = new BrowserProvider(ethereum);
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      const signer = await provider.getSigner();
      const contract = new Contract(
        INTENT_REGISTRY_ADDRESS,
        INTENT_REGISTRY_ABI,
        signer
      );

      setProvider(provider);
      setContract(contract);
      setAccount(accounts[0]);
    } catch (err) {
      console.error("Error connecting wallet:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  // Optional: auto-set account if already connected
  useEffect(() => {
    if (typeof window === "undefined") return;
    const { ethereum } = window as any;
    if (!ethereum) return;

    ethereum.request({ method: "eth_accounts" }).then((accounts: string[]) => {
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        const provider = new BrowserProvider(ethereum);
        provider.getSigner().then((signer) => {
          const contract = new Contract(
            INTENT_REGISTRY_ADDRESS,
            INTENT_REGISTRY_ABI,
            signer
          );
          setProvider(provider);
          setContract(contract);
        });
      }
    });
  }, []);

  return { account, provider, contract, connect, isConnecting };
}
