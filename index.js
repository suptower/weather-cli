#!/usr/bin/env node --no-warnings
process.removeAllListeners('warning')
import 'dotenv/config'
import Conf from 'conf'
import chalk from 'chalk'
import prompts from 'prompts'
import { weather, weatherprompt } from './weather.js'
import getopts from 'getopts'
import packageJson from './package.json' assert { type: "json" }

const config = new Conf({projectName: 'weather-cli'})
const argv = process.argv.slice(2)

if (process.env.API_KEY) {
    config.set('api', process.env.API_KEY)
}

const options = getopts(argv, {
    alias: {
        help: 'h',
        version: 'v',
        api: 'a',
        prompt: 'p'
    }
})

if (options.help) {
    console.log(`
    Usage: 
        $ weather [options]
        $ weather [location]

    Options:
        -h, --help          output usage information
        -v, --version       output the version number
        -a, --api           set api key
        -p, --prompt        prompt menu for detailed weather

    Examples:
        $ weather Munich
        $ weather --api
        $ weather -v
    `)
    process.exit(0)
}

if (options.version) {
    console.log('v' + packageJson.version)
    process.exit(0)
}

if (options.api) {
    (async () => {
        const response = await prompts({
            type: 'text',
            name: 'api',
            message: 'Enter your API key'
        })
        if (response.api) {
            await config.set('api', response.api)
            console.log(chalk.green('API key saved.'))
        } else {
            console.log(chalk.red('API key undefined.'))
        }
        process.exit(0)
    })()
}

if (options.prompt) {
    weatherprompt()
} else {
    if (argv.length === 0) {
        console.log(chalk.red('Error: No location specified.'))
        process.exit(1)
    }
    const location = argv.join(' ')
    weather(location)
}

