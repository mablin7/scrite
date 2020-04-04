import { render } from 'preact'
import { html } from 'htm/preact'

render(html`
    <h1 id=hello>Hello</h1>
    <div class=world>World!</div>
`, document.getElementById('app'))
