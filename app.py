from decouple import config
from flask import Flask, render_template, session
from flask_socketio import SocketIO, emit
import time

app = Flask(__name__)
app.config['DEBUG'] = config('DEBUG')

socketio = SocketIO(
    app,
    message_queue=config('MESSAGE_QUEUE'),
    cors_allowed_origins=config('CORS_ALLOWED_ORIGINS')
)

user_count = 0
login_users = []
messages = []
messages_limit = 20

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect')
def connect(auth):
    global user_count
    user_count += 1
    emit('count_update', {'user_count': user_count, 'login_users': login_users}, broadcast=True)
    emit('init_update', {'messages': messages})

@socketio.on('disconnect')
def disconnect():
    global user_count
    user_count -= 1
    if 'user_name' in session:
        try:
            login_users.remove(session['user_name'])
        except ValueError:
            pass
    emit('count_update', {'user_count': user_count, 'login_users': login_users}, broadcast=True)

@socketio.on('login_request')
def login_request(msg):
    user_name = msg['user_name']
    session['user_name'] = user_name
    login_users.append(user_name)
    emit('login_update', {'user_name': user_name, 'success': 1})
    emit('count_update', {'user_count': user_count, 'login_users': login_users}, broadcast=True)

@socketio.on('message_request')
def message_request(msg):
    if not 'user_name' in session:
        emit('logout', {})
        return
    message = {'from': session['user_name'], 'message': msg['message'], 'timestamp': time.time()}
    messages.append(message)
    if len(messages) > messages_limit:
        messages.pop()
    emit('message_update', message, broadcast=True)

@socketio.on('logout_request')
def logout_request(msg):
    if 'user_name' in session:
        try:
            login_users.remove(session['user_name'])
        except ValueError:
            pass
    session.clear()
    emit('count_update', {'login_users': login_users, 'login_users': login_users}, broadcast=True)
    emit('logout', {})


if __name__ == '__main__':
    socketio.run(app)
