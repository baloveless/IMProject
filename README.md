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

If you are connecting to a local mongodb instance, create a .env file with the line

```javascript
DATABASE="mongodb://localhost/IMProject"
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

Overall the goal is to first create a proper backend with automated testing implemented by using postman. 

Login Functions: Hoping to have this working correctly by 3/27/2021

Next goal will be the functionality for creating a friends list which will be used as a jumping off point for creating chat rooms. 