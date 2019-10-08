'use strict';

function makeBookmarksArray() {
  return [
    {
      id:1, 
      title: 'Inception',
      url: 'https://www.imdb.com/title/tt1375666/?ref_=adv_li_tt',
      rating: 5,
      description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.'
    },
    {
      id: 2,
      title: 'The Matrix',
      url: 'https://www.imdb.com/title/tt0133093/?ref_=adv_li_tt',
      rating: 5,
      description:'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.'
    },
    {
      id: 3,
      title:'Star Wars: Episode V - The Empire Strikes Back',
      url:'https://www.imdb.com/title/tt0080684/?ref_=adv_li_tt',
      rating: 4,
      description:'After the Rebels are brutally overpowered by the Empire on the ice planet Hoth, Luke Skywalker begins Jedi training with Yoda, while his friends are pursued by Darth Vader.'
    },
    {
      id: 4,
      title:'Avengers: Endgame',
      url:'https://www.imdb.com/title/tt4154796/?ref_=adv_li_tt',
      rating: 5,
      description:'After the devastating events of Avengers: Infinity War (2018), the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos actions and restore balance to the universe.'
    },
    {
      id: 5, 
      title:'Interstellar',
      url:'https://www.imdb.com/title/tt0816692/?ref_=adv_li_tt',
      rating: 5,
      description:'A team of explorers travel through a wormhole in space in an attempt to ensure humanitys survival.'
    },
    {
      id: 6, 
      title:'Star Wars: Episode IV - A New Hope',
      url:'https://www.imdb.com/title/tt0076759/?ref_=adv_li_tt',
      rating: 4,
      description:'Luke Skywalker joins forces with a Jedi Knight, a cocky pilot, a Wookiee and two droids to save the galaxy from the Empires world-destroying battle station, while also attempting to rescue Princess Leia from the mysterious Darth Vader.'
    },
    {
      id: 7,
      title:'Avengers: Infinity War',
      url:'https://www.imdb.com/title/tt4154756/?ref_=adv_li_tt',
      rating: 5,
      description:'The Avengers and their allies must be willing to sacrifice all in an attempt to defeat the powerful Thanos before his blitz of devastation and ruin puts an end to the universe.'
    },
    {
      id: 8, 
      title:'The Prestige',
      url:'https://www.imdb.com/title/tt0482571/?ref_=adv_li_tt',
      rating: 5,
      description:'After a tragic accident, two stage magicians engage in a battle to create the ultimate illusion while sacrificing everything they have to outwit each other.'
    },
    {
      id: 9,
      title:'Terminator 2 : Judgement Day',
      url:'https://www.imdb.com/title/tt0103064/?ref_=adv_li_tt',
      rating: 4,
      description:'A cyborg, identical to the one who failed to kill Sarah Connor, must now protect her teenage son, John Connor, from a more advanced and powerful cyborg.'
    },
    { 
      id: 10,
      title:'Back to the Future',
      url:'https://www.imdb.com/title/tt0088763/?ref_=adv_li_tt',
      rating:4,
      description:'Marty McFly, a 17-year-old high school student, is accidentally sent thirty years into the past in a time-traveling DeLorean invented by his close friend, the maverick scientist Doc Brown.'
    },

  ];
}

module.exports = { makeBookmarksArray };