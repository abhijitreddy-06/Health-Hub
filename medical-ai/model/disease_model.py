import json
import numpy as np
import tensorflow as tf
from transformers import BertTokenizer, TFBertModel

# =========================
# PATHS
# =========================
MODEL_PATH = "A:\\Health Huub\\medical-ai\\training\\training\\saved_model\\disease_classifier_finetuned.keras"
LABELS_PATH = "A:\\Health Huub\\medical-ai\\training\\training\\saved_model\\labels.json"
TEMP_PATH = "A:\\Health Huub\\medical-ai\\training\\training\\temperature.json"
MODEL_NAME = "emilyalsentzer/Bio_ClinicalBERT"
MAX_LEN = 64

# =========================
# LOAD MODEL & METADATA
# =========================
tokenizer = BertTokenizer.from_pretrained(MODEL_NAME)

model = tf.keras.models.load_model(
    MODEL_PATH,
    custom_objects={"TFBertModel": TFBertModel}
)

with open(LABELS_PATH) as f:
    LABELS = json.load(f)

with open(TEMP_PATH) as f:
    TEMPERATURE = json.load(f)["temperature"]

print(f"✅ Loaded model with temperature = {TEMPERATURE:.2f}")

# =========================
# PREDICT FUNCTION
# =========================
def predict(text: str, top_k=5):
    tokens = tokenizer(
        text,
        truncation=True,
        padding="max_length",
        max_length=MAX_LEN,
        return_tensors="tf"
    )

    logits = model(
        [tokens["input_ids"], tokens["attention_mask"]],
        training=False
    )

    # 🔥 TEMPERATURE SCALING
    scaled_logits = tf.math.log(logits) / TEMPERATURE
    probs = tf.nn.softmax(scaled_logits).numpy()[0]

    top_idx = probs.argsort()[-top_k:][::-1]

    return [
        {
            "condition": LABELS[i],
            "confidence": float(probs[i])
        }
        for i in top_idx
    ]
