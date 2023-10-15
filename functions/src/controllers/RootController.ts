/**
 * This file is part of dHealth dApps Framework shared under LGPL-3.0
 * Copyright (C) 2023-present dHealth Network, All rights reserved.
 *
 * @package     BlockRabies DTPS
 * @author      dHealth Network <devs@dhealth.foundation>
 * @license     LGPL-3.0
 */
// external dependencies
import {Request, Response} from "express";

// internal dependencies
import {AbstractController} from "./AbstractController";
import * as packageJsonObj from "../../package.json";
import {ResponseService} from "../services/ResponseService";

/**
 * @class RootController
 * @extends {AbstractController}
 */
export class RootController extends AbstractController {
  /**
   * The singleton instance of this class.
   *
   * @access private
   * @static
   * @var {RootController}
   */
  private static instance: RootController;

  /**
   * Returns the singleton instance of this class.
   *
   * @access public
   * @static
   * @return {RootController}
   */
  public static getInstance(): RootController {
    if (!this.instance) {
      this.instance = new RootController();
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
    this.router.get("/", this.displayInfo);
  }

  /**
   * Displays service's information.
   *
   * @access private
   * @param {Request} _req
   * @param {Response} res
   * @return {void}
   */
  private displayInfo(_req: Request, res: Response): void {
    const {name, version} = packageJsonObj;
    ResponseService.getInstance().sendResponse(res, 200, {
      name,
      version,
    });
  }
}
