"use client";

import { useState } from "react";
import {
  HomeIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import { clsx } from "clsx";
import TransgateConnect from "@zkpass/transgate-js-sdk";
import { ethers } from "ethers";

import { ConnectWalletButton } from "@/components/Wallet";
import { stats } from "@/config/stats/stats";
import { fetchMLInference } from "@/libs/ml";
import { generateZKMLProof, fetchZKMLProofDetails, verifyZKMLProof } from "@/libs/zkml"
import { delay } from "@/utils/delay";
import { ETHEREUM_SEPOLIA_ZKPASS_ADDRESS } from "@/config/contract";
import { ZKPASS_APP_ID, ZKPASS_SCHEMA_ID } from "@/config/zkpass";
import zkPassABI from "@/config/zkPassABI.json";

const navigation = [
  { name: "Dashboard", href: "#", icon: HomeIcon, current: true },
];

export default function Home() {
  const votingUrl = process.env.NEXT_PUBLIC_VOTING_URL || '#';
  const [isValid, setIsValid] = useState<boolean>(false);
  const [mlProof, setMLProof] = useState<string | null>(null);
  const [mlPublicInputs, setMLPublicInputs] = useState<string[] | null>(null);
  const [isProofGenerating, setIsProofGenerating] = useState(false);
  const [isMLProofVerified, setIsMLProofVerified] = useState(false);

  const [discordScore, setDiscordScore] = useState(0);
  const [discordOwnerVerified, setDiscordOwnerVerified] = useState(false);

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
      //get your ethereum address
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

      // const contract = new ethers.Contract(
      //   ETHEREUM_SEPOLIA_ZKPASS_ADDRESS,
      //   AttestationABI,
      //   provider
      // );
      // const data = contract.interface.encodeFunctionData("attest", [
      //   chainParams,
      // ]);

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
      const proofId = await generateZKMLProof();

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

        // setIsMLProofVerified(true);
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
    const prediction = await fetchMLInference(discordScore, stats);
    if (prediction === 'Human') {
      setIsValid(true);
    } else if (prediction === 'Bot') {
      setIsValid(false);
    }
  };

  const displayResult = () => {
    return isValid ? "Human" : "Bot";
  }

  return (
    <div>
      <div className="lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        {/* Sidebar component, swap this element with another sidebar if you like */}
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
          <div className="flex h-16 shrink-0 items-center">
            <p className="font-bold text-lg text-indigo-800">zkCredit</p>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className={clsx(
                          item.current
                            ? "bg-gray-50 text-indigo-600"
                            : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600",
                          "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6"
                        )}
                      >
                        <item.icon
                          aria-hidden="true"
                          className={clsx(
                            item.current
                              ? "text-indigo-600"
                              : "text-gray-400 group-hover:text-indigo-600",
                            "h-6 w-6 shrink-0"
                          )}
                        />
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <main className="py-10 lg:pl-72">
        <div className="px-4 sm:px-6 lg:px-8">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <h3 className="text-2xl font-semibold leading-6 text-gray-900">
                  Credit Score: {displayResult()}
                </h3>
                <ArrowPathIcon
                  onClick={() => {
                    reloadMLInference();
                  }}
                  className="mx-auto h-6 w-6 ml-4"
                ></ArrowPathIcon>
                {isMLProofVerified && (
                  <CheckBadgeIcon
                    className="h-12 w-12 ml-2"
                    style={{ fill: "url(#grad)" }}
                  />
                )}
              </div>
              <div className="mb-2 items-right">
                <ConnectWalletButton />
              </div>
            </div>
            <svg width={0} height={0}>
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop
                    offset="0%"
                    style={{ stopColor: "#22c1c3", stopOpacity: 1 }}
                  />
                  <stop
                    offset="100%"
                    style={{ stopColor: "#79fd2d", stopOpacity: 1 }}
                  />
                </linearGradient>
              </defs>
            </svg>

            <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow border sm:px-6 sm:pt-6">
              <dt>
                <div className="absolute rounded-md bg-indigo-500 p-3">
                  <CheckBadgeIcon className="h-6 w-6 text-white" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500">
                  Discord Score
                </p>
              </dt>
              <dd className="mt-1 ml-16 flex flex-col items-start pb-6 sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900">{discordScore}</p>
                <div className="mt-4 flex space-x-4">
                  <button
                    className="bg-indigo-600 text-white py-1 px-2 rounded-md text-sm"
                    onClick={() => zkPassStart()}
                  >
                    {discordOwnerVerified ? "Discord Account Owner Verified!" : "Verify Discord Account Owner"}
                  </button>

                  <button
                    className="bg-indigo-600 text-white py-1 px-2 rounded-md text-sm"
                    onClick={() => console.log("verify discord activity")}
                  >
                    Verify Discord Activity
                  </button>
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
                  <div className="text-sm">
                    <a
                      href="#"
                      className="font-medium text-indigo-600 hover:text-indigo-500"
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
                  className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow border sm:px-6 sm:pt-6"
                >
                  <dt>
                    <div className="absolute rounded-md bg-indigo-500 p-3">
                      <item.icon
                        aria-hidden="true"
                        className="h-6 w-6 text-white"
                      />
                    </div>
                    <p className="ml-16 truncate text-sm font-medium text-gray-500">
                      {item.name}
                    </p>
                  </dt>
                  <dd className="mt-1 ml-16 flex items-center pb-6 sm:pb-7">
                    <p className="text-2xl font-semibold text-gray-900">
                      {item.stat}
                    </p>

                    <CheckBadgeIcon
                      className="h-8 w-8 ml-2"
                      style={{ fill: "url(#grad)" }}
                    />
                    {/* <CheckBadgeIcon className="ml-2 h-8 w-8 text-green-500 font-bold" /> */}

                    <div className="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
                      <div className="text-sm">
                        <a
                          href="#"
                          className="font-medium text-indigo-600 hover:text-indigo-500"
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
            <div className="grid sm:grid-cols-3 mt-12 gap-4 ">
              <div className="w-full">
                <p className="font-semibold">Step1: Generate ZKML proof</p>
                <button
                  className="w-full bg-indigo-600 text-white py-2 mt-2 rounded-lg flex items-center justify-center"
                  onClick={() => generateMLProof()}
                  disabled={isProofGenerating}
                >
                  {isProofGenerating && (
                    <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" />
                  )}
                  {isProofGenerating ? "Generating..." : "Generate"}
                </button>
                {mlProof && (
                  <>
                    <div className="mt-4 bg-white border border-gray-300 p-4 rounded-lg max-h-64 max-w-lg overflow-y-auto">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                        {mlProof}
                      </pre>
                    </div>
                  </>
                )}
              </div>
              <div>
                <p className="font-semibold">Step2: Verify ZKML Proof</p>
                <button
                  className="w-full bg-indigo-600 py-2 mt-2 rounded-lg text-white"
                  onClick={() => verifyMLProof()}
                >
                  {isMLProofVerified ? "Verified Successfully" : "Verify"}
                </button>
              </div>
              <div>
                <p className="font-semibold">Step3: Go to MACI Voting</p>
                {isMLProofVerified && (
                  <div className="mt-4">
                    <button
                      className="w-full bg-green-600 py-2 rounded-lg text-white"
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
