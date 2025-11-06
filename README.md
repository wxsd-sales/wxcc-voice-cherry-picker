# Contact Center Voice Call Cherry Picker Widget

Hosts a widget which will function inside of Contact Center Agent Desktop that allows a Webex CC agent to cherry pick queued voice calls utilizing the Get Tasks and Assign Task APIs.   

## Demo
[![Vidcast Overview](https://github.com/user-attachments/assets/a4d42315-5ea6-4a1e-b080-496abe5e55f0)](https://app.vidcast.io/share/1ec61338-9263-4e20-95c7-87cb24dfbdf3)



## Developer Documentation

**https://developer.webex.com/webex-contact-center/docs/api/v1/tasks-call-control**  

## Getting Started

- Clone this repository:
- ```git clone https://github.com/wxsd-sales/wxcc-voice-cherry-picker/.git```

The widget can be hosted locally for testing on the same machine as the agent desktop.  However, you will want to deploy this to a webserver with an SSL certificate when going live.

To understand how to interact with our Desktop Layout, please watch the video and supplemental detailed documentation @ **[Desktop Layout - Administration Guide](https://www.cisco.com/c/en/us/td/docs/voice_ip_comm/cust_contact/contact_center/webexcc/SetupandAdministrationGuide_2/b_mp-release-2/b_cc-release-2_chapter_011.html#topic_8230815F4023699032326F948C3F1495)**

## Installation

### 1. Set up the .env file
- a. Inside this project's root folder, rename the file ```.env.example``` to ```.env```
- b. In a text editor, open the ```.env```
- c. Choose a ```PORT``` or use ```PORT=5000``` if you are not sure what to use.
- d. Paste your base url for your server between the double quotes of ```HOST_URI=""```.  If referring to examples from step 1, then either:
  - i. ```HOST_URI="http://localhost:5000"```
  - ii. ```HOST_URI="https://your.server.com"```

### 2.a. Running the widget webserver as a container (Docker) (recommended)

- If you prefer to run this through ```npm```, skip this step and proceed to 3.b.
- Otherwise, run the following commands from the terminal inside your project's root directory:
- `docker build -t wxcc-voice-cherry-picker .`
- `docker run -p 5000:5000 -i -t wxcc-voice-cherry-picker`
  - replace `5000` in both places with the ```PORT``` used in your `.env` file.  

### 2.b. Running the widget webserver (npm)
_Node.js version >= 21.5 must be installed on the system in order to run this through npm._

- It is recommended that you run this as a container (step 3.a.).
- If you do not wish to run the webserver as a container (Docker), proceed with this step:
- Inside this project on your terminal type: `npm install`
- Then inside this project on your terminal type: `npm run build`
- Then inside this project on your terminal type: `npm start`
- This should run the app on your ```PORT``` (from .env file)


### 3. Wire Up the Widget to the Layout:

- You must replace the url on line 108 of the **_cherryPickerWidget.json_** file with your correct server endpoint. For examples:
  - "script": "http://localhost:5000/build/bundle.js",
  - "script": "https://your.webserver.com/build/bundle.js",
- This should be based on the ```HOST_URI``` in your .env file + ```/build/bundle.js```.
  
- Upload the **_callControlWidget.json_** file onto your Administration Portal **[WebexCC Portal - US](https://portal.wxcc-us1.cisco.com/portal/home.html#)**
  - _link above is referencing the US portal link please change if you are in different geo (us1, eu1, eu2, anz1)_
  - Note that Layouts are configured per Agent Team.
- Log in to your agent and select the right Team to view the new layout.

**Additional Improvements:**

- You can modify the widget as required.
- To create a new compiled JS file, using `npm run build` which will create the new compiled JS under `build/bundle.js`.
- You may rename this file, host it on your server of choice, and use this as the widget `src` parameter in the layout.

## License

All contents are licensed under the MIT license. Please see [license](LICENSE) for details.

## Disclaimer

<!-- Keep the following here -->  
Everything included is for demo and Proof of Concept purposes only. Use of the site is solely at your own risk. This site may contain links to third party content, which we do not warrant, endorse, or assume liability for. These demos are for Cisco Webex usecases, but are not Official Cisco Webex Branded demos.
 
 
## Support

Please contact the Webex SD team at [wxsd@external.cisco.com](mailto:wxsd@external.cisco.com?subject=CCCherryPickerWidget) for questions. Or for Cisco internal, reach out to us on Webex App via our bot globalexpert@webex.bot & choose "Engagement Type: API/SDK Proof of Concept Integration Development". 
