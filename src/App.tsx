import React from "react";
import "./App.css"; // Import the styles 
import Upload from "./components/Upload/Upload";
function App() {
  const handleFileUpload = (response: any) => {
    console.log("Upload Response", response);
  };

  return (
    <div className="App">
      <div className="upload-container">
        <Upload type="image" callback={handleFileUpload} />
        <Upload type="file" callback={handleFileUpload} />
      </div>
    </div>
  );
}


export default App;
