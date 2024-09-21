// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {Proof} from "./Common.sol";
import {ProofVerifier} from "./ProofVerifier.sol";

contract ProofVerifiedNFT is ERC721, Ownable, ProofVerifier {
    uint256 private _nextTokenId;


    // Mapping from proof hash to bool to prevent replay attacks
    mapping(bytes32 => bool) private _usedProofs;

    constructor() 
        ERC721("zkNFT", "ZKNFT") 
        Ownable(msg.sender)
        ProofVerifier() 
    {}

    function mintWithProof(Proof calldata _proof) public returns (uint256) {
        require(_proof.schemaId == "fc126b2b1f734989b415c901d1021177", "Different shemaId");
        require(verify(_proof), "Invalid proof");

        bytes32 proofHash = keccak256(abi.encode(_proof));
        require(!_usedProofs[proofHash], "Proof already used");

        _usedProofs[proofHash] = true;

        uint256 tokenId = _nextTokenId++;

        _safeMint(_proof.recipient, tokenId);

        return tokenId;
    }
}