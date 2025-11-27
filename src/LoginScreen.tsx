import React, { useState } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin(); // notify parent
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col justify-center px-6 bg-stone-50">
      <h1 className="text-4xl font-bold mb-8 text-amber-900 text-center">
        Café Voltaire
      </h1>

      <input
        className="w-full p-3 mb-4 rounded-xl border border-gray-300"
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="w-full p-3 mb-4 rounded-xl border border-gray-300"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && (
        <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
      )}

      <button
        onClick={handleLogin}
        className="w-full bg-amber-900 text-white py-3 rounded-xl font-semibold hover:bg-amber-800"
      >
        Login
      </button>
    </div>
  );
};

export default LoginScreen;
