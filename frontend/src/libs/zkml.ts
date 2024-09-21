import { readContract } from '@wagmi/core';

import { findStatValue } from '@/utils/findStat';
import { stats } from '@/config/stats/stats';
import { CIRCUIT_ID } from '@/config/circuit';
import { config } from "@/app/config";
import { ETHEREUM_SEPOLIA_ZKML_VERIFIER_ADDRESS } from "@/config/contract";
import { MLVerifierContractABI } from "@/config/abi";

export const generateZKMLProof = async (discord_score: number, worldcoin_score: number): Promise<string | null> => {
  try {
    const inputs = [
      discord_score,
      worldcoin_score,
      findStatValue(stats, stats[0].name, "int"),
      findStatValue(stats, stats[1].name, "int"),
      findStatValue(stats, stats[2].name, "int"),
      findStatValue(stats, stats[3].name, "int"),
    ];

    console.log({ inputs });

    const response = await fetch(
      `https://sindri.app/api/v1/circuit/${CIRCUIT_ID}/prove`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SINDRI_API_KEY}`,
        },
        body: new URLSearchParams({
          meta: "{}",
          proof_input: JSON.stringify({ inputs }),
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log(responseData);

    return responseData.proof_id;

  } catch (error) {
    console.error("Error generating proof:", error);
    return null;
  }
};

export const fetchZKMLProofDetails = async (proofId: string): Promise<{ proof: string | null, publicInput: string | null }> => {
  try {
    const response = await fetch(`https://sindri.app/api/v1/proof/${proofId}/detail`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SINDRI_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const res = await response.json();
    console.log({ res });

    const proof = res.proof?.proof || null;

    let publicInput: string | null = null;
    if (res.public && res.public['Verifier.toml']) {
      const publicInputString = res.public['Verifier.toml'];
      const match = publicInputString.match(/0x[0-9a-fA-F]{64}/);
      if (match) {
        publicInput = match[0];
      } else {
        console.error('No valid public input found.');
      }
    } else {
      console.error('Verifier.toml not found in the response.');
    }

    return { proof, publicInput };

  } catch (error) {
    console.error('Error fetching proof details:', error);
    return { proof: null, publicInput: null };
  }
};

export const verifyZKMLProof = async (proof: string, publicInput: string[]): Promise<boolean> => {
  console.log("Verifying ML proof");

  const formattedProof = proof.startsWith('0x') ? proof : `0x${proof}`;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await readContract(config, {
      address: ETHEREUM_SEPOLIA_ZKML_VERIFIER_ADDRESS,
      abi: MLVerifierContractABI,
      functionName: 'verify',
      args: [formattedProof, publicInput],
    });

    console.log('Verification result:', result);

    return result === true;

  } catch (error) {
    console.error('Error during verification:', error);
    return false;
  }
};
