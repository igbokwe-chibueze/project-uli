// src/components/password-input.tsx
"use client"

import { useState } from "react"
import { Eye, EyeOff, Check, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface PasswordInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
  label?: string
  placeholder?: string
}

interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

const requirements: PasswordRequirement[] = [
  { label: "At least 6 characters", test: (pwd) => pwd.length >= 6 },
  { label: "One lowercase letter", test: (pwd) => /[a-z]/.test(pwd) },
  { label: "One uppercase letter", test: (pwd) => /[A-Z]/.test(pwd) },
  { label: "One number", test: (pwd) => /\d/.test(pwd) },
  { label: "One special character", test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
]

const getPasswordStrength = (password: string): number => {
  if (!password) return 0
  return requirements.reduce((score, req) => score + (req.test(password) ? 1 : 0), 0)
}

const getStrengthText = (strength: number): string => {
  switch (strength) {
    case 0:
      return "Enter a password"
    case 1:
    case 2:
      return "Weak password"
    case 3:
      return "Medium password"
    case 4:
      return "Strong password"
    case 5:
      return "Very strong password"
    default:
      return "Enter a password"
  }
}

const getStrengthColor = (segment: number, strength: number): string => {
  if (segment > strength) return "bg-border"

  switch (strength) {
    case 1:
      return "bg-destructive"
    case 2:
      return "bg-orange-500"
    case 3:
      return "bg-amber-500"
    case 4:
      return "bg-yellow-400"
    case 5:
      return "bg-green-500"
    default:
      return "bg-border"
  }
}

export function PasswordInput({
  value,
  onChange,
  error,
  label = "Password",
  placeholder = "Enter your password",
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const strength = getPasswordStrength(value)

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="after:ml-0.5 after:text-destructive after:content-['*']" htmlFor="password">{label}</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn("pr-10", error && "border-destructive focus-visible:ring-destructive")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {error && <p className="text-sm text-destructive text-left">{error}</p>}
      </div>

      {/* Password Strength Meter */}
      <div className="space-y-2">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((segment) => (
            <div
              key={segment}
              className={cn("h-2 flex-1 rounded-sm transition-colors", getStrengthColor(segment, strength))}
            />
          ))}
        </div>
        <p className="text-left text-sm text-muted-foreground">{getStrengthText(strength)}</p>
      </div>

      {/* Requirements List */}
      <div className="space-y-1">
        {requirements.map((requirement, index) => {
          const isMet = requirement.test(value)
          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              {isMet ? <Check className="size-3 text-green-500" /> : <X className="size-3 text-muted-foreground" />}
              <span className={cn(isMet ? "text-green-500" : "text-muted-foreground")}>{requirement.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
