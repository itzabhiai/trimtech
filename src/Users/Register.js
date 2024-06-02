import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { auth, textdb } from '.././firebaseConfig';
import { collection, doc, setDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Register.css';

const Register = () => {
    const [values, setValues] = useState({
        name: '',
        email: '',
        mobile: '',
        password: '',
        role: 'user', // Default role is 'user'
    });

    const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);

    const handleSubmission = async () => {
        setSubmitButtonDisabled(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;

            await sendEmailVerification(user);

            await updateProfile(user, {
                displayName: values.name,
            });

            const usersCollection = collection(textdb, 'users');
            const newUserDoc = doc(usersCollection, user.uid);

            // Add user details including join timestamp and selected role
            await setDoc(newUserDoc, {
                name: values.name,
                email: values.email,
                role: values.role, // Set the selected role
                joinTimestamp: new Date().getTime(),
            });

            setSubmitButtonDisabled(false);
            toast.success('Registration successful! Please verify your email.');
        } catch (err) {
            console.error(err.code, err.message);
            setSubmitButtonDisabled(false);
            toast.error(err.message);
        }
    };

    return (
        <div className="auth-container">
            <h2>Simple Register</h2>
            <label>Full Name:</label>
            <input type="text" value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} />
            <label>Email:</label>
            <input type="email" value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} />
            <label>Mobile:</label>
            <input type="text" value={values.mobile} onChange={(e) => setValues({ ...values, mobile: e.target.value })} />
            <label>Password:</label>
            <input type="password" value={values.password} onChange={(e) => setValues({ ...values, password: e.target.value })} />
            <label>Select Role:</label>
            <select value={values.role} onChange={(e) => setValues({ ...values, role: e.target.value })}>
                <option value="user">User</option>
                <option value="barber">Barber</option>
            </select>
            <button className='register-btn' onClick={handleSubmission} disabled={submitButtonDisabled}>
                {submitButtonDisabled ? 'Loading...' : 'Register'}
            </button>
            <ToastContainer />
        </div>
    );
};

export default Register;
