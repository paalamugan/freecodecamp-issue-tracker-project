const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);
const requester = chai.request(server).keepOpen();
suite("Functional Tests", function () {
  test("Create an issue with every field: POST request to /api/issues/{project}", function (done) {
    requester
      .post("/api/issues/apitest")
      .send({
        issue_title: "Faux Issue Title 2",
        issue_text: "Functional Test - Every field filled in",
        created_by: "fCC",
        assigned_to: "Chai and Mocha",
      })
      .end(function (err, res) {
        assert.strictEqual(res.body.issue_title, "Faux Issue Title 2");
        done();
      });
  });
  test("Create an issue with only required fields: POST request to /api/issues/{project}", function (done) {
    requester
      .post("/api/issues/apitest")
      .send({
        issue_title: "Faux Issue Title 2",
        issue_text: "Functional Test - Every field filled in",
        created_by: "fCC",
      })
      .end(function (err, res) {
        assert.strictEqual(res.body.assigned_to, "");
        done();
      });
  });
  test("Create an issue with missing required fields: POST request to /api/issues/{project}", function (done) {
    requester
      .post("/api/issues/apitest")
      .send({
        issue_title: "Faux Issue Title 2",
        issue_text: "Functional Test - Every field filled in",
      })
      .end(function (err, res) {
        assert.strictEqual(res.body.error, "required field(s) missing");
        done();
      });
  });
  test("View issues on a project: GET request to /api/issues/{project}", function (done) {
    requester.get("/api/issues/apitest").end(function (err, res) {
      assert.strictEqual(res.body.length, 2);
      done();
    });
  });
  test("View issues on a project with one filter: GET request to /api/issues/{project}", function (done) {
    requester
      .get("/api/issues/apitest")
      .query({ open: false })
      .end(function (err, res) {
        console.log("res", res.body);
        assert.strictEqual(res.body.length, 0);
        done();
      });
  });
  test("View issues on a project with multiple filters: GET request to /api/issues/{project}", function (done) {
    requester
      .get("/api/issues/apitest")
      .query({ open: true, assigned_to: "Chai and Mocha" })
      .end(function (err, res) {
        assert.strictEqual(res.body.length, 1);
        done();
      });
  });
  test("Update one field on an issue: PUT request to /api/issues/{project}", function (done) {
    requester.get("/api/issues/apitest").end((err, res) => {
      const firstRecord = res.body[0];
      requester
        .put("/api/issues/apitest")
        .send({ _id: firstRecord._id, open: false })
        .end(function (err, res) {
          assert.strictEqual(res.body.result, "successfully updated");
          done();
        });
    });
  });
  test("Update multiple fields on an issue: PUT request to /api/issues/{project}", function (done) {
    requester.get("/api/issues/apitest").end((err, res) => {
      const firstRecord = res.body[0];
      requester
        .put("/api/issues/apitest")
        .send({
          _id: firstRecord._id,
          open: false,
          issue_text: "new Issue text",
        })
        .end(function (err, res) {
          assert.strictEqual(res.body.result, "successfully updated");
          done();
        });
    });
  });
  test("Update an issue with missing _id: PUT request to /api/issues/{project}", function (done) {
    requester
      .put("/api/issues/apitest")
      .send({ _id: null, open: false, issue_text: "new Issue text" })
      .end(function (err, res) {
        assert.strictEqual(res.body.error, "missing _id");
        done();
      });
  });
  test("Update an issue with no fields to update: PUT request to /api/issues/{project}", function (done) {
    requester.get("/api/issues/apitest").end((err, res) => {
      const firstRecord = res.body[0];
      requester
        .put("/api/issues/apitest")
        .send({
          _id: firstRecord._id,
        })
        .end(function (err, res) {
          assert.strictEqual(res.body.error, "no update field(s) sent");
          done();
        });
    });
  });
  test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", function (done) {
    requester
      .put("/api/issues/apitest")
      .send({
        _id: "invalid_id",
        open: false,
      })
      .end(function (err, res) {
        assert.strictEqual(res.body.error, "could not update");
        done();
      });
  });
  test("Delete an issue: DELETE request to /api/issues/{project}", function (done) {
    requester.get("/api/issues/apitest").end((err, res) => {
      const firstRecord = res.body[0];
      requester
        .delete("/api/issues/apitest")
        .send({
          _id: firstRecord._id,
        })
        .end(function (err, res) {
          assert.strictEqual(res.body.result, "successfully deleted");
          done();
        });
    });
  });
  test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", function (done) {
    requester
      .delete("/api/issues/apitest")
      .send({
        _id: "invalid_id",
      })
      .end(function (err, res) {
        assert.strictEqual(res.body.error, "could not delete");
        done();
      });
  });
  test("Delete an issue with missing _id: DELETE request to /api/issues/{project}", function (done) {
    requester
      .put("/api/issues/apitest")
      .send()
      .end(function (err, res) {
        assert.strictEqual(res.body.error, "missing _id");
        done();
      });
  });
});
