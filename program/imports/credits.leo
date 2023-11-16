program credits.aleo {
    record credits {
        owner: address,
        microcredits: u64,
    }

    transition transfer_public_to_private(receiver: address, amount: u64) -> credits {
        return then finalize();
    }
    finalize transfer_public_to_private() {
        assert(true);
    }
}




