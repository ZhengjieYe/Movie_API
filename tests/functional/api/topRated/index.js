import chai from "chai";
import request from "supertest";
import {getTopRated} from '../../../../api/tmdb-api'

const expect = chai.expect;
let api;
let top;


describe("topRated endpoint",()=>{
  beforeEach(function (done) {
    try {
      api = require("../../../../index");
    } catch (err) {
      console.error(`failed to Load express server: ${err}`);
    }
    console.log('wait for optimizely...');
    
    setTimeout(()=>{
      console.log('optimizely done...');
      getTopRated(1).then(res=>{
        top=res;
        done()
      })
    },4000)
  });
  
  afterEach(() => {
    api.close(); // Release PORT 8080
    delete require.cache[require.resolve("../../../../index")];
  });
  describe("GET /api/topRated",()=>{
    it("should return the right page's 20 top rated movies and a status 200 with valid page number",(done)=>{
      request(api)
        .get('/api/topRated')
        .query({page:1})
        .expect(200)
        .end((req,res)=>{
          expect(res.body.length).to.eq(top.length);
          done();
        })
    })

    it("should return the error message and a status 404 with invalid page number",(done)=>{
      request(api)
      .get('/api/topRated')
      .query({page:100})
      .expect(404)
      .end((req,res)=>{
        expect(res.body.message).to.eq("Page number is too long!");
        done();
      })
    })
  })
})