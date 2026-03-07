import "dotenv/config";

export const config = {
  su: process.env.RS_SU ?? "",
  sp: process.env.RS_SP ?? "",
  baseUrl:
    process.env.RS_BASE_URL ??
    "https://services.rs.ge/WayBillService/WayBillService.asmx",
  invoiceUrl:
    process.env.RS_INVOICE_URL ??
    "https://www.revenue.mof.ge/ntosservice/ntosservice.asmx",
  userId: parseInt(process.env.RS_USER_ID ?? "0", 10),
  taxUrl:
    process.env.RS_TAX_URL ??
    "https://services.rs.ge/taxservice/taxpayerservice.asmx",
} as const;
