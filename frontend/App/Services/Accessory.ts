import { AcsryTypes, AcsryLinkMode } from 'App/Config/Accessory';

export const isYetiLink = (model?: string) => model?.startsWith(AcsryTypes.YETI_LINK);
export const isYetiMPPT = (model?: string) => model?.startsWith(AcsryTypes.YETI_MPPT);
export const isTankMode = (mode?: number) => mode === AcsryLinkMode.TANK_MODE;
