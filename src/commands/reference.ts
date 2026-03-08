import { callSoap } from "../soap/client.js";
import { output, outputError } from "../output.js";

export async function handleReference(args: string[]): Promise<void> {
  const [action] = args;

  switch (action) {
    case "waybill-types":
      output(await callSoap("get_waybill_types", {}));
      break;
    case "units":
      output(await callSoap("get_waybill_units", {}));
      break;
    case "transport-types":
      output(await callSoap("get_trans_types", {}));
      break;
    case "akciz-codes":
      output(await callSoap("get_akciz_codes", {}));
      break;
    case "wood-types":
      output(await callSoap("get_wood_types", {}));
      break;
    default:
      outputError(
        `Unknown reference action: "${action}". Available: waybill-types, units, transport-types, akciz-codes, wood-types`,
      );
  }
}
