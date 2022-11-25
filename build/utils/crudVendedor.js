import { cajas, incrementOrderCounter, ordenesAsignadas, ordenesPendientes, vendedores } from "../index.js";
import { validarOrden, asignarOrden } from "./crudCaja.js";
export function crearOrden(vendedor, ordenReceived) {
    const details = vendedores.get(vendedor);
    const orden = Object.assign(Object.assign({}, ordenReceived), { idVendedor: details.id, id: incrementOrderCounter() });
    if (validarOrden(orden)) {
        setOrder(vendedor, orden);
    }
}
export function setOrder(vendedor, ordenDetails) {
    const { comunication } = vendedores.get(vendedor);
    if (cajas.size !== 0) {
        // [Caja, cantidad de ordenes de esa caja]
        const ordenesCaja = [...cajas].map(([caja, details]) => [
            caja,
            ordenesAsignadas.reduce((x, c) => details.id === c.idCaja ? x + 1 : x, 0)
        ]);
        // Selecciono la caja con menor cantidad de pedidos y sus respectivos detalles
        const [caja] = ordenesCaja.sort(([, cantPedidos], [, cantPedidos2]) => {
            return cantPedidos - cantPedidos2;
        })[0];
        const cajaDetails = cajas.get(caja);
        const orden = {
            idCaja: cajaDetails.id,
            detalles: ordenDetails
        };
        asignarOrden(caja, orden);
        comunication.sendMessage({
            status: 1,
            type: "ordenAsignada",
            data: orden
        });
    }
    else {
        ordenesPendientes.push(ordenDetails);
        comunication.sendMessage({
            status: 1,
            type: "ordenEnCola",
            data: ordenDetails
        });
    }
}
