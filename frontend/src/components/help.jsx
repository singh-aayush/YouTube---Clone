import React, { useState } from "react";

function HelpPage() {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    window.location.href = `mailto:ayush2080si@gmail.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(description)}`;
  };

  return (
    <div className="helpPageContainer">
      <h2>Help</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="subject">Subject:</label>
          <input
            autoComplete="off"
            placeholder="Subject"
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <textarea
            placeholder="Write your issue..."
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <button type="submit">Send Help Request</button>
      </form>
    </div>
  );
}

export default HelpPage;
