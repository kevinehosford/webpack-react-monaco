import React from "react";
import { render } from "react-dom";

import MonacoEditor from './MonacoEditor';

class OtherEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        code: '// type your code...',
        };
    }
    render() {
        const code = this.state.code;
        const options = {
        selectOnLineNumbers: true,
        };

        return (
        <MonacoEditor width="800" height="600" language="javascript" theme="vs-dark" value={code} options={options} />
        );
    }
}

const App = () => (
  <div>
    <OtherEditor />
  </div>
);

render(<App />, document.getElementById("root"));