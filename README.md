## Name

Instant Messaging Project 

## Authors

Blake Loveless

## Description

This is an attempt to create a functioning chat application because I want more practice working with javascript. This app requires the user to have node and mongodb installed on their device. Note that this project is still a work in progress so many features are unavailable at this time.

## Installation

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

## Road Map

# Current

Friends List: Working on creating and sending friend requests on the back end. Should be done by 3/27/2021

# Next 

Homepage: Create the front end to add friends, then translate that into the chat structure

## History of Features

3/27/2021: User test suite complete, friend backend near complete, friend testing in progress

3/23/2021: User model updated with username, and friends list. API accepts friend requests. 

3/21/2021: Basic functionality of login, create account, and token management implemented

