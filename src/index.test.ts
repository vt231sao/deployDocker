import { jest } from '@jest/globals';
import { fetchUserProfiles, retryOperation, processInBatches, raceWithTimeout, delay } from './index.js';

describe('Асинхронні функції', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    describe('fetchUserProfiles', () => {
        it('повинен повертати порожній масив, якщо userIds порожній', async () => {
            const result = await fetchUserProfiles([]);
            expect(result).toEqual([]);
        });

        it('повинен завантажувати профілі користувачів', async () => {
            const promise = fetchUserProfiles(['1', '2']);

            await jest.runAllTimersAsync();

            const result = await promise;
            expect(result).toHaveLength(2);
            expect(result[0].id).toBe('1');
            expect(result[0].email).toBe('user_1@test.ua');
        });
    });

    describe('retryOperation', () => {
        it('успішно виконується з першої спроби', async () => {
            const op = jest.fn<() => Promise<string>>().mockResolvedValue('Success');
            const result = await retryOperation(op, 3);
            expect(result).toBe('Success');
            expect(op).toHaveBeenCalledTimes(1);
        });

        it('повторює операцію при помилці', async () => {
            const op = jest.fn<() => Promise<string>>()
                .mockRejectedValueOnce(new Error('Fail'))
                .mockResolvedValueOnce('Success');

            const promise = retryOperation(op, 3);

            await jest.runAllTimersAsync();

            const result = await promise;
            expect(result).toBe('Success');
            expect(op).toHaveBeenCalledTimes(2);
        });

        it('використовує дефолтне значення maxRetries=3', async () => {
            const op = jest.fn<() => Promise<string>>().mockRejectedValue(new Error('Fail'));

            const promise = retryOperation(op);

            await jest.runAllTimersAsync();

            await expect(promise).rejects.toThrow('Fail');
            expect(op).toHaveBeenCalledTimes(3);
        });
    });

    describe('processInBatches', () => {
        it('повинна обробляти дані партіями (перша партія без обробки)', async () => {
            const items = [1, 2, 3, 4];

            const processor = jest.fn<any>().mockImplementation(async (batch: number[]) => {
                await delay(50);
                return batch.map(n => n * 2);
            });

            const promise = processInBatches(items, 2, processor);

            await jest.runAllTimersAsync();

            const result = await promise;

            expect(result).toEqual([1, 2, 6, 8]);
            expect(processor).toHaveBeenCalledTimes(1);
        });
    });

    describe('raceWithTimeout', () => {
        it('успішно повертає результат, якщо вкластися в час', async () => {
            const fastPromise = delay(50).then(() => 'Done');
            const promise = raceWithTimeout(fastPromise, 100);

            await jest.runAllTimersAsync();

            const result = await promise;
            expect(result).toBe('Done');
        });

        it('викидає помилку з timeoutMs при перевищенні часу', async () => {
            const slowPromise = new Promise<string>(() => {});
            const promise = raceWithTimeout(slowPromise, 100);

            await jest.runAllTimersAsync();

            try {
                await promise;
                expect(true).toBe(false);
            } catch (err: any) {
                expect(err.message).toBe('Operation timed out after 100ms');
                expect(err.timeoutMs).toBe(100);
            }
        });
    });
});