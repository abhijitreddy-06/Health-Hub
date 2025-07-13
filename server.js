// importing all libs
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import multer from "multer";
import axios from "axios";

//app 
const app = express();
const port = 3000;

// __dirname 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// JWT config
const JWT_SECRET = process.env.JWT_SECRET || "abhijitreddy"; // replace with env var in production
const JWT_EXPIRES_IN = "2h"; // token validity

//database connecting
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "CottonCure",
  password: "Abhi.data",
  port: 5432,
});

db.connect(err => {
  if (err) {
    console.error("Failed to connect to PostgreSQL:", err.stack);
  } else {
    console.log("Connected to PostgreSQL");
  }
});

const saltRounds = 10;

// JWT authentication middleware
function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect("/login");
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    req.phone = payload.phone;
    next();
  } catch (err) {
    return res.redirect("/login");
  }
}

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Public routes
app.get("/landing", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages", "landing.html"));
});
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages", "landing.html"));
});
app.get("/contact", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages", "contact.html"));
});
app.get("/services", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages", "services.html"));
});
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages", "login.html"));
});
app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages", "signup.html"));
});

// Protected routes 
app.get("/home", authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages", "home.html"));
});
app.get("/doctors", authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages", "doctors.html"));
});
// Profile form page (protected)
app.get("/profileguide", authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages", "profileguide.html"));
});
app.get("/vault", authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages", "vault.html"));
});
app.get("/predict", authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages", "predict.html"));
});

// SIGNUP route
app.post("/signup", async (req, res) => {
  try {
    const phone = req.body.phone;
    const password = req.body.password;
    const confirmpassword = req.body.confirmpassword;

    // Validate password length and match
    if (!password || password.length < 6) {
      return res.send(`
        <script>
          alert('Password must be at least 6 characters.');
          window.location.href = "/signup";
        </script>
      `);
    }
    if (password !== confirmpassword) {
      return res.send(`
        <script>
          alert('Passwords must match.');
          window.location.href = "/signup";
        </script>
      `);
    }

    // Check if phone already exists
    const select_phone = "SELECT id FROM login WHERE phone = $1";
    const phone_values = await db.query(select_phone, [phone]);
    if (phone_values.rows.length > 0) {
      return res.send(`
        <script>
          alert('Account already exists with this phone number.');
          window.location.href = "/signup";
        </script>
      `);
    }

    // Hash password and insert
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const insertQuery = "INSERT INTO login (phone, password) VALUES ($1, $2) RETURNING id";
    const insertRes = await db.query(insertQuery, [phone, hashedPassword]);
    const userId = insertRes.rows[0].id;

    // Optionally auto-login: issue JWT immediately
    const token = jwt.sign({ userId, phone }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 2 * 60 * 60 * 1000,
    });
    // Redirect to profile or home
    return res.redirect("/profileguide");
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).send("Internal server error during signup.");
  }
});

// LOGIN route
app.post("/login", async (req, res) => {
  try {
    const phone = req.body.phone;
    const password = req.body.password;

    // Lookup user by phone
    const selectQuery = "SELECT id, password FROM login WHERE phone = $1";
    const result = await db.query(selectQuery, [phone]);
    if (result.rows.length === 0) {
      return res.send(`
        <script>
          alert('Account does not exist with this phone number.');
          window.location.href = "/login";
        </script>
      `);
    }

    const { id: userId, password: hashedPassword } = result.rows[0];

    // Compare password
    const isMatch = bcrypt.compareSync(password, hashedPassword);
    if (!isMatch) {
      return res.send(`
        <script>
          alert('Incorrect password.');
          window.location.href = "/login";
        </script>
      `);
    }

    // Issue JWT
    const token = jwt.sign({ userId, phone }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 2 * 60 * 60 * 1000,
    });

    // Redirect
    return res.redirect("/home");
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).send("Internal server error during login.");
  }
});

// LOGOUT route: clear JWT cookie
app.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
  res.redirect("/login");
});

