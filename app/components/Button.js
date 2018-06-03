console.info('Button file loaded.')
import React from 'react'

class Button extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			count: 1
		}
	}

	render() {
		return (
			<div>
        <button style={{ marginRight: '20px' }} onClick={() => this.setState({ count: this.state.count + 1 })}>Increment!</button>
        <button onClick={() => this.setState({ count: this.state.count - 1 })}>Decrement!</button>
				<h3 style={{ padding: '10px' }}>{this.state.count}</h3>
      </div>
		)
	}
}

export default Button