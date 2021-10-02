
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
		"development": false
	},
	"intro": {
		"title": false,
		"mode": "multi",
		"login": 'guest',
		// "domain": null,
		"session": null,
		"spectating": false
	},
	"graph": {
		"nodes": [
			{id:'manager', class: Manager},
			{id:'ui', class: brainsatplay.plugins.interfaces.UI}
		],
		"edges": [{
			source: 'manager:element',
			target: 'ui:content'
		}]
	}
};