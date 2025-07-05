"use client"
import React from 'react'
import { motion } from "framer-motion"
import { useInView } from 'framer-motion'

function Features() {
    const ref = React.useRef(null)
    const ref1 = React.useRef(null)
    const ref2 = React.useRef(null)
    const ref3 = React.useRef(null)
    const ref4 = React.useRef(null)

    const isInView = useInView(ref, { once: true })
    const isInView1 = useInView(ref1, { once: true })
    const isInView2 = useInView(ref2, { once: true })
    const isInView3 = useInView(ref3, { once: true })
    const isInView4 = useInView(ref4, { once: true })
    
    return (
        <section className='container'>
            <div className="flex items-center gap-2 w-full justify-center mt-10 mb-8">
                <div className="h-2 w-2 rounded-full bg-[#f0f810]"></div>
                <span className="text-gray-600 text-lg">Usage</span>
            </div>
            <div className='text-white' >
                <div className='md:text-5xl text-3xl w-full text-center mt-4'>
                   How to use our service
                </div>
            </div>
            <div className='w-full text-center text-md mt-5 text-white' >
               Alla kadu ra <span className='text-[#f0f810]  italic' >erripukoda</span> !!
            </div>
            <div className='w-full mt-10 flex flex-col gap-7'>
                <div className='flex flex-col gap-4 md:flex-row'>
                    <motion.div 
                        ref={ref}
                        initial={{ y: 100, opacity: 0, scale: 0 }}
                        animate={isInView ? { y: 0, opacity: 1, scale: 1 } : { y: 100, opacity: 0, scale: 0 }}
                        transition={{ duration: 0.5 }}
                        className='bg-gray-900 gap-5 p-10 md:w-1/2 w-full h-52 rounded-xl flex flex-col'
                    >
                        <div className='text-center'>
                            <h1 className=' md:text-3xl text-xl text-white'>Step 1: First Time Setup</h1>
                        </div>
                        <div className='md:text-lg text-md text-white  tracking-tight mx-auto max-w-lg text-center'>
                            <span>
                                Click More info → Run anyway. Then register with Username, Password, and Gemini API key.
                            </span>
                        </div>
                    </motion.div>
                    <motion.div
                        ref={ref1}
                        initial={{ y: 100, opacity: 0, scale: 0 }}
                        animate={isInView1 ? { y: 0, opacity: 1, scale: 1 } : { y: 100, opacity: 0, scale: 0 }}
                        transition={{ duration: 0.5 }}
                        className='bg-gray-900 relative overflow-hidden  gap-5 p-10  md:w-1/2 w-full h-52 rounded-xl flex flex-col'
                    >
                        <motion.div 
                            animate={{ rotate: -360 }}
                            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                            className="  absolute orb h-48 w-48 z-10 left-[85%] rounded-full blur-[15px] bg-[conic-gradient(from_0deg,#e0f11f,#f8e110,#f8c210,#e0f11f)]  md:h-30 md:w-30 bottom-[60%]"
                        />
                        <div className='text-center z-30'>
                            <h1 className='text-xl md:text-3xl text-white'>Step 2: Ask a Question</h1>
                        </div>
                        <div className='md:text-lg text-white text-md tracking-tight mx-auto max-w-md  md:max-w-sm  text-center'>
                            <span>
                               Make sure your problem is on-screen and hit Alt + S (up to 3 times for long questions). 
                            </span>
                        </div>
                    </motion.div>
                </div>
                <motion.div
                    ref={ref2}
                    initial={{ y: 100, opacity: 0, scale: 0 }}
                    animate={isInView2 ? { y: 0, opacity: 1, scale: 1 } : { y: 100, opacity: 0, scale: 0 }}
                    transition={{ duration: 0.5 }}
                    className= 'bg-gray-900 w-full overflow-hidden relative text-center p-10  h-52 rounded-xl gap-5 flex flex-col'
                >
                    <h1 className='text-xl md:text-3xl text-white'>Step 3: Send to AI</h1>
                    <div className='md:text-lg text-md z-30 text-white tracking-tight mx-auto max-w-md text-center'>
                        Once screenshots are ready, press Ctrl + Enter. Let Ofradr do the thinking!
                    </div>
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                        className="absolute orb h-40 w-40 z-10 rounded-full blur-[15px] bg-[conic-gradient(from_0deg,#e0f11f,#f8e110,#f8c210,#e0f11f)] md:h-40 md:w-40 left-[28%] md:left-[43%] top-44"
                    />
                </motion.div>
                <div className='flex flex-col gap-4 md:flex-row'>
                    <motion.div
                        ref={ref3}
                        initial={{ y: 100, opacity: 0, scale: 0 }}
                        animate={isInView3 ? { y: 0, opacity: 1, scale: 1 } : { y: 100, opacity: 0, scale: 0 }}
                        transition={{ duration: 0.5 }}
                        className='bg-gray-900 gap-5 relative overflow-hidden p-10 md:w-1/2 w-full h-52 rounded-xl flex flex-col'
                    >
                        <div className='text-center'>
                            <h1 className='text-xl md:text-3xl text-white'>Step 4: View the Answer</h1>
                        </div>
                        <div className='md:text-lg  text-md text-white tracking-tight mx-auto max-w-sm text-center'>
                            <span>Hit Alt + H to open Ofradr and see your answer. Press again to hide</span>
                        </div>
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                            className="absolute orb h-40 w-40 z-10 rounded-full blur-[15px] bg-[conic-gradient(from_0deg,#e0f11f,#f8e110,#f8c210,#e0f11f)] md:h-40 md:w-40 right-[18rem] md:right-[26rem] top-36 md:top-40"
                        />
                    </motion.div>
                    <motion.div
                        ref={ref4}
                        initial={{ y: 100, opacity: 0, scale: 0 }}
                        animate={isInView4 ? { y: 0, opacity: 1, scale: 1 } : { y: 100, opacity: 0, scale: 0 }}
                        transition={{ duration: 0.5 }}
                        className='bg-gray-900 gap-5 p-10 md:w-1/2 w-full h-52 rounded-xl flex flex-col'
                    >
                        <div className='text-center text-white'>
                            <h1 className='text-xl md:text-3xl'>Step 5: Paste Like a Human</h1>
                        </div>
                        <div className='md:text-lg text-md text-white tracking-tighter md:tracking-tight mx-auto max-w-xl text-center'>
                            <span>
                                Click on your test window and press Alt + V. The code is typed like a real person!
                            </span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

export default Features
// "use client"
// import React from 'react'
// import { motion } from "framer-motion"
// import { useInView } from 'framer-motion'

// function Features() {
//     const ref = React.useRef(null)
//     const ref1 = React.useRef(null)
//     const ref2 = React.useRef(null)
//     const ref3 = React.useRef(null)
//     const ref4 = React.useRef(null)
//     const ref5 = React.useRef(null)
//     const ref6 = React.useRef(null)
//     const ref7 = React.useRef(null)
//     const ref8 = React.useRef(null)
//     const ref9 = React.useRef(null)

//     const isInView = useInView(ref, { once: true })
//     const isInView1 = useInView(ref1, { once: true })
//     const isInView2 = useInView(ref2, { once: true })
//     const isInView3 = useInView(ref3, { once: true })
//     const isInView4 = useInView(ref4, { once: true })
//     const isInView5 = useInView(ref5, { once: true })
//     const isInView6 = useInView(ref6, { once: true })
//     const isInView7 = useInView(ref7, { once: true })
//     const isInView8 = useInView(ref8, { once: true })
//     const isInView9 = useInView(ref9, { once: true })

//     const steps = [
//         {
//             title: "Step 1: First Time Setup",
//             desc: "Click 'More info' → 'Run anyway'. Then register with Username, Password, and Gemini API key.",
//             ref: ref5, view: isInView5
//         },
//         {
//             title: "Step 2: Ask a Question",
//             desc: "Make sure your problem is on-screen and hit Alt + S (up to 3 times for long questions).",
//             ref: ref6, view: isInView6
//         },
//         {
//             title: "Step 3: Send to AI",
//             desc: "Once screenshots are ready, press Ctrl + Enter. Let Ofradr do the thinking!",
//             ref: ref7, view: isInView7
//         },
//         {
//             title: "Step 4: View the Answer",
//             desc: "Hit Alt + H to open Ofradr and see your answer. Press again to hide.",
//             ref: ref8, view: isInView8
//         },
//         {
//             title: "Step 5: Paste Like a Human",
//             desc: "Click on your test window and press Alt + V. The code is typed like a real person!",
//             ref: ref9, view: isInView9
//         }
//     ]

//     return (
//         <section className='container'>
//             <div className="flex items-center gap-2 w-full justify-center mt-10 mb-8">
//                 <div className="h-2 w-2 rounded-full bg-[#f0f810]"></div>
//                 <span className="text-gray-600 text-lg">Services</span>
//             </div>
//             <div className='text-white'>
//                 <div className='md:text-5xl text-3xl w-full text-center mt-4'>
//                     Who are we?
//                 </div>
//             </div>
//             <div className='w-full text-center text-md mt-5 text-white'>
//                 Discover how our expertise can transform your online presence.
//             </div>
//             <div className='w-full mt-10 flex flex-col gap-7'>
//                 {/* Existing Features (1–5) */}
//                 {/* ... your original 5 cards remain unchanged here ... */}

//                 {/* Ofradr Guide Steps */}
//                 <div className='mt-20 text-white text-center text-3xl font-semibold'>
//                     Ofradr in 5 Simple Steps 🚀
//                 </div>
//                 <div className='flex flex-col gap-4 mt-10'>
//                     <div className='flex flex-col md:flex-row gap-4'>
//                         {steps.slice(0, 2).map((step, idx) => (
//                             <motion.div
//                                 key={idx}
//                                 ref={step.ref}
//                                 initial={{ y: 100, opacity: 0, scale: 0 }}
//                                 animate={step.view ? { y: 0, opacity: 1, scale: 1 } : {}}
//                                 transition={{ duration: 0.5 }}
//                                 className='bg-gray-900 p-8 rounded-xl flex flex-col justify-center items-center w-full md:w-1/2 text-center'
//                             >
//                                 <h2 className='text-xl md:text-2xl font-bold mb-2'>{step.title}</h2>
//                                 <p className='text-md md:text-lg tracking-tight max-w-md'>{step.desc}</p>
//                             </motion.div>
//                         ))}
//                     </div>
//                     <div className='flex flex-col md:flex-row gap-4'>
//                         {steps.slice(2, 4).map((step, idx) => (
//                             <motion.div
//                                 key={idx + 2}
//                                 ref={step.ref}
//                                 initial={{ y: 100, opacity: 0, scale: 0 }}
//                                 animate={step.view ? { y: 0, opacity: 1, scale: 1 } : {}}
//                                 transition={{ duration: 0.5 }}
//                                 className='bg-gray-900 p-8 rounded-xl flex flex-col justify-center items-center w-full md:w-1/2 text-center'
//                             >
//                                 <h2 className='text-xl md:text-2xl font-bold mb-2'>{step.title}</h2>
//                                 <p className='text-md md:text-lg tracking-tight max-w-md'>{step.desc}</p>
//                             </motion.div>
//                         ))}
//                     </div>
//                     <div className='w-full'>
//                         <motion.div
//                             ref={steps[4].ref}
//                             initial={{ y: 100, opacity: 0, scale: 0 }}
//                             animate={steps[4].view ? { y: 0, opacity: 1, scale: 1 } : {}}
//                             transition={{ duration: 0.5 }}
//                             className='bg-gray-900 p-8 rounded-xl flex flex-col justify-center items-center w-full text-center'
//                         >
//                             <h2 className='text-xl md:text-2xl font-bold mb-2'>{steps[4].title}</h2>
//                             <p className='text-md md:text-lg tracking-tight max-w-md'>{steps[4].desc}</p>
//                         </motion.div>
//                     </div>
//                 </div>
//             </div>
//         </section>
//     )
// }

// export default Features
