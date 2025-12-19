import db from "../config/db.js";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";

export default function videoRoutes(app) {

    app.get(
        "/user_video/:roomId",
        authenticate,
        authorize("user"),
        (req, res) => {
            res.render("user_video", {
                roomId: req.params.roomId
            });
        }
    );

    app.get(
        "/doc_video/:roomId",
        authenticate,
        authorize("doctor"),
        async (req, res) => {
            const { roomId } = req.params;

            const result = await db.query(
                `
                SELECT id
                FROM appointments
                WHERE room_id = $1
                  AND doctor_id = $2
                LIMIT 1
                `,
                [roomId, req.user.id]
            );

            if (!result.rows.length) {
                return res.status(404).send("Appointment not found");
            }

            res.render("doc_video", {
                roomId,
                appointment: {
                    id: result.rows[0].id
                }
            });
        }
    );
}
