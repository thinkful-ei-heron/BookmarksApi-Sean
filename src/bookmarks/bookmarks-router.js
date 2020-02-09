'use strict';

const path = require('path');
const express = require('express');
const xss = require('xss');
const BookmarksService = require('../bookmarks-service');

const bookmarksRouter = express.Router();
const jsonParser = express.json();

const cleanUp = bookmark => ({
  id: bookmark.id,
  title: xss(bookmark.title),
  url: xss(bookmark.url),
  rating: bookmark.rating,
  description: xss(bookmark.description)
});

bookmarksRouter
  .route('/')
  .get((req, res, next) => {
    BookmarksService.getAllBookmarks(
      req.app.get('db')
    )
      .then(bookmarks => {
        console.log(bookmarks)
        res.json(bookmarks.map(cleanUp));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { title, url, rating, description } = req.body;
    const newBookmark = { title, url, rating, description};
    const bookmarkVerification = { title, url };

    for (const [key, value] of Object.entries(bookmarkVerification)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body`}
        });
      }
    }
    BookmarksService.insertBookmark(
      req.app.get('db'),
      newBookmark
    )
      .then(bookmark => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl + `/${bookmark.id}`))
          .json(cleanUp(bookmark));
      })
      .catch(next);
  }); 

bookmarksRouter
  .route(`/:bookmark_id`)
  .all((req, res, next) => {
    BookmarksService.getBookmarkById(
      req.app.get('db'),
      req.params.bookmark_id
    )
      .then(bookmark => {
        if(!bookmark) {
          return res.status(404).json({
            error : {message : `Bookmark doesn't exist`}
          });
        }
        res.bookmark = bookmark;
        next();
      })
      .catch(next);
  })
  .get((req, res) => {
    res.json(cleanUp(res.bookmark));
  })
  .delete((req, res, next) => {
    BookmarksService.deleteBookmark(
      req.app.get('db'),
      req.params.bookmark_id
    )
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { title, url, rating, description } = req.body;
    const bookmarkToUpdate = { title, url, rating, description };
    
    const numberOfValues = Object.values(bookmarkToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
      return res.status(400).json({
        error : {
          message : `Request body must contain either 'title', 'url', 'rating', or 'description'`
        }
      });
    }

    BookmarksService.updateBookmark(
      req.app.get('db'),
      req.params.bookmark_id,
      bookmarkToUpdate
    )
      .then(numRowAffected => {
       res.status(204).end();
      })
      .catch(next);
  })

module.exports = bookmarksRouter;