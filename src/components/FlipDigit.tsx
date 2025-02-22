"use client"

import { motion, AnimatePresence } from "framer-motion"

interface FlipDigitProps {
    digit: string
    key?: string | number
}

export default function FlipDigit({ digit }: FlipDigitProps) {
    return (
        <div className="inline-block w-[1ch] relative">
            <AnimatePresence mode="popLayout">
                <motion.span
                    key={digit}
                    initial={{ opacity: 0, y: 20, rotateX: -90 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    exit={{ opacity: 0, y: -20, rotateX: 90 }}
                    transition={{ duration: 0.5 }}
                    className="inline-block font-bold text-secondary"
                >
                    {digit}
                </motion.span>
            </AnimatePresence>
        </div>
    )
}
