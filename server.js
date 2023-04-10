const express = require("express");
const app = express();
const got = require('got');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require('fs');

const port= 3001;


async function getURL(name) {
  try {
    const response = await got('https://www.naeu.playblackdesert.com/en-US/Adventure?region=NA&searchType=2&searchKeyword='+name);
    const dom = new JSDOM(response.body);
    return dom.window.document.querySelector('div.box_list_area ul li div.title a').href;
  } catch(err) {
    return "ERROR";
  }
};

async function getName(link) {
  try {
    link = link.replace(/\//g, '%2f').replace(/\+/g, '%2b').replace(/\=/g, '%3d')
    const response = await got('https://www.naeu.playblackdesert.com/en-US/Adventure/Profile?profileTarget='+link);
    const dom = new JSDOM(response.body);
    return dom.window.document.querySelector('p.nick').textContent;
  } catch(err) {
    return "ERROR";
  }
};

async function getGuild(guild) {
  try {
    const response = await got('https://www.naeu.playblackdesert.com/en-US/Adventure/Guild/GuildProfile?guildName='+guild+'&region=NA');
    const dom = new JSDOM(response.body);
    var rawArray = [...dom.window.document.querySelectorAll('ul.adventure_list_table span.character_desc a')].sort(function(a, b){
      if(a.textContent < b.textContent) { return -1; }
      if(a.textContent > b.textContent) { return 1; }
      return 0;
    })
    var memberList = [];
    rawArray.forEach((x) => memberList.push({name: x.textContent, profile: x.href}));

    var guildInfo = {};
    guildInfo.name = guild;
    guildInfo.master = dom.window.document.querySelector('div.box_profile_area span.character_desc a').textContent;
    guildInfo.size = memberList.length;
    guildInfo.members = memberList;

    return guildInfo;
  } catch(err) {
    console.log(err)
    return "ERROR";
  }
};

var router = express.Router();              // get an instance of the express Router


// all of our routes will be prefixed with /bdo
app.use('/bdo', router);


// test route to make sure everything is working (accessed at GET /bdo)
router.get('/', function(req, res) {
    res.sendStatus(200);
});


router.route('/link/:name')

// get the link of the requested name (accessed at GET /bdo/link/:name)
    .get(function(req, res) {
        (async () => {
          res.send(await getURL(req.params.name));
        })();
    });


router.route('/name/:link')

// get the name of the requested url (accessed at GET /bdo/name/:link)
    .get(function(req, res) {
        (async () => {
          res.send(await getName(req.params.link));
        })();
    });

router.route('/guild/:name')

// get the members list of the requested guild (accessed at GET /bdo/guild/:name)
    .get(function(req, res) {
        (async () => {
          res.send(await getGuild(req.params.name));
        })();
    });


// listen for requests
const listener = app.listen(port, () => {
  console.log("API is listening on port " + listener.address().port);
});



