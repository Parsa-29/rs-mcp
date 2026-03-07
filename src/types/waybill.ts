export interface WaybillGoods {
  ID: number;
  W_NAME: string;
  UNIT_ID: number;
  UNIT_TXT?: string;
  QUANTITY: number;
  PRICE: number;
  AMOUNT: number;
  BAR_CODE: string;
  A_ID?: number;
  STATUS?: number;
  VAT_TYPE?: number;
  QUANTITY_EXT?: number;
  WOOD_LABEL?: string;
  W_ID?: number;
}

export interface SubWaybill {
  ID: number;
  WAYBILL_NUMBER: string;
}

export interface WoodDocument {
  ID: number;
  DOC_N: string;
  DOC_DATE: string;
  DOC_DESC: string;
  STATUS: number;
}

export interface Waybill {
  ID: number;
  TYPE: number;
  CREATE_DATE?: string;
  BUYER_TIN?: string;
  CHEK_BUYER_TIN?: number;
  BUYER_NAME?: string;
  START_ADDRESS?: string;
  END_ADDRESS?: string;
  DRIVER_TIN?: string;
  CHEK_DRIVER_TIN?: number;
  DRIVER_NAME?: string;
  TRANSPORT_COAST?: number;
  RECEPTION_INFO?: string;
  RECEIVER_INFO?: string;
  DELIVERY_DATE?: string;
  STATUS: number;
  SELER_UN_ID?: number;
  ACTIVATE_DATE?: string;
  PAR_ID?: number;
  FULL_AMOUNT?: number;
  CAR_NUMBER?: string;
  WAYBILL_NUMBER?: string;
  CLOSE_DATE?: string;
  S_USER_ID?: number;
  BEGIN_DATE?: string;
  TRAN_COST_PAYER?: number;
  TRANS_ID?: number;
  TRANS_TXT?: string;
  COMMENT?: string;
  CATEGORY?: string;
  IS_MED?: string;
  GOODS_LIST?: { GOODS: WaybillGoods | WaybillGoods[] };
  SUB_WAYBILLS?: { SUB_WAYBILL: SubWaybill | SubWaybill[] };
  WOOD_DOCS_LIST?: { WOODDOCUMENT: WoodDocument | WoodDocument[] };
}

export interface WaybillListItem {
  ID: number;
  TYPE: number;
  CREATE_DATE?: string;
  BUYER_NAME?: string;
  SELLER_NAME?: string;
  SELLER_TIN?: string;
  START_ADDRESS?: string;
  END_ADDRESS?: string;
  DRIVER_TIN?: string;
  TRANSPORT_COAST?: number;
  RECEPTION_INFO?: string;
  RECEIVER_INFO?: string;
  DELIVERY_DATE?: string;
  STATUS: number;
  ACTIVATE_DATE?: string;
  PAR_ID?: number;
  FULL_AMOUNT?: number;
  CAR_NUMBER?: string;
  WAYBILL_NUMBER?: string;
  CLOSE_DATE?: string;
  S_USER_ID?: number;
  BEGIN_DATE?: string;
  WAYBILL_COMMENT?: string;
  BUYER_ST?: number;
  SELLER_ST?: number;
}

export interface ServiceUser {
  ID: number;
  USER_NAME: string;
  UN_ID: number;
  IP: string;
  NAME: string;
}

export interface ErrorCode {
  ID: number;
  TEXT: string;
  TYPE: number;
}
