import { CajaComunication } from "../classes/Caja.js";
import { VendedorComunication } from "../classes/Vendedor.js";
import { defineCajaEvents } from "../events/caja.js";
import { defineVendedorEvents } from "../events/vendedor.js";
import { cajas, vendedores } from "../index.js";
export function configurarCliente(cliente) {
    vendedores.set(cliente, {
        id: vendedores.size,
        nombre: "Larry Suniaga",
        autorizado: false,
        comunication: new VendedorComunication(cliente)
    });
    defineVendedorEvents(cliente);
}
export function configurarCaja(caja) {
    cajas.set(caja, {
        id: cajas.size,
        nombre: "Rosangeles Diaz",
        autorizado: false,
        comunication: new CajaComunication(caja)
    });
    defineCajaEvents(caja);
}
export function filter_userType(cliente, path) {
    switch (path) {
        case "/vendedor":
            configurarCliente(cliente);
            break;
        case "/caja":
            configurarCaja(cliente);
            break;
        default:
            cliente.terminate();
            return;
    }
}
