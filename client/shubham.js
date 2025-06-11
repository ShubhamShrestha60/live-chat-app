import React from 'react';
import ReactDOM from 'react-dom';

function Counter() {
    const [count, setCount] = React.useState(0);
    return (
        <>
            <h2>Count: {count}</h2>
            <button onClick={() => setCount(count + 1)}>+</button>
            <button onClick={() => setCount(count - 1)}>-</button>
        </>
    );
}

ReactDOM.render(<Counter />, document.getElementById('root'));