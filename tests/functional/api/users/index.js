import chai from "chai";
import request from "supertest";
import {getMovies} from '../../../../api/tmdb-api'

const expect = chai.expect;

let api;
let admin_token;
let normal_token;
let admin_refresh_token;
let normal_refresh_token;

describe("Users endpoint", () => {
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
          admin_token=res.body.token.split(" ")[1];
          admin_refresh_token=res.body.refreshToken;
        });
      request(api)
        .post('/api/users/login')
        .send({
          "username": "user2",
          "password": "test2"
        })
        .end((req,res)=>{
          normal_token=res.body.token.split(" ")[1];
          normal_refresh_token=res.body.refreshToken;
          done();
        })
    },4000)
  });

  describe("POST /api/users/login",()=>{
    it("should return token and refresh token and a status 200 with admin account",(done)=>{
      request(api)
        .post('/api/users/login')
        .send({
          "username": "user1",
          "password": "test1"
        })
        .expect(200)
        .end((req,res)=>{
          expect(res.body).to.have.own.property("token");
          expect(res.body).to.have.own.property("refreshToken");
          done();
        })
    })

    it("should return token and refresh token and a status 200 with normal account",(done)=>{
      request(api)
        .post('/api/users/login')
        .send({
          "username": "user2",
          "password": "test2"
        })
        .expect(200)
        .end((req,res)=>{
          expect(res.body).to.have.own.property("token");
          expect(res.body).to.have.own.property("refreshToken");
          done();
        })
    })

    it("should return error message and a status 401 with invalid user or password",(done)=>{
      request(api)
        .post('/api/users/login')
        .send({
          "username": "Wrong",
          "password": "Wrong"
        })
        .expect(401)
        .end((req,res)=>{
          expect(res.body.code).to.eq(401);
          expect(res.body.msg).to.eq("Authentication failed. User not found.");
          done();
        })
    })
  })

  describe("POST /api/users/token",()=>{
    it("should return new Token and a status 200 with valid refresh token",(done)=>{
      request(api)
      .post('/api/users/token')
      .send({
        "token": admin_refresh_token
      })
      .expect(200)
      .end((req,res)=>{
        expect(res.body.success).to.eq(true);
        done()
      })
    })

    it("should return error message and a status 403 with invalid refresh token",(done)=>{
      request(api)
      .post('/api/users/token')
      .send({
        "token": "invalidToken"
      })
      .expect(403)
      .end((req,res)=>{
        expect(res.body.message).to.eq("Token is invalid!");
        done()
      })
    })
  })

  describe("GET /api/users",()=>{
    it("should return users and a status 200 with admin token",(done)=>{
      request(api)
        .get("/api/users")
        .set('Authorization', 'bearer ' + admin_token)
        .expect(200)
        .end((req,res)=>{
          for (let user in res.body){
            if(user.username==="user1") expect(user.role).to.eq("admin")
          }
          done()
        })
    })

    it("should return error message and a status 403 with invalid or not admin token",(done)=>{
      request(api)
        .get("/api/users")
        .set('Authorization', 'bearer ' + normal_token)
        .expect(403)
        .end((req,res)=>{
          expect(res.body.message).to.eq("You do not have permission to access");
          done()
        })
    })
  })  

  describe("/api/users/:username/favourites endpoint",()=>{
    let movies;

    before((done)=>{
      getMovies().then((res)=>{
        movies=res;
        request(api)
        .post('/api/users/user1/favourites')
        .send({
          "id":movies[0].id
        })
        .expect(200)
        .end(() => done())
      })
    })

    describe("GET /api/users/:username/favourites",()=>{
      it("should return the added movies list and a status 200",(done)=>{
        request(api)
          .get('/api/users/user1/favourites')
          .expect(200)
          .end((req,res)=>{
            expect(res.body[0].id).to.eq(movies[0].id);
            expect(res.body[0].title).to.eq(movies[0].title);
            done();
          })
      })
    })

    describe("POST /api/users/:username/favourites",()=>{
      it("should return the added movie and a status 200",(done)=>{
        request(api)
        .post('/api/users/user1/favourites')
        .send({
          "id":movies[1].id
        })
        .expect(200)
        .end((req,res) =>{
          expect(res.body.favourites.length).to.eq(2);
          done();
        })
      })

      it("should return error message and a status 401 with movie already in favourites",(done)=>{
        request(api)
        .post('/api/users/user1/favourites')
        .send({
          "id":movies[0].id
        })
        .expect(401)
        .end((req,res) =>{
          expect(res.body.msg).to.eq("Already in favourites.");
          done();
        })
      })
    })
  })
})
