import path from "path";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import db from "../config/db.js";

export default function videoRoutes(app, PROJECT_ROOT) {

    // =============================
    // DOCTOR VIDEO (EJS)
    // =============================
    app.get(
        "/doc_video/:roomId",
        authenticate,
        authorize("doctor"),
        async (req, res) => {
            const result = await db.query(
                `
                SELECT *
                FROM appointments
                WHERE room_id = $1
                  AND doctor_id = $2
                  AND status = 'started'
                `,
                [req.params.roomId, req.user.id]
            );

            if (!result.rows.length) {
                return res.redirect("/doc_video_dashboard");
            }

            res.render("doc_video", {
                appointment: result.rows[0]
            });
        }
    );

    // =============================
    // USER VIDEO (STATIC HTML)
    // =============================
    app.get(
        "/user_video/:roomId",
        authenticate,
        authorize("user"),
        (req, res) => {
            res.sendFile(
                path.join(
                    PROJECT_ROOT,
                    "public/pages/user_video.html"
                )
            );
        }
    );
}
