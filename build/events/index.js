import { cancelarOrden, completarOrden } from '../utils/crudCaja.js';
import { crearOrden } from '../utils/crudVendedor.js';
export const panelVendedor = {
    crearOrden
};
export const panelCaja = {
    cancelarOrden,
    completarOrden
};
