import chalk from "chalk";

import gradient from "gradient-string";

import terminalLink from "terminal-link";

console.log(gradient.pastel("Thank you for installing Weather CLI!\nTo start things off, you need to set your API key."));
const link = terminalLink("Weather API", "https://www.weatherapi.com/");
console.log(gradient.pastel("In order to retrieve your API key, you need to set up an account on " + link + " if not done already."));
console.log(gradient.pastel("Once you have your API key, run ") + chalk.green("weather --config") + gradient.mind(" and follow the instructions."));

console.log(chalk.cyan("You can always check the " + chalk.magenta.bgBlue("README.md") + " file for more information."));
const repository = terminalLink("GitHub repository", "https://www.github.com/suptower/weather-cli");
console.log(chalk.cyan("If you have any questions or suggestions, feel free to open an issue on the " + chalk.magenta(repository) + "."));