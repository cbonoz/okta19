# Onboard SMS
SMS Onboarding Guides in under 160 characters.

## Inspiration
Onboard SMS delivers guides and tutorials to you via text where ever you are,
regardless if you have WIFI connection or not.

Find/make any guide you want! For example, on addressing an injury when you're on a hike, setting up a piece of software, or just sharing your grilled cheese sandwich recipe.

## What it does
Enables anybody to set up a protected account and author new text-message guides.
1. Create a new guide
   1. Give your guide a name, like 'CPR tutorial'
   2. Give your app a short description
   3. Provide a list of short steps - each one will be delivered to the requester in a text.

2. Request a guide be delivered to phone. Simply text the guide name to an indicated phone number presented in the Onboard SMS guide search screen.

3. Step through the guide from your cell phone by simply sending a reply to the sent text.

4. Request another guide! Type in another guide name and get information on:
    * Emergencies - medical tips and procedures
    * Reminders and/or lists
    * Tutorials and Walkthroughs

## How I built it
* Using Okta for authentication flows along with a Flask API layer for receiving incoming texts and managing user guides. 
* Twilio for conversation flows, listening to messages, and managing text message fulfillment.
* TinyDB for server side storage.

## Challenges I ran into
* Managing state with the Twilio API. Using flask and a db state for the steps of the individual guide.
* Setting up a flexible UI/schema to query and manage guides.

## Accomplishments that I'm proud of
* I didn't think maintaining a conversation state (or creating a chat bot) could be possible - with the help of a few Twilio docs, was able to make it work!
* Okta React was a fairly simple way to manage state. Added redirect back to the home page if anyone isn't properly logged in. 
* It works

## What I learned
* Use Okta to manage authentication state of a react app using Okta, and pulling information from this state to send to a server
* How to interface with the Twilio API and maintain conversation state across people texting.

## What's next for OnboardSMS
* Deploy the server and open the platform for folks to create their own text message based guides.
* Add a paid version.
* Track and monitor usage.

### Dev Notes:
Add the following okta environment variables, replacing XXX with your personal okta app values, and Twilio phone number for the app:

<pre>
    REACT_APP_OKTA_DOMAIN=XXX
    REACT_APP_CLIENT_ID=XXX
    REACT_APP_PHONE=XXX
    REACT_APP_SERVER_URl=XXX
</pre>

* Start the client `onboardsms`:
<pre>
    cd onboardsms
    yarn && yarn start
</pre>
The website should now be running on port 3000.

* Start the server `/server`:
<pre>
    pip install -r requirements.txt
    python server.py
</pre>
The web server should now be running on port 5000.

