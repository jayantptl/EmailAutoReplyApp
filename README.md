# EmailAutoReplyApp
Develop a Node.js application designed to handle email responses for your Gmail mailbox during your absence from work.

## Features
* Utilizes Login with Google API to effortlessly connect to your Gmail account and stay updated on incoming emails.

* The app identifies and isolates the email threads in which no prior email has been sent by the user.
* After sending the reply, the email is tagged with a label "onLeave" in Gmail. If the label is not created already, then it is created.
* App makes sure that no double replies are sent to any email at any point.  

* The app repeats this process in random intervals of 45 to 120 seconds.

## Libraries & Technologies
* NodeJs : The app is built using Nodejs
* Googleapis : Provides the necessary functionality to interact with various Google APIs such as Gmail API.
* OAuth 2.0 : oAuth2Client is used to handle OAuth 2.0 authentication for accessing the Gmail API. The Gmail API requires authentication to ensure that the user has granted permission for your application to access their Gmail data.
* node-cron : This library is used for scheduling tasks in Node.js using cron expressions, It is utilized for checking new emails in random intervals of 45 to 120 seconds.
  
#### OAuth 2.0 authentication setup process:
 * Create a Google Cloud Project:
         Go to the Google Cloud Console. Create a new project with a suitable name. Click "Create" to finalize the project creation.

* Navigate to Project Dashboard:
Click on the project name to go to the project dashboard.

* Create OAuth Client ID: In the left sidebar, click on "Credentials" under "APIs & Services"
Click "Create credentials" and choose "OAuth client ID".
Select "Web application" as the application type.
Provide a name for the OAuth 2.0 client ID.
Enter a redirect URI (e.g., "https://developers.google.com/oauthplayground").
Click "Create" to get the client ID and client secret. Copy these values.

* Enable Gmail API:
Enable the Gmail API for your project.

* Configure OAuth 2.0 Playground:
Open the OAuth 2.0 Playground.
Click the gear icon for settings.
Enter the client ID and client secret from step 3.
Click "Authorize APIs" and sign in with the Gmail account.
Scroll down, enter https://mail.google.com in the input box, and select the appropriate Gmail API scope.
Copy the authorization code displayed.

* Exchange Authorization Code for Tokens:
Click "Exchange authorization code for tokens".
Copy the refresh token displayed.

* Update Code with Credentials:
Replace placeholder values in your code (e.g., in .env).
Replace CLIENT_ID with the client ID value.
Replace CLIENT_SECRET with the client secret value.
Replace REDIRECT_URI with the redirect URI value.
Replace REFRESH_TOKEN with the refresh token value.

Now, your code should be configured with the necessary OAuth credentials to access the Gmail API on behalf of the specified Gmail account.

### Areas For Improvement
* Code Optimization For Scalling : The code can be optimized for improved efficiency, especially in handling larger volumes of emails, by processing them in batches.
* Personalized Configuration : Making the code more flexible by allowing users to provide their own settings, such as email id and credentials that can help them to qwickly setup the app.
* More Resilient Error Handling can be done. 

 Overall, The app successfully implements auto-reply functionality using the Gmail API.



  
