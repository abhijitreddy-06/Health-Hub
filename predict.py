from flask import Flask, request, jsonify
import joblib
import pandas as pd
import os

app = Flask(__name__)

# Load the trained model
model = joblib.load('covid_binary_model.pkl')

# Load the list of expected features
with open('model_features.txt', 'r') as f:
    EXPECTED_FEATURES = [line.strip() for line in f.readlines()]

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get the input JSON data
        data = request.get_json()

        # Construct a dictionary with all expected features
        input_data = {feature: data.get(feature, 0) for feature in EXPECTED_FEATURES}

        # Convert to DataFrame
        df = pd.DataFrame([input_data])

        # Make prediction
        prediction = model.predict(df)[0]
        result = "Positive" if prediction == 1 else "Negative"

        return jsonify({"prediction": result})

    except Exception as e:
        print("Prediction error:", str(e))
        return jsonify({"error": "Prediction service is currently unavailable. Please try again later."}), 503
@app.route("/", methods=["GET"])
def home():
    return "🧠 COVID Prediction API is running!", 200

if __name__ == '__main__':
    app.run(port=3000)
