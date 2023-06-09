require('dotenv').config();
const { availableParallelism, tmpdir } = require('os');
var tiny = require('tiny-json-http');
const tmi = require('tmi.js'),
    { channel, username, password } = require('./settings.json');
const { say, timeout } = require('tmi.js/lib/commands');
const {promises: fsPromises} = require('fs');
const { resolve } = require('path');
const { removeAllListeners } = require('process');
const clientOptions = {
    options: { debug: true },
    connection: {
        reconnect: true,
        secure: true
    },
    identity: {
        username,
        password
    },
    channels: [channel]
};
const client = new tmi.Client(clientOptions);
client.connect().catch(console.error);

//Misc Global Vars
var rolledUsers = [];
var shinyRollCounter = 0;
var facts = [];

// var factsJSON = {};
var savCanGamble = true;

///Quiz Global Vars
var quizQsArr = [];
var quizHighScores = {};
class QuizState {
    static Idle = new QuizState("idle")
    static Playing = new QuizState("playing")
  
    constructor(state) {
      this.state = state
    }
}
var currentQuizState = QuizState.Idle;
var quizPlayer = 'testUser';
var playerScore = 0;
const numOfQs = 3;

//Who's That Pokemon Global Vars
class WTPState {
    static closed = new WTPState("closed")
    static open = new WTPState("open")
  
    constructor(state) {
      this.state = state
    }
}
var mon = [];
var WTPAnswer = '';
var currentWTPState = WTPState.closed;
var WTPTimeLimit = 120000;
var WTPQuestions = []
var WTPGuesses = {};
var WTPWinningPlayers = '';
var WTPWinningPlayersArr = [];
var WTPScores = {};

//Initialization
QuizReadHighScores('quizScores.json');
readRollerFile();
readRollCounter();
readFacts('funfacts.json');
readQuestions('quizgame.json');
readPokemonList();
readWTPQuestions();
whosThatPokemonReadScores();

client.on('connected', () => {
    console.log('Connected.');
    client.say(channel, `PowerUpL 🌻 PowerUpR`);
    
}); 

// setInterval(writeRollerFile, 480000); //Writes rolled users to file every 8 minutes
setInterval(funFactInterval, 1200000); //Says a fun fact every 20 mins.
// setInterval(whosThatPokemonGameControl, 2820000); //Plays WTP Game every 47 mins.

// client.on("part", (channel, username, self) => {
//     if(username == channel.slice(1)){
//         client.disconnect().catch(console.error);
//         console.log('Disconnected.')
//     }
// });

client.on('redeem', (channel, username, rewardType, tags, message) => {
    console.log(username + ' '+ rewardType +' '+ message);
})

