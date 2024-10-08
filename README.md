# ChillVille

### Overview
We built a private onchain voting system with sybil resistance by combining MACI and zkTLS. This allows for fairer governance by eliminating bribery and collusion, and enabling private voting based on off-chain contributions.

### Problems

Onchain voting is a critical component of decentralized governance, but it faces several significant challenges:

1. **Vote Transparency & Bribery**: Onchain votes are often public, leading to risks of bribery, collusion, and undue influence on voters, which can undermine the integrity of the process.
2. **Sybil Attacks**: Malicious actors can create multiple identities to manipulate voting outcomes, a problem known as Sybil attacks. Preventing these attacks using purely onchain mechanisms has proven difficult.
3. **Off-Chain Data Integration**: While incorporating off-chain data into Web3 applications can enhance security and fairness, doing so privately, portably, and permissionlessly is a major challenge.

### Solution

To address these challenges, we have developed a private, Sybil-resistant onchain voting system by integrating three technologies: **MACI**, **zkTLS**, and **zkML**.

- **MACI** (Minimum Anti-Collusion Infrastructure) is used to maintain privacy in onchain voting. It ensures that individual votes remain encrypted and private, revealing only the final results. This reduces the risks of bribery and collusion.
  
- **zkTLS** bridges the gap between Web2 and Web3, enabling users to securely export their private Web2 data, generate zero-knowledge proofs (zk-proofs), and verify them onchain. This allows off-chain data to be used privately, portably, and permissionlessly in Web3 ecosystems.
  
- **zkML** proves the inference results of machine learning models without revealing the input data. This technology enables private Web2 data to be integrated and verifiable in Web3 voting systems.

By combining **MACI**, **zkTLS**, and **zkML**, we’ve created a Sybil-resistant, private onchain voting system that incorporates off-chain data while ensuring security and privacy. Off-chain contributions are verifiable through zkTLS and zkML and are seamlessly integrated into MACI, providing a robust solution to the challenges of vote transparency and Sybil resistance.

### Technologies I used
<img width="715" alt="スクリーンショット 2024-09-22 7 45 39" src="https://github.com/user-attachments/assets/e3b7ae77-7383-48e7-b800-539ee10868be">

### Architecture
```mermaid
  sequenceDiagram
    actor User
    participant Discord as Discord Account Web
    participant zkPassExt as zkPass (Chrome Extension)
    participant Dashboard as Dashboard
    participant zkServer as zkProof Verification Server
    participant Verifier as Verifier Contract
    participant VotingSystem as Voting System
    participant Coordinator as Voting Coordinator

    User->>Discord: 1. Login to Discord
    Discord-->>zkPassExt: HTTPS Response with user data and signature
    zkPassExt->>zkPassExt: 2. Generate zkTLSProof from Discord data
    zkPassExt-->>User: 3. Provide zkTLSProof for download
    User->>Dashboard: 4. Upload zkTLSProof to dashboard
    Dashboard->>Dashboard: 5. Generate zkMLProof (private input: user activity, public input: machine learning model)
    Dashboard->>Verifier: 6. Send zkMLProof to verifier contract
    Verifier-->>Dashboard: 7. Return verification result (user activity and eligibility verified)
    Dashboard-->>User: 8. Verified! Access Voting System
    User->>VotingSystem: 9. Select poll and cast vote
    VotingSystem->>Coordinator: 10. Notify coordinator of user signup
    Coordinator->>Coordinator: 11. Merge user signups and messages, generate zkProof
    Coordinator-->>VotingSystem: 12. Provide tally.json (with only final voting result)
    VotingSystem-->>User: 13. Display voting result
```

### Development


## zkPass Contract
https://sepolia.etherscan.io/address/0x6390aa9b19d4d2bbda745c03deca0a5775f9b0e2

## MACI Contract
```json
{
    "sepolia": {
        "MACI": "0x31D2EC14148E06C2f0dA87Ec83cCeA3047BA7ea2",
        "InitialVoiceCreditProxy": "0xAb2f7a1D83cB1c334Ca8a0D48b131883e2948fb6",
        "SignUpGatekeeper": "0x85B76d654B5F999802F0AeAe974230da429bB031",
        "Verifier": "0x86c8131cC72a9b2eb649D1DC48bE0e7A3E1dEc5B",
        "PollFactory": "0xc3aABf417Bad3Db4D10a34eF60193E5671C7bc4c",
        "PoseidonT3": "0xccB720352706E9593FcA5746Ca732D69DDFFC379",
        "PoseidonT4": "0xE410499bFE1Cb4251fA9405f10F2F92883bf747C",
        "PoseidonT5": "0x2B82fDe9DA306651b852188c5E99BA5a7583CCf6",
        "PoseidonT6": "0xeFd62f9C83ceAD5355274EC51a0DB04a00E1Bb07",
        "VkRegistry": "0x8375df390AD43aa6b1F6d8dAEA84abf0293f8cBc"
    }
}
```

## zkML Contracts

| contract                   |                                                                                                                   contract address |
| :------------------------- | ---------------------------------------------------------------------------------------------------------------------------------: |
| Ethereum Sepolia    | [0xf2c9d93716e818bda8fd9cd13b692ec5302d5568](https://sepolia.etherscan.io/address/0xf2c9d93716e818bda8fd9cd13b692ec5302d5568#code)|
| Airdao Testnet    | [0xDDae9FBB31943679BFD6F301F8c3D7100e5d6214](https://testnet.airdao.io/explorer/address/0xDDae9FBB31943679BFD6F301F8c3D7100e5d6214/)|
| RootStock Testnet   | [0x677ab31a9d777eedbc88ce2198dce8de9378e78f](https://explorer.testnet.rootstock.io/address/0x677ab31a9d777eedbc88ce2198dce8de9378e78f?__ctab=general )|
| Morph Holosky    | [0x926a111655a1c856fb46053e95689cc1fe5c3c038257d30d33bb40d11624b9cc](https://explorer-holesky.morphl2.io/tx/0x926a111655a1c856fb46053e95689cc1fe5c3c038257d30d33bb40d11624b9cc)
| Fhenix Testnet    | [0x677aB31a9D777eEdbc88CE2198dcE8de9378E78f](https://explorer.helium.fhenix.zone/address/0x677aB31a9D777eEdbc88CE2198dcE8de9378E78f)|
| Linea Testnet   | [0xb764f3cea872ae3995c3eb0c6e533d6aa6c490bf](https://sepolia.lineascan.build/address/0xb764f3cea872ae3995c3eb0c6e533d6aa6c490bf#code)|

### What's next for
- deploy backend
- deploy on mainnet
- Integrate zkPass and zkML into a single circuit
- Integrate zkPass and MACI solidity contract

### Implementation Status

| Title          |                                                              URL |
| :------------- | ---------------------------------------------------------------: |
| Demo Movie      |                                      [[https://youtu.be/zmENJzrxZRw](https://youtu.be/WDGJQbM-rik](https://youtu.be/Q9-vxqqNYXM))|
| Pitch Doc    |   [chillville-presentation](https://www.canva.com/design/DAGRZRWummM/d9pPp11CQoBMzAf8bC4YEw/edit?utm_content=DAGRZRWummM&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton) |
| Demo Site     |                                 [chillville-demo](https://eth-sg.vercel.app/)| 

### References
- https://github.com/zkPassOfficial
- https://github.com/privacy-scaling-explorations/maci
- https://github.com/storswiftlabs/python2noir
- https://github.com/storswiftlabs/zkml-noir
