
import {Manager} from './Manager.js'     
import * as brainsatplay from '../../../libraries/js/brainsatplay'

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
			{id:'brainstormInterface', class: brainsatplay.plugins.interfaces.UI}
		],
		"edges": [{
			source: 'manager:element',
			target: 'brainstormInterface:content'
		}]
	}
};