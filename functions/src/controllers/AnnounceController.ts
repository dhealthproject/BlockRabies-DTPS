/**
 * This file is part of dHealth dApps Framework shared under LGPL-3.0
 * Copyright (C) 2023-present dHealth Network, All rights reserved.
 *
 * @package     BlockRabies DTPS
 * @author      dHealth Network <devs@dhealth.foundation>
 * @license     LGPL-3.0
 */
// external dependencies
import {Request, Response, NextFunction} from "express";
import {Account, Address} from "@dhealth/sdk";
import {DocumentData} from "firebase-admin/firestore";

// internal dependencies
import {AbstractController} from "./AbstractController";
import {NetworkService} from "../services/NetworkService";
import {FirestoreService} from "../services/FirestoreService";
import {NewdHealthService} from "../services/NewdHealthService";
import {DhealthService} from "../services/dHealthService";
import {ResponseService} from "../services/ResponseService";

/**
 * @class AnnounceController
 * @extends {AbstractController}
 */
export class AnnounceController extends AbstractController {
  /**
   * The singleton instance of this class.
   *
   * @access private
   * @static
   * @var {AnnounceController}
   */
  private static instance: AnnounceController;

  /**
   * Returns the singleton instance of this class.
   *
   * @access public
   * @static
   * @return {AnnounceController}
   */
  public static getInstance(): AnnounceController {
    if (!this.instance) {
      this.instance = new AnnounceController();
    }
    return this.instance;
  }

  /**
   * Overrides from super class.
   * Set up routes for this controller.
   *
   * @access protected
   * @return {void}
   */
  protected setUpRoute(): void {
    this.router.post("/", this.announce);
    this.router.post("/legacy", this.announceLegacy);
  }

  /**
   * Announce transaction.
   *
   * @access private
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @return {void}
   */
  private async announce(
      req: Request,
      res: Response,
      next: NextFunction): Promise<void> {
    const newdHealthService = NewdHealthService.getInstance();
    const {data} = req.body;
    const authorizationKey = req.headers.authorization;
    if (!authorizationKey) {
      ResponseService.getInstance()
          .sendResponse(res, 500, "Error: no auth key");
      return;
    }
    const recipientConfig: DocumentData | null | undefined =
    await FirestoreService
        .getInstance()
        .findDoc("configs", "broadcastRecipient");
    if (!recipientConfig) {
      ResponseService.getInstance()
          .sendResponse(res, 500, "Error: no config");
      return;
    }
    try {
      const senderEntity = await FirestoreService.getInstance().findDoc(
          "entities",
          authorizationKey,
      );
      const senderMnemonic = senderEntity?.mnemonic;
      const senderAddress = senderEntity?.address.new;
      const senderHasSufficientBalance =
        await newdHealthService.validateBalance(
            senderAddress,
            "udhp",
            6000
        );
      if (!senderHasSufficientBalance) {
        ResponseService.getInstance()
            .sendResponse(res, 500, "Account has insufficient balance");
        return;
      }
      const recipientAddress = senderEntity?.production ?
        recipientConfig.production : recipientConfig.staging;
      const result = await newdHealthService.sendTokens(
          senderMnemonic,
          recipientAddress,
          [
            {
              denom: "udhp",
              amount: "1",
            },
          ],
          JSON.stringify(data)
      );
      ResponseService
          .getInstance()
          .sendResponse(res, 200, {transactionHash: result.transactionHash});
    } catch (err: any) {
      next(err.stack);
    }
  }

  /**
   * Announce legacy transaction.
   *
   * @access private
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @return {void}
   */
  private async announceLegacy(
      req: Request,
      res: Response,
      next: NextFunction): Promise<void> {
    const networkService = NetworkService.getInstance();
    const dHealthService = DhealthService.getInstance();
    const {data} = req.body;
    const authorizationKey = req.headers.authorization;
    if (!authorizationKey) {
      ResponseService.getInstance()
          .sendResponse(res, 500, "Error: no auth key");
      return;
    }
    const recipientConfig: DocumentData | null | undefined =
    await FirestoreService
        .getInstance()
        .findDoc("configs", "broadcastRecipientLegacy");
    if (!recipientConfig) {
      ResponseService.getInstance()
          .sendResponse(res, 500, "Error: no config");
      return;
    }
    try {
      const senderEntity = await FirestoreService.getInstance().findDoc(
          "entities",
          authorizationKey,
      );
      const senderPrivateKey = senderEntity?.privateKey;
      const senderAccount = Account.createFromPrivateKey(
          senderPrivateKey,
          networkService.NETWORK_TYPE
      );
      const recipientAddress = senderEntity?.production ?
        recipientConfig.production : recipientConfig.staging;
      const result = await dHealthService.sendTransaction(
          senderAccount,
          Address.createFromRawAddress(recipientAddress),
          data
      );
      ResponseService.getInstance().sendResponse(res, 200, result);
    } catch (err: any) {
      next(err.stack);
    }
  }
}
