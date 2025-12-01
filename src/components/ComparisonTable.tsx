"use client"

import type React from "react"
import { Check, X, HelpCircle } from "lucide-react"
import { Big_Shoulders_Display } from "next/font/google"

const bigShoulders = Big_Shoulders_Display({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
})

interface Feature {
  name: string
  icon: React.ReactNode
}

interface Product {
  name: string
  color?: "gold" | "default"
}

interface ComparisonData {
  [productName: string]: boolean
}

interface FeatureComparison {
  feature: Feature
  comparison: ComparisonData
}

const ComparisonTable: React.FC<{
  title: string
  subtitle?: string
  features: FeatureComparison[]
  products: Product[]
}> = ({ title, subtitle, features, products }) => {
  const getStatusIcon = (status: boolean, productColor: string) => {
    if (status === true) {
      if (productColor === "gold") {
        return <Check className="w-6 h-6 text-yellow-400" strokeWidth={3} />
      }
      return <Check className="w-6 h-6 text-white" strokeWidth={3} />
    }
    return <X className="w-6 h-6 text-red-500" strokeWidth={3} />
  }

  return (
    <div className={`min-h-screen bg-black p-8 ${bigShoulders.className}`}>
      <div className="max-w-full mx-auto">
        {/* Main Container - Flex layout */}
        <div className="flex gap-6">
          {/* Left Sidebar - Features Panel */}
          <div className="w-96 flex-shrink-0">
            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden p-6">
              <h2 className="text-white text-3xl font-black uppercase mb-1">{title}</h2>
              {subtitle && <p className="text-gray-400 text-xl font-light mb-6">{subtitle}</p>}

              {/* Features List */}
              <div className="space-y-4">
                {features.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-gray-400 flex-shrink-0">{item.feature.icon}</span>
                    <span className="text-gray-300 text-xl font-bold uppercase flex-1 hover:text-gray-100 cursor-pointer transition underline underline-offset-2">
                      {item.feature.name}
                    </span>
                    <button className="text-gray-600 hover:text-gray-400 transition flex-shrink-0">
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Product Columns */}
          <div className="flex gap-3 flex-1 overflow-x-auto">
            {products.map((product, productIndex) => (
              <div key={productIndex} className="flex flex-col flex-shrink-0 w-32">
                {/* Product Header */}
                <div
                  className={`${
                    product.color === "gold"
                      ? "bg-yellow-800 border border-yellow-700"
                      : "bg-gray-800 border border-gray-700"
                  } px-4 py-4 text-center rounded-t-lg`}
                >
                  <h3 className="text-white font-black text-xl uppercase">{product.name}</h3>
                </div>

                {/* Product Features */}
                <div
                  className={`${
                    product.color === "gold"
                      ? "bg-yellow-900 border-l border-r border-b border-yellow-700"
                      : "bg-gray-900 border-l border-r border-b border-gray-700"
                  } flex flex-col rounded-b-lg overflow-hidden`}
                >
                  {features.map((item, featureIndex) => (
                    <div
                      key={featureIndex}
                      className={`flex items-center justify-center px-4 py-4 border-t ${
                        product.color === "gold" ? "border-yellow-700" : "border-gray-700"
                      } ${featureIndex === 0 ? "border-t-0" : ""}`}
                    >
                      {getStatusIcon(item.comparison[product.name], product.color || "default")}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComparisonTable
