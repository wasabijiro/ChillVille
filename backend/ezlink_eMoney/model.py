import json
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib  # モデルの保存と読み込みに使用

# JSONファイルからデータを読み込み
json_file_path = '/mnt/data/ezlink_weekly_data.json'
with open(json_file_path, 'r') as f:
    data = json.load(f)

# 特徴量を抽出してDataFrameに変換
def extract_features(data):
    records = []
    for entry in data:
        # 各日付ごとのデータを平坦化
        card_id = entry['card_id']
        age = entry['personal_info']['age']
        gender = 1 if entry['personal_info']['gender'] == 'Male' else 0
        total_daily_trips = entry['usage']['transport']['total_daily_trips']
        total_daily_distance_km = entry['usage']['transport']['total_daily_distance_km']
        total_daily_spending_sgd = entry['usage']['purchases']['total_daily_spending_sgd']
        pattern_consistency = 1 if entry['pattern_consistency'] else 0
        
        # 特徴量とターゲットラベルをまとめる
        records.append([card_id, age, gender, total_daily_trips, total_daily_distance_km, total_daily_spending_sgd, pattern_consistency])
    
    df = pd.DataFrame(records, columns=['card_id', 'age', 'gender', 'total_daily_trips', 'total_daily_distance_km', 'total_daily_spending_sgd', 'pattern_consistency'])
    return df

# データフレームの作成
df = extract_features(data)

# 特徴量とターゲットの分割
X = df[['age', 'gender', 'total_daily_trips', 'total_daily_distance_km', 'total_daily_spending_sgd']]
y = df['pattern_consistency']

# 訓練用とテスト用にデータを分割
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

# ランダムフォレストモデルの作成と学習
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# モデルをテスト
accuracy = model.score(X_test, y_test)
print(f'Model Accuracy: {accuracy * 100:.2f}%')

# 学習済みモデルを保存
model_filename = '/mnt/data/ezlink_model.pkl'
joblib.dump(model, model_filename)

print(f"Model saved as {model_filename}")
