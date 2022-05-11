
//alert('Hello World!');

import * as components from '../../components'
console.log('window.components:', components);


let elm = document.createElement('div');
elm.innerHTML = 'Hello World!';
elm.style.height = '500px';
elm.style.width = '500px';
document.body.appendChild(elm);

//console.log('custom element:', elm, elm.__proto__);



