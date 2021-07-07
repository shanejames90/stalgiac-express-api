const express = require('express')

const passport = require('passport')

// pull in Mongoose model for screenshots
const Screenshot = require('../models/screenshot')

// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// { screenshot: { title: '', text: 'foo' } } -> { screenshot: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /screenshots
router.get('/screenshots', requireToken, (req, res, next) => {
  Screenshot.find()
    .then(screenshots => {
      // `screenshots` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return screenshots.map(screenshot => screenshot.toObject())
    })
  // respond with status 200 and JSON of the screenshots
    .then(screenshots => res.status(200).json({ screenshots: screenshots }))
  // if an error occurs, pass it to the handler
    .catch(next)
})

// SHOW
// GET /screenshots/5a7db6c74d55bc51bdf39793
router.get('/screenshots/:id', requireToken, (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Screenshot.findById(req.params.id)
    .then(handle404)
  // if `findById` is succesful, respond with 200 and "screenshot" JSON
    .then(screenshot => res.status(200).json({ screenshot: screenshot.toObject() }))
  // if an error occurs, pass it to the handler
    .catch(next)
})

// CREATE
// POST /screenshots
router.post('/screenshots', requireToken, (req, res, next) => {
  // set owner of new screenshot to be current user
  req.body.screenshot.owner = req.user.id

  Screenshot.create(req.body.screenshot)
  // respond to succesful `create` with status 201 and JSON of new "screenshot"
    .then(screenshot => {
      res.status(201).json({ screenshot: screenshot.toObject() })
    })
  // if an error occurs, pass it off to our error handler
  // the error handler needs the error message and the `res` object so that it
  // can send an error message back to the client
    .catch(next)
})

// UPDATE
// PATCH /screenshots/5a7db6c74d55bc51bdf39793
router.patch('/screenshots/:id', requireToken, removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.screenshot.owner

  Screenshot.findById(req.params.id)
    .then(handle404)
    .then(screenshot => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      requireOwnership(req, screenshot)

      // pass the result of Mongoose's `.update` to the next `.then`
      return screenshot.updateOne(req.body.screenshot)
    })
  // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
  // if an error occurs, pass it to the handler
    .catch(next)
})

// DESTROY
// DELETE /screenshots/5a7db6c74d55bc51bdf39793
router.delete('/screenshots/:id', requireToken, (req, res, next) => {
  Screenshot.findById(req.params.id)
    .then(handle404)
    .then(screenshot => {
      // throw an error if current user doesn't own `screenshot`
      requireOwnership(req, screenshot)
      // delete the screenshot ONLY IF the above didn't throw
      screenshot.deleteOne()
    })
  // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
  // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router
