import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import fileUpload from "express-fileupload";
import pg from "pg";
import fs from "fs";
import dotenv from 'dotenv';

dotenv.config();
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

// Ensure uploads folder exists
const uploadDir = "public/uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// PostgreSQL connection

const pool = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
});
await pool.connect();
console.log("PostgreSQL connected successfully");

// Middleware
app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use("/favicon.ico", express.static("public/img/logo.jpeg"));

// Home page
app.get("/", async (req, res) => {
  const blogs = await pool.query("SELECT * FROM posts ORDER BY publishedat DESC");
  res.render("index", { blogs: blogs.rows });
});

// Image upload
app.post("/upload", (req, res) => {
  const file = req.files.image;
  const filename = Date.now() + file.name;
  const path = `public/uploads/${filename}`;

  file.mv(path, () => {
    res.json(`uploads/${filename}`);
  });
});

// New blog form
app.get("/new", (req, res) => res.render("new"));

// Create blog
app.post("/new", async (req, res) => {
  const { title, content } = req.body;
  const publishedAt = new Date();
  let bannerPath = "uploads/default-banner.jpg";

  if (req.files?.bannerImage) {
    const file = req.files.bannerImage;
    const name = Date.now() + file.name;
    await file.mv(`public/uploads/${name}`);
    bannerPath = `uploads/${name}`;
  }

  const result = await pool.query(
    `INSERT INTO posts (title, content, bannerimage, publishedat)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [title, content, bannerPath, publishedAt]
  );

  res.redirect(`/${result.rows[0].id}`);
});


// View blog
app.get("/:id", async (req, res) => {
  const result = await pool.query("SELECT * FROM posts WHERE id = $1", [req.params.id]);
  res.render("blog", { blog: result.rows[0] });
});

// Edit blog form
app.get("/edit/:id", async (req, res) => {
  const result = await pool.query("SELECT * FROM posts WHERE id = $1", [req.params.id]);
  res.render("edit", { blog: result.rows[0] });
});

// Update blog
app.post("/edit/:id", async (req, res) => {
  const { title, content } = req.body;
  const updatedAt = new Date();
  let query, values;

  if (req.files?.bannerImage) {
    const file = req.files.bannerImage;
    const name = Date.now() + file.name;
    await file.mv(`public/uploads/${name}`);
    query = `UPDATE posts SET title=$1, content=$2, bannerimage=$3, updated_at=$4 WHERE id=$5`;
    values = [title, content, `uploads/${name}`, updatedAt, req.params.id];
  } else {
    query = `UPDATE posts SET title=$1, content=$2, updated_at=$3 WHERE id=$4`;
    values = [title, content, updatedAt, req.params.id];
  }

  await pool.query(query, values);
  res.redirect(`/${req.params.id}`);
});

// Delete blog
app.post("/delete/:id", async (req, res) => {
  await pool.query("DELETE FROM posts WHERE id = $1", [req.params.id]);
  res.redirect("/");
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
