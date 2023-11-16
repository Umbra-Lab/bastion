program bastion.aleo {
    mapping signers: field => bool;
    mapping minimum_signature_count: bool => u8;
    mapping proposals: Proposal => u8;
    mapping signatures: Signature => bool;
    mapping initialized: bool => bool;

    struct Proposal {
        id: u64,
        operation: u8,
        amount: u64,
    }

    struct SignerProposal {
        id: u64,

    }

    struct Signature {
        id: u64,
        signer: field,
    }

    transition init() {
        return then finalize(Poseidon2::hash_to_field(self.caller));
    }
    finalize init(signer: field) {
        assert(!Mapping::contains(initialized, true));
        Mapping::set(signers, signer, true);
        Mapping::set(initialized, true, true);
    }

    transition add_signer(proposal: Proposal) {
        return then finalize(proposal, Poseidon2::hash_to_field(self.caller));
    }
    finalize add_signer(proposal: Proposal, signer: field) {
        let signature_count: u8 = Mapping::get(proposals, proposal);
        let required_signature_count: u8 = Mapping::get_or_use(minimum_signature_count, true, 1u8);
        assert(signature_count >= required_signature_count);
        Mapping::set(signers, signer, true);
    }

    transition propose(id: u64, operation: u8, amount: u64) {
        return then finalize(Proposal { id, operation, amount }, Poseidon2::hash_to_field(self.caller));
    }
    finalize propose(proposal: Proposal, proposer: field) {
        assert(Mapping::contains(signers, proposer));
        assert(!Mapping::contains(proposals, proposal));
        Mapping::set(proposals, proposal, 1u8);
        Mapping::set(signatures, Signature { id: proposal.id, signer: proposer }, true);
    }

    transition sign(proposal: Proposal) {
        return then finalize(proposal, Poseidon2::hash_to_field(self.caller));
    }
    finalize sign(proposal: Proposal, signer: field) {
        assert(Mapping::contains(signers, signer));
        let signature: Signature = Signature {
            id: proposal.id,
            signer,
        };
        assert(!Mapping::contains(signatures, signature));
        Mapping::set(proposals, proposal, Mapping::get(proposals, proposal) + 1u8);
        Mapping::set(signatures, signature, true);
    }
}
