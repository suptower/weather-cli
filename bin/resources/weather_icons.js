// fs
import { readFileSync } from "fs";

import chalk from "chalk";

import path, { dirname } from "path";
import { fileURLToPath } from "url";

// convert 256 ascii terminal colors to rgb
const COLOR_33 = chalk.rgb(0, 135, 255); // DodgerBlue1
const COLOR_111 = chalk.rgb(135, 175, 255); // SkyBlue2
const COLOR_226 = chalk.rgb(255, 255, 0); // Yellow1
const COLOR_228 = chalk.rgb(255, 255, 135); // Khaki1
const COLOR_244 = chalk.rgb(128, 128, 128); // Grey50
const COLOR_250 = chalk.rgb(188, 188, 188); // Grey74
const COLOR_251 = chalk.rgb(198, 198, 198); // Grey78
const COLOR_255 = chalk.rgb(238, 238, 238); // Grey93

// get weather conditions

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// const packageJson = JSON.parse(readFileSync(path.join(__dirname, "../package.json"), "utf-8"));
const conditions = JSON.parse(readFileSync(path.join(__dirname, "./weather_conditions.json"), "utf-8"));

const conditionsArray = Object.entries(conditions);

const weatherConditions = conditionsArray[0][1];

// Condition Names for Icons
const conditionNames = {
  Cloudy: "Cloudy",
  Fog: "Fog",
  HeavyRain: "HeavyRain",
  HeavyShowers: "HeavyShowers",
  HeavySnow: "HeavySnow",
  HeavySnowShowers: "HeavySnowShowers",
  LightRain: "LightRain",
  LightShowers: "LightShowers",
  LightSleet: "LightSleet",
  LightSleetShowers: "LightSleetShowers",
  LightSnow: "LightSnow",
  LightSnowShowers: "LightSnowShowers",
  PartlyCloudy: "PartlyCloudy",
  Sunny: "Sunny",
  ThunderyHeavyRain: "ThunderyHeavyRain",
  ThunderyShowers: "ThunderyShowers",
  ThunderySnowShowers: "ThunderySnowShowers",
  VeryCloudy: "VeryCloudy",
};

