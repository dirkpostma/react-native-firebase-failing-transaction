/* eslint-env detox/detox, jest */

describe('Firebase', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('can create item after tap', async () => {
    await element(by.id('create_button')).tap();
    // await expect(element(by.text('Hello!!!'))).toBeVisible();
  });

  it('can delete item after tap', async () => {
    await element(by.id('delete_button')).tap();
    // await expect(element(by.text('Hello!!!'))).toBeVisible();
  });
});
