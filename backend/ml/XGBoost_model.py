import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import xgboost as xgb
import joblib

# Step 1: Load the JSON data into a pandas DataFrame
data = pd.read_json('human_bot_data.json')

# Step 2: Preprocessing
# Convert 'final_result' to binary (Human=1, Bot=0)
data['final_result'] = data['final_result'].apply(lambda x: 1 if x == 'Human' else 0)

# Features and target
X = data.drop("final_result", axis=1)  # Features (exclude final_result)
y = data["final_result"]  # Target (final_result)

# Optionally scale the features (important for some models)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Step 3: Split the data into training and test sets
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

# Step 4: Train the XGBoost model for classification
xgb_model = xgb.XGBClassifier(use_label_encoder=False)
xgb_model.fit(X_train, y_train)

# Step 5: Save the trained model to a file
xgb_model.save_model('xgboost_human_bot_model.dat')
