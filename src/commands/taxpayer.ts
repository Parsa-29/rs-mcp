import { callTaxSoap } from "../soap/tax-client.js";
import { config } from "../config.js";
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

export async function handleTaxpayer(args: string[], flags: Flags): Promise<void> {
  const [action, arg1] = args;
  const su = config.su;
  const sp = config.sp;

  switch (action) {
    case "info":
      if (!arg1) outputError("Usage: rs-cli taxpayer info <tin>");
      output(await callTaxSoap("GetTPInfoPublic", { Username: su, Password: sp, TP_Code: arg1 }));
      break;

    case "contacts":
      if (!arg1) outputError("Usage: rs-cli taxpayer contacts <tin>");
      output(await callTaxSoap("GetTPInfoPublicContacts", { Username: su, Password: sp, TP_Code: arg1 }));
      break;

    case "payer":
      if (!arg1) outputError("Usage: rs-cli taxpayer payer <code>");
      output(await callTaxSoap("Get_Payer_Info", { userName: su, password: sp, saidCode: arg1 }));
      break;

    case "legal":
      if (!arg1) outputError("Usage: rs-cli taxpayer legal <code>");
      output(await callTaxSoap("Get_LegalPerson_Info", { inUserName: su, inPassword: sp, inSaidCode: arg1 }));
      break;

    case "income":
      if (!arg1) outputError("Usage: rs-cli taxpayer income <personal-number>");
      output(await callTaxSoap("GetPersonIncomeData", { inUserName: su, inPassword: sp, inPersonalNumber: arg1 }));
      break;

    case "nace":
      if (!arg1) outputError("Usage: rs-cli taxpayer nace <code>");
      output(await callTaxSoap("Get_Payer_Nace_Info", { inUserName: su, inPassword: sp, inSaidCode: arg1 }));
      break;

    case "income-amount":
      if (!flags.year) outputError("Usage: rs-cli taxpayer income-amount --year <n>");
      output(await callTaxSoap("Get_Income_Amount", { UserName: su, Password: sp, Year: Number(flags.year) }));
      break;

    case "gita":
      if (!arg1 || !flags.from || !flags.to)
        outputError("Usage: rs-cli taxpayer gita <code> --from <date> --to <date>");
      output(await callTaxSoap("get_payer_info_gita", {
        userName: su, password: sp,
        payerCode: arg1,
        startDate: flags.from as string,
        endDate: flags.to as string,
      }));
      break;

    case "sms-verify":
      if (!arg1 || !flags.sms)
        outputError("Usage: rs-cli taxpayer sms-verify <said-code> --sms <code>");
      output(await callTaxSoap("Tp_sms_verification", {
        userName: su, password: sp,
        saidCode: arg1,
        smsCode: flags.sms as string,
      }));
      break;

    case "gita-sms-verify":
      if (!arg1 || !flags.sms)
        outputError("Usage: rs-cli taxpayer gita-sms-verify <payer-code> --sms <code>");
      output(await callTaxSoap("Gita_Sms_Verification", {
        userName: su, password: sp,
        payerCode: arg1,
        smsCode: flags.sms as string,
      }));
      break;

    case "activate":
      if (!arg1 || flags.status === undefined)
        outputError("Usage: rs-cli taxpayer activate <said-code> --status <0|1>");
      await destructive(`Set payer info access status ${flags.status} for ${arg1}?`, flags, () =>
        callTaxSoap("Payer_Info_Activation", {
          userName: su, password: sp,
          saidCode: arg1,
          status: Number(flags.status),
        }),
      );
      break;

    case "gita-activate":
      if (!arg1 || !flags.from || flags.status === undefined)
        outputError("Usage: rs-cli taxpayer gita-activate <payer-code> --from <date> --status <0|1>");
      await destructive(`Activate GITA payer access for ${arg1}?`, flags, () =>
        callTaxSoap("Gita_Payer_Activation", {
          userName: su, password: sp,
          payerCode: arg1,
          startDate: flags.from as string,
          status: Number(flags.status),
        }),
      );
      break;

    case "z-report":
      if (!flags.from || !flags.to)
        outputError("Usage: rs-cli taxpayer z-report --from <date> --to <date>");
      output(await callTaxSoap("Get_Z_Report_Sum", {
        UserName: su, Password: sp,
        StartDate: flags.from as string,
        EndDate: flags.to as string,
      }));
      break;

    case "z-report-details":
      if (!flags.from || !flags.to)
        outputError("Usage: rs-cli taxpayer z-report-details --from <date> --to <date>");
      output(await callTaxSoap("Get_Z_Report_Details", {
        UserName: su, Password: sp,
        StartDate: flags.from as string,
        EndDate: flags.to as string,
      }));
      break;

    case "waybill-amounts":
      if (!arg1 || !flags.from || !flags.to)
        outputError("Usage: rs-cli taxpayer waybill-amounts <said-code> --from <date> --to <date>");
      output(await callTaxSoap("Get_Waybill_Month_Amount", {
        userName: su, password: sp,
        saidCode: arg1,
        startDate: flags.from as string,
        endDate: flags.to as string,
      }));
      break;

    case "dashboard":
      output(await callTaxSoap("Get_QuickCash_Info", { user: su, password: sp }));
      break;

    case "comp-act-old":
      if (!arg1 || !flags.from || !flags.to)
        outputError("Usage: rs-cli taxpayer comp-act-old <said-code> --from <date> --to <date>");
      output(await callTaxSoap("Get_comp_act_old", {
        userName: su, password: sp,
        saidCode: arg1,
        start_date: flags.from as string,
        end_date: flags.to as string,
        session_id: (flags["session-id"] as string) ?? "",
      }));
      break;

    case "comp-act":
      if (!arg1 || !flags.from || !flags.to)
        outputError("Usage: rs-cli taxpayer comp-act <said-code> --from <date> --to <date>");
      output(await callTaxSoap("Get_comp_act_new", {
        userName: su, password: sp,
        saidCode: arg1,
        start_date: flags.from as string,
        end_date: flags.to as string,
      }));
      break;

    case "cargo200":
      if (!flags.from || !flags.to)
        outputError("Usage: rs-cli taxpayer cargo200 --from <date> --to <date>");
      output(await callTaxSoap("Get_Cargo200_Info", {
        inUserName: su, inPassword: sp,
        inStartDate: flags.from as string,
        inEndDate: flags.to as string,
      }));
      break;

    case "customs-exit":
      if (!flags.decl || !flags.code || !flags.car)
        outputError("Usage: rs-cli taxpayer customs-exit --decl <n> --code <n> --car <number>");
      await destructive(`Register customs warehouse exit for declaration ${flags.decl}?`, flags, () =>
        callTaxSoap("Customs_WareHouse_Exit", {
          UserName: su, Password: sp,
          DeclarationNumber: flags.decl as string,
          CustomsCode: flags.code as string,
          CarNumber: flags.car as string,
        }),
      );
      break;

    default:
      outputError(
        `Unknown taxpayer action: "${action}". Run 'rs-cli taxpayer --help' or read skills/taxpayer.md`,
      );
  }
}
