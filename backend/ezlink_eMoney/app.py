import pickle
from flask import Flask, request, jsonify
import numpy as np

app = Flask(__name__)

# 学習済みモデルを読み込む
model_filename = '/mnt/data/ezlink_model.pkl'
with open(model_filename, 'rb') as f:
    model = pickle.load(f)

# 特徴量を処理して予測する関数
def predict_transaction(data):
    features = np.array([
        data['age'],
        1 if data['gender'] == 'Male' else 0,
        data['total_daily_trips'],
        data['total_daily_distance_km'],
        data['total_daily_spending_sgd']
    ]).reshape(1, -1)  # モデルに入れるために2次元配列に変換
    prediction = model.predict(features)
    return prediction[0] == 1  # 1は正常(True), 0は異常(False)

# 取引データを受け取り、True/Falseを返すAPI
@app.route('/predict', methods=['POST'])
def predict():
    try:
        # リクエストデータをJSON形式で受け取る
        data = request.json
        # 予測を実行
        result = predict_transaction(data)
        return jsonify({"prediction": result})  # True（正常）またはFalse（異常）を返す
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
