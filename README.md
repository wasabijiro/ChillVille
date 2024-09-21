
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

# zkCredit

### Overview


### Problems



### Solution



### Usecase


### Technologies I used



### Architecture
```mermaid
  sequenceDiagram
    actor User
    participant BankWebsite as Bank Account Web
    participant ChromeExt as zkCredit (Chrome Extension)
    participant Frontend as zkCredit Dashboard
    participant RustServer as Rust Verify
    participant Verifier as Verifier Contract
    participant ENS as ENS

    User->>BankWebsite: 1. Login
    BankWebsite-->>ChromeExt: HTTPS Response with user data and signature
    ChromeExt->>ChromeExt: 2. Generate zkTLSProof from user data
    ChromeExt-->>User: 3. Provide zkTLSProof for download
    User->>Frontend: 4. Upload zkTLSProof to dashboard
    Frontend->>RustServer: 5. Send zkTLSProof for verification
    RustServer-->>Frontend: 6. Return verification result
    Frontend->>Frontend: 7. Generate zkMLProof<br/>(private input: input data, public input: existing model)
    Frontend->>Verifier: 8. Send zkMLProof to verifier contract
    Verifier-->>Frontend: 9. Return verification result<br/>(public output: inference result)
    Frontend->>ENS: 10. Store verification result on ENS text records

```

### Implementation Status

| Title          |                                                              URL |
| :------------- | ---------------------------------------------------------------: |
| Demo Movie      |                                      [https://youtu.be/zmENJzrxZRw](https://youtu.be/WDGJQbM-rik)|
| Pitch Doc    |   [zkcredit-presentation](https://www.canva.com/design/DAGOvSFvJ4E/SfJTYw3sauGSbj1k4oQdDg/edit?utm_content=DAGOvSFvJ4E&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton) |
| Demo Site     |                                 [zkcredit-demo](https://zk-credit-teal.vercel.app/) | 
| Contract   | [zkcredit-contracts](https://github.com/wasabijiro/zkCredit/tree/main/contracts) |
| Frontend |         [zkcredit-front](https://github.com/wasabijiro/zkCredit/tree/main/frontend) |


### Development
View [`Makefile`](./Makefile)<br>
※ The backend has not been deployed yet. You need to run the backend locally.
```sh
cp frontend/.env.sample frontend/.env
cp scripts/.env.sample scripts/.env

# run tlsn server
make tlsn_server
# run regression server
make regression_server

# run frontend
make ui_install
make ui_dev
```

### What's next for

- Support for Chrome extension
- Generate TLS Notary proof on the client side
- Implement Solidity contract to verify TLS Notary proof
- Integrate TLS Notary and zkML into a single circuit

### Contracts
**Verifier Contract**

| contract                   |                                                                                                                   contract address |
| :------------------------- | ---------------------------------------------------------------------------------------------------------------------------------: |
| Ethereum Sepolia    | [0xf2c9d93716e818bda8fd9cd13b692ec5302d5568](https://sepolia.etherscan.io/address/0xf2c9d93716e818bda8fd9cd13b692ec5302d5568#code)|
| Scroll Sepolia    | [0x677ab31a9d777eedbc88ce2198dce8de9378e78f](https://sepolia.scrollscan.com/address/0x677ab31a9d777eedbc88ce2198dce8de9378e78f)|
| Nero Testnet    | [0x677aB31a9D777eEdbc88CE2198dcE8de9378E78f](https://testnetscan.nerochain.io/address/0x677aB31a9D777eEdbc88CE2198dcE8de9378E78f)|
| NeoX Testnet    | [0xC502e62C2Dc0686044572465A653CdF81Ca15A48](https://neoxt4scan.ngd.network/address/0x677ab31a9d777eedbc88ce2198dce8de9378e78f)|
| Linea Testnet   | [0x677ab31a9d777eedbc88ce2198dce8de9378e78f](https://sepolia.lineascan.build/address/0x677ab31a9d777eedbc88ce2198dce8de9378e78f)|


### References
- https://github.com/tlsnotary
- https://github.com/storswiftlabs/python2noir
- https://github.com/storswiftlabs/zkml-noir
