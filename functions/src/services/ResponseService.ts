/**
 * This file is part of dHealth dApps Framework shared under LGPL-3.0
 * Copyright (C) 2023-present dHealth Network, All rights reserved.
 *
 * @package     BlockRabies DTPS
 * @author      dHealth Network <devs@dhealth.foundation>
 * @license     LGPL-3.0
 */
// external dependencies
import {Response} from "express";

/**
 * @class ResponseService
 */
export class ResponseService {
  /**
   * The singleton instance of this class.
   *
   * @access private
   * @static
   * @var {ResponseService}
   */
  private static instance: ResponseService;

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
   * @return {ResponseService}
   */
  public static getInstance(): ResponseService {
    if (!this.instance) {
      this.instance = new ResponseService();
    }
    return this.instance;
  }

  /**
   * A reusable common method to send response content
   * back to client.
   * Response content and error (if exists) will be store
   * in Response instance's `locals` property so that they
   * can be accessed later and logged out in the
   * {@link ServiceLog} middleware.
   *
   * @access public
   * @param {Response} res
   * @param {number} statusCode
   * @param {string | object} content
   * @param {any} error
   * @return {void}
   */
  public sendResponse(
      res: Response,
      statusCode: number,
      content: string | object,
      error?: any
  ): void {
    res.locals.responseContent = content;
    res.locals.error = error;
    res.status(statusCode).json(res.locals.responseContent);
  }
}
