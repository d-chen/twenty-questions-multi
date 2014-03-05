import os.path
from flask import Flask, render_template
from flask.ext.socketio import SocketIO, emit

parent_dir = os.path.join(os.path.dirname(__file__), os.pardir)
static_dir = os.path.join(parent_dir, 'app')

app = Flask(__name__, template_folder=static_dir, static_folder=static_dir)
socketio = SocketIO(app)

app.config['DEBUG'] = True

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/css/<path:path>')
def static_css(path):
    return app.send_static_file(os.path.join('css', path))

@app.route('/lib/<path:path>')
def static_lib(path):
    return app.send_static_file(os.path.join('lib', path))

@app.route('/js/<path:path>')
def static_js(path):
    return app.send_static_file(os.path.join('js', path))


@socketio.on('my event')
def test_message(message):
    emit('my response', {'data': 'got it!'})

if __name__ == '__main__':
    socketio.run(app)