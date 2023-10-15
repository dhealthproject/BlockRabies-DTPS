/**
 * This file is part of dHealth dApps Framework shared under LGPL-3.0
 * Copyright (C) 2023-present dHealth Network, All rights reserved.
 *
 * @package     BlockRabies DTPS
 * @author      dHealth Network <devs@dhealth.foundation>
 * @license     LGPL-3.0
 */
// external dependencies
import {debug} from "firebase-functions/logger";
import {
  NetworkCurrencies,
  NetworkType,
  RepositoryFactoryConfig,
  RepositoryFactoryHttp,
} from "@dhealth/sdk";

// internal dependencies
import {HttpRequestHandler} from "./HttpRequestHandler";

/**
 * @class NetworkService
 */
export class NetworkService {
  /**
   * The singleton instance of this class.
   *
   * @access private
   * @static
   * @var {NetworkService}
   */
  private static instance: NetworkService;

  /**
   * Default network api url.
   *
   * @access public
   * @readonly
   * @var {string}
   */
  public readonly networkApiUrl = "http://peers.dhealth.cloud:7903";

  /**
   * Default network api url.
   *
   * @access public
   * @readonly
   * @var {NetworkType}
   */
  public readonly NETWORK_TYPE = NetworkType.MAIN_NET;

  /**
   * Default network currency.
   *
   * @access public
   * @readonly
   * @var {NetworkCurrencies}
   */
  public readonly NETWORK_CURRENCY = NetworkCurrencies.PUBLIC;

  /**
   * Default network epoch adjustment.
   *
   * @access public
   * @readonly
   * @var {number}
   */
  public readonly EPOCH_ADJUSTMENT = 1616978397;

  /**
   * Default network generation hash.
   *
   * @access public
   * @readonly
   * @var {string}
   */
  public readonly GENERATION_HASH =
    "ED5761EA890A096C50D3F50B7C2F0CCB4B84AFC9EA870F381E84DDE36D04EF16";


  /**
   * The currently connected node.
   *
   * @access private
   * @var {NodeConnectionPayload}
   */
  private currentNode = "";

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
   * @return {NetworkService}
   */
  public static getInstance(): NetworkService {
    if (!this.instance) {
      this.instance = new NetworkService();
    }
    return this.instance;
  }

  /**
   * Connects to an available node.
   *
   * @access public
   * @async
   * @return {Promise<Record<string, any>>}
   */
  public async connectToAnAvailableNode(): Promise<Record<string, any>> {
    // prepares the connection parameters
    const nodeUrl = await this.getNextAvailableNode();
    const node = this.connectToNode(nodeUrl);
    debug(`Current node: ${this.currentNode}`);
    return node;
  }

  /**
   * Helper method to pick a **healthy** and available node
   * from the runtime configuration. If none of the configured
   * nodes is currently in a healthy state, this method will
   * use the {@link http://peers.dhealth.cloud:7903/network/nodes} endpoint
   * instead.
   * <br /><br />
   * Note that this method executes a call to the node's API
   * using the endpoint `/node/health` to determine the health
   * state of selected nodes. As of now, the nodes that are
   * added to the runtime configuration will be iterated in a
   * sequential and ascending order.
   *
   * @async
   * @access protected
   * @return {NodeConnectionPayload}
   */
  protected async getNextAvailableNode(): Promise<string> {
    // get http service
    const httpService = HttpRequestHandler.getInstance();

    // none of the configured nodes is currently in a healthy
    // state, we will now use the network-api to query for a
    // healthy and available node instead
    const healthyNodesResponse = await httpService.call(
        `${this.networkApiUrl}/network/nodes?health.apiNode=up&health.db=up`,
        "GET",
    );

    // get data from query response
    const healthyNodesResponseData = healthyNodesResponse.data.data as Record<
      string,
      string
    >[];

    // convert data to a list of functioning urls
    const healthyNodes: string[] = healthyNodesResponseData.map(
        (response: Record<string, string>) => `http://${response.host}:3000`
    );

    // if there exists a node, return it
    if (healthyNodes.length > 0) {
      return healthyNodes[0];
    }

    // fallback to current node
    return this.currentNode;
  }

  /**
   * Helper method that connects to a node's REST interface
   * using the SDK's `RepositoryFactoryHttp` class. Note that
   * the connection payload is *pre-configured* so that extra
   * requests are spared.
   *
   * @access protected
   * @param {string} nodeUrl
   * @return {Record<string, any>}
   */
  protected connectToNode(
      nodeUrl: string,
  ): Record<string, any> {
    // configures the repository factory
    const repositoryFactoryHttp = new RepositoryFactoryHttp(nodeUrl, {
      generationHash: this.GENERATION_HASH,
      epochAdjustment: this.EPOCH_ADJUSTMENT,
      networkType: this.NETWORK_TYPE,
      networkCurrencies: this.NETWORK_CURRENCY,
    } as RepositoryFactoryConfig);

    // store copy of connected node
    this.currentNode = nodeUrl;

    // retrieve repositories from factory
    return {
      transactionRepository:
        repositoryFactoryHttp.createTransactionRepository(),
      accountRepository: repositoryFactoryHttp.createAccountRepository(),
      blockRepository: repositoryFactoryHttp.createBlockRepository(),
      chainRepository: repositoryFactoryHttp.createChainRepository(),
      nodeRepository: repositoryFactoryHttp.createNodeRepository(),
    };
  }
}
