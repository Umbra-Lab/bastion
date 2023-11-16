import React, { FC, useMemo } from "react";
import { WalletProvider } from "@demox-labs/aleo-wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@demox-labs/aleo-wallet-adapter-reactui";
import { LeoWalletAdapter } from "@demox-labs/aleo-wallet-adapter-leo";
import {
  DecryptPermission,
  WalletAdapterNetwork,
} from "@demox-labs/aleo-wallet-adapter-base";
import { Route, Routes } from "react-router-dom";
import "@demox-labs/aleo-wallet-adapter-reactui/styles.css";
import { Welcome } from "./welcome";
import { Create } from "./create ";
import { Import } from "./import";

// Default styles that can be overridden by your app


export const App: FC = () => {
  const wallets = useMemo(
    () => [
      new LeoWalletAdapter({
        appName: "Leo Demo App",
      }),
    ],
    []
  );

  return (
    <WalletProvider
      wallets={wallets}
      decryptPermission={DecryptPermission.UponRequest}
      network={WalletAdapterNetwork.Testnet}
      autoConnect
    >
      <WalletModalProvider>
    <WalletMultiButton/>
    <Routes>
    <Route path="/" element={<Welcome/>}></Route>
      <Route path="/import" element={<Import/>}></Route>
      <Route path="/create" element={<Create/>}></Route>
    </Routes>
      </WalletModalProvider>
    </WalletProvider>
  );
};