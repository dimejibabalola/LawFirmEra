"use client"

import * as React from "react"
import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Briefcase, Loader2, Lock, Mail } from "lucide-react"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const error = searchParams.get("error")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setLoginError("Invalid email or password. Please try again.")
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error) {
      setLoginError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md relative shadow-xl border-slate-200">
      <CardHeader className="space-y-4 text-center pb-2">
        <div className="mx-auto w-14 h-14 bg-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-600/20">
          <Briefcase className="w-7 h-7 text-white" />
        </div>
        <div>
          <CardTitle className="text-2xl font-bold text-slate-900">LawFirm Era</CardTitle>
          <CardDescription className="text-slate-500 mt-1">
            Sign in to your account to continue
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {loginError && (
            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <AlertDescription className="text-red-600 text-sm">
                {loginError}
              </AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <AlertDescription className="text-red-600 text-sm">
                {error === "CredentialsSignin" 
                  ? "Invalid email or password." 
                  : "An error occurred during sign in."}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700 font-medium">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="john.doe@lawfirm.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-11 border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-slate-700 font-medium">
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-teal-600 hover:text-teal-700"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-11 border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-4 pt-4">
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-400">Demo Credentials</span>
          </div>
        </div>

        <div className="w-full grid gap-2 text-sm text-slate-600 bg-slate-50 p-4 rounded-lg">
          <p className="font-medium text-slate-700">Test Accounts:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-teal-600 font-medium">Partner:</span>
              <br />
              john.doe@lawfirm.com
            </div>
            <div>
              <span className="text-teal-600 font-medium">Associate:</span>
              <br />
              sarah.johnson@lawfirm.com
            </div>
            <div>
              <span className="text-teal-600 font-medium">Paralegal:</span>
              <br />
              michael.chen@lawfirm.com
            </div>
            <div>
              <span className="text-teal-600 font-medium">Admin:</span>
              <br />
              david.brown@lawfirm.com
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Password for all accounts: <code className="bg-slate-200 px-1 rounded">password123</code>
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}

function LoginFormFallback() {
  return (
    <Card className="w-full max-w-md relative shadow-xl border-slate-200">
      <CardHeader className="space-y-4 text-center pb-2">
        <div className="mx-auto w-14 h-14 bg-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-600/20">
          <Briefcase className="w-7 h-7 text-white" />
        </div>
        <div>
          <CardTitle className="text-2xl font-bold text-slate-900">LawFirm Era</CardTitle>
          <CardDescription className="text-slate-500 mt-1">
            Loading...
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00aDJ2MmgtMnYtMnptLTQgNHYyaC0ydi0yaDJ6bTQtOGgydjJoLTJ2LTJ6bS04IDhoMnYyaC0ydi0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
