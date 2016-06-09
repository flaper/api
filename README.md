#Flaper API  [![Build Status](https://travis-ci.org/flaper/api.svg?branch=master)](https://travis-ci.org/flaper/api)
## About
Browse API - [http://api.flaper.org/explorer/](http://api.flaper.org/explorer/)

Based on [LoopBack](http://loopback.io) framework.

## Installation
```
npm install
```

## Initialization
To upload required constant to database

`npm run constants`
(this only add new constants, indexes, doesn't remove anything, so this can be used for production db)

## Running
`npm start`

## Test
`npm test`

`npm run t` - will skip uploading fixtures

## Sample data
To upload sample development data into database (will erase your current data).
`npm run fixtures`

## Authorization
Access token which you can get in the `users/login` method should be passed in the **Authorization** header:

`Authorization: roEeqLH7oCCVsZgI1NJ0EM6i4jlGUeUO7ZlMugsXWluAXWGWjsGK5o3GtmK8qRNA`

## Api
Any collection can be used either in **camelCase** && **CamelCase** in url.
