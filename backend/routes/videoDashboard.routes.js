import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import db from "../config/db.js";
import path from "path";

export default function videoDashboardRoutes(app, PROJECT_ROOT) {

    /* =====================================
       DOCTOR VIDEO DASHBOARD
    ===================================== */
    app.get(
        "/doc_video_dashboard",
        authenticate,
        authorize("doctor"),
        async (req, res) => {
            try {
                const result = await db.query(
                    `
                    SELECT a.id, a.appointment_time, u.phone
                    FROM appointments a
                    JOIN login u ON u.id = a.user_id
                    WHERE a.doctor_id = $1
                      AND a.status = 'scheduled'
                    ORDER BY a.appointment_time ASC
                    LIMIT 1
                    `,
                    [req.user.id]
                );

                res.render("doc_video_dashboard", {
                    appointment: result.rows[0] || null
                });

            } catch (err) {
                console.error("Doctor dashboard error:", err);
                res.status(500).send("Internal Server Error");
            }
        }
    );
    // MARK APPOINTMENT AS COMPLETED (doctor ends call)
    app.post(
        "/appointments/:id/complete",
        authenticate,
        authorize("doctor"),
        async (req, res) => {
            try {
                const { id } = req.params;

                await db.query(
                    `
                UPDATE appointments
                SET status = 'completed',
                    ended_at = NOW()
                WHERE id = $1
                  AND doctor_id = $2
                `,
                    [id, req.user.id]
                );

                res.json({ success: true });
            } catch (err) {
                console.error("Complete appointment error:", err);
                res.status(500).json({ error: "Failed to complete appointment" });
            }
        }
    );

    /* =====================================
       USER VIDEO DASHBOARD
    ===================================== */
    app.get(
        "/user_video_dashboard",
        authenticate,
        authorize("user"),
        async (req, res) => {
            try {
                const result = await db.query(
                    `
                    SELECT a.id, a.status, a.room_id, d.phone AS doctor_phone
                    FROM appointments a
                    JOIN doc_login d ON d.docid = a.doctor_id
                    WHERE a.user_id = $1
                      AND a.status IN ('scheduled','started')
                    ORDER BY a.appointment_time ASC
                    LIMIT 1
                    `,
                    [req.user.id]
                );

                res.render("user_video_dashboard", {
                    appointment: result.rows[0] || null
                });

            } catch (err) {
                console.error("User dashboard error:", err);
                res.status(500).send("Internal Server Error");
            }
        }
    );
}
