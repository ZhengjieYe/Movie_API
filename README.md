# Movie App Web API.

Name: Zhengjie Ye

## Features.
 **This is just a simple statement. You can view details in [Extra features](#Extra-features) and [Independent learning](#Independent-learning.).**
 + Feature 1 - Implemented get, post, put and delete API 
 + Feature 2 - Realize the addition, deletion, modification and query of mongoDB
 + Feature 3 - Nested Document and/or object referencing in Mongo/Mongoose.
 + Feature 4 - Integrate with react project (assignment 1 movie app). Integrates most of the get, post, put and delete APIs used in this project.
 + Feature 5 - Customize the authorization/verification, realize the token that will expire, provide API to refresh the token expiration time, and provide the destruction of the token (logout). View details in [Security and Authentication](#Security-and-Authentication).
 + Feature 6 - Add some extra express middlewares for error handling.
 + Feature 7 - Use 3rd party tools/middlewares, such as chalk, helmet.
 + Feature 8 - Use Swagger to write API documentation.
 + Feature 9 - Use morgan middleware(HTTP request logger middleware for node.js) as logging, which can record request.
 + Feature 10 - Use feature flag (Optimizely tool) to control the opening or closing of the API. Without having to re-modify, deploy code.
 + Feature 11 - A recommendation algorithm is implemented, which can automatically recommend movies or actors that may be liked according to the favorite movies added by the user.
 + Feature 12 - Custom validation using Mongoose


## Installation Requirements

Describe what needs to be on the machine to run the API (Node v?, NPM, MongoDB instance, any other 3rd party software not in the package.json). 

If you want to run the project in your own machine, you need to:

First, clone the project:
```bat
git clone https://github.com/ZhengjieYe/Movie_API.git
```
or
```bat
git clone https://gitlab.com/ZhengjieYe/movie_api.git
```
Then you should intall the dependency:
  
    node version: v12.18.3
    npm version: 6.14.6
```bat
npm install
```
If you want to see effect on the page. You can access the [Movie App(front end) project](https://github.com/ZhengjieYe/Movie_API_Integration), and following the readme to install it. Once you are done, you need to start them at the same time.Then you can visit http://localhost:3000 to view the effect.
## API Configuration
Followed by setting environment variables, you should create .env file in the root and add following variables:

```bat
NODE_ENV=production
PORT=8080
HOST=localhost
TMDB_KEY="tmdb key"
mongoDB=mongodb://localhost:27017/movies_db
SEED_DB=true
SECRET=ilikecake
REFRESH_SECRET=ilikecaketoo
OPTIMIZELY="optimizely key"
```
As you see above, TMDB_KEY is the key from [TMDB website](https://www.themoviedb.org/), because the project use some data of it.

mongoDB is the address of your mongoDB.

SECRET and REFRESH_SECRET is used for JWT sign and authoration.

OPTIMIZELY is the key from [Optimizely website](https://www.optimizely.com/), because we need it for feature flag.



## API Design

You can see the API design in three places:

1. [My own staging website.](http://34.255.115.233:8080/api-docs/)
2. [My own production website.](http://54.157.43.36:8080/api-docs/)
3. [Swaggerhub.](https://app.swaggerhub.com/apis/adas0/ZhengjieYeMovieAPI/0.1) 

or you can run the project, and access http://localhost:8080/api-docs.
## Security and Authentication

I use JWT to implement authentication/security. I use username and role to sign the token, besides I will also generate a refresh token, which can be used to get a new token. All of them will expire in 20 minutes.(file path: api\users\index.js)

![][anthor-1]
And following is the new token generated from refresh token(/api/users/token), and this is a token that also will expire in 20 minutes.
![][anthor-2]
Besides, you can delete(log out) the the generated token.
![][anthor-3]

For better usage, I create a authenticate middleware used by some protected routes.(file path: middleware\authenticate\authenticateJWT.js).
It can be seen that the middleware checks the passed token, and if it is correct, the username and role are passed to req as user attributes. This provides great convenience to the development of the following routing.
![][anthor-4]

## Integrating with React App

Describe how you integrated your React app with the API. Perhaps link to the React App repo and give an example of an API call from React App. For example: 

**All integrations are committed separately, you can go to [Movie-API-integration commit history](https://github.com/ZhengjieYe/Movie_API_Integration/commits/master) to view the details.**

[integrations]: ./assets/img/integrations.png
[getMovies]: ./assets/img/getMovies.png

![][integrations]
1. /api/users/login
~~~Javascript
export const login = (username, password) => {
  return fetch('/api/users/login', {
      headers: {
          'Content-Type': 'application/json'
      },
      method: 'post',
      body: JSON.stringify({ username: username, password: password })
  }).then(res => res.json())
};
~~~
You can see detail in commit *[Web-integration: integrate login logout with movie-api](https://github.com/ZhengjieYe/Movie_API_Integration/commit/b157ef5dc6c5e589295378db603d90f6cb55c7ab)*. There are a lot of changed files, so I didn't take a screenshot to show it.

2. /api/users/register
~~~Javascript
export const register = (username, password) => {
  return fetch('/api/users/register', {
      headers: {
          'Content-Type': 'application/json'
      },
      method: 'post',
      body: JSON.stringify({ username: username, password: password })
  }).then(res => res.json())
};
~~~
You can see detail in commit *[Web-integration: integrete register with movie-api /api/users/register](https://github.com/ZhengjieYe/Movie_API_Integration/commit/782bc8d51c6e47ee0760de2010452bd6b267ff07)*. There are a lot of changed files, so I didn't take a screenshot to show it.

3. /api/users/logout
~~~Javascript
export const logout = (token) => {
  return fetch('/api/users/logout', {
      headers: {
          'Content-Type': 'application/json'
      },
      method: 'post',
      body: JSON.stringify({ token: token })
  }).then(res => res.json())
};
~~~

You can see detail in commit *[Web-integration: integrate login logout with movie-api](https://github.com/ZhengjieYe/Movie_API_Integration/commit/b157ef5dc6c5e589295378db603d90f6cb55c7ab)*. There are a lot of changed files, so I didn't take a screenshot to show it.
4. /api/movies
~~~Javascript
export const getMovies = (token) => {
  return fetch('/api/movies', {
      headers: {
          'Content-Type': 'application/json'
      },
      method: 'get'
  }).then(res => res.json())
};
~~~
You can see detail in commit *[Web-integretion: integrete getMovies with movie-api /api/movies](https://github.com/ZhengjieYe/Movie_API_Integration/commit/709aedc34a5aa86c7603550abcb06c73e193a2ac)*.
![][getMovies]
You can see that I replaced the tmdb API with my own.

5. /api/movies/${id}/reviews
~~~Javascript
export const getMovieReviews =async (id) => {
  return fetch(`/api/movies/${id}/reviews`, {
      headers: {
          'Content-Type': 'application/json'
      },
      method: 'get'
  }).then(res => res.json())
    .then(json => json.reviews)
};
~~~
You can see detail in commit *[Web-integration: integrate movie review function with movie-api /api/movies/:id/reviews](https://github.com/ZhengjieYe/Movie_API_Integration/commit/48bfc63470c6d00e7b44b5f146936a59cf348d6f#diff-ad4d739d3c0877ef0bad0fe9e18473eba501c9fb9434f3ee429600abd9c0950a)*.

6. /api/users/favourites
~~~Javascript
export const addToDBFavorites = (id) => {
  return fetch('/api/users/favourites', {
      headers: {
          'Content-Type': 'application/json',
          'Authorization': sessionStorage.getItem('tmdb-token')
      },
      method: 'post',
      body: JSON.stringify({ id: id })
  }).then(res => {
    return res.json()
  })
};

export const getFavorites =async () => {
  return fetch('/api/users/favourites', {
      headers: {
          'Content-Type': 'application/json',
          'Authorization': sessionStorage.getItem('tmdb-token')
      },
      method: 'get'
  }).then(res => res.json())
};
~~~
You can see detail in commit *[Web-integration: integrate favourites functions with movie-api /api/users/favourites](https://github.com/ZhengjieYe/Movie_API_Integration/commit/8e3b977a124687aee058588088a38a09ed1efc2b#diff-ad4d739d3c0877ef0bad0fe9e18473eba501c9fb9434f3ee429600abd9c0950a)*.

[getFavourite]: ./assets/img/getFavourite.png

![][getFavourite]
As you can see, this is the context file in react, I use getFavourites and addToFavourites to integrate with Movie-API.

7. api/upcoming
~~~Javascript
export const getUpcomingMovies =async () => {
  return fetch('/api/upcoming', {
      headers: {
          'Content-Type': 'application/json'
      },
      method: 'get'
  }).then(res => res.json())
};
~~~
You can see detail in commit *[Web-integration: integrate upcoming and watchlist functions with movie-api /api/upcoming and /api/upcoming/watchlist](https://github.com/ZhengjieYe/Movie_API_Integration/commit/d1b229fa5bda3a47cfc51b61110668891c0f9304#diff-ad4d739d3c0877ef0bad0fe9e18473eba501c9fb9434f3ee429600abd9c0950a)*.

8. /api/upcoming/watchlist
~~~Javascript
export const getWachlist =async () => {
  return fetch('/api/upcoming/watchlist', {
      headers: {
          'Content-Type': 'application/json',
          'Authorization': sessionStorage.getItem('tmdb-token')
      },
      method: 'get'
  }).then(res => res.json())
};

export const postWachlist =async (id) => {
  return fetch('/api/upcoming/watchlist', {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': sessionStorage.getItem('tmdb-token')
    },
    method: 'post',
    body: JSON.stringify({ id: id })
  }).then(res => res.json())
};

export const deleteWachlist =async (id) => {
  return fetch(`/api/upcoming/watchlist/${id}`, {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': sessionStorage.getItem('tmdb-token')
    },
    method: 'delete'
  }).then(res => res.json())
};
~~~
You can see detail in commit *[Web-integration: integrate upcoming and watchlist functions with movie-api /api/upcoming and /api/upcoming/watchlist](https://github.com/ZhengjieYe/Movie_API_Integration/commit/d1b229fa5bda3a47cfc51b61110668891c0f9304#diff-ad4d739d3c0877ef0bad0fe9e18473eba501c9fb9434f3ee429600abd9c0950a)*.

9. /api/playing
~~~Javascript
export const getNowPlaying =async () => {
  return fetch('/api/playing', {
    headers: {
        'Content-Type': 'application/json'
    },
    method: 'get'
  }).then(res => res.json())
    .then(json=>json.playingMovies);
};
~~~

You can see detail in commit *[Web-integration: integrate now playing movies function with movie-api/api/playing](https://github.com/ZhengjieYe/Movie_API_Integration/commit/8d7e7fcbbc311471b0665401f963620a3b1c82f8#diff-ad4d739d3c0877ef0bad0fe9e18473eba501c9fb9434f3ee429600abd9c0950a)*.

10. /api/topRated
~~~Javascript
export const getTopRated =async () => {
  return fetch('/api/topRated', {
      headers: {
          'Content-Type': 'application/json',
      },
      method: 'get'
  }).then(res => res.json())
};
~~~
You can see detail in commit *[Web-integration: integrate rate function with movie-api /api/rate](https://github.com/ZhengjieYe/Movie_API_Integration/commit/06360294c0016ca05837130fe4e8d3af078554e0#diff-ad4d739d3c0877ef0bad0fe9e18473eba501c9fb9434f3ee429600abd9c0950a)*.

11. /api/rate
~~~Javascript
export const getRated =async () => {
  return fetch('/api/rate', {
      headers: {
          'Content-Type': 'application/json',
          'Authorization': sessionStorage.getItem('tmdb-token')
      },
      method: 'get'
  }).then(res => res.json())
    .then(json=>json.ratedMovies)
};

export const postRate =async (id,rating) => {
  return fetch('/api/rate', {
      headers: {
          'Content-Type': 'application/json',
          'Authorization': sessionStorage.getItem('tmdb-token')
      },
      method: 'post',
      body: JSON.stringify({ id: id, rating:rating })
  }).then(res => res.json())
};
~~~

You can see detail in commit *[Web-integration: integrate rate function with movie-api /api/rate](https://github.com/ZhengjieYe/Movie_API_Integration/commit/06360294c0016ca05837130fe4e8d3af078554e0#diff-ad4d739d3c0877ef0bad0fe9e18473eba501c9fb9434f3ee429600abd9c0950a)*.

12. /api/popular/actors?sort=${sort}&filter=${filter}
~~~Javascript
export const getPopularActors =async (sort,filter) => {
  return fetch(`/api/popular/actors?sort=${sort}&filter=${filter}`, {
      headers: {
          'Content-Type': 'application/json'
      },
      method: 'get'
  }).then(res => res.json())
    .then(json=>json.actors)
};
~~~

You can see detail in commit *[Web-integration: integrate popular actor function with movie-api /api/popular/actors](https://github.com/ZhengjieYe/Movie_API_Integration/commit/06360294c0016ca05837130fe4e8d3af078554e0#diff-ad4d739d3c0877ef0bad0fe9e18473eba501c9fb9434f3ee429600abd9c0950a)*.

13. /api/popular/actors/${id}/known_for_movies
~~~Javascript
export const getActorKnowFor =async (id) => {
  return fetch(`/api/popular/actors/${id}/known_for_movies`, {
      headers: {
          'Content-Type': 'application/json'
      },
      method: 'get'
  }).then(res => res.json())
};

~~~

You can see detail in commit *[Web-integration: integrate popular actor function with movie-api /api/popular/actors](https://github.com/ZhengjieYe/Movie_API_Integration/commit/06360294c0016ca05837130fe4e8d3af078554e0#diff-ad4d739d3c0877ef0bad0fe9e18473eba501c9fb9434f3ee429600abd9c0950a)*.

14. /api/recommend/movies
~~~Javascript
export const getRecommendMovies =async () => {
  return fetch(`/api/recommend/movies`, {
      headers: {
          'Content-Type': 'application/json',
          'Authorization': sessionStorage.getItem('tmdb-token')
      },
      method: 'get'
  }).then(res => res.json())
    .then(json=>json.recommendMovies)
};
~~~

You can see detail in commit *[Web-integration: integrate recommend movies, actors with movie-api /api/recommend](https://github.com/ZhengjieYe/Movie_API_Integration/commit/53ba303f0288af5c828ae3f635a4689570d5e1c0#diff-ad4d739d3c0877ef0bad0fe9e18473eba501c9fb9434f3ee429600abd9c0950a)*.

15. /api/recommend/actors
~~~Javascript
export const getRecommendActors =async () => {
  return fetch(`/api/recommend/actors`, {
      headers: {
          'Content-Type': 'application/json',
          'Authorization': sessionStorage.getItem('tmdb-token')
      },
      method: 'get'
  }).then(res => res.json())
    .then(json=>json.recommendActors)
};
~~~

You can see detail in commit *[Web-integration: integrate recommend movies, actors with movie-api /api/recommend](https://github.com/ZhengjieYe/Movie_API_Integration/commit/53ba303f0288af5c828ae3f635a4689570d5e1c0#diff-ad4d739d3c0877ef0bad0fe9e18473eba501c9fb9434f3ee429600abd9c0950a)*.

## Extra features
[validator]: ./assets/img/validator.png
[reference]: ./assets/img/reference.png
[reference]: ./assets/img/reference.png
[reference]: ./assets/img/reference.png
[reference]: ./assets/img/reference.png
+  Custom validation using Mongoose
    
    Use custom validation in Mongoose schema, example: use validation to validate gender(api\popular\actor\popularActor.js)
    ![][validator]

+ Nested Document and/or object referencing in Mongo/Mongoose.

    example: Reference other models in the user model.(\api\users\userModel.js)
    ![][reference]

+ Use some extra express middleware for error handling.(middleware\errorHandler)

    **reference:https://medium.com/@SigniorGratiano/express-error-handling-674bfdd86139**
    1. appError
    ~~~Javascript
    export default class AppError extends Error {
      constructor(message, statusCode) {
      super(message);

      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      this.isOperational = true;
      
      Error.captureStackTrace(this, this.constructor);
      }
    }
    ~~~

    2. catchAsync
    ~~~Javascript
    export const catchAsync = fn => {
      return (req, res, next) => {
        fn(req, res, next).catch(next);
      };
    };
    ~~~

    We need to catch Async errors, so I added this component. You only need to wrap it outside other async functions to easily catch errors.

    3. devOrProdError(Part of the code)
    ~~~Javascript
      ...
      if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
      } else if (process.env.NODE_ENV === 'production'  || process.env.NODE_ENV === 'test') {
        let error = { ...err };
        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError')
          error = handleValidationErrorDB(error);
        error={...error, message: err.message}
        sendErrorProd(error, res);
      }
    };
    ~~~

    This middleware is used to handle different NODE_ENV reports different errors. The above is part of the code.

    4. other error handling not as middleware
    ~~~Javascript
    process.on('unhandledRejection', err => {
      console.log(chalk.red(err.name, err.message));
      console.log(chalk.yellow('UNHANDLED REJECTION! 💥 Shutting down...'));
      process.exit(1);
    });

    process.on('uncaughtException', err => {
      console.log(chalk.red(err.name, err.message));
      console.log(chalk.yellow('UNCAUGHT EXCEPTION! 💥 Shutting down...'));
      process.exit(1);
    });
    ~~~

    These two are used to deal with rejection and exception.

+ 3rd party tools or middleware

    [chalk]: ./assets/img/chalk.png

    example: [chalk](https://www.npmjs.com/package/chalk)
    It can change the style of terminal text to make it clearer.

    ![][chalk]
+ Use Swagger to write API documentation

    [swagger]:./assets/img/swagger.png
    ~~~Javascript
    const swaggerDocument = require('./public/api-docs.json');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));

    ~~~
    I use swagger-ui-express to display API documents in json format. And I write documents on SwaggerHub. Then download it as json format. Put it in public/. And set the path/api-docs in express.

    Effect picture:
    ![][swagger]

+ Logging

    [logging]:./assets/img/logging.png
    [opt-1]:./assets/img/opt-1.png
    [opt-2]:./assets/img/opt-2.png

    Use Morgan middleware to listen to the request and write it to app.log.
    ![][logging]
    We can see that it records information such as time, api, return status, who visited, and so on.

+ Feature flag

    Using the feature flag, you can control the opening or closing of the API without changing the code. I use the [Opetimizely platform](https://www.optimizely.com/).
    
    ![][opt-1]
    ![][opt-2]

+ recmmond algorithem

    I wrote two recommended algorithms by hand. They will automatically recommend movies or actors they may like based on the movies that users like. I will show it in the video.
## Independent learning.

. . State the non-standard aspects of React/Express/Node (or other related technologies) that you researched and applied in this assignment . .  

+ learn how to use Swagger, and how to write documentation.
  
  reference:

  + https://swagger.io/specification/
  + https://blog.logrocket.com/documenting-your-express-api-with-swagger/
  + https://app.swaggerhub.com/apis/GregMotenJr44/petStoreExample/1.0.0#/pet/addPet
  + https://inspector.swagger.io/builder
  + https://github.com/swagger-api/swagger-ui/issues/3239

+ learn how to use custom validation
  
  reference:

  + https://kb.objectrocket.com/mongo-db/how-to-use-mongoose-custom-validators-923
  + https://mongoosejs.com/docs/api.html#schematype_SchemaType-validate

+ learn how to design advanced API

  reference:
  
  + https://medium.com/stories-from-the-lab/advanced-rest-api-design-754d1f254e87

+ learn something about authentication and authorization.

  reference:

  + https://stackabuse.com/authentication-and-authorization-with-jwts-in-express-js/

+ learn how to use morgan

  reference:

  + https://medium.com/javascript-in-plain-english/easy-logging-with-the-morgan-express-middleware-4569182ffda4

+ learn how to handle error

  reference:

  + https://medium.com/javascript-in-plain-english/easy-logging-with-the-morgan-express-middleware-4569182ffda4

[anthor-1]: ./assets/img/anthor-1.png
[anthor-2]: ./assets/img/anthor-2.png
[anthor-3]: ./assets/img/anthor-3.png
[anthor-4]: ./assets/img/anthor-4.png



# Assignment 2 - Agile Software Practice.

Name: ZhengjieYe

## Target Web API.

You can see the API design in three places:

1. [My own staging website.](http://34.255.115.233:8080/api-docs/)
2. [My own production website.](http://54.157.43.36:8080/api-docs/)
3. [Swaggerhub.](https://app.swaggerhub.com/apis/adas0/ZhengjieYeMovieAPI/0.1) 

+ GET ​/api​/users - Get users list with admin token.
+ POST ​/api​/users​/login - Authticate users.
+ POST ​/api​/users​/register - Register new user.
+ POST ​/api​/users​/logout - Log out with refresh token
+ POST ​/api​/users​/token - Get new token with refresh token
+ GET ​/api​/users​/favourites - get users favourites list
+ POST ​/api​/users​/favourites - Add to users favourites list
+ GET ​/api​/movies - Get movies list
+ GET ​/api​/movies​/{id} - Get movie
+ GET /api​/movies​/{id}​/reviews - Get movie's reviews
+ GET ​/api​/genres - Get movie's genres
+ GET ​/api​/upcoming - Get upcoming movies
+ GET ​/api​/upcoming​/watchlist - Get a user's watchlist
+ POST ​/api​/upcoming​/watchlist - Add movie to watchlist
+ POST ​/api​/upcoming​/watchlist​/validate_with_login - Get a user's watchlist by login
+ DELETE ​/api​/upcoming​/watchlist​/{id} - Delete a movie from a user's watchlist
+ GET ​/api​/topRated?sort={sort}&filter={filter} - Get top rated movies
+ GET ​/api​/popular​/actors - Get popular actors
+ GET ​/api​/popular​/actors​/{actor_id}​/known_for_movies - Get actor's famous movies
+ PUT ​/api​/popular​/actors​/{actor_id}​/review - Change review of one user for a actor
+ POST ​/api​/popular​/actors​/{actor_id}​/review - Add new review for a actor
+ DELETE ​/api​/popular​/actors​/{actor_id}​/review​/{review_id} - Delete review of one user for a actor
+ GET ​/api​/recommend​/movies - Get recommend movies according to user's favourite movies.
+ GET ​/api​/recommend​/actors - Get recommend actors according to user's favourite movies.
+ GET ​/api​/rate - Get user's rated movies
+ POST ​/api​/rate - Rate or update a movie with specific user
+ GET ​/api​/playing - Get now playing movies

## Error/Exception Testing.

+ GET /api/movies/{id} - test when request with a invalid ID. See tests\functional\api\movies\index.js
+ GET /api/popular/actors/${id}/known_for_movies - test When request with a invalid actor id. See tests\functional\api\popularActors\index.js
+ POST /api/popular/actors/${id}/review - test When request with a invalid actor id. See tests\functional\api\popularActors\index.js.
+ PUT /api/popular/actors/${id}/review - test when request with a invalid review id. Test When request with a valid but not exist review id. See tests\functional\api\popularActors\index.js.
+ DELETE /api/popular/actors/${id}/review - test When request with admin user and review not belong to him. Test When request with normal user and review not belong to him. Test When request with invalid review id. See tests\functional\api\popularActors\index.js.
+ POST /api/rate - test When request with exist movie id. Test When request with not exist movie id. See tests\functional\api\rate\index.js.
+ GET /api/recommend/movies - test When request with invalid token. Test When request without token. See tests\functional\api\recommend\index.js
+ GET /api/recommend/actors - test When request with invalid token. Test When request without token. See tests\functional\api\recommend\index.js
+ GET /api/topRated - test When request with invalid page number. See tests\functional\api\topRated\index.js.
+ GET /api/upcoming/watchlist - test When request with a invalid token given. Test When request with a token not given. See tests\functional\api\upcoming\index.js.
+ POST /api/upcoming/watchlist - test When request with a movie exist in watchlist. See tests\functional\api\upcoming\index.js.
+ POST /api/upcoming/watchlist/validate_with_login - test When request with valid username and incorrect password. Test When request with invalid user. See tests\functional\api\upcoming\index.js.
+ DDELETE /api/upcoming/watchlist/{id} - test When request with a movie not in watchlist. See tests\functional\api\upcoming\index.js.
+ POST /api/users/login - test When request with invalid user or password. See tests\functional\api\users\index.js.
+ POST /api/users/token - test When request with invalid refresh token. See tests\functional\api\users\index.js. 
+ GET /api/users - test When request with invalid or not admin token. See tests\functional\api\users\index.js.
+ POST /api/users/favourites - test When request with movie already in favourites. See tests\functional\api\users\index.js.
## Continuous Delivery/Deployment.

..... Specify the URLs for the staging and production deployments of your web API, e.g.

+ http://34.255.115.233:8080/ - Staging deployment
+ http://54.157.43.36:8080/ - Production

I deploy to my own AWS server.

+ Staging app overview 

![][stagingapp-1]
![][stagingapp-2]

+ Production app overview 

![][prod-1]
![][prod-2]


## Feature Flags (If relevant)

The following route has Feature flag. and the opetimizelyControler is a function I write:
![][opti-1]

opetimizelyControler:
![][opti-2]

You can see each opetimizely features here.
![][opt-1]
![][opt-2]




[stagingapp-1]: ./assets/img/stagingapp-1.png
[stagingapp-2]: ./assets/img/stagingapp-2.png
[prod-1]: ./assets/img/prod-1.png
[prod-2]: ./assets/img/prod-2.png
[opt-1]: ./assets/img/opt-1.png
[opt-2]: ./assets/img/opt-2.png
[opti-1]: ./assets/img/opti-1.png
[opti-2]: ./assets/img/opti-2.png
