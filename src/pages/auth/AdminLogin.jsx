// import { useState, useContext } from "react";
// import { AuthContext } from "../../context/AuthContext";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// import logo from "../../assets/Logo_Transmogrify-removebg-preview.png";
// import illustration from "../../assets/mobile (2).jpeg";

// const AdminLogin = () => {
//   const [email, setEmail] = useState("");
//   const [step, setStep] = useState(1);
//   const [otp, setOtp] = useState(["", "", "", "", "", ""]);
//   const [loading, setLoading] = useState(false);

//   const { login } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const API_BASE = "https://be.shuttleapp.transev.site";

//   const handleVerify = async () => {
//     if (!email) return alert("Enter valid email");

//     try {
//       setLoading(true);
//       await axios.post(`${API_BASE}/auth/login/send-otp`, { email });
//       setStep(2);
//     } catch (err) {
//       alert(err.response?.data?.detail?.message || "Failed to send OTP");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBack = () => {
//     setStep(1);
//     setOtp(["", "", "", "", "", ""]);
//   };

//   const handleOtpChange = (value, index) => {
//     if (!/^[0-9]?$/.test(value)) return;

//     const newOtp = [...otp];
//     newOtp[index] = value;
//     setOtp(newOtp);

//     if (value && index < 5) {
//       document.getElementById(`otp-${index + 1}`).focus();
//     }
//   };

//   const handleKeyDown = (e, index) => {
//     if (e.key === "Backspace" && otp[index] === "" && index > 0) {
//       document.getElementById(`otp-${index - 1}`).focus();
//     }
//   };

//   const handleLogin = async () => {
//     const finalOtp = otp.join("");
//     if (finalOtp.length !== 6) return alert("Enter valid OTP");

//     try {
//       setLoading(true);

//       const res = await axios.post(`${API_BASE}/auth/login`, {
//         email,
//         otp: finalOtp,
//       });

//       const token = res.data.access_token;

//       localStorage.setItem("access_token", token);
//       localStorage.setItem("user", JSON.stringify(res.data.user));

//       login({
//         accessToken: token,
//         user: res.data.user,
//       });

//       navigate("/admin/dashboard");
//     } catch (err) {
//       alert(err.response?.data?.detail?.message || "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4">
      
//       <div className="w-full max-w-5xl flex rounded-2xl overflow-hidden shadow-xl bg-white">

//         {/* LEFT SIDE */}
//         <div className="hidden md:flex w-1/2 bg-black text-white flex-col justify-center items-center p-10">
//           <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
//           <img
//             src={illustration}
//             alt="visual"
//             className="rounded-xl shadow-lg"
//           />
//         </div>

//         {/* RIGHT SIDE */}
//         <div className="w-full md:w-1/2 p-10">
//           <img src={logo} alt="logo" className="w-28 mb-6" />

//           <h2 className="text-2xl font-semibold mb-2">Welcome Back 👋</h2>
//           <p className="text-gray-500 mb-6 text-sm">
//             Sign in to continue to your admin panel
//           </p>

//           {/* STEP 1 */}
//           {step === 1 && (
//             <>
//               <input
//                 type="email"
//                 placeholder="Enter your email"
//                 className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-black"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//               />

//               <button
//                 onClick={handleVerify}
//                 disabled={loading}
//                 className="w-full bg-black text-white p-3 rounded-lg hover:opacity-90 transition-all"
//               >
//                 {loading ? "Sending OTP..." : "Continue"}
//               </button>
//             </>
//           )}

//           {/* STEP 2 */}
//           {step === 2 && (
//             <>
//               <p className="text-sm text-gray-500 mb-4">
//                 Enter the 6-digit OTP sent to your email
//               </p>

//               <div className="flex gap-3 justify-between mb-5">
//                 {otp.map((digit, index) => (
//                   <input
//                     key={index}
//                     id={`otp-${index}`}
//                     type="text"
//                     maxLength="1"
//                     value={digit}
//                     onChange={(e) =>
//                       handleOtpChange(e.target.value, index)
//                     }
//                     onKeyDown={(e) => handleKeyDown(e, index)}
//                     className="w-12 h-12 border border-gray-300 rounded-lg text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-black"
//                   />
//                 ))}
//               </div>

//               <button
//                 onClick={handleLogin}
//                 disabled={loading}
//                 className="w-full bg-black text-white p-3 rounded-lg hover:opacity-90 transition-all"
//               >
//                 {loading ? "Logging in..." : "Login"}
//               </button>

//               <button
//                 onClick={handleBack}
//                 className="mt-4 text-sm text-gray-500 hover:text-black"
//               >
//                 ← Change Email
//               </button>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminLogin;

import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

