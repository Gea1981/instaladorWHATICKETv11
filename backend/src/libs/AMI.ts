import Asterisk from "asterisk-manager";
import { logger } from "../utils/logger";

// Configuración por defecto - debe ser configurada según el entorno
const ami: any = new Asterisk(
    process.env.AMI_PORT || "5038",
    process.env.AMI_HOST || "localhost",
    process.env.AMI_USER || "admin",
    process.env.AMI_PASSWORD || "admin",
    true
);

ami.keepConnected();

// Evento de Dial
ami.on("Dial", (evt: any) => {
    logger.info(`AMI Dial event: ${JSON.stringify(evt)}`);
});

// Evento de Hangup
ami.on("hangup", (evt: any) => {
    logger.info(`AMI Hangup event: ${JSON.stringify(evt)}`);
});

// Evento de respuesta de acciones
ami.on("response", (evt: any) => {
    logger.info(`AMI Response: ${JSON.stringify(evt)}`);
});

export default ami;
