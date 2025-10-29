"use client";

import { useEvmAddress, useIsSignedIn } from "@coinbase/cdp-hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPublicClient, http, formatEther } from "viem";
import { baseSepolia } from "viem/chains";

import EOATransaction from "./EOATransaction";
import Header from "./Header";
import PaymentLinkTest from "./PaymentLinkTest";
import UserBalance from "./UserBalance";

/**
 * Create a viem client to access user's balance on the Base Sepolia network
 */
const client = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

/**
 * The Signed In screen
 */
export default function SignedInScreen() {
  const { isSignedIn } = useIsSignedIn();
  const { evmAddress } = useEvmAddress();
  const [balance, setBalance] = useState<bigint | undefined>(undefined);

  const formattedBalance = useMemo(() => {
    if (balance === undefined) return undefined;
    return formatEther(balance);
  }, [balance]);

  const getBalance = useCallback(async () => {
    if (!evmAddress) return;
    const weiBalance = await client.getBalance({
      address: evmAddress,
    });
    setBalance(weiBalance);
  }, [evmAddress]);

  useEffect(() => {
    getBalance();
    const interval = setInterval(getBalance, 500);
    return () => clearInterval(interval);
  }, [getBalance]);

  return (
    <>
      <Header />
      <main className="main flex-col-container flex-grow">
        <div className="main-inner flex-col-container">
          <div className="card card--user-balance">
            <UserBalance
              balance={formattedBalance}
              faucetName="Base Sepolia Faucet"
              faucetUrl="https://portal.cdp.coinbase.com/products/faucet"
            />
          </div>
          <div className="card card--transaction">
            {isSignedIn && evmAddress && (
              <EOATransaction balance={formattedBalance} onSuccess={getBalance} />
            )}
          </div>
          <div className="card">
            <PaymentLinkTest />
          </div>
        </div>
      </main>
    </>
  );
}