import logo from "../../assets/Logo_Transmogrify-removebg-preview.png";
import illustration from "../../assets/mobile (2).jpeg";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const API_BASE = "https://be.shuttleapp.transev.site";

  // Helper function to show error
  const showErrorAlert = (message) => {
    setErrorMessage(message);
    setShowError(true);
    setTimeout(() => {
      setShowError(false);
    }, 5000);
  };

  const handleVerify = async () => {
    if (!email) {
      showErrorAlert("Please enter your email address");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      await axios.post(`${API_BASE}/auth/login/send-otp`, { email });
      setStep(2);
    } catch (err) {
      console.error("Error sending OTP:", err);
      
      // Extract error message from response
      let errorMsg = "Failed to send OTP";
      
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        
        // Handle different error formats
        if (typeof detail === 'string') {
          errorMsg = detail;
        } else if (detail.message) {
          errorMsg = detail.message;
        } else if (detail.error === "invalid_email") {
          errorMsg = "Invalid email address. Please check and try again.";
        } else {
          errorMsg = detail.message || "Failed to send verification code";
        }
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      showErrorAlert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setOtp(["", "", "", "", "", ""]);
    setErrorMessage("");
  };

  const handleOtpChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleLogin = async () => {
    const finalOtp = otp.join("");
    if (finalOtp.length !== 6) {
      showErrorAlert("Please enter the complete 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const res = await axios.post(`${API_BASE}/auth/login`, {
        email,
        otp: finalOtp,
      });

      const token = res.data.access_token;

      localStorage.setItem("access_token", token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      login({
        accessToken: token,
        user: res.data.user,
      });

      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      
      let errorMsg = "Login failed";
      
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        
        if (typeof detail === 'string') {
          errorMsg = detail;
        } else if (detail.message) {
          errorMsg = detail.message;
        } else if (detail.error === "invalid_otp") {
          errorMsg = "Invalid OTP. Please try again.";
        } else if (detail.error === "expired_otp") {
          errorMsg = "OTP has expired. Please request a new one.";
        } else {
          errorMsg = detail.message || "Login failed. Please try again.";
        }
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      
      showErrorAlert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      y: -10,
      transition: { duration: 0.3, ease: "easeIn" }
    }
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.02, transition: { duration: 0.2, ease: "easeOut" } },
    tap: { scale: 0.98, transition: { duration: 0.1 } }
  };

  const loadingSpinnerVariants = {
    animate: { rotate: 360, transition: { repeat: Infinity, duration: 0.8, ease: "linear" } }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 px-4">
      {/* Error Toast Notification */}
      <AnimatePresence>
        {showError && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed top-4 right-4 z-50 max-w-md"
          >
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg shadow-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800">Error</p>
                  <p className="text-sm text-red-600 mt-0.5">{errorMessage}</p>
                </div>
                <button
                  onClick={() => setShowError(false)}
                  className="flex-shrink-0 text-red-400 hover:text-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-5xl flex rounded-2xl overflow-hidden bg-white/80 backdrop-blur-xl shadow-2xl border border-white/50"
      >
        {/* LEFT SIDE - Modern Gradient */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-slate-900 via-gray-800 to-slate-900 text-white flex-col justify-between p-10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-60 h-60 bg-indigo-500 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10">
            <div className="mb-10">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6-6h2m8 0h2m-6-4v2" />
                </svg>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold mb-3 tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-gray-300 text-sm leading-relaxed mb-8">
              Secure access to manage drivers, routes, bookings, and analytics all in one place.
            </p>
          </div>

          <div className="relative z-10">
            <div className="relative">
              <img
                src={illustration}
                alt="Dashboard preview"
                className="rounded-xl shadow-2xl border border-white/10"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent rounded-xl"></div>
            </div>
            <div className="flex items-center justify-center gap-2 mt-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/30"></div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Clean & Minimal */}
        <div className="w-full lg:w-1/2 p-8 md:p-10">
          <div className="mb-8">
            <img src={logo} alt="logo" className="h-8 w-auto" />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">
              Welcome back
            </h2>
            <p className="text-sm text-gray-500">
              {step === 1 ? "Enter your email to continue" : "Enter the 6-digit code sent to your email"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1 - Email */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="mb-6">
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="admin@example.com"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 text-gray-800 placeholder-gray-400"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage("");
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
                  />
                </div>

                <motion.button
                  variants={buttonVariants}
                  initial="idle"
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleVerify}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white py-3 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span
                        variants={loadingSpinnerVariants}
                        animate="animate"
                        className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      Sending...
                    </span>
                  ) : (
                    "Continue"
                  )}
                </motion.button>
              </motion.div>
            )}

            {/* STEP 2 - OTP */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="mb-6">
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Verification Code
                  </label>
                  <div className="flex gap-2 justify-between">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(e.target.value, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className="w-12 h-12 text-center text-lg font-semibold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 text-gray-800"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    Code sent to <span className="font-medium text-gray-600">{email}</span>
                  </p>
                </div>

                <motion.button
                  variants={buttonVariants}
                  initial="idle"
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white py-3 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span
                        variants={loadingSpinnerVariants}
                        animate="animate"
                        className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      Verifying...
                    </span>
                  ) : (
                    "Verify & Login"
                  )}
                </motion.button>

                <button
                  onClick={handleBack}
                  className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 flex items-center justify-center gap-1 py-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to email
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
              <span>Secure login</span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span>OTP verification</span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span>256-bit encrypted</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;