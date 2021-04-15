from flask import Flask

app = Flask(__name__)

@app.route('/home', methods=['GET'])
def index():
    return "Flask server"

if __name__ == "__main__":
    app.run(port=3000, debug=True)