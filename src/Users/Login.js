import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, textdb } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import './Login.css';
import { Helmet } from 'react-helmet';

const Login = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    email: '',
    pass: '',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);

  const handleSubmission = async () => {
    if (!values.email || !values.pass) {
      setErrorMsg('Fill all fields');
      return;
    }
    setErrorMsg('');
    setSubmitButtonDisabled(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.pass);
      const user = userCredential.user;

      // Fetch the user's role from Firestore
      const userDoc = await getDoc(doc(textdb, 'users', user.uid));
      if (userDoc.exists()) {
        const role = userDoc.data().role;

        // Save user information in local storage
        localStorage.setItem('userEmail', values.email);
        localStorage.setItem('userRole', role);
        localStorage.setItem('isLoggedIn', true);

        if (role === 'barber') {
          navigate('/create-profile');
        } else {
          navigate('/');
        }
      } else {
        setErrorMsg('User document not found');
      }
    } catch (err) {
      setSubmitButtonDisabled(false);
      setErrorMsg(err.message);
      console.error('Sign-in error:', err);
    }
  };

  return (
    <div className="logmain">
      <Helmet>
        <meta charSet="utf-8" />
        <title>Login</title>
        <meta name="description" content="Login" />
      </Helmet>
      <div className="auth-container">
        <h2>Login</h2>
        {errorMsg && <p className="error">{errorMsg}</p>}
        <label>Email:</label>
        <input
          type="email"
          value={values.email}
          onChange={(e) => setValues({ ...values, email: e.target.value })}
        />
        <label>Password:</label>
        <input
          type="password"
          value={values.pass}
          onChange={(e) => setValues({ ...values, pass: e.target.value })}
        />
        <button className='login-btn' onClick={handleSubmission} disabled={submitButtonDisabled}>
          {submitButtonDisabled ? 'Loading...' : 'Login'}
        </button>
        <p className='forgotpass'>
          <b>Forgot Password?</b>
        </p>
        <p className='linkk'>
          Don't have an account? <Link to="/register">Click here to Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
