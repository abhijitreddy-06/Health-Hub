from model.medical_groups import get_group
from model.priors import DISEASE_PRIORS

# -------------------------
# Confidence label
# -------------------------
def confidence_label(score: float):
    if score >= 0.7:
        return "high"
    if score >= 0.4:
        return "moderate"
    return "low"


# -------------------------
# Apply dataset priors
# -------------------------
def apply_priors(predictions):
    adjusted = []

    for p in predictions:
        prior = DISEASE_PRIORS.get(p["condition"], 1.0)
        adjusted.append({
            "condition": p["condition"],
            "confidence": p["confidence"] * prior
        })

    return _normalize(adjusted)


# -------------------------
# Red flag detection
# -------------------------
def detect_red_flags(text: str):
    flags = []
    t = text.lower()

    if "chest pain" in t and ("left arm" in t or "jaw pain" in t):
        flags.append("Possible cardiac emergency")

    if "shortness of breath" in t:
        flags.append("Respiratory distress")

    if "loss of consciousness" in t or "seizure" in t:
        flags.append("Neurological emergency")

    return flags


# -------------------------
# Severity estimation
# -------------------------
def estimate_severity(text: str, red_flags):
    if red_flags:
        return "critical"

    t = text.lower()
    if any(w in t for w in ["high fever", "severe pain", "vomiting blood"]):
        return "moderate"

    return "low"


# -------------------------
# Recommendation
# -------------------------
def recommendation(severity: str):
    if severity == "critical":
        return "Seek emergency medical care immediately"
    if severity == "moderate":
        return "Consult a doctor soon"
    return "Monitor symptoms and rest"


# -------------------------
# Incompatible symptom map
# -------------------------
INCOMPATIBLE_SYMPTOMS = {
    "Dimorphic hemmorhoids(piles)": [
        "chest pain", "left arm", "shortness of breath",
        "fever", "cough", "paralysis", "headache"
    ]
}


# -------------------------
# Medical gating (VERY IMPORTANT)
# -------------------------
def apply_medical_gating(predictions, text: str):
    text_l = text.lower()
    gated = []

    for p in predictions:
        score = p["confidence"]
        disease = p["condition"]

        # 🚫 Hard medical incompatibility
        if disease in INCOMPATIBLE_SYMPTOMS:
            if any(sym in text_l for sym in INCOMPATIBLE_SYMPTOMS[disease]):
                score *= 0.02   # 🔥 very strong penalty

        if score > 0.005:
            gated.append({
                "condition": disease,
                "confidence": score
            })

    return _normalize(gated)


# -------------------------
# Core medical filter
# -------------------------
def filter_conditions(predictions, text: str, red_flags):
    filtered = []
    text_l = text.lower()

    for p in predictions:
        group = get_group(p["condition"])

        # 🚨 Emergency override
        if "Possible cardiac emergency" in red_flags:
            if group != "cardiac":
                continue

        # ❌ Anatomical mismatch
        if "chest pain" in text_l and group not in ["cardiac", "respiratory"]:
            continue

        p["group"] = group
        filtered.append(p)

    return filtered[:5]


# -------------------------
# Safe normalization utility
# -------------------------
def _normalize(predictions):
    total = sum(p["confidence"] for p in predictions)

    if total <= 0:
        return predictions

    for p in predictions:
        p["confidence"] /= total

    return predictions
