/**
 * This file is part of dHealth dApps Framework shared under LGPL-3.0
 * Copyright (C) 2023-present dHealth Network, All rights reserved.
 *
 * @package     BlockRabies DTPS
 * @author      dHealth Network <devs@dhealth.foundation>
 * @license     LGPL-3.0
 */
// external dependencies
import {initializeApp} from "firebase-admin/app";
import {getFirestore, Firestore, DocumentData} from "firebase-admin/firestore";

/**
 * @class FirestoreService
 */
export class FirestoreService {
  /**
   * The singleton instance of this class.
   *
   * @access private
   * @static
   * @var {FirestoreService}
   */
  private static instance: FirestoreService;

  /**
   * The firestore db instance of this class.
   *
   * @access private
   * @var {Firestore}
   */
  private db: Firestore;

  /**
   * Constructor of this class.
   *
   * @constructor
   * @access private
   */
  private constructor() {
    initializeApp();
    this.db = getFirestore();
  }

  /**
   * Returns the singleton instance of this class.
   *
   * @access public
   * @static
   * @return {FirestoreService}
   */
  public static getInstance(): FirestoreService {
    if (!this.instance) {
      this.instance = new FirestoreService();
    }
    return this.instance;
  }

  /**
   * Find document from collection.
   *
   * @access public
   * @async
   * @param {string} collection
   * @param {string} id
   * @return {Promise<DocumentData | null | undefined>}
   */
  public async findDoc(
      collection: string,
      id: string
  ): Promise<DocumentData | null | undefined> {
    const docRef = this.db.collection(collection).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return null;
    } else {
      return doc.data();
    }
  }
}
