from flask import Flask, request, jsonify
from model.disease_model import predict
from model.postprocess import (
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

    raw = predict(text)
    filtered = filter_conditions(raw)

    for p in filtered:
        p["confidence_label"] = confidence_label(p["confidence"])

    red_flags = detect_red_flags(text)
    severity = estimate_severity(text, red_flags)

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
