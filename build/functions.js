import { cajas, incrementOrderCounter, ordenesAsignadas, ordenesCanceladas, ordenesCompletadas, ordenesPendientes, vendedores } from "./index";
export function actualizarOrdenes(caja) {
    const cajaDetails = cajas.get(caja);
    caja.send(JSON.stringify({
        type: "updateOrders",
        data: ordenesAsignadas.filter(x => x.idCaja === cajaDetails.id)
    }, undefined, 4));
}
export function asignarOrden(caja, ...orden) {
    ordenesAsignadas.push(...orden);
    actualizarOrdenes(caja);
}
export function validarOrden(orden) {
    const { idCliente, idVendedor, nombreCliente, products } = orden;
    // @ts-ignore
    const check = [idCliente, idVendedor, nombreCliente, products].indexOf(undefined) === -1;
    return check;
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
        asignarOrden(caja, {
            idCaja: cajaDetails.id,
            detalles: orden
        });
    }
    else {
        ordenesPendientes.push(orden);
    }
}
export const panelVendedor = {
    setOrder(cliente, orden) {
        const details = vendedores.get(cliente);
        if (details !== undefined) {
            orden.idVendedor = details.id;
            orden.id = incrementOrderCounter();
            if (validarOrden(orden)) {
                crearOrden(cliente, orden);
            }
        }
    }
};
export const panelCaja = {
    cancelarOrden(caja, ordenID) {
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
    },
    completarOrden(caja, ordenID) {
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
};
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
export const defineCajaEvents = (caja) => {
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
    const cajaDetails = cajas.get(caja);
    caja.on("message", messageHandler);
    caja.on("close", disconnectHandler);
    const ordenesPendientesPorAsignar = ordenesPendientes.splice(0, ordenesPendientes.length);
    const ordenes = [...ordenesPendientesPorAsignar.map(detallesOrden => ({
            idCaja: cajaDetails.id,
            detalles: detallesOrden
        }))];
    if (ordenes.length) {
        asignarOrden(caja, ...ordenes);
    }
};
export function configurarCliente(cliente) {
    vendedores.set(cliente, {
        id: vendedores.size,
        nombre: "Larry Suniaga",
        autorizado: false
    });
    defineVendedorEvents(cliente);
    cliente.send("¡Bienvenido Vendedor!");
}
export function configurarCaja(caja) {
    cajas.set(caja, {
        id: cajas.size,
        nombre: "Rosangeles Diaz",
        autorizado: false
    });
    caja.send("¡Bienvenido Caja!");
    defineCajaEvents(caja);
}
