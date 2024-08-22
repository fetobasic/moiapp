export type FirmwareUpdateStateType = {
  fetching?: boolean;
  scheduling?: boolean;
  updating?: boolean;

  fetchError?: string | null;
  scheduleError?: string | null;
  updateError?: string | null;

  jobId?: string | null;
  info?: FirmwareVersion | UpdateFirmwareResponse | null;
  progress?: number;
  successUpdated: boolean;
};

export type FirmwareUpdateDataType = { [key: string]: FirmwareUpdateStateType };

export type UpdateFirmwareResponse = {
  jobId: string | null;
  newVersion: string;
};

export type FirmwareVersion = {
  version: string;
  date: string;
  url?: string;
  urlSignature?: string;
  keyId?: string;
};

export type Firmware6GVersion = {
  version: string;
  date: string;
};

export type StartOtaResponse = {
  msg: string;
};
