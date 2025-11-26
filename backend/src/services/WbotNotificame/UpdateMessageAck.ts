import Message from "../../models/Message";
import socketEmit from "../../helpers/socketEmit";

export const UpdateMessageAck = async (messageId: string): Promise<void> => {
    try {

        const message = await Message.findOne({
            where: {
                messageId
            },
        });

        if (!message) {
            setTimeout(async () => {
                await UpdateMessageAck(messageId);
            }, 5000);
            return;
        }

        await message.update({
            ack: 2,
        });

        socketEmit({
            companyId: message.companyId,
            type: "chat:update",
            payload: message
        });

    } catch (error) {
        console.error("Error al intentar actualizar el campo 'ack':", error);
    }
};
