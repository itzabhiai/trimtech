// Verify.js
import React from 'react';
import { auth } from '../../../firebaseConfig';

const Verify = () => {
  const handleResendVerification = () => {
    const user = auth.currentUser;
    user.sendEmailVerification()
      .then(() => {
        console.log('Email verification sent');
      })
      .catch(error => {
        console.error('Error sending email verification:', error);
      });
  };

  return (
    <div className="verify-container">
      <h2>Verify Your Email</h2>
      <p>
        A verification link has been sent to your email address. Please click the link to verify your account.
      </p>
      <p>
        If you haven't received the email, you can click the button below to resend the verification email.
      </p>
      <button onClick={handleResendVerification}>Resend Verification Email</button>
    </div>
  );
};

export default Verify;
