// components/email-template.tsx
import React from "react";

interface EmailTemplateProps {
  firstName: string;
}

export const EmailTemplate: React.FC<EmailTemplateProps> = ({ firstName }) => {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Welcome, {firstName}!</h1>
      <p style={styles.text}>
        {` We're excited to have you on board. If you have any questions, feel free
        to reach out to us.`}
      </p>
      <p style={styles.text}>Best,</p>
      <p style={styles.text}>The Acme Team</p>
    </div>
  );
};

// Inline styles for the component
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    fontFamily: "Arial, sans-serif",
    border: "1px solid #ddd",
    padding: "20px",
    borderRadius: "8px",
    maxWidth: "600px",
    margin: "0 auto",
  },
  heading: {
    color: "#333",
  },
  text: {
    fontSize: "16px",
    lineHeight: "1.5",
    color: "#555",
  },
};

export default EmailTemplate;
