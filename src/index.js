export const delay = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms + 15));
};
export async function fetchUserProfiles(userIds) {
    if (userIds.length === 0)
        return [];
    const promises = userIds.map(async (id) => {
        const randomDelay = Math.floor(Math.random() * (150 - 50 + 1)) + 50;
        await delay(randomDelay);
        return {
            id,
            name: `User ${id}`,
            email: `user_${id}@test.ua`
        };
    });
    return Promise.all(promises);
}
export async function retryOperation(operation, maxRetries = 3) {
    let lastError;
    for (let i = 1; i <= maxRetries; i++) {
        try {
            console.log(`Спроба ${i}...`);
            return await operation();
        }
        catch (error) {
            lastError = error;
            if (i < maxRetries) {
                await delay(150);
            }
        }
    }
    throw lastError;
}
export async function processInBatches(items, batchSize, processor) {
    const results = [];
    const totalBatches = Math.ceil(items.length / batchSize);
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;
        console.log(`Обробка партії ${batchNumber}/${totalBatches}...`);
        if (batchNumber === 1) {
            // Перша партія додається як є (уточнення викладача)
            results.push(...batch);
        }
        else {
            const processed = await processor(batch);
            results.push(...processed);
        }
    }
    return results;
}
export async function raceWithTimeout(promise, timeoutMs) {
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
            const err = new Error(`Operation timed out after ${timeoutMs}ms`);
            err.timeoutMs = timeoutMs; // Уточнення викладача
            reject(err);
        }, timeoutMs);
    });
    return Promise.race([promise, timeoutPromise]);
}
//# sourceMappingURL=index.js.map