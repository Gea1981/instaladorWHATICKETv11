import Message from "../models/Message";

const getQuotedForMessageId = async (
    messageId: string,
    companyId: number
): Promise<Message | null> => {
    const message = await Message.findOne({
        where: {
            messageId,
            companyId
        }
    });
    return message;
};

export default getQuotedForMessageId;
