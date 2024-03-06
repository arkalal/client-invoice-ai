"use client";

import React, { useEffect, useState, useRef } from "react";
import styles from "./InvoiceChat.module.scss";
import { FaImage } from "react-icons/fa";
import axios from "../../axios/api";

const InvoiceChat = () => {
  const [Prompt, setPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isAITyping, setIsAITyping] = useState(false);
  const [images, setImages] = useState(""); // Store base64 image string
  const [IsVision, setIsVision] = useState(false); // Vision API flag

  const messagesEndRef = useRef(null);

  console.log(chatHistory);

  // Training the chat model with custom instructions to interact with the user in a specific way based on the use case.

  const systemMessage = {
    role: "system",
    content: `You are an AI assistant. You may need to call functions to complete your tasks. You can only call functions if user has given you permission to do so. If you don't know the arguments to pass into function you MUST ASK TO THE USER. Dont call the function untill you get all the arguments from the user. If you feel any arguments is missing ask that to the user again, until you get all the arguments, and then call the function`,
  };

  const [conversationHistory, setConversationHistory] = useState([
    systemMessage,
  ]);

  // Training the chat model with custom instructions to interact with the user in a specific way based on the use case.

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isAITyping]);

  const handleFilesChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImages(reader.result);
        setIsVision(true);
      }
    };

    reader.onerror = (error) => {
      console.log("Error loading the image: ", error);
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Prompt) {
      const userMessage = {
        role: "user",
        content: Prompt,
      };

      let updatedHistory = [...conversationHistory, userMessage];
      setConversationHistory(updatedHistory);

      // Update chat history with user prompt immediately
      let newChatHistory = [
        ...chatHistory,
        { prompt: Prompt, images: images, response: "" },
      ];
      setChatHistory(newChatHistory);
      setIsAITyping(true);
      setPrompt("");

      try {
        if (IsVision) {
          const chatsData = {
            prompt: Prompt,
            images: images,
          };

          const res = await axios.post("vision", chatsData);
          setImages([]);
          setIsVision(false);

          const visionResponse = {
            role: "assistant",
            content: res.data, // Assuming res.data is the response from vision API
          };

          // Update chat history with AI response
          updatedHistory = [...updatedHistory, visionResponse];
          newChatHistory[newChatHistory.length - 1].response = res.data;
          setConversationHistory(updatedHistory);
          setIsAITyping(false); // AI stops 'typing'
        } else {
          const chatsData = {
            prompt: Prompt,
            conversationHistory: conversationHistory,
          };

          const res = await axios.post("invoiceChats", chatsData);
          const data = res.data;
          console.log(data);

          // Check for function_call in the response
          if (data?.function_call) {
            console.log("function calling");
            const functionCall = data.function_call;

            console.log("functionCall", functionCall);

            if (functionCall.name === "create_invoice") {
              // Assuming the function call is to send an email
              try {
                const functionArguments = JSON.parse(functionCall.arguments);

                await axios.post("invoices", functionArguments);

                // Update the chat history with the success message
                newChatHistory = newChatHistory.map((chat, index) =>
                  index === newChatHistory.length - 1
                    ? {
                        ...chat,
                        response: `Successfully added invoice in the database`,
                      }
                    : chat
                );
              } catch (error) {
                console.error(error);

                newChatHistory = newChatHistory.map((chat, index) =>
                  index === newChatHistory.length - 1
                    ? {
                        ...chat,
                        response: `Cannot add invoice data. Please try again`,
                      }
                    : chat
                );
              }
            }

            if (functionCall.name === "send_email") {
              try {
                const functionArguments = JSON.parse(functionCall.arguments);
                const { email, subject, body } = functionArguments;

                await axios.post("sendEmail", { email, subject, body });

                // Update the chat history with the success message
                newChatHistory = newChatHistory.map((chat, index) =>
                  index === newChatHistory.length - 1
                    ? {
                        ...chat,
                        response: `Email is sent to ${email}`,
                      }
                    : chat
                );
              } catch (error) {
                console.log(error);

                newChatHistory = newChatHistory.map((chat, index) =>
                  index === newChatHistory.length - 1
                    ? {
                        ...chat,
                        response: `Failed to send the email`,
                      }
                    : chat
                );
              }
            }

            if (functionCall.name === "search_invoices") {
              try {
                const functionArguments = JSON.parse(functionCall.arguments);
                const { query } = functionArguments;

                const res = await axios.post("searchInvoice", { query });

                console.log(res.data);
                console.log(query);

                newChatHistory = newChatHistory.map((chat, index) =>
                  index === newChatHistory.length - 1
                    ? {
                        ...chat,
                        response: res.data,
                      }
                    : chat
                );
              } catch (error) {
                console.log(error);

                newChatHistory = newChatHistory.map((chat, index) =>
                  index === newChatHistory.length - 1
                    ? {
                        ...chat,
                        response: `Cant find invoice in databse`,
                      }
                    : chat
                );
              }
            }
          } else {
            // Update chat history with AI response
            newChatHistory[newChatHistory.length - 1].response = data.content;
          }

          setChatHistory(newChatHistory);
          setIsAITyping(false); // AI stops 'typing'
        }
      } catch (error) {
        console.error(error);
        setIsAITyping(false); // In case of an error, AI stops 'typing'
      }
    }
  };

  console.log("chatHistory", chatHistory);

  return (
    <div className={styles.ChatAssistants}>
      <div className={styles.chatHistory}>
        {chatHistory.map((chat, index) => (
          <div className={styles.chatQuery} key={index}>
            <img src={chat.images} alt="" />
            <div className={styles.userText}>
              <p>{chat.prompt}</p>
            </div>

            <div className={styles.aiText}>
              <p>{chat.response || (isAITyping && "typing...")}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className={styles.chatForm}>
        <div className={styles.imagePreviews}>
          <img src={images} alt="" />
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFilesChange}
          style={{ display: "none" }}
          id="imageUpload"
        />
        <label htmlFor="imageUpload">
          <FaImage />
        </label>
        <input
          value={Prompt}
          onChange={(e) => setPrompt(e.target.value)}
          type="text"
          placeholder="Ask something..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default InvoiceChat;
