import { panelVendedor } from "./index.js";
export const defineVendedorEvents = (vendedor) => {
    const messageHandler = (rawMsg) => {
        const msg = JSON.parse(rawMsg);
        if (msg.action in panelVendedor) {
            panelVendedor[msg.action](vendedor, msg.value);
        }
        else {
            vendedor.send(`Unknow action: ${msg.action}`);
        }
    };
    vendedor.on("message", messageHandler);
};
