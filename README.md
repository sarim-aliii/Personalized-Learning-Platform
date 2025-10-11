
# Kairon AI

**An AI-powered learning platform to accelerate understanding.**

Inspired by the wise centaur Chiron from Greek mythology—a renowned tutor to heroes—Kairon AI is a multifaceted learning assistant designed to help students, educators, and lifelong learners master their study material. It transforms passive text into an interactive, dynamic learning experience through a suite of powerful, AI-driven tools.


**Live Demo** [https://kaironaiapp.netlify.app/]

---

## ✨ Key Features

Kairon AI offers a comprehensive set of tools, each targeting a different aspect of the learning process:

*   **📚 Material Ingestion:**
    *   **File Upload:** Ingest study materials from various formats, including **PDF, DOCX, and TXT**.
    *   **Paste Text:** Directly paste notes, articles, or any text into the application.
    *   **Auto-Seed:** Don't have notes? Just enter a topic, and Kairon AI will generate a comprehensive set of study notes for you.

*   **📝 Auto-Summarization:**
    *   Generate concise, informative summaries of your ingested material to quickly grasp the core concepts.

*   **🧠 Spaced Repetition System (SRS) Flashcards:**
    *   Automatically create question-and-answer flashcards from your notes.
    *   Utilizes a sophisticated SRS algorithm to schedule card reviews at optimal intervals, maximizing long-term memory retention.

*   **❓ MCQ Generator:**
    *   Test your knowledge by generating multiple-choice quizzes with **Easy, Medium, or Hard** difficulty levels.
    *   Receive instant feedback with detailed explanations for each correct answer.

*   **🎯 Personalized Learning Paths:**
    *   Based on your incorrect MCQ answers, Kairon AI generates a **Personalized Study Guide** that focuses on your specific areas of weakness.

*   **🔍 Semantic Search:**
    *   Go beyond simple keyword search. Find the most relevant snippets of information from your notes based on conceptual meaning and context.

*   **🧑‍🏫 AI Tutor (Socratic Method):**
    *   Engage in a guided conversation with an AI tutor that uses the Socratic method. Instead of giving direct answers, it asks probing questions to help you think critically and discover the answers yourself.

*   **✍️ Essay Preparation:**
    *   Generate structured **Essay Outlines** from your source material based on a topic or thesis statement.
    *   Strengthen your arguments by generating potential **Counter-Arguments** and alternative perspectives.

*   **🗺️ Concept Map Visualization:**
    *   Automatically generate and visualize interactive concept maps to understand the relationships and connections between key ideas in your text.

*   **🎤 Audio & Video Analysis:**
    *   Upload lecture recordings, podcasts, or video files.
    *   Kairon AI will **transcribe the content** and allow you to summarize, create flashcards, or ask questions about it.

*   **👨‍🏫 Lesson Planner (For Educators):**
    *   Ingest a textbook chapter or article and instantly generate a structured 50-minute lesson plan, complete with objectives, activities, materials, and assessment methods.

*   **📅 Study Planner:**
    *   Beat procrastination by generating a personalized, day-by-day study plan. Just specify your timeframe, and the AI will break down your material into manageable daily tasks.

*   **🌐 Multi-language Support:**
    *   All features are available in a wide variety of languages, which can be selected from the sidebar.

---

## 🛠️ Tech Stack

*   **Frontend:** React, TypeScript, Tailwind CSS
*   **AI Model Integration:** Google Gemini API (`@google/genai`)
*   **Data Visualization:** D3.js for interactive concept maps
*   **State Management:** React Context API
*   **Speech Recognition:** Web Speech API

---

## 🚀 Getting Started

Using Kairon AI is designed to be a simple, linear process.

### Prerequisites

You must have a valid Google Gemini API key. This key needs to be configured as an environment variable named `API_KEY` in the execution environment.

### How to Use the App

1.  **Navigate to the `Ingest` Tab:** This is your starting point.
2.  **Provide Your Material:**
    *   **Upload** your study files (PDF, DOCX, TXT).
    *   **Paste** your notes directly into the text area.
    *   Or, use the **Auto-seed** feature by typing a topic and clicking the button.
3.  **Click `Ingest & Build Index`:** This processes your text and makes it available to all the other tools in the application.
4.  **Explore the Tools:** Once ingestion is complete, navigate to any other tab (e.g., `Summary`, `SRS Flashcards`, `MCQ`) to start learning. The ingested text will be used as the context for all AI-powered features.

---

## 📁 File Structure

The project is organized with a clear separation of concerns to ensure maintainability and scalability.

```
src
├── components
│   ├── features/   # Main feature components for each tab
│   ├── layout/     # Structural components (Header, Sidebar)
│   └── ui/         # Reusable UI elements (Button, Card, Loader)
├── context/
│   └── AppContext.tsx  # Global state management
├── hooks/
│   ├── useLocalStorage.ts
│   └── useSpeech.ts
├── services/
│   └── geminiService.ts # All interactions with the Gemini API
├── types.ts          # TypeScript type definitions
├── App.tsx             # Main application layout and routing
└── index.tsx           # React entry point
```

---

## 🤝 Contributing

Contributions are welcome! If you have ideas for new features, bug fixes, or improvements, please feel free to open an issue or submit a pull request.

1.  Fork the repository.
2.  Create a new feature branch (`git checkout -b feature/your-feature-name`).
3.  Commit your changes (`git commit -m 'Add some feature'`).
4.  Push to the branch (`git push origin feature/your-feature-name`).
5.  Open a pull request.

---