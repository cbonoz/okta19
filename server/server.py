from flask import Flask, request, session
from twilio.twiml.messaging_response import MessagingResponse
from tinydb import TinyDB, Query
from tinydb.storages import JSONStorage
from tinydb.middlewares import CachingMiddleware
from datetime import datetime

# Secret key for session object
SECRET_KEY = 'd64da3ef-bd48-4b29-b759-6f142c6274f4'
# https://github.com/msiemens/tinydb
db = TinyDB('guides.json', storage=CachingMiddleware(JSONStorage))
app = Flask(__name__)
app.config.from_object(__name__)

Guide = Query()
"""
Guide Schema:
{
    author: XXX,
    createdAt: XXX,
    name: XXX,
    steps: [

    ]
}
"""

### UTILITIES

def search_by_name(guide_name):
    return db.search(Guide.name == guide_name)

def search_by_auth(guide_author)
    return db.search(Guide.author == guide_author)

def get_all():
    return db.search()

def insert(author, guide_name, steps):
    if not guide_name:
        raise Exception('guide name must be specified')
    
    if not steps:
        raise Exception('guide must have at least one step')

    if not author:
        raise Exception('guide must have an author')

    if search_by_name(guide['name']):
        raise Exception('guide name already exists')

    db.insert({
        'author': author,
        'name': guide_name,
        'steps': steps,
        'createdAt': datetime.timestamp()
    })
    return True

def remove(guide_name):
    db.remove(Guide.name == guide_name)


def not_found_message(guide_name):
    return "Could not find a guide with name %s" % guide_name

def completed_message(guide_name):
    return "You completed %s! Send another name to start another" % guide_name


### ENDPOINTS

#### Guide routes

@app.route("/guides", methods=['POST'])
def post_guide

@app.route("/guides", methods=['GET'])
def get_guides


@app.route("/guides", methods=['DELETE'])
def delete_guide


#### TWilio Callback

# https://www.twilio.com/docs/sms/tutorials/how-to-create-sms-conversations-python
@app.route("/sms", methods=['POST'])
def hello():
    """Respond with the number of text messages sent between two parties."""
    # Increment the counter
    guides = session.get('guides', {})
    message_body = request.form['Body']

    resp = MessagingResponse()

    found_guide = search_by_name(message_body)

    if not found_guide:
        resp.message(not_found_message(message_body))
        return str(resp)

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
    resp.message(found_step)
    return str(resp)

if __name__ == "__main__":
    app.run()