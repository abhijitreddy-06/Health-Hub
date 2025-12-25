import json
import tensorflow as tf
import numpy as np

with open("temperature.json") as f:
    TEMPERATURE = json.load(f)["temperature"]

def predict(text, top_k=5):
    tokens = tokenizer(
        text,
        truncation=True,
        padding="max_length",
        max_length=64,
        return_tensors="tf"
    )

    logits = model.predict(
        [tokens["input_ids"], tokens["attention_mask"]],
        verbose=0
    )[0]

    # 🔥 APPLY TEMPERATURE SCALING
    probs = tf.nn.softmax(logits / TEMPERATURE).numpy()

    top_idx = probs.argsort()[-top_k:][::-1]

    return [
        {
            "condition": LABELS[i],
            "confidence": float(probs[i])
        }
        for i in top_idx
    ]
