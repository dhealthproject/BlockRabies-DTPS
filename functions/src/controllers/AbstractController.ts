/**
 * This file is part of dHealth dApps Framework shared under LGPL-3.0
 * Copyright (C) 2023-present dHealth Network, All rights reserved.
 *
 * @package     BlockRabies DTPS
 * @author      dHealth Network <devs@dhealth.foundation>
 * @license     LGPL-3.0
 */
// external dependencies
import {Router as routerFunc} from "express";

/**
 * @class AbstractController
 * @abstract
 */
export abstract class AbstractController {
  /**
   * The service router instance.
   *
   * @access protected
   * @var {routerFunc}
   */
  protected router: routerFunc;

  /**
   * Constructor of this class.
   *
   * @constructor
   * @access protected
   */
  protected constructor() {
    this.router = routerFunc();
    this.setUpRoute();
  }

  /**
   * Getter for this class's router instance.
   *
   * @access public
   * @return {routerFunc}
   */
  public get controller(): routerFunc {
    return this.router;
  }

  protected abstract setUpRoute(): void;
}
