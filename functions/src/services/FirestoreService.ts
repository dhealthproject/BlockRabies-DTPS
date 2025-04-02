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
import {
  getFirestore,
  Firestore,
  DocumentData,
  WhereFilterOp,
  Query,
  QuerySnapshot,
  WriteResult,
} from "firebase-admin/firestore";

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

  /**
   * Add document to collection.
   *
   * @access public
   * @async
   * @param {string} collection
   * @param {Record<string, unknown>} data
   * @return {string}
   */
  public async addDoc(
      collection: string,
      data: Record<string, unknown>
  ): Promise<string> {
    const docRef = this.db.collection(collection).doc();
    await docRef.set(data);
    return docRef.id;
  }

  /**
   * Update document in collection.
   *
   * @access public
   * @async
   * @param {string} collection
   * @param {string} id
   * @param {Record<string, unknown>} data
   * @return {Promise<FirebaseFirestore.WriteResult>}
   */
  public async updateDoc(
      collection: string,
      id: string,
      data: Record<string, unknown>
  ): Promise<FirebaseFirestore.WriteResult> {
    const docRef = this.db.collection(collection).doc(id);
    const result = await docRef.update(data);
    return result;
  }

  /**
   * Query document in collection.
   *
   * @access public
   * @async
   * @param {string} collection
   * @param {string} fieldPath
   * @param {WhereFilterOp} opString
   * @param {unknown} value
   * @param {string} orderBy
   * @param {number} limit
   * @return {Promise<QuerySnapshot<DocumentData>>}
   */
  public async queryDoc(
      collection: string,
      fieldPath: string,
      opString: WhereFilterOp,
      value: unknown,
      orderBy?: string,
      limit?: number
  ): Promise<QuerySnapshot<DocumentData>> {
    let docRef: Query<DocumentData> = this.db.collection(collection);
    if (fieldPath !== null && opString != null && value != null) {
      docRef = docRef.where(fieldPath, opString, value);
    }
    if (orderBy) {
      docRef = docRef.orderBy(orderBy);
    }
    if (limit) {
      docRef = docRef.limit(limit);
    }
    return await docRef.get();
  }

  /**
   * Acquire a lock for a document.
   *
   * @access public
   * @async
   * @param {string} lockPath
   * @return {Promise<FirebaseFirestore.WriteResult>}
   */
  public async acquireLock(
      lockPath: string
  ): Promise<FirebaseFirestore.WriteResult> {
    const lockDoc = this.db.doc(lockPath);
    const now = Date.now();

    // Try to acquire the lock
    const lock = await lockDoc.get();
    if (lock.exists && lock.data()?.expiresAt > now) {
      throw new Error("Lock is already held");
    }

    // Set the lock
    return await lockDoc.set({
      expiresAt: now + 10000,
    }); // Lock expires in 10 seconds
  }

  /**
   * Release lock for a document.
   *
   * @access public
   * @async
   * @param {string} lockPath
   * @return {Promise<WriteResult>}
   */
  public async releaseLock(lockPath: string): Promise<WriteResult> {
    return await this.db.doc(lockPath).delete();
  }
}
