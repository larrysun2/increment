import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";
const devPort = 8080;
export const port = parseInt(process.env.PORT || "0") || devPort;
const isDev = port === devPort;
dotenv.config();
export let creditCounters = new Map();
const creditsResetDate = () => new Date(new Date(new Date().toUTCString().replace(" GMT", "")).getTime() - 3600 * 12 * 1000).toLocaleDateString();
let resetDate = creditsResetDate();
setInterval(() => {
    const newResetDate = creditsResetDate();
    if (resetDate !== newResetDate) {
        resetDate = newResetDate;
        creditCounters.forEach(counter => {
            counter.count = 0;
        });
    }
}, 60e3);
const getCreditCounter = (id) => {
    return creditCounters.get(id) || {
        count: 0,
        limit: 0
    };
};
const setCreditCounter = (id, counter) => {
    return creditCounters.set(id, counter);
};
export const incrementCreditCounter = (id) => {
    const { count, limit } = getCreditCounter(id);
    if (count < limit) {
        creditCounters.set(id, {
            limit,
            count: count + 1
        });
        return true;
    }
    return false;
};
const setCreditCounterLimit = (id, limit) => {
    const { count } = getCreditCounter(id);
    setCreditCounter(id, {
        count: count || 0,
        limit
    });
};
const resetCreditCounter = (id) => {
    const counter = getCreditCounter(id);
    setCreditCounter(id, {
        count: 0,
        limit: (counter === null || counter === void 0 ? void 0 : counter.limit) || 0
    });
};
const app = express();
if (isDev) {
    app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
}
else {
    app.use(cors());
}
app.use(bodyParser.json());
app.use(cookieParser());
app.get("/reset/:id", (req, res) => {
    const { id } = req.params;
    if (id !== undefined) {
        resetCreditCounter(id);
        res.json({
            result: true
        });
    }
});
app.get("/increment/:id", (req, res) => {
    const { id } = req.params;
    if (id !== undefined) {
        const result = incrementCreditCounter(id);
        const { count } = getCreditCounter(id);
        res.json({
            count,
            result
        });
    }
});
app.get("/limit/:id/:limit", (req, res) => {
    const { id, limit } = req.params;
    if (id && limit) {
        try {
            setCreditCounterLimit(id, parseInt(limit));
            res.json({
                result: true
            });
        }
        catch (err) {
            res.json({
                result: false
            });
        }
    }
});
app.get("/all", (req, res) => {
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify(Object.fromEntries([...creditCounters]), null, 4));
});
app.listen(port);
