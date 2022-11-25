var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import firebase from "firebase/compat/app";
import "firebase/compat/database";
import "firebase/compat/auth";
const app = express();
const port = process.env.PORT || 5000;
const baseUrl = "C:/Users/larry/Documents/reactPractice/myfirstnative/build";
const firebaseConfig = {
    apiKey: "AIzaSyBwA-0lThKslPhVOhhTmT-gSslH8AS1aQE",
    authDomain: "kolohack-2.firebaseapp.com",
    databaseURL: "https://kolohack-2.firebaseio.com",
    projectId: "kolohack-2",
    storageBucket: "kolohack-2.appspot.com",
    messagingSenderId: "355656766613",
    appId: "1:355656766613:web:dc23c7554962533115379c"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
const global = {
    users: {}
};
let usersLoaded = false;
function signOut() {
    auth.signOut();
}
function signIn() {
    auth.signInWithEmailAndPassword("larrysun2@gmail.com", "v27573253");
}
auth.onAuthStateChanged((currentUser) => __awaiter(void 0, void 0, void 0, function* () {
    if (currentUser === null) {
        signIn();
    }
    else {
        if (!usersLoaded) {
            try {
                const users = yield loadUsers();
                global.users = users;
                usersLoaded = true;
                database.ref("/users/flareville").on("value", (res) => {
                    const users = res.val();
                    global.users = users;
                });
            }
            catch (e) {
                signOut();
            }
        }
    }
}));
export const loadUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield database.ref("/users/flareville").get();
    const users = response.val();
    return users;
});
app.listen(port, () => console.log(`Listening on port ${port}`));
app.set("json spaces", 2);
app.get('/api/getUser', (req, res) => {
    const query = req.query.q;
    let result = global.users;
    if (typeof query === "string") {
        result = Object.fromEntries(Object.entries(result).filter(x => {
            return query !== undefined ? x[0].indexOf(query) !== -1 : true;
        }));
    }
    res.json({
        result
    });
});
app.get('*.*', (req, res) => {
    res.sendFile(baseUrl + req.url);
});
app.get("/404", (req, res) => {
    res.status(404).sendFile(baseUrl + "/index.html");
});
app.get("/static/*", (req, res) => {
    const finalUrl = baseUrl + req.url;
    res.sendFile(finalUrl);
});
app.get("/*", (req, res) => {
    res.sendFile(baseUrl + "/index.html");
});
