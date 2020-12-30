import chai from "chai";
import request from "supertest";

const expect = chai.expect;
let api;
let token;

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
      request(api)
        .post("/api/users/login")
        .send({
          username: "user1",
          password: "test1"
        })
        .expect(200)
        .end((req,res)=>{
          token=res.body.token.split(" ")[1];
          done();
        })
    },4000)
  });
  
  afterEach(() => {
    api.close(); // Release PORT 8080
    delete require.cache[require.resolve("../../../../index")];
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
  describe("GET /api/upcoming/watchlist",()=>{
    it("should return watchlist and a status 200 when a valid token given",(done)=>{
      request(api)
        .get("/api/upcoming/watchlist")
        .set('Authorization', 'bearer ' + token)
        .expect(200)
        .end((req,res)=>{
          expect(res.body.success).to.be.true;
          expect(res.body.watchlist).to.be.exist;
          done();
        })
    })

    it("should return error message and a status 401 when a invalid token given",(done)=>{
      request(api)
      .get("/api/upcoming/watchlist")
      .set('Authorization', 'bearer ' + "useless Token")
      .expect(401)
      .end((req,res)=>{
        console.log(res.body);
        expect(res.body.status).to.be.equal("fail");
        expect(res.body.message).to.be.equal("Invalid Token");
        done();
      })
    })

    it("should return error message and a status 401 when a token not given",(done)=>{
      request(api)
      .get("/api/upcoming/watchlist")
      .expect(401)
      .end((req,res)=>{
        console.log(res.body);
        expect(res.body.status).to.be.equal("fail");
        expect(res.body.message).to.be.equal("Lack of Token");
        done();
      })
    })
  })


  describe("POST /api/upcoming/watchlist",()=>{
    it("should return watchlist and a status 200 when a new movie added successfully",(done)=>{
      request(api)
        .post("/api/upcoming/watchlist")
        .set('Authorization', 'bearer ' + token)
        .send({
          id: 529203
        })
        .expect(200)
        .end((req,res)=> {
          expect(res.body.watchlist.length).to.be.equal(1)
          expect(res.body.success).to.be.true;
          done();
        });
    })

    it("should return error message and a status 403 with a movie exist in watchlist",(done)=>{
      request(api)
        .post("/api/upcoming/watchlist")
        .set('Authorization', 'bearer ' + token)
        .send({
          id: 529203
        })
        .expect(200)
        .end((req,res)=> {
          console.log(res.body);
          expect(res.body.watchlist.length).to.be.equal(1)
          expect(res.body.success).to.be.true;

          request(api)
            .post("/api/upcoming/watchlist")
            .set('Authorization', 'bearer ' + token)
            .send({
              id: 529203
            })
            .expect(403)
            .end((req,res)=> {
              expect(res.body.message).to.be.equal("Already in watchlist.");
              expect(res.body.success).to.be.false;
              done();
            });
        });
    })
  })

  describe("POST /api/upcoming/watchlist/validate_with_login",()=>{
    it("should return watchlist and a status 200 with valid username and password",(done)=>{
      request(api)
        .post('/api/upcoming/watchlist/validate_with_login')
        .send({
          username: "user1",
          password: "test1"
        })
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .end((req,res)=>{
          expect(res.body.success).to.be.true;
          expect(res.body.watchlist).to.be.exist;
          done();
        })
    })

    it("should return error message and a status 401 with valid username and incorrect password",(done)=>{
      request(api)
        .post('/api/upcoming/watchlist/validate_with_login')
        .send({
          username: "user1",
          password: "test"
        })
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(401)
        .end((req,res)=>{
          expect(res.body.success).to.be.false;
          expect(res.body.message).to.be.equal("Authentication failed. Wrong password.");
          done();
        })
    })

    it("should return error message and a status 401 with invalid user",(done)=>{
      request(api)
        .post('/api/upcoming/watchlist/validate_with_login')
        .send({
          username: "user",
          password: "test"
        })
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(401)
        .end((req,res)=>{
          expect(res.body.status).to.be.equal("error");
          expect(res.body.message).to.be.equal("Invalid user!");
          done();
        })
    })
  })

  describe("DELETE /api/upcoming/watchlist/{id}",()=>{
    it("should return delete success and watchlist and a status 200 with valid movie id exist in user's watchlist",(done)=>{
      request(api)
      .post("/api/upcoming/watchlist")
      .set('Authorization', 'bearer ' + token)
      .send({
        id: 529203
      })
      .expect(200)
      .end((req,res)=>{
        expect(res.body.watchlist.length).to.be.equal(1)
        expect(res.body.success).to.be.true;

        request(api)
          .del("/api/upcoming/watchlist/529203")
          .set('Authorization', 'bearer ' + token)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((req,res)=>{
            expect(res.body.success).to.be.true;
            expect(res.body.delete).to.be.true;
            expect(res.body.watchlist).to.be.exist;
            done();
          })
      });
    })

    it("should return error message and a status 403 with a movie not in watchlist",(done)=>{
      request(api)
          .del("/api/upcoming/watchlist/529203")
          .set('Authorization', 'bearer ' + token)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((req,res)=>{
            expect(res.body.success).to.be.false;
            expect(res.body.message).to.be.equal("The movie not in the watchlist!");
            done();
          })
    })
  })
})