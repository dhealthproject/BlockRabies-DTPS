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
import {DocumentData} from "firebase-admin/firestore";

// internal dependencies
import {FirestoreService} from "../services/FirestoreService";
import {ResponseService} from "../services/ResponseService";

/**
 * @class AuthGuard
 */
export class AuthGuard {
  /**
   * The singleton instance of this class.
   *
   * @access private
   * @static
   * @var {AuthGuard}
   */
  private static instance: AuthGuard;

  /**
   * AuthGuard constructor
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
   * @return {AuthGuard}
   */
  public static getInstance(): AuthGuard {
    if (!this.instance) {
      this.instance = new AuthGuard();
    }
    return this.instance;
  }

  /**
   * Perfom request authorization.
   *
   * @access public
   * @async
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @return {void}
   */
  public async authorize(
      req: Request,
      res: Response,
      next: NextFunction,
  ): Promise<void> {
    // Get auth configs
    const authConfig: DocumentData | null | undefined =
      await FirestoreService.getInstance().findDoc("configs", "auth");
    if (!authConfig) {
      ResponseService.getInstance().sendResponse(res, 500, "Error: no config");
      return;
    }

    // Validate ip address
    const whitelist = authConfig.whitelist;
    const requestIpAddresses =
      (req.headers["x-forwarded-for"] as string).split(",");
    let ipValid = false;
    for (const requestIpAddress of requestIpAddresses) {
      if (whitelist.includes(requestIpAddress)) {
        ipValid = true;
      }
    }
    if (!ipValid) {
      ResponseService.getInstance().sendResponse(res, 403, "IP not allowed");
      return;
    }

    // Validate authorization code
    const authorizationCodes = authConfig.codes;
    const authorizationCode = req.headers.authorization;
    if (!authorizationCode || !authorizationCodes.includes(authorizationCode)) {
      ResponseService.getInstance().sendResponse(res, 401, "Unauthorized");
      return;
    }

    return next();
  }
}
