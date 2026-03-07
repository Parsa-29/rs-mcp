import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerReferenceTools } from "./tools/reference.js";
import { registerWaybillTools } from "./tools/waybill.js";
import { registerHelperTools } from "./tools/helpers.js";
import { registerInvoiceTools } from "./tools/invoice.js";
import { registerInvoiceQueryTools } from "./tools/invoice-query.js";
import { registerInvoiceDescTools } from "./tools/invoice-desc.js";
import { registerInvoiceHelperTools } from "./tools/invoice-helpers.js";
import { registerConfirmTools } from "./tools/confirm.js";
import { registerWaybillWriteTools } from "./tools/waybill-write.js";
import { registerTaxpayerTools } from "./tools/taxpayer.js";
import { registerTaxpayerReportTools } from "./tools/taxpayer-reports.js";
import { registerTaxpayerAuthTools } from "./tools/taxpayer-auth.js";

const server = new McpServer({
  name: "rs-mcp",
  version: "1.0.0",
});

registerReferenceTools(server);
registerWaybillTools(server);
registerWaybillWriteTools(server);
registerHelperTools(server);
registerInvoiceTools(server);
registerInvoiceQueryTools(server);
registerInvoiceDescTools(server);
registerInvoiceHelperTools(server);
registerTaxpayerTools(server);
registerTaxpayerReportTools(server);
registerTaxpayerAuthTools(server);
registerConfirmTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);
