from flask import Flask, Response, send_from_directory

app = Flask(__name__)


@app.route("/")
def hello() -> Response:
    return send_from_directory("static", "index.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
