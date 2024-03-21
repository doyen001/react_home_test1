"use client";

import React from 'react';
import styles from './chat.module.css'; // Import the CSS module


interface ChatBoxProps {
  currentQuestion: string;
  setCurrentQuestion: (question: string) => void;
  onSearchButtonClick: (question: string) => void;
}

function ChatInputField(
  { currentQuestion, setCurrentQuestion, onSearchButtonClick }: ChatBoxProps
) {

  function handleQuestionChange(event: React.ChangeEvent<HTMLInputElement>) {
    setCurrentQuestion(event.target.value);
  }

  function handleQuestion() {
    onSearchButtonClick(currentQuestion);
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearchButtonClick(currentQuestion);
    }
  }

  return (
    <div className={styles.searchContainer}>
      <input
        type="text"
        placeholder="Ask a question ..."
        className={styles.chatInput}
        onChange={handleQuestionChange}
        onKeyDown={handleKey}
      />
      <button className={styles.searchButton} onClick={handleQuestion}>
        <svg className={styles.sendIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </button>
    </div >
  );
}

export default ChatInputField;