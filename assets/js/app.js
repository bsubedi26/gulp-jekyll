console.info("React app loaded! ", window)

class App extends React.Component {
	render() {
		return (
			<div>
        <h4>Hello world from assets/js/app.</h4>
      </div>
		)
	}
}

ReactDOM.render(<App />, document.getElementById("reactArea"));
