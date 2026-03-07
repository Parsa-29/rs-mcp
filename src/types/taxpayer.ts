export interface TPInfoPublic {
  TP_Code: string;
  TP_Type: number;
  TP_Name: string;
  TP_LegalForm: string;
  TP_Status: string;
  TP_StatusVat: number;
  TP_Address: string;
  TP_RegLocationId: string;
  TP_RegLocation: string;
}

export interface TPContacts {
  TP_InvoiceContactPhone: string;
  TP_InvoiceContactEmail: string;
  TP_WaybillContactPhone: string;
  TP_WaybillContactEmail: string;
}

export interface PayerStatus {
  SaidCode: string;
  Name: string;
  businessStatus: string;
  activityStatus: string;
  isVatDate: string;
}

export interface LegalPersonInfo {
  IdentificationCode: string;
  LegalForm: string;
  LegalFormId: string;
  LegalName: string;
  LegalAddress: string;
  LegalStatus: string;
  LegaStatisId: string;
  ResponsiblePersons?: { ResponsiblePerson: unknown | unknown[] };
}

export interface PersonIncomeData {
  PersonalNumber: string;
  YearlyAmount: number;
  MonthlyAmount: number;
  Category: number;
}

export interface ZReportDetails {
  DeviceNumber: string;
  ReportDate: string;
  Quantity: number;
  PaidAmount: number;
  PaidCash: number;
  PaidOther: number;
  ZNumber: number;
}

export interface WaybillMonthData {
  Amount: number;
  MontYear: string;
  ActionStatus: string;
  SellerBueyr: string;
}

export interface ActOfComparison {
  TaxName: string;
  StartMain: number;
  StartPenalty: number;
  StartPenaltyTax: number;
  StartSurplusOfCapital: number;
  LdutyMarkup: number;
  LdutyAddMarkup: number;
  LdutyBudgetPaid: number;
  EndtMain: number;
  EndPenalty: number;
  EndPenaltyTax: number;
  EndSurplusOfCapital: number;
  MarkupUnadmitted: number;
  DefAdmitted: number;
}

export interface ActOfComparisonOld {
  DESC: string;
  COL_1: number;
  COL_2: number;
  COL_3: number;
  COL_4: number;
  COL_5: number;
  COL_6: number;
  COL_7: number;
  COL_8: number;
  COL_9: number;
  COL_10: number;
  COL_11: number;
}

export interface CompCard {
  name: string;
  ficedCapital: number;
  fine: number;
  penaltyTax: number;
  surplus: number;
}

export interface MonthlyInfo {
  TaxPeriod: string;
  InfoType: number;
  Amount: number;
}

export interface GitaPayerData {
  payerCode: string;
  payerName: string;
  address: string;
  legalFrom: string;
  status: string;
  sezRest: string;
  vatRegDate: string;
  payerCurrStatus: string;
  payerAM: number;
  SL_COL_1: number;
  SL_COL_2: number;
  SL_COL_3: number;
  SL_COL_4: number;
}

export interface SmsActivateResult {
  StatusCode: number;
  StatusDescription: string;
}
