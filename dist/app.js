"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const express_session_1 = __importDefault(require("express-session"));
const db_1 = require("./db");
const data_1 = require("./data");
const app = (0, express_1.default)();
const PORT = 3000;
app.set("view engine", "ejs");
app.set("views", path_1.default.join(__dirname, "../views"));
app.use(express_1.default.static("public"));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, express_session_1.default)({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
}));
function seedUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        const db = yield (0, db_1.connectDB)();
        const usersCollection = db.collection("users");
        const count = yield usersCollection.countDocuments();
        if (count === 0) {
            const adminPass = yield bcrypt_1.default.hash("admin123", 10);
            const userPass = yield bcrypt_1.default.hash("user123", 10);
            yield usersCollection.insertMany([
                {
                    username: "admin",
                    password: adminPass,
                    role: "ADMIN",
                },
                {
                    username: "user",
                    password: userPass,
                    role: "USER",
                },
            ]);
        }
    });
}
function seedArtists() {
    return __awaiter(this, void 0, void 0, function* () {
        const db = yield (0, db_1.connectDB)();
        const artistsCollection = db.collection("artists");
        const count = yield artistsCollection.countDocuments();
        if (count === 0) {
            yield artistsCollection.insertMany(data_1.artists);
        }
    });
}
function isLoggedIn(req, res, next) {
    if (!req.session.user)
        return res.redirect("/login");
    next();
}
function isAdmin(req, res, next) {
    if (!req.session.user || req.session.user.role !== "ADMIN") {
        return res.send("No access");
    }
    next();
}
app.get("/login", (req, res) => {
    if (req.session.user)
        return res.redirect("/artists");
    res.render("login");
});
app.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield (0, db_1.connectDB)();
    const usersCollection = db.collection("users");
    const user = yield usersCollection.findOne({
        username: req.body.username,
    });
    if (!user)
        return res.send("User not found");
    const valid = yield bcrypt_1.default.compare(req.body.password, user.password);
    if (!valid)
        return res.send("Wrong password");
    req.session.user = {
        username: user.username,
        role: user.role,
    };
    res.redirect("/artists");
}));
app.get("/register", (req, res) => {
    res.render("register");
});
app.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield (0, db_1.connectDB)();
    const usersCollection = db.collection("users");
    const existing = yield usersCollection.findOne({
        username: req.body.username,
    });
    if (existing)
        return res.send("Username already exists");
    const hashed = yield bcrypt_1.default.hash(req.body.password, 10);
    yield usersCollection.insertOne({
        username: req.body.username,
        password: hashed,
        role: "USER",
    });
    res.redirect("/login");
}));
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});
app.get("/", (req, res) => {
    res.redirect("/login");
});
app.get("/artists", isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield (0, db_1.connectDB)();
    const artistsCollection = db.collection("artists");
    let artists = yield artistsCollection.find().toArray();
    const search = req.query.search || "";
    if (search) {
        artists = artists.filter((a) => a.name.toLowerCase().includes(String(search).toLowerCase()));
    }
    res.render("artists", {
        artists,
        search,
        user: req.session.user,
    });
}));
app.get("/artists/:id", isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield (0, db_1.connectDB)();
    const artistsCollection = db.collection("artists");
    const artist = yield artistsCollection.findOne({
        id: Number(req.params.id),
    });
    res.render("artist-detail", { artist });
}));
app.get("/artists/:id/edit", isLoggedIn, isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield (0, db_1.connectDB)();
    const artistsCollection = db.collection("artists");
    const artist = yield artistsCollection.findOne({
        id: Number(req.params.id),
    });
    res.render("edit-artist", { artist });
}));
app.post("/artists/:id/edit", isLoggedIn, isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield (0, db_1.connectDB)();
    const artistsCollection = db.collection("artists");
    yield artistsCollection.updateOne({ id: Number(req.params.id) }, {
        $set: {
            name: req.body.name,
            age: Number(req.body.age),
            genre: req.body.genre,
            imageUrl: req.body.imageUrl,
        },
    });
    res.redirect("/artists/" + req.params.id);
}));
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        yield seedUsers();
        yield seedArtists();
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:3000`);
        });
    });
}
start();
