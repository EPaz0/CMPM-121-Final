# CMPM-121-Final

# Devlog Entry - 11/13/24
## Introducing the team

Tools Lead: Enrique Paz
Engine Lead: Raul Mojarro
Design Lead: Lyle Watkins



## Tools and materials
We are going to be using typescript and baseline web platforms because they are things we have been using and are class and familiar to us right now. We will be using VSCode for our IDE because it’s easy to use and we are most familiar with it. Lyle will use Procreate to create visual assets because it has a built-in animation editor and they have been using it for years. Our alternate platform choice is PixieJS and we chose it because we don't like Phaser and want to try something new.


## Outlook
One thing we anticipate being a hard part of the project is setting up our game visually while using HTML. Also, another thing we anticipate being hard/risky is having our game break during the switch if there is one. We are hoping to learn how to use our alternate platform PixieJS and also learn how to create a game without an engine.

## Devlog Entry - F0
## How we satisfied the software requirements
- You control a character moving over a 2D grid.
This was fairly easy to implement for our group. We created our game world by placing each square within a 2D array. The player movement code adjust the player positon by adding/subtracting 1 from a player's coordinates(col and row), which should correspond to a square within the array. If it would go out of bounds, then the player isn't moved. 
- You advance time manually in the turn-based simulation.
For our game, we currently have it so that time will only advance if the player presses the **Next Day** button, which calls the NextDay function. Within this function, we call several functions that control each component of the game that should be updated with the passage of time: the amount of food produced in a cell based on the amount of sunlight, having the fish population consume the food and improve each fish's growth if they were able to get food, having the population increase if they are enough in a cell, and then generating the new sunglight amount for each cell. 
- You can reap or sow plants on grid cells only when you are near them.
When the player is on a cell, they can purchase a fish to place in that cell by clicking on a button from the shop on the right of the screen. If a player clicks on a cell, it will move the player to that cell and then bring up a popup that allows them to sell fish from that cell. 
- Grid cells have sun and water levels. The incoming sun and water for each cell is somehow randomly generated each turn. Sun energy cannot be stored in a cell (it is used immediately or lost) while water moisture can be slowly accumulated over several turns.
For our game, we swapped out water for food as a resource. In our UpdateSunlight function, we have sunlight capped between 1 and 10, and it has a random chance of being increased or decreased with each day. Food is stored in each cell, which is also capped at 10. Each day, if it is below that threshold, then it will generate more food properiotnal to the sunlight level of the cell. Food is not decreased unless there are fish in the cell, in which food will decrease for each fish fed. 
- Each plant on the grid has a distinct type (e.g. one of 3 species) and a growth level (e.g. “level 1”, “level 2”, “level 3”).
We currently have three different fish types, simply catergorized as Green, Yellow, and Red. For our game, each fish has a value that corresponds to how much they are worth when sold. Based on the color, their value will increase by a certain range each day. If they are unfed, it will decrease and then die. 
- Simple spatial rules govern plant growth based on sun, water, and nearby plants (growth is unlocked by satisfying conditions).
The amount of sunlight in a cell will determine how much food is regenerated at the end of a day, which will then be consumed by each fish in the cell. If there are at least two fish, there is a chance they will reproduce. 
- A play scenario is completed when some condition is satisfied (e.g. at least X plants at growth level Y or above).
For our current build, the goal is just to acquire 500 points in cash, when the player must earn by raising fish and selling them. 

## Reflection
For our game, Raul ended up being more the Design lead for this phase, as he came up with the structure for how the cells should be implemented. We went back and forth on how we should handle which resources should be purchasanble, and still think we might change it in future updates. We were trying to make it so that each fish pair, when they reproduce, have a chance to add a child to a neighboring tile, but weren't able to add it by the deadline. 

## Devlog Entry - F1
## How we satisfied the software requirements
F[0] - no changes
Byte Array Layout:
-----------------------------------------------------
| Cell(0,0) | Cell(0,1) | Cell(1,0) | Cell(1,1) ... |
-----------------------------------------------------
| Sun | Food | Pop | Fish[0] | Fish[1] | ... | Unused |
-----------------------------------------------------
                 ↓ Zoom In on a Single Cell
Single Cell:
-------------------------------------------------
| Sunlight | Food | Population | Fish[0...n] ... |
-------------------------------------------------
|  1 Byte  | 1 Byte |   1 Byte   |  4 Bytes each  |
-------------------------------------------------

[F1.a] - The grid state is stored in an Array-of-Structures (AoS) format. Each cell stores sunlight, food, and fish populations as discrete fields in the byte array. Each fish occupies four bytes: fish type, growth, food, and value. The byte array is primary, and the grid is decoded from this byte array as needed.

[F1.b] - Player is given buttons that allow them to manually save their progress and load it by specifying the names tied to the save. Multiple saves are supported and deletion as well. Save states are stored in localStorage. The player can see a list of all their saves.

[F1.c] When the game starts, it checks if the player has an autosave and asks if they want to load that save. The game auto-saves  at the start of the game, end of each day, and whenever a player buys, sells, or moves fish.

[F1.d] The player is given two buttons where they can  undo or redo any major decisions. gameStates stores the entire game after every major action. redoStacksallows redo operations making undo reversible.

## Reflection 
Are team's plan hasn't changed much we didn't reconsider any of the tools or roles. We have been splitting the work up ignoring the roles we had. We haven;t focused much on game design as we have mainly been thinking about the software requirements.


## Devlog Entry - F2
## How we satisfied the software requirements

## Reflection

## Devlog Entry - F3
F[0],F[1],F[2] - No changes

## How we satisfied the software requirements
-[F3.a] The game must be internationalized in way that allows all text visible to the player to be translated into different written languages (i.e. there are no messages that are hard-coded to display only English-language text, but it is fine for this requirement if English is the only supported display language).
For this step, we created a seperate ts file with a Record that used a key word and returned a string. We then made a helper file, which had a getText function, that would use the translation file and return the apporiate string via text.replace. In our ui-manager, we changed the instances where we just outputted text and instead used the getText function to get the text. 
-[F3.b] The game must be localized to support three different written languages. At least one language must use a logographic script, and at least one language must use a right-to-left script.
We added a UI dropdown menu that allowed the user to select a language. Our helper file has a variable that tracks the langauge and returns the approraite language from our translation file. We chose English, Spanish, and Arabic for our supported languages. While we knew Spanish, we mostly relied on Brace to provide the list of translations for us, especially since none of us know how to read or type Aracbic. 
-[F3.c] The game must be installable on a smartphone-class mobile device in the sense that there is a way to get it to show up as a home-screen icon that feels similar to other installed apps.
We got the game to be installable by changing to just using vite instead of deno and also using PWA.
Followed this video https://www.youtube.com/watch?v=YSGLw4T8BgQ&t=458s
-[F3.d] Once installed in a mobile device, the game can be launched and satisfactorily played even when the device is not connected to the internet.
For ui changes I had to split up some of the button to sepearte containers and also add more space inbetween them horizontally.
No changes were needed for offline play.

## Reflection
-In this phase, we didnt really stick to our roles since we were doing our best to accomplish the requirements in time. In order for the UI to fit correctly on the mobile version, we had to rework some of ui. Also havent focused on player feedback as we were more focused on completing the software side. 
