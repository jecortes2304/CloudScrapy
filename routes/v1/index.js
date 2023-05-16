const authRoutes = require("./authRoutes");
const usersRouter = require("./usersRoutes");
const executionsRoutes = require("./executionsRoutes");
const utilsRouter = require("./utilsRoutes");
const filesRouter = require("./filesRoutes");
const express = require("express");
const router = require('express').Router();


router.use('/auth', authRoutes);
router.use('/users', usersRouter);
router.use('/executions', executionsRoutes);
router.use('/utils', utilsRouter);
router.use('/files', filesRouter);
router.use('/files', express.static(`${__dirname}/files/logs`));
router.use('/files', express.static(`${__dirname}/files/screenshots`));
router.use('/files', express.static(`${__dirname}/files/pdfs`));

module.exports = router;
