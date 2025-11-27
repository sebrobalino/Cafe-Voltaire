import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import LoginScreen from "./LoginScreen";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

const Root = () => {
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setLoggedIn(!!user);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  return loggedIn ? (
    <App />
  ) : (
    <LoginScreen onLogin={() => setLoggedIn(true)} />
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(<Root />);