const conditionIcons = {
  Cloudy: COLOR_250("     .--.    \n  .-(    ).  \n (___.__)__) \n             \n             "),
  Fog: COLOR_251(" _ - _ - _ - \n  _ - _ - _  \n _ - _ - _ - \n             \n             "),
  HeavyRain: COLOR_244("     .-.     \n    (   ).   \n   (___(__)  \n") + COLOR_33("  ‚ʻ‚ʻ‚ʻ‚ʻ   \n  ‚ʻ‚ʻ‚ʻ‚ʻ   "),
  HeavyShowers:
    COLOR_226(' _`/""') +
    COLOR_244(".-.    \n") +
    COLOR_226("  ,\\_") +
    COLOR_244("(   ).  ") +
    COLOR_226("\n   /") +
    COLOR_244("(___(__) \n") +
    COLOR_33("   ‚ʻ‚ʻ‚ʻ‚ʻ  \n   ‚ʻ‚ʻ‚ʻ‚ʻ  "),
  HeavySnow: COLOR_244("     .-.     \n    (   ).   \n   (___(__)  ") + COLOR_255("\n   * * * *   \n  * * * *    "),
  HeavySnowShowers:
    COLOR_226(' _`/""') +
    COLOR_244(".-.    \n") +
    COLOR_226("  ,\\_") +
    COLOR_244("(   ).  \n") +
    COLOR_226("   /") +
    COLOR_244("(___(__) ") +
    COLOR_255("\n    * * * *  \n   * * * *   "),
  LightRain: COLOR_250("     .-.     \n    (   ).   \n   (___(__)  ") + COLOR_111("\n   ʻ ʻ ʻ ʻ   \n  ʻ ʻ ʻ ʻ    "),
  LightShowers:
    COLOR_226(' _`/""') +
    COLOR_250(".-.    \n") +
    COLOR_226("  ,\\") +
    COLOR_250("_(   ).  \n") +
    COLOR_226("   /") +
    COLOR_250("(___(__) \n") +
    COLOR_111("    ʻ ʻ ʻ ʻ \n   ʻ ʻ ʻ ʻ  "),
  LightSleet:
    COLOR_250("     .-.     \n    (   ).   \n   (___(__)  \n") +
    COLOR_111("   ʻ ") +
    COLOR_255("* ") +
    COLOR_111("ʻ ") +
    COLOR_255("*  \n  * ") +
    COLOR_111("ʻ ") +
    COLOR_255("* ") +
    COLOR_111("ʻ   "),
  LightSleetShowers:
    COLOR_226(' _`/""') +
    COLOR_250(".-.    \n") +
    COLOR_226("  ,\\_") +
    COLOR_250("(   ).  \n") +
    COLOR_226("   /") +
    COLOR_250("(___(__) \n") +
    COLOR_111("    ʻ") +
    COLOR_255(" *") +
    COLOR_111(" ʻ ") +
    COLOR_255("* \n   *") +
    COLOR_111(" ʻ ") +
    COLOR_255("* ") +
    COLOR_111("ʻ  "),
  LightSnow: COLOR_250("     .-.     \n    (   ).   \n   (___(__)  \n") + COLOR_255("    *  *  *  \n   *  *  *   "),
  LightSnowShowers:
    COLOR_226(' _`/""') +
    COLOR_250(".-.    \n") +
    COLOR_226("  ,\\_") +
    COLOR_250("(   ).  \n") +
    COLOR_226("   /") +
    COLOR_250("(___(__) \n") +
    COLOR_255("    *  *  * \n   *  *  *  "),
  PartlyCloudy:
    COLOR_226("   \\__/      \n __/  ") +
    COLOR_250(".-.    \n") +
    COLOR_226("   \\_") +
    COLOR_250("(   ).  \n") +
    COLOR_226("   /") +
    COLOR_250("(___(__) \n             "),
  Sunny: COLOR_226("    \\   /    \n     .-.     \n  ‒ (   ) ‒  \n     `-᾿     \n    /   \\    "),
  ThunderyHeavyRain:
    COLOR_244("     .-.     \n    (   ).   \n   (___(__)  \n") +
    COLOR_33("  ‚ʻ") +
    COLOR_228("⚡") +
    COLOR_33("ʻ‚") +
    COLOR_228("⚡") +
    COLOR_33("‚ʻ   \n  ‚ʻ‚ʻ") +
    COLOR_228("⚡") +
    COLOR_33("ʻ‚ʻ   "),
  ThunderyShowers:
    COLOR_226(' _`/""') +
    COLOR_250(".-.    \n") +
    COLOR_226("  ,\\_") +
    COLOR_250("(   ).  \n") +
    COLOR_226("   /") +
    COLOR_250("(___(__) \n") +
    COLOR_228("    ⚡") +
    COLOR_111("ʻ ʻ") +
    COLOR_228("⚡") +
    COLOR_111("ʻ  \n    ʻ ʻ ʻ ʻ  "),
  ThunderySnowShowers:
    COLOR_226(' _`/""') +
    COLOR_250(".-.    \n") +
    COLOR_226("  ,\\_") +
    COLOR_250("(   ).  \n") +
    COLOR_226("   /") +
    COLOR_250("(___(__) \n") +
    COLOR_255("    *  *  * \n   *  *  *  "),
  VeryCloudy: COLOR_250("             \n     .--.    \n  .-(    ).  \n (___.__)__) ") + COLOR_111("\n             "),
};

export function getIcon(iconCode) {
  for (let i = 0; i < weatherConditions.length; i++) {
    if (weatherConditions[i].code === iconCode) {
      return drawIcon(weatherConditions[i].iconCondition);
    }
  }
}

function drawIcon(iconCondition) {
  switch (iconCondition) {
    case conditionNames.Cloudy:
      return conditionIcons.Cloudy;
    case conditionNames.Fog:
      return conditionIcons.Fog;
    case conditionNames.HeavyRain:
      return conditionIcons.HeavyRain;
    case conditionNames.HeavyShowers:
      return conditionIcons.HeavyShowers;
    case conditionNames.HeavySnow:
      return conditionIcons.HeavySnow;
    case conditionNames.HeavySnowShowers:
      return conditionIcons.HeavySnowShowers;
    case conditionNames.LightRain:
      return conditionIcons.LightRain;
    case conditionNames.LightShowers:
      return conditionIcons.LightShowers;
    case conditionNames.LightSleet:
      return conditionIcons.LightSleet;
    case conditionNames.LightSleetShowers:
      return conditionIcons.LightSleetShowers;
    case conditionNames.LightSnow:
      return conditionIcons.LightSnow;
    case conditionNames.LightSnowShowers:
      return conditionIcons.LightSnowShowers;
    case conditionNames.PartlyCloudy:
      return conditionIcons.PartlyCloudy;
    case conditionNames.Sunny:
      return conditionIcons.Sunny;
    case conditionNames.ThunderyHeavyRain:
      return conditionIcons.ThunderyHeavyRain;
    case conditionNames.ThunderyShowers:
      return conditionIcons.ThunderyShowers;
    case conditionNames.ThunderySnowShowers:
      return conditionIcons.ThunderySnowShowers;
    case conditionNames.VeryCloudy:
      return conditionIcons.VeryCloudy;
    default:
      return conditionIcons.Sunny;
  }
}