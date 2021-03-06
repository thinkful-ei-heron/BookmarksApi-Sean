'use strict';

const BookmarksService = {
  getAllBookmarks(knex){
    return knex.select('*').from('bookmarks');
  },
  insertBookmark(knex, newBookmark){
    return knex
      .insert(newBookmark)
      .into('bookmarks')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  getBookmarkById(knex, id){
    return knex.from('bookmarks').select('*').where('id', id).first();
  },
  deleteBookmark(knex, id){
    return knex('bookmarks')
      .where({id})
      .delete();
  },
  async updateBookmark(knex, id, newBookmarkFields){
    return knex('bookmarks')
      .where({id})
      .update(newBookmarkFields);
  },
};

module.exports = BookmarksService;