client.on('message', (channel, user, message, self) => {
    const args = message.split(' ');
    const command = args.shift().toLowerCase();

    if(self && command == '!shinyroll'){
        ShinyRoll(sunflorabot);
    }

    if(self) return;
    if(user.username.toLowerCase() == 'nightbot') return;

    
    // console.log(command);

    if(command == '!test' && (user.mod || user.username == 'miggtorr')){
    
    }

    if(command == '!disconnect' && (user.mod || user.username == 'miggtorr')){
        console.log('Disconnecting...');
        client.say(channel, `🌻 💤`)
        writeRollerFile();
        setTimeout(() => {
            console.log('Disconnected!');
            process.exit(0);
        }, 2000);
    }

    if(command == '!test2' && (user.mod || user.username == 'miggtorr')){
        // whosThatPokemonCompileGuesses();
    }
    


    if(command == '!bestlegendary'){
        client.say(channel, `@${user.username}, did you know that Sunflora is the best legendary?`);
    }

    if(command == '!numberofnoses'){
        client.say(channel, `Taylor has one nose. ??? Why would you ask that?`);
    }

    if(command == '!actualfunfact' || command == '!realfunfact' || command == '!funfunfact'){
        funFact(args);
    }

    if(command == '!refreshfunfacts'){
        readFacts('funfacts.json');
        client.say(channel, 'Done!')
        console.log('Facts refreshed!')
    }

    if(command == '!bestshiny'){
        client.say(channel, `@${user.username}, did you know that Gengar is the best shiny in the entire Pokémon franchise?`);
    }

    if(command == '!bestlegendary'){
        client.say(channel, `@${user.username}, did you know that Sunflora is the best legendary?`);
    }

    if(command == '!nap' && (user.mod || user.username == 'miggtorr')){
        client.say(channel, 'Shutting down for 30 minutes.');
    }

    if(command == '!save' && (user.mod || user.username == 'miggtorr')){
        // client.say(channel, 'Shutting down for 30 minutes.');
        writeRollerFile();
    }

    if((command == '!newrolls' || command == '!refreshrolls' || command == '!resetrolls') && (user.mod || user.username == 'miggtorr')){
        rolledUsers = [];
        writeRollerFile();
        client.say(channel, "New shiny rolls available for everyone!");
    }

    if((command == '!resetcounter') && (user.mod || user.username == 'miggtorr')){
        shinyRollCounter = 0;
        rolledUsers = [];
        writeRollerFile();
        client.say(channel, "Shiny roll counter reset! New shiny rolls available for everyone!");
    }

    if(command == 'gn' && (user.mod || user.username == 'miggtorr')){
        client.say(channel, `Goodnight! @${user.username} Goodnight @${channel.substring(1,channel.length)} 🥰`);
        writeRollerFile();
    }

    if(command == '!shinyroll'){
        if(user.username.toLowerCase() == 'atreelessplain' && !savCanGamble){
            client.say(channel, "Look, Savvy...");
            setTimeout(() => { 
                client.say(channel, "You and I both know you're addicted to the !shinyroll command, @atreelessplain. I'm cutting you off. ✋ Better luck next time, kiddo."); 
                }, 1000);

        } else if (user.username.toLowerCase() == 'atreelessplain' && savCanGamble) {
            dailyRollCheck(user.username);

        } else {
            dailyRollCheck(user.username);
        };
    }

    if(command == '!letsavroll' && (user.mod || user.username == 'miggtorr')){
        if(!savCanGamble){
            client.say(channel, "...*sigh*...");
            setTimeout(() => { 
                client.say(channel, "Alright, @atreelessplain. The mods say I have to let you use !shinyroll. Roll at your own risk, kiddo.");     
            }, 1000);
            savCanGamble = true;
        } else if (savCanGamble){
            client.say(channel, "Mkay, Savvy...");
            setTimeout(() => { 
                client.say(channel, "The mods say I can't let you continue to throw your life away with the !shinyroll command. I'm cutting you off! Sorry, kiddo.");     
            }, 1000);
        }
    }

    if(command == "ncie" && user.mod){
        client.say(channel, 'ncie');
    }

    if(command == "!quizcommands"){
        client.say(channel, `Quiz Commands: !quiz; !myscore; !myrank; !leaderboard; !quizquit (mod only); !rescore (mod only)`);
    }
    
    if(command == "!myscore"){
        let name = user.username;
        // console.log(name)
        if (args != ''){
            name = args.toString();
        };

        if (name.startsWith('@')){
            name = name.slice(1);
        };
        
        QuizGameMyScore(name);
        
    }

    if(command == "!myrank"){
        let name = user.username;
        // console.log(name)
        if (args != ''){
            name = args.toString();
        };

        if (name.startsWith('@')){
            name = name.slice(1);
        };

        QuizGameMyRank(name);
    }

    if(command == "!leaderboard"){
        QuizGameLeaderboard();
    }

    if(command == "!rescore" && (user.mod || user.username == 'miggtorr')){
        QuizReadHighScores('quizScores.json');
        client.say(channel, `Quiz scores updated.`);
    }
    

    if(command == '!quiz'){
        let name = user.username;
        // console.log(name)
        if (args != ''){
            // name = args.toString();
        };

        if (name.startsWith('@')){
            name = name.slice(1);
        };

        if(currentQuizState == QuizState.Idle){
            quizPlayer = name;
            QuizGameInit();
            console.log('quizPlayer is now ' + quizPlayer);
        } else if (currentQuizState == QuizState.Playing){
            client.say(channel, `Sorry, @${name}, I can only run one Quiz at a time! 😌`);
        }
        
    }

    if(command == '!quizquit' && (user.mod || user.username == 'miggtorr')){
        QuizGameQuit();
    }

    if(command == "!tweet" && user.mod){
        client.say(channel, `@${channel.substring(1,channel.length)}, did you remember to tweet out that you're live? 😉`)
    }

    if(command == "!reroll" && (user.mod || user.username == 'miggtorr')) {
        var name = args.toString();
        
        if (name.startsWith('@')){
            name = name.slice(1);
        };

        if (rolledUsers.includes(name))
        {
            rolledUsers.splice(rolledUsers.indexOf(name), 1);
            client.say(channel, `@${name} may roll again!`);
        }
        else {
            client.say(channel, `@${name} has not rolled yet.`);
        }
    }

    /* if(command == '!height'){
        if(user.username == 'not_a_price_tag'){
            client.say(channel, '...Did you hear something...?');
        } else {
            randHeight();
        }
    } */

    if(message.toLowerCase().endsWith('ussy') && (user.username == 'monipandas' || user.username == 'atreelessplain')){
        if (message.length > 4){
            var root = message.substring(0, message.length - 4);
            console.log(root);
            client.say(channel, `${root.toLowerCase().replace(/^./, root[0].toUpperCase())}enis.`);
        }
    };

    if(command == '!guess' && currentWTPState == WTPState.open){
        whosThatPokemonRegisterGuess(user.username,  args.join(' ').toString().toLowerCase());
    }

    if(command == '!wtpscore'){
        whoseThatPokemonMyScore(user.username);
    }

    if(command == '!wtpleaderboard'){
        whosThatPokemonLeaderboard();
    }

    if(command == '!wtp' && (user.mod || user.username == 'miggtorr')){
        whosThatPokemonGameControl();
    }

    if(command == '!wtptime'  && (user.mod || user.username == 'miggtorr')){
        //set time limit
    }
    

});


