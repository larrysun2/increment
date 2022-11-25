export type ExpressRequest = import("express-serve-static-core").Request<{}, any, any, import("express-serve-static-core").Query, Record<string, any>>;
export type ExpressResponse = import("express-serve-static-core").Response<any, Record<string, any>, number>;
export type RequestCallback = (req: ExpressRequest, res: ExpressResponse) => void;