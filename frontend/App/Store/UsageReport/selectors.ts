import { RootState } from 'typesafe-actions';

export const getReportData = (state: RootState) => state.usageReport.reportData;
export const getReportUrl = (state: RootState) => state.usageReport.reportUrl;
