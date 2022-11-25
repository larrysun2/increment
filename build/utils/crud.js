import { cajas, incrementOrderCounter, ordenesAsignadas, ordenesCanceladas, ordenesCompletadas, ordenesPendientes, vendedores } from "../index.js";
export function validarOrden(orden) {
    const { idCliente, idVendedor, nombreCliente, products } = orden;
    // @ts-ignore
    const check = [idCliente, idVendedor, nombreCliente, products].indexOf(undefined) === -1;
    return check;
}
export function cancelarOrden(caja, ordenID) {
    const cajaDetails = cajas.get(caja);
    const orden = ordenesAsignadas.reduce((x, orden) => orden && orden.idCaja === cajaDetails.id && orden.detalles.id === ordenID ? orden : x, null);
    if (orden !== null) {
        ordenesAsignadas.splice(0, ordenesAsignadas.length, ...ordenesAsignadas.filter(x => x !== orden));
        // ordenesAsignadas = ordenesAsignadas.filter(x=> x !== orden);
        ordenesCanceladas.push(orden);
        caja.send(JSON.stringify({
            status: 1,
            message: "El pedido ha sido cancelado correctamente."
        }));
        actualizarOrdenes(caja);
    }
    else {
        caja.send(JSON.stringify({
            status: 0,
            message: "El pedido que intentas cancelas no es valido o no esta asignado a tu caja."
        }));
    }
}
export function completarOrden(caja, ordenID) {
    const cajaDetails = cajas.get(caja);
    const orden = ordenesAsignadas.reduce((x, orden) => orden && orden.idCaja === cajaDetails.id && orden.detalles.id === ordenID ? orden : x, null);
    if (orden !== null) {
        ordenesAsignadas.splice(0, ordenesAsignadas.length, ...ordenesAsignadas.filter(x => x !== orden));
        // ordenesAsignadas = ordenesAsignadas.filter(x=> x !== orden);
        ordenesCompletadas.push(orden);
        caja.send(JSON.stringify({
            status: 1,
            message: "El pedido ha sido completado correctamente."
        }));
        actualizarOrdenes(caja);
    }
    else {
        caja.send(JSON.stringify({
            status: 0,
            message: "El pedido que intentas completar no es valido o no esta asignado a tu caja."
        }));
    }
}
export function setOrder(cliente, orden) {
    const details = vendedores.get(cliente);
    if (details !== undefined) {
        orden.idVendedor = details.id;
        orden.id = incrementOrderCounter();
        if (validarOrden(orden)) {
            crearOrden(cliente, orden);
        }
    }
}
export function actualizarOrdenes(caja) {
    const cajaDetails = cajas.get(caja);
    caja.send(JSON.stringify({
        type: "updateOrders",
        data: ordenesAsignadas.filter(x => x.idCaja === cajaDetails.id)
    }, undefined, 4));
    return true;
}
export function asignarOrden(caja, ...orden) {
    ordenesAsignadas.push(...orden);
    return actualizarOrdenes(caja);
}
export function crearOrden(vendedor, orden) {
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
        const result = asignarOrden(caja, {
            idCaja: cajaDetails.id,
            detalles: orden
        });
        vendedor.send(JSON.stringify({
            status: result ? 1 : 0,
            type: "ordenAsignada",
            data: orden
        }, null, 4));
    }
    else {
        ordenesPendientes.push(orden);
    }
}
