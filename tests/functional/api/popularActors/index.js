import chai from "chai";
import request from "supertest";
const mongoose = require("mongoose");
import ActorModel from '../../../../api/popular/actor/popularActor'

const expect = chai.expect;

let api;
let db;
let adminToken;
let normalToken;
const validActorId=90633;
const invalidActorId=906;

describe("Popular Actors endpoint",()=>{
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
        adminToken=res.body.token.split(" ")[1];
      })
      
      request(api)
        .post('/api/users/login')
        .send({
          "username": "user2",
          "password": "test2"
        })
        .end((req,res)=>{
          normalToken=res.body.token.split(" ")[1];
          done();
        })
    },4000)
  });

  afterEach(() => {
    api.close(); // Release PORT 8080
    delete require.cache[require.resolve("../../../../index")];
  });

  describe("GET ​/api​/popular​/actors",()=>{
    it("should return actors list and a status 200",(done)=>{
      request(api)
        .get("/api/popular/actors")
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .end(async (req,res)=>{
          const actors = await ActorModel.find();
          expect(res.body.actors.length).to.eq(actors.length);
          done();
        })
    })
  })

  describe("GET /api/popular/actors/{actor_id}/known_for_movies",()=>{
    describe("when request with a valid actor id",()=>{
      it("should return the known_for list and a status 200",(done)=>{
        request(api)
          .get(`/api/popular/actors/${validActorId}/known_for_movies`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end(async (req,res)=>{
            const actor = await ActorModel.findOne({id:validActorId});
            expect(res.body.success).to.be.true;
            for(let k in res.body.known_for){
              expect(res.body.known_for[k]._id).to.eq(String(actor.known_for[k]))
            }
            done();
          })
      })
    })

    describe("When request with a invalid actor id",()=>{
      it("should return error message and a status 404",(done)=>{
        request(api)
          .get(`/api/popular/actors/${invalidActorId}/known_for_movies`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(404)
          .end((req,res)=>{
            expect(res.body.success).to.be.false;
            expect(res.body.message).to.eq("Can not find the actor!");
            done();
          })
      })
    })
  })

  describe("POST /api/popular/actors/{actor_id}/review",()=>{
    describe("When request with a valid actor id",()=>{
      it("should return actor info and a status 200",(done)=>{
        request(api)
          .post(`/api/popular/actors/${validActorId}/review`)
          .set('Authorization', 'bearer ' + adminToken)
          .send({
            "content": 'content'
          })
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((req,res)=>{
            expect(res.body.id).to.eq(validActorId);
            expect(res.body.reviews.length).to.eq(1);
            done();
          })
      })
    })
    

    describe("When request with a invalid actor",()=>{
      it("should return error message and a status 404 ",(done)=>{
        request(api)
          .post(`/api/popular/actors/${invalidActorId}/review`)
          .set('Authorization', 'bearer ' + adminToken)
          .send({
            "content": 'content'
          })
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(404)
          .end((req,res)=>{
            expect(res.body.success).to.be.false;
            expect(res.body.message).to.eq("Can not find the actor!");
            done();
          })
      })
    })
  })

  describe("PUT /api/popular/actors/{actor_id}/review",()=>{
    let reviewId;
    beforeEach((done)=>{
      request(api)
        .post(`/api/popular/actors/${validActorId}/review`)
        .set('Authorization', 'bearer ' + adminToken)
        .send({
          "content": 'content'
        })
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .end((req,res)=>{
          reviewId=res.body.reviews[0];
          done();
        });
    })

    describe("When request with valid and exist review id in body",()=>{
      it("should return success and new review and a status 200",(done)=>{
        request(api)
          .put(`/api/popular/actors/${validActorId}/review`)
          .set('Authorization', 'bearer ' + adminToken)
          .send({
            "content": "new content.",
            "id": reviewId
          })
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((req,res)=>{
            expect(res.body.success).to.be.true;
            expect(res.body.newReview.content).to.eq("new content.");
            done();
          })
      })
    })

    describe("when request with a invalid review id",()=>{
      it("should return error message and a status 404.",(done)=>{
        request(api)
          .put(`/api/popular/actors/${validActorId}/review`)
          .set('Authorization', 'bearer ' + adminToken)
          .send({
            "content": "new content.",
            "id": "InvalidId"
          })
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(500)
          .end((req,res)=>{
            expect(res.body.status).to.eq("error");
            expect(res.body.message).to.eq('Something went very wrong!');
            done();
          })
      })
    })

    describe("When request with a valid but not exist review id.",()=>{
      it("should return review not found error message and a status 404",(done)=>{
        request(api)
          .put(`/api/popular/actors/${validActorId}/review`)
          .set('Authorization', 'bearer ' + adminToken)
          .send({
            "content": "new content.",
            "id": "5fefaec6f9aeeb4a9c45b2fc"
          })
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(404)
          .end((req,res)=>{
            expect(res.body.success).to.be.false;
            expect(res.body.message).to.eq("Can not find the review!");
            done();
          })
      })
    })
  })

  describe("DELETE /api/popular/actors/{actor_id}/review/{review_id}",()=>{
    let adminReviewId;
    let normalReviewId;
    beforeEach((done)=>{
      request(api)
        .post(`/api/popular/actors/${validActorId}/review`)
        .set('Authorization', 'bearer ' + adminToken)
        .send({
          "content": 'admin content'
        })
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .end((req,res)=>{
          adminReviewId=res.body.reviews[0];

          request(api)
            .post(`/api/popular/actors/${validActorId}/review`)
            .set('Authorization', 'bearer ' + normalToken)
            .send({
              "content": 'normal content'
            })
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200)
            .end((req,ress)=>{
              normalReviewId=ress.body.reviews[1];
              done();
            });
        });
        
    })

    describe("When request with admin user and review belong to him.",()=>{
      it("should return admin success message and a status 200",(done)=>{
        request(api)
          .del(`/api/popular/actors/${validActorId}/review/${adminReviewId}`)
          .set('Authorization', 'bearer ' + adminToken)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((req,res)=>{
            expect(res.body.success).to.be.true;
            expect(res.body.message).to.eq("Delete successfully by admin - user1!");
            done();
          })
      })
    })

    describe("When request with admin user and review not belong to him.",()=>{
      it("should return admin success message and a status 200.",(done)=>{
        request(api)
          .del(`/api/popular/actors/${validActorId}/review/${normalReviewId}`)
          .set('Authorization', 'bearer ' + adminToken)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((req,res)=>{
            expect(res.body.success).to.be.true;
            expect(res.body.message).to.eq("Delete successfully by admin - user1!");
            done();
          })
      })
    })

    describe("When request with normal user and review belong to him.",()=>{
      it("should return normal success message and a status 200",(done)=>{
        request(api)
          .del(`/api/popular/actors/${validActorId}/review/${normalReviewId}`)
          .set('Authorization', 'bearer ' + normalToken)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((req,res)=>{
            expect(res.body.success).to.be.true;
            expect(res.body.message).to.eq("Delete successfully by normal - user2!");
            done();
          })
      })
    })

    describe("When request with normal user and review not belong to him.",()=>{
      it("should return error message and a status 403",(done)=>{
        request(api)
          .del(`/api/popular/actors/${validActorId}/review/${adminReviewId}`)
          .set('Authorization', 'bearer ' + normalToken)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(403)
          .end((req,res)=>{
            expect(res.body.success).to.be.false;
            expect(res.body.message).to.eq("Delete failed by normal - user2.");
            done();
          })
      })
    })

    describe("When request with invalid review id",()=>{
      it("should return error message and a status 404. ",(done)=>{
        request(api)
          .del(`/api/popular/actors/${validActorId}/review/dadsdw`)
          .set('Authorization', 'bearer ' + normalToken)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(404)
          .end((req,res)=>{
            expect(res.body.success).to.be.false;
            expect(res.body.message).to.eq("Review not found.");
            done();
          })
      })
    })
  })
})