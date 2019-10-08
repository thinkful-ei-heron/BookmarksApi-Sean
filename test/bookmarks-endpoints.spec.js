'use strict';

const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const { makeBookmarksArray } = require('./bookmarks.fixtures');

describe('Bookmarks Endpoints', function() {
    let db;
  
    before('make knex instance', () => {
      db = knex({
        client: 'pg',
        connection: process.env.DB_URL,
      });
      app.set('db', db);
    });
  
    after('disconnect from db', () => db.destroy());
  
    before('clean the table', () => db('bookmarks').truncate());
  
    afterEach('cleanup',() => db('bookmarks').truncate());
  
    describe('GET /api/bookmarks', () => {
      context('Given no bookmarks', () => {
        it('responds with 200 and an empty list', () => {
          return supertest(app)
            .get('/api/bookmarks')
            .expect(200, []);
        });
      });
  
      context('Given there are bookmarks in the database', () => {
        const testBookmarks = makeBookmarksArray();
  
        beforeEach('insert bookmark', () => {
          return db
            .into('bookmarks')
            .insert(testBookmarks);
        });
  
        it('responds with 200 and all of the bookmarks', () => {
          return supertest(app)
            .get('/api/bookmarks')
            .expect(200, testBookmarks);
        });
      });
      context(`Given an XSS bookmark attack`, () => {
        const maliciousBookmark = {
          id:911,
          title: 'Naughty naughty very naughty <script>alert("xss");</script>',
          url: 'Naughty naughty very naughty <script>alert("xss");</script>',
          rating: 1,
          description:`Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
        };
  
        beforeEach('insert malicious bookmark', () => {
          return db
            .into('bookmarks')
            .insert([ maliciousBookmark ]);
        });
  
        it('removes XSS attack content', () => {
          return supertest(app)
            .get(`/api/bookmarks`)
            .expect(200)
            .expect(res => {
              expect(res.body[0].title).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
              expect(res.body[0].url).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
              expect(res.body[0].description).to.eql(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`)
            });
        });
      });
    });
  
    describe(`GET /api/bookmarks/:bookmark_id`, () => {
      context('Given no bookmarks', () => {
        it('responds with 404', () => {
          const bookmarkId = 123456;
          return supertest(app)
            .get(`/api/bookmarks/${bookmarkId}`)
            .expect(404, { error: { message: `Bookmark doesn't exist` } });
        });
      });
  
      context('Given there are bookmarks in the database', () => {
        const testBookmarks = makeBookmarksArray();
  
        beforeEach('insert bookmark', () => {
          return db
            .into('bookmarks')
            .insert(testBookmarks);
        });
  
        it('responds with 200 and the specified bookmark', () => {
          const bookmarkId = 2;
          const expectedBookmark = testBookmarks[bookmarkId - 1];
          return supertest(app)
            .get(`/api/bookmarks/${bookmarkId}`)
            .expect(200, expectedBookmark);
        });
      });
      context(`Given an XSS bookmark attack`, () => {
        const maliciousBookmark = {
            id:911,
            title: 'Naughty naughty very naughty <script>alert("xss");</script>',
            url: 'Naughty naughty very naughty <script>alert("xss");</script>',
            rating: 1,
            description:`Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
          };
  
        beforeEach('insert maclicious bookmark', () => {
          return db
            .into('bookmarks')
            .insert([ maliciousBookmark ]);
        });
  
        it('removes XSS attack content', () => {
          return supertest(app)
            .get(`/api/bookmarks/${maliciousBookmark.id}`)
            .expect(200)
            .expect(res => {
              expect(res.body.title).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
              expect(res.body.url).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
              expect(res.body.description).to.eql(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`)
            });
        });
      });
    });
    describe(`POST /api/bookmarks`, () => {
      it(`creates a bookmark, responding with 201 and the new bookmark`, function() {
        this.retries(3);
        const newBookmark = {
          title: 'New movie bookmark',
          url: 'https://newmoviebookmark.comsky',
          rating: 2,
          description: 'Test new bookmark description'
        };
        return supertest(app)
          .post('/api/bookmarks')
          .send(newBookmark)
          .expect(201)
          .expect(res => {
            expect(res.body.title).to.eql(newBookmark.title);
            expect(res.body.url).to.eql(newBookmark.url);
            expect(res.body.rating).to.eql(newBookmark.rating);
            expect(res.body.description).to.eql(newBookmark.description);
            expect(res.body).to.have.property('id');
            expect(res.headers.location).to.eql(`/api/bookmarks/${res.body.id}`);
          })
          .then(postRes => 
            supertest(app)
              .get(`/api/bookmarks/${postRes.body.id}`)
              .expect(postRes.body)
          );
      });
    
      const requiredFields = [ 'title', 'url' ];
      const testBookmarks = makeBookmarksArray();
      requiredFields.forEach(field => {
        const newBookmark = {
            title: 'New movie bookmark',
            url: 'https://newmoviebookmark.comsky',
          };
  
        it(`responds with 400 and an error message when the '${field}' is missing`, () => {
          delete newBookmark[field];
  
          return supertest(app)
            .post('/api/bookmarks')
            .send(newBookmark)
            .expect(400, {
              error : { message : `Missing '${field}' in request body`}
            });
        });
      });
      it('removes XSS attack content from the response', () => {
        const maliciousBookmark = {
            id:911,
            title: 'Naughty naughty very naughty <script>alert("xss");</script>',
            url: 'Naughty naughty very naughty <script>alert("xss");</script>',
            rating: 1,
            description:`Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
          };
        return supertest(app)
          .post('/api/bookmarks')
          .send(maliciousBookmark)
          .expect(201)
          .expect(res => {
            expect(res.body.title).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;');
            expect(res.body.url).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;');
            expect(res.body.description).to.eql(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`);
          });
      });
    });
    describe(`DELETE /api/bookmarks/:bookmark_id`, () => {
      context(`Given no bookmarks`, () => {
        it('responds with 404', () => {
          const bookmarkId = 123456;
          return supertest(app)
            .delete(`/api/bookmarks/${bookmarkId}`)
            .expect(404, { error : { message : `Bookmark doesn't exist`}});
        });
      });
      context('Given there are bookmarks in the database', () => {
        const testBookmarks = makeBookmarksArray();
  
        beforeEach('insert bookmark', () => {
          return db
            .into('bookmarks')
            .insert(testBookmarks);
        });
  
        it('responds with 204 and removes the bookmark', () => {
          const idToRemove = 2;
          const expectedBookmarks = testBookmarks.filter(bookmark => bookmark.id !== idToRemove);
          return supertest(app)
            .delete(`/api/bookmarks/${idToRemove}`)
            .expect(204)
            .then(res => {
              supertest(app)
                .get('/api/bookmarks')
                .expect(expectedBookmarks);
            });
        });
      });
    });
    describe(`PATCH /api/bookmarks/:bookmark_id`, () => {
      context(`Given no bookmarks`, () => {
        it(`responds with 404`, () => {
          const bookmarkId = 123456;
          return supertest(app)
            .patch(`/api/bookmarks/${bookmarkId}`)
            .expect(404, {error : {message : `Bookmark doesn't exist`}});
        });
      });
      context(`Given there are bookmarks in the database`, () => {
        const testBookmarks = makeBookmarksArray();
  
        beforeEach('insert bookmarks', () => {
          return db
            .into('bookmarks')
            .insert(testBookmarks);
        });
        
        it('responds with 204 and updates the bookmark', () => {
          const idToUpdate = 2;
          const updatedBookmark = {
            title: 'Updated movie bookmark',
            url: 'https://updatedmoviebookmark.comsky',
            rating: 5,
            description: 'Test updated bookmark description'
          };
          const expectedBookmark = {
            ...testBookmarks[idToUpdate - 1],
            ...updatedBookmark
          }
          return supertest(app)
            .patch(`/api/bookmarks/${idToUpdate}`)
            .send(updatedBookmark)
            .expect(204)
            .then(res => {
              supertest(app)
                        .get(`/api/bookmarks/${idToUpdate}`)
                        .expect(expectedBookmark);
            })
        });
        it(`responds with 400 when no required fields have been supplied`, () => {
          const idToUpdate = 2;
          return supertest(app)
                  .patch(`/api/bookmarks/${idToUpdate}`)
                  .send({ irrelevantField: 'foo' })
                  .expect(400, { error : {message : `Request body must contain either 'title', 'url', 'rating', or 'description'`}})
        })
        it(`responds with 204 when updating only a subset of fields`, () => {
          const idToUpdate = 2;
          const updatedBookmark = {
            title : 'updated bookmark title'
          }
          const expectedBookmark = {
            ...testBookmarks[idToUpdate - 1],
            ...updatedBookmark
          }
          return supertest(app)
            .patch(`/api/bookmarks/${idToUpdate}`)
            .send({
              ...updatedBookmark,
              fieldToIgnore: 'should not be in GET response'
            })
            .expect(204)
            .then(res => {
              supertest(app)
              .get(`/api/bookmarks/${idToUpdate}`)
              .expect(expectedBookmark)
            })
        })
      });
    });
  });