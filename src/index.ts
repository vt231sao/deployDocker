export interface UserProfile {
    id: string;
    name: string;
    email: string;
}
export const delay = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms ));
};
export async function fetchUserProfiles(userIds: string[]): Promise<UserProfile[]> {
    if (userIds.length === 0) return [];

    const promises = userIds.map(async (id) => {
        const randomDelay = Math.floor(Math.random() * (1500 - 50 + 1)) + 50;
        await delay(randomDelay);
        return {
            id,
            name: `User ${id}`,
            email: `user_${id}@test.ua`
        };
    });

    return Promise.all(promises);
}
export async function retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3
): Promise<T> {
    let lastError: any;

    for (let i = 1; i <= maxRetries; i++) {
        try {
            console.log(`Спроба ${i}...`);
            return await operation();
        } catch (error) {
            lastError = error;
            if (i < maxRetries) {
                await delay(150);
            }
        }
    }
    throw lastError;
}
export async function processInBatches<T, R>(
    items: T[],
    batchSize: number,
    processor: (batch: T[]) => Promise<R[]>
): Promise<R[]> {
    const results: R[] = [];
    const totalBatches = Math.ceil(items.length / batchSize);

    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;
        console.log(`Обробка партії ${batchNumber}/${totalBatches}...`);

        if (batchNumber === 1) {
            results.push(...(batch as unknown as R[]));
        } else {
            const processed = await processor(batch);
            results.push(...processed);
        }
    }
    return results;
}
export async function raceWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
            const err = new Error(`Operation timed out after ${timeoutMs}ms`);
            (err as any).timeoutMs = timeoutMs;
            reject(err);
        }, timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
}