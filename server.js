// server.js
// where your node app starts

// init project
const express = require('express');
const ebird = require('ebird-js');
const {Inquiry, InquiryP, Pass, Fail, Questionset} = require('inquiry-monad');
const moment = require('moment');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get('/birds/local', function(req, response) {
  
  const birdQuestionset = Questionset.of([
    [
      'how many warbler species?',
      birds => {
        
        const warbs = birds.reduce((acc, val) => val.comName.includes('Warbler') ? acc+1 : acc, 0);
    
        return warbs > 0
          ? Pass(`There have been ${warbs} species with "warbler" in their name reported nearby recently. 😄`)
          : Fail(`There have been no species with "warbler" in their name reported nearby recently. 😞`); 
      }
    ],
    [
      'when was the last Mallard seen?',
      birds => {
        const mallard = birds.find(bird => bird.comName === 'Mallard');
        return mallard
          ? Pass(`Mallards were last reported nearby ${moment(mallard.obsDt).fromNow()}. 🦆`)
          : Fail(`No Mallards seen nearby lately. 😧`);
      }
    ],
    [
      'where was the latest Blue-winged Warbler observed?',
      birds => {
        const bwwa = birds.find(bird => bird.comName === 'Blue-winged Warbler');
        return bwwa
          ? Pass(`The latest Blue-winged Warbler reported nearby was at ${bwwa.locName}. 😎`)
          : Fail(`No Blue-winged Warblers reported nearby recently. 😧`);
      }
    ],
    [
      'how many Whimbrel have been seen recently?',
      birds => {
        const whimbrel = birds.find(bird => bird.comName === 'Whimbrel');
        return whimbrel
          ? Pass(`Whimbrel were last reported nearby in a flock of ${whimbrel.count}.`)
          : Fail(`No Whimbrel reported lately nearby. 😐`);
      }
    ],
    [
      'have there been any single-species flocks greater than 100 nearby recently?',
      birds => {
        const species = birds.reduce((acc, cur) => cur.howMany > 100 ? acc + 1 : acc, 0);
        return species
          ? Pass(`There were ${species} species nearby whose last report counted greater than 100 👍`)
          : Fail(`There were no species nearby whose last report counted greater than 100 😐`);
      }
    ]  
  ]);

  const params = {
    lat: req.query.lat,
    lng: req.query.lng
  };

  ebird.data.obs.geo.recent(params).then((data) => {
    
    const inq = Inquiry.subject(data)
      .using(birdQuestionset)
      .inquire('how many warbler species?')
      .inquire('when was the last Mallard seen?')
      .inquire('where was the latest Blue-winged Warbler observed?')
      .inquire('how many Whimbrel have been seen recently?')
      .inquire('have there been any single-species flocks greater than 100 nearby recently?')
      .join();

    response.send({
      pass: inq.pass.join(),
      fail: inq.fail.join(),
      birds: data
    });
  }).catch((error) => {
      console.log(error);
  });
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
