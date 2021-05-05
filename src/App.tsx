import styled from "styled-components";

const AppContainer = styled.div`
  padding: 1em;
  text-align: center;
`;

const Input = styled.input`
  width: 100%;
  font-size: 1.25em;
  border-radius: 8px;
`;

const Button = styled.button`
  border: none;
`;

const Row = styled.div`
  display: flex;
`;

function App() {
  return (
    <AppContainer className="App">
      <div>
        <h1>🧵 InstaThread</h1>
        <h2>Unroll threaded Tweets into a digestible reader.</h2>
      </div>
      <form name="tweet">
        <Row>
          <Input type="text" placeholder="🧵 Paste a threaded tweet.." />
          <Button>Unroll</Button>
        </Row>
      </form>
    </AppContainer>
  );
}

export default App;
