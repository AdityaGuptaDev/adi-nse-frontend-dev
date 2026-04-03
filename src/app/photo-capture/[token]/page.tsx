"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Webcam from "react-webcam";
import * as faceapi from 'face-api.js';
import api from "@/utils/api";
import { handleServerError, toastAlert } from "@/utils/helpers";
import { NODE_API_URL } from "@/utils/constants";

// Add toast container for notifications
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function PhotoCapturePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [investorData, setInvestorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openPhotoCamera, setOpenPhotoCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [blinkDetected, setBlinkDetected] = useState(false);
  const [blinkInstructions, setBlinkInstructions] = useState("Position your face in the frame");
  const [blinkValidationStep, setBlinkValidationStep] = useState(0);
  const [photoValidationLoader, setPhotoValidationLoader] = useState(false);
  const [faceApiLoaded, setFaceApiLoaded] = useState(false);
  const [faceApiLoading, setFaceApiLoading] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [eyeAspectRatio, setEyeAspectRatio] = useState(0);
  const [blinkCount, setBlinkCount] = useState(0);
  const [detectionInterval, setDetectionInterval] = useState<NodeJS.Timeout | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [singzyData, setSingzyData] = useState<any>(null);

  const photoWebcamRef = useRef<any>(null);
  let blinkEye = false;

  useEffect(() => {
    if (token) {
      validateTokenAndFetchData();
      loadFaceApiModels();
    }
  }, [token]);

  const validateTokenAndFetchData = async () => {
    try {
      const res = await api.get(`/kyc/validate-photo-capture-token/${token}`);
      if (res.data.data) {
        setInvestorData(res.data.data);
        investorLogin(res.data.data);
        setLoading(false);
      }
    } catch (error) {
      handleServerError(error);
      setLoading(false);
      // toastAlert("error", "Invalid or expired link");
    }
  };
  const investorLogin = async (values: any) => {
    try {
      const payload: any = {
        username: values?.signzy_user_name,
        password: values?.signzy_kyc_id,
      };
      console.log(payload)
      const res = await api.post(`/kyc/investorSignzyLogin`, payload);
      if (res?.data?.data) {
        setSingzyData(res?.data?.data);
      }
    } catch (error) {
      handleServerError(error);
    }
  };

  // Load face-api.js models
  const loadFaceApiModels = async () => {
    try {
      setFaceApiLoading(true);
      const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      ]);

      setFaceApiLoaded(true);
      setFaceApiLoading(false);
    } catch (error) {
      setFaceApiLoaded(false);
      setFaceApiLoading(false);
    }
  };

  const startPhotoCapture = () => {
    setOpenPhotoCamera(true);
    setCapturedPhoto(null);
    setBlinkDetected(false);
    setBlinkValidationStep(0);
    setBlinkCount(0);
    setFaceDetected(false);
    blinkEye = false;
    setBlinkInstructions("Position your face in the frame and look at the camera");

    setTimeout(() => {
      startFaceDetection();
    }, 1000);
  };

  const startFaceDetection = () => {
    if (!faceApiLoaded) {
      setBlinkInstructions("Face detection not available. Click 'Capture' to take photo manually.");
      setBlinkValidationStep(2);
      return;
    }

    const interval = setInterval(async () => {
      if (photoWebcamRef.current && photoWebcamRef.current.video) {
        const video = photoWebcamRef.current.video;

        if (video.readyState !== 4) {
          return;
        }

        try {
          if (!faceapi.nets.tinyFaceDetector.isLoaded || !faceapi.nets.faceLandmark68Net.isLoaded) {
            return;
          }

          const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks();

          if (detections.length > 0) {
            const detection = detections[0];
            setFaceDetected(true);

            if (blinkValidationStep === 0) {
              setBlinkValidationStep(1);
              setBlinkInstructions("Face detected! Please blink your eyes twice");
            }

            const landmarks = detection.landmarks;
            const leftEye = landmarks.getLeftEye();
            const rightEye = landmarks.getRightEye();

            const leftEAR = calculateEyeAspectRatio(leftEye);
            const rightEAR = calculateEyeAspectRatio(rightEye);
            const avgEAR = (leftEAR + rightEAR) / 2;
            setEyeAspectRatio(avgEAR);

            const BLINK_THRESHOLD = 0.25;

            if (avgEAR < BLINK_THRESHOLD && !blinkEye) {
              blinkEye = true;
            } else if (avgEAR > BLINK_THRESHOLD && blinkEye) {
              blinkEye = false;
              setBlinkCount(prev => {
                const newCount = prev + 1;

                if (newCount === 1) {
                  setBlinkInstructions("Great! One more blink please");
                } else if (newCount >= 2) {
                  setBlinkDetected(true);
                  setBlinkInstructions("Perfect! Now hold still for photo capture");
                  clearInterval(interval);

                  setTimeout(() => {
                    capturePhotoFromWebcam();
                  }, 1000);
                }

                return newCount;
              });
            }
          } else {
            setFaceDetected(false);
            if (blinkValidationStep === 1) {
              setBlinkValidationStep(0);
              setBlinkInstructions("Please position your face in the frame");
            }
          }
        } catch (error: any) {
          if (error?.message && error.message.includes('load model')) {
            clearInterval(interval);
            setFaceApiLoaded(false);
            setBlinkInstructions("Face detection failed");
            setBlinkValidationStep(2);
          }
        }
      }
    }, 200);

    setDetectionInterval(interval);

    setTimeout(() => {
      if (!blinkDetected) {
        clearInterval(interval);
        setBlinkInstructions("Blink detection timeout");
        setBlinkValidationStep(2);
      }
    }, 20000);
  };

  const calculateEyeAspectRatio = (eye: any) => {
    const p1 = eye[0];
    const p2 = eye[1];
    const p3 = eye[2];
    const p4 = eye[3];
    const p5 = eye[4];
    const p6 = eye[5];

    const vertical1 = Math.sqrt(Math.pow(p2.x - p6.x, 2) + Math.pow(p2.y - p6.y, 2));
    const vertical2 = Math.sqrt(Math.pow(p3.x - p5.x, 2) + Math.pow(p3.y - p5.y, 2));
    const horizontal = Math.sqrt(Math.pow(p1.x - p4.x, 2) + Math.pow(p1.y - p4.y, 2));

    return (vertical1 + vertical2) / (2 * horizontal);
  };

  const capturePhotoFromWebcam = async () => {
    try {
      setPhotoValidationLoader(true);
      setBlinkValidationStep(2);
      setBlinkInstructions("Capturing photo...");

      const imageSrc = photoWebcamRef.current?.getScreenshot();
      if (imageSrc) {
        setCapturedPhoto(imageSrc);

        const response = await fetch(imageSrc);
        const blob = await response.blob();
        const file = new File([blob], "captured_photo.jpg", { type: "image/jpeg" });

        await uploadCapturedPhoto(file);


      }

    } catch (error) {
      setBlinkInstructions("Failed to capture photo. Please try again.");
    }
  };

  const uploadCapturedPhoto = async (file: File) => {
    try {
      const formData = new FormData();

      formData.append("photo", file);
      formData.append("investor_id", investorData?.investor_id);
      formData.append("userToken", singzyData?.id);
      formData.append("synzyuserId", singzyData?.userId);

      const res: any = await api.post(`/kyc/investor-photo`, formData);
      if (res.data.data) {
        setBlinkInstructions("Photo captured successfully!");
        setUploadSuccess(true);
        setTimeout(() => {
          setOpenPhotoCamera(false);
          setPhotoValidationLoader(false);

        }, 2000);
        // toastAlert("success", "Photo uploaded successfully!");
      }
    } catch (error) {
      setPhotoValidationLoader(false);

      handleServerError(error);
    }
  };

  const cleanupPhotoCapture = () => {
    if (detectionInterval) {
      clearInterval(detectionInterval);
      setDetectionInterval(null);
    }
    setOpenPhotoCamera(false);
    setCapturedPhoto(null);
    setBlinkDetected(false);
    setBlinkValidationStep(0);
    setBlinkCount(0);
    setFaceDetected(false);
    blinkEye = false;
  };

  useEffect(() => {
    return () => {
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
    };
  }, [detectionInterval]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating link...</p>
        </div>
      </div>
    );
  }

  if (!investorData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Invalid Link</h1>
          <p className="text-gray-600">This photo capture link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Photo Capture</h1>
            <p className="text-gray-600">
              Hello {investorData.investor_name}, please capture your photo for KYC verification
            </p>
          </div>

          {uploadSuccess ? (
            <div className="text-center py-8">
              <div className="text-green-500 text-6xl mb-4">✅</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Photo Uploaded Successfully!</h2>
              <p className="text-gray-600">Thank you for completing the photo verification.</p>
            </div>
          ) : !openPhotoCamera ? (
            <div className="text-center">
              <div className="border border-gray-200 rounded-lg p-8 mb-6">
                <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto flex items-center justify-center mb-4">
                  <span className="text-gray-400">📷</span>
                </div>

                {faceApiLoading && (
                  <div className="text-center mb-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Loading face detection...</p>
                  </div>
                )}

                <button
                  onClick={startPhotoCapture}
                  disabled={faceApiLoading}
                  className="bg-secondary hover:bg-secondary/80 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium"
                >
                  {faceApiLoading ? "Loading..." : "Start Photo Capture"}
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <h3 className="font-medium text-blue-800 mb-2">📋 Instructions:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Ensure good lighting and clear face visibility</li>
                  <li>• Look directly at the camera</li>
                  <li>• Follow the blink instructions when prompted</li>
                  <li>• Keep your face centered in the frame</li>
                </ul>
              </div>
            </div>
          ) : (
            // Live camera interface
            <div className="text-center">
              <div className="relative mb-4">
                <Webcam
                  ref={photoWebcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  width="100%"
                  className="rounded-lg border-2 border-blue-500 w-full aspect-video object-cover"
                />

                {/* Blink validation overlay */}
                <div className="bg-black bg-opacity-70 text-white p-3 rounded mt-2">
                  <div className="text-sm font-medium mb-2">{blinkInstructions}</div>

                  {/* Face detection status */}
                  <div className="flex items-center justify-center space-x-4 text-xs">
                    <div className={`flex items-center space-x-1 ${faceDetected ? 'text-green-400' : 'text-red-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${faceDetected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      <span>Face</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${blinkCount >= 2 ? 'text-green-400' : 'text-yellow-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${blinkCount >= 2 ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                      <span>Blinks: {blinkCount}/2</span>
                    </div>
                    <div className={`text-xs ${eyeAspectRatio > 0.25 ? 'text-green-400' : 'text-red-400'}`}>
                      <span>Status: {eyeAspectRatio > 0.25 ? 'Eyes Open' : 'Blinking'}</span>
                    </div>
                  </div>

                  {/* Progress indicator */}
                  <div className="flex justify-center mt-3 space-x-2">
                    <div className={`w-2 h-2 rounded-full ${blinkValidationStep >= 0 ? 'bg-blue-400' : 'bg-gray-400'}`}></div>
                    <div className={`w-2 h-2 rounded-full ${blinkValidationStep >= 1 ? 'bg-blue-400' : 'bg-gray-400'}`}></div>
                    <div className={`w-2 h-2 rounded-full ${blinkValidationStep >= 2 ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                  </div>
                </div>

                {photoValidationLoader && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <div>Processing...</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={cleanupPhotoCapture}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>

                {/* Manual capture button for fallback */}
                {!faceApiLoaded && blinkValidationStep === 2 && (
                  <button
                    onClick={capturePhotoFromWebcam}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                  >
                    Capture Photo
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}
