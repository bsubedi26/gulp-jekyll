import React from 'react'
import { render } from 'react-dom'
import Button from './components/Button'

console.info("React app loaded from Browserify!")

class App extends React.Component {
	render() {
		return (
			<div>
        <h4>Hello world from app/main.</h4>
				<Button />
      </div>
		)
	}
}

render(<App />, document.getElementById("reactArea"))
