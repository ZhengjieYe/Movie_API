import chai from "chai";
import request from "supertest";
import api from "../../../../index";

const expect = chai.expect;
before(function (done) {
  setTimeout(()=>{
    console.log('wait for optimizely...');
    done()
  },4000)
});
describe("test",()=>{
  it.only("should return 200",(done)=>{
    request(api)
      .get("/")
      .expect(200)
      .end((err,res)=>{
        console.log(res.text);
        done()
      })
  })
})