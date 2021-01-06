import chai from "chai";
import request from "supertest";
import {getMovies, getMovieReviews} from '../../../../api/tmdb-api'

const expect = chai.expect;

let api;
let movie;
let reviews;
let token;

describe("Movies endpoint", () => {
  beforeEach(function (done) {
    try {
      api = require("../../../../index");
    } catch (err) {
      console.error(`failed to Load express server: ${err}`);
    }
    
    console.log('wait for optimizely...');
    setTimeout(()=>{
      console.log('optimizely done...');
      request(api)
      .post('/api/users/login')
      .send({
        "username": "user2",
        "password": "test2"
      })
      .end((req,res)=>{
        token=res.body.token.split(" ")[1];
      })

      getMovies().then((res)=>{
        movie=res[0]
        getMovieReviews(movie.id).then(res=>{
          reviews=res;
          done();
          }
        )
      })
    },4000)
  });

  afterEach(() => {
    api.close(); // Release PORT 8080
    delete require.cache[require.resolve("../../../../index")];
  });
  
  describe("GET /api/movies", ()=>{
    describe("When request with Bearer token",()=>{
      it("should return 20 movies and a status 200",(done)=>{
        request(api)
        .get('/api/movies')
        .set('Authorization', 'bearer ' + token)
        .expect(200)
        .end((req,res)=>{
          expect(res.body).to.be.a("array");
          expect(res.body.length).to.eq(20);
          done()
        })
      })
    })
    describe("When request without Bearer token",()=>{
      it("should return Unauthorized and a status 401", (done)=>{
        request(api)
          .get('/api/movies')
          .expect(401)
          .end((req,res)=>{
            expect(res.text).to.eq("Unauthorized");
            done()
          })
      })
    })
    
  })

  describe("GET /api/movies/{id}",()=>{
    describe("When request with a valid ID",()=>{
      it("should return right movie and a status 200", (done)=>{
        request(api)
          .get(`/api/movies/${movie.id}`)
          .set('Authorization', 'bearer ' + token)
          .expect(200)
          .end((req, res)=>{
            expect(res.body.title).to.eq(movie.title)
            done()
          })
      })
    })

    describe("When request with a invalid ID",()=>{
      it("should return error and a status 500", (done)=>{
        request(api)
          .get(`/api/movies/ddd`)
          .set('Authorization', 'bearer ' + token)
          .expect(500)
          .end((req, res)=>{
            done()
          })
      })
    })
  })

  describe("GET /api/movies/{id}/reviews", (done)=>{
    it("should return reviews and a status 200",(done)=>{
      request(api)
        .get(`/api/movies/${movie.id}/reviews`)
        .set('Authorization', 'bearer ' + token)
        .expect(200)
        .end((req,res)=>{
          expect(res.body.reviews.length).to.eq(reviews.length)
          done()
        })
    })
  })
})
