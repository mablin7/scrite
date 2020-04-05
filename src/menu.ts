import { RefObject, VNode } from 'preact'
import { useRef, useState, useEffect } from 'preact/hooks'
import { html } from 'htm/preact'

export interface MenuProps {
    parentRef: RefObject<HTMLElement>
    options: { content: string|VNode<{}>, callback: (() => void) | ((ev: MouseEvent) => void) }[],
    onopen?: (ev: MouseEvent) => void,
}

export function Menu({ parentRef, options, onopen }: MenuProps) {
    const [isVisible, setVisible] = useState(false)
    const [position, setPosition] = useState({ left: 0, top: 0 })

    function onContextMenu(ev: MouseEvent) {
        ev.preventDefault()
        setPosition({ left: ev.pageX, top: ev.pageY })
        if (onopen) onopen(ev)
        setVisible(true)
    }

    function onClick() {
        setVisible(false)
    }

    useEffect(() => {
        if (parentRef.current) {
            parentRef.current.addEventListener('contextmenu', onContextMenu)
            window.addEventListener('click', onClick)

            return () => {
                if (parentRef.current) parentRef.current.removeEventListener('contextmenu', onContextMenu)
                window.removeEventListener('click', onClick)
            }
        }
    }, [parentRef.current])

    return html`
        <div 
            class="menu" 
            style="display:${isVisible ? 'block' : 'none'};top:${position.top}px;left:${position.left}px;"
        >
            <ul class="menu-options">
                ${options.map(({ content, callback }) => html`<li class="menu-option" onclick=${callback}>${content}</li>`)}
            </ul>
        </div>
    `
}