import chai from "chai";
import request from "supertest";
import {getTopRated} from '../../../../api/tmdb-api'
const mongoose = require("mongoose");

const expect = chai.expect;
let api;
let top;
let db;

describe("topRated endpoint",()=>{
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
      getTopRated(1).then(res=>{
        top=res;
        done()
      })
    },7000)
  });
  
  afterEach(() => {
    api.close(); // Release PORT 8080
    delete require.cache[require.resolve("../../../../index")];
  });
  describe("GET /api/topRated",()=>{
    describe("When request with valid page number",()=>{
      it("should return the right page's 20 top rated movies and a status 200",(done)=>{
        request(api)
          .get('/api/topRated')
          .query({page:1})
          .expect(200)
          .end((req,res)=>{
            expect(res.body.length).to.eq(top.length);
            done();
          })
      })
    })

    describe("When request with invalid page number",()=>{
      it("should return the error message and a status 404",(done)=>{
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
})