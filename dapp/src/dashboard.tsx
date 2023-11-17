import React, { useEffect, useState } from "react";
import {
  WalletAdapterNetwork,
  WalletNotConnectedError,
  Transaction,
} from "@demox-labs/aleo-wallet-adapter-base";
import app from "../apps.json";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { Button, Cascader, Input, InputNumber } from "antd";

const Dashboard: React.FC = () => {
  const { publicKey, requestTransaction } = useWallet();

  const [bastionId, setBastionId] = useState<any>();
  const [operation, setOpeartion] = useState<any>();
  const [proposalId, setProposalId] = useState<any>();
  const [amount, setAmount] = useState<any>();
  const [address, setAddress] = useState<any>();

  interface Option {
    value: number;
    label: string;
  }
  
  useEffect(() => {
    setBastionId(localStorage.getItem("id"));
  });

  const items: Option[] = [
    {
      value: 0,
      label: "Add Signer",
    },
    {
      value: 1,
      label: "Switch Mode",
    },
    {
      value: 2,
      label: "Add to Blacklist",
    },
    {
      value: 3,
      label: "Add to Whitelist",
    },
    {
      value: 4,
      label: "Transfer",
    },
    {
      value: 5,
      label: "Set Minimum Signature Count"
    }
  ];

  const modes: Option[] = [
    { value: 0, label: "Frozen" },
    { value: 1, label: "Enabled" },
    { value: 2, label: "Blacklist" },
    { value: 3, label: "Whitelist" },
  ];

  const propose = async () => {
    if (!publicKey) throw new WalletNotConnectedError();
    const inputs = [proposalId, operation, amount+"u64", address];
    const aleoTransaction = Transaction.createTransaction(
      publicKey,
      WalletAdapterNetwork.Testnet,
      app.bastion.base_call_id + bastionId + ".aleo",
      app.bastion.propose_function,
      inputs,
      app.bastion.propose_fee
    );
    if (requestTransaction) {
      await requestTransaction(aleoTransaction);
    }
  };

  const sign = async () => {
    if (!publicKey) throw new WalletNotConnectedError();
    const inputs = [JSON.stringify({id: proposalId+"u64",operation: operation+"u8",amount: amount+"u64",address})];
    const aleoTransaction = Transaction.createTransaction(
      publicKey,
      WalletAdapterNetwork.Testnet,
      app.bastion.base_call_id + bastionId + ".aleo",
      app.bastion.sign_function,
      inputs,
      app.bastion.sign_fee
    );
    if (requestTransaction) {
      await requestTransaction(aleoTransaction);
    }
  };

  const execute = async () => {
    // if (!publicKey) throw new WalletNotConnectedError();
    // const inputs = [proposalId, operation, amount, address];
    // const aleoTransaction = Transaction.createTransaction(
    //   publicKey,
    //   WalletAdapterNetwork.Testnet,
    //   app.bastion.base_call_id + bastionId + ".aleo",
    //   app.bastion.propose_function,
    //   inputs,
    //   app.bastion.propose_fee
    // );
    // if (requestTransaction) {
    //   await requestTransaction(aleoTransaction);
    // }
  };

  return (
    <div className="flex flex-col">
      <div>{bastionID}</div>
      <div className="flex my-5">
        <Input
          value={proposalId}
          placeholder="Proposal ID"
          className="mr-5"
          onChange={(event) => {
            setProposalId(event.target.value);
          }}
        />

        <Cascader
          options={items}
          placeholder={"Select A Operation"}
          className=""
          value={operation}
          onChange={(value) => {
            setOpeartion(value);
            console.log(operation);
          }}
        />

<<<<<<< HEAD
      </div>


      <div className="flex mb-5">
=======
      <Cascader
        options={items}
        placeholder={"Select A Operation"}
        value={operation}
        onChange={(value) => {
          setOpeartion(value);
        }}
      />


      <InputNumber
        className={operation != 5 ? "hidden" : ""}
        placeholder="Amount"
        value={amount}
        onChange={(event) => {
          setAmount(event);

        }}
      />
>>>>>>> c9fef50 (add sign)

        <InputNumber
          className={operation != 5 ? "hidden" : ""}
          placeholder="Amount"
          value={amount}

          onChange={(value) => {
            setAmount(value);
          }}
        />
      </div>
      <div className="flex mb-5">
        <Input
          className={operation == 2 ? "hidden" : ""}
          placeholder="Address"
          value={address}
          onChange={(event) => {
            setAddress(event.target.value);
          }}
        />
      </div>
      <div className="flex mb-5">

        <Cascader
          className={operation != 2 ? "hidden" : ""}
          options={modes}
          placeholder={"Select A Mode"}
          value={amount}
          onChange={(value) => {
            setAmount(value);
          }}
        />
      </div>

      <div className="flex  flex-row justify-between w-1/3 m-auto">
        <Button onClick={async () => await propose()}>Propose</Button>
        <Button
          onClick={async () => {
            await sign();
          }}
        >
          Sign
        </Button>
        <Button>Execute</Button>
      </div>

    </div>
  );
};

export default Dashboard;
