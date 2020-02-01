/* eslint-env detox/detox, jest */

describe('Firebase', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('will pass transaction test', async () => {
    await element(by.id('test_transaction_button')).tap();
    await waitFor(element(by.text('TEST PASSED')))
      .toBeVisible()
      .withTimeout(3000);

    await expect(element(by.text('TEST PASSED'))).toBeVisible();
  });
});
