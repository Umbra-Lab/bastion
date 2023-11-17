import React, { useState } from "react";
import {
  Deployment,
  WalletAdapterNetwork,
  WalletNotConnectedError,
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

  const navigate = useNavigate();

  const handleClick = async () => {
    let bastion_p = `struct Proposal:
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


function add_signer:
    input r0 as Proposal.private;
    input r1 as address.private;
    assert.eq r0.operation 0u8;
    hash.psd2 r1 into r2 as field;
    assert.eq r0.receiver r2;
    async add_signer r0 r2 into r3;
    output r3 as bastion.aleo/add_signer.future;

finalize add_signer:
    input r0 as Proposal.public;
    input r1 as field.public;
    get proposals[r0] into r2;
    get.or_use minimum_signature_count[true] 1u8 into r3;
    gte r2 r3 into r4;
    assert.eq r4 true;
    set true into signers[r1];


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


function add_to_blacklist:
    input r0 as Proposal.private;
    input r1 as address.private;
    assert.eq r0.operation 2u8;
    hash.psd2 r1 into r2 as field;
    assert.eq r0.receiver r2;
    async add_to_blacklist r0 into r3;
    output r3 as bastion.aleo/add_to_blacklist.future;

finalize add_to_blacklist:
    input r0 as Proposal.public;
    get proposals[r0] into r1;
    get.or_use minimum_signature_count[true] 1u8 into r2;
    gte r1 r2 into r3;
    assert.eq r3 true;
    set true into blacklist[r0.receiver];


function add_to_whitelist:
    input r0 as Proposal.private;
    input r1 as address.private;
    assert.eq r0.operation 3u8;
    hash.psd2 r1 into r2 as field;
    assert.eq r0.receiver r2;
    async add_to_whitelist r0 into r3;
    output r3 as bastion.aleo/add_to_whitelist.future;

finalize add_to_whitelist:
    input r0 as Proposal.public;
    get proposals[r0] into r1;
    get.or_use minimum_signature_count[true] 1u8 into r2;
    gte r1 r2 into r3;
    assert.eq r3 true;
    set true into whitelist[r0.receiver];


function switch_mode:
    input r0 as Proposal.private;
    input r1 as u8.private;
    assert.eq r0.operation 1u8;
    lt r1 4u8 into r2;
    assert.eq r2 true;
    async switch_mode r0 r1 into r3;
    output r3 as bastion.aleo/switch_mode.future;

finalize switch_mode:
    input r0 as Proposal.public;
    input r1 as u8.public;
    get proposals[r0] into r2;
    get.or_use minimum_signature_count[true] 1u8 into r3;
    gte r2 r3 into r4;
    assert.eq r4 true;
    set r1 into mode[true];


function transfer_to_private:
    input r0 as Proposal.private;
    input r1 as address.private;
    input r2 as u64.private;
    assert.eq r0.operation 4u8;
    assert.eq r0.amount r2;
    hash.psd2 r1 into r3 as field;
    assert.eq r0.receiver r3;
    call shadowfi_token_shadow_v1_1.aleo/withdraw_shadow r1 r2 into r4 r5;
    async transfer_to_private r5 r0 into r6;
    output r4 as shadowfi_token_shadow_v1_1.aleo/ShadowToken.record;
    output r6 as bastion.aleo/transfer_to_private.future;

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


function transfer:
    input r0 as Proposal.private;
    input r1 as address.private;
    input r2 as u64.private;
    assert.eq r0.operation 4u8;
    assert.eq r0.amount r2;
    hash.psd2 r1 into r3 as field;
    assert.eq r0.receiver r3;
    call shadowfi_token_shadow_v1_1.aleo/transfer_public_shadow r1 r2 into r4;
    async transfer r4 r0 into r5;
    output r5 as bastion.aleo/transfer.future;

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
`;
    const random_string = generateString(8).toLowerCase();
    const program =
      `import credits.aleo;` +
      "\n" +
      `program bastion_${random_string}.aleo;` +
      bastion_p;
    if (publicKey) {
      const aleoDeployment = new Deployment(
        publicKey,
        WalletAdapterNetwork.Testnet,
        program,
        app.bastion.deploy_fee,
        false
      );
      if (requestTransaction && requestDeploy) {
        console.log(generateString(8));
        await requestDeploy(aleoDeployment);
        localStorage.setItem("id", random_string);
        navigate("/dashboard");
      }
    }
  };
  return (
    <div>
      <button onClick={handleClick}> Create a Bastion</button>
      <button disabled={!bastionID}
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
  );
};
