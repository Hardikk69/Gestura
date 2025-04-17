import './Main-window.css';
import React, { useEffect, useState } from 'react';
import { IonContent, IonPage, IonButton, IonTextarea, IonImg } from '@ionic/react';

const SignLanguage: React.FC = () => {
  const [predictedText, setPredictedText] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    // Start webcam feed
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        const videoElement = document.getElementById('video') as HTMLVideoElement;
        if (videoElement) videoElement.srcObject = stream;
      })
      .catch((error) => console.log("Error accessing webcam:", error));

    const interval = setInterval(() => {
      captureAndSendFrame();
      fetchProcessedImage();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const captureAndSendFrame = async () => {
    const videoElement = document.getElementById('video') as HTMLVideoElement;
    if (!videoElement) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(async (blob) => {
        if (blob) {
          const formData = new FormData();
          formData.append('file', blob, 'frame.jpg');

          try {
            const response = await fetch("http://localhost:8000/main", {
              method: "POST",
              body: formData
            });
            const data = await response.json();
            console.log("API Response:", data);

            if (data.prediction) {
              setPredictedText(prev => prev + data.prediction);
            }
          } catch (error) {
            console.error("Fetch Error:", error);
          }
        }
      }, "image/jpeg");
    }
  };

  const fetchProcessedImage = async () => {
    try {
      const response = await fetch("http://localhost:8000/processed_image");
      if (response.ok) {
        setImageUrl("http://localhost:8000/processed_image?timestamp=" + new Date().getTime());
      }
    } catch (error) {
      console.error("Fetch Processed Image Error:", error);
    }
  };

  const clearText = () => setPredictedText("");

  const saveText = () => {
    const blob = new Blob([predictedText], { type: 'text/plain' });
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = 'output.txt';
    anchor.click();
  };

  const quitApp = () => {
    alert("Closing the application!");
    window.location.href = "/login";
    window.close();
  };

  return (
    <IonPage>
        <div id="container" className="ion-padding">
          <video id="video" autoPlay playsInline></video>
          {imageUrl && <IonImg src={imageUrl} />}
          <IonTextarea value={predictedText} readonly></IonTextarea>
          <div className="btn-group">
            <IonButton expand="block" color="danger" onClick={clearText}>Clear All</IonButton>
            <IonButton expand="block" color="primary" onClick={saveText}>Save to a Text File</IonButton>
            <IonButton expand="block" color="tertiary" onClick={quitApp}>Quit</IonButton>
          </div>
        </div>
    </IonPage>
  );
};

export default SignLanguage;