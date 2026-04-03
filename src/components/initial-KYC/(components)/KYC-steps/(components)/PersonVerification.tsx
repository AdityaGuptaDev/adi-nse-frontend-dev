"use client";

import CustomButton from "@/commonUI/Button";
import CustomText from "@/commonUI/Text";
import Uploader from "@/components/image-uploader/uploader";
import { getLS, handleServerError, setLS, toastAlert } from "@/utils/helpers";
import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ADD_MEMBER, MEMBER_DATA, NODE_API_URL, USER_DATA, USER_TYPE } from "@/utils/constants";
import Webcam from "react-webcam";
import api from "@/utils/api";
import { MdDelete } from "react-icons/md";
import { IoMdVideocam } from "react-icons/io";
import * as faceapi from 'face-api.js';

function PersonVerification({ steps, setSteps }: any) {
  const [userData, setUserData] = useState<any>("");
  const [singzyData, setSingzyData] = useState<any>([]);
  const [signatureImage, setSignatureImage] = useState<any>("");
  const [investorPhoto, setInvestorPhoto] = useState<any>("");
  const [existingVideo, setExistingVideo] = useState<any>(""); // New state for fetched video
  const [VideoForm, setVideoForm] = useState<any>({})
  const [recordedChunks, setRecordedChunks] = useState<any>([]);
  const [openVideoCamera, setOpenVideoCamera] = useState<boolean>(false);
  const [capturing, setCapturing] = useState(false);
  const [devicePermission, setDevicePermission] = useState<boolean>(false);
  const [video, setVideo] = useState<any>();
  const [isVideo, setIsVideo] = useState(false);
  const [loader, setLoader] = useState<any>(false);
  const [otpTxt, setOtptxt] = useState<string>();
  const [transactionId, setTransacionId] = useState<any>();
  const [matchImage, setMatchImage] = useState<any>();
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [POAConsent, setPOAConsent] = useState<any>(true);
  const [fileVideo, setVideoFile] = useState<any>();
  const [recordError, setRecordError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null);

  // Live photo capture with blink detection states
  const [openPhotoCamera, setOpenPhotoCamera] = useState<boolean>(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [blinkDetected, setBlinkDetected] = useState<boolean>(false);
  const [blinkInstructions, setBlinkInstructions] = useState<string>("Position your face in the frame");
  const [blinkValidationStep, setBlinkValidationStep] = useState<number>(0); // 0: position, 1: blink, 2: capture
  const [photoValidationLoader, setPhotoValidationLoader] = useState<boolean>(false);
  const [faceApiLoaded, setFaceApiLoaded] = useState<boolean>(false);
  const [faceApiLoading, setFaceApiLoading] = useState<boolean>(false);
  const [faceDetected, setFaceDetected] = useState<boolean>(false);
  const [eyeAspectRatio, setEyeAspectRatio] = useState<number>(0);
  const [blinkCount, setBlinkCount] = useState<number>(0);
  // const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [detectionInterval, setDetectionInterval] = useState<NodeJS.Timeout | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [photoCaptureLink, setPhotoCaptureLink] = useState<string>("");
  const [linkGenerated, setLinkGenerated] = useState(false);
  const webcamRef = useRef<any>(null);
  const photoWebcamRef = useRef<any>(null);
  const mediaRecorderRef = useRef(null);
  let blinkEye = false


  const router = useRouter();
  const handleBackProcess = () => {
    setSteps((prev: any) => ({
      ...prev,
      pan_step: false,
      address_step: false,
      fatca_step: false,
      bank_step: false,
      nominee_step: true,
      personalverification_step: false
    }))
  };

  const fetchData = async (id: any) => {
    try {
      const res = await api.get(`/kyc/get-personal-document-info/${id}`);
      if (res.data.data) {
        let dataValue = res.data.data;
        setSignatureImage(dataValue.investor_docs?.signature);
        setInvestorPhoto(dataValue.investor_docs?.photo);
        setPOAConsent(dataValue.investor_address?.poaConsent);
        // Set existing video if available
        if (dataValue.self_video) {
          setExistingVideo(dataValue.self_video)
        }
      }

    } catch (error) {
      handleServerError(error);

    }
  };
  useEffect(() => {
    let getUser: any = getLS(USER_DATA);
    let isMember = getLS(ADD_MEMBER);
    let memberData = getLS(MEMBER_DATA);

    if (memberData) {
      setIsMember(isMember);
      setUserData(memberData);
    } else {
      setUserData(getUser);
    }

    // Check if user is admin, RM, or partner
    if (getUser) {
      const userTypeId = getUser?.superAdmin?.userType_id || getUser?.RM?.userType_id || getUser?.partner?.userType_id;
      const isAdminType = userTypeId === USER_TYPE.superAdmin ||
        userTypeId === USER_TYPE.RM ||
        userTypeId === USER_TYPE.partner ||
        getUser?.partner?.regId ||
        getUser?.RM?.id ||
        getUser?.superAdmin;
      setIsAdminUser(isAdminType);

      let signzy_user_name = isMember ? memberData?.InvestorRegistration?.signzy_user_name : getUser?.InvestorRegistration?.signzy_user_name;
      let signzy_kyc_id = isMember ? memberData?.InvestorRegistration?.signzy_kyc_id : getUser?.InvestorRegistration?.signzy_kyc_id;

      if (signzy_user_name) {
        investorLogin({ signzy_user_name, signzy_kyc_id });
      }

      fetchData(isMember ? memberData?.InvestorRegistration?.id : getUser?.InvestorRegistration?.id);
    }

    // Load face-api.js models
    loadFaceApiModels();
  }, []);

  // Load face-api.js models
  const loadFaceApiModels = async () => {
    try {
      setFaceApiLoading(true);

      // Load models from CDN (more reliable than local files)
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

  const handlesubmitKyc = async () => {
    // Validation for mandatory signature and photo uploads
    if (!signatureImage) {
      toastAlert("error", "Please upload your signature before proceeding.");
      return;
    }

    if (!investorPhoto && !capturedPhoto) {
      toastAlert("error", "Please  capture your photo before proceeding.");
      return;
    }

    setIsLoadingData(true);
    const payload = {
      investor_id: userData?.InvestorRegistration?.id,
      last_kyc_step: 8,

    }
    try {
      const res = await api.post(`/kyc/updateinvestor`, payload);
      if (res.data.data) {
        userData.InvestorRegistration = res.data.data.investor_data;
        if (isMember) {
          setLS(MEMBER_DATA, userData);
        } else {
          setLS(USER_DATA, userData);
        }
        setIsLoadingData(false);

        router.push("/kyc-quick-summary");
      }

    } catch (error) {
      handleServerError(error);
      setIsLoadingData(false);

    }

  };


  const investorLogin = async (values: any) => {
    try {
      const payload: any = {
        username: values?.signzy_user_name,
        password: values?.signzy_kyc_id,
      };
      const res = await api.post(`/kyc/investorSignzyLogin`, payload);
      if (res?.data?.data) {
        setSingzyData(res?.data?.data);
      }
    } catch (error) {
      handleServerError(error);
    }
  };


  const signatureEvent = async (path: any) => {
    try {
      if (path) {
        let passObj: any = {
          filename: path,
          investor_id: userData?.InvestorRegistration?.id,
          userToken: singzyData?.id,
          synzyuserId: singzyData?.userId,
        };

        const res: any = await api.post(`/kyc/investor-signature`, passObj);
      }

    } catch (e) {
      setSignatureImage("")
      handleServerError(e);

    }
  }


  // Start live photo capture with blink validation
  const startPhotoCapture = () => {
    setOpenPhotoCamera(true);
    setCapturedPhoto(null);
    setBlinkDetected(false);
    setBlinkValidationStep(0);
    setBlinkCount(0);
    setFaceDetected(false);
    blinkEye = false
    setBlinkInstructions("Position your face in the frame and look at the camera");

    // Start face detection after camera is ready
    setTimeout(() => {
      startFaceDetection();
    }, 1000);
  };

  // Real face detection and blink validation
  const startFaceDetection = () => {
    if (!faceApiLoaded) {
      // Fallback to basic validation if face-api is not loaded
      setBlinkInstructions("Face detection not available. Click 'Capture' to take photo manually.");
      setBlinkValidationStep(2);
      return;
    }

    const interval = setInterval(async () => {
      if (photoWebcamRef.current && photoWebcamRef.current.video) {
        const video = photoWebcamRef.current.video;

        // Check if video is ready
        if (video.readyState !== 4) {
          return; // Video not ready yet
        }

        try {
          // Ensure models are loaded before detection
          if (!faceapi.nets.tinyFaceDetector.isLoaded || !faceapi.nets.faceLandmark68Net.isLoaded) {
            return;
          }

          // Detect faces in the video stream
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

            // Calculate eye aspect ratio for blink detection
            const landmarks = detection.landmarks;
            const leftEye = landmarks.getLeftEye();
            const rightEye = landmarks.getRightEye();

            const leftEAR = calculateEyeAspectRatio(leftEye);
            const rightEAR = calculateEyeAspectRatio(rightEye);
            const avgEAR = (leftEAR + rightEAR) / 2;
            setEyeAspectRatio(avgEAR);

            // Simple blink detection with fixed threshold
            const BLINK_THRESHOLD = 0.25; // Simple fixed threshold

            if (avgEAR < BLINK_THRESHOLD && !blinkEye) {
              blinkEye = true
            } else if (avgEAR > BLINK_THRESHOLD && blinkEye) {

              blinkEye = false
              setBlinkCount(prev => {
                const newCount = prev + 1;

                if (newCount === 1) {
                  setBlinkInstructions("Great! One more blink please");
                } else if (newCount >= 2) {
                  setBlinkDetected(true);
                  setBlinkInstructions("Perfect! Now hold still for photo capture");
                  clearInterval(interval);

                  // Capture photo after successful blink validation
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
          // If there's a persistent error, fall back to manual mode
          if (error?.message && error.message.includes('load model')) {
            clearInterval(interval);
            setFaceApiLoaded(false);
            setBlinkInstructions("Face detection failed");
            setBlinkValidationStep(2);
          }
        }
      }
    }, 200); // Increased to 200ms to reduce load

    setDetectionInterval(interval);

    // Timeout after 20 seconds if validation not complete
    setTimeout(() => {
      if (!blinkDetected) {
        clearInterval(interval);
        setBlinkInstructions("Blink detection timeout");
        setBlinkValidationStep(2);
      }
    }, 20000);
  };

  // Calculate Eye Aspect Ratio for blink detection
  const calculateEyeAspectRatio = (eye: any) => {
    // Eye landmarks form a specific pattern
    // EAR = (|p2-p6| + |p3-p5|) / (2 * |p1-p4|)
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

  // Capture photo from webcam
  const capturePhotoFromWebcam = async () => {
    try {
      setPhotoValidationLoader(true);
      setBlinkValidationStep(2);
      setBlinkInstructions("Capturing photo...");

      const imageSrc = photoWebcamRef.current?.getScreenshot();
      if (imageSrc) {
        setCapturedPhoto(imageSrc);

        // Convert base64 to blob and upload
        const response = await fetch(imageSrc);
        const blob = await response.blob();
        const file = new File([blob], "captured_photo.jpg", { type: "image/jpeg" });

        // Upload the captured photo
        await uploadCapturedPhoto(file);

        setBlinkInstructions("Photo captured successfully!");
        setTimeout(() => {
          setOpenPhotoCamera(false);
        }, 2000);
      }

      setPhotoValidationLoader(false);
    } catch (error) {
      setPhotoValidationLoader(false);
      setBlinkInstructions("Failed to capture photo. Please try again.");
    }
  };

  // Upload captured photo
  const uploadCapturedPhoto = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("investor_id", userData?.InvestorRegistration?.id);
      formData.append("userToken", singzyData?.id);
      formData.append("synzyuserId", singzyData?.userId);

      const res: any = await api.post(`/kyc/investor-photo`, formData);
      if (res.data.data) {
        setInvestorPhoto(res.data.data.fileName);
        toastAlert("success", "Photo captured and uploaded successfully!");
      }
    } catch (error) {
      handleServerError(error);
    }
  };

  // Retake photo
  const retakePhoto = () => {
    // Clear any existing intervals
    if (detectionInterval) {
      clearInterval(detectionInterval);
      setDetectionInterval(null);
    }

    setCapturedPhoto(null);
    setBlinkDetected(false);
    setBlinkValidationStep(0);
    setBlinkCount(0);
    setFaceDetected(false);
    blinkEye = false
    startPhotoCapture();
  };

  // Cleanup function
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
    blinkEye = false
  };

  // Generate photo capture link for admin users
  const generatePhotoCaptureLink = async () => {
    try {
      const payload = {
        investor_id: userData?.InvestorRegistration?.id,
        signzy_kyc_id: userData?.InvestorRegistration?.signzy_kyc_id,
        signzy_user_name: userData?.InvestorRegistration?.signzy_user_name,
      };

      const res = await api.post(`/kyc/generate-photo-capture-link`, payload);
      if (res.data.data) {
        console.log(res.data.data, 'res.data.data');
        // const link = `${window.location.origin}/photo-capture/${res.data.data.token}`;
        setPhotoCaptureLink(res.data.data?.photoLink);
        setLinkGenerated(true);
        toastAlert("success", "Photo capture link generated successfully and share with investor!");
      }
    } catch (error) {
      handleServerError(error);
    }
  };


  // Preview photo capture page
  const previewPhotoCaptureLink = () => {
    fetchData(userData?.InvestorRegistration?.id);

    // if (photoCaptureLink) {
    //   window.open(photoCaptureLink, '_blank');
    // }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
    };
  }, [detectionInterval]);





  const enableVideoPermission = async () => {
    try {
      const constraints = {
        video: true,
        audio: true,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setDevicePermission(stream?.active);
    } catch (error) {
    }
  };

  const handleDataAvailable = useCallback((event: any) => {
    if (event.data.size > 0) {
      setRecordedChunks((prev: any) => prev.concat(event.data));
    }
  }, []);



  const stopRecording = useCallback(() => {
    // @ts-ignore
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      // @ts-ignore
      mediaRecorderRef.current.stop();
      setCapturing(false);

      // Clear timer
      if (recordingTimer) {
        clearInterval(recordingTimer);
        setRecordingTimer(null);
      }
      setRecordingTime(0);
    } else {
      toastAlert('error', "MediaRecorder is not recording.")
    }
  }, [recordingTimer]);

  const startRecording = useCallback(() => {
    setCapturing(true);
    setRecordingTime(0);
    // @ts-ignore
    if (!webcamRef.current || !webcamRef.current.stream) {
      return;
    }

    setRecordedChunks([]);

    try {
      // @ts-ignore
      mediaRecorderRef.current = new MediaRecorder(webcamRef?.current?.stream, {
        mimeType: "video/webm",
      });

      // @ts-ignore
      mediaRecorderRef.current.addEventListener(
        "dataavailable",
        handleDataAvailable
      );
      // @ts-ignore
      mediaRecorderRef.current.start();

      // Start timer
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setRecordingTimer(timer);

      // Auto-stop recording after 60 seconds
      setTimeout(() => {
        // @ts-ignore
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          // @ts-ignore
          mediaRecorderRef.current.stop();
          setCapturing(false);
          clearInterval(timer);
          setRecordingTimer(null);
          setRecordingTime(0);
        }
      }, 60000);
    } catch (error) {
      setCapturing(false);
      setRecordingTime(0);
    }
  }, [handleDataAvailable]);

  const SaveVideo = async () => {
    let getUser: any = getLS(USER_DATA);


    if (recordedChunks.length === 0) {
      setRecordError("Please record a video first.");
      return;
    }

    try {
      const blobVideo = new Blob(recordedChunks, {
        type: "video/webm",
      });
      setVideoForm({ ...VideoForm, video: recordedChunks });

      if (blobVideo) {
        const formData = new FormData();
        formData.append("video", blobVideo, `verification-video.webm`);
        // @ts-ignore
        formData.append("video_otp", otpTxt);
        formData.append("userToken", singzyData?.id);
        formData.append("synzyuserId", singzyData?.userId);
        formData.append("investor_id", getUser?.InvestorRegistration?.id);
        formData.append("transactionId", transactionId);
        formData.append("request_type", "startExecutingVideo");
        formData.append("matchImage", matchImage);


        const res = await api.post(`/kyc/investor-video`, formData);
        const data = res?.data?.data

        if (data) {
          toastAlert("success", "Video uploaded successfully");
          // Update existing video state with new video
          if (data.video_url) {
            setExistingVideo(data.video_url);
          }
          // Reset recording states
          setOpenVideoCamera(false);
          setRecordedChunks([]);
          setVideo(null);
          setOtptxt("");
          setRecordError(null);
          return true;
        }
      }
    } catch (error) {
      handleServerError(error);

    }
  };



  const videoSource = useMemo(() => {
    if (recordedChunks.length === 0) return "";
    const blob = new Blob(recordedChunks, {
      type: "video/webm",
    });
    return URL.createObjectURL(blob);
  }, [recordedChunks]);

  // Update video state when recordedChunks change
  useEffect(() => {
    if (recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, {
        type: "video/webm",
      });
      setVideo(blob);
    }
  }, [recordedChunks]);




  useEffect(() => {
    // let val: any = Math.floor(100000 + Math.random() * 900000);
    // // setOtptxt(String(val));
    if (openVideoCamera) {
      setRecordedChunks([]);
      setVideoFile(null);
      setVideo(null);

      // Call otpSingzy directly without dependency
      const callOtpSingzy = async () => {
        setLoader(true);
        try {
          const formData = new FormData();
          formData.append("userToken", singzyData?.id);
          formData.append("synzyuserId", singzyData?.userId);
          formData.append("request_type", "startVideo");
          formData.append("investor_id", userData?.InvestorRegistration?.id);

          const res = await api.post(`/kyc/investor-video`, formData);
          const data = res?.data?.data


          if (data) {
            setLoader(false);
            setOtptxt(data?.VideoSYNRes[0]?.randNumber);
            setTransacionId(data?.VideoSYNRes[0]?.transactionId);
            setMatchImage(data?.matchImage)

          } else {
            toastAlert("error", "Something went wrong");
          }
        } catch (error) {
          handleServerError(error);

          setLoader(false);
        }
      };

      callOtpSingzy();
    }
    return () => { };
  }, [openVideoCamera]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (recordingTimer) {
        clearInterval(recordingTimer);
      }
    };
  }, [recordingTimer]);

  return (
    <>
      <div className="p-4 px-6">
        <div className="mt-2">
          <CustomText className="text-xl font-montserrat font-semibold">
            In-Person Verification
          </CustomText>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4 gap-4 mt-6">
          {/* Signature Upload */}
          {/* Recommended Size: (150 px * 150 px) */}
          <div className="bg-white border-0 border-gray-200 rounded-lg shadow-none h-fit">
            <div className="text-center mb-0">
              <CustomText className="text-lg font-semibold text-gray-800 mb-2">
                Upload Signature
              </CustomText>
              <p className="text-sm text-gray-600">
                Recommended Size: (150 px * 150 px)
              </p>
            </div>
            <Uploader handleEvent={signatureEvent} setImageUrl={setSignatureImage} imageUrl={signatureImage} folder={"signature"} />
          </div>

          {/* Live Photo Capture */}
          <div className="bg-white border-0 border-gray-200 rounded-lg shadow-none h-fit">
            <div className="p-0">
              <div className="text-center mb-3">
                <CustomText className="text-lg font-semibold text-gray-800 mb-2">
                  {isAdminUser ? "Investor Photo Capture" : "Live Photo Capture"}
                </CustomText>
                <p className="text-sm text-gray-600">
                  {isAdminUser ? "Generate link for investor photo capture" : "Capture your photo with blink validation"}
                </p>
              </div>

              {isAdminUser ? (
                <>
                  {/* // Admin interface for generating photo capture link */}
                  <div className="text-center border border-gray-200 rounded-lg p-4 h-52">
                    {investorPhoto ? (
                      <div className="relative mb-2">
                        <img
                          src={`${NODE_API_URL}/static/photo/${investorPhoto}`}
                          alt="Investor Photo"
                          className="w-full h-32 object-cover rounded-lg mx-auto border-2 border-green-500"
                        />
                        <div className="absolute top-0 right-0 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                          ✓ Uploaded by Investor
                        </div>
                      </div>
                    ) : (
                      <div className="h-44 bg-gray-100 rounded-lg mx-auto flex items-center justify-center mb-4">
                        <span className="text-gray-400">Waiting for investor photo</span>
                      </div>
                    )}
                  </div>
                  <div className="text-center mt-3">
                    {!linkGenerated && !investorPhoto ? (

                      <CustomButton
                        onClick={generatePhotoCaptureLink}
                        className="bg-secondary hover:bg-secondary/80 text-white px-4 py-2"
                      >
                        Generate Photo Capture Link
                      </CustomButton>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <CustomButton
                            onClick={generatePhotoCaptureLink}
                            className="bg-secondary hover:bg-secondary/80 text-white px-3 py-1 text-sm"
                          >
                            Generate Link Again
                          </CustomButton>
                          <CustomButton
                            onClick={previewPhotoCaptureLink}
                            className="bg-secondary hover:bg-secondary/80 text-white px-3 py-1 text-sm"
                          >
                            Preview
                          </CustomButton>
                        </div>
                        {/* <p className="text-xs text-gray-500">Link generated and ready to share</p> */}
                      </div>
                    )}
                  </div>
                </>
              ) : !openPhotoCamera ? (
                // Regular user interface for photo capture
                <>
                  <div className="text-center border border-gray-200 rounded-lg p-0 h-52 ">
                    {investorPhoto ? (
                      <div className="relative mb-2">
                        <img
                          src={`${NODE_API_URL}/static/photo/${investorPhoto}`}
                          alt="Captured Photo"
                          className="w-full h-52 object-cover rounded-lg mx-auto border-2 border-green-500"
                        />
                        <div className="absolute top-0 right-0 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                          ✓ Captured
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm mt-2 text-gray-400 h-52 flex items-center justify-center">
                        <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
                          <span className="text-gray-400 ">No Photo</span>
                        </div>
                      </p>
                    )}

                    {faceApiLoading && (
                      <div className="text-center mt-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="text-xs text-gray-500 mt-1">Loading AI models...</p>
                      </div>
                    )}

                    {!faceApiLoaded && !faceApiLoading && (
                      <div className="text-center mt-2">
                        <p className="text-xs text-orange-500">
                          Face detection unavailable - Manual capture mode
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="text-center mt-3">
                    <CustomButton
                      onClick={startPhotoCapture}
                      className="bg-secondary hover:bg-secondary/80 text-white px-3 p-2 "
                      disabled={faceApiLoading}
                    >
                      {faceApiLoading
                        ? "Loading Face Detection..."
                        : investorPhoto
                          ? "Retake Photo"
                          : "Capture Photo"
                      }
                    </CustomButton>
                  </div>
                </>
              ) : (
                // Live camera interface
                <div className="text-center">
                  <div className="relative mb-4">
                    <Webcam
                      ref={photoWebcamRef}
                      audio={false}
                      screenshotFormat="image/jpeg"
                      width="100%"
                      // height={160}
                      className="rounded-lg border-2 border-blue-500 h-52 w-full aspect-video object-cover"
                    />

                    {/* Blink validation overlay */}
                    <div className="bg-black bg-opacity-70 text-white p-2 rounded mt-1">
                      <div className="text-sm font-medium">{blinkInstructions}</div>

                      {/* Face detection status */}
                      <div className="flex items-center justify-center mt-1 space-x-3 text-xs">
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
                      <div className="flex justify-center mt-2 space-x-2">
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

                  <div className="flex justify-center gap-2">
                    <CustomButton
                      onClick={cleanupPhotoCapture}
                      className="flex bg-gray-500 hover:bg-gray-600 text-white"
                    >
                      Cancel
                    </CustomButton>

                    {/* {capturedPhoto && (
                      <CustomButton
                        onClick={retakePhoto}
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        Retake
                      </CustomButton>
                    )} */}

                    {/* Manual capture button for fallback */}
                    {!faceApiLoaded && blinkValidationStep === 2 && (
                      <CustomButton
                        onClick={capturePhotoFromWebcam}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        Capture
                      </CustomButton>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>


          {/* Video Recording Section */}
          {
            !POAConsent && (
              <div className="">
                <div className="p-0">
                  <div className="text-center mb-3">
                    <CustomText className="text-lg font-semibold text-gray-800 mb-2">
                      Video Verification
                    </CustomText>
                    <CustomText className="text-sm text-gray-600 mb-2">
                      Record a video for identity verification
                    </CustomText>
                  </div>

                  {/* Video Display Area */}
                  <div className="bg-white border border-gray-200 h-fitrelative overflow-hidden mb-3 rounded-lg h-52">
                    {existingVideo && !openVideoCamera ? (
                      // Existing Video from API
                      <div className="relative">
                        <video
                          width="100%"
                          height="160"
                          controls
                          className="rounded-lg"
                        >
                          <source src={`${NODE_API_URL}/static/video/${existingVideo}`} type="video/webm" />
                        </video>
                        <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                          ✓ Uploaded
                        </div>
                      </div>
                    ) : fileVideo ? (
                      // Uploaded Video File
                      <div className="relative">
                        <video
                          width="100%"
                          height="160"
                          controls
                          className="rounded-lg"
                        >
                          <source src={fileVideo} id="video_here" />
                        </video>
                        <button
                          onClick={() => setVideoFile(null)}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                        >
                          <MdDelete size="1.2rem" />
                        </button>
                      </div>
                    ) : otpTxt && openVideoCamera ? (
                      recordedChunks.length > 0 || isVideo ? (
                        // Recorded Video Playback
                        <div className="relative">
                          <video
                            width="100%"
                            height="160"
                            controls
                            className="rounded-lg"
                            {...video}
                          >
                            <source src={videoSource} type="video/webm" />
                          </video>
                          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                            ✓ Recorded
                          </div>
                        </div>
                      ) : (
                        // Live Camera Feed
                        <div className="relative flex items-center justify-center">
                          <Webcam
                            ref={webcamRef}
                            audio={true}
                            width="100%"
                            height={160}
                            className="rounded-lg"
                            videoConstraints={{
                              width: 640,
                              height: 480,
                              facingMode: "user",
                            }}
                          />
                          {capturing && (
                            <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm flex items-center">
                              <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                              Recording... {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                            </div>
                          )}
                          {!devicePermission && (
                            <div className="absolute inset-0 bg-red-50 flex items-center justify-center">
                              <CustomText className="text-red-600 text-center">
                                Camera Device not found or permission denied
                              </CustomText>
                            </div>
                          )}
                        </div>
                      )
                    ) : (
                      // Initial State - Start Recording
                      <div className="flex flex-col items-center justify-center py-8 h-52">
                        <div
                          onClick={() => {
                            setOpenVideoCamera(true);
                            enableVideoPermission();
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full cursor-pointer transition-colors mb-3"
                        >
                          <IoMdVideocam size="2rem" />
                        </div>
                        <CustomText className="text-gray-600 font-medium text-sm">
                          Click to Start Recording
                        </CustomText>
                        <CustomText className="text-xs text-gray-500 mt-1">
                          Max: 60 seconds
                        </CustomText>
                      </div>
                    )}
                  </div>

                  {/* Loading State */}
                  {loader && (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <CustomText className="ml-2 text-sm text-gray-600">
                        Initializing video recording...
                      </CustomText>
                    </div>
                  )}

                  {/* OTP Display */}
                  {otpTxt && !recordedChunks.length && (
                    <div className="rounded-lg p-1 mb-3">
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <CustomText className="text-xs text-blue-600 mb-0">
                            Say this OTP clearly:
                          </CustomText>
                          <div className="text-primary px-3 py-0 rounded-lg font-mono text-2xl font-bold">
                            {otpTxt}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error Display */}
                  {recordError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <CustomText className="text-red-600 text-sm">
                        {recordError}
                      </CustomText>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-center gap-2">
                    {existingVideo && !openVideoCamera ? (
                      // Show Record Again button for existing video
                      <CustomButton
                        onClick={() => {
                          setOpenVideoCamera(true);
                          enableVideoPermission();
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
                      >
                        Record Again
                      </CustomButton>
                    ) : openVideoCamera ? (
                      recordedChunks.length > 0 || isVideo ? (
                        // Post-Recording Actions
                        <div className="flex gap-2 mt-1">
                          <CustomButton
                            onClick={() => {
                              setIsVideo(false);
                              setRecordedChunks([]);
                              setVideo(null);
                              setRecordError(null);
                              if (recordingTimer) {
                                clearInterval(recordingTimer);
                                setRecordingTimer(null);
                              }
                              setRecordingTime(0);
                            }}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 text-sm"
                          >
                            Record Again
                          </CustomButton>
                          <CustomButton
                            onClick={SaveVideo}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm"
                          >
                            Save Video
                          </CustomButton>
                        </div>
                      ) : (
                        // Recording Controls
                        <div className="flex gap-2 mb-3">
                          {capturing && otpTxt ? (
                            <CustomButton
                              onClick={stopRecording}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm"
                            >
                              Stop Recording
                            </CustomButton>
                          ) : (
                            <>
                              <CustomButton
                                onClick={startRecording}
                                disabled={!otpTxt}
                                className="bg-secondary hover:select-secondary/80 disabled:bg-gray-400 text-white px-4 py-2 text-sm"
                              >
                                Start Recording
                              </CustomButton>
                              <CustomButton
                                onClick={() => {
                                  setOpenVideoCamera(false);
                                  setOtptxt("");
                                  setRecordError(null);
                                }}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 text-sm"
                              >
                                Cancel
                              </CustomButton>
                            </>
                          )}
                        </div>
                      )
                    ) : null}
                  </div>

                  {/* Instructions */}
                  {!openVideoCamera && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-left">
                      <CustomText className="text-xs font-medium text-amber-800 mb-1">
                        📋 Instructions:
                      </CustomText>
                      <ul className="text-xs text-amber-700 space-y-0.5">
                        <li>• Good lighting & clear face visibility</li>
                        <li>• Speak the OTP number clearly</li>
                        <li>• Maximum 60 seconds duration</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )
          }

        </div>
      </div>

      <div className="border-b border-border"></div>

      <div className="p-4 flex justify-between">
        <div>
          <CustomButton className="w-32" onClick={handleBackProcess}
            disabled={isLoadingData}
          >
            {isLoadingData ? "Loading..." : "Back"}
          </CustomButton>
        </div>
        <div>

          <CustomButton
            className="w-32"
            onClick={handlesubmitKyc}
            disabled={isLoadingData}
          >
            {isLoadingData ? "Loading..." : "Next"}
          </CustomButton>
        </div>
      </div>
    </>
  );
}

export default PersonVerification;


