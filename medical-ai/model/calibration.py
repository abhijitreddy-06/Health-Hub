import numpy as np

TEMPERATURE = 1.8  # medical-safe default

def softmax(logits):
    exps = np.exp(logits - np.max(logits))
    return exps / np.sum(exps)

def calibrate(logits, temperature=TEMPERATURE):
    scaled_logits = logits / temperature
    return softmax(scaled_logits)

def confidence_label(prob):
    if prob >= 0.8:
        return "very likely"
    if prob >= 0.55:
        return "likely"
    if prob >= 0.35:
        return "possible"
    return "uncertain"
