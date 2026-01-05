import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../services/firebase";
import * as firebase from "../services/firebase";


console.log("PROVIDER = ", provider);

console.log(firebase);

const Login = () => {

  const login = async () => {
    await signInWithPopup(auth, provider);
  };

  return (
    <button 
      onClick={login}
      style={{
        padding: "10px 16px",
        borderRadius: 10,
        border: "none",
        background: "#4285F4",
        color: "white",
        cursor: "pointer"
      }}
    >
      Login with Google
    </button>
  );
};

export default Login;
