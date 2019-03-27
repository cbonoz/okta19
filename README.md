# Onboard SMS
SMS Onboarding Guides in under 160 characters.

Onboard SMS enables guides and tutorials delivered to you where-ever you are in the world,
regardless if you have WIFI connection or not.

1. Create a new guide
   1. Ex: CPR
   2. List of steps

2. Request a guide be delivered to phone. Simply text the guide name to XXX-XXX-XXXX.
   1. Step through the guide from your cell phone.

3. Enter another guide!
    * Emergencies - medical tips and procedures
    * Reminders and/or lists
    * Tutorials and Walkthroughs

### API Usage:

* Twilio for conversation flows. 
* Okta for authentication and guide usage.

### Dev Notes:
Add the following okta environment variables, replacing XXX with your personal okta app values:
<pre>
    REACT_APP_OKTA_DOMAIN=XXX
    REACT_APP_CLIENT_ID=XXX
</pre>

* Start the client:
<pre>
    cd onboardsms
    yarn && yarn start
</pre>
The website should now be running on port 3000.

* Start the server:
<pre>
    # TODO: Install Dependencies
    python server.py
</pre>
The web server should now be running on port 5000.

