from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
from tensorflow.keras import layers, models, optimizers # Added this
import numpy as np
from PIL import Image
import io

# ==========================================
# 1. SERVER SETUP
# ==========================================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 2. DEFINE & LOAD AI MODEL (The Fix)
# ==========================================
IMG_SIZE = 224

# The exact list of classes from your training
# Updated list based on your CSV structure (Likely 16 columns)
FINAL_COLS = [
    'Dark Circle', 'Eyebag', 'acne scar', 'blackhead', 'dark spot', 
    'freckle', 'melasma', 'nodule', 'papule', 'pustule', 'redness', 
    'whitehead', 'wrinkle', 'oily skin', 'dry skin', 'large pores'
]

def build_model(num_classes):
    # Re-create the exact same architecture used in training
    base_model = tf.keras.applications.EfficientNetB0(
        weights='imagenet', 
        include_top=False, 
        input_shape=(IMG_SIZE, IMG_SIZE, 3)
    )
    
    # We must set this to True because we fine-tuned it
    base_model.trainable = True 

    model = models.Sequential()
    model.add(base_model)
    model.add(layers.GlobalAveragePooling2D())
    model.add(layers.Dense(1024, activation='relu'))
    model.add(layers.Dropout(0.5))
    model.add(layers.Dense(num_classes, activation='sigmoid'))
    
    return model

print("Building Skin AI Model...")
try:
    # 1. Build the empty skeleton
    model = build_model(len(FINAL_COLS))
    
    # 2. Load the trained weights into the skeleton
    model.load_weights('best_skin_model.keras')
    print("✅ Model loaded successfully!")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    print("Make sure 'best_skin_model.keras' is in the backend folder.")

# ==========================================
# 3. KNOWLEDGE BASE
# ==========================================
ingredient_map = {
    'pimples': ['Salicylic Acid', 'Tea Tree Oil'],
    'papules': ['Niacinamide', 'Salicylic Acid'],
    'pustules': ['Benzoyl Peroxide', 'Centella'],
    'nodules': ['Adapalene (Differin)', 'Retinol'], 
    'acne scar': ['Vitamin C', 'Alpha Arbutin'],
    'dark spot': ['Vitamin C', 'Tranexamic Acid'],
    'Dark Circle': ['Caffeine', 'Retinol Eye Cream'],
    'melasma': ['Azelaic Acid', 'Kojic Acid'],
    'freckle': ['SPF 50+ Sunscreen', 'Niacinamide'],
    'wrinkle': ['Retinol', 'Peptides'],
    'large pores': ['Niacinamide', 'BHA Exfoliant'],
    'blackhead': ['Salicylic Acid (BHA)', 'Clay Mask'],
    'whitehead': ['Glycolic Acid (AHA)'],
    'oily skin': ['Niacinamide', 'Oil-Free Moisturizer'],
    'dry skin': ['Hyaluronic Acid', 'Ceramides'],
    'redness': ['Centella Asiatica', 'Azelaic Acid'],
    'sun tan': ['Vitamin C', 'Aloe Vera']
}

product_db = [
    {'ingredient': 'Salicylic Acid', 'name': 'CeraVe Renewing SA Cleanser', 'type': 'Cleanser'},
    {'ingredient': 'Niacinamide', 'name': 'The Ordinary Niacinamide 10% + Zinc', 'type': 'Serum'},
    {'ingredient': 'Benzoyl Peroxide', 'name': 'Benzac AC 2.5% Gel', 'type': 'Spot Treat'},
    {'ingredient': 'Vitamin C', 'name': 'Minimalist Vitamin C 10%', 'type': 'Serum'},
    {'ingredient': 'Retinol', 'name': 'CeraVe Resurfacing Retinol Serum', 'type': 'Night Serum'},
    {'ingredient': 'Hyaluronic Acid', 'name': 'Neutrogena Hydro Boost Gel', 'type': 'Moisturizer'},
    {'ingredient': 'Ceramides', 'name': 'CeraVe Moisturizing Cream', 'type': 'Moisturizer'},
    {'ingredient': 'Caffeine', 'name': 'The Ordinary Caffeine Solution 5%', 'type': 'Eye Serum'},
    {'ingredient': 'BHA', 'name': 'Paula\'s Choice 2% BHA Liquid', 'type': 'Exfoliant'},
    {'ingredient': 'Centella', 'name': 'COSRX Cica Serum', 'type': 'Serum'},
    {'ingredient': 'Azelaic Acid', 'name': 'The Ordinary Azelaic Acid 10%', 'type': 'Treatment'},
    {'ingredient': 'SPF 50+ Sunscreen', 'name': 'La Roche-Posay Anthelios SPF 50', 'type': 'Sunscreen'}
]

# ==========================================
# 4. API ENDPOINTS
# ==========================================
@app.get("/")
def home():
    return {"status": "Skin AI API is Running", "model_loaded": model is not None}

@app.post("/analyze")
async def analyze_skin(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    try:
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data)).convert('RGB')
        image = image.resize((IMG_SIZE, IMG_SIZE))
        
        img_array = np.array(image)
        img_batch = np.expand_dims(img_array, axis=0)
        
        # Predict
        predictions = model.predict(img_batch)[0]
        
        detected_issues = []
        needed_ingredients = set()
        
        for i, prob in enumerate(predictions):
            if prob > 0.30: # 30% Threshold
                condition = FINAL_COLS[i]
                detected_issues.append({
                    "condition": condition,
                    "confidence": float(prob * 100)
                })
                if condition in ingredient_map:
                    for ing in ingredient_map[condition]:
                        needed_ingredients.add(ing)
        
        routine = []
        if not detected_issues:
            routine = [
                {"step": "1. Cleanse", "product": "Cetaphil Gentle Cleanser", "why": "Daily Maintenance"},
                {"step": "2. Moisturize", "product": "CeraVe Moisturizing Cream", "why": "Barrier Protection"},
                {"step": "3. Protect", "product": "SPF 50 Sunscreen", "why": "Prevention"}
            ]
            detected_issues.append({"condition": "Healthy Skin", "confidence": 100.0})
        else:
            cleanser = next((p for p in product_db if p['type'] == 'Cleanser' and any(i in p['ingredient'] for i in needed_ingredients)), None)
            if cleanser:
                routine.append({"step": "1. Cleanse", "product": cleanser['name'], "why": f"Contains {cleanser['ingredient']}"})
            else:
                routine.append({"step": "1. Cleanse", "product": "Gentle Foaming Cleanser", "why": "Prep skin"})

            treatments = [p for p in product_db if p['type'] in ['Serum', 'Exfoliant', 'Spot Treat', 'Night Serum'] and any(i in p['ingredient'] for i in needed_ingredients)]
            seen_types = set()
            for t in treatments:
                if len(routine) >= 3: break
                if t['type'] not in seen_types:
                    routine.append({"step": "2. Treat", "product": t['name'], "why": f"Targets {t['ingredient']}"})
                    seen_types.add(t['type'])

            moisturizer = next((p for p in product_db if p['type'] == 'Moisturizer' and any(i in p['ingredient'] for i in needed_ingredients)), None)
            if moisturizer:
                routine.append({"step": "3. Moisturize", "product": moisturizer['name'], "why": f"Contains {moisturizer['ingredient']}"})
            else:
                routine.append({"step": "3. Moisturize", "product": "CeraVe Moisturizing Cream", "why": "Lock in hydration"})

        return {
            "diagnosis": detected_issues,
            "routine": routine,
            "ingredients": list(needed_ingredients)
        }

    except Exception as e:
        print(f"Error analyzing image: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error during analysis")