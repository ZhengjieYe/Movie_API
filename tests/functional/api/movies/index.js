import chai from "chai";
import request from "supertest";
import {getMovies, getMovieReviews} from '../../../../api/tmdb-api'

const expect = chai.expect;

let api;
let movie;
let reviews;

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
    it("should return 20 movies and a status 200",(done)=>{
      request(api)
      .get('/api/movies')
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200)
      .end((req,res)=>{
        expect(res.body).to.be.a("array");
        expect(res.body.length).to.eq(20);
        done()
      })
    })
    
  })

  describe("GET /api/movies/{id}",()=>{
    describe("When request with a valid ID",()=>{
      it("should return right movie and a status 200", (done)=>{
        request(api)
          .get(`/api/movies/${movie.id}`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
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
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(500)
          .end((req, res)=>{
            expect(res.body.status).to.equal("error");
            expect(res.body.message).to.equal("Something went very wrong!");
            done()
          })
      })
    })
  })

  describe("GET /api/movies/{id}/reviews", (done)=>{
    it("should return reviews and a status 200",(done)=>{
      request(api)
        .get(`/api/movies/${movie.id}/reviews`)
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .end((req,res)=>{
          expect(res.body.reviews.length).to.eq(reviews.length)
          done()
        })
    })
  })
})
