// app/_components/IntentForm.tsx
"use client";

import { FormEvent, useState } from "react";
import axios from "axios";
import { Contract } from "ethers";
import { BACKEND_API_BASE_URL, WEB3_STORAGE_TOKEN } from "@/lib/config";
import { useWallet } from "@/hooks/useWallet";
import type { Intent } from "@/lib/types";

type Props = {
  onCreated?: (intent: Intent) => void; // parent can refresh list
};

export function IntentForm({ onCreated }: Props) {
  const { account, contract } = useWallet();

  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [budget, setBudget] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Upload metadata JSON to IPFS (via web3.storage or your own backend)
  const uploadToIPFS = async (metadata: object): Promise<string> => {
    // 🔴 OPTION 1: Directly from frontend via web3.storage
    // If you don't want frontend to hold the token,
    // create a backend endpoint and call that instead.

    if (!WEB3_STORAGE_TOKEN) {
      console.warn("No WEB3_STORAGE_TOKEN set – skipping IPFS upload.");
      return "";
    }

    const res = await fetch("https://api.web3.storage/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WEB3_STORAGE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metadata),
    });

    if (!res.ok) {
      throw new Error("Failed to upload to IPFS");
    }

    const data = await res.json();
    // web3.storage returns a CID, usually in `cid` field
    return data.cid as string;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!account || !contract) {
      alert("Connect your wallet first.");
      return;
    }
    if (!description || !category) {
      alert("Description and category are required.");
      return;
    }

    try {
      setIsSubmitting(true);

      // 1️⃣ Build metadata JSON
      const metadata = {
        description,
        category,
        budget,
        createdAt: new Date().toISOString(),
        walletAddress: account,
      };

      // 2️⃣ Upload to IPFS – get CID
      const cid = await uploadToIPFS(metadata);

      // 3️⃣ Call smart contract publishIntent(message, category, cid)
      const tx = await (contract as Contract).publishIntent(
        description,
        category,
        cid
      );
      await tx.wait(); // wait for tx to be mined

      // 4️⃣ Optional: hit backend to refresh/confirm
      //    This assumes backend has /intents endpoint.
      if (BACKEND_API_BASE_URL && onCreated) {
        const res = await axios.get(`${BACKEND_API_BASE_URL}/intents`);
        // 🔴 If backend returns a list, you might want to:
        onCreated(res.data[res.data.length - 1]); // crude example
      }

      // Reset form
      setDescription("");
      setCategory("");
      setBudget("");
    } catch (err) {
      console.error("Error creating intent:", err);
      alert("Failed to publish intent. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 rounded-xl border bg-white/5"
    >
      <h2 className="text-lg font-semibold">Publish a new intent</h2>

      <div className="space-y-1">
        <label className="block text-sm font-medium">Description</label>
        <textarea
          className="w-full rounded-md border bg-black/20 p-2 text-sm"
          placeholder='e.g. "I want a website built for under ₹3000."'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">Category</label>
        <input
          className="w-full rounded-md border bg-black/20 p-2 text-sm"
          placeholder="design / dev / lending / data / ..."
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">
          Budget (optional, in ₹)
        </label>
        <input
          className="w-full rounded-md border bg-black/20 p-2 text-sm"
          placeholder="3000"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
      >
        {isSubmitting ? "Publishing..." : "Publish Intent"}
      </button>
    </form>
  );
}
