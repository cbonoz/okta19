from flask import Flask, request, session, jsonify
from flask_cors import CORS
from twilio import twiml
from twilio.twiml.messaging_response import MessagingResponse
from tinydb import TinyDB, Query
import time

# Secret key for session object
SECRET_KEY = 'd64da3ef-bd48-4b29-b759-6f142c6274f4'
# https://github.com/msiemens/tinydb
db = TinyDB('guides.json')
guide_table = db.table('guides')
app = Flask(__name__)
app.config.from_object(__name__)

CORS(app)

Guide = Query()
"""
Guide Schema:
{
    author: XXX,
    createdAt: XXX,
    description: XXX,
    name: XXX,
    steps: [
        ... # list of steps in the guide.
    ]
}
"""
### UTILITIES

def search_by_name(guide_name):
    return guide_table.search(Guide.name == guide_name)

def search_by_author(guide_author):
    return guide_table.search(Guide.author == guide_author)

def get_all():
    return guide_table.all()

def insert(guide):

    if 'name' not in guide:
        raise Exception('guide name must be specified')

    name = guide['name']
    if len(name) < 3:
        raise Exception('name must be at least 3 characters')

    if 'description' not in guide:
        raise Exception('guide description must be specified')

    if 'author' not in guide:
        raise Exception('guide author must be specified')

    if 'steps' not in guide:
        raise Exception('guide steps must be specified')

    steps = guide['steps']
    if not steps or len(steps) < 1:
        raise Exception('guide must have at least one step')

    for i, step in enumerate(steps):
        if len(step) > 160:
            raise Exception('step %d too long (max 160 characters)' % i)

    if search_by_name(guide['name']):
        raise Exception('guide name already exists')

    created_guide = {
        'author': guide['author'],
        'name': name,
        'steps': steps,
        'description': guide['description'],
        'createdAt': time.time()
    }
    guide_table.insert(created_guide)
    return created_guide

def remove(guide_name):
    guide_table.remove(Guide.name == guide_name)

### ENDPOINTS

#### Guide routes

@app.route("/guides", methods=['POST'])
def post_guide():
    body = request.get_json()
    try:
        return jsonify(insert(body))
    except Exception as e:
        res = jsonify(str(e))
        res.status_code = 400
        return res

def add_step_count(x):
    x['stepCount'] = len(x['steps'])
    return x

@app.route("/guides", methods=['GET'])
def get_guides():
    return map(add_step_count, jsonify(get_all()))

@app.route("/guides/<guide_author>", methods=['GET'])
def get_guides_by_author(guide_author):
    return jsonify(search_by_author(guide_author))

@app.route("/guides/<guide_name>", methods=['DELETE'])
def delete_guide(guide_name):
    remove(guide_name)
    return jsonify(True)

#### TWilio Callback

def not_found_message(guide_name):
    return "Could not find a guide with name %s" % guide_name

def completed_message(guide_name):
    return "You completed %s! Text another guide name to start. Thanks for using Onboard SMS." % guide_name

def cancel_message(guide_name):
    return "You exited %s! Text another." % guide_name

# https://www.twilio.com/docs/sms/tutorials/how-to-create-sms-conversations-python
@app.route("/sms", methods=['POST'])
def hello():
    """Respond with the number of text messages sent between two parties."""
    # Increment the counter
    guides = session.get('guides', {})

    number = request.form['From']
    message_body = request.form['Body']
    print('body', message_body)
    resp = MessagingResponse()

    if message_body == 'q':
       del guides[guide_name]
       message = cancel_message(guide_name) 

    found_guides = search_by_name(message_body)

    if not found_guides:
        message = not_found_message(message_body)
        print('sending not found message', message)
        resp.message(message)
        return str(resp)

    found_guide = found_guides[0]

    guide_name = found_guide['name']
    if guide_name not in guides:
        guides[guide_name] = 0

    current_step = guides[guide_name]

    found_steps = found_guide['steps']

    if current_step >= len(found_steps):
        # Clear the guide state.
        del guides[guide_name]
        message = completed_message(guide_name)
    else:
        message = found_steps[current_step]
        guides[guide_name] += 1

    session['guides'] = guides

    # Build our reply
    print('sending message', message)
    resp.message(message)
    return str(resp)

if __name__ == "__main__":
    app.run()
