/**
 * This file is part of dHealth dApps Framework shared under LGPL-3.0
 * Copyright (C) 2023-present dHealth Network, All rights reserved.
 *
 * @package     BlockRabies DTPS
 * @author      dHealth Network <devs@dhealth.foundation>
 * @license     LGPL-3.0
 */
// external dependencies
import {
  Account,
  Coin,
  DeliverTxResponse,
  SigningStargateClient,
  StargateClient,
} from "@cosmjs/stargate";

import {stringToPath} from "@cosmjs/crypto";

import {
  DirectSecp256k1HdWallet,
  OfflineDirectSigner,
} from "@cosmjs/proto-signing";

/**
 * @class NewdHealthService
 */
export class NewdHealthService {
  /**
   * The singleton instance of this class.
   *
   * @access private
   * @static
   * @var {NewdHealthService}
   */
  private static instance: NewdHealthService;

  private cosmosNetworkPrefix: string;
  private cosmosDHPDenom: string;
  private rpc: string;

  /**
   * Constructor of this class.
   *
   * @constructor
   * @access private
   */
  private constructor() {
    this.cosmosNetworkPrefix = "dh";
    this.cosmosDHPDenom = "udhp";
    this.rpc = "ws://rpc.dhealth.com:26657";
    return;
  }

  /**
   * Returns the singleton instance of this class.
   *
   * @access public
   * @static
   * @return {NewdHealthService}
   */
  public static getInstance(): NewdHealthService {
    if (!this.instance) {
      this.instance = new NewdHealthService();
    }
    return this.instance;
  }

  /**
   * Get the account entity from address.
   *
   * @access public
   * @param {string} address
   * @return {Promise<Account | null>}
   */
  public async getAccount(address: string): Promise<Account | null> {
    const client = await StargateClient.connect(this.rpc);
    return await client.getAccount(address);
  }

  /**
   * Check if an address is valid.
   *
   * @access public
   * @param {string} address
   * @return {Promise<boolean>}
   */
  public async validateAddress(address: string): Promise<boolean> {
    if (!address) {
      return false;
    }
    await this.getAccount(address).catch(() => {
      return false;
    });
    return true;
  }

  /**
   * Get the balance of an account.
   *
   * @access public
   * @param {string} address
   * @param {string} denom
   * @return {Promise<Coin>}
   */
  public async getBalance(address: string, denom: string): Promise<Coin> {
    const client = await StargateClient.connect(this.rpc);
    return await client.getBalance(address, denom);
  }

  /**
   * Validate if an account's balance is
   * greater than or equal to an amount.
   *
   * @access public
   * @param {string} address
   * @param {string} denom
   * @param {number} amount
   * @return {Promise<boolean>}
   */
  public async validateBalance(
      address: string,
      denom: string,
      amount: number
  ): Promise<boolean> {
    const balance = await this.getBalance(address, denom);
    if (+balance.amount < amount) {
      return false;
    }
    return true;
  }

  /**
   * Send a transfer transaction.
   *
   * @access public
   * @param {string} mnemonic
   * @param {string} to
   * @param {Coin[]} coins
   * @param {string} memo
   * @return {Promise<DeliverTxResponse>}
   */
  public async sendTokens(
      mnemonic: string,
      to: string,
      coins: Coin[],
      memo?: string
  ): Promise<DeliverTxResponse> {
    // signing client
    const getMainAccSignerFromMnemonic =
      async (): Promise<OfflineDirectSigner> =>
        DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
          prefix: this.cosmosNetworkPrefix,
          hdPaths: [stringToPath("m/44'/10111'/0'/0/0")],
        });
    const mainAccSigner: OfflineDirectSigner =
      await getMainAccSignerFromMnemonic();
    const mainAccAddr = (await mainAccSigner.getAccounts())[0].address;
    const signingClient = await SigningStargateClient.connectWithSigner(
        this.rpc,
        mainAccSigner
    );
    // send token
    const result = await signingClient.sendTokens(
        mainAccAddr,
        to,
        coins,
        {
          amount: [
            {
              denom: this.cosmosDHPDenom,
              amount: "500",
            },
          ],
          gas: "200000",
        },
        memo
    );
    // return result
    return result;
  }
}
