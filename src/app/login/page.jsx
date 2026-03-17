"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function LoginPage() {

  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleLogin(e) {

    e.preventDefault()

    setLoading(true)
    setError("")

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      router.push("/dashboard")
    }
  }
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">

      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow">

        <h2 className="text-2xl font-bold mb-4 text-center">
          Smart City Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-red-500 text-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full p-2 bg-blue-600 text-white rounded"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          <h3>Email: admin@smartcity.com Password:admin123</h3>

        </form>

      </div>

    </div>

  )

}