const router = require('express').Router();
const os = require('os');

router.get('/', async function (req, res) {
    /* 	#swagger.tags = ['Welcome']
         #swagger.description = 'Welcome endpoint' */
    res.send({
        message: 'Welcome to scrape the clouds',
        hostname: os.hostname()
    })
});

module.exports = router;