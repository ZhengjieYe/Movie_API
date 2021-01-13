import chai from "chai";
import request from "supertest";
const mongoose = require("mongoose");

const expect = chai.expect;

let api;
let db;
let token;
let recommendMovies;
let recommendActors;

describe("Recommend endpoint", () => {
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
        "username": "user2",
        "password": "test2"
      })
      .end((req,res)=>{
        token=res.body.token.split(" ")[1];

        request(api)
          .post("/api/users/user2/favourites")
          .send({
            "id":"529203"
          })
          .set('Authorization', 'bearer ' + token)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((req,res)=>{
            expect(res.body.favourites.length).to.equal(1);
            expect(res.body.username).to.equal("user2");
            done();
          })
      })

      
    },4000)
  });

  afterEach(() => {
    api.close(); // Release PORT 8080
    delete require.cache[require.resolve("../../../../index")];
  });
  
  describe("GET /api/recommend/movies",()=>{
    beforeEach((done)=>{
      request(api)
      .get("/api/recommend/movies")
      .set('Authorization', 'bearer ' + token)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200)
      .end((req,res)=>{
        expect(res.body.success).to.be.true;
        recommendMovies=res.body.recommendMovies;

        request(api)
          .post("/api/users/user2/favourites")
          .send({
            "id":"737568"
          })
          .set('Authorization', 'bearer ' + token)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((req,res)=>{
            expect(res.body.favourites.length).to.equal(2);
            expect(res.body.username).to.equal("user2");
            done();
          })
      })
    })
    describe("When request with valid token",()=>{
      it("should return different recommend movies according to user's favourite movies and a status 200",(done)=>{
        request(api)
          .get("/api/recommend/movies")
          .set('Authorization', 'bearer ' + token)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((req,res)=>{
            expect(res.body.success).to.be.true;
            expect(res.body.recommendMovies).to.not.equal(recommendMovies);
            expect(res.body.recommendMovies).to.deep.include(...recommendMovies);
            done();
          })
      })
    })

    describe("When request with invalid token",()=>{
      it("should return invalid token error message and a status 403",(done)=>{
        request(api)
          .get("/api/recommend/movies")
          .set('Authorization', 'bearer a' + token)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(403)
          .end((req,res)=>{
            expect(res.body.status).to.equal("fail");
            expect(res.body.message).to.equal("Invalid Token");
            done();
          })
      })
    })

    describe("When request without token",()=>{
      it("should return lack of token error message and a status 401",(done)=>{
        request(api)
          .get("/api/recommend/movies")
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(401)
          .end((req,res)=>{
            expect(res.body.status).to.equal("fail");
            expect(res.body.message).to.equal("Lack of Token");
            done();
          })
      })
    })
  })


  describe("GET /api/recommend/actors",()=>{
    beforeEach((done)=>{
      request(api)
      .get("/api/recommend/actors")
      .set('Authorization', 'bearer ' + token)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200)
      .end((req,res)=>{
        expect(res.body.success).to.be.true;
        recommendActors=res.body.recommendActors;

        request(api)
          .post("/api/users/user2/favourites")
          .send({
            "id":"737568"
          })
          .set('Authorization', 'bearer ' + token)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((req,res)=>{
            expect(res.body.favourites.length).to.equal(2);
            expect(res.body.username).to.equal("user2");
            done();
          })
      })
    })
    describe("When request with valid token",()=>{
      it("should return different recommend actors according to user's favourite movies and a status 200",(done)=>{
        request(api)
          .get("/api/recommend/actors")
          .set('Authorization', 'bearer ' + token)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((req,res)=>{
            expect(res.body.success).to.be.true;
            expect(res.body.recommendActors).to.not.equal(recommendActors);
            expect(res.body.recommendActors).to.deep.include(...recommendActors);
            done();
          })
      })
    })

    describe("When request with invalid token",()=>{
      it("should return invalid token error message and a status 403.",(done)=>{
        request(api)
          .get("/api/recommend/actors")
          .set('Authorization', 'bearer a' + token)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(403)
          .end((req,res)=>{
            expect(res.body.status).to.equal("fail");
            expect(res.body.message).to.equal("Invalid Token");
            done();
          })
      })
    })

    describe("When request without token",()=>{
      it("should return lack of token error message and a status 401.",(done)=>{
        request(api)
          .get("/api/recommend/actors")
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(401)
          .end((req,res)=>{
            expect(res.body.status).to.equal("fail");
            expect(res.body.message).to.equal("Lack of Token");
            done();
          })
      })
    })
  })
})
