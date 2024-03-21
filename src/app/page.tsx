"use client";

import { useEffect, useRef, useState } from "react";
import ReactLoading from "react-loading";
import OpenAI from 'openai';

import ChatInputField from "./components/chat";
import styles from './chatpage.module.css';

export default function ChatPage() {
  const [messages, setMessages] = useState<OpenAI.Chat.ChatCompletionMessageParam[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const scrollToBottom = useRef<any>();

  const submitModelRequest = async (
    currentQuestion: string,
    messages: OpenAI.Chat.ChatCompletionMessageParam[],
    setMessages: (messages: OpenAI.Chat.ChatCompletionMessageParam[]) => void,
    setIsLoading: (isLoading: boolean) => void
  ) => {

    const newMessage: OpenAI.Chat.ChatCompletionMessageParam = { "role": "user", "content": currentQuestion };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setIsLoading(true);
    // Use the api/chat route to get StreamingTextResponse
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages }),
      });

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
              controller.enqueue(value);
            }
            controller.close();
            reader.releaseLock();
          }
        });

        setIsLoading(false);
        return new Response(stream);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
  }

  useEffect(() => {
    scrollToBottom.current.scrollIntoView({ behavior: 'smooth', block: 'end', inline: "nearest" })
  }, [messages]);

  return (
    <main className={styles.wrapper}>
      <div className={styles.mainContainer}>
        <div className={styles.chatContainer}>
          <div ref={scrollToBottom}>
            {messages.map((item: any, index) => (
              <div key={index}>
                { item.role === "user" ? 
                  <div className={styles.userContainer}>
                    <p className={styles.userMessage}>{ item.content }</p>
                  </div> 
                  : <div>
                      <p className={styles.aiMessage}>{item.content}</p>
                    </div>
                }
              </div>
            ))}
          </div>
          {!!isLoading && (
              <ReactLoading type={"bubbles"} color={"grey"} height={40} width={80} />
          )}
        </div>
        <div className={styles.inputContainer}>
          <ChatInputField
            onSearchButtonClick={(currentQuestion: string) => {
              submitModelRequest(currentQuestion, messages, setMessages, setIsLoading);
            }}
            currentQuestion={currentQuestion}
            setCurrentQuestion={setCurrentQuestion}
          />
        </div>
      </div>
    </main>
  );
}
