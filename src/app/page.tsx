"use client";

import { useState } from "react";
import ChatInputField from "./components/chat";
import styles from './chatpage.module.css';
import OpenAI from 'openai';


function submitModelRequest(
  currentQuestion: string,
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  setMessages: (messages: OpenAI.Chat.ChatCompletionMessageParam[]) => void
) {
  const newMessage: OpenAI.Chat.ChatCompletionMessageParam = { "role": "user", "content": currentQuestion };
  const newMessages = [...messages, newMessage];
  setMessages(newMessages);

  // Use the api/chat route to get StreamingTextResponse
  fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages: newMessages }),
  }).then((response) => {
    if (response.body) {
      const reader = response.body.getReader();
      let responseText = '';
      const stream = new ReadableStream({
        async start(controller) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              break;
            }
            const chunk = new TextDecoder().decode(value);
            responseText += chunk;
            setMessages(
              [...newMessages,
              { "role": "assistant", "content": responseText }]
            );
            console.log('API response:', responseText);
            controller.enqueue(value);
          }
          controller.close();
          reader.releaseLock();
        }
      });
      return new Response(stream);
    }
  }).catch((error) => {
    console.error('Fetch error:', error);
  });
}


export default function ChatPage() {
  const [messages, setMessages] = useState<OpenAI.Chat.ChatCompletionMessageParam[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  return (
    <main className={styles.mainContainer}>
      <ChatInputField
        onSearchButtonClick={(currentQuestion: string) => {
          console.log('Search button clicked with question:', currentQuestion);
          submitModelRequest(currentQuestion, messages, setMessages);
        }}
        currentQuestion={currentQuestion}
        setCurrentQuestion={setCurrentQuestion}
      />
    </main>
  );
}
