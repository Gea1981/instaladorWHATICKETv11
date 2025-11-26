import { Telegraf } from "telegraf";
import HandleMessageTelegram from "./HandleMessageTelegram";

interface Session extends Telegraf {
    id: number;
}

const tbotMessageListener = (tbot: Session): void => {
    tbot.on("message", async (ctx: any) => {
        HandleMessageTelegram(ctx, tbot);
    });

    tbot.on("edited_message", async (ctx: any) => {
        HandleMessageTelegram(ctx, tbot);
    });
};

export { tbotMessageListener };