function ShinyRoll(chatuser) {
    var roll = (Math.floor(Math.random() * 8194));
    var sayString = '';
    
    if(chatuser == 'sunflorabot')
    {
        client.say(channel, `OMFG! I rolled an 8192!!! Full odds? Of course!! would I lie on the internet!? It's not like I would ever CHANGE my own shiny odds or anything... hehehe. 🤭`)
    } else {
        shinyRollCounter++;
        switch (roll) {
            case 8192 :
                sayString = `NO WAY, @${chatuser}! You rolled a 8192 on roll ${shinyRollCounter}! That's a shiny! Congrats! You get VIP on the channel!`;
                break;
            case 8193 :
                sayString = `OH MYLANTA, @${chatuser}! You rolled a 8193 on roll ${shinyRollCounter}!? THATS AN OVERODDS SHINY! This is so epic!`;
                break;
            case 4096 :
                sayString = `NO WAY, @${chatuser}! You rolled a 4096 on roll ${shinyRollCounter}! That's a shiny from Gen VI onward! You get to nickname one of Taylor's full-odds shinies!`;
                break;
            case 666 :
                sayString = `@${chatuser} rolled a ${roll}. YIKES! That's a scary number. Alas! No shiny this time, this is so sad. There have been ${shinyRollCounter} shiny rolls.`;
                break;
            case 69 :
                sayString = `@${chatuser} rolled a ${roll}. Nice. 😏 No shiny this time, this is so sad. There have been ${shinyRollCounter} shiny rolls.`;
                break;
            case 420 :
                sayString = `@${chatuser} rolled a ${roll}. That's a funny number, lol. No shiny this time, tho. This is so sad. There have been ${shinyRollCounter} shiny rolls.`;
                break;
            case 1337 :
                sayString = `@${chatuser} rolled a ${roll}. You are a 1337 h4x0r, gamer. No shiny this time, tho, this is so sad. There have been ${shinyRollCounter} shiny rolls.`
                break;
            case 0 :
                sayString = `@${chatuser} rolled a ${roll}. LMAO YOU ROLLED A 0!? Incredible. No shiny this time, tho this is so sad. There have been ${shinyRollCounter} shiny rolls.`
            default :
            sayString = `@${chatuser} rolled a ${roll}. No shiny this time, this is so sad. There have been ${shinyRollCounter} shiny rolls.`
        };
        
        client.say(channel, `${sayString}`); 
    }

    

};

function dailyRollCheck(name){
    if(rolledUsers.includes(name)){
        client.say(channel, `Sorry, @${name}, only one shiny roll per stream! 😘`);
    } else {
        rolledUsers.push(name);
        ShinyRoll(name);
    }
}

function readRollerFile(){
    const fs = require('fs');

    var data = fs.readFile('rolledUsers.txt', 'utf8', (error, data) => {
        if(error){
           console.log(error);
           return;
        }
        var parsedData = JSON.parse(data);
        rolledUsers = Array.from(parsedData);
        // console.log('Rolled Users: ' + rolledUsers);
        
   })  
   
}

