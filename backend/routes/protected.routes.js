import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import path from "path";

export default function protectedRoutes(app, PROJECT_ROOT) {

    /* =========================
       USER PAGES
    ========================= */

    app.get("/user_home", authenticate, authorize("user"), (req, res) => {
        res.sendFile(path.join(PROJECT_ROOT, "public/pages/user_home.html"));
    });

    app.get("/appointments", authenticate, authorize("user"), (req, res) => {
        res.sendFile(
            path.join(PROJECT_ROOT, "public/pages/user_appointments.html")
        );
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

    /* =========================
       DOCTOR PAGES
    ========================= */

    app.get("/doc_home", authenticate, authorize("doctor"), (req, res) => {
        res.sendFile(path.join(PROJECT_ROOT, "public/pages/doc_home.html"));
    });

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

    app.get(
        "/doc_video/:roomId",
        authenticate,
        authorize("doctor"),
        (req, res) => {
            res.render("doc_video", {
                roomId: req.params.roomId
            });
        }
    );

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
}
