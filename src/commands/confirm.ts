import { executeAction, removePendingAction, listPendingActions } from "../confirm.js";
import { output, outputError } from "../output.js";

export async function handleConfirm(args: string[]): Promise<void> {
  const [action, arg1] = args;

  switch (action) {
    case "list": {
      const actions = listPendingActions().map((a) => ({
        action_id: a.id,
        action: a.description,
        method: a.method,
        params: a.params,
        remaining_ms: 5 * 60 * 1000 - (Date.now() - a.createdAt),
      }));
      output(actions);
      break;
    }

    case "execute":
      if (!arg1) outputError("Usage: rs-cli confirm execute <action-id>");
      output(await executeAction(arg1));
      break;

    case "reject":
      if (!arg1) outputError("Usage: rs-cli confirm reject <action-id>");
      output({ removed: removePendingAction(arg1) });
      break;

    default:
      outputError("Usage: rs-cli confirm <list|execute|reject> [action-id]");
  }
}
