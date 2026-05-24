import express from "express";
import path from "path";
import bcrypt from "bcrypt";
import session from "express-session";
import { connectDB } from "./db";
import { artists } from "./data";

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
  }),
);

async function seedUsers() {
  const db = await connectDB();
  const usersCollection = db.collection("users");

  const count = await usersCollection.countDocuments();

  if (count === 0) {
    const adminPass = await bcrypt.hash("admin123", 10);
    const userPass = await bcrypt.hash("user123", 10);

    await usersCollection.insertMany([
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
}

async function seedArtists() {
  const db = await connectDB();
  const artistsCollection = db.collection("artists");

  const count = await artistsCollection.countDocuments();

  if (count === 0) {
    await artistsCollection.insertMany(artists);
  }
}

function isLoggedIn(req: any, res: any, next: any) {
  if (!req.session.user) return res.redirect("/login");
  next();
}

function isAdmin(req: any, res: any, next: any) {
  if (!req.session.user || req.session.user.role !== "ADMIN") {
    return res.send("No access");
  }
  next();
}

app.get("/login", (req: any, res: any) => {
  if (req.session.user) return res.redirect("/artists");
  res.render("login");
});

app.post("/login", async (req: any, res: any) => {
  const db = await connectDB();
  const usersCollection = db.collection("users");

  const user = await usersCollection.findOne({
    username: req.body.username,
  });

  if (!user) return res.send("User not found");

  const valid = await bcrypt.compare(req.body.password, user.password);

  if (!valid) return res.send("Wrong password");

  req.session.user = {
    username: user.username,
    role: user.role,
  };

  res.redirect("/artists");
});

app.get("/register", (req: any, res: any) => {
  res.render("register");
});

app.post("/register", async (req: any, res: any) => {
  const db = await connectDB();
  const usersCollection = db.collection("users");

  const existing = await usersCollection.findOne({
    username: req.body.username,
  });

  if (existing) return res.send("Username already exists");

  const hashed = await bcrypt.hash(req.body.password, 10);

  await usersCollection.insertOne({
    username: req.body.username,
    password: hashed,
    role: "USER",
  });

  res.redirect("/login");
});

app.get("/logout", (req: any, res: any) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

app.get("/", (req: any, res: any) => {
  res.redirect("/login");
});

app.get("/artists", isLoggedIn, async (req: any, res: any) => {
  const db = await connectDB();
  const artistsCollection = db.collection("artists");

  let artists = await artistsCollection.find().toArray();

  const search = req.query.search || "";

  if (search) {
    artists = artists.filter((a: any) =>
      a.name.toLowerCase().includes(String(search).toLowerCase()),
    );
  }

  res.render("artists", {
    artists,
    search,
    user: req.session.user,
  });
});

app.get("/artists/:id", isLoggedIn, async (req: any, res: any) => {
  const db = await connectDB();
  const artistsCollection = db.collection("artists");

  const artist = await artistsCollection.findOne({
    id: Number(req.params.id),
  });

  res.render("artist-detail", { artist });
});

app.get(
  "/artists/:id/edit",
  isLoggedIn,
  isAdmin,
  async (req: any, res: any) => {
    const db = await connectDB();
    const artistsCollection = db.collection("artists");

    const artist = await artistsCollection.findOne({
      id: Number(req.params.id),
    });

    res.render("edit-artist", { artist });
  },
);

app.post(
  "/artists/:id/edit",
  isLoggedIn,
  isAdmin,
  async (req: any, res: any) => {
    const db = await connectDB();
    const artistsCollection = db.collection("artists");

    await artistsCollection.updateOne(
      { id: Number(req.params.id) },
      {
        $set: {
          name: req.body.name,
          age: Number(req.body.age),
          genre: req.body.genre,
          imageUrl: req.body.imageUrl,
        },
      },
    );

    res.redirect("/artists/" + req.params.id);
  },
);

async function start() {
  await seedUsers();
  await seedArtists();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:3000`);
  });
}

start();
