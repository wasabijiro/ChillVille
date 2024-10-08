"use client";

import { useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import TransgateConnect from "@zkpass/transgate-js-sdk";
import { ethers } from "ethers";

import { VerificationLevel, IDKitWidget, useIDKit } from "@worldcoin/idkit";
import type { ISuccessResult } from "@worldcoin/idkit";

import { verify } from "./actions/verify";
import { ConnectWalletButton } from "@/components/Wallet";
import { stats } from "@/config/stats/stats";
import { fetchMLInference } from "@/libs/ml";
import { generateZKMLProof, fetchZKMLProofDetails, verifyZKMLProof } from "@/libs/zkml"
import { delay } from "@/utils/delay";
import { ETHEREUM_SEPOLIA_ZKPASS_ADDRESS } from "@/config/contract";
import { ZKPASS_APP_ID, ZKPASS_SCHEMA_ID } from "@/config/zkpass";
import zkPassABI from "@/config/zkPassABI.json";
import { NounsGlasses } from "@/components/NounsGlasses";

export default function Home() {
  const votingUrl = process.env.NEXT_PUBLIC_VOTING_URL || '#';
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || '#';
  const app_id = process.env.NEXT_PUBLIC_WLD_APP_ID as `app_${string}`;
  const action = process.env.NEXT_PUBLIC_WLD_ACTION;

  const [isValid, setIsValid] = useState<boolean>(false);
  const [mlProof, setMLProof] = useState<string | null>(null);
  const [mlPublicInputs, setMLPublicInputs] = useState<string[] | null>(null);
  const [isProofGenerating, setIsProofGenerating] = useState(false);
  const [isMLProofVerified, setIsMLProofVerified] = useState(false);

  const [discordScore, setDiscordScore] = useState(0);
  const [discordOwnerVerified, setDiscordOwnerVerified] = useState(false);

  const [worldcoinScore, setWorldcoinScore] = useState(0);
  const [worldcoinVerified, setWorldcoinVerified] = useState(false);

  const { setOpen } = useIDKit();

  const zkPassStart = async () => {
    try {
      const connector = new TransgateConnect(ZKPASS_APP_ID);
      const isAvailable = await connector.isTransgateAvailable();
      if (!isAvailable) {
        return alert("Please install zkPass TransGate");
      }
      if (window.ethereum == null) {
        return alert("MetaMask not installed");
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const account = await signer.getAddress();

      console.log({ ZKPASS_SCHEMA_ID });
      console.log({ account});
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const zkPassRes: any = await connector.launch(ZKPASS_SCHEMA_ID, account);
      console.log({ zkPassRes });

      const taskId = ethers.hexlify(ethers.toUtf8Bytes(zkPassRes.taskId)); // to hex
      const schemaId = ethers.hexlify(ethers.toUtf8Bytes(ZKPASS_SCHEMA_ID)); // to hex

      const chainParams = {
        taskId,
        schemaId,
        uHash: zkPassRes.uHash,
        recipient: account,
        publicFieldsHash: zkPassRes.publicFieldsHash,
        validator: zkPassRes.validatorAddress,
        allocatorSignature: zkPassRes.allocatorSignature,
        validatorSignature: zkPassRes.validatorSignature,
      };
      console.log("chainParams", chainParams);

      const contract = new ethers.Contract(ETHEREUM_SEPOLIA_ZKPASS_ADDRESS, zkPassABI, provider);
      const data = contract.interface.encodeFunctionData("mintWithProof", [
        chainParams,
      ]);

      const transaction = {
        to: ETHEREUM_SEPOLIA_ZKPASS_ADDRESS,
        from: account,
        value: 0,
        data,
      };
      console.log("transaction", transaction);
      const tx = await signer?.sendTransaction(transaction);
      console.log("transaction hash====>", tx.hash);
      console.log(`https://sepolia.etherscan.io/tx/${tx.hash}`);
      await delay(5000);
      setDiscordOwnerVerified(true);
      setDiscordScore(discordScore + 50);
    } catch (err) {
      alert(JSON.stringify(err));
      console.log("error", err);
    }
  };

  const generateMLProof = async () => {
    console.log("Generating ML proof");
    setIsProofGenerating(true);

    try {
      const proofId = await generateZKMLProof(discordScore, worldcoinScore);

      if (proofId) {
        console.log("Proof generated:", proofId);
        await delay(5000);
        const { proof, publicInput } = await fetchZKMLProofDetails(proofId);

        if (proof) {
          setMLProof(proof);
        }

        if (publicInput) {
          setMLPublicInputs([publicInput]);
        }

      } else {
        console.error("Failed to generate proof.");
      }
    } catch (error) {
      console.error("Error generating ML proof:", error);
    } finally {
      setIsProofGenerating(false);
    }
  };

  const verifyMLProof = async () => {
		console.log("Verifying ML proof");
    const isVerified = await verifyZKMLProof(mlProof as string, mlPublicInputs as string[]);
    setIsMLProofVerified(isVerified);
	};

  const reloadMLInference = async () => {
    console.log("Reloading");
    const prediction = await fetchMLInference(discordScore, worldcoinScore, stats);
    if (prediction === 'Human') {
      setIsValid(true);
    } else if (prediction === 'Bot') {
      setIsValid(false);
    }
  };

  const onSuccess = (result: ISuccessResult) => {
    // This is where you should perform frontend actions once a user has been verified, such as redirecting to a new page
    window.alert(
      "Successfully verified with World ID! Your nullifier hash is: " +
        result.nullifier_hash
    );
  };

  const handleProof = async (result: ISuccessResult) => {
    console.log(
      "Proof received from IDKit, sending to backend:\n",
      JSON.stringify(result)
    ); // Log the proof from IDKit to the console for visibility
    const data = await verify(result);
    if (data.success) {
      setWorldcoinScore(1)
      setWorldcoinVerified(true);
      console.log("Successful response from backend:\n", JSON.stringify(data)); // Log the response from our backend for visibility
    } else {
      throw new Error(`Verification failed: ${data.detail}`);
    }
  };

  const displayResult = () => {
    return isValid ? "OK" : "Verify Your Activity";
  }

  return (
    <div className="min-h-screen bg-yellow-300 text-gray-800">
      <main className="py-8">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 flex items-center">
            <div className="flex-1 text-center">
              <NounsGlasses />
              <h1 className="text-4xl font-bold mb-2">
                Private Onchain Voting with Sybil Resistance
                <br />
                MACI meets zkTLS
              </h1>
              <p className="text-xl text-gray-600 mb-1">
                Verify your offchain activity & Vote without exposure
              </p>
            </div>
            <button
              className="bg-gray-800 py-1 px-3 rounded-lg text-white hover:bg-gray-900 transition-colors ml-auto"
              style={{ minWidth: '100px' }}
              onClick={() => window.location.href = adminUrl}
            >
              Admin
            </button>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <h3 className="text-2xl font-semibold leading-6 text-gray-800">
                  Credential: {displayResult()}
                </h3>
                <ArrowPathIcon
                  onClick={() => reloadMLInference()}
                  className="mx-auto h-6 w-6 ml-4 cursor-pointer text-gray-600 hover:text-gray-800 transition-colors"
                />
                {isMLProofVerified && (
                  <CheckBadgeIcon
                    className="h-12 w-12 ml-2"
                    style={{ fill: "url(#grad)" }}
                  />
                )}
              </div>
              <div className="items-right">
                <ConnectWalletButton />
              </div>
            </div>
            <svg width={0} height={0}>
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: "#22c1c3", stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: "#79fd2d", stopOpacity: 1 }} />
                </linearGradient>
              </defs>
            </svg>

            <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow border border-gray-300 sm:px-6 sm:pt-6">
                <dt>
                  <div className="absolute rounded-md bg-gray-800 p-3">
                    <CheckBadgeIcon className="h-6 w-6 text-white" />
                  </div>
                  <p className="ml-16 truncate text-sm font-medium text-gray-800">
                    Discord Score
                  </p>
                </dt>
                <dd className="mt-1 ml-16 flex flex-col items-start pb-6 sm:pb-7">
                  <p className="text-2xl font-semibold text-gray-800">{discordScore}</p>
                  <div className="mt-4 flex space-x-4">
                    <button
                      className="bg-gray-800 text-white py-1 px-2 rounded-md text-sm hover:bg-gray-900 transition-colors"
                      onClick={() => zkPassStart()}
                    >
                      {discordOwnerVerified ? "Discord Account Owner Verified!" : "Verify Discord Account Owner"}
                    </button>
                    <button
                      className="bg-gray-800 text-white py-1 px-2 rounded-md text-sm hover:bg-gray-900 transition-colors"
                      onClick={() => console.log("verify discord activity")}
                    >
                      Verify Discord Activity
                    </button>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gray-100 px-4 py-4 sm:px-6">
                    <div className="text-sm">
                      <a
                        href="#"
                        className="font-medium text-blue-600 hover:text-blue-500"
                      >
                        View source
                        <span className="sr-only"> stats</span>
                      </a>
                    </div>
                  </div>
                </dd>
              </div>

              <div className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow border border-gray-300 sm:px-6 sm:pt-6">
                <dt>
                  <div className="absolute rounded-md bg-gray-800 p-3">
                    <CheckBadgeIcon className="h-6 w-6 text-white" />
                  </div>
                  <p className="ml-16 truncate text-sm font-medium text-gray-800">
                    WorldCoin
                  </p>
                </dt>
                <dd className="mt-1 ml-16 flex flex-col items-start pb-6 sm:pb-7">
                  <p className="text-2xl font-semibold text-gray-800">{worldcoinScore}</p>
                  <div className="mt-4 flex space-x-4">
                  <IDKitWidget
                    action={action!}
                    app_id={app_id}
                    onSuccess={onSuccess}
                    handleVerify={handleProof}
                    verification_level={VerificationLevel.Orb} // Change this to VerificationLevel.Device to accept Orb- and Device-verified users
                  />
                    <button
                      className="bg-gray-800 text-white py-1 px-2 rounded-md text-sm hover:bg-gray-900 transition-colors"
                      onClick={() => setOpen(true)}
                    >
                      {worldcoinVerified ? "Verified!" : "Verify with World ID"}
                    </button>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gray-100 px-4 py-4 sm:px-6">
                    <div className="text-sm">
                      <a
                        href="#"
                        className="font-medium text-blue-600 hover:text-blue-500"
                      >
                        View source
                        <span className="sr-only"> stats</span>
                      </a>
                    </div>
                  </div>
                </dd>
              </div>

              {stats.map((item) => (
                <div
                  key={item.name}
                  className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow border border-gray-300 sm:px-6 sm:pt-6"
                >
                  <dt>
                    <div className="absolute rounded-md bg-gray-800 p-3">
                      <item.icon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="ml-16 truncate text-sm font-medium text-gray-800">
                      {item.name}
                    </p>
                  </dt>
                  <dd className="mt-1 ml-16 flex items-center pb-6 sm:pb-7">
                    <p className="text-2xl font-semibold text-gray-800">
                      {item.stat}
                    </p>
                    <CheckBadgeIcon
                      className="h-8 w-8 ml-2"
                      style={{ fill: "url(#grad)" }}
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gray-100 px-4 py-4 sm:px-6">
                      <div className="text-sm">
                        <a
                          href="#"
                          className="font-medium text-blue-600 hover:text-blue-500"
                        >
                          View source
                          <span className="sr-only"> {item.name} stats</span>
                        </a>
                      </div>
                    </div>
                  </dd>
                </div>
              ))}
            </dl>
            <div className="grid sm:grid-cols-3 mt-12 gap-4">
              <div className="w-full">
                <p className="font-semibold">Step1: Generate ZKML proof</p>
                <button
                  className="w-full bg-gray-800 text-white py-2 mt-2 rounded-lg flex items-center justify-center hover:bg-gray-900 transition-colors"
                  onClick={generateMLProof}
                  disabled={isProofGenerating}
                >
                  {isProofGenerating && (
                    <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" />
                  )}
                  {isProofGenerating ? "Generating..." : "Generate"}
                </button>
                {mlProof && (
                  <div className="mt-4 bg-white border border-gray-300 p-4 rounded-lg max-h-64 max-w-lg overflow-y-auto">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap">{mlProof}</pre>
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold">Step2: Verify ZKML Proof</p>
                <button
                  className="w-full bg-gray-800 py-2 mt-2 rounded-lg text-white hover:bg-gray-900 transition-colors"
                  onClick={verifyMLProof}
                >
                  {isMLProofVerified ? "Verified Successfully" : "Verify"}
                </button>
              </div>
              <div>
                <p className="font-semibold">Step3: Go to MACI Voting</p>
                {isMLProofVerified && (
                  <div className="mt-4">
                    <button
                      className="w-full bg-gray-800 py-2 rounded-lg text-white hover:bg-gray-900 transition-colors"
                      onClick={() => window.location.href = votingUrl}
                    >
                      Go to Voting Page
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
