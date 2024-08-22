import { wait } from 'App/Services/Wait';

describe('Wait', () => {
  test('Waits for the specified time', async () => {
    const start = Date.now();
    const delay = 1000;

    await wait(delay);

    const end = Date.now();
    const elapsed = end - start;

    expect(elapsed).toBeGreaterThanOrEqual(delay - 10);
    expect(elapsed).toBeLessThan(delay + 2000);
  });
});
