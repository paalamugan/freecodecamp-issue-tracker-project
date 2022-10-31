"use strict";
const crypto = require("crypto");
const issues = [];

module.exports = function (app) {
  app
    .route("/api/issues/:project")

    .get(function (req, res) {
      let project = req.params.project;
      let query = req.query;
      console.log("issues", issues)
      let filteredIssue = issues.filter((issue) => {
        let keys = Object.keys(query)
        if (!keys.length) {
          return issue.project === project;
        }

        return keys.every((key) => {
          if (key === "open") {
            return Boolean(open) === issue.open;
          }
          return query[key] === issue[key];
        })
      });

      res.json(
        filteredIssue.map((issue) => {
          let { project, ...rest } = issue;
          return rest;
        })
      );
    })

    .post(function (req, res) {
      try {
        let project = req.params.project;
        let { issue_title, issue_text, created_by, assigned_to, status_text } =
          req.body;

        if (!issue_title || !issue_text || !created_by) {
          throw new Error("required field(s) missing");
        }

        let created_on = new Date().toISOString();
        let result = {
          assigned_to: assigned_to || "",
          status_text: status_text || "",
          open: true,
          _id: crypto.randomBytes(16).toString("hex"),
          issue_title: issue_title,
          issue_text: issue_text,
          created_by: created_by,
          created_on: created_on,
          updated_on: created_on,
        };
        issues.push({
          ...result,
          project: project,
        });
        res.json(result);
      } catch (err) {
        res.status(400).send({ error: err.message });
      }
    })

    .put(function (req, res) {
      let project = req.params.project;
      let { _id, ...fields } = req.body;
      if (!_id) {
        return res.status(400).json({ error: "missing _id" });
      }
      let fieldKeys = Object.keys(fields)
      if (!fieldKeys.length) {
        return res
          .status(400)
          .json({ error: "no update field(s) sent", _id: _id });
      }

      fieldKeys.forEach((key) => {
        if (!fields[key]) {
          delete fields[key];
        }
      })

      const index = issues.findIndex((issue) => issue._id === _id);

      if (index === -1) {
        return res.status(400).json({ error: "could not update", _id: _id });
      }

      if ('open' in fields) {
        fields.open = Boolean(fields.open); 
      }
      console.log("fields", fields)
      issues[index] = {
        ...issues[index],
        ...fields,
        updated_on: new Date().toISOString(),
      };
      console.log("issues", issues)
      res.json({ result: "successfully updated", _id: _id });
    })

    .delete(function (req, res) {
      let project = req.params.project;
      let { _id } = req.body;
      if (!_id) {
        return res.status(400).json({ error: "missing _id" });
      }

      const index = issues.findIndex((issue) => issue._id === _id);

      if (index === -1) {
        return res.status(400).json({ error: "could not delete", _id: _id });
      }

      issues.splice(index, 1);

      res.json({ result: "successfully updated", _id: _id });
    });
};
