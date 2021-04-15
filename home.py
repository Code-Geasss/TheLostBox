from flask import Flask

app = Flask(__name__)

@app.route('/home/<title>', methods=['GET'])
def index(title):
    print(title)
    return "Flask server"

if __name__ == "__main__":
    app.run(port=3000, debug=True)