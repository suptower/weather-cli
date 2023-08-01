#!/usr/bin/env node --no-warnings
// make us of .env file
import "dotenv/config";

// persist config
import Conf from "conf";

// terminal styling
import chalk from "chalk";

// user input
import prompts from "prompts";

// weather api
import { weather, weatherprompt } from "./weather.js";

// cli options
import getopts from "getopts";

// filesystem
import { readFileSync } from "fs";

// gradient colors
import gradient from "gradient-string";

// string tables
import { table } from "table";

// read package.json
const packageJson = JSON.parse(readFileSync("./package.json"));

// persist config
const schema = {
  unit: {
    type: "string",
    default: "metric",
  },
  traverse: {
    type: "string",
    default: "dial",
  },
  presetOptions: {
    type: "array",
    default: [
      { title: "Morning", value: "6"},
      { title: "Noon", value: "12"},
      { title: "Evening", value: "18"},
      { title: "Night", value: "0"},
    ],
  },
};

const config = new Conf({ projectName: "weather-cli", schema });

// get cli arguments
const argv = process.argv.slice(2);

// set api key from env variable
if (process.env.API_KEY) {
  config.set("api", process.env.API_KEY);
}

// cli options
const options = getopts(argv, {
  alias: {
    help: "h",
    version: "v",
    api: "a",
    config: "c",
    delete_config: "d",
    env: "e",
    fast: "f",
    info: "i",
  },
});

// weather --help
if (options.help) {
  console.clear();
  console.log(
    gradient.morning(`
    Usage: 
        $ weather [options]
        $ weather [location]
        $ weather [options] [location]

    Options:
        -h, --help          output usage information
        -v, --version       output the version number
        -a, --api           set api key
        -c, --config        show config
        -d, --delete_config clear config
        -e, --env           set api key from environment variable API_KEY
        -f , --fast [loc]   fast mode, no prompt, location as arg
        -i, --info          show project related info

    Examples:
        $ weather Munich
        $ weather --api
        $ weather -v
        $ weather --config
        $ weather --info
        $ weather -f Munich
        $ weather
    `),
  );
  process.exit(0);
}

// weather --version
if (options.version) {
  console.log(chalk.green("v" + packageJson.version));
  process.exit(0);
}

// weather --env
if (options.env) {
  if (process.env.API_KEY) {
    await config.set("api", process.env.API_KEY);
    console.log(chalk.green("API key from dotenv has been set."));
  } else {
    console.log(chalk.red("API key not found in dotenv."));
  }
  process.exit(0);
}

// weather --info
if (options.info) {
  console.clear();
  console.log(gradient.teen("Weather CLI"));
  console.log(gradient.passion("Version: ") + packageJson.version);
  console.log(gradient.retro("Author: ") + packageJson.author);
  console.log(gradient.mind("Repository: ") + packageJson.repository.url);
  console.log(gradient.cristal("License: ") + packageJson.license);
  console.log(gradient.fruit(packageJson.date));
  process.exit(0);
}

