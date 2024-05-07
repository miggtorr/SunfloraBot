# ![Sunflora](https://archives.bulbagarden.net/media/upload/9/9b/Spr_3e_192_s.png) SunfloraBot ![Sunflora](https://archives.bulbagarden.net/media/upload/9/9b/Spr_3e_192_s.png)

**Our resident Twitch Chat Bot:** ***SunfloraBot*** **!**

“🤖 Beep Boob Bopp 🤖” —*SunfloraBot*

## ![Sunflora](https://archives.bulbagarden.net/media/upload/b/b0/Trozeiani192.png) Installation ![Sunflora](https://archives.bulbagarden.net/media/upload/b/b0/Trozeiani192.png) 

### ![SunfloraSmall](https://archives.bulbagarden.net/media/upload/e/e3/Ani192MS.png)Install node.js on your machine

Node.js is just Javascript that runs as standalone “serverside” software—as opposed to Javascript that runs “clientside” (e.g., on a webpage in your browser). Installing node.js will allow your computer to run SunfloraBot, which is written in Javascript.

1. Go to https://nodejs.org/en and download the installer for the most recent "LTS" version (LTS stands for “long term support” and will be the most stable version).

2. Run the installer.

### ![SunfloraSmall](https://archives.bulbagarden.net/media/upload/e/e3/Ani192MS.png)Install SunfloraBot

1. Download the SunfloraBot directory and store it locally in an arbitrary location. That's it!

### ![SunfloraSmall](https://archives.bulbagarden.net/media/upload/e/e3/Ani192MS.png)Connecting SunfloraBot to a Twitch account

#### ![Sunkern](https://archives.bulbagarden.net/media/upload/b/b1/Ani191OD.png)Getting login credentials that the bot can use.

1. You can use your own Twitch account for this or you can make a new one. 
2. Log into the Twitch account from whoch you'd like SunfloraBot to post.
3. Go to https://twitchapps.com/tmi/ and press **Connect** and then click **Authorize**.
4. Copy the entire OAuth password that is given to you and save it somewhere safe. Don't share this with anyone.

#### ![Sunkern](https://archives.bulbagarden.net/media/upload/b/b1/Ani191OD.png)Providing the credentials to the bot itself.

