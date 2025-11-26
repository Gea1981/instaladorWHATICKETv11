import { Context } from "telegraf";
import getQuotedForMessageId from "../../helpers/getQuotedForMessageId";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import CreateMessageService from "../MessageServices/CreateMessageService";

const VerifyMessage = async (
    ctx: Context | any,
    fromMe: boolean,
    ticket: Ticket,
    contact: Contact
): Promise<void> => {
    let message;
    let updateMessage: any = {};
    message = ctx?.message;
    updateMessage = ctx?.update;

    if (!message && updateMessage) {
        message = updateMessage?.edited_message;
    }

    let quotedMsgId;
    if (message?.reply_to_message?.message_id) {
        const messageQuoted = await getQuotedForMessageId(
            message.reply_to_message.message_id,
            ticket.companyId
        );
        quotedMsgId = messageQuoted?.id || undefined;
    }

    const messageData = {
        messageId: String(message?.message_id),
        ticketId: ticket.id,
        contactId: fromMe ? undefined : contact.id,
        body: message.text,
        fromMe,
        read: fromMe,
        mediaType: "chat",
        quotedMsgId,
        timestamp: +message.date * 1000,
        status: "received"
    };
    await ticket.update({
        lastMessage: message.text,
        lastMessageAt: new Date().getTime(),
        answered: fromMe || false
    });
    await CreateMessageService({
        messageData,
        companyId: ticket.companyId
    });
};

export default VerifyMessage;
