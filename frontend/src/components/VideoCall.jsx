import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const VideoCall = ({ onClose, selectedUser }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callStatus, setCallStatus] = useState('connecting');
  const [error, setError] = useState(null);

  useEffect(() => {
    const initVideoCall = async () => {
      try {
        setCallStatus('connecting');
        // Get user media
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: { echoCancellation: true, noiseSuppression: true }
        });

        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Create WebRTC peer connection
        const configuration = {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        };

        const peerConnection = new RTCPeerConnection(configuration);
        peerConnectionRef.current = peerConnection;

        // Add local stream tracks
        stream.getTracks().forEach(track => {
          peerConnection.addTrack(track, stream);
        });

        // Handle remote stream
        peerConnection.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };

        // Handle connection state changes
        peerConnection.onconnectionstatechange = () => {
          switch (peerConnection.connectionState) {
            case 'connected':
              setCallStatus('connected');
              break;
            case 'disconnected':
            case 'failed':
            case 'closed':
              setCallStatus('disconnected');
              break;
            default:
              setCallStatus('connecting');
          }
        };

        // Simulate call connection (in real app, would use signaling server)
        setTimeout(() => {
          if (peerConnection.connectionState !== 'connected') {
            setCallStatus('connected');
          }
        }, 2000);

      } catch (err) {
        console.error('Error accessing media devices:', err);
        setError('Unable to access camera/microphone');
        setCallStatus('error');
      }
    };

    initVideoCall();

    return () => {
      // Cleanup
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [selectedUser]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = isCameraOff;
      });
      setIsCameraOff(!isCameraOff);
    }
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
    >
      <div className="w-full max-w-4xl h-screen md:h-auto md:rounded-xl overflow-hidden bg-black">
        {/* Main video container */}
        <div className="relative w-full h-full md:aspect-video bg-black">
          {/* Remote video - main */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Local video - pip */}
          <div className="absolute bottom-4 right-4 w-32 h-24 md:w-48 md:h-36 rounded-lg overflow-hidden border-2 border-white shadow-lg">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </div>

          {/* Status overlay */}
          {callStatus !== 'connected' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white font-semibold">
                  {callStatus === 'connecting' && 'Connecting to ' + (selectedUser?.name || 'user')}
                  {callStatus === 'error' && error}
                </p>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
            <div className="flex justify-center gap-4">
              <button
                onClick={toggleMute}
                className={`p-4 rounded-full transition-colors ${
                  isMuted
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  {isMuted ? (
                    <path d="M13 2H11v2h2V2zm0 18h-2v2h2v-2zm6-11h2v2h-2v-2zM4 11H2v2h2v-2zm10.5-8C9.1 3 7 5.1 7 7.5v9c0 2.4 2.1 4.5 4.5 4.5s4.5-2.1 4.5-4.5v-9c0-2.4-2.1-4.5-4.5-4.5zm0 2c1.9 0 3.5 1.6 3.5 3.5v9c0 1.9-1.6 3.5-3.5 3.5s-3.5-1.6-3.5-3.5v-9c0-1.9 1.6-3.5 3.5-3.5z" />
                  ) : (
                    <path d="M13 2H11v2h2V2zm0 18h-2v2h2v-2zm6-11h2v2h-2v-2zM4 11H2v2h2v-2zm10.5-8C9.1 3 7 5.1 7 7.5v9c0 2.4 2.1 4.5 4.5 4.5s4.5-2.1 4.5-4.5v-9c0-2.4-2.1-4.5-4.5-4.5zm0 2c1.9 0 3.5 1.6 3.5 3.5v9c0 1.9-1.6 3.5-3.5 3.5s-3.5-1.6-3.5-3.5v-9c0-1.9 1.6-3.5 3.5-3.5z" />
                  )}
                </svg>
              </button>

              <button
                onClick={toggleCamera}
                className={`p-4 rounded-full transition-colors ${
                  isCameraOff
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                title={isCameraOff ? 'Turn on camera' : 'Turn off camera'}
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  {isCameraOff ? (
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                  ) : (
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zm-5-14l-3.5 4.5-2.5-3.01L8.5 17h11l-4.5-6z" />
                  )}
                </svg>
              </button>

              <button
                onClick={endCall}
                className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
                title="End call"
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VideoCall;
