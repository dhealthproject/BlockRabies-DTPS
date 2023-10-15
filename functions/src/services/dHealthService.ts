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
  Address,
  Deadline,
  PlainMessage,
  SignedTransaction,
  Transaction,
  TransactionAnnounceResponse,
  TransferTransaction,
  UInt64,
} from "@dhealth/sdk";

// internal dependencies
import {NetworkService} from "./NetworkService";

/**
 * @class dHealthService
 */
export class DhealthService {
  /**
   * The singleton instance of this class.
   *
   * @access private
   * @static
   * @var {dHealthService}
   */
  private static instance: DhealthService;

  /**
   * Constructor of this class.
   *
   * @constructor
   * @access private
   */
  private constructor() {
    return;
  }

  /**
   * Returns the singleton instance of this class.
   *
   * @access public
   * @static
   * @return {DhealthService}
   */
  public static getInstance(): DhealthService {
    if (!this.instance) {
      this.instance = new DhealthService();
    }
    return this.instance;
  }

  /**
   * Create a transaction, sign and announce it.
   *
   * @access public
   * @param {Account} senderAccount
   * @param {Address} recipientAddress
   * @param {string} data
   * @return {Promise<TransactionAnnounceResponse>}
   */
  public sendTransaction(
      senderAccount: Account,
      recipientAddress: Address,
      data: string,
  ): Promise<TransactionAnnounceResponse> {
    const transaction = this.createTransaction(
        recipientAddress,
        JSON.stringify(data)
    );
    const signedTransaction = this.signTransaction(
        senderAccount,
        transaction
    );
    return this.announceTransaction(
        signedTransaction
    );
  }

  /**
   * Creates a transaction from recipient address and message data.
   *
   * @access public
   * @param {Address} recipientAddress
   * @param {string} data
   * @return {Transaction}
   */
  public createTransaction(
      recipientAddress: Address,
      data: string
  ): Transaction {
    const networkService = NetworkService.getInstance();
    const transferTransaction = TransferTransaction.create(
        Deadline.create(networkService.EPOCH_ADJUSTMENT),
        recipientAddress,
        [],
        PlainMessage.create(data),
        networkService.NETWORK_TYPE,
        UInt64.fromUint(0),
    );
    return transferTransaction;
  }

  /**
   * Signs a transaction with sender's account.
   *
   * @access public
   * @param {Account} account
   * @param {Transaction} transaction
   * @return {SignedTransaction}
   */
  public signTransaction(
      account: Account,
      transaction: Transaction
  ): SignedTransaction {
    const networkService = NetworkService.getInstance();
    const signedTransaction = account.sign(
        transaction,
        networkService.GENERATION_HASH,
    );
    return signedTransaction;
  }

  /**
   * Announces a signed transaction to the blockchain network.
   *
   * @access public
   * @async
   * @param {SignedTransaction} signedTransaction
   * @return {Promise<TransactionAnnounceResponse>}
   */
  public async announceTransaction(
      signedTransaction: SignedTransaction
  ): Promise<TransactionAnnounceResponse> {
    const networkService = NetworkService.getInstance();
    const node = await networkService.connectToAnAvailableNode();
    const transactionHttp = node.transactionRepository;
    const response = transactionHttp.announce(signedTransaction);
    return response.toPromise();
  }
}
