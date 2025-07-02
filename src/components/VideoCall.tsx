'use client';

import { useEffect, useRef, useState } from 'react';
import {Camera, CameraOff, Mic, MicOff} from 'lucide-react';
import io from 'socket.io-client';

// Initialize socket connection to server
const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
  path: '/socket.io',
  transports: ['websocket'],
});

export default function VideoCall({ sessionId }: { sessionId: string }) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // State variables for toggling camera and microphone
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);

  // Step 1: Setup WebRTC peer connection and socket event handlers
  useEffect(() => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });
    peerRef.current = peer;

    // Step 2: Send ICE candidates to remote peer via socket
    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit('ice-candidate', { sessionId, candidate: e.candidate });
      }
    };

    // Step 3: When receiving remote track, display it
    peer.ontrack = (e) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
    };

    // Step 4: Handle incoming offer and respond with answer
    socket.on('offer', async ({ sdp }) => {
      await peer.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit('answer', { sessionId, sdp: answer });
    });

    // Step 5: Set remote description from answer
    socket.on('answer', async ({ sdp }) => {
      await peer.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    // Step 6: Handle incoming ICE candidate
    socket.on('ice-candidate', async ({ candidate }) => {
      try {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('Failed to add ICE candidate:', err);
      }
    });

    // Step 7: Once both clients are ready, create and send an offer
    socket.on('ready', async () => {
      if ((cameraOn || micOn) && localStreamRef.current) {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socket.emit('offer', { sessionId, sdp: offer });
      }
    });

    // Notify others that this client is ready
    socket.emit('ready', { sessionId });

    // Cleanup on component unmount
    return () => {
      socket.disconnect();
      peer.close();
    };
  }, [sessionId, cameraOn, micOn]);

  // Toggle camera stream
  const toggleCamera = async () => {
    if (!cameraOn) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getVideoTracks().forEach((track) => peerRef.current?.addTrack(track, stream));

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      localStreamRef.current = stream;
      setCameraOn(true);
    } else {
      localStreamRef.current?.getVideoTracks().forEach((track) => track.stop());
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
      setCameraOn(false);
    }
  };

  // Toggle microphone stream
  const toggleMic = async () => {
    if (!micOn) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getAudioTracks().forEach((track) => peerRef.current?.addTrack(track, stream));

      if (localStreamRef.current) {
        localStreamRef.current.addTrack(stream.getAudioTracks()[0]);
      } else {
        localStreamRef.current = stream;
      }

      setMicOn(true);
    } else {
      localStreamRef.current?.getAudioTracks().forEach((track) => track.stop());
      setMicOn(false);
    }
  };

  // Render local/remote video and control buttons
  return (
    <div className="flex gap-4">
      <div className="relative w-1/2 bg-black rounded">
        <video ref={localVideoRef} autoPlay playsInline muted className="w-full rounded" />
        <div className="justify-center mb-2 flex gap-2">
          <button
            onClick={toggleCamera}
            className="bg-gray-800 bg-opacity-80 text-black px-2 py-1 rounded"
          >
            {cameraOn ? <Camera className="text-gray"/> : <CameraOff className="text-red-500 hover:text-red-400 transition"/>}
          </button>
          <button
            onClick={toggleMic}
            className="bg-gray-800 bg-opacity-80 text-black px-2 py-1 rounded"
          >
            {micOn ? <Mic className="text-gray-500"/> : <MicOff className="text-red-500 hover:text-red-600 transition" />}
          </button>
        </div>
      </div>
      <video ref={remoteVideoRef} autoPlay playsInline className="w-1/2 rounded bg-black" />
    </div>
  );
  }