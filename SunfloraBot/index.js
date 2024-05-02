//version 0.6
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require('dotenv').config();
// const { availableParallelism, tmpdir } = require('os');
// var tiny = require('tiny-json-http');
const tmi = require('tmi.js'),
    { channel, username, password } = require('./settings.json');
const { say, timeout } = require('tmi.js/lib/commands');
const {promises: fsPromises} = require('fs');
const { resolve } = require('path');
const { removeAllListeners } = require('process');
const readline = require('readline');
import Pokedex from 'pokedex-promise-v2';
// const { Pokedex } = require('pokedex-promise-v2');
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
const rollchannel = "talesoftaylor";
const dex = new Pokedex();

//Dex vars
var pokeapiObj = {};
var pokeMonObj = {};
var pokeSpeciesObj = {};

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

//Orre Names Global Vars
var allOrreNamesObj = {};
var assignedOrreNamesObj = {};

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
var numBones = 0;

//Initialization
QuizReadHighScores('quizScores.json');
readRollerFile();
readRollCounter();
readFacts('funfacts.json');
readQuestions('quizgame.json');
readPokemonList();
readWTPQuestions();
whosThatPokemonReadScores();
readOrreNames();
readBones();
// initializePokedex();

let rl = readline.createInterface(process.stdin, process.stdout);

