import { escapeXml } from "../soap/client.js";

export interface GoodsItem {
  id?: number;
  w_name: string;
  unit_id: number;
  unit_txt?: string;
  quantity: number;
  price: number;
  bar_code?: string;
  a_id?: number;
  vat_type?: number;
  quantity_ext?: number;
}

export interface WoodDocItem {
  id?: number;
  doc_n: string;
  doc_date: string;
  doc_desc: string;
}

export interface SubWaybillItem {
  id?: number;
  waybill_number: string;
}

export interface WaybillInput {
  id?: number;
  type: number;
  buyer_tin: string;
  chek_buyer_tin?: number;
  buyer_name: string;
  start_address: string;
  end_address: string;
  driver_tin: string;
  chek_driver_tin?: number;
  driver_name: string;
  transport_coast?: number;
  reception_info?: string;
  receiver_info?: string;
  delivery_date?: string;
  status: number;
  seler_un_id: number;
  par_id?: number;
  car_number?: string;
  waybill_number?: string;
  begin_date: string;
  tran_cost_payer?: number;
  trans_id: number;
  trans_txt?: string;
  comment?: string;
  category?: number;
  is_med?: number;
  goods_list: GoodsItem[];
  wood_docs_list?: WoodDocItem[];
  sub_waybills?: SubWaybillItem[];
}

function tag(name: string, value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === "") return "";
  return `<${name}>${escapeXml(String(value))}</${name}>`;
}

function buildGoods(goods: GoodsItem): string {
  return [
    "<GOODS>",
    tag("ID", goods.id ?? 0),
    tag("W_NAME", goods.w_name),
    tag("UNIT_ID", goods.unit_id),
    tag("UNIT_TXT", goods.unit_txt),
    tag("QUANTITY", goods.quantity),
    tag("PRICE", goods.price),
    tag("AMOUNT", +(goods.quantity * goods.price).toFixed(4)),
    tag("BAR_CODE", goods.bar_code),
    tag("A_ID", goods.a_id),
    tag("VAT_TYPE", goods.vat_type),
    tag("QUANTITY_EXT", goods.quantity_ext),
    "</GOODS>",
  ]
    .filter(Boolean)
    .join("");
}

function buildWoodDoc(doc: WoodDocItem): string {
  return [
    "<WOODDOCUMENT>",
    tag("ID", doc.id ?? 0),
    tag("DOC_N", doc.doc_n),
    tag("DOC_DATE", doc.doc_date),
    tag("DOC_DESC", doc.doc_desc),
    "</WOODDOCUMENT>",
  ].join("");
}

function buildSubWaybill(sub: SubWaybillItem): string {
  return [
    "<SUB_WAYBILL>",
    tag("ID", sub.id ?? 0),
    tag("WAYBILL_NUMBER", sub.waybill_number),
    "</SUB_WAYBILL>",
  ].join("");
}

export function buildWaybillXml(input: WaybillInput): string {
  const goodsXml = input.goods_list.map(buildGoods).join("");
  const woodDocsXml = input.wood_docs_list?.map(buildWoodDoc).join("") ?? "";
  const subWaybillsXml = input.sub_waybills?.map(buildSubWaybill).join("") ?? "";

  return [
    "<WAYBILL>",
    tag("ID", input.id ?? 0),
    tag("TYPE", input.type),
    tag("BUYER_TIN", input.buyer_tin),
    tag("CHEK_BUYER_TIN", input.chek_buyer_tin),
    tag("BUYER_NAME", input.buyer_name),
    tag("START_ADDRESS", input.start_address),
    tag("END_ADDRESS", input.end_address),
    tag("DRIVER_TIN", input.driver_tin),
    tag("CHEK_DRIVER_TIN", input.chek_driver_tin),
    tag("DRIVER_NAME", input.driver_name),
    tag("TRANSPORT_COAST", input.transport_coast),
    tag("RECEPTION_INFO", input.reception_info),
    tag("RECEIVER_INFO", input.receiver_info),
    tag("DELIVERY_DATE", input.delivery_date),
    tag("STATUS", input.status),
    tag("SELER_UN_ID", input.seler_un_id),
    tag("PAR_ID", input.par_id),
    tag("CAR_NUMBER", input.car_number),
    tag("WAYBILL_NUMBER", input.waybill_number),
    tag("BEGIN_DATE", input.begin_date),
    tag("TRAN_COST_PAYER", input.tran_cost_payer),
    tag("TRANS_ID", input.trans_id),
    tag("TRANS_TXT", input.trans_txt),
    tag("COMMENT", input.comment),
    tag("CATEGORY", input.category),
    tag("IS_MED", input.is_med),
    `<GOODS_LIST>${goodsXml}</GOODS_LIST>`,
    woodDocsXml ? `<WOOD_DOCS_LIST>${woodDocsXml}</WOOD_DOCS_LIST>` : "",
    subWaybillsXml ? `<SUB_WAYBILLS>${subWaybillsXml}</SUB_WAYBILLS>` : "",
    "</WAYBILL>",
  ]
    .filter(Boolean)
    .join("");
}
