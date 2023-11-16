import credits.leo
program bastion.aleo {
    const MODES_FROZEN:u8 = 0u8;
    const MODES_ENABLED:u8= 1u8;
    const MODES_BLACKLIST:u8= 2u8;
    const MODES_WHITELIST:u8 = 3u8;
    mapping signers: field => bool;
    mapping minimum_signature_count: bool => u8;
    mapping proposals: Proposal => u8;
    mapping signatures: Signature => bool;
    mapping initialized: bool => bool;
    mapping whitelist: address => bool;
    mapping blacklist: address => bool;
    mapping mode:bool => u8;

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
 
        transition add_to_blacklist(receiver:address){

         return then finalize(receiver);
    }
        finalize add_to_blacklist(receiver:address){
            let current_mode: u8 = Mapping::get_or_use(mode, true, 0u8);
            assert_eq(current_mode, MODES_BLACKLIST);
            Mapping::set(blacklist, receiver, true);
        }
        transition add_to_whitelist(receiver: address){
            return then finalize(receiver); 
        }
        finalize add_to_whitelist(receiver: address){
            let current_mode: u8 = Mapping::get_or_use(mode, true, 0u8);
            assert_eq(current_mode, MODES_WHITELIST);
            Mapping::set(whitelist, receiver, true);
        }
        transition switch_mode(new_mode: u8){
            assert(new_mode < 4u8);
            return then finalize(new_mode);
        }
        finalize switch_mode(new_mode: u8){
            Mapping::set(mode, true, new_mode);
        }
        transition transfer(beneficiary: address, amount: u64){
            credits.leo/transfer_public_to_private(beneficiary, amount)
        }
}
