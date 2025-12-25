def confidence_label(score):
    if score >= 0.6:
        return "high"
    if score >= 0.35:
        return "moderate"
    if score >= 0.2:
        return "low"
    return "uncertain"


def filter_conditions(predictions):
    """
    Remove junk predictions with very low confidence
    """
    return [
        p for p in predictions
        if p["confidence"] >= 0.15
    ]


def detect_red_flags(text):
    text = text.lower()
    flags = []

    if "chest pain" in text and ("left arm" in text or "jaw" in text):
        flags.append("Possible cardiac emergency")

    if "high fever" in text and "confusion" in text:
        flags.append("Possible severe infection")

    if "shortness of breath" in text:
        flags.append("Respiratory distress")

    return flags


def estimate_severity(text, red_flags):
    if red_flags:
        return "critical"

    text = text.lower()

    if "high fever" in text or "severe pain" in text:
        return "moderate"

    return "low"


def recommendation(severity):
    return {
        "critical": "Seek emergency medical care immediately",
        "moderate": "Consult a doctor within 24 hours",
        "low": "Monitor symptoms and rest"
    }.get(severity, "Consult a doctor")
