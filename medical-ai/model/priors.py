# model/priors.py

DISEASE_PRIORS = {
    "Dimorphic hemmorhoids(piles)": 0.4,
    "Common Cold": 0.7,
    "Gastroenteritis": 0.8,

    # critical diseases → boost
    "Heart attack": 1.6,
    "Paralysis (brain hemorrhage)": 1.6,
    "Tuberculosis": 1.3,
    "Hypertension": 1.2
}
