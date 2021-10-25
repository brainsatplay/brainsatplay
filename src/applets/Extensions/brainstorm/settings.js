
import {Manager} from './Manager.js'     

export const settings = {
	"name": "Brainstorm",
	"devices": [],
	"author": "Garrett Flynn",
	"description": "Visualize the active users on the Brainstorm.",
	"categories": [
		"extension"
	],
	"instructions": "",
	"display": {
		"production": false,
		"development": false,
		"extensions": false
	},
	"intro": {
		"title": false,
		"mode": "multi",
		"login": false,
		// "domain": null,
		"session": true,
		"spectating": false
	},
	"graph": {
		"nodes": [
			{name:'manager', class: Manager},
			{name:'brainstormInterface', class: brainsatplay.plugins.interfaces.DOM}
		],
		"edges": [{
			source: 'manager:element',
			target: 'brainstormInterface:content'
		}]
	}
};