import { callSoap, callSoapXml } from "../soap/client.js";
import { config } from "../config.js";
import { buildWaybillXml } from "../xml/waybill-builder.js";
import type { WaybillInput } from "../xml/waybill-builder.js";
import { output, outputError } from "../output.js";
import { confirm } from "../prompt.js";

type Flags = Record<string, string | boolean | undefined>;

async function destructive(
  description: string,
  flags: Flags,
  fn: () => Promise<unknown>,
): Promise<void> {
  if (!flags.yes) {
    const ok = await confirm(`${description} [y/N] `);
    if (!ok) { output({ cancelled: true }); return; }
  }
  output(await fn());
}

export async function handleWaybill(args: string[], flags: Flags): Promise<void> {
  const [action, arg1] = args;

  switch (action) {
    case "get": {
      if (!arg1) outputError("Usage: rs-cli waybill get <id>");
      output(await callSoap("get_waybill", { waybill_id: parseInt(arg1, 10) }));
      break;
    }

    case "list": {
      output(await callSoap("get_waybills", {
        itypes: flags.types as string,
        buyer_tin: flags["buyer-tin"] as string,
        statuses: flags.statuses as string,
        car_number: flags.car as string,
        begin_date_s: flags.from as string,
        begin_date_e: flags.to as string,
        create_date_s: flags["create-from"] as string,
        create_date_e: flags["create-to"] as string,
        driver_tin: flags["driver-tin"] as string,
        delivery_date_s: flags["delivery-from"] as string,
        delivery_date_e: flags["delivery-to"] as string,
        full_amount: flags.amount ? Number(flags.amount) : undefined,
        waybill_number: flags.number as string,
        close_date_s: flags["close-from"] as string,
        close_date_e: flags["close-to"] as string,
        s_user_ids: flags.users as string,
        comment: flags.comment as string,
      }));
      break;
    }

    case "buyer-list": {
      output(await callSoap("get_buyer_waybills", {
        itypes: flags.types as string,
        seller_tin: flags["seller-tin"] as string,
        statuses: flags.statuses as string,
        car_number: flags.car as string,
        begin_date_s: flags.from as string,
        begin_date_e: flags.to as string,
        create_date_s: flags["create-from"] as string,
        create_date_e: flags["create-to"] as string,
        driver_tin: flags["driver-tin"] as string,
        delivery_date_s: flags["delivery-from"] as string,
        delivery_date_e: flags["delivery-to"] as string,
        full_amount: flags.amount ? Number(flags.amount) : undefined,
        waybill_number: flags.number as string,
        close_date_s: flags["close-from"] as string,
        close_date_e: flags["close-to"] as string,
        s_user_ids: flags.users as string,
        comment: flags.comment as string,
      }));
      break;
    }

    case "list-updated": {
      if (!flags.from || !flags.to) outputError("Usage: rs-cli waybill list-updated --from <date> --to <date>");
      output(await callSoap("get_waybills_v1", {
        buyer_tin: flags["buyer-tin"] as string,
        last_update_date_s: flags.from as string,
        last_update_date_e: flags.to as string,
      }));
      break;
    }

    case "list-ex": {
      if (flags.confirmed === undefined) outputError("Usage: rs-cli waybill list-ex --confirmed <0|1>");
      output(await callSoap("get_waybills_ex", {
        itypes: flags.types as string,
        buyer_tin: flags["buyer-tin"] as string,
        statuses: flags.statuses as string,
        car_number: flags.car as string,
        begin_date_s: flags.from as string,
        begin_date_e: flags.to as string,
        is_confirmed: Number(flags.confirmed),
      }));
      break;
    }

    case "buyer-list-ex": {
      if (flags.confirmed === undefined) outputError("Usage: rs-cli waybill buyer-list-ex --confirmed <0|1>");
      output(await callSoap("get_buyer_waybills_ex", {
        itypes: flags.types as string,
        seller_tin: flags["seller-tin"] as string,
        statuses: flags.statuses as string,
        car_number: flags.car as string,
        begin_date_s: flags.from as string,
        begin_date_e: flags.to as string,
        is_confirmed: Number(flags.confirmed),
      }));
      break;
    }

    case "save": {
      if (!flags["buyer-tin"] || !flags["buyer-name"] || !flags["begin-date"] ||
          !flags["seller-id"] || !flags["trans-id"] || !flags.type ||
          !flags.start || !flags.end || !flags["driver-tin"] || !flags["driver-name"] ||
          !flags.goods) {
        outputError(
          "Usage: rs-cli waybill save --type <n> --buyer-tin <tin> --buyer-name <name> " +
          "--start <addr> --end <addr> --driver-tin <tin> --driver-name <name> " +
          "--begin-date <date> --status <n> --seller-id <n> --trans-id <n> --goods <json>",
        );
      }
      const goodsList = JSON.parse(flags.goods as string);
      const input: WaybillInput = {
        id: flags.id ? Number(flags.id) : undefined,
        type: Number(flags.type),
        buyer_tin: flags["buyer-tin"] as string,
        buyer_name: flags["buyer-name"] as string,
        start_address: flags.start as string,
        end_address: flags.end as string,
        driver_tin: flags["driver-tin"] as string,
        driver_name: flags["driver-name"] as string,
        begin_date: flags["begin-date"] as string,
        status: flags.status ? Number(flags.status) : 0,
        seler_un_id: Number(flags["seller-id"]),
        trans_id: Number(flags["trans-id"]),
        car_number: flags.car as string,
        comment: flags.comment as string,
        goods_list: goodsList,
      };
      const xml = buildWaybillXml(input);
      await destructive(`Save waybill (type ${input.type}, buyer ${input.buyer_tin})?`, flags, () =>
        callSoapXml("save_waybill", { seler_un_id: config.userId }, { xmlWaybill: xml }),
      );
      break;
    }

    case "send": {
      if (!arg1) outputError("Usage: rs-cli waybill send <id> [--begin-date <date>]");
      const id = parseInt(arg1, 10);
      if (flags["begin-date"]) {
        await destructive(`Activate waybill #${id} with begin date ${flags["begin-date"]}?`, flags, () =>
          callSoap("send_waybill_vd", { waybill_id: id, begin_date: flags["begin-date"] as string }),
        );
      } else {
        await destructive(`Activate waybill #${id}?`, flags, () =>
          callSoap("send_waybill", { waybill_id: id }),
        );
      }
      break;
    }

    case "confirm": {
      if (!arg1) outputError("Usage: rs-cli waybill confirm <id>");
      const id = parseInt(arg1, 10);
      await destructive(`Confirm receipt of waybill #${id}?`, flags, () =>
        callSoap("confirm_waybill", { waybill_id: id }),
      );
      break;
    }

    case "reject": {
      if (!arg1) outputError("Usage: rs-cli waybill reject <id>");
      const id = parseInt(arg1, 10);
      await destructive(`Reject waybill #${id}?`, flags, () =>
        callSoap("reject_waybill", { waybill_id: id }),
      );
      break;
    }

    case "close": {
      if (!arg1) outputError("Usage: rs-cli waybill close <id> [--delivery-date <date>]");
      const id = parseInt(arg1, 10);
      if (flags["delivery-date"]) {
        await destructive(`Close waybill #${id} with delivery date ${flags["delivery-date"]}?`, flags, () =>
          callSoap("close_waybill_vd", { waybill_id: id, delivery_date: flags["delivery-date"] as string }),
        );
      } else {
        await destructive(`Close waybill #${id}?`, flags, () =>
          callSoap("close_waybill", { waybill_id: id }),
        );
      }
      break;
    }

    case "delete": {
      if (!arg1) outputError("Usage: rs-cli waybill delete <id>");
      const id = parseInt(arg1, 10);
      await destructive(`Delete waybill #${id}?`, flags, () =>
        callSoap("del_waybill", { waybill_id: id }),
      );
      break;
    }

    case "cancel": {
      if (!arg1) outputError("Usage: rs-cli waybill cancel <id>");
      const id = parseInt(arg1, 10);
      await destructive(`Cancel waybill #${id}?`, flags, () =>
        callSoap("ref_waybill", { waybill_id: id }),
      );
      break;
    }

    default:
      outputError(
        `Unknown waybill action: "${action}". Available: get, list, buyer-list, list-updated, list-ex, buyer-list-ex, save, send, confirm, reject, close, delete, cancel`,
      );
  }
}
