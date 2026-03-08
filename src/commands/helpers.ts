import { callSoap } from "../soap/client.js";
import { output, outputError } from "../output.js";

export async function handleHelpers(args: string[]): Promise<void> {
  const [action, arg1] = args;

  switch (action) {
    case "tin-lookup":
      if (!arg1) outputError("Usage: rs-cli helpers tin-lookup <tin>");
      output(await callSoap("get_name_from_tin", { tin: arg1 }));
      break;
    case "error-codes":
      output(await callSoap("get_error_codes", {}));
      break;
    case "check-user":
      output(await callSoap("chek_service_user", {}));
      break;
    case "service-users":
      output(await callSoap("get_service_users", {}));
      break;
    default:
      outputError(
        `Unknown helpers action: "${action}". Available: tin-lookup, error-codes, check-user, service-users`,
      );
  }
}
