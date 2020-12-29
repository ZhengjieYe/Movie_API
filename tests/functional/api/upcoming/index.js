import chai from "chai";
import request from "supertest";

const expect = chai.expect;
let api;

describe("Upcoming endpoint",()=>{
  beforeEach(function (done) {
    try {
      api = require("../../../../index");
    } catch (err) {
      console.error(`failed to Load express server: ${err}`);
    }
    
    console.log('wait for optimizely...');
    setTimeout(()=>{
      console.log('optimizely done...');
      done();
    },4000)
  });
  
  describe("GET /api/upcoming",()=>{
    it("should return 20 upcoming movies and a status 200",(done)=>{
      request(api)
        .get("/api/upcoming")
        .expect(200)
        .end((req, res)=>{
          expect(res.body.length).to.eq(20);
          done();
        })
    })
  })
})