import chai from "chai";
import request from "supertest";
import api from "../../../../index";

const expect = chai.expect;

before(function (done) {
  console.log('wait for optimizely...');
  setTimeout(()=>{
    console.log('optimizely done...');
    done()
  },4000)
});

describe("Upcoming endpoint",()=>{
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