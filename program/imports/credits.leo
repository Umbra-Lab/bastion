program credits.leo {
    record credits{
        owner:address
        microcredits:u64
    }
 transition transfer_public_to_private(receiver:address,amount:u64){
    return credits{
        owner:receiver
        microcredits:amount
    } then finalize(receiver,amount)
 }
 finalize transfer_public_to_private(receiver:address,amount:u64){
    
 }
}




