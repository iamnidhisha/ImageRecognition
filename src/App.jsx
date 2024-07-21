// src/App.js
import React, { useState, useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import { load } from "@tensorflow-models/coco-ssd";
import Dropzone from "react-dropzone";
import "./App.css";

function App() {
  const [model, setModel] = useState(null);
  const [image, setImage] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const imgRef = useRef(null); // Reference to image element

  // Load the model when the component mounts
  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.setBackend("webgl"); // Set TensorFlow.js backend to WebGL
        const loadedModel = await load(); // Load the COCO-SSD model
        setModel(loadedModel); // Set the loaded model
      } catch (error) {
        console.error("Error loading the model:", error);
      }
    };
    loadModel();
  }, []);

  // Handle image uploads
  const handleImageUpload = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);

    // Ensure the image element is correctly referenced
    const img = imgRef.current;
    if (img) {
      img.src = imageUrl;
      img.onload = async () => {
        if (model) {
          try {
            const predictions = await model.detect(img); // Run detection
            setPredictions(predictions); // Set predictions
          } catch (error) {
            console.error("Error making predictions:", error);
          }
        } else {
          console.error("Model is not loaded yet.");
        }
      };
    } else {
      console.error("Image reference is null.");
    }
  };

  return (
    <div className="App">
      <h1>AI Image Recognition</h1>
      <Dropzone onDrop={handleImageUpload}>
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps({ className: "dropzone" })}>
            <input {...getInputProps()} />
            <p>Drag 'n' drop an image here, or click to select an image</p>
          </div>
        )}
      </Dropzone>
      {image && (
        <img
          ref={imgRef}
          alt="Uploaded"
          className="uploaded-image"
          style={{ display: "none" }} // Hide image from display, but still use it for processing
        />
      )}
      <div className="predictions">
        {predictions.length > 0 ? (
          predictions.map((prediction, index) => (
            <div key={index} className="prediction">
              <strong>{prediction.class}</strong>:{" "}
              {Math.round(prediction.score * 100)}%
            </div>
          ))
        ) : (
          <p>No predictions available</p>
        )}
      </div>
    </div>
  );
}

export default App;
