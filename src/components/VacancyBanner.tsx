"use client"

import { useEffect, useState } from "react"
import Cookies from 'js-cookie'
import FlipDigit from "./FlipDigit"

const TOTAL_VACANCIES = 220
const INITIAL_AVAILABLE = 189
const COOKIE_NAME = 'vacancy_count'
const DECREASE_INTERVAL = 15000 // 15 segundos
const MIN_VACANCIES = 98

export default function VacancyBanner() {
    const [availableVacancies, setAvailableVacancies] = useState(INITIAL_AVAILABLE)

    useEffect(() => {
        // Recuperar valor do cookie ou usar valor inicial
        const savedCount = parseInt(Cookies.get(COOKIE_NAME) || String(INITIAL_AVAILABLE))
        setAvailableVacancies(savedCount)

        // Função para diminuir vagas aleatoriamente
        const decreaseVacancies = () => {
            if (availableVacancies <= MIN_VACANCIES) return
            
            const decrease = Math.floor(Math.random() * 2) + 1 // Diminui 1 ou 2 vagas
            const newCount = availableVacancies - decrease
            
            setAvailableVacancies(newCount)
            Cookies.set(COOKIE_NAME, String(newCount), { expires: 365 })
        }

        const interval = setInterval(decreaseVacancies, DECREASE_INTERVAL)
        return () => clearInterval(interval)
    }, [availableVacancies])

    // Converter número em array de dígitos
    const digits = String(availableVacancies).padStart(3, '0').split('')

    return (
        <div className="fixed top-0 left-0 right-0 z-[60] w-full bg-dark-gray py-1.5 text-center text-sm font-medium">
            <div className="text-primary">
                <span className="inline-flex">
                    {digits.map((digit, index) => (
                        <FlipDigit key={`${index}-${digit}`} digit={digit} />
                    ))}
                </span>
                <span className="font-bold">/</span>
                <span className="font-bold">{TOTAL_VACANCIES}</span>
                &nbsp;Vagas preenchidas por Beta Testers
            </div>
        </div>
    )
}
