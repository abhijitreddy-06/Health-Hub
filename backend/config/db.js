import pg from "pg";

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "CottonCure",
    password: "Abhi.data",
    port: 5432,
});

db.connect(err => {
    if (err) console.error("Failed to connect to PostgreSQL:", err.stack);
    else console.log("Connected to PostgreSQL");
});

export default db;
