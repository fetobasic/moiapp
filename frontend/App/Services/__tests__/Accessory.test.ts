import { AcsryTypes, AcsryLinkMode } from 'App/Config/Accessory';
import { isTankMode, isYetiLink, isYetiMPPT } from 'App/Services/Accessory';

describe('Accessory', () => {
  test('should be Yeti link', () => {
    const yetiLink = isYetiLink(AcsryTypes.YETI_LINK);

    expect(yetiLink).toBeTruthy();
  });

  test('should be Yeti MPPT', () => {
    const yetiMPPT = isYetiMPPT(AcsryTypes.YETI_MPPT);

    expect(yetiMPPT).toBeTruthy();
  });

  test('should be Tank mode', () => {
    const yetiTankMode = isTankMode(AcsryLinkMode.TANK_MODE);

    expect(yetiTankMode).toBeTruthy();
  });
});
