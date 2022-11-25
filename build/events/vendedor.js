import { vendedores } from "../index.js";
import { panelVendedor } from "./index.js";
function onDisconnect(vendedor) {
    vendedores.delete(vendedor);
}
export const defineVendedorEvents = (vendedor) => {
    const { comunication } = vendedores.get(vendedor);
    const messageHandler = (rawMsg) => {
        try {
            const msg = JSON.parse(rawMsg);
            if (msg.type in panelVendedor) {
                panelVendedor[msg.type](vendedor, msg.data);
            }
            else {
                comunication.sendMessage({
                    status: 0,
                    type: "error",
                    data: "El comando especificado es invalido"
                });
            }
        }
        catch (e) {
            comunication.sendMessage({
                status: 0,
                type: "error",
                data: "El mensaje recibido es invalido."
            });
        }
    };
    const closeHandler = () => {
        onDisconnect(vendedor);
    };
    vendedor.on("message", messageHandler);
    vendedor.on("close", closeHandler);
};
