import {  } from 'preact'
import { useRef, PropRef, useState, useEffect } from 'preact/hooks'
import { html } from 'htm/preact'

import { Menu, MenuProps } from './menu'

async function postData(url = '', data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return await response.json(); // parses JSON response into native JavaScript objects
  }
  

export function Content({ title, content }: { title: string, content: string }) {
    const editorRef: PropRef<HTMLDivElement|null> = useRef(null)
    const imgFileInput: PropRef<HTMLInputElement|null> = useRef(null)
    const [lastCaretPos, setLastCaretPos]  = useState<{ offset: number, textNode: Node|null }>({ offset: 0, textNode: null })

    useEffect(() => {
        if (editorRef.current) editorRef.current.innerHTML = content
    }, [content, editorRef])

    function storeCaretPos(e: MouseEvent) {
        let range
        let textNode
        let offset

        if (document.caretPositionFromPoint) {
            range = document.caretPositionFromPoint(e.clientX, e.clientY)
            textNode = range?.offsetNode
            offset = range?.offset    
        } else if (document.caretRangeFromPoint) {
            range = document.caretRangeFromPoint(e.clientX, e.clientY)
            textNode = range.startContainer
            offset = range.startOffset
        }

        if (textNode && offset !== undefined) {
            setLastCaretPos({ offset, textNode })
        }

    }

    function insertImage(dataURL: string) {
        var textNode = lastCaretPos.textNode
        var editor = editorRef.current
        if (!textNode || !editor) return

        editor.focus()

        var range = document.createRange()
        range.setStart(textNode, lastCaretPos.offset)
        range.setEnd(textNode, lastCaretPos.offset)
        var sel = window.getSelection()
        if (!sel) return
        sel.removeAllRanges()
        sel.addRange(range)

        let img = document.createElement('img')
        img.src = dataURL
        img.onload = () => { img.height = img.height - img.height % 30 - 7 }
        
        if (textNode.nodeType == Node.TEXT_NODE && textNode instanceof Text){
            let replacement = textNode.splitText(lastCaretPos.offset)
            // img.style.float = 'left'
            textNode.parentNode?.insertBefore(img, replacement)
        } else {
            // img.style.float = 'left'
            if (textNode.childNodes.length === 1 && textNode.firstChild) {
                textNode.removeChild(textNode.firstChild)
                textNode.appendChild(img)
            } else {
                textNode.appendChild(img)
            }
        }
    }

    function openFile(ev: Event) {
        var input = ev.target as HTMLInputElement
        if (!input.files) return

        var reader = new FileReader();
        reader.onload = () => {
            var dataURL = reader.result
            if(dataURL && typeof dataURL === 'string') insertImage(dataURL)
        }
        reader.readAsDataURL(input.files[0]);
    }
          
    let options: MenuProps["options"] = [
        {
            content: 'Insert Image',
            callback: () => {
                if (!imgFileInput.current) return
                imgFileInput.current.click()
            }
        }
    ]

    setInterval(() => {
        if (!editorRef.current) return
        console.log({ title, content: editorRef.current.innerHTML })
        postData('/api/update_note', { title, content: editorRef.current.innerHTML })
    }, 5000)

    return html`
        ${Menu({ parentRef: editorRef, options, onopen: storeCaretPos })}
        <input ref=${imgFileInput} type="file" style="position: fixed; top: -100em" onchange="${openFile}"/>
        <div contenteditable class="content" ref=${editorRef} spellcheck="false" oninput="${console.log('asd')}"></div>
    `
}