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
Our team's plan hasn't changed much we didn't reconsider any of the tools or roles. We have been splitting the work up ignoring the roles we had. We haven't focused much on game design as we have mainly been thinking about the software requirements.


## Devlog Entry - F2
## How we satisfied the software requirements
### F0 + F1
In this phase, a lot changed with our code quality. We first broke up our major game elements into classes, then separated these classes into different files. Before, everything was contained in our main.ts file, which made it very overwhelming to look through. We also made many incremental changes in which we extracted smaller functions from larger, unwieldy functions, renamed confusing variables and functions, improved the quality of our comments, and moved code around to improve its organization and readability.

### External DSL for Scenario Design
We used YAML for our external DSL design. Upon building, this YAML file is converted into a JSON file, which our program then reads from and implements. Here is an example of what our tutorial level looks like in YAML:

```
tutorial:
  grid_size: [2,3]
  available_fish_types:
    - Green
  objective: 250
  special_events:
    - [5, heatwave, 2]
```

This means that for the tutorial level, the size of the grid will be 2 rows by 3 columns, the only fish available to buy will be Green, and the objective to reach (in money) is $250. Additionally, a heatwave event is scheduled to start on day 5 and will last for 2 days.

### Internal DSL for Fish and Growth Conditions
Our project is written in TypeScript, and so is our internal DSL. This is an excerpt from the fish definitions for our internal DSL:

```
const allFishDefinitions = [
  function green($: FishDefinitionLanguage) {
    $.name("Green");
    $.cost(15);
    $.growthMultiplier(1);
    $.minValueGain(1);
    $.growsWhen(({ fish, cell }) => {
      // Until growth 3, the fish grows as long as it has food
      if (fish.growth < FISH_MATURE_GROWTH) return true;
      // After this level, it must be living with at least 2 other fish of the same type
      // and the level of sunlight must be lower than 8
      const isHappy = cell.population
        .filter((neighbor) => neighbor !== fish) // Filter out this fish
        .filter((neighbor) => neighbor.type === fish.type).length >= 2;
      return isHappy && cell.state.sunlight < 8;
    });
  },
  /* ... */
];
```

This describes the Green type of fish, which costs $15, grows at a rate of 1 per food it eats, and gains at least $1 of value for every growth level it gains. It grows until level 3 without any special requirements, then, to continue growing, it must live in a cell without extreme sunlight and with at least 2 other Green fish.

This functional implementation allows us to add more complex growth requirements that would be difficult to write in an external DSL. With this implementation, our fish types can differ not just numerically, but also structurally.

## Reflection
As we were running out of time, we had to unfortunately forgo the platform change. At this point, our roles mostly dissolved as we divided up the remaining tasks for both this phase and the next. We added some more player feedback such as tooltip descriptions on shop buttons that give hints about a given fish's growth requirements. We also added a note in the cell popup to let players know when a cell was overcrowded and that fish would not grow to their maximum size. Previously, this information was hidden, but we realized that this could create confusion in players as to why their fish do not grow despite being fully fed.


## Devlog Entry - F3
F[0],F[1],F[2] - No changes

## How we satisfied the software requirements
-[F3.a] The game must be internationalized in way that allows all text visible to the player to be translated into different written languages (i.e. there are no messages that are hard-coded to display only English-language text, but it is fine for this requirement if English is the only supported display language).

For this step, we created a seperate TypeScript file with a Record that used a key word and returned a string. We then made a helper file, which had a getText function, that would use the translation file and return the appropriate string. In our ui-manager, we changed the instances where we just outputted text and instead used the getText function to get the text.

-[F3.b] The game must be localized to support three different written languages. At least one language must use a logographic script, and at least one language must use a right-to-left script.

We added a UI dropdown menu that allowed the user to select a language. Our helper file has a variable that tracks the langauge and returns the approraite language from our translation file. We chose English, Spanish, and Arabic for our supported languages. While we knew Spanish, we mostly relied on Brace to provide the list of translations for us, especially since none of us know how to read or write in Arabic. 

-[F3.c] The game must be installable on a smartphone-class mobile device in the sense that there is a way to get it to show up as a home-screen icon that feels similar to other installed apps.

We got the game to be installable by changing to just using vite instead of deno and also using PWA.
We followed this video https://www.youtube.com/watch?v=YSGLw4T8BgQ&t=458s

-[F3.d] Once installed in a mobile device, the game can be launched and satisfactorily played even when the device is not connected to the internet.

The UI was not very user-friendly on mobile, so we had to split up some of the buttons to separate containers and also add more space between them.
No changes were needed for offline play.

## Reflection
In this phase, we didnt really stick to our roles since we were doing our best to accomplish the requirements in time. In order for the UI to fit correctly on the mobile version, we had to rework how it was laid out. In this phase, we were not focused on player feedback as we were more focused on completing the software requirements. 
