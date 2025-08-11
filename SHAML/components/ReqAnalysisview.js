'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Icons
const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
);

const RefreshCwIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M3 12a9 9 0 0 1 9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

const LoaderDots = () => (
  <div className="flex items-center gap-2">
    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
  </div>
);

export default function RecruitmentAnalysisView() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [jdFile, setJdFile] = useState(null);
  const [resumeFiles, setResumeFiles] = useState([]);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const [emailCandidate, setEmailCandidate] = useState(null);
  const [mailContent, setMailContent] = useState({ recipient: '', subject: '', body: '' });
  const [darkMode, setDarkMode] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark';
    setDarkMode(isDark);

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.min.js';
    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';
      }
    };
    document.body.appendChild(script);
    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    const recruitmentRoot = document.getElementById('recruitment-view-root');
    if (!recruitmentRoot) return;

    if (darkMode) {
      recruitmentRoot.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      recruitmentRoot.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    if (isChatOpen && messages.length === 0) {
      startNewChatSession();
    }
  }, [isChatOpen]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (sender, text, data = null) => {
    setMessages(prev => [...prev, { sender, text, data, id: crypto.randomUUID() }]);
  };

  const startNewChatSession = () => {
    setMessages([]);
    const initialMessage = latestAnalysis
      ? "Hello! I can answer questions about the candidates you've analyzed."
      : "Hello! Please analyze some resumes first, then I can answer your questions.";
    addMessage('bot', initialMessage);
  };

  const prepareEmail = (candidate, type) => {
    setEmailCandidate(candidate);
    setMailContent({
      recipient: candidate.email,
      subject: type === 'offer' ? `Job Offer: Exciting Opportunity with Our Team` : `Invitation to Interview`,
      body: type === 'offer'
        ? `Dear ${candidate.full_name},\n\nFollowing our review process, we were incredibly impressed with your profile and are delighted to extend an offer of employment.\n\nYour skills and experience are an excellent match for our team, with a calculated match of ${candidate.match_percentage}% to the job description.\n\nWe believe you will be a great asset and are excited about the possibility of you joining us. A detailed offer letter is attached for your review.\n\nBest regards,\nThe Hiring Team`
        : `Dear ${candidate.full_name},\n\nThank you for your interest. We were impressed by your resume and would like to invite you for an interview to discuss your qualifications further.\n\nPlease let us know what times work best for you for a brief call next week.\n\nBest regards,\nThe Hiring Team`
    });
  };

  const handleSendEmail = async () => {
    setIsLoading(true);
    console.log("SIMULATING EMAIL SEND:", mailContent);
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert('Email sent successfully (simulated)!');
    setIsLoading(false);
    setEmailCandidate(null);
  };

  const renderChatMessages = () => (
    <>
      {messages.map(msg => (
        <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
          {msg.sender === 'bot' && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500"></div>
          )}
          <div className={`max-w-md p-3 rounded-2xl ${
            msg.sender === 'user'
              ? 'bg-blue-500 text-white rounded-br-none'
              : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
          }`}>
            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex items-end gap-2">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500"></div>
          <div className="p-3 bg-white rounded-2xl dark:bg-gray-700"><LoaderDots /></div>
        </div>
      )}
    </>
  );

  const renderEmailModal = () => (
    <AnimatePresence>
      {emailCandidate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setEmailCandidate(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 ${darkMode ? 'dark' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Compose Email</h2>
              <button onClick={() => setEmailCandidate(null)}><CloseIcon /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">To:</label>
                <input
                  type="email"
                  value={mailContent.recipient}
                  onChange={(e) => setMailContent({ ...mailContent, recipient: e.target.value })}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subject:</label>
                <input
                  type="text"
                  value={mailContent.subject}
                  onChange={(e) => setMailContent({ ...mailContent, subject: e.target.value })}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message:</label>
                <textarea
                  rows="8"
                  value={mailContent.body}
                  onChange={(e) => setMailContent({ ...mailContent, body: e.target.value })}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={handleSendEmail}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Chat toggle */}
      <button
        onClick={() => setIsChatOpen(prev => !prev)}
        className="fixed z-50 p-3 text-white bg-indigo-600 rounded-full shadow-lg bottom-6 right-6 hover:bg-indigo-700 focus:outline-none"
      >
        <ChatIcon />
      </button>

      {/* Email modal */}
      {renderEmailModal()}
    </>
  );
}
