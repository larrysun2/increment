import { cajas, ordenesAsignadas, ordenesPendientes } from "../index.js";
import { asignarOrden } from "./crud.js";
import { panelCaja } from "./panels.js";
export const defineCajaEvents = (caja) => {
    const cajaDetails = cajas.get(caja);
    const ordenesPendientesPorAsignar = ordenesPendientes.splice(0, ordenesPendientes.length);
    const ordenes = [...ordenesPendientesPorAsignar.map(detallesOrden => ({
            idCaja: cajaDetails.id,
            detalles: detallesOrden
        }))];
    const messageHandler = (rawMsg) => {
        const msg = JSON.parse(rawMsg);
        if (msg.action in panelCaja) {
            panelCaja[msg.action](caja, msg.value);
        }
        else {
            caja.send(`Unknow action: ${msg.action}`);
        }
    };
    const disconnectHandler = () => {
        const cajas_keys = [...cajas.keys()];
        const ordenesDeCaja = ordenesAsignadas.filter(x => x.idCaja === cajaDetails.id);
        if (ordenesDeCaja.length !== 0) {
            if ((cajas.size - 1) !== 0) {
                const cajaIndex = cajas_keys.indexOf(caja);
                const targetIndex = cajaIndex === (cajas_keys.length - 1) ? 0 : cajaIndex + 1;
                const target = cajas_keys[targetIndex];
                const targetDetails = cajas.get(target);
                ordenesAsignadas.splice(0, ordenesAsignadas.length, ...ordenesAsignadas.filter(x => x.idCaja !== cajaDetails.id));
                // ordenesAsignadas = ordenesAsignadas.filter(x=> x.idCaja !== cajaDetails.id)
                asignarOrden(target, ...ordenesDeCaja.map(orden => {
                    orden.idCaja = targetDetails.id;
                    return orden;
                }));
            }
            else {
                ordenesAsignadas.splice(0, ordenesAsignadas.length, ...ordenesAsignadas.filter(x => x.idCaja !== cajaDetails.id));
                // ordenesAsignadas = ordenesAsignadas.filter(x=> x.idCaja !== cajaDetails.id)
                ordenesPendientes.push(...ordenesDeCaja.map(x => x.detalles));
            }
        }
        cajas.delete(caja);
    };
    caja.on("message", messageHandler);
    caja.on("close", disconnectHandler);
    if (ordenes.length) {
        asignarOrden(caja, ...ordenes);
    }
};
