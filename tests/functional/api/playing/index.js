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

  describe("/api/playing endpoint",()=>{
    describe("GET /api/playing",()=>{
      it("should return playing Movies and a status 200",(done)=>{
        request(api)
          .get("/api/playing")
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((req,res)=>{
            expect(res.body.success).to.be.true;
            expect(res.body.playingMovies).to.be.exist;
            done();
          })
      })
    })
  })
  
})