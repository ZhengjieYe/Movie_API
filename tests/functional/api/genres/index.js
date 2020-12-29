import chai from "chai";
import request from "supertest";
import api from "../../../../index";
import {getGenres} from '../../../../api/tmdb-api'

const expect = chai.expect;

let genres;
before(function (done) {
  console.log('wait for optimizely...');
  getGenres().then(res=>{
    genres=res;
  })
  setTimeout(()=>{
    console.log('optimizely done...');
    done()
  },4000)
});

describe("Genres endpoint",()=>{
  describe("GET /api/genres",()=>{
    it("should return 19 genres and a status 200",(done)=>{
      request(api)
        .get('/api/genres')
        .expect(200)
        .end((req,res)=>{
          expect(res.body.length).to.eq(genres.length);
          done();
        })
    })
  })
})