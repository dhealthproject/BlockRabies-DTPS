/**
 * This file is part of dHealth dApps Framework shared under LGPL-3.0
 * Copyright (C) 2023-present dHealth Network, All rights reserved.
 *
 * @package     BlockRabies DTPS
 * @author      dHealth Network <devs@dhealth.foundation>
 * @license     LGPL-3.0
 */
// external dependencies
import axios, {AxiosResponse} from "axios";

/**
 * @type HttpMethod
 * @description The HTTP method name, e.g. `"GET"`. This type is used
 * to execute to HTTP requests using the `axios` dependency.
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * @class HttpRequestHandler
 * @description This class contains methods for executing
 * *remote* API calls, e.g. calling a `GET` HTTP API endpoint.
 */
export class HttpRequestHandler {
  /**
   * The singleton instance of this class.
   *
   * @access private
   * @static
   * @var {HttpRequestHandler}
   */
  private static instance: HttpRequestHandler;

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
   * @return {HttpRequestHandler}
   */
  public static getInstance() {
    if (!this.instance) {
      this.instance = new HttpRequestHandler();
    }
    return this.instance;
  }

  /**
   * This method implements the logic to execute HTTP
   * requests using the `axios` dependency.
   * <br /><br />
   * Methods currently supported include: `GET`, `POST`, `DELETE`.
   *
   * @access public
   * @async
   * @param   {string}   url
   * @param   {string}   method
   * @param   {any}      body
   * @param   {any}      options
   * @param   {any}      headers
   * @return {Promise<AxiosResponse<any, any>>}
   */
  public async call(
      url: string,
      method: HttpMethod = "GET",
      body: object = {},
      options: object = {},
      headers: object = {},
  ): Promise<AxiosResponse<any, any>> {
    // POST requests are supported
    if (method === "POST") {
      return axios.post(url, body, {
        ...options,
        headers,
      });
    }
    // DELETE requests are supported
    if (method === "DELETE") {
      return axios.delete(url, {
        ...options,
        headers,
      });
    }

    // GET requests are supported
    return axios.get(url, {
      ...options,
      headers,
    });
  }
}
