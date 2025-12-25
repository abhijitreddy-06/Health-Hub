# model/medical_groups.py

CONDITION_GROUPS = {
    "cardiac": {
        "Heart attack",
        "Hypertension",
        "Coronary artery disease"
    },
    "respiratory": {
        "Tuberculosis",
        "Pneumonia",
        "Bronchial Asthma",
        "Common Cold"
    },
    "gastrointestinal": {
        "Gastroenteritis",
        "Peptic ulcer disease",
        "GERD",
        "Dimorphic hemmorhoids(piles)"
    },
    "neurological": {
        "Migraine",
        "Paralysis (brain hemorrhage)",
        "Cervical spondylosis"
    },
    "infectious": {
        "Chicken pox",
        "AIDS",
        "Malaria",
        "Dengue",
        "Typhoid"
    }
}

def get_group(condition: str) -> str:
    for group, diseases in CONDITION_GROUPS.items():
        if condition in diseases:
            return group
    return "other"
