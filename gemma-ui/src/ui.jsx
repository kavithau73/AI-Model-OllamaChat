<input
  type="file"
  accept=".pdf,.docx,.txt"
  ref={fileInputRef}
  onChange={(e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit");
      return;
    }
    setFile(selectedFile);
  }}
  style={{ marginBottom: "10px", display: "block" }}
/>