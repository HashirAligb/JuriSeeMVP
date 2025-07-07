from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/violations', methods=['GET'])
def get_violations():
    data = {
        "violations": [
            {"law_firm": "Smith & Associates", "violations": 12, "borough": "Manhattan"},
            {"law_firm": "Johnson Legal Group", "violations": 8, "borough": "Brooklyn"},
            {"law_firm": "Davis & Co.", "violations": 5, "borough": "Queens"}
        ]
    }
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True) 