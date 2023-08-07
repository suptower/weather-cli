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
import { threeday, weather, weatherprompt } from "./weather.js";

// config handler
import { configHandler } from "./configHandler.js";

// cli options
import getopts from "getopts";

// filesystem
import { readFileSync } from "fs";

// gradient colors
import gradient from "gradient-string";

// read package.json
import { fileURLToPath } from "url";
import path, { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(path.join(__dirname, "../package.json"), "utf-8"));

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
      { title: "Night", value: "0" },
      { title: "Morning", value: "6" },
      { title: "Noon", value: "12" },
      { title: "Evening", value: "18" },
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
    three_day: "t",
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
        -h, --help              output usage information
        -v, --version           output the version number
        -a, --api               set api key
        -c, --config            show config
        -d, --delete_config     clear config
        -e, --env               set api key from environment variable API_KEY
        -f , --fast [loc]       fast mode, no prompt, location as arg
        -t, --three_day [loc]   show three day forecast
        -i, --info              show project related info

    Examples:
        $ weather Munich
        $ weather --api
        $ weather -v
        $ weather --config
        $ weather --info
        $ weather -f Munich
        $ weather -t Munich
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
    await configHandler();
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
} else if (options.three_day) {
  // three day forecast
  console.clear();
  if (argv.length > 1) {
    argv.shift();
    threeday(argv.join(" "));
  } else {
    console.log(chalk.red("You need to specify a location."));
  }
} else if (options.fast) {
  // fast mode, only condition and temperature
  console.clear();
  if (argv.length > 1) {
    argv.shift();
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
