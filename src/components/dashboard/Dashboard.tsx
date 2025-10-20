// pages/dashboard.tsx
"use client";
import React, { useState } from "react";
import Layout from "./Layout";
import PlatformCard from "./PlatformCard";
import GeneratedPostModal from "./GeneratedPostModal";
import { Sparkles } from "lucide-react";

export default function Dashboard() {
  const platformStats = [
    { name: "Facebook", icon: "📘", total: 120, info: "Active this week" },
    { name: "Twitter", icon: "🐦", total: 80, info: "Scheduled posts: 5" },
    { name: "Instagram", icon: "📸", total: 60, info: "Image heavy posts" },
    // add as needed
  ];

  const [posts, setPosts] = useState([
    {
      id: 1,
      platform: "LinkedIn",
      title: "How AI Tools Are Reshaping the Creative Industry",
      caption: null,
      description:
        "Explore how generative AI is becoming a partner for creatives and marketers alike—boosting productivity, enabling new forms of expression, and unlocking value in content workflows.",
      body: "In today’s fast-moving creative economy, the emergence of generative AI tools is no longer a novelty—it’s a strategic advantage. From image and video generation to text creation and ideation, AI is transforming how teams and individuals produce content. Research shows these tools don’t just replace human creativity; they augment it, enabling new collaborations and higher output. :contentReference[oaicite:0]{index=0} \n\nFor marketing teams, agencies, and independent creators, this shift means faster turnaround times, improved consistency across channels, and the ability to iterate creatively. But it also raises important questions around ethics, copyright, and how we define originality. :contentReference[oaicite:1]{index=1} \n\nAt **1ClikPost**, we’re embracing the human + AI model: our platform empowers you to generate platform-optimized post content in seconds, while you retain control of voice, brand and image. Let’s move from “AI or human” to “AI and human.”",
      hashtags: [
        "#GenerativeAI",
        "#CreativeTech",
        "#ContentMarketing",
        "#DigitalTransformation",
        "#1ClikPost",
      ],
      imageUrl: null,
    },
    {
      id: 2,
      platform: "Twitter",
      title: null,
      caption: null,
      description: null,
      body: "🎨 + 🤖 = Creativity × Scale. Generative AI is now a creative partner—not replacing humans, but amplifying what we can do. #1ClikPost makes multi-platform posts in seconds. #AI #ContentCreation #SocialMedia",
      hashtags: ["#AI", "#ContentCreation", "#SocialMedia", "#1ClikPost"],
      imageUrl: null,
    },
    {
      id: 3,
      platform: "Instagram",
      title: null,
      caption:
        "Imagine posting your next social media update in *minutes* instead of hours. With AI-powered content tools, your creative spark stays human – the heavy lifting gets done in seconds. 🎬✨ #1ClikPost is your new content side-kick. #creativity #aiart #socialmediatools",
      description: null,
      body: null,
      hashtags: [
        "#creativity",
        "#aiart",
        "#socialmediatools",
        "#digitalcreator",
        "#1ClikPost",
      ],
      imageUrl: null,
    },
    {
      id: 4,
      platform: "Facebook",
      title: "Transform Your Content Game with AI",
      caption: null,
      description: null,
      body: "Whether you’re a small business, a creator, or part of a marketing team, staying consistent on social media can feel overwhelming. Enter generative AI—tools that help you ideate, write, edit and craft posts across Facebook, Instagram, Twitter and more. With **1ClikPost**, you select a topic or category, hit generate, then edit if needed and publish. Fast, flexible, and tailored for your voice. Let’s make content creation fun again. 🚀",
      hashtags: [
        "#GenerativeAI",
        "#SocialMediaTips",
        "#ContentMarketing",
        "#1ClikPost",
      ],
      imageUrl: null,
    },
  ]);
  const [selectedPost, setSelectedPost] = useState<(typeof posts)[0] | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);

  const handleView = (post: (typeof posts)[0]) => {
    setSelectedPost(post);
    setModalOpen(true);
  };

  const categories = [
    { id: "entertainment", label: "Entertainment", icon: "🎬" },
    { id: "art", label: "Art", icon: "🎨" },
    { id: "sports", label: "Sports", icon: "⚽" },
    { id: "literature", label: "Literature", icon: "📚" },
    { id: "technology", label: "Technology", icon: "💻" },
    { id: "food", label: "Food", icon: "🍔" },
    { id: "travel", label: "Travel", icon: "✈️" },
    { id: "fashion", label: "Fashion", icon: "👗" },
  ];

  const [step, setStep] = useState(1);
  const [contentType, setContentType] = useState<"trending" | "custom" | null>(
    null
  );
  const [inptTopic, setInputTopic] = useState("");
  const [category, setCategory] = useState("");
  // Update the state to allow multiple selections
  const [mediaType, setMediaType] = useState<("image" | "video" | "text")[]>(
    []
  );

  const handleReset = () => {
    setStep(1);
    setContentType(null);
    setCategory("");
    setMediaType([]);
    setInputTopic("");
  };

  // Update the handleNext function
  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3 && mediaType.length > 0) {
      setStep(4);
    }
  };

  // Update the canProceed function
  const canProceed = () => {
    if (step === 1) return contentType !== null;
    if (step === 2)
      return (
        category !== "" || (contentType === "custom" && inptTopic.trim() !== "")
      );
    if (step === 3) return mediaType.length > 0;
    return true;
  };

  // Update the media type toggle handler
  const toggleMediaType = (type: "image" | "video" | "text") => {
    setMediaType((prev) =>
      prev.includes(type) ? prev.filter((m) => m !== type) : [...prev, type]
    );
  };

  return (
    <Layout>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {platformStats.map((p) => (
          <PlatformCard
            key={p.name}
            icon={p.icon}
            platformName={p.name}
            totalPosts={p.total}
            importantInfo={p.info}
          />
        ))}
      </section>

      <section className="mb-8 ">
        <div className="bg-gradient-to-br from-white via-pink-50 to-pink-50 w-full h-auto overflow-auto rounded-2xl shadow-sm relative  backdrop-blur-sm  border border-pink-100/50">
          {/* Header */}
          <div className=" border-b border-pink-200 px-8 py-6 rounded-t-3xl ">
            <div className="flex items-center space-x-3 mb-6">
              <Sparkles className="w-8 h-8 text-pink-500" />
              <h3 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Generate Post Content
              </h3>
            </div>

            <div className="flex items-center gap-2 mt-4">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      s < step
                        ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                        : s === step
                        ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white ring-4 ring-pink-200"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {s < step ? "✓" : s}
                  </div>
                  {s < 4 && (
                    <div
                      className={`w-12 h-1 mx-1 rounded ${
                        s < step
                          ? "bg-gradient-to-r from-pink-500 to-purple-500"
                          : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            {/* Step 1: Choose Type */}
            {step === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                    Choose Content Type
                  </h3>
                  <p className="text-gray-600">
                    Select how you want to create your post
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button
                    onClick={() => setContentType("trending")}
                    className={`group relative overflow-hidden p-8 rounded-2xl border-2 transition-all duration-300 ${
                      contentType === "trending"
                        ? "border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50 shadow-lg scale-105"
                        : "border-gray-200 bg-white hover:border-pink-300 hover:shadow-md"
                    }`}
                  >
                    <div className="text-5xl mb-4">🔥</div>
                    <h4 className="text-xl font-bold text-gray-800 mb-2">
                      Trending
                    </h4>
                    <p className="text-gray-600">
                      Generate content based on trending topics and categories
                    </p>
                    {contentType === "trending" && (
                      <div className="absolute top-4 right-4 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => setContentType("custom")}
                    className={`group relative overflow-hidden p-8 rounded-2xl border-2 transition-all duration-300 ${
                      contentType === "custom"
                        ? "border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg scale-105"
                        : "border-gray-200 bg-white hover:border-purple-300 hover:shadow-md"
                    }`}
                  >
                    <div className="text-5xl mb-4">✨</div>
                    <h4 className="text-xl font-bold text-gray-800 mb-2">
                      Custom
                    </h4>
                    <p className="text-gray-600">
                      Create your own unique content from scratch
                    </p>
                    {contentType === "custom" && (
                      <div className="absolute top-4 right-4 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Category Selection (only for Custom) */}
            {step === 2 && contentType === "custom" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                    Describe Your Content
                  </h3>
                  <p className="text-gray-600">
                    Tell us what you'd like to create content about
                  </p>
                </div>
                <div className="w-full">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Topic or Idea
                    <span className=" text-gray-500 font-normal ml-1">
                      -- Be as specific as possible for better content
                      generation
                    </span>
                  </label>
                  <textarea
                    rows={6}
                    value={inptTopic}
                    onChange={(e) => setInputTopic(e.target.value)}
                    placeholder="e.g. Latest AI trends in 2025, sustainable fashion tips, upcoming tech gadgets, healthy recipes for beginners..."
                    className="w-full border-2 border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all resize-none bg-white/70 backdrop-blur-sm"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Category Selection (only for trending) */}
            {step === 2 && contentType === "trending" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                    Select Category
                  </h3>
                  <p className="text-gray-600">
                    Choose a category for trending content
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                        category === cat.id
                          ? "border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50 shadow-lg scale-105"
                          : "border-gray-200 bg-white hover:border-pink-300 hover:shadow-md"
                      }`}
                    >
                      <div className="text-4xl mb-2">{cat.icon}</div>
                      <div className="text-sm font-semibold text-gray-800">
                        {cat.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Media Type Selection */}
            {step === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                    Choose Media Type
                  </h3>
                  <p className="text-gray-600">
                    Select the type(s) of media for your post
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <button
                    onClick={() => toggleMediaType("image")}
                    className={`group relative overflow-hidden p-8 rounded-2xl border-2 transition-all duration-300 ${
                      mediaType.includes("image")
                        ? "border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50 shadow-lg scale-105"
                        : "border-gray-200 bg-white hover:border-pink-300 hover:shadow-md"
                    }`}
                  >
                    <div className="text-5xl mb-4">🖼️</div>
                    <h4 className="text-xl font-bold text-gray-800 mb-2">
                      Generate Image
                    </h4>
                    <p className="text-gray-600">
                      Create stunning AI-generated images
                    </p>
                    {mediaType.includes("image") && (
                      <div className="absolute top-4 right-4 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => toggleMediaType("video")}
                    className={`group relative overflow-hidden p-8 rounded-2xl border-2 transition-all duration-300 ${
                      mediaType.includes("video")
                        ? "border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg scale-105"
                        : "border-gray-200 bg-white hover:border-purple-300 hover:shadow-md"
                    }`}
                  >
                    <div className="text-5xl mb-4">🎥</div>
                    <h4 className="text-xl font-bold text-gray-800 mb-2">
                      Generate Video
                    </h4>
                    <p className="text-gray-600">
                      Create engaging AI-generated videos
                    </p>
                    {mediaType.includes("video") && (
                      <div className="absolute top-4 right-4 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => toggleMediaType("text")}
                    className={`group relative overflow-hidden p-8 rounded-2xl border-2 transition-all duration-300 ${
                      mediaType.includes("text")
                        ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg scale-105"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
                    }`}
                  >
                    <div className="text-5xl mb-4">📝</div>
                    <h4 className="text-xl font-bold text-gray-800 mb-2">
                      Generate Text
                    </h4>
                    <p className="text-gray-600">
                      Create engaging AI-generated text content
                    </p>
                    {mediaType.includes("text") && (
                      <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Generate Post */}
            {step === 4 && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex justify-center items-center h-[300px]">
                  {/* Animated border wrapper */}
                  <div className="relative group">
                    {/* Rotating gradient border background */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-300 blur-sm animate-pulse"></div>

                    {/* Second border layer for more glow */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>

                    {/* Main button */}
                    <button className="relative p-8 rounded-2xl font-semibold bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 text-white hover:shadow-2xl hover:scale-110 transition-all duration-300 flex flex-col items-center space-y-3 backdrop-blur-sm">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="group-hover:animate-spin transition-transform">
                          <Sparkles className="w-12 h-12 text-white" />
                        </div>
                        <div className="text-center">
                          <h3 className="text-2xl font-bold text-white">
                            Generate Post Content
                          </h3>
                          <p className="text-sm font-medium text-white/90 mt-1">
                            Powered by AI
                          </p>
                        </div>
                      </div>

                      {/* Shimmer effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-5 group-hover:animate-pulse rounded-2xl"></div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-pink-200 px-8 py-6 rounded-b-3xl flex justify-between items-center">
            {step > 1 && step <= 4 && (
              <button
                onClick={() => {
                  if (step === 3 && contentType === "custom") {
                    setStep(1);
                  } else {
                    setStep(step - 1);
                  }
                }}
                className="px-6 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                ← Back
              </button>
            )}
            {step === 1 && <div />}

            <div className="flex gap-3">
              {step < 4 ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                    canProceed()
                      ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:shadow-lg hover:scale-105"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Continue →
                </button>
              ) : (
                <>
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
        `}</style>
      </section>

      <section className="backdrop-blur-xl bg-white/70 shadow-lg rounded-2xl p-8 border border-pink-100/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Generated Posts
          </h3>
          <div className="px-4 py-2 bg-gradient-to-r from-pink-50 to-purple-50 rounded-full text-sm font-semibold text-purple-700">
            {posts.length} Posts
          </div>
        </div>

        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="group relative backdrop-blur-sm bg-white/80 border border-pink-100 rounded-xl p-5 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 hover:border-pink-300"
            >
              {/* Gradient accent bar */}
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-pink-500 to-purple-600 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="flex justify-between items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    {/* Platform badge */}
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 border border-pink-200">
                      {post.platform}
                    </span>
                  </div>

                  <div className="font-semibold text-gray-800 text-lg mb-1 truncate group-hover:text-pink-600 transition-colors">
                    {post.title || post.caption}
                  </div>

                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Just now</span>
                  </div>
                </div>

                <button
                  className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-md hover:scale-105 transition-all duration-200 whitespace-nowrap"
                  onClick={() => handleView(post)}
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No posts generated yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Create your first post to get started
            </p>
          </div>
        )}
      </section>

      <GeneratedPostModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        post={selectedPost}
      />
    </Layout>
  );
}
