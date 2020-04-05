import { render, RefObject } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import { html } from 'htm/preact'

import { Content } from './content'


function HorLine({ lineHeight, idx }: { lineHeight: number, idx: number }) {
    const elem: RefObject<HTMLDivElement> = useRef(null)
    const pos = lineHeight * idx
    let offset = window.scrollY % lineHeight

    let ticking = false
    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                offset = window.scrollY % lineHeight
                if (elem.current) elem.current.style.top = `${pos-offset}px`
                ticking = false
            })
            ticking = true
        }
    }

    useEffect(() => {
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return html`
        <div ref=${elem} class="hor-line" style="top:${pos + offset}px;"></div>
    `
}

function App() {
    const lineHeight = 30
    const [numLines, setNumLines] = useState(Math.floor(window.innerHeight / lineHeight))
    const [title, setTitle] = useState('')
    const [cont, setCont] = useState('')

    if (title === '') {
        let pathArray = window.location.search.replace('?', '')
        fetch(`/api/checkout_note?title=${pathArray}`)
        .then(res => res.json())
        .then(({title: n, content}) => {
            setTitle(n)
            setCont(content)
        })
    }

    function onResize() {
        setNumLines(Math.floor(window.innerHeight / lineHeight))
    }
    useEffect(() => {
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    let lines: ReturnType<typeof HorLine>[] = []
    for (let idx = 1; idx <= numLines; idx++) {
        lines.push(HorLine({ lineHeight, idx }))
    }

    return html`
        <div class="main">
            ${title === '' ? '' : Content({title, content: cont})}
            

            <div class="bg">
                ${lines}
                <div class="vert-line"></div>
            </div>
        </div>
    `
}

const appRoot = document.getElementById('app')
if (appRoot) render(html`<${App}/>`, appRoot)
