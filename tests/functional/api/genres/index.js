import chai from "chai";
import request from "supertest";
import {getGenres} from '../../../../api/tmdb-api'

const expect = chai.expect;

let api;
let genres;

describe("Genres endpoint",()=>{
  beforeEach(function (done) {
    try {
      api = require("../../../../index");
    } catch (err) {
      console.error(`failed to Load express server: ${err}`);
    }
    
    console.log('wait for optimizely...');
    setTimeout(()=>{
      console.log('optimizely done...');
      getGenres().then(res=>{
        genres=res;
        done();
      })
    },4000)
  });
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