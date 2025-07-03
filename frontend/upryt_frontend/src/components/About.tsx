import React from "react";
import UprytImage from "../assets/pos.png"; // Replace with your image

const About = () => {
  return (
    <div id="about" className="flex flex-col md:flex-row min-h-screen bg-white">

      {/* Left Side - Image Centered Vertically */}
      <div className="w-full md:w-1/2 flex justify-center items-center">
        <img
          src={UprytImage}
          alt="About Upryt"
          className="w-[80%] h-[60vh] object-contain"
        />
      </div>

      {/* Right Side - Text */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 py-12">
        <h1 className="text-4xl font-bold text-blue-950 mb-6">About Us</h1>
        <p className="text-gray-700 text-lg leading-relaxed">
        <span className="font-semibold text-blue-900">Upryt</span> is a smart posture solution designed to improve the way you sit, work, and live. Born out of a shared frustration with back pain and poor work habits, we set out to create something simple yet impactful. 
          <br /><br />
          By combining intuitive design with real-time AI feedback, Upryt helps users stay mindful of their posture without needing bulky wearables or constant reminders. Whether you're studying, working remotely, or gaming, Upryt fits effortlessly into your routine — promoting better health, sharper focus, and long-term comfort.
        </p>
      </div>
    </div>
  );
};

export default About;
