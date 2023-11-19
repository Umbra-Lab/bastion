import React, { useEffect, useState } from "react";
import {
  Deployment,
  WalletAdapterNetwork,
  WalletNotConnectedError, Transaction, AleoDeployment
} from "@demox-labs/aleo-wallet-adapter-base";
import app from "../apps.json";
import { Input } from "antd";
import { Navigate, useNavigate } from "react-router-dom";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";

export const Welcome = () => {
  const [bastionID, setBastionID] = useState<any>();
  const { publicKey, requestDeploy, requestTransaction } = useWallet();
  function generateString(length: number) {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }
  useEffect(()=>{
    let local_storage =localStorage.getItem("id")
    if(local_storage){
      setBastionID(local_storage)
    }
  })

  const navigate = useNavigate();

  const handleClick = async () => {
    const random_string = generateString(8).toLowerCase();
    const program = `
    import shadowfi_token_shadow_v1_1.aleo;
    program bastion.aleo;
    
    
    struct Proposal:
        id as u64;
        operation as u8;
        amount as u64;
        receiver as field;
    
    struct Signature:
        id as u64;
        signer as field;
    
    
    mapping signers:
      key as field.public;
      value as boolean.public;
    
    
    mapping minimum_signature_count:
      key as boolean.public;
      value as u8.public;
    
    
    mapping proposals:
      key as Proposal.public;
      value as u8.public;
    
    
    mapping signatures:
      key as Signature.public;
      value as boolean.public;
    
    
    mapping initialized:
      key as boolean.public;
      value as boolean.public;
    
    
    mapping whitelist:
      key as field.public;
      value as boolean.public;
    
    
    mapping blacklist:
      key as field.public;
      value as boolean.public;
    
    
    mapping mode:
      key as boolean.public;
      value as u8.public;
    
    function init:
        hash.psd2 self.caller into r0 as field;
        async init r0 into r1;
        output r1 as bastion.aleo/init.future;
    
    finalize init:
        input r0 as field.public;
        contains initialized[true] into r1;
        not r1 into r2;
        assert.eq r2 true;
        set true into signers[r0];
        set true into initialized[true];
    
    
    function propose:
        input r0 as u64.private;
        input r1 as u8.private;
        input r2 as u64.private;
        input r3 as address.private;
        hash.psd2 r3 into r4 as field;
        cast r0 r1 r2 r4 into r5 as Proposal;
        hash.psd2 self.caller into r6 as field;
        async propose r5 r6 into r7;
        output r7 as bastion.aleo/propose.future;
    
    finalize propose:
        input r0 as Proposal.public;
        input r1 as field.public;
        contains signers[r1] into r2;
        assert.eq r2 true;
        contains proposals[r0] into r3;
        not r3 into r4;
        assert.eq r4 true;
        set 1u8 into proposals[r0];
        cast r0.id r1 into r5 as Signature;
        set true into signatures[r5];
    
    
    function sign:
        input r0 as Proposal.private;
        hash.psd2 self.caller into r1 as field;
        async sign r0 r1 into r2;
        output r2 as bastion.aleo/sign.future;
    
    finalize sign:
        input r0 as Proposal.public;
        input r1 as field.public;
        contains signers[r1] into r2;
        assert.eq r2 true;
        cast r0.id r1 into r3 as Signature;
        contains signatures[r3] into r4;
        not r4 into r5;
        assert.eq r5 true;
        get proposals[r0] into r6;
        add r6 1u8 into r7;
        set r7 into proposals[r0];
        set true into signatures[r3];
    
    
    function add_signer:
        input r0 as Proposal.private;
        assert.eq r0.operation 0u8;
        async add_signer r0 into r1;
        output r1 as bastion.aleo/add_signer.future;
    
    finalize add_signer:
        input r0 as Proposal.public;
        get proposals[r0] into r1;
        get.or_use minimum_signature_count[true] 1u8 into r2;
        gte r1 r2 into r3;
        assert.eq r3 true;
        set true into signers[r0.receiver];
        remove proposals[r0];
    
    
    function add_to_blacklist:
        input r0 as Proposal.private;
        assert.eq r0.operation 2u8;
        async add_to_blacklist r0 into r1;
        output r1 as bastion.aleo/add_to_blacklist.future;
    
    finalize add_to_blacklist:
        input r0 as Proposal.public;
        get proposals[r0] into r1;
        get.or_use minimum_signature_count[true] 1u8 into r2;
        gte r1 r2 into r3;
        assert.eq r3 true;
        set true into blacklist[r0.receiver];
        remove proposals[r0];
    
    
    function add_to_whitelist:
        input r0 as Proposal.private;
        assert.eq r0.operation 3u8;
        async add_to_whitelist r0 into r1;
        output r1 as bastion.aleo/add_to_whitelist.future;
    
    finalize add_to_whitelist:
        input r0 as Proposal.public;
        get proposals[r0] into r1;
        get.or_use minimum_signature_count[true] 1u8 into r2;
        gte r1 r2 into r3;
        assert.eq r3 true;
        set true into whitelist[r0.receiver];
        remove proposals[r0];
    
    
    function switch_mode:
        input r0 as Proposal.private;
        assert.eq r0.operation 1u8;
        async switch_mode r0 into r1;
        output r1 as bastion.aleo/switch_mode.future;
    
    finalize switch_mode:
        input r0 as Proposal.public;
        get proposals[r0] into r1;
        get.or_use minimum_signature_count[true] 1u8 into r2;
        gte r1 r2 into r3;
        assert.eq r3 true;
        cast r0.amount into r4 as u8;
        set r4 into mode[true];
        remove proposals[r0];
    
    
    function transfer_to_private:
        input r0 as Proposal.private;
        input r1 as address.private;
        assert.eq r0.operation 4u8;
        hash.psd2 r1 into r2 as field;
        assert.eq r0.receiver r2;
        call shadowfi_token_shadow_v1_1.aleo/withdraw_shadow r1 r0.amount into r3 r4;
        async transfer_to_private r4 r0 into r5;
        output r3 as shadowfi_token_shadow_v1_1.aleo/ShadowToken.record;
        output r5 as bastion.aleo/transfer_to_private.future;
    
    finalize transfer_to_private:
        input r0 as shadowfi_token_shadow_v1_1.aleo/withdraw_shadow.future;
        input r1 as Proposal.public;
        await r0;
        get.or_use mode[true] 0u8 into r2;
        assert.neq r2 0u8;
        is.eq r2 2u8 into r3;
        contains blacklist[r1.receiver] into r4;
        not r4 into r5;
        not r3 into r6;
        or r6 r5 into r7;
        assert.eq r7 true;
        is.eq r2 3u8 into r8;
        contains whitelist[r1.receiver] into r9;
        not r8 into r10;
        or r10 r9 into r11;
        assert.eq r11 true;
        get proposals[r1] into r12;
        get.or_use minimum_signature_count[true] 1u8 into r13;
        gte r12 r13 into r14;
        assert.eq r14 true;
        remove proposals[r1];
    
    
    function transfer:
        input r0 as Proposal.private;
        input r1 as address.private;
        assert.eq r0.operation 4u8;
        hash.psd2 r1 into r2 as field;
        assert.eq r0.receiver r2;
        call shadowfi_token_shadow_v1_1.aleo/transfer_public_shadow r1 r0.amount into r3;
        async transfer r3 r0 into r4;
        output r4 as bastion.aleo/transfer.future;
    
    finalize transfer:
        input r0 as shadowfi_token_shadow_v1_1.aleo/transfer_public_shadow.future;
        input r1 as Proposal.public;
        await r0;
        get.or_use mode[true] 0u8 into r2;
        assert.neq r2 0u8;
        is.eq r2 2u8 into r3;
        contains blacklist[r1.receiver] into r4;
        not r4 into r5;
        not r3 into r6;
        or r6 r5 into r7;
        assert.eq r7 true;
        is.eq r2 3u8 into r8;
        contains whitelist[r1.receiver] into r9;
        not r8 into r10;
        or r10 r9 into r11;
        assert.eq r11 true;
        get proposals[r1] into r12;
        get.or_use minimum_signature_count[true] 1u8 into r13;
        gte r12 r13 into r14;
        assert.eq r14 true;
        remove proposals[r1];
    
    
    function deposit:
        input r0 as shadowfi_token_shadow_v1_1.aleo/ShadowToken.record;
        input r1 as u64.private;
        call shadowfi_token_shadow_v1_1.aleo/deposit_shadow r0 r1 into r2 r3;
        async deposit r3 into r4;
        output r2 as shadowfi_token_shadow_v1_1.aleo/ShadowToken.record;
        output r4 as bastion.aleo/deposit.future;
    
    finalize deposit:
        input r0 as shadowfi_token_shadow_v1_1.aleo/deposit_shadow.future;
        await r0;
    
    
    function set_minimum_signature_count:
        input r0 as Proposal.private;
        assert.eq r0.operation 5u8;
        async set_minimum_signature_count r0 into r1;
        output r1 as bastion.aleo/set_minimum_signature_count.future;
    
    finalize set_minimum_signature_count:
        input r0 as Proposal.public;
        get proposals[r0] into r1;
        get.or_use minimum_signature_count[true] 1u8 into r2;
        gte r1 r2 into r3;
        assert.eq r3 true;
        cast r0.amount into r4 as u8;
        set r4 into minimum_signature_count[true];
        remove proposals[r0];    
`.replace(/bastion.aleo/g, `bastion_${random_string}.aleo`);
    
    if (publicKey) {
      const aleoDeployment: AleoDeployment = new Deployment(
        publicKey,
        WalletAdapterNetwork.Testnet,
        program,
        app.bastion.deploy_fee,
        false
      );
      if (requestTransaction && requestDeploy) {
        console.log("hjelsfdsf");
        try{
          await requestDeploy(aleoDeployment);
        }catch(e) {
          console.log(e);
        }
        // const aleoTransaction = Transaction.createTransaction(
        //   publicKey,
        //   WalletAdapterNetwork.Testnet,
        //   app.bastion.base_call_id + random_string + ".aleo",
        //   app.bastion.init_function,
        //   [],
        //   app.bastion.init_fee
        // );
        // await requestTransaction(aleoTransaction)
        // localStorage.setItem("id", random_string);
        // navigate("/dashboard");
      }
    }
  };
  return (
    <div>


      <div id="content " className="mr-10 ml-10">
        <h1 className="text-center text-4xl mx-16 my-16	font-sans	"><b>Welcome to Bastion!</b></h1>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris aliquet tellus nunc, eu egestas turpis
          scelerisque id. Aenean non mattis libero. Donec sed commodo felis. Duis in bibendum nisi. Praesent non nisl
          ut justo gravida pretium in nec leo. Sed ac ornare sem. Donec non tellus et lectus tempor suscipit.</p>

        <div id="create-box" className=" my-10 border border-color rounded-lg p-6 text-center bg-[#fdc074]">
          <p>Haven't created a basion yet?</p>
          <button onClick={handleClick} className=" mt-10 py-3 px-6 rounded-lg text-white bg-[#f97d16]"> Create a Bastion</button>

        </div>
        <div id="create-box" className=" my-10 border border-color rounded-lg p-6 text-center bg-[#28c9e8]">
          <p>Have a Bastion?</p>
          <button disabled={!bastionID}
          className=" my-10 py-3 px-6 rounded-lg text-white disabled:bg-[#a8eff9] bg-[#0ca9ca]"
            onClick={() => {
              localStorage.setItem("id", bastionID);
              navigate("/dashboard");
            }}
          >
            Import a Bastion
          </button>
          <Input
          
            placeholder="Bastion ID"
            value={bastionID}
            onChange={(event) => {
              setBastionID(event.target.value);
            }}
          />
        </div>

      </div>
    </div>


  );
};
