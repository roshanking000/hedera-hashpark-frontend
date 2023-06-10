import { HashConnect, HashConnectTypes, MessageTypes } from "hashconnect";
import React, { useEffect, useState } from "react";
import {
  AccountId,
  TokenId,
  NftId,
  Hbar,
  TransferTransaction,
  AccountAllowanceApproveTransaction,
  TokenAssociateTransaction,
  AccountAllowanceDeleteTransaction,
  PrivateKey,
  PublicKey,
} from '@hashgraph/sdk';
import * as env from "../../env";

const INITIAL_SAVE_DATA = {
  topic: "",
  pairingString: "",
  privateKey: "",
  pairedAccounts: [],
  pairedWalletData: null,
};

let APP_CONFIG = {
  name: "Hash Park & Friends",
  description: "",
  icon: "icon.png",
};

const loadLocalData = () => {
  let foundData = localStorage.getItem("hashconnectData");
  if (foundData) {
    const saveData = JSON.parse(foundData);
    // setSaveData(saveData);
    return saveData;
  } else return null;
};

export const HashConnectAPIContext =
  React.createContext({
    connect: () => null,
    disconnect: () => null,
    tokenTransfer: () => null,
    walletData: INITIAL_SAVE_DATA,
    netWork: env.NETWORK_TYPE,
    installedExtensions: null,
  });