client.on('connected', () => {
    console.log('Connected.');
    // client.say(channel, `PowerUpL 🌻 PowerUpR`);
    
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
    const channelname = channel.substring(1);

    if(self && command == '!shinyroll'){
        ShinyRoll(sunflorabot);
    }

    if(self) return;
    if(user.username.toLowerCase() == 'nightbot') return;

    
    // console.log(command);

    if(command == '!test' && (user.mod || user.username == channelname || user.username == `miggtorr`)){
        client.say(channel, `${channelname} Success!`)
    }
    if(command == '!test2' && (user.mod || user.username == channelname || user.username == `miggtorr`)){
        
    }
    
    if(command == '!disconnect' && (user.mod || user.username == channelname || user.username == `miggtorr`)){
        client.say(channel, `🌻 💤`);
        disconnectFunction();
    }

    if (command == `!realheight`){
        getHeight(0);
    }

    if (command == `!fakeheight`){
        getHeight(1);
    }

    if (command == `!discord`){
        client.say(channel, `🌟 Discord 🌟 https://discord.gg/c4GmFmg`);
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

    if(command == '!nap' && (user.mod || user.username == channelname || user.username == `miggtorr`)){
        client.say(channel, 'Shutting down for 30 minutes.');
    }

    if(command == '!save' && (user.mod || user.username == channelname || user.username == `miggtorr`)){
        // client.say(channel, 'Shutting down for 30 minutes.');
        writeAllDataToFile();
    }

    if((command == '!newrolls' || command == '!refreshrolls' || command == '!resetrolls') && (user.mod || user.username == channelname || user.username == `miggtorr`)){
        rolledUsers = [];
        writeRollerFile();
        client.say(channel, "New shiny rolls available for everyone!");
    }

    if((command == '!resetcounter') && (user.mod || user.username == channelname || user.username == `miggtorr`)){
        shinyRollCounter = 0;
        rolledUsers = [];
        writeRollerFile();
        client.say(channel, "Shiny roll counter reset! New shiny rolls available for everyone!");
    }

    if(command == '!!gn' && (user.mod || user.username == channelname || user.username == `miggtorr`)){
        client.say(channel, `Goodnight! @${user.username} Goodnight @${channelname} 🥰`);
    }

    if(command == '!hbd' && (user.mod || user.username == channelname || user.username == `miggtorr`)){
        let name = user.username;
        // console.log(name)
        if (args != ''){
            name = args.toString();
        };

        if (name.startsWith('@')){
            name = name.slice(1);
        };

        client.say(channel, `🎶 Happy Birthday to you! 🎶 Happy Birthday to you! 🎶 Happy Birthday, Dear ${name}! 🎶 Happy Birthday to you! 🎶 ❤️`);
    }

    if(command == '!shinyroll'){
        if(user.username.toLowerCase() == 'atreelessplain' && !savCanGamble){
            client.say(channel, "Look, Savvy...");
            setTimeout(() => { 
                client.say(channel, "You and I both know you're addicted to the !shinyroll command, @atreelessplain. I'm cutting you off. ✋ Better luck next time, kiddo."); 
                }, 1000);

        } else if (user.username.toLowerCase() == 'atreelessplain' && savCanGamble) {
            dailyRollCheck(user.username);

        // } else if (user.username.toLowerCase() == 'miggtorr') {
        //     client.say(channel, "@miggtorr is not allowed to shinyroll bc he told Taylor to keep hunting for HOPPIP IN GEN 4!!!")
        } else {
            dailyRollCheck(user.username);
        };
    }

    if(command == '!letsavroll' && (user.mod || user.username == channelname || user.username == `miggtorr`)){
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

    if(command == "ncie"  && (user.mod || user.username == channelname || user.username == `miggtorr`)){
        client.say(channel, 'ncie');
    }

    if(command == "!realfollowage" || command == "!myfollowage" || command == "!followage"){
        FollowAge(user.username);
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

    if(command == "!rescore" && (user.mod || user.username == channelname || user.username == `miggtorr`)){
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

    if(command == '!quizquit' && (user.mod || user.username == channelname || user.username == `miggtorr`)){
        QuizGameQuit();
    }

    if(command == "!tweet" && user.mod){
        client.say(channel, `@${channel.substring(1,channel.length)}, did you remember to tweet out that you're live? 😉`)
    }

    if(command == "!reroll" && (user.mod || user.username == channelname || user.username == `miggtorr`)) {
        var name = args.toString().toLowerCase();
        
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
    
    if(command == "!shephard" && (user.mod || user.username == channelname || user.username == `miggtorr` || user.username == `shephard922_`)){
        client.say(channel, `do you have to cheat at pokem on 99 masterballs not possible without cheating and you did on emulator that explains a lot igood news is you can only cheat for content cant use the cheated pokemon in the real games thank god for that`)
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

    if(command == '!wtp' && (user.mod || user.username == channelname || user.username == `miggtorr`)){
        whosThatPokemonGameControl();
    }

    if(command == '!wtptime' && (user.mod || user.username == channelname || user.username == `miggtorr`)){
        //set time limit
    }
    
    if(command == "!orre"){
        let name = user.username;
        // console.log(name)
        if (args != '' && (user.mod || user.username == channelname || user.username == `miggtorr`)){
            name = args.toString();
        }

        if(name.startsWith('@')){
            name = name.slice(1);
        }
        orreNameMain(name);
    }

    if(command == "!orrenew" && (user.mod || user.username == channelname || user.username == `miggtorr`)){
        let name = user.username;
        // console.log(name)
        if (args != ''){
            name = args.toString();
        };

        if (name.startsWith('@')){
            name = name.slice(1);
        };
        renewOrreName(name);
    }

    if(command == "!orreremove" && (user.mod || user.username == channelname || user.username == `miggtorr`)){
        let name = user.username;
        // console.log(name)
        if (args != ''){
            name = args.toString();
        };

        if (name.startsWith('@')){
            name = name.slice(1);
        };

        removeOrreName(name);
        client.say(channel,`${name} no longer has an Orre name.`)
    }

    // if(giveBoneArray.includes(command)){
    //     giveBone(user.username);
    // }

    // if(takeBoneArray.includes(command)){
    //     takeBone(user.username);
    // }

    if(sayBoneArray.includes(command)){
        sayBoneCount();
    }

    // if(command == `!shufflebones`){
    //     shuffleBones();
    // }

    if(command == `!resetbones` && (user.mod || user.username == channelname || user.username == `miggtorr`)){
        resetBones();
    }

    if (command == `!bday`){
        checkTaylorsBirthday();
    }

    if(command == `!natureguess` && (user.mod || user.username == channelname || user.username == `miggtorr`)){
        natureGuess();
    }

    if(command == `!energyguess` && (user.mod || user.username == channelname || user.username == `miggtorr`)){
        energyGuess();
    }

    if(command == `!randomnumber` && (user.mod || user.username == channelname || user.username == `miggtorr`)){

        // randomNumber("386");

        if(args == ''){
            client.say(channel, `Please specify a maximum value! 🌻`)
        }

        if(!isNaN(args) && args != ''){
            randomNumber(args);
        }
    }

    if(command == `!dex` && (user.mod || user.username == channelname || user.username == `miggtorr`)){
        switch(args[0].toLowerCase()){
            case "pokemon":
                pokePokemon(args);
                //Pokemon function (break into subfunctions later with extra args)
                break;
            case "move":
                pokeMove(args);
                break;
            case "ability":
                //ability function
                break;
            case "item":
                //Pokemon function
                break;
            case "type":
                pokeType(args);
                break;
            default: 
                client.say(channel, `Hmm... sorry, I didn't really understand. 🙏`);
                break;
        }
    }


    

});

function pokeAPICall(arg){
    dex.getPokemonByName(192, (response, error) => { // with callback
        if(!error) {
          console.log(response);
        } else {
          console.log(error)
        }
      });
  
}

function pokePokemon(args){

    console.log(args);
    pokeMonObj = {};
    pokeSpeciesObj = {};

    if(args.length < 2){
        client.say(channel, `Please specify a Pokemon!`);
        return;
    }

    const getMon = dex.getPokemonByName(args[1].toLowerCase())
    .then((response) => {
        pokeMonObj = response;
    })
    .catch((error) => {
        // client.say(channel,`Hmm... I couldn't find info on "${args[1]}". Sorry!`);
        console.log('Could not find Mon info: ', error);
        reject;
    });

    const getSpecies = dex.getPokemonSpeciesByName(args[1].toLowerCase())
    .then((response) => {
        pokeSpeciesObj = response;
    })
    .catch((error) => {
        // client.say(channel,`Hmm... I couldn't find info on "${args[1]}". Sorry!`);
        console.log('Could not find Species info: ', error);
        reject;
    });

    Promise.allSettled([getMon,getSpecies]).then((results) => {
        const resultsList = [];
        results.forEach((result) => resultsList.push(result.status));
        console.log(resultsList);
        if(resultsList[0] ==  "fulfilled" && resultsList[1] ==  "fulfilled"){
            //Both Mon & Species OK
            pokeapiObj = {...pokeMonObj, ...pokeSpeciesObj};
            if(args.length == 2)
            {
                pokeBasic(); 
            }
            if(args[2] == "varieties")
            {
                var listOfMons = [];
                for (let i = 0; i < pokeSpeciesObj.varieties.length; i++) {
                listOfMons.push(' ' + pokeSpeciesObj.varieties[i].pokemon.name);
                }
                client.say(channel, `Here are the differnet types of ${args[1]} I can tell you about: ${listOfMons}`);
            }
            if(args[2] == "dexentry"){
                client.say(channel, `/me 📇 ${pokeEngText()}`);
            }

        } else if (resultsList[0] ==  "rejected" && resultsList[1] ==  "fulfilled"){
            //Species but not Mon
            var listOfMons = [];
            for (let i = 0; i < pokeSpeciesObj.varieties.length; i++) {
                listOfMons.push(' ' + pokeSpeciesObj.varieties[i].pokemon.name);
            }
            client.say(channel, `Please be more specific! Which ${args[0]} would you like to know about? Options: ${listOfMons}?`);

        } else if(resultsList[0] ==  "fulfilled" && resultsList[1] ==  "rejected"){
            //Mon but not Species
            const monName = pokeMonObj.species.name;
            dex.getPokemonSpeciesByName(monName)
            .then((response) => {
                pokeSpeciesObj = response;
                pokeapiObj = {...pokeMonObj, ...pokeSpeciesObj};
                if(args.length == 2)
                {
                    pokeBasic(); 
                }
                if(args[2] == "varieties"){
                    var listOfMons = [];
                    for (let i = 0; i < pokeSpeciesObj.varieties.length; i++) {
                    listOfMons.push(' ' + pokeSpeciesObj.varieties[i].pokemon.name);
                    }
                client.say(channel, `Here are the differnet types of ${pokeSpeciesObj.name} I can tell you about: ${listOfMons}`);
                }
                if(args[2] == "dexentry"){
                client.say(channel, `/me 📇 ${pokeEngText()}`);
                }
            })
            .catch((error) => {
                client.say(channel,`Hmm... Something went wrong. :( Sorry!`);
                console.log('Could not find Species info: ', error);
            });


        } else if(resultsList[0] ==  "rejected" && resultsList[1] ==  "rejected"){
            //Neither mon nor species
            client.say(channel,`Hmm... I couldn't find info on "${args[1]}". Sorry!`);
        }

        console.log(pokeapiObj);
    }).catch((error) => {
        // client.say(channel,`Hmm... I couldn't find info on "${args[1]}". Sorry!`);
        console.log('There was an ERROR: ', error);
    });
    
}

function pokeBasic(){
    var name = JSON.stringify(pokeapiObj.name);
    name = name.substring(1,name.length -1);
    name = name.charAt(0).toUpperCase() + name.slice(1);
    const dexID = pokeapiObj.id;
    var type1 = '';
    var type2 = '';
    if (pokeapiObj.types.length == 1){
        type1 = JSON.stringify(pokeapiObj.types[0].type.name);
        type1 = type1.substring(1,type1.length -1);
        type1 = type1.charAt(0).toUpperCase() + type1.slice(1);
    } else {
        type1 = JSON.stringify(pokeapiObj.types[0].type.name);
        type1 = type1.substring(1,type1.length -1);
        type1 = type1.charAt(0).toUpperCase() + type1.slice(1);
        type2 = JSON.stringify(pokeapiObj.types[1].type.name);
        type2 = type2.substring(1,type2.length -1);
        type2 = " and " + type2.charAt(0).toUpperCase() + type2.slice(1);
    }
    const types = `${type1}${type2}`;
    const meters = (pokeapiObj.height / 0.1).toFixed(1);
    const kg = (pokeapiObj.weight * 0.1).toFixed(1);
    const hp = pokeapiObj.stats[0].base_stat;
    const atk = pokeapiObj.stats[1].base_stat;
    const def = pokeapiObj.stats[2].base_stat;
    const spatk = pokeapiObj.stats[3].base_stat;
    const spdef = pokeapiObj.stats[4].base_stat;
    const spd = pokeapiObj.stats[5].base_stat;
    const bst = hp + atk + def + spatk + spdef + spd;
    var eGroup1 = '';
    var eGroup2 = '';
    if (pokeapiObj.egg_groups.length == 1){
        eGroup1 = JSON.stringify(pokeapiObj.egg_groups[0].name);
        eGroup1 = eGroup1.substring(1,eGroup1.length -1);
        eGroup1 = eGroup1.charAt(0).toUpperCase() + eGroup1.slice(1);
    } else {
        eGroup1 = JSON.stringify(pokeapiObj.egg_groups[0].name);
        eGroup1 = eGroup1.substring(1,eGroup1.length -1);
        eGroup1 = eGroup1.charAt(0).toUpperCase() + eGroup1.slice(1);
        eGroup2 = JSON.stringify(pokeapiObj.egg_groups[1].name);
        eGroup2 = eGroup2.substring(1,eGroup2.length -1);
        eGroup2 = ", " + eGroup2.charAt(0).toUpperCase() + eGroup2.slice(1);
    }
    const catchrate = pokeapiObj.capture_rate;
    const eGroups = `${eGroup1}${eGroup2}`;
    // const flavor = pokeEngText();
    const category = pokeEngGenera();
    var abilities = [];
    for (let i = 0; i < pokeapiObj.abilities.length; i++) {
        var ability = ''
        if(pokeapiObj.abilities[i].is_hidden){
            ability = JSON.stringify(pokeapiObj.abilities[i].ability.name);
            ability = ability.substring(1,ability.length -1);
            ability = ability.charAt(0).toUpperCase() + ability.slice(1);
            ability = ` ${ability} (hidden)`;
        } else {
            ability = JSON.stringify(pokeapiObj.abilities[i].ability.name);
            ability = ability.substring(1,ability.length -1);
            ability = " " + ability.charAt(0).toUpperCase() + ability.slice(1);
        }
        abilities.push(ability);
    }

    // const abilities = ``;

    client.say(channel, `🐾 Pokemon: ${name}. 📇 National Dex Number: ${dexID}. 🔎 Category: The ${category}. 🌟 Type(s): ${types}. ✨ Abilities:${abilities}. 🐣 Egg Group(s): ${eGroups}. 🔒 Base Capture Rate: ${catchrate}. 📏 Height: ${meters}m. ⚖️ Weight: ${kg}kg. 🥊 Base Stat Total: ${bst}.` );
    // client.say(channel, `/me ${flavor}`);
    // console.log(JSON.stringify(pokeapiObj.types));
}

function pokeEngText(){
    for (let i = pokeapiObj.flavor_text_entries.length - 1; i >= 0; i--) {
        console.log(pokeapiObj.flavor_text_entries[i].language.name);
        if(pokeapiObj.flavor_text_entries[i].language.name == "en"){
            console.log('English entry found.');
            return JSON.stringify(pokeapiObj.flavor_text_entries[i].flavor_text).replace(/\\n/g,' ').replace(/\\f/g,' ');
        } 
    }
    console.log('English entry not found.');
    return JSON.stringify(pokeapiObj.flavor_text_entries[0].flavor_text).replace(/\\n/g,' ').replace(/\\f/g,' ');
}
function pokeEngGenera(){
    for (let i = pokeapiObj.genera.length - 1; i >= 0; i--) {
        console.log(pokeapiObj.genera[i].language.name);
        if(pokeapiObj.genera[i].language.name == "en"){
            console.log('English entry found.');
            var result = JSON.stringify(pokeapiObj.genera[i].genus);
            return result.substring(1,result.length -1);
        } 
    }
}

function pokeType(args){
    if(args[1]){
        dex.getTypeByName(args[1].toLowerCase())
        .then((response) => {
        pokeapiObj = response;
        if(args[2]){
            pokeTypeRelations(args[1], args[2].toLowerCase());
        } else {
            client.say(channel, `${args[1]} type options: stronginto, weakinto, weakto, resists, nodamage, immunefrom.`);
        }
        
        })
        .catch((error) => {
        client.say(channel, `Hmm... sorry, I didn't really understand. 🙏`);
        console.log('There was an ERROR: ', error);
        });
    } else {
        client.say(channel, `Please specify a type and one of the following options: stronginto, weakinto, weakto, resists, nodamage, immunefrom.`);
    }
}

function pokeTypeRelations(type, relation){
    var stronginto = [];
    var weakinto = [];
    var weakto = [];
    var resists = [];
    var nodamage = [];
    var immunefrom = [];
    for (let i = 0; i < pokeapiObj.damage_relations.double_damage_to.length; i++) {
        stronginto.push(' ' + pokeapiObj.damage_relations.double_damage_to[i].name);
    }
    for (let i = 0; i < pokeapiObj.damage_relations.half_damage_to.length; i++) {
        weakinto.push(' ' + pokeapiObj.damage_relations.half_damage_to[i].name);
    }
    for (let i = 0; i < pokeapiObj.damage_relations.double_damage_from.length; i++) {
        weakto.push(' ' + pokeapiObj.damage_relations.double_damage_from[i].name);
    }
    for (let i = 0; i < pokeapiObj.damage_relations.half_damage_from.length; i++) {
        resists.push(' ' + pokeapiObj.damage_relations.half_damage_from[i].name);
    }
    for (let i = 0; i < pokeapiObj.damage_relations.no_damage_to.length; i++) {
        nodamage.push(' ' + pokeapiObj.damage_relations.no_damage_to[i].name);
    }
    for (let i = 0; i < pokeapiObj.damage_relations.no_damage_from.length; i++) {
        immunefrom.push(' ' + pokeapiObj.damage_relations.no_damage_from[i].name);
    }
    switch (relation){
        case "stronginto":
            if(stronginto.length == 0){stronginto.push("none")};
            client.say(channel, `${type}-type moves are Super Effective against: ${stronginto}!`);
            break;
        case "weakinto":
            if(weakinto.length == 0){weakinto.push("none")};
            client.say(channel, `${type}-type moves are Not Very Effective against: ${weakinto}!`);
            break;
        case "weakto":
            if(weakto.length == 0){weakto.push("none")};
            client.say(channel, `${type}-type Pokemon are weak to: ${weakto}!`);
            break;
        case "resists":
            if(resists.length == 0){resists.push("none")};
            client.say(channel, `${type}-type Pokemon resist: ${resists}!`);
            break;
        case "nodamage":
            if(nodamage.length == 0){nodamage.push("none")};
            client.say(channel, `${type}-type moves do no damage into: ${nodamage}!`);
            break;
        case "immunefrom":
            if(immunefrom.length == 0){immunefrom.push("none")};
            client.say(channel, `${type}-type Pokemon are immune from: ${immunefrom}!`);
            break;
        default:
            client.say(channel, `Try again. ${type} type options: stronginto, weakinto, weakto, resists, nodamage, immunefrom.`);
            break;
    }
}

function pokeMove(args){
    if(args.length < 2){
        client.say(channel, `Please specify a move!`);
        return;
    };

    dex.getMoveByName(args[1].toLowerCase())
    .then((response) => {
        pokeapiObj = response;
        pokeMoveDescribe();
    })
    .catch((error) => {
        client.say(channel, `Hmm... sorry, I didn't really understand. 🙏`);
        console.log('There was an ERROR: ', error);
    });

}

function pokeMoveDescribe(){
    var name = JSON.stringify(pokeapiObj.name);
    name = name.substring(1,name.length -1);
    name = name.charAt(0).toUpperCase() + name.slice(1);
    var category = JSON.stringify(pokeapiObj.damage_class.name);
    category = category.substring(1,category.length -1);
    category = category.charAt(0).toUpperCase() + category.slice(1);
    var type = JSON.stringify(pokeapiObj.type.name);
    type = type.substring(1,type.length -1);
    type = type.charAt(0).toUpperCase() + type.slice(1);
    var power
    var accuracy
    const pp = pokeapiObj.pp;
    const description = pokeapiObj.effect_entries[0].effect;
    const target = pokeapiObj.target.name;
    const priority = pokeapiObj.priority;

    if(pokeapiObj.power == null){
        power = 'N/A';
    } else {
        power = pokeapiObj.power;
    }
    if(pokeapiObj.accuracy == null){
        accuracy = 'Always Hits';
    } else {
        accuracy = pokeapiObj.accuracy;
    }
    
    client.say(channel, `Move: ${name}. Type: ${type}. Category: ${category}. PP: ${pp}. Power: ${power}. Accuracy: ${accuracy}. Priority: ${priority}. Target: ${target}. Description: ${description}`);
}

//Shiny Rolls

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
            sayString = `@${chatuser} rolled a ${roll}. 🌻 No shiny this time, this is so sad. There have been ${shinyRollCounter} shiny rolls. 🌻`
        };
        
        client.say(channel, `${sayString}`); 
    } 
};

function dailyRollCheck(name){
    if(channel == rollchannel){
        if(rolledUsers.includes(name)){
            client.say(channel, `Sorry, @${name}, only one shiny roll per stream! 😘`);
        } else {
            rolledUsers.push(name);
            ShinyRoll(name);
        }
    } else {
        client.say(channel, `Sorry, @${name}, I can only keep track of shiny rolls on one channel at a time, and right now I'm only counting them on ${rollchannel}'s channel! 🌻 But, hey, you're an 8192 in my book, kiddo! 😉`);
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

function writeAllDataToFile(){
    writeRollerFile();
    writeOrreNames();
    writeBones();
}

function disconnectFunction(){
    console.log('Disconnecting...');
    writeAllDataToFile();
    setTimeout(() => {
        console.log('Disconnected!');
        process.exit(0);
    }, 3000);
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

//Followage

function FollowAge(player){
    const channelname = channel.substring(0);
    const numb = (Math.floor(Math.random() * 100) + 1);
    const timePeriodNum = Math.floor(Math.random() * 10);
    const timePeriod = ['days','months','years','million years','decades','centuries','eons','nanoseconds','moons','Martian years'];

    // console.log(channel, `@${player} has been following ${channelname} for ${numb} ${timePeriod[timePeriodNum]}!`)
    client.say(channel, `@${player} has been following ${channelname} for ${numb} ${timePeriod[timePeriodNum]}!`)
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

//Orre Names

async function interpretOrreNames(){
    //utility function to turn Orre.txt into json.
    try {
        const contents = await fsPromises.readFile('orreNames.txt', 'utf-8');
    
        names = contents.split(/\r?\n/);
        console.log(names);

        allOrreNamesObj.unused.push(names);

        require('fs').writeFile('orreNames2.json',

        JSON.stringify(allOrreNamesObj),

        function (err) {
            if (err) {
                console.error('Crap happens');
            }
            console.log('orre names json saved.')
        });
    
        console.log(names.length); // 👉️ ['One', 'Two', 'Three', 'Four']
    
      } catch (err) {
        console.log(err);
      };
};

//MAKE FUCNTIONS TO READ AND WRITE ASSIGNED ORRE NAMES OBJECT

async function readOrreNames() {
    try {
        const contents = await fsPromises.readFile('orreNames.json', 'utf-8');
      
        allOrreNamesObj = JSON.parse(contents);
        // for (const [key, value] of Object.entries(JSON.parse(contents))) { 
        // quizHighScores.push(`${key}:${value}`); 
        // };

        // console.log(`${JSON.stringify(quizHighScores)} Quiz scores read!`);
        console.log(`Orre names read!`);
    //   console.log(Array.from(quizQsObj.questions).length);
    
    } catch (err) {
        console.log(err);
    };

    try {
        const contents = await fsPromises.readFile('assignedOrreNames.json', 'utf-8');
      
        assignedOrreNamesObj = JSON.parse(contents);
        // for (const [key, value] of Object.entries(JSON.parse(contents))) { 
        // quizHighScores.push(`${key}:${value}`); 
        // };

        // console.log(`${JSON.stringify(quizHighScores)} Quiz scores read!`);
        console.log(`Assigned Orre names read!`);
        console.log(assignedOrreNamesObj);
    
    } catch (err) {
        console.log(err);
    };
  };

function writeOrreNames(){
    require('fs').writeFile('assignedOrreNames.json',
    JSON.stringify(assignedOrreNamesObj),
    function (err) {
        if (err) {
            console.error('Crap happens');
        }
        console.log('Assigned Orre names saved.')
    });
    require('fs').writeFile('orreNames.json',
    JSON.stringify(allOrreNamesObj),
    function (err) {
        if (err) {
            console.error('Crap happens');
        }
        console.log('Orre name used/unused saved.')
    });
}

function orreNameMain(username){
    //check if user has an orre name, if yes, tell them, if no, assign one

    if(username in assignedOrreNamesObj){
        const currentName = assignedOrreNamesObj[username];
        client.say(channel, `In the Orre region, ${username} is known as ✨ ${currentName} ✨ !`);
    } else {
        assignNewOrreName(username);
        const currentName = assignedOrreNamesObj[username];
        client.say(channel, `${username} is now known as ✨ ${currentName} ✨ in the Orre region!`);
    };
};

function renewOrreName(username){
    if(username in assignedOrreNamesObj){
        removeOrreName(username);
    };
        assignNewOrreName(username);
        const currentName = assignedOrreNamesObj[username];
        client.say(channel, `${username} is now known as ✨ ${currentName} ✨ in the Orre region!`);
};

function assignNewOrreName(username){
    const l = allOrreNamesObj.unused.length;
    // console.log(`l = ${l}`);
    const i = Math.floor(Math.random() * l);
    // console.log(`i = ${i}`);
    const currentName = allOrreNamesObj.unused[i];
    // console.log(`name = ${currentName}`);

    //removing the name from Unused
    allOrreNamesObj.unused.splice(i,1);
    //adding the name to Used
    allOrreNamesObj.used.splice(0,0,currentName)

    //assigning name to user and recording in list of assigned names.
    const newOrreName = {[username]:currentName};
    assignedOrreNamesObj = {...assignedOrreNamesObj, ...newOrreName};
    console.log(JSON.stringify(assignedOrreNamesObj));

};


function removeOrreName(username){
    if(username in assignedOrreNamesObj){
        const currentName = assignedOrreNamesObj[username]; //Grab user's assigned name
        console.log(allOrreNamesObj);
        var tempUsedArray = Array.from(allOrreNamesObj.used); //Create array from used names to find the index of the user's assigned name and then remove it from the used names list.
        const index = tempUsedArray.indexOf(currentName);
        allOrreNamesObj.used.splice(index,1);
        allOrreNamesObj.unused.splice(0,0,currentName)//add that name to the unused list
        console.log(allOrreNamesObj);
        
        
        const {[username]: _, ...assignedOrreNamesWithNameRemoved} = assignedOrreNamesObj; //remove that user from dictionary of user-orrename pairs
        assignedOrreNamesObj = assignedOrreNamesWithNameRemoved;
        console.log(assignedOrreNamesObj);
    } else {
        console.log(`${username} doesn't have an Orre name.`);
    };
}

//Bone commands

function readBones(){
    const fs = require('fs');

    var data = fs.readFile('bones.txt', 'utf8', (error, data) => {
        if(error){
           console.log(error);
           return;
        }    
        numBones = data;
        console.log("Taylor has " + numBones + " bones.");     
   });
}

function writeBones(){
    require('fs').writeFile('bones.txt',

    numBones.toString(),

    function (err) {
        if (err) {
            console.error('Crap happens');
        }
        console.log('Number of bones saved.')
    });
}

function sayBoneCount(){
    const channelname = channel.substring(0);
    var boneword = ``;
    var justword = ``;
    if(numBones == 1 || numBones == -1){
        boneword = `bone`;
        justword = `just `;
    } else {
        boneword = `bones`;
        justword = ``;
    }
    client.say(channel, `${channelname} has ${justword}${numBones} ${boneword}. 🦴`)
}

function takeBone(username){
    numBones--;
    sayBoneCount();

    if (Math.floor(Math.random() * 8192) == 0){
        client.say(channel, `${username} found a shiny bone! ✨ 🦴 ✨`)
    };
}

const takeBoneArray = [`!takebone`,`!eatbone`,`!removebone`,`!purloinbone`,`!makeoffwithbone`,`!stealbone`,`!extractbone`,`!withdrawbone`, `!skillfullyremovebone`, `!givenegativebone`,`!takebackmybone`, `!takebackbone`];

function giveBone(username){
    numBones++;
    sayBoneCount()

    if (Math.floor(Math.random() * 8192) == 0){
        client.say(channel, `${username} lost a shiny bone! ✨ 🦴 ✨`)
    };
}

const giveBoneArray = [`!givebone`,`!providebone`,`!regurgitatebone`,`!putbackbone`,`!putboneback`,`!returnbone`, `!donatebone`, `!takenegativebone`,`!placebone`];

function resetBones(){
    numBones = 207;
    sayBoneCount();
}

const sayBoneArray = [`!bonecount`,`!tradebone`,`!swapbone`,`!exchangebone`];

function shuffleBones(){
    let shuf = numBones.toString();
    while(+shuf==numBones){
        shuf = shuf.split('').sort(() => 0.5 - Math.random()).join('');
        console.log(shuf);
    };
    console.log(`Unshuffled bones = ${numBones}`);
    console.log(`Shuffled bones = ${+shuf}`);
    numBones = (+shuf);
    sayBoneCount();
}

//Poké API Stuff

// async function initializePokedex(){
//         let status = await import('./say.js');
//         status.hi(); // Hello!
//         status.bye(); // Bye!
//         status.default(); // Module loaded (export default)!
// }

//Height Command

function getHeight(invIn) {
    const inv = invIn;
    const hFeet = Math.floor(Math.random() * 10);
    const hInches = Math.floor(Math.random() * 12);
    var realfake = 'fake';

    if (hFeet == 5) {
        if(hInches >= 9){
            realfake = 'real';
        };
    } else if (hFeet > 5) {
        realfake = 'real';
    };

    if(inv == 1){
        if (realfake == 'real'){
            realfake = 'fake';
        } else if (realfake == 'fake'){
            realfake = 'real';
        };
    }
    
    client.say(channel, `Taylor is ${hFeet}'${hInches}" (${realfake}).`);
}

//Birthday Commands

function checkTaylorsBirthday() {
    const birthday = new Date('April 17, 1991 00:00:00 GMT-0600');
    const today = new Date();
    const age = today.getFullYear() - birthday.getFullYear();
    if((today.getMonth() == birthday.getMonth()) && (today.getDay() == birthday.getDay())){
        client.say(channel, `Today is Taylor's Birthday! 🎉 🎊 🥳 He's turning ${age}! Congrats, Taylor! 🥰 Hope you get the best birthday shiny ever! ✨`);
    } else {
        client.say(channel, `Today is *NOT* Taylor's birthday (but thank you for the warm wishes)! 😌`);
    }
};

//Nature Guess

function natureGuess(){
    const natures = ["Hardy", "Lonely", "Brave", "Adamant", "Naughty", "Bold", "Docile", "Relaxed", "Impish", "Lax", "Timid", "Hasty", "Serious", "Jolly", "Naive", "Modest", "Mild", "Quiet", "Bashful", "Rash", "Calm", "Gentle", "Sassy", "Careful", "Quirky"];
    const randnumb = Math.floor(Math.random() * 25);
    client.say(channel, `I guess ${natures[randnumb]}! 🌻`);
}

function energyGuess(){
    const energies = ["Fire", "Grass", "Electric", "Fist", "Water", "Psychic", "Dark", "Steel", "Fairy (lol)", "V Star Card, hehehe"];
    const randnumb = Math.floor(Math.random() * 10);
    client.say(channel, `I guess ${energies[randnumb]}! 🌻`);
}

function randomNumber(max){
    const numb = parseInt(max);
    const randnumb = Math.floor(Math.random() * numb);
    client.say(channel, `Random number: ${randnumb}! 🌻`);
}



//Console Commands

rl.on('line', (input) => 
{
    const args = input.split(' ');
    const command = args.shift().toLowerCase();
    const saystring = input.substring(4);

//   console.log(`Received: ${input}`);
    switch(command){
        case `!save` :  
            writeAllDataToFile();
            break;
        case `!interpret` :
            interpretOrreNames();
            break;
        case `!refreshfunfacts` :
            readFacts('funfacts.json');
            console.log('Facts refreshed!');
            break;
        case `say` :
            client.say(channel, `${saystring}`);
            // console.log(saystring);
            break;
        case `beep` :
            client.say(channel, `🤖 BEEP BOOB BOPP 🤖`);
            break;
        case `!disconnect` :
            disconnectFunction();
            break;
        case `alias` :
            client.say(channel, `You cannot call the same command as an alias.`);
            break;
        case `test` :
            FollowAge(`miggtorr`);
            break;
        case `newrolls` :
            rolledUsers = [];
            writeRollerFile();
            client.say(channel, "New shiny rolls available for everyone! 🌻");
            break;
        default:
            break;
    }
}
); 

rl.on('SIGINT', () => {
    rl.question('Are you sure you want to exit? (y/n)', (answer) => {
      if (answer.match(/^y(es)?$/i)){
        rl.question('Would you like to save data to file? (shinyrolls, etc.) (y/n)', (answer) => {
            if(answer.match(/^y(es)?$/i)){
                disconnectFunction();
                
            } else {
                console.log('Disconnected!');
                process.exit(0);
            }
        })
      } else {
        console.log(`SunfloraBot remaining active...`);
      };
    });
  }); 