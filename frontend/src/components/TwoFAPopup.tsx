import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

interface TwoFAPopupProps {
  userEmail?: string;
}

const TwoFAPopup: React.FC<TwoFAPopupProps> = ({ userEmail }) => {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [showPasswordInput, setShowPasswordInput] = useState<boolean>(false);
  const [showOtpInput, setShowOtpInput] = useState<boolean>(false);
  
  // Define the API base URL
  const API_BASE_URL = 'http://localhost:4000';

  useEffect(() => {
    // Check initial 2FA status
    if (userEmail) {
      check2FAStatus();
    } else {
      console.error('User email is undefined');
    }
  }, [userEmail]);

  const check2FAStatus = async () => {
    if (!userEmail) {
      console.error('Cannot check 2FA status: user email is undefined');
      return;
    }

    try {
      setLoading(true);
      console.log('Checking 2FA status for email:', userEmail);
      const response = await axios.get(`${API_BASE_URL}/auth/2fa-status`, {
        params: { email: userEmail }
      });
      setIsEnabled(response.data.enabled);
      return response.data.enabled;
    } catch (error) {
      console.error('Error checking 2FA status:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    if (!userEmail) {
      console.error('Cannot enable 2FA: user email is undefined');
      return;
    }

    if (!password) {
      setShowPasswordInput(true);
      return;
    }

    try {
      setLoading(true);
      console.log('Requesting 2FA setup for email:', userEmail);
      await axios.post(`${API_BASE_URL}/auth/enable-2fa`, {
        email: userEmail,
        password: password
      });
      setShowPasswordInput(false);
      setPassword('');
      setShowOtpInput(true);
      Swal.fire({
        icon: 'success',
        title: 'OTP has been sent to your email.',
        text:' Please enter it to complete 2FA setup. ',
        confirmButtonText: 'OK',
      });
      
    } catch (error) {
      console.error('Error requesting 2FA setup:', error);
      alert('Failed to request 2FA setup. Please check your password and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!userEmail) {
      console.error('Cannot verify OTP: user email is undefined');
      return;
    }

    if (!otp) {
      //alert('Please enter the OTP sent to your email');
      Swal.fire({
        icon: 'warning',
        title: 'Otp required',
        text:' Please enter the OTP sent to your email',
        confirmButtonText: 'OK',
      });
      return;
    }

    try {
      setLoading(true);
      console.log('Verifying 2FA setup with OTP');
      await axios.post(`${API_BASE_URL}/auth/verify-2fa-setup`, {
        email: userEmail,
        otp: otp
      });
      setShowOtpInput(false);
      setOtp('');
      // After enabling, check the status again
      await check2FAStatus();
      //alert('2FA has been successfully enabled!');
      Swal.fire({
        icon: 'success',
        title: '  2FA enabled successfully!',
        confirmButtonText: 'OK',
      });
      
    } catch (error) {
      console.error('Error verifying 2FA setup:', error);
      //alert('Failed to verify 2FA setup. Please check your OTP and try again.');
      Swal.fire({
        icon: 'error',
        title: '  2FA setup failed',
        text:'Please check your OTP and try again',
        confirmButtonText: 'OK',
      });

    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!userEmail) {
      console.error('Cannot disable 2FA: user email is undefined');
      return;
    }

    try {
      setLoading(true);
      console.log('Disabling 2FA for email:', userEmail);
      
      // First check if 2FA is actually enabled
      const is2FAEnabled = await check2FAStatus();
      
      if (!is2FAEnabled) {
        //alert('2FA is already disabled.');
        Swal.fire({
          icon: 'info',
          title: '  2FA already disabled',
          confirmButtonText: 'OK',
        });
        return;
      }
      
      // Try to disable 2FA
      try {
        await axios.post(`${API_BASE_URL}/auth/disable-2fa`, {
          email: userEmail
        });
        //alert('2FA has been successfully disabled!');
        Swal.fire({
          icon: 'success',
          title: '  2FA disabled successfully!',
          confirmButtonText: 'OK',
        });
      } catch (disableError) {
        console.error('Error from disable API:', disableError);
        
        // Even if there's an error, check the actual 2FA status
        const currentStatus = await check2FAStatus();
        
        // If 2FA is actually disabled despite the error, show success message
        if (!currentStatus) {
          //alert('2FA has been successfully disabled!');
          Swal.fire({
            icon: 'success',
            title: '  2FA disabled successfully!',
            confirmButtonText: 'OK',
          });
          return;
        }
        
        // If we get here, the disable operation really failed
        let errorMessage = 'Failed to disable 2FA. Please try again.';
        
        if (disableError && typeof disableError === 'object' && 'response' in disableError && 
            disableError.response && typeof disableError.response === 'object' && 'data' in disableError.response) {
          const responseData = disableError.response.data;
          if (responseData && typeof responseData === 'object' && 'message' in responseData) {
            errorMessage = responseData.message as string;
          }
          if (responseData && typeof responseData === 'object' && 'internal_message' in responseData) {
            console.error('Internal error:', responseData.internal_message);
          }
        }
        
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error in disable 2FA process:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {showOtpInput ? (
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP sent to your email"
            className="px-3 py-2 border rounded-md"
          />
          <button
            onClick={handleVerifyOtp}
            disabled={loading || !otp}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </div>
      ) : showPasswordInput ? (
        <div className="flex flex-col gap-2">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="px-3 py-2 border rounded-md"
          />
          <button
            onClick={handleEnable2FA}
            disabled={loading || !password}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Requesting...' : 'Enable 2FA'}
          </button>
        </div>
      ) : (
        <button
          onClick={isEnabled ? handleDisable2FA : () => setShowPasswordInput(true)}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Loading...' : isEnabled ? 'Disable 2FA' : 'Enable 2FA'}
        </button>
      )}
    </div>
  );
};

export default TwoFAPopup;
