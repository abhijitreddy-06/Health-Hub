import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import path from "path";
import crypto from "crypto";
import db from "../config/db.js";

export default function protectedRoutes(app, PROJECT_ROOT) {

    /* =========================
       USER PAGES
    ========================= */

    app.get("/user_home", authenticate, authorize("user"), (req, res) => {
        res.sendFile(path.join(PROJECT_ROOT, "public/pages/user_home.html"));
    });
    app.get(
        "/user_video_dashboard",
        authenticate,
        authorize("user"),
        (req, res) => {
            res.sendFile(
                path.join(PROJECT_ROOT, "public/pages/user_video_dashboard.html")
            );
        }
    );

    app.get("/appointments", authenticate, authorize("user"), (req, res) => {
        res.sendFile(
            path.join(PROJECT_ROOT, "public/pages/user_appointments.html")
        );
    });

    app.get(
        "/appointments/user",
        authenticate,
        authorize("user"),
        async (req, res) => {
            const result = await db.query(
                `
                SELECT a.*, p.full_name AS doctor_name, p.specialization
                FROM appointments a
                JOIN doc_profile p ON p.doc_id = a.doctor_id
                WHERE a.user_id = $1
                ORDER BY a.appointment_date, a.appointment_time
                `,
                [req.user.id]
            );

            res.render("user_dashboard", { appointments: result.rows });
        }
    );

    app.post(
        "/appointments",
        authenticate,
        authorize("user"),
        async (req, res) => {
            const { doctorId, date, time } = req.body;

            await db.query(
                `
                INSERT INTO appointments
                (user_id, doctor_id, appointment_date, appointment_time, status)
                VALUES ($1, $2, $3, $4, 'pending')
                `,
                [req.user.id, doctorId, date, time]
            );

            res.redirect("/appointments/user");
        }
    );

    app.get("/user_video/:roomId", authenticate, authorize("user"), (req, res) => {
        res.sendFile(
            path.join(PROJECT_ROOT, "public/pages/user_video.html")
        );
    });

    /* =========================
       DOCTOR PAGES
    ========================= */

    app.get("/doc_home", authenticate, authorize("doctor"), (req, res) => {
        res.sendFile(path.join(PROJECT_ROOT, "public/pages/doc_home.html"));
    });

    app.get(
        "/appointments/doctor",
        authenticate,
        authorize("doctor"),
        async (req, res) => {
            const result = await db.query(
                `
                SELECT a.*, u.phone AS user_phone
                FROM appointments a
                JOIN login u ON u.id = a.user_id
                WHERE a.doctor_id = $1
                ORDER BY a.appointment_date, a.appointment_time
                `,
                [req.user.id]
            );

            res.render("doc_dashboard", { appointments: result.rows });
        }
    );

    app.post(
        "/appointments/:id/start",
        authenticate,
        authorize("doctor"),
        async (req, res) => {
            const roomId = crypto.randomUUID();

            await db.query(
                `
            UPDATE appointments
            SET room_id = $1, status = 'started'
            WHERE id = $2 AND doctor_id = $3
            `,
                [roomId, req.params.id, req.user.id]
            );

            res.redirect(`/doc_video/${roomId}`);
        }
    );

    app.get("/doc_video/:roomId", authenticate, authorize("doctor"), (req, res) => {
        res.sendFile(
            path.join(PROJECT_ROOT, "public/pages/doc_video.html")
        );
    });

    app.get(
        "/doc_profile_create",
        authenticate,
        authorize("doctor"),
        (req, res) => {
            res.sendFile(
                path.join(PROJECT_ROOT, "public/pages/doc_profile_create.html")
            );
        }
    );
    app.get(
        "/doc_video_dashboard",
        authenticate,
        authorize("doctor"),
        (req, res) => {
            res.sendFile(
                path.join(PROJECT_ROOT, "public/pages/doc_video_dashboard.html")
            );
        }
    );


}
