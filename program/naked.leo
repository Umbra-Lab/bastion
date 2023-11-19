/*
This is the "naked" version of Bastion which reveals addresses all around.
Per my talk with Evan, if "child" addresses are added to the wallet this might be
a better approch since no hashes are used and the privacy can be preserved by
keeping the personal account and "public" account separate. Which means you
fund the public "child" account privately using you main account and just use
the public accounts to deal with others. These public addresses can always transfer
everything back to the main account privately.
Of course, with such a paradigm the blacklist functionality isn't really useful is it?
This should be faster than other version since no hashing function is used.
*/

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

    mapping signers: address => bool;
    mapping signers_count: bool => u8;
    mapping minimum_signature_count: bool => u8;
    mapping proposals: Proposal => u8;
    mapping signatures: Signature => bool;
    mapping initialized: bool => bool;
    mapping whitelist: address => bool;
    mapping blacklist: address => bool;
    mapping mode: bool => u8;

    struct Proposal {
        id: u64,
        operation: u8,
        amount: u64,
        receiver: address,
    }

    struct Signature {
        id: u64,
        signer: address,
    }

    transition init() {
        let owner: address = self.caller;
        assert_eq(owner, aleo1twvkzfdhdc0xr68ykx2p544d7wpxl8zqytf9aqgkqykerkmh05psl6vyvz);
        return then finalize(owner);
    }
    finalize init(signer: address) {
        assert(!Mapping::contains(initialized, true));
        Mapping::set(signers, signer, true);
        Mapping::set(initialized, true, true);
    }

    transition propose(id: u64, operation: u8, amount: u64, receiver: address) {
        return then finalize(Proposal { id, operation, amount, receiver }, self.caller);
    }
    finalize propose(proposal: Proposal, proposer: address) {
        assert(Mapping::contains(signers, proposer));
        assert(!Mapping::contains(proposals, proposal));
        Mapping::set(proposals, proposal, 1u8);
        Mapping::set(signatures, Signature { id: proposal.id, signer: proposer }, true);
    }

    transition sign(proposal: Proposal) {
        return then finalize(proposal, self.caller);
    }
    finalize sign(proposal: Proposal, signer: address) {
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
        Mapping::set(signers_count, true, Mapping::get_or_use(signers_count, true, 0u8) + 1u8);
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

    transition transfer_to_private(proposal: Proposal) -> shadowfi_token_shadow_v1_1.leo/ShadowToken {
        assert_eq(proposal.operation, OP_TRANSFER);
        return shadowfi_token_shadow_v1_1.leo/withdraw_shadow(proposal.receiver, proposal.amount) then finalize(proposal);
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

    transition transfer(proposal: Proposal) {
        assert_eq(proposal.operation, OP_TRANSFER);
        return shadowfi_token_shadow_v1_1.leo/transfer_public_shadow(proposal.receiver, proposal.amount) then finalize(proposal);
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
