import { Context, Telegraf } from "telegraf";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import VerifyContact from "./TelegramVerifyContact";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import VerifyMediaMessage from "./TelegramVerifyMediaMessage";
import VerifyMessage from "./TelegramVerifyMessage";
import VerifyCurrentSchedule from "../CompanyService/VerifyCurrentSchedule";

interface Session extends Telegraf {
    id: number;
}

const HandleMessageTelegram = async (ctx: Context, tbot: Session): Promise<void> => {
    const channel = await ShowWhatsAppService(tbot.id);
    let message;
    let updateMessage: any = {};
    message = ctx?.message;
    updateMessage = ctx?.update;

    if (!message && updateMessage) {
        message = updateMessage?.edited_message;
    }

    const chat = message?.chat;
    const me = await ctx.telegram.getMe();
    const fromMe = me.id === ctx.message?.from.id;

    const messageData = {
        ...message,
        timestamp: +message.date * 1000
    };

    const contact = await VerifyContact(ctx, channel.companyId);
    const ticket = await FindOrCreateTicketService(
        contact,
        tbot.id!,
        fromMe ? 0 : 1,
        channel.companyId
    );

    // if (ticket?.isFarewellMessage) {
    //   return;
    // }

    if (!messageData?.text && chat?.id) {
        await VerifyMediaMessage(ctx, fromMe, ticket, contact);
    } else {
        await VerifyMessage(ctx, fromMe, ticket, contact);
    }

    await VerifyCurrentSchedule(channel.companyId, channel.queueId, 0);
};

export default HandleMessageTelegram;