function readRollCounter(){
    const fs = require('fs');

    var data = fs.readFile('shinyRollCounter.txt', 'utf8', (error, data) => {
        if(error){
           console.log(error);
           return;
        }
        
        shinyRollCounter = data;
        console.log("Shiny Rolls: " + shinyRollCounter);
        
   })  
   
}

function writeRollerFile(){
    require('fs').writeFile('rolledUsers.txt',

    JSON.stringify(rolledUsers),

    function (err) {
        if (err) {
            console.error('Crap happens');
        }
        console.log('Rolled users saved.')
    }
);
    require('fs').writeFile('shinyRollCounter.txt',

        shinyRollCounter.toString(),

        function (err) {
            if (err) {
                console.error('Crap happens');
            }
            console.log('Shiny roll counter saved.')
        }
    );
}

function funFactInterval(){
    if(facts == []){
        return;
    } else {
        funFact([]);
    };
};

async function readFacts(filename) {
    try {
      const contents = await fsPromises.readFile(filename, 'utf-8');
      facts = Array.from(JSON.parse(contents).facts);
      console.log(`Fun facts read!`);
    //   console.log(facts);
    //   console.log(Array.from(quizQsObj.questions).length);
    
    } catch (err) {
      console.log(err);
    }
  };

var factnum = 0
function funFact(tag) {
    console.log(tag);
    tag = tag[0];
    var factindex = Math.floor(Math.random() * facts.length);

    if(tag){  
        var taggedfacts = []
        for(i=0;i < facts.length ;i++){
            if(facts[i].tags.includes(tag.toLowerCase())){
                taggedfacts.push(facts[i].fact);
            }
        }
        if(taggedfacts.length == 0){
            client.say(channel, `Sorry, I don't know any fun facts related to ${tag}. 😔`);
        } else if (taggedfacts.length == 1){
            var fact = JSON.stringify(taggedfacts[0]);
            fact = fact.substring(1,fact.length -1); //remove double quotes
            client.say(channel, `🌻 Fun Fact 🌻 ${fact}`);
        } else if (taggedfacts.length > 1){
            factindex = Math.floor(Math.random() * taggedfacts.length);
            var fact = JSON.stringify(taggedfacts[factindex]);
            fact = fact.substring(1,fact.length -1); //remove double quotes
            client.say(channel, `🌻 Fun Fact 🌻 ${fact}`);
        }
    }else{
        while(factindex == factnum){
            factindex = Math.floor(Math.random() * facts.length);
        };  
        factnum = factindex;
        var fact = JSON.stringify(facts[factindex].fact);
        fact = fact.substring(1,fact.length -1); //remove double quotes
        client.say(channel, `🌻 Fun Fact 🌻 ${fact}`);
    }
}



// function convertFactsToJSON(){
//     // factsJSON = {...facts};
//     var tempfacts = []
//     const mapFunc = facts.map((fact) => {
//         fact = {"tags":[],"fact":fact};
//         tempfacts.push(fact);
//     });
//     tempfacts = {tempfacts}
//     factsJSON.facts = Object.values(tempfacts)[0];
//     console.log(JSON.stringify(factsJSON));
// }


//Quiz Game Functions

async function readQuestions(filename) {
    try {
      const contents = await fsPromises.readFile(filename, 'utf-8');
      quizQsArr = Array.from(JSON.parse(contents).questions);
      console.log(`Quiz questions read!`);
    //   console.log(Array.from(quizQsObj.questions).length);
    
    } catch (err) {
      console.log(err);
    }
};


function QuizGameInit(){
    currentQuizState = QuizState.Playing;
    console.log(quizPlayer);
    client.say(channel, `Hi, @${quizPlayer}! Welcome to the SunfloraBot Quiz! 🌻 You will get ${numOfQs} questions. Answer them all correctly to compete for the top! Are you ready? (Type 'Yes' or 'No')`);
    client.on('message', QuizGameListenMainMenu);
}

function QuizGameQuit(){
    client.say(channel, `Thanks for playing, @${quizPlayer}!!! 🌻 Use '!myscore' to check your total quiz points!`);
    QuizGameCompileScores();
    currentQuizState = QuizState.Idle;
}

