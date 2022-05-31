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
  username: String,
  password TODO,
  type: admin or user, //user by default
  // I can use it as a rating list looking for items where your rate is greater than -1
  // It can be a completed list looking if the state is completed
  // It can be a to watch list searching if the status is to watch/ to play
  // It can be a currently watching if the state is watching/ playing
  // TODO: Can it be a good idea at the performance level to have a list for each type since it cant change?
  your_List: [{
    id_Item: ObjectId, // with reference, if I modify the title, description, img... I want to see it reflected
    title: String,
    img: TODO,
    description: String,
    your_rate: Number,
    type: String, // First everything is shown together, but it can be filtered by only movie, or games, or series or anime
    status: String,
    //general_rating  look for how to add this without reference
  }]
}
```

```javascript
const Item = {
id: ObjectId,
  type: String, // It can be movie, series, anime, game.
  title: String,    
  description: String,
  duration: TODO,
  episodes: Number,
  genre: String,
  img: TODO,
  general_rate: IT IS TAKEN OUT IN THE DB TODO
  rate: [{
    user_Id: ObjectId,
    rate: Number,
  }],
  likes: [{
    user_Id: ObjectI,
  }],
  comments: [{  // Only comments not reviews
    user_Id: ObjectId,
    comment: String,
    date: Date,
    username: String,
    likes: [{
      user_Id: ObjectID,
    }],
  }],
}
```

## Pending Items

- Look for how to manage the general average
  - I can have a general rate and every time a user adds a rate also modify the general rate
  - https://mongoosejs.com/docs/defaults.html



- Look for how to sort(https://mongoosejs.com/docs/api/query.html#query_Query-sort)
- Get likes of an item (computed from the database), Item should have a new property with number of likes
- Get rate (computed from database) Item should have a new property with the rate
- Refactor function to check errors
- Edit status, likes, rate in one
- Pagination in comments
- Likes in comments
- Sort by generalRate
- Convert everything to lowercase like Plan to Watch

