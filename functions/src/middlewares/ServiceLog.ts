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
import {info} from "firebase-functions/logger";

/**
 * @class ServiceLog
 */
export class ServiceLog {
  /**
   * The singleton instance of this class.
   *
   * @access private
   * @static
   * @var {ServiceLog}
   */
  private static instance: ServiceLog;

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
   * @return {ServiceLog}
   */
  public static getInstance(): ServiceLog {
    if (!this.instance) {
      this.instance = new ServiceLog();
    }
    return this.instance;
  }

  /**
   * Method to log each request and response info.
   * Each interaction between client and server consists
   * of one request and one response. They will be logged
   * in a single object.
   *
   * @access public
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @return {void}
   */
  public createLog(req: Request, res: Response, next: NextFunction): void {
    res.on("finish", () => {
      info(
          "Request received:",
          {
            request: {
              method: req.method,
              route: decodeURI(req.originalUrl),
              ip: req.headers["x-forwarded-for"],
              authCode: req.headers.authorization,
              body: req.body,
            },
            response: {
              statusCode: res.statusCode,
              statusMessage: res.statusMessage,
              body: res.locals.responseContent,
              error: res.locals.error,
            },
          }
      );
    });
    next();
  }
}