async function QuizGameStart(numOfQs){
    let gameQuestions = [];
    let score = 0;
    populateQIndexes(numOfQs);

    for (let i = 0; i < gameQuestions.length; i++){
        let array = [0,1,2,3];
        console.log(array);
        array = shuffleArray(array);
        console.log(array);

        client.say(channel, `@${quizPlayer} ${quizQsArr[gameQuestions[i]].question} (type A, B, C, D, or Quit)`)
        await new Promise(r => setTimeout(r, 1100));
        client.say(channel, `Ⓐ: ${quizQsArr[gameQuestions[i]].choices[array[0]]} Ⓑ: ${quizQsArr[gameQuestions[i]].choices[array[1]]} Ⓒ: ${quizQsArr[gameQuestions[i]].choices[array[2]]} Ⓓ: ${quizQsArr[gameQuestions[i]].choices[array[3]]}`);
        try {
            let response = await QuizGameGetAnswer2(quizPlayer);
            // console.log(response);
            if(response == array.indexOf(0)){
                client.say(channel, `@${quizPlayer} ✨ Correct! ✨`);
                score++;
            } else {
                client.say(channel, `Oof! Sorry, @${quizPlayer}. 🫤 That was incorrect.`);
            };
            await new Promise(r => setTimeout(r, 1100));
            
        } catch(err){
            console.log(err);
            i = gameQuestions.length;
        } 
    };

    client.say(channel, `@${quizPlayer}, you got ${score} out of ${numOfQs} correct!`);
    await new Promise(r => setTimeout(r, 1100));
    playerScore = score;
    QuizGameQuit();

    function populateQIndexes(numOfQs){
        // console.log(quizQsArr);
        for (let i = 0; i < numOfQs; i++) {
            let j = 0;
            let n = Math.floor(Math.random() * quizQsArr.length);
            while(gameQuestions.includes(n) && j < 1000){
                n = Math.floor(Math.random() * quizQsArr.length);
                j++;
            };
            gameQuestions.push(n);
          };
          console.log(gameQuestions);
    }

    function shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }
}

// async function QuizGameAsk(index){
//     client.say(channel, `@${quizPlayer} ${quizQsArr[index].question}`)
//     try {
//         let response = await QuizGameGetAnswer2(quizPlayer);
//         console.log(response);
//         if(response == '0'){
//             client.say(channel, `Correct @${quizPlayer}!`);
//         } else {
//             client.say(channel, `Sorry, @${quizPlayer}. 🫤 That was incorrect.`);
//         };
        
//     } catch(err){
//         console.log(err);
//     } 
// };

// async function QuizGameAsk2(index){
//     client.say(channel, `@${quizPlayer} ${quizQsArr[index].question}`);
//     client.on('message', QuizGameListenHearAnswer);


    // try {
    //     let response = await QuizGameGetAnswer2(quizPlayer)
    //     console.log(response);
    //     if(response == '0'){
    //         client.say(channel, `Correct @${quizPlayer}!`);
    //     } else {
    //         client.say(channel, `Sorry, @${quizPlayer}. 🫤 That was incorrect.`);
    //     };
        
    // } catch(err){
    //     console.log(err);
    // } 
// };

const QuizGameGetAnswer2 = () => {
    return new Promise((resolve, reject) => {
        let ans = 5;
        client.on('message', QuizGameListenGetAnswer);
        function QuizGameListenGetAnswer(channel, user, message, self) {
            // if(self)return;
            if(user.username.toLowerCase() == quizPlayer.toLowerCase()){
                let msg = message.toLowerCase(); 
                switch(msg){
                    case 'a' :
                        resolve(0);
                        client.removeListener('message', QuizGameListenGetAnswer);
                        break;
                    case 'b':
                        resolve(1);
                        client.removeListener('message', QuizGameListenGetAnswer);
                        break;
                    case 'c':
                        resolve(2);
                        client.removeListener('message', QuizGameListenGetAnswer);
                        break;
                    case 'd':
                        resolve(3);
                        client.removeListener('message', QuizGameListenGetAnswer);
                        break;
                    case 'quit':
                        reject();
                        client.removeListener('message', QuizGameListenGetAnswer);
                        break;
                    default:
                        // client.say(channel,`@${quizPlayer} Sorry, I couldn't understand. Please answer A, B, C, or D! Or say Quit.`);
                        break;
                }
            }
            
            if(user.mod && message.toLowerCase().startsWith('!quit')){
                reject();
                client.removeListener('message', QuizGameListenGetAnswer);
            }
        }
    })
}

//Quiz Game Scoring