// weather --config
if (options.config) {
  (async () => {
    console.clear();
    // prompt for config
    // TODO: make user able to modify preset times
    const response = await prompts({
      type: "select",
      name: "config",
      message: "Select config option",
      choices: [
        { title: "Show API key", value: "show" },
        { title: "Delete API key", value: "delete" },
        { title: "Set temperature unit", value: "unit" },
        { title: "Set forecast hour traversing style", value: "traverse"},
        { title: "Preset Times Configuration", value: "preset"},
        { title: "Clear config", value: "clear" },
        { title: "Cancel", value: "cancel" },
      ],
    });
    if (response.config === "show") {
      const api = await config.get("api");
      if (api) {
        console.log(chalk.green("API key: " + api));
      } else {
        console.log(chalk.red("API key undefined."));
      }
    }
    if (response.config === "delete") {
      await config.delete("api");
      console.log(chalk.green("API key deleted."));
    }
    if (response.config === "unit") {
      // Check for active choise
      let unitInitial = 1;
      if (config.get("unit") === "metric") {
        unitInitial = 0;
      }
      const unit = await prompts({
        type: "select",
        name: "unit",
        message: "Select temperature unit",
        choices: [
          { title: "Celsius", value: "metric" },
          { title: "Fahrenheit", value: "imperial" },
        ],
        initial: unitInitial,
      });
      await config.set("unit", unit.unit);
      console.log(chalk.green("Temperature unit saved as " + config.get("unit") + "."));
    }
    if (response.config === "clear") {
      await config.clear();
      console.log(chalk.green("Config cleared."));
    }
    if (response.config === "traverse") {
      // Check for active choise
      let traverseInitial = 0;
      if (config.get("traverse") === "preset") {
        traverseInitial = 1;
      }
      const traverse = await prompts({
        type: "select",
        name: "traverse",
        message: "Select forecast hour traversing style",
        choices: [
          { title: "Dial", value: "dial" },
          { title: "Preset times", value: "preset" },
        ],
        initial: traverseInitial,
      });
      await config.set("traverse", traverse.traverse);
      console.log(chalk.green("Forecast hour traversing style saved as " + config.get("traverse") + "."));
    }
    if (response.config === "preset") {
      // Show options
      const editPresets = await prompts({
        type: "select",
        name: "value",
        message: "Choose an option",
        choices: [
          { title: "Add preset time", value: "add" },
          { title: "Edit preset time", value: "edit"},
          { title: "Remove preset time", value: "remove" },
          { title: "Show preset times", value: "show" },
          { title: "Reset preset times", value: "reset"},
          { title: "Cancel", value: "cancel" },
        ],
      });
      if (editPresets.value === "add") {
        // Add preset time
        const addPreset = await prompts({
          type: "text",
          name: "value",
          message: "Enter a preset name",
        });
        if (addPreset.value) {
          const addPresetTime = await prompts({
            type: "number",
            name: "value",
            message: "Enter a preset time",
            initial: 0,
            min: 0,
            max: 23,
          });
          if (addPresetTime.value) {
            const presetTimes = await config.get("presetOptions");
            presetTimes.push({ title: addPreset.value, value: addPresetTime.value });
            presetTimes.sort((a, b) => a.value - b.value);
            await config.set("presetOptions", presetTimes);
            console.log(chalk.green("Preset time added."));
          } else {
            console.log(chalk.red("Preset time undefined."));
          }
        } else {
          console.log(chalk.red("Preset name undefined."));
        }
      } else if (editPresets.value === "edit") {
        // make prompt for preset time
        const presetTimes = await config.get("presetOptions");
        // make sure there are preset times
        if (presetTimes.length > 0) {
          const selectPreset = await prompts({
            type: "select",
            name: "value",
            message: "Select a preset time",
            choices: presetTimes,
          });
          if (selectPreset.value) {
            // edit name
            const editPreset = await prompts({
              type: "text",
              name: "value",
              message: "Enter a preset name",
              initial: selectPreset.value.title,
            });
            if (editPreset.value) {
              // edit time
              const editPresetTime = await prompts({
                type: "number",
                name: "value",
                message: "Enter a preset time",
                initial: selectPreset.value.value,
                min: 0,
                max: 23,
              });
              if (editPresetTime.value) {
                // remove old preset
                for (let i = 0; i < presetTimes.length; i++) {
                  if (presetTimes[i].value === selectPreset.value) {
                    presetTimes.splice(i, 1);
                    break;
                  }
                }
                // add new preset
                presetTimes.push({ title: editPreset.value, value: editPresetTime.value });
                presetTimes.sort((a, b) => a.value - b.value);
                await config.set("presetOptions", presetTimes);
                console.log(chalk.green("Preset time edited."));
              } else {
                console.log(chalk.red("Preset time undefined."));
              }
            } else {
              console.log(chalk.red("Preset name undefined."));
            }
          }
        } else {
          console.log(chalk.red("No preset times."));
        }
      } else if (editPresets.value === "remove") {
        // show prompts for preset time
        const presetTimes = await config.get("presetOptions");
        // make sure there are preset times
        if (presetTimes.length > 0) {
          const selectPreset = await prompts({
            type: "select",
            name: "value",
            message: "Select a preset time",
            choices: presetTimes,
          });
          if (selectPreset.value !== undefined) {
            // remove preset
            for (let i = 0; i < presetTimes.length; i++) {
              if (presetTimes[i].value === selectPreset.value) {
                  presetTimes.splice(i, 1);
                  await config.set("presetOptions", presetTimes);
                  break;
              }
            }
            console.log(chalk.green("Preset time removed."));
          }
        } else {
          console.log(chalk.red("No preset times."));
        }
      } else if (editPresets.value === "show") {
        // print out preset times
        const presetTimes = await config.get("presetOptions");
        // make sure there are preset times
        if (presetTimes.length > 0) {
          const arrayPresetTimes = [
            ["Name", "Time"],
          ];
          for (let i = 0; i < presetTimes.length; i++) {
            arrayPresetTimes.push([presetTimes[i].title, presetTimes[i].value]);
          }
          console.log(gradient.morning(table(arrayPresetTimes)));
        } else {
          console.log(chalk.red("No preset times."));
        }
      } else if (editPresets.value === "reset") {
        // make array with default preset times
        const presetTimes = [
          { title: "Morning", value: 6 },
          { title: "Afternoon", value: 12 },
          { title: "Evening", value: 18 },
          { title: "Night", value: 0 },
        ];
        await config.set("presetOptions", presetTimes);
        console.log(chalk.green("Preset times reset."));
      }
    }
    process.exit(0);
  })();
} else if (options.delete_config) {
  // clear config
  (async () => {
    await config.clear();
    console.log(chalk.green("Config cleared."));
    process.exit(0);
  })();
} else if (options.api) {
  //
  (async () => {
    // prompt for api key
    const response = await prompts({
      type: "text",
      name: "api",
      message: "Enter your API key",
    });
    if (response.api) {
      await config.set("api", response.api);
      console.log(chalk.green("API key saved."));
    } else {
      console.log(chalk.red("API key undefined."));
    }
    process.exit(0);
  })();
} else if (options.fast) {
  // fast mode, only condition and temperature
  console.clear();
  if (argv.length > 1) {
    weather(argv.join(" "));
  } else {
    console.log(chalk.red("You need to specify a location."));
  }
} else {
  // prompt for location
  console.clear();
  if (argv.length > 0) {
    weatherprompt(argv.join(" "));
  } else {
    weatherprompt();
  }
}
