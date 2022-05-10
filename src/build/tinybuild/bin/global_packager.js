import { packager, defaultConfig } from "../packager.js";
//this file is used to run and watch command line stuff with just a local config file
//the packager will parse any command line arguments

packager(defaultConfig);