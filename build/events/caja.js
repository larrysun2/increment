import { cajas, ordenesAsignadas, ordenesPendientes, vendedores } from "../index.js";
import { asignarOrden } from "../utils/crudCaja.js";
import { panelCaja } from "./index.js";
export function onDisconnect(caja) {
    const { id } = cajas.get(caja);
    const cajas_keys = [...cajas.keys()];
    const ordenesDeCaja = ordenesAsignadas.filter(x => x.idCaja === id);
    if (ordenesDeCaja.length !== 0) {
        if ((cajas.size - 1) !== 0) {
            const cajaIndex = cajas_keys.indexOf(caja);
            const targetIndex = cajaIndex === (cajas_keys.length - 1) ? 0 : cajaIndex + 1;
            const target = cajas_keys[targetIndex];
            const targetDetails = cajas.get(target);
            ordenesAsignadas.splice(0, ordenesAsignadas.length, ...ordenesAsignadas.filter(x => x.idCaja !== id));
            asignarOrden(target, ...ordenesDeCaja.map(orden => {
                orden.idCaja = targetDetails.id;
                return orden;
            }));
        }
        else {
            ordenesAsignadas.splice(0, ordenesAsignadas.length, ...ordenesAsignadas.filter(x => x.idCaja !== id));
            ordenesPendientes.push(...ordenesDeCaja.map(x => x.detalles));
        }
    }
    cajas.delete(caja);
}
function onConnect(caja) {
    const { id } = cajas.get(caja);
    const ordenesPendientesPorAsignar = ordenesPendientes.splice(0, ordenesPendientes.length);
    const ordenes = [...ordenesPendientesPorAsignar.map(detallesOrden => ({
            idCaja: id,
            detalles: detallesOrden
        }))];
    if (ordenes.length) {
        asignarOrden(caja, ...ordenes);
        ordenes.map((orden) => {
            const { detalles: { idVendedor } } = orden;
            [...vendedores].forEach(([, { id, comunication }]) => {
                if (id === idVendedor) {
                    comunication.sendMessage({
                        status: 1,
                        type: "ordenAsignada",
                        data: orden
                    });
                }
            });
        });
    }
}
export const defineCajaEvents = (caja) => {
    const { comunication } = cajas.get(caja);
    const messageHandler = (rawMsg) => {
        try {
            const msg = JSON.parse(rawMsg);
            if (msg.type in panelCaja) {
                panelCaja[msg.type](caja, msg.data);
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
    const disconnectHandler = () => {
        onDisconnect(caja);
    };
    caja.on("message", messageHandler);
    caja.on("close", disconnectHandler);
    onConnect(caja);
};
