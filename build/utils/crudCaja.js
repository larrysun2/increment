import { cajas, ordenesAsignadas, ordenesCanceladas, ordenesCompletadas } from "../index.js";
export function validarOrden(orden) {
    const { ciCliente, idVendedor, nombreCliente, products } = orden;
    // @ts-ignore
    const check = [ciCliente, idVendedor, nombreCliente, products].indexOf(undefined) === -1;
    return check;
}
export function cancelarOrden(caja, ordenID) {
    const { id: cajaID, comunication } = cajas.get(caja);
    const orden = ordenesAsignadas.reduce((x, orden) => orden && orden.idCaja === cajaID && orden.detalles.id === ordenID ? orden : x, null);
    if (orden !== null) {
        ordenesAsignadas.splice(0, ordenesAsignadas.length, ...ordenesAsignadas.filter(x => x !== orden));
        ordenesCanceladas.push(orden);
        comunication.sendMessage({
            status: 1,
            type: "cancelarOrden",
            data: orden.detalles.id
        });
        actualizarOrdenes(caja);
    }
    else {
        comunication.sendMessage({
            status: 0,
            type: "error",
            data: "No se encuenta la orden que se intenta cancelar..."
        });
    }
}
export function completarOrden(caja, ordenID) {
    const { id: cajaID, comunication } = cajas.get(caja);
    const orden = ordenesAsignadas.reduce((x, orden) => orden && orden.idCaja === cajaID && orden.detalles.id === ordenID ? orden : x, null);
    if (orden !== null) {
        ordenesAsignadas.splice(0, ordenesAsignadas.length, ...ordenesAsignadas.filter(x => x !== orden));
        // ordenesAsignadas = ordenesAsignadas.filter(x=> x !== orden);
        ordenesCompletadas.push(orden);
        comunication.sendMessage({
            status: 1,
            type: "ordenCompletada",
            data: orden.detalles.id
        });
        actualizarOrdenes(caja);
    }
    else {
        comunication.sendMessage({
            status: 0,
            type: "error",
            data: "No se encontro la orden que se intenta completar..."
        });
    }
}
export function actualizarOrdenes(caja) {
    const { id: cajaID, comunication } = cajas.get(caja);
    comunication.sendMessage({
        status: 1,
        type: "actualizarOrdenes",
        data: ordenesAsignadas.filter(x => x.idCaja === cajaID)
    });
}
export function ordenAsignada(caja, orden) {
    const { comunication } = cajas.get(caja);
    comunication.sendMessage({
        status: 1,
        type: "ordenAsignada",
        data: orden.detalles
    });
}
export function asignarOrden(caja, ...orden) {
    ordenesAsignadas.push(...orden);
    if (orden.length === 1) {
        ordenAsignada(caja, orden[0]);
    }
    else {
        actualizarOrdenes(caja);
    }
}
