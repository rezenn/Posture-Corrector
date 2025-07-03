import { motion } from "framer-motion"
import {
  LucideBrain,
  LucideBarChart,
  LucideBell,
  LucideShieldCheck,
  LucideFileText,
  LucideUserCog,
} from "lucide-react"
import { Card, CardContent } from "./ui/card"

const features = [
  {
    icon: <LucideBrain className="h-6 w-6 text-[#3D5A80]" />,
    title: "Smart Posture Detection",
    desc: "Track your posture in real time using just your device.",
  },
  {
    icon: <LucideBarChart className="h-6 w-6 text-[#3D5A80]" />,
    title: "Analytics Dashboard",
    desc: "See daily and weekly progress with intuitive visuals.",
  },
  {
    icon: <LucideBell className="h-6 w-6 text-[#3D5A80]" />,
    title: "Custom Alerts",
    desc: "Timely reminders to correct your sitting position.",
  },
  {
    icon: <LucideFileText className="h-6 w-6 text-[#3D5A80]" />,
    title: "Report Export",
    desc: "Get downloadable reports with voice feedback in Nepali and English.",
  },
  {
    icon: <LucideShieldCheck className="h-6 w-6 text-[#3D5A80]" />,
    title: "Privacy-First",
    desc: "Your face or video data is never saved—privacy is always respected.",
  },
  {
    icon: <LucideUserCog className="h-6 w-6 text-[#3D5A80]" />,
    title: "Mindful Alignment Coach",
    desc: "AI tips and voice feedback to build sustainable posture habits.",
  },
]

export const FeaturesSection = () => {
  
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  }

  return (
    <section
      id="features"
      className="py-16 px-4 md:px-10 bg-white text-gray-800"
    >
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mt-6 mb-6">Why Choose Upryt?</h2>
        <p className="text-lg text-gray-600 mb-12">
          Simple, smart features to support better posture — every day.
        </p>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {features.map((feature, index) => {
            const isHighlighted = index === 1 || index === 5
            return (
              <motion.div
                key={index}
                variants={cardVariants}
              >
                <Card
                  className={`rounded-lg ${
                    isHighlighted
                      ? "shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-gray-200"
                      : "border border-gray-100 shadow-none"
                  } transition duration-300`}
                >
                  <CardContent className="p-5 flex flex-col items-start space-y-2 text-left">
                    {feature.icon}
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
