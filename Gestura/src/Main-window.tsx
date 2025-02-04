import './Main-window.css'
import React, { useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonToolbar, IonTitle, IonButton, IonTextarea } from '@ionic/react';

const SignLanguage: React.FC = () => {
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        const videoElement = document.getElementById('video') as HTMLVideoElement;
        videoElement.srcObject = stream;
      })
      .catch((error) => {
        console.log("Error accessing webcam:", error);
      });
  }, []);

  const clearText = () => {
    const textArea = document.getElementById('text-area') as HTMLTextAreaElement;
    textArea.value = '';
  };

  const saveText = () => {
    const text = (document.getElementById('text-area') as HTMLTextAreaElement).value;
    const blob = new Blob([text], { type: 'text/plain' });
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = 'output.txt';
    anchor.click();
  };

  const quitApp = () => {
    alert("Closing the application!");
    window.close();
  };

  return (
    <IonPage>
      <IonContent>
        <div id="container" className="ion-padding">
          <video id="video" autoPlay />
          <IonTextarea id="text-area" readonly></IonTextarea>
          
          <div className="btn-group">
            <IonButton expand="block" color="danger" onClick={clearText}>Clear All</IonButton>
            <IonButton expand="block" color="primary" onClick={saveText}>Save to a Text File</IonButton>
            <IonButton expand="block" color="tertiary" onClick={quitApp}>Quit</IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SignLanguage;
