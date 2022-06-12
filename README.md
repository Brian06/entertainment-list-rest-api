# Entertainment List Rest Api

REST API to handle users and entretainment items like movies, animes, tv series, games. User can have a list of visuals(watching, watched, I want to watch) and can give a score and a review, among other actions.

## Start using the APP

* `npm install`
* `npm start`
* Start database in [MongoDB Atlas](https://cloud.mongodb.com/v2/61468e785595417b9e6369d6#clusters)

## Database

```javascript
const User = {
  id: ObjectId,
  email: String,
  username: String,
  password String,
  movieList: [{
    id_Item: ObjectId, // with reference
    status: String // 'Watching', 'Completed', 'Plan to Watch', 'Dropped'
  }],
  serieList: [{
    id_Item: ObjectId, // with reference
    status: String // 'Watching', 'Completed', 'Plan to Watch', 'Dropped'
  }],
  animeList: [{
    id_Item: ObjectId, // with reference
    status: String // 'Watching', 'Completed', 'Plan to Watch', 'Dropped'
  }],
  gameList: [{
    id_Item: ObjectId, // with reference
    status: String // 'Watching', 'Completed', 'Plan to Watch', 'Dropped'
  }]
}
```

```javascript
const Item = {
  id: ObjectId,
  type: String, // It can be movie, series, anime, game.
  title: String,    
  description: String,
  durationMinutes: Number,
  episodes: Number,
  genre: String,
  img: TODO,
  general_rate: // TODO: IT IS TAKEN OUT IN THE DB 
  rates: [{
    user_Id: ObjectId,
    rate: Number, // from 1 to 10
  }],
  likes: [{
    user_Id: ObjectI,
    like: Boolean
  }],
  comments: [{  // Only comments not reviews
    user_Id: ObjectId,
    comment: String,
    date: Date,
    username: String,
    likes: [{
      user_Id: ObjectID,
      like: Boolean
    }],
  }],
  likesAmount: (virtual) Number,
  dislikesAmount: (virtual) Number,
  generalRate: (virtual) Number
}
```

## Pending Items

- Look for how to sort(https://mongoosejs.com/docs/api/query.html#query_Query-sort)
- Sort by generalRate
- Handle img
- Refactor function to check errors
- Edit status, likes, rate in one
- Pagination in comments
- Likes in comments
- Probably will need endpoint for actual user rate and like or dislike for an specific item


