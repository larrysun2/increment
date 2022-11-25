import { cajas, vendedores } from "../index.js";
import { defineCajaEvents } from "../events/cajaEvents.js";
import { defineVendedorEvents } from "../events/vendedorEvents.js";
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