async function QuizReadHighScores(filename) {
    try {
        const contents = await fsPromises.readFile(filename, 'utf-8');
      
        quizHighScores = JSON.parse(contents);
        // for (const [key, value] of Object.entries(JSON.parse(contents))) { 
        // quizHighScores.push(`${key}:${value}`); 
        // };

        // console.log(`${JSON.stringify(quizHighScores)} Quiz scores read!`);
        console.log(`Quiz scores read!`);
    //   console.log(Array.from(quizQsObj.questions).length);
    
    } catch (err) {
        console.log(err);
    }
  };

function QuizGameCompileScores(){
    if(!quizHighScores[quizPlayer]){
        temp = {[quizPlayer]:0};
        quizHighScores = {...quizHighScores, ...temp};
    };
    record = quizHighScores[quizPlayer];
    // console.log("old record " + record)
    record = record + playerScore;
    // console.log("new record" + record);
    temp = {[quizPlayer]:record};
    quizHighScores = {...quizHighScores, ...temp};
    temp = [];
    // temp = Array.from(quizHighScores);
    for(var i in quizHighScores)
    temp.push([i, quizHighScores [i]]);
    // console.log(JSON.stringify(quizHighScores));
    // console.log(temp);
    temp = QuizGameScoresSort(temp)
    console.log("Sorted Scores");
    console.log(temp);
    temp = Object.fromEntries(temp);
    quizHighScores = temp;
    QuizGameWriteScores();
}

function QuizGameScoresSort(data){
    temp = data.sort((a,b) => b[1]-a[1]);
    return temp;
}

function QuizGameWriteScores(){

    require('fs').writeFile('quizScores.json',

    JSON.stringify(quizHighScores),

    function (err) {
        if (err) {
            console.error('Crap happens');
        }
        console.log('Quiz scored saved.')
    }
);
}

function QuizGameMyScore(player){
    if(quizHighScores[player]){
        myScore =  quizHighScores[player];
        client.say(channel, `@${player}'s lifetime quiz points: ${myScore}.`);
    } else {
        client.say(channel, `@${player}'s lifetime quiz points: 0.`);
    };
}

function QuizGameMyRank(player){
    if(quizHighScores[player]){
        myScore =  quizHighScores[player];
        temp = [];
        for(var i in quizHighScores)
        temp.push([i, quizHighScores [i]]);
        rank = temp.findIndex(element=> element[0] == player) + 1;
        client.say(channel, `@${player} is ranked ${rank} at the Quiz Game with ${myScore} Quiz Points!`);
    } else {
        client.say(channel, `@${player} is unranked at 0 points.`);
    };
}

function QuizGameLeaderboard(){
    let temp = Object.keys(quizHighScores).length;

    max = 3;
    if(temp < max){
        max = temp;
    }

    leaders = [];
    for(i=0;(i < max);i++){

        leaders.push(Object.entries(quizHighScores)[i]);
    }
    // console.log(leaders);
    switch(max){
        case 0: 
            client.say(channel, `Quiz Game Leaderboard: No High Score.`);
            break;
        case 1:
            client.say(channel, `Quiz Game Leaderboard: 🥇: ${leaders[0][0]}: ${leaders[0][1]}pts`);
            break;
        case 2:
            client.say(channel, `Quiz Game Leaderboard: 🥇: ${leaders[0][0]}: ${leaders[0][1]}pts; 🥈: ${leaders[1][0]}: ${leaders[1][1]}pts`);
            break;
        default:
            client.say(channel, `Quiz Game Leaderboard: 🥇: ${leaders[0][0]}: ${leaders[0][1]}pts; 🥈: ${leaders[1][0]}: ${leaders[1][1]}pts; 🥉: ${leaders[2][0]}: ${leaders[2][1]}pts`);
            break;
    }
}

// async function QuizGameGetAnswer(player){
//     let ans = 5;
//     // setTimeout(() => {
//     //     ans = 0;
//     //     return ans;
//     // }, 1000);
//     client.on('message', async (channel, user, message, self) => {
//         // if(self)return;
//         if(user.username == player){
//             let msg = message.toLowerCase(); 
//             switch(msg){
//                 case 'a' :
//                     ans = 0;
//                     break;
//                 case 'b':
//                     ans = 1;
//                     break;
//                 case 'c':
//                     ans = 2;
//                     break;
//                 case 'd':
//                     ans = 3;
//                     break;
//                 default:
//                     client.say(channel,`@${player} Sorry, I couldn't understand. Please answer A, B, C, or D!`);
//                     break;
//             }
//             return ans;
//         }
//     }); 
// }