// PROFILE SAVE route (example: from profile form POST to /profileguide)
app.post("/profileguide", authenticateToken, async (req, res) => {
  try {
    const fullName = req.body.fullName?.trim();
    const genderRaw = req.body.gender;
    const customGender = req.body.customGender;
    const dob = req.body.dob;
    const weight = parseFloat(req.body.weight);
    const height = parseInt(req.body.height, 10);
    const bloodGroup = req.body.bloodGroup;
    const allergies = (req.body.allergies || "").trim();

    // Basic validation
    if (!fullName) {
      return res.send(`
        <script>
          alert('Full name is required.');
          window.location.href = "/profile";
        </script>
      `);
    }
    // Determine gender/customGender
    let gender = null;
    let customGenderValue = null;
    if (genderRaw === "other") {
      if (!customGender || !customGender.trim()) {
        return res.send(`
          <script>
            alert('Please specify your gender.');
            window.location.href = "/profile";
          </script>
        `);
      }
      customGenderValue = customGender.trim();
    } else {
      gender = genderRaw; // "male" or "female"
    }

    const userId = req.userId; // from JWT

    const insertQuery = `
      INSERT INTO profiles
        (user_id, full_name, gender, custom_gender, date_of_birth, weight_kg, height_cm, blood_group, allergies)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;
    const values = [
      userId,
      fullName,
      gender,
      customGenderValue,
      dob,
      weight,
      height,
      bloodGroup,
      allergies
    ];
    await db.query(insertQuery, values);

    return res.send(`
      <script>
        alert('Profile saved successfully.');
        window.location.href = "/home";
      </script>
    `);
  } catch (err) {
    console.error("Profile save error:", err);
    return res.status(500).send("Internal server error during profile save.");
  }
});
app.get("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const query = `
      SELECT
        full_name AS "fullName",
        gender,
        custom_gender AS "customGender",
        date_of_birth AS "dob",
        weight_kg AS "weight",
        height_cm AS "height",
        blood_group AS "bloodGroup",
        allergies
      FROM profiles
      WHERE user_id = $1
    `;
    const result = await db.query(query, [userId]);
    if (result.rows.length === 0) {
      // No profile yet: redirect or show message
      return res.redirect("/profileguide"); // or render a “no profile” page
    }
    const profile = result.rows[0];
    if (profile.dob instanceof Date) {
      profile.dob = profile.dob.toISOString().split("T")[0];
    }
    res.render("profile", { profile });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).send("Internal server error");
  }
});

//predict
const expectedFeatures = [
  "Fever", "Tiredness", "Dry-Cough", "Difficulty-in-Breathing",
  "Sore-Throat", "Pains", "Nasal-Congestion", "Runny-Nose", "Diarrhea",
  "None_Sympton", "Age_0-9", "Age_10-19", "Age_20-24", "Age_25-59", "Age_60+",
  "Gender_Female", "Gender_Male", "Gender_Transgender",
  "Contact_Dont-Know", "Contact_No", "Contact_Yes", "None_Experiencing"
];

app.post('/predict', async (req, res) => {
  try {
    const formData = req.body;

    // Send the form data to Flask server
    const response = await axios.post('http://127.0.0.1:3000/predict', formData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Send back the prediction to frontend
    res.json(response.data);
  } catch (error) {
    console.error('Prediction error:', error.message);
    res.status(503).json({
      error: '🛠️ Our prediction service is currently busy. Please try again shortly.'
    });
  }
});



//vault
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    const userId = req.userId;
    cb(null, file.fieldname + '-' + userId + path.extname(file.originalname));
  }
})

const upload = multer({ storage: storage })

app.post("/uploads", authenticateToken, upload.single('vaultdatas'), async (req, res) => {
  console.log("Form Body:", req.body);       // If you have any other fields in the form
  console.log("Uploaded File Info:", req.file); // Correct way to log uploaded file info
  const file = req.file;
  const userId = req.userId;
  const fieldname = file.fieldname;
  const originalname = file.originalname;
  const mimetype = file.mimetype;
  const size = file.size;

  const insertQuery = `
  INSERT INTO vaultdata (user_id, filename, original_name, mimetype, size)
  VALUES ($1, $2, $3, $4, $5)
`;
  await db.query(insertQuery, [userId, fieldname, originalname, mimetype, size]);
  res.send("File uploaded successfully!");
});

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "pages", "404.html"));
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
