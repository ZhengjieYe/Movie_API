import chai from "chai";
import request from "supertest";
const mongoose = require("mongoose");

const expect = chai.expect;

let api;
let db;
let token;

describe("Rate endpoint",()=>{
  before(() => {
    mongoose.connect(String(process.env.mongoDB), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = mongoose.connection;
    console.log('connect to db for testing.');
  });

  after(async () => {
    try {
      await db.close();
    } catch (error) {
      console.log(error);
    }
  });

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
        "username": "user1",
        "password": "test1"
      })
      .end((req,res)=>{
        token=res.body.token.split(" ")[1];
        done();
      })
      
    },7000)
  });

  afterEach(() => {
    api.close(); // Release PORT 8080
    delete require.cache[require.resolve("../../../../index")];
  });

  describe("GET /api/rate",()=>{
    describe("When request with valid token",()=>{
      it("should return success, recommend movies and status 200",(done)=>{
        request(api)
          .get("/api/rate")
          .set('Authorization', 'bearer ' + token)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((req,res)=>{
            expect(res.body.success).to.be.true;
            expect(res.body.ratedMovies).to.exist;
            done();
          })
      })
    })

    describe("When request with invalid token",()=>{
      it("should return invalid token error and a status 403",(done)=>{
        request(api)
          .get("/api/rate")
          .set('Authorization', 'bearer Invalid' + token)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(403)
          .end((req,res)=>{
            expect(res.body.status).to.be.equal("fail");
            expect(res.body.message).to.be.equal("Invalid Token");
            done();
          })
      })
    })
  })

  describe("POST /api/rate",()=>{
    describe("When request with exist movie id",()=>{
      it("should return success, rate information and a status 200",(done)=>{
        request(api)
          .post("/api/rate")
          .send({
            "id":"508442",
            "rating": 10
          })
          .set('Authorization', 'bearer ' + token)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((req,res)=>{
            expect(res.body.success).to.be.true;
            expect(res.body.rate.username).to.be.equal("user1");
            expect(res.body.rate.movie_id).to.be.equal(508442);
            expect(res.body.rate.rating).to.be.equal(10);
            done();
          })
      })
    })

    describe("When request with not exist movie id",()=>{
      it("should return movie not found and a status 404",(done)=>{
        request(api)
          .post("/api/rate")
          .send({
            "id":"508",
            "rating": 10
          })
          .set('Authorization', 'bearer ' + token)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(404)
          .end((req,res)=>{
            expect(res.body.success).to.be.false;
            expect(res.body.message).to.be.equal("Movie not found!");
            done();
          })
      })
    })

    describe("When request with a movie is already rated",()=>{
      let oldRating;
      beforeEach((done)=>{
        request(api)
          .post("/api/rate")
          .send({
            "id":"508442",
            "rating": 10
          })
          .set('Authorization', 'bearer ' + token)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((req,res)=>{
            expect(res.body.success).to.be.true;
            expect(res.body.rate.rating).to.be.equal(10);
            oldRating=res.body.rate.rating;
            done();
          })
      })

      it("should return different rating in rate information and a status 200",(done)=>{
        request(api)
          .post("/api/rate")
          .send({
            "id":"508442",
            "rating": 1
          })
          .set('Authorization', 'bearer ' + token)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((req,res)=>{
            expect(res.body.success).to.be.true;
            expect(res.body.rate.username).to.be.equal("user1");
            expect(res.body.rate.movie_id).to.be.equal(508442);
            expect(res.body.rate.rating).to.not.equal(oldRating);
            expect(res.body.rate.rating).to.be.equal(1);
            done();
          })
      })
    })
  })
 
})