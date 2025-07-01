import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

export default function LoginPage() {
  const handleSuccess = async (credentialResponse: any) => {
    const credential = credentialResponse.credential;
    try {
      const res = await axios.post('http://localhost:3000/api/users/google-login', { credential });
      alert(res.data.message);
      console.log("Login success",res)
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  return (
    <div>
      <h1>Login Page</h1>
      <GoogleLogin onSuccess={handleSuccess} onError={() => alert("Google login failed")} />
    </div>
  );
}