export default function HashConnectProvider({
  children,
  hashConnect,
  metaData,
  netWork,
  debug,
}) {
  //Saving Wallet Details in Ustate
  const [saveData, SetSaveData] = useState(INITIAL_SAVE_DATA);
  const [installedExtensions, setInstalledExtensions] = useState(null);

  //? Initialize the package in mount
  const initializeHashConnect = async () => {
    // console.log("initializeHashConnect");

    const saveData = INITIAL_SAVE_DATA;
    const localData = loadLocalData();
    // console.log("Glinton HashConnect Test >>>>> localData :", localData);
    try {
      if (debug) console.log("===Local data not found.=====");

      //first init and store the private for later
      // console.log("Glinton HashConnect Test >>>>> APP_CONFIG :", APP_CONFIG);
      let initData = await hashConnect.init(APP_CONFIG);
      console.log(initData);
      saveData.privateKey = initData.privKey;
      // console.log("initData privkey", saveData.privateKey);

      //then connect, storing the new topic for later
      const state = await hashConnect.connect();
      saveData.topic = state.topic;

      //generate a pairing string, which you can display and generate a QR code from
      saveData.pairingString = hashConnect.generatePairingString(state, netWork, false);

      //find any supported local wallets
      hashConnect.findLocalWallets();
    } catch (error) {
      // console.log(error);
    } finally {
      if (localData) {
        SetSaveData((prevData) => ({ ...prevData, ...localData }));
      } else {
        SetSaveData((prevData) => ({ ...prevData, ...saveData }));
      }
    }
  };

  const saveDataInLocalStorage = async (data) => {
    SetSaveData((prevData) => ({ ...prevData, ...data }));
  };

  // const additionalAccountResponseEventHandler = (
  //   data: MessageTypes.AdditionalAccountResponse
  // ) => {
  //   // if (debug) console.debug("=====additionalAccountResponseEvent======", data);
  //   // Do a thing
  // };

  const foundExtensionEventHandler = (
    data
  ) => {
    if (debug) console.debug("====foundExtensionEvent====", data);
    // Do a thing
    setInstalledExtensions(data);
  };

  const pairingEventHandler = (data) => {
    // Save Data to localStorage
    saveDataInLocalStorage(data);
  };

  useEffect(() => {
    initializeAll();
  }, []);

  const initializeAll = () => {
    //Intialize the setup
    initializeHashConnect();

    // Attach event handlers
    // hashConnect.additionalAccountResponseEvent.on(
    //   additionalAccountResponseEventHandler
    // );
    hashConnect.foundExtensionEvent.on(foundExtensionEventHandler);
    hashConnect.pairingEvent.on(pairingEventHandler);

    return () => {
      // Detach existing handlers
      // hashConnect.additionalAccountResponseEvent.off(
      //   additionalAccountResponseEventHandler
      // );
      hashConnect.foundExtensionEvent.off(foundExtensionEventHandler);
      hashConnect.pairingEvent.off(pairingEventHandler);
    };
  };

  const connect = () => {
    if (installedExtensions) {
      hashConnect.connectToLocalWallet(saveData.pairingString);
    } else {
      // if (debug) console.log("====No Extension is not in browser====");
      return "wallet not installed";
    }
  };

  const disconnect = async () => {
    hashConnect.disconnect(saveData.topic)
  };

  const allowanceNft = async (tokenId_, serialNum_) => {
    let _accountId
    let _provider
    if (saveData.pairingData.length == undefined) {
      _accountId = saveData.pairingData.accountIds[0];
      _provider = hashConnect.getProvider(netWork, saveData.pairingData.topic, _accountId);
    }
    else {
      _accountId = saveData.pairingData[0].accountIds[0];
      _provider = hashConnect.getProvider(netWork, saveData.pairingData[0].topic, _accountId);
    }

    const _signer = hashConnect.getSigner(_provider);
    const _treasuryId = AccountId.fromString(env.TREASURY_ID);
    const _nft = new NftId(TokenId.fromString(tokenId_), parseInt(serialNum_));

    const allowanceTx = new AccountAllowanceApproveTransaction()
      .approveTokenNftAllowance(_nft, _accountId, _treasuryId);

    if (!allowanceTx) return false;
    const allowanceFreeze = await allowanceTx.freezeWithSigner(_signer);
    if (!allowanceFreeze) return false;
    const allowanceSign = await allowanceFreeze.signWithSigner(_signer);
    if (!allowanceSign) return false;
    const allowanceSubmit = await allowanceSign.executeWithSigner(_signer);
    if (!allowanceSubmit) return false;
    const allowanceRx = await _provider.getTransactionReceipt(allowanceSubmit.transactionId);

    if (allowanceRx.status._code === 22)
      return true;

    return false;
  }

  const allowanceMultipleNft = async (nftList_) => {
    let _accountId
    let _provider
    if (saveData.pairingData.length == undefined) {
      _accountId = saveData.pairingData.accountIds[0];
      _provider = hashConnect.getProvider(netWork, saveData.pairingData.topic, _accountId);
    }
    else {
      _accountId = saveData.pairingData[0].accountIds[0];
      _provider = hashConnect.getProvider(netWork, saveData.pairingData[0].topic, _accountId);
    }

    const _signer = hashConnect.getSigner(_provider);
    const _treasuryId = AccountId.fromString(env.TREASURY_ID);

    let allowanceTx = new AccountAllowanceApproveTransaction();

    for (let i = 0; i < nftList_.length; i++) {
      const _nft = new NftId(TokenId.fromString(nftList_[i].token_id), parseInt(nftList_[i].serial_number));
      allowanceTx.approveTokenNftAllowance(_nft, _accountId, _treasuryId);
    }
    if (!allowanceTx) return false;
    const allowanceFreeze = await allowanceTx.freezeWithSigner(_signer);
    if (!allowanceFreeze) return false;
    const allowanceSign = await allowanceFreeze.signWithSigner(_signer);
    if (!allowanceSign) return false;
    const allowanceSubmit = await allowanceSign.executeWithSigner(_signer);
    if (!allowanceSubmit) return false;
    const allowanceRx = await _provider.getTransactionReceipt(allowanceSubmit.transactionId);

    if (allowanceRx.status._code === 22)
      return true;

    return false;
  }

  const receiveReward = async (rewardAmount) => {
    let _accountId
    let _provider
    if (saveData.pairingData.length == undefined) {
      _accountId = saveData.pairingData.accountIds[0];
      _provider = hashConnect.getProvider(netWork, saveData.pairingData.topic, _accountId);
    }
    else {
      _accountId = saveData.pairingData[0].accountIds[0];
      _provider = hashConnect.getProvider(netWork, saveData.pairingData[0].topic, _accountId);
    }

    const _signer = hashConnect.getSigner(_provider);
    const _treasuryId = AccountId.fromString(env.TREASURY_ID);

    const allowanceTx = new TransferTransaction();
    const sendBal = new Hbar(rewardAmount);

    allowanceTx.addApprovedHbarTransfer(_treasuryId, sendBal.negated());
    allowanceTx.addHbarTransfer(_accountId, sendBal);

    const allowanceFreeze = await allowanceTx.freezeWithSigner(_signer);
    if (!allowanceFreeze) return false;
    const allowanceSign = await allowanceFreeze.signWithSigner(_signer);
    if (!allowanceSign) return false;
    const allowanceSubmit = await allowanceSign.executeWithSigner(_signer);
    if (!allowanceSubmit) return false;
    const allowanceRx = await _provider.getTransactionReceipt(allowanceSubmit.transactionId);

    if (allowanceRx.status._code === 22)
      return true;

    return false;
  }

  return (
    <HashConnectAPIContext.Provider
      value={{ walletData: saveData, installedExtensions, connect, disconnect, allowanceNft, allowanceMultipleNft, receiveReward }}>
      {children}
    </HashConnectAPIContext.Provider>
  );
}

const defaultProps = {
  metaData: {
    name: "Hash Park & Friends",
    description: "",
    icon: "icon.png",
  },
  netWork: env.NETWORK_TYPE,
  debug: false,
};

HashConnectProvider.defaultProps = defaultProps;

export function useHashConnect() {
  const value = React.useContext(HashConnectAPIContext);
  return value;
}