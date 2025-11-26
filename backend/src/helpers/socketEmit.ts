import { getIO } from "../libs/socket";

type Events =
    | "chat:create"
    | "chat:delete"
    | "chat:update"
    | "chat:ack"
    | "ticket:update"
    | "ticket:create"
    | "contact:update"
    | "contact:delete"
    | "notification:new";

interface ObjEvent {
    companyId: number | string;
    type: Events;
    payload: object;
}

const emitEvent = ({ companyId, type, payload }: ObjEvent): void => {
    const io = getIO();
    let eventChannel = `company-${companyId}-ticket`;

    if (type.indexOf("contact:") !== -1) {
        eventChannel = `company-${companyId}-contact`;
    }

    io.emit(eventChannel, {
        action: type,
        payload
    });
};

export default emitEvent;
