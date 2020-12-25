/**
 * @swagger
 *
 * /test:
 *    get:
 *      summary: "test"
 *      description: "hi"
 *      produces:
 *      - "application/json"
 *      responses:
 *        "200":
 *          description: "successful"
 *          content:
 *            text/html; charset=utf-8:
 *              schema:
 *                type: string
 *              examples: {}
 *        "400":
 *          description: "Invalid"
 */


import express from "express"

const router=express.Router();

router.get("/",(req,res)=>{
  res.status(200).send("test success")
})

export default router;