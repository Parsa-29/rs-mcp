export interface Invoice {
  id: number;
  f_series: string;
  f_number: number;
  operation_dt: string;
  reg_dt: string;
  seller_un_id: number;
  buyer_un_id: number;
  overhead_no: string;
  overhead_dt: string;
  status: number;
  seq_num_s: string;
  seq_num_b: string;
  k_id: number;
  r_un_id: number;
  k_type: number;
  b_s_user_id: number;
  dec_status: number;
}

export interface InvoiceListItem {
  Id: number;
  f_series: string;
  f_number: number;
  operation_dt: string;
  reg_dt: string;
  seller_un_id: number;
  buyer_un_id: number;
  overhead_no?: string;
  status: number;
  seq_num_s?: string;
  user_id: number;
  s_user_id: number;
  k_id?: number;
  k_type?: number;
  r_un_id?: number;
  no_status?: number;
  no_text?: string;
  was_ref: number;
  seq_num_b?: string;
  invoice_id?: number;
  doc_mos_nom_s?: string;
  doc_mos_nom_b?: string;
  overhead_dt?: string;
  b_s_user_id?: number;
  sa_ident_no?: string;
  org_name?: string;
  notes?: string;
}

export interface UserInvoiceListItem {
  Id: number;
  seller_un_id: number;
  buyer_un_id: number;
  status: number;
  was_ref: number;
  ref_s_user_id?: number;
  ref_date?: string;
  f_series: string;
  f_number: number;
  reg_dt: string;
  operation_dt: string;
  s_user_id: number;
  saident_no_s?: string;
  org_name_s?: string;
  saident_no_b?: string;
  org_name_b?: string;
  tanxa?: number;
  k_id?: number;
  agree_date?: string;
  agree_s_user_id?: number;
  notes?: string;
  last_update_date?: string;
}

export interface InvoiceDesc {
  id: number;
  inv_id: number;
  goods: string;
  g_unit: string;
  g_number: number;
  full_amount: number;
  drg_amount: number;
  aqcizi_amount: number;
  akcis_id: number;
  sdrg_amount?: string;
}

export interface InvoiceWaybillLink {
  id: number;
  inv_id: number;
  overhead_no: string;
  overhead_dt: string;
}

export interface InvoiceAkcizItem {
  Id: number;
  Title: string;
  Measurement: string;
  sakon_kodi: string;
  akcis_ganakv: number;
}

export interface InvoiceServiceUser {
  Id: number;
  user_name: string;
  user_id: number;
  ip: string;
  notes: string;
}
