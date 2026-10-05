import { useState } from "react";

const CommunicationView = () => {
  const [activeTab, setActiveTab] = useState<"Departments" | "Direct">(
    "Direct"
  );
  const [showChat, setShowChat] = useState(false);
  const [messageInput, setMessageInput] = useState("");

  const contacts = [
    {
      id: 1,
      name: "Michael Chen (Project Lead)",
      avatar: "https://i.pravatar.cc/150?u=michael",
    },
  ];

  const messages = [
    {
      id: 1,
      sender: "Michael Chen",
      text: "Hi, I need a quote for a 40*60 workshop in Texas.",
      time: "2024-10-10 09:30 pm",
      isMe: false,
    },
  ];

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
      {/* Left Sidebar - Contact List */}
      <div
        className={`w-full md:w-80 border-r border-gray-200 flex-col bg-white ${
          showChat ? "hidden md:flex" : "flex"
        }`}
      >
        {/* User Profile - Not explicitly in the sidebar list in the image, but maybe at top? 
            The image shows "Sarah Johnson Plant Lead" at the top of the sidebar.
        */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <img
            src="https://i.pravatar.cc/150?u=sarah"
            alt="Sarah Johnson"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">
              Sarah Johnson
            </h3>
            <p className="text-xs text-gray-500">Plant Lead</p>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 pb-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 mt-2">
          <button
            className={`flex-1 pb-3 text-sm font-medium ${
              activeTab === "Departments"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("Departments")}
          >
            Departments
          </button>
          <button
            className={`flex-1 pb-3 text-sm font-medium ${
              activeTab === "Direct"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("Direct")}
          >
            Direct
          </button>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "Direct" && (
            <div className="bg-blue-50/50">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setShowChat(true)}
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-blue-50 transition-colors border-l-4 border-blue-600 bg-blue-50"
                >
                  <div className="relative">
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {/* Online Indicator (implied) */}
                    {/* <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div> */}
                  </div>
                  <h4 className="text-sm font-medium text-gray-800">
                    {contact.name}
                  </h4>
                </div>
              ))}
            </div>
          )}
          {activeTab === "Departments" && (
            <div className="p-4 text-center text-sm text-gray-400">
              No departments found
            </div>
          )}
        </div>

        {/* New Chat Button */}
        <div className="p-4 border-t border-gray-100">
          <button className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors">
            <span>+</span> New Chat
          </button>
        </div>
        {/* Team Online Status */}
        <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          Team Online
        </div>
      </div>

      {/* Right Content - Chat Area */}
      <div
        className={`flex-1 flex-col bg-[#FAFCFF] relative ${
          showChat ? "flex" : "hidden md:flex"
        }`}
      >
        {/* Mobile Back Header */}
        <div className="md:hidden p-4 border-b border-gray-200 flex items-center gap-3 bg-white">
          <button
            onClick={() => setShowChat(false)}
            className="p-1 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <img
              src={contacts[0].avatar}
              alt=""
              className="w-8 h-8 rounded-full object-cover"
            />
            <h3 className="font-semibold text-gray-800 text-sm">
              {contacts[0].name}
            </h3>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.isMe ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] md:max-w-[70%] ${
                  message.isMe ? "items-end" : "items-start"
                } flex flex-col`}
              >
                <div
                  className={`p-4 rounded-2xl text-sm ${
                    message.isMe
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-100 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {message.text}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">
                  {message.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-4 md:p-6 bg-white border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type your message..."
                className="w-full pl-5 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>
            <button className="bg-[#2563EB] text-white px-4 md:px-6 py-3 rounded-lg flex items-center gap-2 font-medium hover:opacity-90 transition-opacity whitespace-nowrap">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0 1 21.485 12 59.77 59.77 0 0 1 3.27 20.876L5.999 12Zm0 0h7.5"
                />
              </svg>
              <span className="hidden md:inline">Send</span>
              <span className="md:hidden">Send</span>
            </button>
          </div>
          <div className="text-right mt-2 text-xs text-gray-400">
            Last sync: just now
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationView;
