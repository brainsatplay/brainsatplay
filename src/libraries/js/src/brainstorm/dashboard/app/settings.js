
import {Manager} from './Manager.js'     

export const settings = {
	"name": "My Project",
	"devices": [
		"EEG",
		"HEG"
	],
	"author": "",
	"description": "",
	"categories": [
		"WIP"
	],
	"instructions": "",
	"display": {
		"production": false,
		"development": false
	},
	"intro": {
		"title": false,
		"mode": "solo",
		"login": null,
		"domain": null,
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
	},
	"image": null,
	"version": "experimental",
	"connect": true
};