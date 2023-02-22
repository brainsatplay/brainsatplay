
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
