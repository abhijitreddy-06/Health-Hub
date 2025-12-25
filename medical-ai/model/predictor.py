import json
from model.disease_model import predict_logits
from model.calibration import calibrate, confidence_label

# ✅ Load labels correctly
with open("model/labels.json", "r") as f:
    LABELS = json.load(f)

def predict(symptoms_text):
    logits = predict_logits(symptoms_text)
    probs = calibrate(logits)

    results = sorted(
        zip(LABELS, probs),
        key=lambda x: x[1],
        reverse=True
    )

    return [
        {
            "condition": label,
            "confidence": round(float(score), 2),
            "confidence_label": confidence_label(score)
        }
        for label, score in results[:3]
    ]
