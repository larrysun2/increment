import dotenv from "dotenv"
import express from "express"
import cookieParser from "cookie-parser"
import bodyParser from "body-parser"
import cors from "cors"
import firebase from "firebase/compat/app"
import "firebase/compat/database"


interface Counter {
  count: number
  limit: number
}

const firebaseConfig = {
  apiKey: "AIzaSyA97sLAkpnK4FMkLgD_euWq2K3APHPWYnI",
  authDomain: "wallet-store-46c20.firebaseapp.com",
  databaseURL: "https://wallet-store-46c20-default-rtdb.firebaseio.com",
  projectId: "wallet-store-46c20",
  storageBucket: "wallet-store-46c20.appspot.com",
  messagingSenderId: "241664018764",
  appId: "1:241664018764:web:4876e5424bcd8ae3cfa7e9",
  measurementId: "G-4HL7C6F628"
};


let creditCounters = new Map<string, Counter>();
const db_app = firebase.initializeApp(firebaseConfig)
const db = db_app.database()
const ref = db.ref("/creditsControl")
const devPort = 8080
const port = parseInt(process.env.PORT || "0") || devPort

ref.on("value", (snap) => {
  creditCounters = new Map(Object.entries(snap.val()))
})

dotenv.config();

const getCreditCounter = (id : string) => {
  return creditCounters.get(id) || {
    count: 0,
    limit: 0
  }
}

const setCreditCounter = (id : string, counter : Counter) => {
  return ref.child("/" + id).set(counter)
}

export const incrementCreditCounter = (id : string) => {
  const {count, limit} = getCreditCounter(id)
  if(count < limit) {
    ref.child("/" + id).set({
      count: count + 1,
      limit
    })
    return true
  }
  return false
}

const setCreditCounterLimit = (id : string, limit : Counter["limit"]) => {
  const { count } = getCreditCounter(id)
  setCreditCounter(id, {
    count: count || 0,
    limit
  })
}

const resetCreditCounter = async (id : string) => {
  const counter = getCreditCounter(id)
  await setCreditCounter(id, {
    count: 0,
    limit: counter?.limit || 0
  })
}

const resetAllCreditCounters = async () => {
  for(let [ id ] of creditCounters) {
    await resetCreditCounter(id)
  }
}

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

app.get("/reset-all", async (req, res) => {
  await resetAllCreditCounters()
  
  res.json({
    result: true
  })
})

app.get("/reset/:id", async (req, res) => {
  const { id } = req.params;
  if(id !== undefined) {
    await resetCreditCounter(id)

    res.json({
      result: true
    })
  }
})

app.get("/increment/:id", (req, res) => {
  const { id } = req.params;
  if(id !== undefined) {
    const result = incrementCreditCounter(id)
    const { count } = getCreditCounter(id)

    res.json({
      count,
      result
    })
  }
})

app.get("/limit/:id/:limit", (req, res) => {
  const { id, limit } = req.params;
  if(id && limit) {
    try{
      setCreditCounterLimit(id, parseInt(limit))

      res.json({
        result: true
      })
    } catch (err) {
      res.json({
        result: false
      })
    }

  }
})

app.get("/all", (req, res) => {
  res.header("Content-Type", "application/json")
  res.send(JSON.stringify(Object.fromEntries([...creditCounters]), null, 4))
})

app.listen(port)
