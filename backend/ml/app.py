from flask import Flask, request, jsonify
from flask_cors import CORS
import xgboost as xgb
import pandas as pd

# Flaskアプリケーションの初期化
app = Flask(__name__)

# CORSの設定
CORS(app)

# 学習済みXGBoostモデルのロード
model_path = './xgboost_human_bot_model.dat'  # 学習済みモデルのファイルパス
model = xgb.XGBClassifier()
model.load_model(model_path)

# エンドポイントの作成
@app.route('/predict', methods=['POST'])
def predict():
    try:
        print("Predict Started!")
        # クライアントから送信されたデータをJSON形式で受け取る
        data = request.get_json(force=True)
        
        # JSONデータをDataFrameに変換
        input_data = pd.DataFrame(data, index=[0])
        
        # モデルを使って予測を行う
        prediction = model.predict(input_data)
        
        # 予測結果を「Human」か「Bot」に変換
        prediction_label = "Human" if prediction[0] == 1 else "Bot"
        
        # 結果をJSON形式で返す
        return jsonify({'prediction': prediction_label})

    except Exception as e:
        # エラーハンドリング
        return jsonify({'error': str(e)}), 500


# メインプログラム
if __name__ == '__main__':
    # APIサーバーの起動
    app.run(debug=True, host='0.0.0.0', port=5001)


