import React, { useState } from "react";

function FeedbackPage() {
  const [subject, setSubject] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    window.location.href = `mailto:ayush2080si@gmail.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(feedback)}`;
  };

  return (
    <div className="feedbackPageContainer">
      <h2>Send Feedback</h2>
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
          <label htmlFor="feedback">Feedback:</label>
          <textarea
            placeholder="Write ur experience..."
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
          />
        </div>
        <button type="submit">Send Feedback</button>
      </form>
    </div>
  );
}

export default FeedbackPage;
