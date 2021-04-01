# Name

Instant Messaging Project 

# Authors

Blake Loveless

# Description

This is an attempt to create a functioning chat application because I want more practice working with javascript. The server must be run on a machine with node and mongodb installed. Note that this project is still a work in progress so many features are unavailable at this time.

# Installation

In the folder you pull the repository from run

```bash
npm install 
```

If you are connecting to a local mongodb instance, create a .env file with this inside

```javascript
DATABASE="mongodb://localhost/IMProject"
NODE_ENV='production'
```

then to start the server this on the command line 

```bash
npm start
```

Once the server is running you can connect as a user by opening this on your browser

```url
localhost:3000
```

# Road Map

## Current

Friends list front end. Want to have this working by 4/3/2021

## Next 

Homepage: Create the front end to add friends, then translate that into the chat structure

# History of Features

4/1/2021: Friends List backend working

3/30/2021: Send request and delete friend are both working properly, Friend test suite is working better

3/27/2021: User test suite complete, friend backend near complete, friend testing in progress

3/23/2021: User model updated with username, and friends list. API accepts friend requests. 

3/21/2021: Basic functionality of login, create account, and token management implemented

