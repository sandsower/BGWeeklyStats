const jsonFile = require('./export.json');
const moment = require('moment');
const fs = require('fs');


const getLastWeek = () => {
  return moment().subtract(7, 'days').startOf('day');
}

const getThumbsUp = (game) => {
  return "👍".repeat(game[0].rating);
}

function onlyUnique(value, index, self) { 
  return self.indexOf(value) === index;
}

const getGameInfo = (game) => {
  const sessions = game.length;
  const playerCounts = game.map(g => g.numberOfPlayers).filter(onlyUnique).map(n => `${n}p`);
  return `(x${sessions}) ${playerCounts.join(' & ')}`
}

const processPlays = () => {
  const loggedPlays = jsonFile.plays;
  let plays = [];
  const lwdate = getLastWeek();
  const aggregatePlays = {};
  const filteredPlays = loggedPlays.filter(p => {
    return moment(p.playDate).isAfter(lwdate);
  });

  for(const fP of filteredPlays) {
    const game = jsonFile.games.find(x => x.id === fP.gameRefId);

    if (!(game.name in aggregatePlays)) {
      aggregatePlays[game.name] = [];
    }

    aggregatePlays[game.name] = [{
      rating: fP.rating,
      numberOfPlayers: fP.playerScores.length
    }, ...aggregatePlays[game.name]];
  }

  for(const gameName of Object.keys(aggregatePlays)) {
    plays = [...plays, `${gameName} ${getGameInfo(aggregatePlays[gameName])} ${getThumbsUp(aggregatePlays[gameName])}`];
  }

  fs.writeFile('result.txt', plays.join('\n'), (err) => {
    if (err) {
      console.error(err)
    } else {
      console.log('Saved!');
    }
  })
}

processPlays();