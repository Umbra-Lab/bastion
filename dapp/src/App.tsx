import React, { FC, useMemo } from "react";
import { WalletProvider } from "@demox-labs/aleo-wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@demox-labs/aleo-wallet-adapter-reactui";
import { LeoWalletAdapter } from "@demox-labs/aleo-wallet-adapter-leo";
import {
  DecryptPermission,
  WalletAdapterNetwork,
} from "@demox-labs/aleo-wallet-adapter-base";
import { Route, Routes } from "react-router-dom";
import "@demox-labs/aleo-wallet-adapter-reactui/styles.css";
import { Welcome } from "./welcome";
// import Dashboard from "./dashboard";
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
      <div className="w-full flex flex-row justify-between p-10 items-center">
        <img src="/logo-h@0.5x.png" className="h-32" alt=""/>
        <WalletMultiButton />
        </div>
        <Routes>
          <Route path="/" element={<Welcome />}></Route>
          {/* <Route path="/dashboard" element={<Dashboard />}></Route> */}
        </Routes>
      </WalletModalProvider>
    </WalletProvider>

  );
};
