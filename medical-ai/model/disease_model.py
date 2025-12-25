import tensorflow as tf
from transformers import TFBertModel, BertTokenizer
import json
import numpy as np

MODEL_NAME = "emilyalsentzer/Bio_ClinicalBERT"

tokenizer = BertTokenizer.from_pretrained(MODEL_NAME)
bert = TFBertModel.from_pretrained(MODEL_NAME)

# Load disease labels
with open("model/labels.json") as f:
    LABELS = json.load(f)

NUM_CLASSES = len(LABELS)

# Simple classifier head
classifier = tf.keras.Sequential([
    tf.keras.layers.Dense(256, activation="relu"),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(NUM_CLASSES, activation="softmax")
])

def predict(symptoms_text: str):
    """
    Returns top disease predictions with probabilities
    """
    inputs = tokenizer(
        symptoms_text,
        return_tensors="tf",
        truncation=True,
        padding=True,
        max_length=128
    )

    cls_embedding = bert(**inputs).last_hidden_state[:, 0, :]
    probs = classifier(cls_embedding).numpy()[0]

    results = sorted(
        zip(LABELS, probs),
        key=lambda x: x[1],
        reverse=True
    )

    return [
        {
            "condition": label,
            "confidence": float(round(score, 3))
        }
        for label, score in results[:5]
    ]
