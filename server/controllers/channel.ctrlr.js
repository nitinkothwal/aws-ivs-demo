module.exports = (function () {
    const express = require('express');
    const app = express();
    const IVS = require('../lib/ivs.channel');

    const surveyObj = {
        "title": "Your valuable feedback!!",
        "pages": [
         {
          "name": "page1",
          "elements": [
           {
            "type": "text",
            "name": "question1",
            "title": "What you would like to see in our shows next time?"
           },
           {
            "type": "radiogroup",
            "name": "question2",
            "title": "Are you enjoying this show?",
            "choices": [
             {
              "value": "yes",
              "text": "Yes"
             },
             {
              "value": "no",
              "text": "No"
             }
            ]
           },
           {
            "type": "rating",
            "name": "question3",
            "title": "Rate this show."
           }
          ]
         }
        ]
       };

    app.post('/metadata', async (req, res, next) => {
        try {
            const channelArn = req.body.channelArn;
            const metadata = JSON.stringify(surveyObj);
            await IVS.putMetadata(channelArn, metadata);
            res.send({success: true});
        } catch (error) {
            console.error('Error:', error);
            res.send({
                success: false,
                error: error && error.message || 'Unknown Error'
            });
        }
    });

    return app;
})();