1. In the SunfloraBot directory, create a new file (either using an IDE like **Visual Studio Code** or a simple text editor like **TextEdit** or **Notepad**. If using **TextEdit** or **Notepad**, be sure you're writing plain text, not rich text).
2. Open the file and paste the following code, substituting your own data for the fields as shown: 
```
{
    "channel" : "[channel to post in]",
    "username" : "[username of the account the bot will post as]",
    "password" : "[the complete OAuth password you got from before, including the 'oauth:' part at the beginning]"
}
```
For example:
```
{
    "channel" : "pokimane",
    "username" : "SunfloraBot",
    "password" : "oauth:1z08sdaf94fs430f918ur01hj93y0"
}
```
3. Save that file as a JSON file in the SunfloraBot directory. This means it needs to be plaintext and you need to use the .json extension, not .txt.

## ![Sunflora](https://archives.bulbagarden.net/media/upload/b/b0/Trozeiani192.png) Activating SunfloraBot ![Sunflora](https://archives.bulbagarden.net/media/upload/b/b0/Trozeiani192.png) 

2. Open the **Terminal** or **Command Line** and navigate to the SunfloraBot folder by typing `cd [path]/SunfloraBot/`.

3. In the **Terminal** or **Command Line**, activate SunfloraBot by typing `node index.js`

4. You should then see SunfloraBot join the chat of the channel specified above.

5. To deactivate SunfloraBot, you can either press `CTRL+C` in the **Terminal** or a mod can type `!disconnect` in the chat where SunfloraBot has joined. 

![note](https://archives.bulbagarden.net/media/upload/e/e3/Ani192MS.png) **NOTE**: Using the `!disconnect` command will saves all the shiny rolls and updated Orre names before it deactivates. `CTRL+C` in the terminal will prompt the user whether they want to save shiny rolls and Orre names. `!save` can also be used in the terminal to manually save shiny rolls and Orre names without notifying chat.

6. SunfloraBot should be deactivated **after every stream** so it can save the shiny rolls and so it won't crash if the computer on which it's running goes to sleep.

## ![Sunflora](https://archives.bulbagarden.net/media/upload/b/b0/Trozeiani192.png) SunfloraBot Basic Usage ![Sunflora](https://archives.bulbagarden.net/media/upload/b/b0/Trozeiani192.png) 

### ![SunfloraSmall](https://archives.bulbagarden.net/media/upload/e/e3/Ani192MS.png)Mod-only commands

#### ![Sunkern](https://archives.bulbagarden.net/media/upload/b/b1/Ani191OD.png)Shiny Roll commands
- `!newrolls` : Makes a new set of shiny rolls available. Use this at the beginning of the stream.
- `!refreshrolls` : Same as `!newrolls`.
- `!resetrolls` :Same as `!newrolls`.
- `!reroll [username]` : Allows a user to reroll for any reason.
- `!save` : Writes the shiny rolls (and Orre names) to a file so that SunfloraBot can be shut down manually using `CTRL+C` in the Terminal.
- `!resetcounter` : Resets the counter on the shinyrolls to 0. Used after someone successfully rolls for a shiny.
- `!letsavroll` : Toggles whether `atreelessplain` can use the shiny roll command, lol. 

#### ![Sunkern](https://archives.bulbagarden.net/media/upload/b/b1/Ani191OD.png)Game-related commands
- `!quitquiz` : Force quits the active quiz that a user is playing.
- `!rescore` : Forces SunfloraBot to re-read the quizscores.json file. Used after manually editing the file in an IDE or text editor. 
- `!wtf` : Activates the *Who's That Pokemon!?* Game.

#### ![Sunkern](https://archives.bulbagarden.net/media/upload/b/b1/Ani191OD.png)Orre Name-related commands
- `!orre [username]` : Generates a random Orre-name based on the names of trainers in Mt. Battle and assigns it quasi-permanently to the username provided. If no username is provided, the user will assign themselves an Orre name. **NOTE**: If used by a non-mod, will only ever assign an Orre name to the user, no matter the arguments.
- `!orrenew [username]` : Issues a user a brand new Orre name (e.g., if they hate the one they got). This is a mod-only command so users don't spam it repeatedly looking for the perfect Orre name. If no username is provided, the user will assign themselves a new Orre name.
- `!orreremove [username]` : Removes an Orre name from a user. **NOTE**: This command is mod-only to discourage users from alternating between `!orre` and `!orreremove` just to cycle their names around.
- `!save` : Writes the Orre names (and shiny rolls) to a file so that SunfloraBot can be shut down manually using `CTRL+C` in the Terminal.

#### ![Sunkern](https://archives.bulbagarden.net/media/upload/b/b1/Ani191OD.png)Miscellaneous Mod-Only Commands

- `!disconnect` : Safely shuts down SunfloraBot
- `!tweet` : Reminds the streamer to tweet out that they're live.
- `!nap` : "Shutting down for 30 minutes." (Doesn't actually shut down the bot)

- `gn` : SunfloraBot will say goodnight to the mod and to the streamer.
- `ncie` : "ncie"

- `!resetbones` : SunfloraBot will reset the streamer's bone count to 207. 

### ![SunfloraSmall](https://archives.bulbagarden.net/media/upload/e/e3/Ani192MS.png)General User commands

- `!shinyroll` : Rolls for a shiny.
- `!quiz` : Begins a quiz (See below for quiz commands).

- `!funfunfact` : Generates a random Pokémon fact.
- `!funfunfact [tag]` : Generates a random Pokémon fact from a subset of facts that have a certain tag. Tags include the names of Pokémon as well as the words `anime`, `vgc`, `tcg`, and `general`.
- `!realfunfact` : Exactly the same as `!funfunfact`.
- `!actualfunfact` : Exactly the same as `!funfunfact`.

- `!bestlegendary`: SunfloraBot will tell you the best legendary.
- `!numberOfNoses`: "Taylor has one nose. ??? Why would you ask that?"
- `!bestshiny` : SunfloraBot will tell you the best shiny.

- `!orre` : Generates a random Orre-name based on the names of trainers in Mt. Battle and assigns it quasi-permanently to that user.

#### ![Sunkern](https://archives.bulbagarden.net/media/upload/b/b1/Ani191OD.png)Quiz commands

- `!quizcommands` : SunfloraBot will list the quiz commands (see below).
- `!myscore` : SunfloraBot will show you your lifetime quiz points.
- `!leaderboard` : SunfloraBot will show you the top 3 quiz players.
- `!myrank` : SunfloraBot will tell you your quiz rank and your score.

#### ![Sunkern](https://archives.bulbagarden.net/media/upload/b/b1/Ani191OD.png)*Who's That Pokémon?* Commands

- `!guess [pokemon]` : Used to guess a certain Pokémon when a WTP game is active.
- `!wtpscore` : SunfloraBot will show you your lifetime WTP points.
- `!wtpleaderboard` : SunfloraBot will show you the top 3 WTP players.

#### ![Sunkern](https://archives.bulbagarden.net/media/upload/b/b1/Ani191OD.png)Bone commands
- `!bonecount` : SunfloraBot will say the streamer's bone count.
    - Also: `!tradebone`,`!swapbone`,`!exchangebone`.
- `!takebone` : SunfloraBot will remove 1 bone from the streamer's bone count.
    - Also `!eatbone`,`!removebone`,`!purloinbone`,`!makeoffwithbone`,`!stealbone`,`!extractbone`,`!withdrawbone`.
- `!givebone`: SunfloraBot will add 1 bone to the streamer's bone count.
    - Also `!providebone`,`!regurgitatebone`,`!putbackbone`,`!putboneback`,`!returnbone`.
- `!shufflebones` : SunfloraBot will randomize the digits in the streamer's bone count and remove any leading 0s (e.g., `207` could become `702`, `270`, `720`, `72`, or `27`).

### ![SunfloraSmall](https://archives.bulbagarden.net/media/upload/e/e3/Ani192MS.png)PokéAPI Integration

- SunfloraBot now has PokéAPI integration! You can now look up various facts using the `!dex` command.
- Use `!dex` to look up facts about Pokémon, Moves, Abilities, Stats, Types, Shiny Palettes, Forms, and Dex Entries.
- Argumnents are not case-sensitive, take no punctuation, and use hyphens for spaces (e.g., `rock-slide`, `Farfetchd`, `TAUROS-PALDEA-BLAZE-BREED` are all valid).
- Right now use is limited to mods only to avoid overloading the system with API calls.
  
#### ![Sunkern](https://archives.bulbagarden.net/media/upload/b/b1/Ani191OD.png)PokéAPI Commands
- `!dex pokemon [pokemon name or ID]` : Provides general info about a particular Pokémon.
- `!dex pokemon [pokemon name or ID] varieties` : Provides the PokéAPI names of the various forms of a particular Pokémon.
- `!dex pokemon [pokemon name or ID] stats` : Provides the base stats and EV yield of a particular Pokémon.
- `!dex pokemon [pokemon name or ID] moves` : Provides a link to the a particular Pokémon's Bulbapedia Learnset page.
- `!dex pokemon [pokemon name or ID] normal` : Provides a link to an image of a particular Pokémon's non-shiny sprite.
- `!dex pokemon [pokemon name or ID] shiny` : Provides a link to an image of a particular Pokémon's shiny sprite.
- `!dex pokemon [pokemon name or ID] dexentry` : Provides Pokédex flavor text for the specified Pokémon.
- `!dex pokemon [pokemon name or ID] location` : Provides a link to the a particular Pokémon's Bulbapedia Game Locations page.
- `!dex pokemon [pokemon name or ID] ref` : Provides a link to the Bulbapedia and Serebii entries a particular Pokémon.

- `!dex type chart` : Provides a link to a Pokémon type chart.
- `!dex type [type] stronginto` : Provides a list of types to which attacks of the specified type do 2x damage.
- `!dex type [type] weakinto` : Provides a list of types to which attacks of the specified type do 0.5x damage.
- `!dex type [type] weakto` : Provides a list of types of attacks from which the specified type takes 2x damage.
- `!dex type [type] resists` : Provides a list of types of attacks from which the specified type takes 0.5x damage.
- `!dex type [type] nodamage` : Provides a list of types to which attacks of the specified type do 0x damage.
- `!dex type [type] immunefrom` : Provides a list of types of attacks from which the specified type takes 0x damage.

- `!dex ability [ability]` : Provides general info about a particular ability.
- `!dex move [move]` : Provides general info about a particular move.
- `!dex nature [nature]`: Provides info about the effect of a particular Pokémon nature.

### ![SunfloraSmall](https://archives.bulbagarden.net/media/upload/e/e3/Ani192MS.png)Additional Features

- SunfloraBot will say a Fun Fact every 20 mins.

- If `monipandas` or `atreelessplain` write a message ending with `-ussy`, SunfloraBot will echo it back, ending it with `-enis` instead.

### ![SunfloraSmall](https://archives.bulbagarden.net/media/upload/e/e3/Ani192MS.png) Terminal Commands
The following commands can be used directly from the terminal:

- `say [arguments]` : SunfloraBot will say `[arguments]` in chat.

- `beep` : "🤖 BEEP BOOB BOPP 🤖"

- `!save`

- `!refreshfunfacts`

- `!disconnect`

In addition, `Ctrl-C` in the terminal now prompts the user to save shiny rolls, etc. before terminating the bot.
