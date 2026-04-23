export interface UserProfile {
    id: string;
    name: string;
    email: string;
}
export declare const delay: (ms: number) => Promise<void>;
export declare function fetchUserProfiles(userIds: string[]): Promise<UserProfile[]>;
export declare function retryOperation<T>(operation: () => Promise<T>, maxRetries?: number): Promise<T>;
export declare function processInBatches<T, R>(items: T[], batchSize: number, processor: (batch: T[]) => Promise<R[]>): Promise<R[]>;
export declare function raceWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T>;
//# sourceMappingURL=index.d.ts.map