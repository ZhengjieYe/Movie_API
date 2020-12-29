import chai from "chai";
import request from "supertest";
import api from "../../../../index";
import {getMovies, getMovieReviews} from '../../../../api/tmdb-api'

const expect = chai.expect;

let movie;
let reviews;
before(function (done) {
  console.log('wait for optimizely...');
  getMovies().then((res)=>{
    movie=res[0]
    getMovieReviews(movie.id).then(res=>{
      reviews=res;
      }
    )
  })
  setTimeout(()=>{
    console.log('optimizely done...');
    done()
  },4000)
});

let token;

describe("Movies endpoint", () => {
  before((done)=>{
    request(api)
      .post('/api/users/login')
      .send({
        "username": "user2",
        "password": "test2"
      })
      .end((req,res)=>{
        token=res.body.token.split(" ")[1];
        done();
      })
  })
  describe("GET /api/movies", ()=>{
    it("should return 20 movies and a status 200 with Bearer token",(done)=>{
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

    it("should return Unauthorized and a status 401 without Bearer token", (done)=>{
      request(api)
        .get('/api/movies')
        .expect(401)
        .end((req,res)=>{
          expect(res.text).to.eq("Unauthorized");
          done()
        })
    })
  })

  describe("GET /api/movies/{id}",()=>{
    it("should return right movie and a status 200 with a valid ID", (done)=>{
      request(api)
        .get(`/api/movies/${movie.id}`)
        .set('Authorization', 'bearer ' + token)
        .expect(200)
        .end((req, res)=>{
          expect(res.body.title).to.eq(movie.title)
          done()
        })
    })

    it("should return error and a status 500 with a invalid ID", (done)=>{
      request(api)
        .get(`/api/movies/ddd`)
        .set('Authorization', 'bearer ' + token)
        .expect(500)
        .end((req, res)=>{
          done()
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
