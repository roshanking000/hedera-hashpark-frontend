import { HashConnect, HashConnectTypes, MessageTypes } from "hashconnect";
import React, { useMemo } from "react";
import { useDispatch } from "react-redux";

import {
  AccountId,
  TokenId,
  NftId,
  TransferTransaction,
  AccountAllowanceApproveTransaction,
  TokenAssociateTransaction,
} from "@hashgraph/sdk";

import {
  setConnectedHederaWalletAddress,
  setHederaWalletStatus,
} from "../../store/actions/auth.actions";

import * as envfile from "../../env";

const env = "mainnet";

export const hc = new HashConnect();

const getPairingData = () => {
  if (hc.hcData.pairingData.length > 0) {
    return hc.hcData.pairingData[hc.hcData.pairingData.length - 1];
  }
};

export const hcInitPromise = new Promise(async (resolve) => {
  const appMetadata = {
    name: "HashPark",
    description: "",
    icon: window.location.origin + "/apple-icon.png",
    url: window.location.origin,
  };
  const initResult = await hc.init(appMetadata, env, true);
  resolve(initResult);
});

export const getProvider = async () => {
  await hcInitPromise;
  const accId = getPairingData()?.accountIds[0];
  const topic = getPairingData()?.topic;
  if (!accId || !topic) {
    throw new Error("No paired account");
  }

  const provider = hc.getProvider(env, topic, accId);
  return provider;
};

export const getSigner = async () => {
  const provider = await getProvider();
  const signer = hc.getSigner(provider);
  return signer;
};

export const HashConnectClient = () => {
  const dispatch = useDispatch();
  const syncWithHashConnect = useMemo(() => {
    return () => {
      const accId = getPairingData()?.accountIds[0];
      if (accId) {
        dispatch(setConnectedHederaWalletAddress(accId));
        dispatch(setHederaWalletStatus(true));
      } else {
        dispatch(setConnectedHederaWalletAddress(""));
        dispatch(setHederaWalletStatus(false));
      }
    };
  }, [dispatch]);

  syncWithHashConnect();
  hcInitPromise.then(() => {
    syncWithHashConnect();
  });
  hc.pairingEvent.on(() => {
    syncWithHashConnect();
  });
  hc.connectionStatusChangeEvent.on(() => {
    syncWithHashConnect();
  });
  return null;
};

export const allowanceMultipleNft = async (nftList_) => {
  const _provider = await getProvider();
  const _accountId = _provider.accountToSign
  const _signer = hc.getSigner(_provider);
  const _treasuryId = AccountId.fromString(envfile.TREASURY_ID);

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

export const autoAssociate = async () => {
  const _provider = await getProvider();
  const _accountId = _provider.accountToSign
  const _signer = hc.getSigner(_provider);

  //Associate a token to an account and freeze the unsigned transaction for signing
  const allowanceTx = await new TokenAssociateTransaction()
    .setAccountId(_accountId)
    .setTokenIds([TokenId.fromString(envfile.POOFS_TOKEN_ID)]);

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


export const receiveReward = async (rewardAmount) => {
  const _provider = await getProvider();
  const _accountId = _provider.accountToSign
  const _signer = hc.getSigner(_provider);
  const _treasuryId = AccountId.fromString(envfile.TREASURY_ID);

  const allowanceTx = new TransferTransaction();
  let sendPoofsBal = parseFloat(rewardAmount) * 10 ** envfile.POOFS_TOKEN_DECIMAL

  allowanceTx.addApprovedTokenTransfer(envfile.POOFS_TOKEN_ID, _treasuryId, -sendPoofsBal);
  allowanceTx.addTokenTransfer(envfile.POOFS_TOKEN_ID, _accountId, sendPoofsBal);

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