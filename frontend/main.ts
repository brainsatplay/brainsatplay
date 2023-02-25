
// ------------------------------ Tauri API Demo ------------------------------
// import { invoke } from "@tauri-apps/api/tauri";

// let greetInputEl: HTMLInputElement | null;
// let greetMsgEl: HTMLElement | null;

// async function greet() {
//   if (greetMsgEl && greetInputEl) {
//     // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
//     greetMsgEl.textContent = await invoke("greet", {
//       name: greetInputEl.value,
//     });
//   }
// }

// window.addEventListener("DOMContentLoaded", () => {
//   greetInputEl = document.querySelector("#greet-input");
//   greetMsgEl = document.querySelector("#greet-msg");
//   document
//     .querySelector("#greet-button")
//     ?.addEventListener("click", () => greet());
// });

import { Graph, wchtmlloader } from 'graphscript'
import * as braintroller from './braintroller'

const button = {
  __element: 'button',
  innerText: 'Workspace',
}

const addWorkspace = (name: string) => {
  graph.add({
    ...button, 
    className: 'item',
    innerText: name, 
    onclick: () => {
        const header = document.querySelector('#editor h1') as HTMLElement
        const workspaces = document.querySelector('#workspaces')  as HTMLElement
        const editor  = document.querySelector('#editor')  as HTMLElement
        if (workspaces) workspaces.style.display = 'none'
        if (editor) editor.style.display = 'block'
        if (header) header.innerText = name
        
    }
  }, graph.get('workspaces.list'))
}

let roots = {

  workspaces: {
    __element: 'div',
    className: 'container',
    __children: {
      header: {
        __element: 'h1',
        innerText: 'Welcome to Brains@Play'
      },
      list: {
        __element: 'div',
        className: 'row',
        __children: {
          addWorkspace: {
            ...button,
            className: 'item',
            innerText: 'Add a workspace',
            onclick: () => addWorkspace('My Workspace')
          }
        }
      }
    }
  },

  editor: {
    __element: 'div',
    className: 'container',
    style: {
      display: 'none',
      position: 'relative'
    },
    __children: {
      header: {
        __element: 'h1',
        innerText: 'Editor'
      },
      back: {
        ...button,
        innerText: 'Back',
        style: {
          position: 'absolute',
          top: '0',
          right: '0'
        },
        onclick: () => {
          const workspaces = document.querySelector('#workspaces') as HTMLElement
          const editor  = document.querySelector('#editor') as HTMLElement
          if (workspaces) workspaces.style.display = 'block'
          if (editor) editor.style.display = 'none'
        }
      }
    }
  }
}

let graph = new Graph({
    roots,
    loaders:{
        wchtmlloader
    }
})

// Setup Braintroller

const localIp = 'localhost'

const add = document.querySelector('#add') as HTMLButtonElement
const input = document.querySelector('#newIp') as HTMLInputElement
const select = document.querySelector('select') as HTMLSelectElement
const connect = document.querySelector('#connect') as HTMLButtonElement
const commands = document.querySelector('#commands') as HTMLDivElement
const mirror = document.querySelector('#mirror') as HTMLInputElement
const mirrorOption = document.querySelector('#mirrorOption') as HTMLDivElement

const getIps = () => {
    const item = localStorage.getItem('braintroller-ips')
    return new Set(item ? JSON.parse(item) : [localIp])
}

const ips = getIps() as Set<string>

let selectedComputer: string = localIp

const addOption = (ip: string) => {
    let option = document.createElement('option');
    option.value = ip;
    option.innerHTML = ip;
    select.appendChild(option);
    return option
}

ips.forEach(addOption)

// Track selected computer
select.onchange = () => {
    selectedComputer = select.value
    if (selectedComputer === localIp) mirrorOption.style.display = 'none'
    else mirrorOption.style.display = 'block'
}

(select as any).onchange()


// Allow for adding new IP addresses
add.onclick = () =>{
    if (!input.value.includes('.')) return
    const option = addOption(input.value)
    option.selected = true
    selectedComputer = input.value
    ips.add(input.value)
    const array = Array.from(ips)
    localStorage.setItem('braintroller-ips', JSON.stringify(array))
}

const client = new braintroller.Client()

client.onopen = () => {
    connect.blur()
    connect.innerText = 'Disconnect'
    
    braintroller.allKeys.forEach(k => {
        const button = document.createElement('button')
        button.innerText = k
        if (client.validMessages.includes(k)) button.addEventListener('click', () => client.send('key', k)) 
        else button.disabled = true

        commands.appendChild(button)
    })
}

client.onclose = () => {
    console.error('Connection closed')
    Array.from(commands.children).forEach(c => c.remove())
    connect.innerText = 'Connect'
}

connect.onclick = () => {
    if (client.status === 'disconnected') client.connect(selectedComputer ?? select.value)
    else client.disconnect()
}



window.onkeypress = (ev) => {
    if (
        mirror.checked // Mirror is enabled
        && client.status === 'connected' // Connection is established
        && client.host !== localIp // Not running locally (infinite loop)
    ) client.send('key', ev.key)
}
