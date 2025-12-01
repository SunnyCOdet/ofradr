"use client"

import React from "react"
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
        return <Check className="w-6 h-6 text-[#ea3a59]" strokeWidth={3} />
      }
      return <Check className="w-6 h-6 text-white" strokeWidth={3} />
    }
    return <X className="w-6 h-6 text-red-500" strokeWidth={3} />
  }

  return (
    <div className={`min-h-screen bg-black p-8 flex items-center justify-center ${bigShoulders.className}`}>
      <div className="w-full max-w-5xl mx-auto">
        {/* Grid Container */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4">
          
          {/* Header Row */}
          {/* Title Column */}
          <div className="bg-red-950/30 border border-red-900/30 rounded-lg p-4 flex flex-col justify-center">
            <h2 className="text-white text-2xl font-black uppercase mb-1">{title}</h2>
            {subtitle && <p className="text-red-200/70 text-lg font-light">{subtitle}</p>}
          </div>

          {/* Product Headers */}
          {products.map((product, index) => (
            <div
              key={index}
              className={`${
                product.color === "gold"
                  ? "bg-[#ea3a59] border border-[#ea3a59]"
                  : "bg-red-950 border border-red-900"
              } p-4 rounded-lg flex items-center justify-center`}
            >
              <h3 className="text-white font-black text-lg uppercase text-center">{product.name}</h3>
            </div>
          ))}

          {/* Feature Rows */}
          {features.map((item, featureIndex) => (
            <React.Fragment key={featureIndex}>
              {/* Feature Name */}
              <div className="bg-red-950/30 border border-red-900/30 rounded-lg p-3 flex items-center gap-3">
                <span className="text-red-200/70 flex-shrink-0">{item.feature.icon}</span>
                <span className="text-red-100 text-lg font-bold uppercase flex-1 hover:text-white cursor-pointer transition underline underline-offset-2">
                  {item.feature.name}
                </span>
                <button className="text-red-400 hover:text-red-300 transition flex-shrink-0">
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>

              {/* Product Statuses */}
              {products.map((product, productIndex) => (
                <div
                  key={productIndex}
                  className={`${
                    product.color === "gold"
                      ? "bg-[#ea3a59]/20 border border-[#ea3a59]/50"
                      : "bg-red-950/50 border border-red-900/50"
                  } rounded-lg p-3 flex items-center justify-center`}
                >
                  {getStatusIcon(item.comparison[product.name], product.color || "default")}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ComparisonTable
