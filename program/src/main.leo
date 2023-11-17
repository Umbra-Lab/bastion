import shadowfi_token_shadow_v1_1.leo;

program bastion.aleo {
    const MODE_FROZEN: u8 = 0u8;
    const MODE_BLACKLIST: u8 = 2u8;
    const MODE_WHITELIST: u8 = 3u8;

    const OP_ADD_SIGNER: u8 = 0u8;
    const OP_SWITCH_MODE: u8 = 1u8;
    const OP_ADD_TO_BLACKLIST: u8 = 2u8;
    const OP_ADD_TO_WHITELIST: u8 = 3u8;
    const OP_TRANSFER: u8 = 4u8;
    const OP_SET_MINIMUM_SIGNATURE_COUNT: u8 = 5u8;

    mapping signers: field => bool;
    mapping minimum_signature_count: bool => u8;
    mapping proposals: Proposal => u8;
    mapping signatures: Signature => bool;
    mapping initialized: bool => bool;
    mapping whitelist: field => bool;
    mapping blacklist: field => bool;
    mapping mode: bool => u8;

    struct Proposal {
        id: u64,
        operation: u8,
        amount: u64,
        receiver: field,
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

    transition propose(id: u64, operation: u8, amount: u64, receiver: address) {
        return then finalize(Proposal { id, operation, amount, receiver: Poseidon2::hash_to_field(receiver) }, Poseidon2::hash_to_field(self.caller));
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
 
    transition add_signer(proposal: Proposal) {
        assert_eq(proposal.operation, OP_ADD_SIGNER);
        return then finalize(proposal);
    }
    finalize add_signer(proposal: Proposal) {
        let signature_count: u8 = Mapping::get(proposals, proposal);
        let required_signature_count: u8 = Mapping::get_or_use(minimum_signature_count, true, 1u8);
        assert(signature_count >= required_signature_count);
        Mapping::set(signers, proposal.receiver, true);
        Mapping::remove(proposals, proposal);
    }
    
    transition add_to_blacklist(proposal: Proposal) {
        assert_eq(proposal.operation, OP_ADD_TO_BLACKLIST);
        return then finalize(proposal);
    }
    finalize add_to_blacklist(proposal: Proposal) {
        let signature_count: u8 = Mapping::get(proposals, proposal);
        let required_signature_count: u8 = Mapping::get_or_use(minimum_signature_count, true, 1u8);
        assert(signature_count >= required_signature_count);
        Mapping::set(blacklist, proposal.receiver, true);
        Mapping::remove(proposals, proposal);
    }

    transition add_to_whitelist(proposal: Proposal) {
        assert_eq(proposal.operation, OP_ADD_TO_WHITELIST);
        return then finalize(proposal);
    }
    finalize add_to_whitelist(proposal: Proposal) {
        let signature_count: u8 = Mapping::get(proposals, proposal);
        let required_signature_count: u8 = Mapping::get_or_use(minimum_signature_count, true, 1u8);
        assert(signature_count >= required_signature_count);
        Mapping::set(whitelist, proposal.receiver, true);
        Mapping::remove(proposals, proposal);
    }

    transition switch_mode(proposal: Proposal) {
        assert_eq(proposal.operation, OP_SWITCH_MODE);
        return then finalize(proposal);
    }
    finalize switch_mode(proposal: Proposal) {
        let signature_count: u8 = Mapping::get(proposals, proposal);
        let required_signature_count: u8 = Mapping::get_or_use(minimum_signature_count, true, 1u8);
        assert(signature_count >= required_signature_count);
        Mapping::set(mode, true, proposal.amount as u8);
        Mapping::remove(proposals, proposal);
    }

    transition transfer_to_private(proposal: Proposal, receiver: address) -> shadowfi_token_shadow_v1_1.leo/ShadowToken {
        assert_eq(proposal.operation, OP_TRANSFER);
        let hashed_address: field = Poseidon2::hash_to_field(receiver);
        assert_eq(proposal.receiver, hashed_address);
        return shadowfi_token_shadow_v1_1.leo/withdraw_shadow(receiver, proposal.amount) then finalize(proposal);
    }
    finalize transfer_to_private(proposal: Proposal) {
        let current_mode: u8 = Mapping::get_or_use(mode, true, 0u8);
        assert_neq(current_mode, MODE_FROZEN);
        if(current_mode == MODE_BLACKLIST) {
            assert(!Mapping::contains(blacklist, proposal.receiver));
        }
        if(current_mode == MODE_WHITELIST) {
            assert(Mapping::contains(whitelist, proposal.receiver));
        }
        let signature_count: u8 = Mapping::get(proposals, proposal);
        let required_signature_count: u8 = Mapping::get_or_use(minimum_signature_count, true, 1u8);
        assert(signature_count >= required_signature_count);
        Mapping::remove(proposals, proposal);
    }

    transition transfer(proposal: Proposal, receiver: address) {
        assert_eq(proposal.operation, OP_TRANSFER);
        let hashed_address: field = Poseidon2::hash_to_field(receiver);
        assert_eq(proposal.receiver, hashed_address);
        return shadowfi_token_shadow_v1_1.leo/transfer_public_shadow(receiver, proposal.amount) then finalize(proposal);
    }
    finalize transfer(proposal: Proposal) {
        let current_mode: u8 = Mapping::get_or_use(mode, true, 0u8);
        assert_neq(current_mode, MODE_FROZEN);
        if(current_mode == MODE_BLACKLIST) {
            assert(!Mapping::contains(blacklist, proposal.receiver));
        }
        if(current_mode == MODE_WHITELIST) {
            assert(Mapping::contains(whitelist, proposal.receiver));
        }
        let signature_count: u8 = Mapping::get(proposals, proposal);
        let required_signature_count: u8 = Mapping::get_or_use(minimum_signature_count, true, 1u8);
        assert(signature_count >= required_signature_count);
        Mapping::remove(proposals, proposal);
    }

    transition deposit(token: shadowfi_token_shadow_v1_1.leo/ShadowToken, amount: u64) -> shadowfi_token_shadow_v1_1.leo/ShadowToken {
        return shadowfi_token_shadow_v1_1.leo/deposit_shadow(token, amount);
    }
    
    transition set_minimum_signature_count(proposal: Proposal) {
        assert_eq(proposal.operation, OP_SET_MINIMUM_SIGNATURE_COUNT);
        return then finalize(proposal);
    }
    finalize set_minimum_signature_count(proposal: Proposal) {
        let signature_count: u8 = Mapping::get(proposals, proposal);
        let required_signature_count: u8 = Mapping::get_or_use(minimum_signature_count, true, 1u8);
        assert(signature_count >= required_signature_count);
        Mapping::set(minimum_signature_count, true, proposal.amount as u8);
        Mapping::remove(proposals, proposal);
    }

}
