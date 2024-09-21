import * as React from "react";
import { useConnect, useAccount, useDisconnect } from "wagmi";
import { metaMask } from "wagmi/connectors";

export function Wallet() {
	const { connect } = useConnect();
  return (
    <button
      onClick={() => connect({ connector: metaMask() })}
      className="bg-slate-300 px-4 py-2 rounded-lg"
    >
      Connect MetaMask
    </button>
  );
}

export function Account() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <div>
      {address && (
        <div className="font-semibold">
          { address.slice(0, 12)}
        </div>
      )}
      <div className="flex mt-1">
        <button
          onClick={() => disconnect()}
          className="text-sm bg-slate-200 px-2 py-1 rounded-lg ml-auto"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}

export function ConnectWalletButton() {
  const { isConnected } = useAccount();
  if (isConnected) return <Account />;
  return <Wallet />;
}
