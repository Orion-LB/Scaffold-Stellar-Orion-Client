/**
 * A typed wrapper around localStorage
 * Provides a fully-typed interface to localStorage
 */

/**
 * Valid localStorage key names mapped to their types
 */
type Schema = {
  walletId: string;
  walletAddress: string;
  walletNetwork: string;
  networkPassphrase: string;
};

/**
 * Typed interface that follows the Web Storage API
 */
class TypedStorage<T> {
  private readonly storage: Storage;

  constructor() {
    this.storage = typeof window !== 'undefined' ? localStorage : ({} as Storage);
  }

  public get length(): number {
    return this.storage?.length || 0;
  }

  public key<U extends keyof T>(index: number): U {
    return this.storage?.key(index) as U;
  }

  public getItem<U extends keyof T>(
    key: U,
    retrievalMode: "fail" | "raw" | "safe" = "fail",
  ): T[U] | null {
    const item = this.storage?.getItem(key.toString());

    if (item == null) {
      return null;
    }

    try {
      return JSON.parse(item) as T[U];
    } catch (error) {
      switch (retrievalMode) {
        case "safe":
          return null;
        case "raw":
          return item as unknown as T[U];
        default:
          throw error;
      }
    }
  }

  public setItem<U extends keyof T>(key: U, value: T[U]): void {
    this.storage?.setItem(key.toString(), JSON.stringify(value));
  }

  public removeItem<U extends keyof T>(key: U): void {
    this.storage?.removeItem(key.toString());
  }

  public clear(): void {
    this.storage?.clear();
  }
}

/**
 * Fully-typed wrapper around localStorage
 */
export default new TypedStorage<Schema>();