//Quiz Game Listeners

function QuizGameListenMainMenu(channel, user, message, self){
    if(self)return;
    if(user.username.toLowerCase() == quizPlayer.toLowerCase()){
        // let msg = message.substring(0,3);      
        console.log(user.username + " responding as " + quizPlayer);
        if(message.toLowerCase().startsWith('yes')){
            console.log("heard a YES");
            QuizGameStart(numOfQs);
            client.removeListener('message', QuizGameListenMainMenu);
        } else if (message.toLowerCase().startsWith('no')) {
            QuizGameQuit();
            client.removeListener('message', QuizGameListenMainMenu);
        } else {
            client.say(channel,
                `Please answer Yes or No!`
            )
        }
    }
    if(user.mod && message.toLowerCase().startsWith('!quit')){
        QuizGameQuit();
        client.removeListener('message', QuizGameListenMainMenu);
    }
}

//Who's that Pokemon Game



async function readPokemonList() {
    try {
      const contents = await fsPromises.readFile('pokemonnames.txt', 'utf-8');
  
      mon = contents.split(/\r?\n/);
  
      console.log(mon.length); // 👉️ ['One', 'Two', 'Three', 'Four']
  
    } catch (err) {
      console.log(err);
    }
};

async function readWTPQuestions() {
    try {
      const contents = await fsPromises.readFile('whosthatpokemon.json', 'utf-8');
      WTPQuestions = Array.from(JSON.parse(contents).questions);
    //   console.log(WTPQuestions);
    //   console.log(Array.from(quizQsObj.questions).length);
    
    } catch (err) {
      console.log(err);
    }
};

async function whosThatPokemonReadScores() {
    try {
        const contents = await fsPromises.readFile('WTPScores.json', 'utf-8');
      
        WTPScores = JSON.parse(contents);
        // for (const [key, value] of Object.entries(JSON.parse(contents))) { 
        // quizHighScores.push(`${key}:${value}`); 
        // };

        // console.log(`${JSON.stringify(quizHighScores)} Quiz scores read!`);
        console.log(`WTP scores read!`);
    //   console.log(Array.from(quizQsObj.questions).length);
    
    } catch (err) {
        console.log(err);
    }
  };

function whosThatPokemonGameControl(){
    currentWTPState = WTPState.open;
    WTPGuesses = {};
    whosThatPokemonGiveClues();
    setTimeout(whosThatPokemonCloseGuessesReveal, WTPTimeLimit);
}

function whosThatPokemonCloseGuessesReveal(){
    currentWTPState = WTPState.closed;
    client.say(channel, `Guesses are now closed!`);
    whosThatPokemonCompileGuesses();
    setTimeout(() => {
        if(WTPWinningPlayers == ''){
            client.say(channel, `The answer was ${WTPAnswer}! OOF! No one got it right! 😔 Better luck next time!`)
        } else {
            client.say(channel, `The answer was ${WTPAnswer}! Congrats to the winners: ${WTPWinningPlayers}! Check your score with '!wtpscore'.`);
            for(i=0;i<WTPWinningPlayersArr.length;i++){
                whosThatPokemonCompileScores(WTPWinningPlayersArr[i][0]);
            };
            whosThatPokemonWriteScores();
        }
        

      }, 2000);
}

function whosThatPokemonGiveClues(){

    var EasyToReadTimeLimit = WTPTimeLimit/60000.0

    var wtpindex = Math.floor(Math.random() * WTPQuestions.length);
    var selectedClue = JSON.stringify(WTPQuestions[wtpindex].clue);
    selectedClue = selectedClue.substring(1, selectedClue.length - 1);
    WTPAnswer = JSON.stringify(WTPQuestions[wtpindex].answer);
    WTPAnswer = WTPAnswer.substring(1, WTPAnswer.length -1);
    client.say(channel, `🌻 WHO'S THAT POKÉMON!? Guess a pokémon using !guess [pokemon] 🌻 ${selectedClue} 🌻 ${EasyToReadTimeLimit} minutes to answer!`);
    console.log(WTPAnswer);
}

