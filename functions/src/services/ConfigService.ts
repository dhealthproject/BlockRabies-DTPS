/**
 * This file is part of dHealth dApps Framework shared under LGPL-3.0
 * Copyright (C) 2023-present dHealth Network, All rights reserved.
 *
 * @package     BlockRabies DTPS
 * @author      dHealth Network <devs@dhealth.foundation>
 * @license     LGPL-3.0
 */
// external dependencies
import {FirestoreService} from "./FirestoreService";

/**
 * @class ConfigService
 */
export class ConfigService {
  /**
   * The singleton instance of this class.
   *
   * @access private
   * @static
   * @var {ConfigService}
   */
  private static instance: ConfigService;

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
   * @return {ConfigService}
   */
  public static getInstance(): ConfigService {
    if (!this.instance) {
      this.instance = new ConfigService;
    }
    return this.instance;
  }

  /**
   * Return the auth config values.
   *
   * @access public
   * @async
   * @return {Promise<FirebaseFirestore.DocumentData | null | undefined>}
   */
  public async getAuthConfig()
    : Promise<FirebaseFirestore.DocumentData | null | undefined> {
    return FirestoreService.getInstance().findDoc(
        "configs",
        "auth"
    );
  }
}
