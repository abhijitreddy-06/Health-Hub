from flask import Flask, request, jsonify
from model.disease_model import predict
from model.postprocess import (
    apply_medical_gating,
    apply_priors,
    filter_conditions,
    confidence_label,
    detect_red_flags,
    estimate_severity,
    recommendation
)

app = Flask(__name__)

@app.route("/ai/precheck", methods=["POST"])
def precheck():
    data = request.json
    text = data.get("text", "").strip()

    if not text:
        return jsonify({"error": "Symptoms required"}), 400

    # 1️⃣ MODEL PREDICTION
    raw = predict(text)

    # 2️⃣ FIX 2: PRIOR CALIBRATION
    raw = apply_priors(raw)

    # 3️⃣ FIX 1: MEDICAL GATING
    raw = apply_medical_gating(raw, text)

    # 4️⃣ RED FLAGS
    red_flags = detect_red_flags(text)

    # 5️⃣ FILTER & RANK
    filtered = filter_conditions(raw, text, red_flags)

    for p in filtered:
        p["confidence_label"] = confidence_label(p["confidence"])

    # 6️⃣ SEVERITY
    severity = estimate_severity(text, red_flags)

    # 🚨 CRITICAL OVERRIDE
    if severity == "critical":
        return jsonify({
            "input": text,
            "severity": severity,
            "recommendation": recommendation(severity),
            "red_flags": red_flags,
            "top_conditions": [],
            "disclaimer": "AI does not replace a licensed medical professional"
        })

    # ✅ NORMAL RESPONSE
    return jsonify({
        "input": text,
        "top_conditions": filtered,
        "severity": severity,
        "recommendation": recommendation(severity),
        "red_flags": red_flags,
        "disclaimer": "AI does not replace a licensed medical professional"
    })

if __name__ == "__main__":
    app.run(port=8000, debug=True)