function whosThatPokemonRegisterGuess(player, pokemon){
    // console.log(mon);

    if(player in WTPGuesses){
        client.say(channel, `Sorry, @${player}, only one guess per player per game! 😉`)
    } else {
        if (mon.includes(pokemon)) {
            const guess = pokemon.split(" ");
            for (var i = 0; i < guess.length; i++) {
                guess[i] = guess[i].charAt(0).toUpperCase() + guess[i].slice(1);
            };
            const formattedGuess = guess.join(" ");
            console.log(formattedGuess);
            temp = {[player]:formattedGuess};
            WTPGuesses = {...WTPGuesses,...temp};
            console.log(WTPGuesses);
    
            client.say(channel, `${player} guessed ${formattedGuess}!`)
            // console.log(`${player} guessed ${pokemon}!`);
    
        } else {
            console.log(pokemon);
    
            client.say(channel, `Sorry, @${player}, I can't understand your guess. Please make sure you're spelling the Pokémon's name correctly. Alphanumeric characters, spaces, and hyphens only; no accents (e.g., 'ho-oh', 'flabebe', 'mrmime', 'nidoranf', 'roaring moon').`)
        }
    }  
}

//NEED TO ADD WHAT TO DO IF THERE ARE NO GUESSES and NO CORRECT GUESSES
function whosThatPokemonCompileGuesses(){
    WTPWinningPlayers = '';
    if(Object.keys(WTPGuesses).length > 0){
        WTPWinningPlayersArr = Object.entries(WTPGuesses).filter((value) => value[1] == WTPAnswer);
        console.log(`winningPlayersArr: ${WTPWinningPlayersArr}`);
        temp = [];
        for (i=0;i<WTPWinningPlayersArr.length;i++){
            temp.push(WTPWinningPlayersArr[i][0]);
        }
        WTPWinningPlayers = temp.toString()
        console.log(`winningPlayers: ${WTPWinningPlayers}`);
    } else {
        WTPWinningPlayersArr = [];
        console.log(`There have been no guesses!`);
    }
};


function whosThatPokemonCompileScores(player){
    if(!WTPScores[player]){
        temp = {[player]:0};
        WTPScores = {...WTPScores, ...temp};
    };
    record = WTPScores[player];
    // console.log("old record " + record)
    record = record + 1;
    // console.log("new record" + record);
    temp = {[player]:record};
    WTPScores = {...WTPScores, ...temp};
    temp = [];
    // temp = Array.from(quizHighScores);
    for(var i in WTPScores)
    temp.push([i, WTPScores [i]]);
    // console.log(JSON.stringify(quizHighScores));
    // console.log(temp);
    temp = QuizGameScoresSort(temp)
    console.log("Sorted Scores");
    console.log(temp);
    temp = Object.fromEntries(temp);
    WTPScores = temp;
    
}

function whosThatPokemonWriteScores(){

    require('fs').writeFile('WTPScores.json',

    JSON.stringify(WTPScores),

    function (err) {
        if (err) {
            console.error('Crap happens');
        }
        console.log('WTP scored saved.')
    }
);
}

function whoseThatPokemonMyScore(player){
    if(WTPScores[player]){
        myScore =  WTPScores[player];
        client.say(channel, `@${player}'s lifetime Who's That Pokémon points: ${myScore}.`);
    } else {
        client.say(channel, `@${player}'s lifetime Who's That Pokémon points: 0.`);
    };
}

function whosThatPokemonLeaderboard(){
    let temp = Object.keys(WTPScores).length;

    max = 3;
    if(temp < max){
        max = temp;
    }

    leaders = [];
    for(i=0;(i < max);i++){

        leaders.push(Object.entries(WTPScores)[i]);
    }
    // console.log(leaders);
    switch(max){
        case 0: 
            client.say(channel, `WTP Leaderboard: No High Score.`);
            break;
        case 1:
            client.say(channel, `WTP Game Leaderboard: 🥇: ${leaders[0][0]}: ${leaders[0][1]}pts`);
            break;
        case 2:
            client.say(channel, `WTP Game Leaderboard: 🥇: ${leaders[0][0]}: ${leaders[0][1]}pts; 🥈: ${leaders[1][0]}: ${leaders[1][1]}pts`);
            break;
        default:
            client.say(channel, `WTP Game Leaderboard: 🥇: ${leaders[0][0]}: ${leaders[0][1]}pts; 🥈: ${leaders[1][0]}: ${leaders[1][1]}pts; 🥉: ${leaders[2][0]}: ${leaders[2][1]}pts`);
            break;
    }
}

function randHeight(){

};