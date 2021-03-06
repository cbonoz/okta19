from flask import Flask, request, session, jsonify
import json
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
application = Flask(__name__)
application.config.from_object(__name__)

CORS(application)

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

def add_step_count(x):
    x['stepCount'] = len(x['steps'])
    return x

# print a nice greeting.
def say_hello(username = "World"):
    return '<p>Hello %s!</p>\n' % username

# some bits of text for the page.
header_text = '''
    <html>\n<head> <title>EB Flask Test</title> </head>\n<body>'''
instructions = '''
    <p><em>Hint</em>: This is a RESTful web service! Append a username
    to the URL (for example: <code>/Thelonious</code>) to say hello to
    someone specific.</p>\n'''
home_link = '<p><a href="/">Back</a></p>\n'
footer_text = '</body>\n</html>'

# add a rule for the index page.
application.add_url_rule('/', 'index', (lambda: header_text +
    say_hello() + instructions + footer_text))

@application.route("/guides", methods=['POST'])
def post_guide():
    body = request.get_json()
    try:
        return jsonify(insert(body))
    except Exception as e:
        res = jsonify(str(e))
        res.status_code = 400
        return res

@application.route("/guides", methods=['GET'])
def get_guides():
    return jsonify(list(map(add_step_count, get_all())))

@application.route("/guides/<guide_author>", methods=['GET'])
def get_guides_by_author(guide_author):
    return jsonify(search_by_author(guide_author))

@application.route("/guides/<guide_name>", methods=['DELETE'])
def delete_guide(guide_name):
    remove(guide_name)
    return jsonify(True)

#### TWilio Callback

CONTINUE_TEXT = 'Text another guide name to start'

def not_found_message(guide_name):
    return "Could not find a guide with name %s. %s." % (guide_name, CONTINUE_TEXT)

def completed_message(guide_name):
    return "You completed %s! %s. Thanks for using OnboardSMS." % (guide_name, CONTINUE_TEXT)

def cancel_message(guide_name):
    return "You exited %s! %s. Thanks for using OnboardSMS." % (guide_name, CONTINUE_TEXT)

# https://www.twilio.com/docs/sms/tutorials/how-to-create-sms-conversations-python
@application.route("/twilio", methods=['POST'])
def twilio_hook():
    """Respond with the number of text messages sent between two parties."""
    # Increment the counter
    last_guide = session.get('last_guide', {})

    from_number = request.form['From']
    message_body = request.form['Body']

    resp = MessagingResponse()

    found_guide = None

    if message_body == 'c' or message_body == 'C' or len(message_body) < 2:
        # Continue with last guide if present.
        found_guide = last_guide

    if (message_body == 'q' or message_body == 'Q') and found_guide:
        # We have an active session and the user requested to quit.
        message = cancel_message(found_guide['name']) 
        session['last_guide'] = {}
        resp.message(message)
        return str(resp)

    if not found_guide:
        found_guides = search_by_name(message_body)

        if not found_guides:
            message = not_found_message(message_body)
            print('sending not found message', message)
            resp.message(message)
            return str(resp)
        found_guide = found_guides[0]

    # found_guide must be defined to proceed here.
    current_step = 0
    if 'current_step' in found_guide:
        current_step = found_guide['current_step']

    found_steps = found_guide['steps']

    if current_step >= len(found_steps):
        # Clear the guide state.
        session['last_guide'] = {}
        message = completed_message(found_guide['name'])
    else:
        message = found_steps[current_step]
        found_guide['current_step'] = current_step + 1

    session['last_guide'] = found_guide

    # Build our reply
    print('sending message', message)
    resp.message(message)
    return str(resp)

if __name__ == "__main__":
    application.run(debug=True)
